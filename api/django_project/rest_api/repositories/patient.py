import uuid

from django.contrib.auth.models import User
from django.db import transaction
from django.db.transaction import atomic
from injector import inject

from rest_api.events.patient import update_patient_event
from rest_api.models.patient import (
    PatientDocumentModel,
    PatientModel,
    PatientVerificationModel,
)
from rest_api.models.patient_practice import PatientPracticeModel
from rest_api.repositories.common import CommonModelRepo
from rest_api.schemas.common import GeoPointSchema
from rest_api.schemas.patient import (
    PatientDocumentSchema,
    PatientPracticeLinkSchema,
    PatientSchema,
)
from rest_api.services.auth0 import Auth0Service
from rest_api.services.elastic_indexes.patient import PatientIndex
from rest_api.services.geo import GeoPyService
from rest_api.services.s3 import ObjectStorageService
from rest_api.utils.elastic_migration import ElasticMigration


class PatientRepo(CommonModelRepo[PatientSchema]):

    elastic_service: PatientIndex
    geo_service: GeoPyService
    storage_service: ObjectStorageService
    auth0_service: Auth0Service

    @inject
    def __init__(
        self,
        elastic_service: PatientIndex,
        geo_service: GeoPyService,
        storage_service: ObjectStorageService,
        auth0_service: Auth0Service,
    ):
        super(PatientRepo, self).__init__(es_instance=elastic_service)
        self.elastic_service = elastic_service
        self.geo_service = geo_service
        self.storage_service = storage_service
        self.auth0_service = auth0_service

    def get(self, id: int) -> PatientSchema:
        patient = PatientModel.objects.get(id=id)

        docs_q = PatientVerificationModel.objects.filter(
            patient_document__patient=patient
        ).order_by("-patient_document__uploaded_at")
        docs = []
        for doc in docs_q:
            result = PatientDocumentSchema(
                download_url=doc.patient_document.s3_url,
                is_id=doc.is_id,
                is_proof_of_address=doc.is_proof_of_address,
                state=doc.state,
                uploaded_at=doc.patient_document.uploaded_at,
                id=doc.id,
            )
            docs.append(result)

        practice_links_q = PatientPracticeModel.objects.filter(
            patient=patient
        ).order_by("-created_at")
        practice_links = []
        for link in practice_links_q:
            link_result = PatientPracticeLinkSchema(
                id=link.id,
                patient_id=link.patient.id,
                practice_id=link.practice.id,
                created_at=link.created_at,
            )
            practice_links.append(link_result)

        full_address: str = ", ".join(
            [
                patient.address_line_1,
                patient.address_line_2,
                patient.city,
                patient.state,
                patient.zip_code,
                patient.country,
            ]
        )

        geo_point: GeoPointSchema | None = (
            GeoPointSchema(
                lat=patient.latitude,
                lon=patient.longitude,
            )
            if patient.latitude
            else None
        )

        return PatientSchema(
            address_line_1=patient.address_line_1,
            address_line_2=patient.address_line_2,
            full_address=full_address,
            geo_point=geo_point,
            latitude=patient.latitude,
            longitude=patient.longitude,
            city=patient.city,
            state=patient.state,
            zip_code=patient.zip_code,
            country=patient.country,
            user_id=patient.user.id,
            date_of_birth=patient.date_of_birth,
            documents=docs,
            email=patient.user.email,
            first_name=patient.user.first_name,
            last_name=patient.user.last_name,
            full_name=patient.user.get_full_name(),
            gender=patient.gender,
            health_care_number=patient.health_care_number,
            id=patient.id,
            phone=patient.phone,
            practice_links=practice_links,
        )

    @atomic
    def create(self, data: PatientSchema, test_data=False) -> PatientSchema:
        if not test_data:
            lat, lng = self.geo_service.get_location_coordinates(
                components={
                    "country": data.country,
                    "city": data.city,
                    "state": data.state,
                    "zip_code": data.zip_code,
                    "address_line_1": data.address_line_1,
                    "address_line_2": data.address_line_2,
                }
            )
        else:
            lat = data.latitude or 0
            lng = data.longitude or 0

        user = User.objects.get(id=data.user_id)
        user.first_name = data.first_name
        user.last_name = data.last_name
        user.email = data.email
        user.save()

        if not test_data:
            transaction.on_commit(
                lambda: self.auth0_service.assign_patient_role(id=user.username)
            )

        patient = PatientModel.objects.create(
            address_line_1=data.address_line_1,
            address_line_2=data.address_line_2,
            city=data.city,
            state=data.state,
            zip_code=data.zip_code,
            country=data.country,
            latitude=lat,
            longitude=lng,
            user=user,
            phone=data.phone,
            date_of_birth=data.date_of_birth,
            gender=data.gender,
            health_care_number=data.health_care_number,
        )

        result = self.get(patient.id)
        transaction.on_commit(
            lambda: self.elastic_service.add(id=patient.id, doc_data=result)
        )
        return result

    @atomic
    def create_via_staff_app(
        self, data: PatientSchema, practice_id: int, skip_gmaps=False
    ) -> PatientSchema:
        password = (
            User.objects.make_random_password(length=2, allowed_chars="0123456789")
            + User.objects.make_random_password(length=2, allowed_chars="!@#$%^&*()")
            + User.objects.make_random_password(
                length=6,
            )
            + User.objects.make_random_password(
                length=2, allowed_chars="ABCDEFGHIJKLMNOPQRSTUVWXYZ"
            )
        )
        user_id = self.auth0_service.signup_patient(email=data.email, password=password)
        self.auth0_service.assign_patient_role(id=user_id)
        user_exists = User.objects.filter(username=user_id).exists()
        if not user_exists:
            user = User.objects.create(
                email=data.email,
                first_name=data.first_name,
                last_name=data.last_name,
                username=user_id,
                is_active=True,
                is_staff=False,
            )
        else:
            user = User.objects.get(username=user_id)
        data.user_id = user.id
        patient = self.create(data, skip_gmaps=skip_gmaps)
        self.add_practice_link(patient.id, practice_id)
        return self.get(patient.id)

    @atomic
    def update(self, id: int, data: PatientSchema) -> PatientSchema:
        lat, lng = self.geo_service.get_location_coordinates(
            components={
                "country": data.country,
                "city": data.city,
                "state": data.state,
                "zip_code": data.zip_code,
                "address_line_1": data.address_line_1,
                "address_line_2": data.address_line_2,
            }
        )

        user = User.objects.get(id=data.user_id)
        user.first_name = data.first_name
        user.last_name = data.last_name
        user.email = data.email
        user.save()

        transaction.on_commit(
            lambda: self.auth0_service.assign_patient_role(id=user.username)
        )

        PatientModel.objects.filter(id=id).update(
            address_line_1=data.address_line_1,
            address_line_2=data.address_line_2,
            city=data.city,
            state=data.state,
            zip_code=data.zip_code,
            country=data.country,
            latitude=lat,
            longitude=lng,
            user=user,
            phone=data.phone,
            date_of_birth=data.date_of_birth,
            gender=data.gender,
            health_care_number=data.health_care_number,
        )

        result = self.get(id)
        transaction.on_commit(
            lambda: self.elastic_service.update(id=id, doc_data=result)
        )
        transaction.on_commit(lambda: update_patient_event.delay(id))

        return result

    @atomic
    def delete(self, id: int):
        patient = PatientModel.objects.get(id=id)
        docs_q = PatientVerificationModel.objects.filter(
            patient_document__patient=patient
        )
        for doc in docs_q:
            self.delete_document(doc.id)
        patient.delete()
        transaction.on_commit(lambda: self.elastic_service.remove(id=id))

    def search(self, term: str, size: int = 10) -> list[PatientSchema]:
        if size > 50:
            size = 50

        search_result = self.elastic_service.search(
            query={"multi_match": {"query": term, "fields": ["full_name"]}},
            size=size,
        )
        hits = search_result["hits"]["hits"]
        result = list(
            map(
                lambda x: PatientSchema(**x["_source"]),
                hits,
            )
        )
        return result

    def autocomplete_search(
        self, term: str, practice_id: int, size: int = 5
    ) -> list[PatientSchema]:
        autocomplete_fields = [
            "full_name",
            "address_line_1",
            "address_line_2",
            "city",
            "state",
            "zip_code",
        ]
        search_result = self.elastic_service.search(
            query={
                "bool": {
                    "must": [
                        {
                            "match": {
                                "practice_links.practice_id": practice_id,
                            }
                        },
                        {
                            "multi_match": {
                                "query": term,
                                "type": "bool_prefix",
                                "fields": autocomplete_fields,
                            },
                        },
                    ]
                }
            },
            size=size,
        )

        all_sources = []
        suggestions = search_result.body["hits"]["hits"]
        for sugg in suggestions:
            all_sources.append(sugg["_source"])

        result = list(map(lambda x: PatientSchema(**x), all_sources))
        result_drop_duplicates = list({v.id: v for v in result}.values())
        return result_drop_duplicates

    def recreate_index(self) -> None:
        queryset = PatientModel.objects.all()
        with ElasticMigration(self.elastic_service):
            for patient in queryset:
                result = self.get(id=patient.id)
                self.elastic_service.add(id=patient.id, doc_data=result)

    @atomic
    def create_upload_id_card(self, patient_id: int, extension: str) -> str:
        key = f"patient/{patient_id}/id/{uuid.uuid4()}.{extension}"
        upload_url = self.storage_service.gen_upload_url(key)
        doc = PatientDocumentModel.objects.create(patient_id=patient_id, s3_url=key)
        PatientVerificationModel.objects.create(
            patient_document=doc,
            is_id=True,
            is_proof_of_address=False,
            state="submitted",
        )
        result = self.get(patient_id)
        transaction.on_commit(
            lambda: self.elastic_service.update(id=patient_id, doc_data=result)
        )
        return upload_url

    @atomic
    def create_upload_poa_card(self, patient_id: int, extension: str) -> str:
        key = f"patient/{patient_id}/poa/{uuid.uuid4()}.{extension}"
        upload_url = self.storage_service.gen_upload_url(key)
        doc = PatientDocumentModel.objects.create(patient_id=patient_id, s3_url=key)
        PatientVerificationModel.objects.create(
            patient_document=doc,
            is_id=False,
            is_proof_of_address=True,
            state="submitted",
        )
        result = self.get(patient_id)
        transaction.on_commit(
            lambda: self.elastic_service.update(id=patient_id, doc_data=result)
        )
        return upload_url

    @atomic
    def delete_document(self, id: int) -> None:
        ver = PatientVerificationModel.objects.get(id=id)
        doc = ver.patient_document
        patient_id = doc.patient.id
        self.storage_service.delete_object(doc.s3_url)
        doc.delete()
        result = self.get(patient_id)
        transaction.on_commit(
            lambda: self.elastic_service.update(id=patient_id, doc_data=result)
        )

    def get_download_url(self, id: int) -> str:
        doc = PatientDocumentModel.objects.get(id=id)
        return self.storage_service.gen_download_url(doc.s3_url)

    def add_practice_link(
        self, patient_id: int, practice_id: int
    ) -> PatientSchema | None:
        already_exists = PatientPracticeModel.objects.filter(
            patient_id=patient_id, practice_id=practice_id
        ).exists()
        if not already_exists:
            PatientPracticeModel.objects.create(
                practice_id=practice_id, patient_id=patient_id
            )
            result = self.get(patient_id)
            transaction.on_commit(
                lambda: self.elastic_service.update(id=id, doc_data=result)
            )
            return result
        return None

    def check_has_onboarded(self, patient_id: int) -> bool:
        patient = self.get(patient_id)
        checks: list[str] = [
            patient.first_name,
            patient.last_name,
            str(patient.date_of_birth),
            patient.address_line_1,
            patient.city,
            patient.state,
            patient.country,
        ]
        check_result: list[bool] = []
        for check in checks:
            check_result.append(check is not None and check != "")
        return all(check_result)
