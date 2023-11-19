from datetime import datetime

from django.contrib.auth import get_user_model
from django.db import transaction
from django.db.transaction import atomic
from injector import inject

from rest_api.models.prescription import (
    PharmacyModel,
    PrescriptionAssignLogModel,
    PrescriptionCommentModel,
    PrescriptionLineItemModel,
    PrescriptionModel,
    PrescriptionStateLogModel,
    PrescriptionViewedLogModel,
)
from rest_api.repositories.common import CommonModelRepo
from rest_api.repositories.patient import PatientRepo
from rest_api.repositories.user import UserRepo
from rest_api.repositories.utils import convert_patient_id_to_user_id
from rest_api.schemas.common import StateSchema
from rest_api.schemas.prescription import (
    PharmacySchema,
    PrescriptionAssignSchema,
    PrescriptionCommentSchema,
    PrescriptionLineItemSchema,
    PrescriptionSchema,
    PrescriptionStateLogSchema,
    PrescriptionViewedLogSchema,
)
from rest_api.serializers.prescription import PrescriptionLineItemSerializer
from rest_api.services.elastic_indexes.prescription import PrescriptionIndex
from rest_api.services.geo import GeoPyService
from rest_api.services.notification import NotificationService
from rest_api.services.s3 import ObjectStorageService
from rest_api.utils.elastic_migration import ElasticMigration

User = get_user_model()


class PrescriptionRepo(CommonModelRepo[PrescriptionSchema]):

    elastic_service: PrescriptionIndex
    geo_service: GeoPyService
    storage_service: ObjectStorageService
    notification_service: NotificationService

    states: list[StateSchema] = [
        StateSchema(id="submitted", name="Submitted", description="Submitted"),
        StateSchema(id="in_review", name="In Review", description="In Review"),
        StateSchema(id="rejected", name="Rejected", description="Rejected"),
        StateSchema(id="approved", name="Approved", description="Approved"),
        StateSchema(
            id="ready_for_collection",
            name="Ready for Collection",
            description="Ready for Collection",
        ),
    ]

    @inject
    def __init__(
        self,
        elastic_service: PrescriptionIndex,
        geo_service: GeoPyService,
        storage_service: ObjectStorageService,
        notification_service: NotificationService,
        patient_repo: PatientRepo,
        user_repo: UserRepo,
    ):
        super(PrescriptionRepo, self).__init__(es_instance=elastic_service)
        self.elastic_service = elastic_service
        self.geo_service = geo_service
        self.storage_service = storage_service
        self.notification_service = notification_service
        self.patient_repo = patient_repo
        self.user_repo = user_repo

    def get(self, id: int) -> PrescriptionSchema:
        prescription = PrescriptionModel.objects.get(
            id=id,
        )

        items_q = PrescriptionLineItemModel.objects.filter(
            request=prescription,
        )

        items: list[PrescriptionLineItemSchema] = list(
            map(
                lambda x: PrescriptionLineItemSchema(
                    **PrescriptionLineItemSerializer(x).data
                ),
                items_q,
            )
        )

        logs_q = PrescriptionStateLogModel.objects.filter(prescription_id=id).order_by(
            "-created_at"
        )
        logs: list[PrescriptionStateLogSchema] = []
        for log in logs_q:
            if log.transition_away_at is not None:
                diff_dates = (log.transition_away_at - log.created_at).total_seconds()
            else:
                diff_dates = None
            logs.append(
                PrescriptionStateLogSchema(
                    id=log.id,
                    prescription_id=log.prescription.id,
                    created_at=log.created_at,
                    from_state=log.from_state,
                    to_state=log.to_state,
                    triggered_by_id=log.triggered_by.id,
                    triggered_by=self.user_repo.get(log.triggered_by.id),
                    transition_away_at=log.transition_away_at,
                    transition_delta=diff_dates,
                )
            )

        comments_q = PrescriptionCommentModel.objects.filter(
            prescription_id=id
        ).order_by("-created_at")
        comments: list[PrescriptionCommentSchema] = []
        for comm in comments_q:
            comments.append(
                PrescriptionCommentSchema(
                    id=comm.id,
                    comment=comm.comment,
                    created_at=comm.created_at,
                    prescription_id=comm.prescription.id,
                    updated_at=comm.updated_at,
                    user_id=comm.user.id,
                    user=self.user_repo.get(comm.user.id),
                )
            )

        assign_logs_q = PrescriptionAssignLogModel.objects.filter(
            prescription_id=id
        ).order_by("-created_at")
        assign_logs: list[PrescriptionAssignSchema] = []
        for log in assign_logs_q:
            assign_logs.append(
                PrescriptionAssignSchema(
                    id=log.id,
                    prescription_id=log.prescription.id,
                    created_at=log.created_at,
                    from_user=self.user_repo.get(log.from_user.id)
                    if log.from_user
                    else None,
                    to_user=self.user_repo.get(log.to_user.id) if log.to_user else None,
                    triggered_by=self.user_repo.get(log.triggered_by.id)
                    if log.triggered_by
                    else None,
                )
            )

        patient = self.patient_repo.get(prescription.patient.id)

        if prescription.assigned_to:
            assigned_to = self.user_repo.get(prescription.assigned_to.id)
        else:
            assigned_to = None

        viewed_history_q = PrescriptionViewedLogModel.objects.filter(
            prescription_id=id
        ).order_by("-created_at")
        viewed_history: list[PrescriptionViewedLogSchema] = []

        for item in viewed_history_q:
            viewed_history.append(
                PrescriptionViewedLogSchema(
                    id=item.id,
                    prescription_id=item.prescription.id,
                    created_at=item.created_at,
                    viewed_by=self.user_repo.get(item.viewed_by.id),
                )
            )

        return PrescriptionSchema(
            id=prescription.id,
            updated_at=prescription.updated_at,
            created_at=prescription.created_at,
            pharmacy=PharmacySchema(
                id=prescription.pharmacy.id,
                name=prescription.pharmacy.name,
                updated_at=prescription.pharmacy.updated_at,
                created_at=prescription.pharmacy.created_at,
                address_line_1=prescription.pharmacy.address_line_1,
                address_line_2=prescription.pharmacy.address_line_2,
                latitude=prescription.pharmacy.latitude,
                longitude=prescription.pharmacy.longitude,
                city=prescription.pharmacy.city,
                country=prescription.pharmacy.country,
                zip_code=prescription.pharmacy.zip_code,
                state=prescription.pharmacy.state,
            ),
            patient_id=prescription.patient.id,
            practice_id=prescription.practice.id,
            state=prescription.state,
            items=items,
            logs=logs,
            assigned_to_id=prescription.assigned_to.id
            if prescription.assigned_to
            else None,
            comments=comments,
            patient=patient,
            assigned_to=assigned_to,
            assign_history=assign_logs,
            viewed_logs=viewed_history,
        )

    def get_with_tracking(self, id: int, viewed_by: int) -> PrescriptionSchema:
        if viewed_by is not None:
            PrescriptionViewedLogModel.objects.create(
                prescription_id=id, viewed_by_id=viewed_by
            )
        result = self.get(id=id)
        self.elastic_service.update(id=id, doc_data=result)
        return result

    @atomic
    def create(self, data: PrescriptionSchema, test_data=False) -> PrescriptionSchema:
        if not test_data:
            lat, lng = self.geo_service.get_location_coordinates(
                components={
                    "country": data.pharmacy.country,
                    "city": data.pharmacy.city,
                    "state": data.pharmacy.state,
                    "zip_code": data.pharmacy.zip_code,
                    "address_line_1": data.pharmacy.address_line_1,
                    "address_line_2": data.pharmacy.address_line_2,
                }
            )
        else:
            lat = data.pharmacy.latitude or 0
            lng = data.pharmacy.longitude or 0

        pharmacy, created = PharmacyModel.objects.get_or_create(
            latitude=lat,
            longitude=lng,
            defaults={
                "name": data.pharmacy.name,
                "address_line_1": data.pharmacy.address_line_1,
                "address_line_2": data.pharmacy.address_line_2,
                "city": data.pharmacy.city,
                "state": data.pharmacy.state,
                "zip_code": data.pharmacy.zip_code,
                "country": data.pharmacy.country,
            },
        )

        if data.patient_id:
            self.patient_repo.add_practice_link(
                patient_id=data.patient_id, practice_id=data.practice_id
            )

        prescription = PrescriptionModel.objects.create(
            pharmacy_id=pharmacy.id,
            state=data.state,
            patient_id=data.patient_id,
            practice_id=data.practice_id,
        )

        for item in data.items:
            PrescriptionLineItemModel.objects.create(
                request=prescription,
                name=item.name,
                quantity=item.quantity,
            )

        user_id = convert_patient_id_to_user_id(prescription.patient.id)
        PrescriptionStateLogModel.objects.create(
            prescription_id=prescription.id,
            from_state="",
            to_state=data.state,
            triggered_by_id=user_id,
        )

        result = self.get(prescription.id)
        transaction.on_commit(
            lambda: self.elastic_service.add(id=prescription.id, doc_data=result)
        )
        return result

    @atomic
    def update(
        self, id: int, data: PrescriptionSchema, triggered_by_id: int
    ) -> PrescriptionSchema:

        new_state = data.state

        if new_state not in [s.id for s in self.states]:
            raise ValueError(f"Invalid state {new_state}")

        old_state = PrescriptionModel.objects.get(id=id).state
        if new_state != old_state:
            latest_state = (
                PrescriptionStateLogModel.objects.filter(prescription_id=id)
                .order_by("-created_at")
                .first()
            )
            if latest_state:
                latest_state.transition_away_at = datetime.now()
                latest_state.save()
            PrescriptionStateLogModel.objects.create(
                prescription_id=id,
                from_state=old_state,
                to_state=new_state,
                triggered_by_id=triggered_by_id,
            )

            patient_email = PrescriptionModel.objects.get(id=id).patient.user.email
            self.notification_service.send_email(
                to_emails=[patient_email],
                subject="Prescription State Change",
                text=f"Your prescription state has changed from {old_state} to {new_state}",
            )

        old_assigned_to = PrescriptionModel.objects.get(id=id).assigned_to
        old_assigned_to_id: int | None = old_assigned_to.id if old_assigned_to else None
        new_assigned_to_id = data.assigned_to_id
        if old_assigned_to_id != new_assigned_to_id:
            PrescriptionAssignLogModel.objects.create(
                from_user_id=old_assigned_to_id,
                to_user_id=new_assigned_to_id,
                triggered_by_id=triggered_by_id,
                appointment_id=id,
            )

        lat, lng = self.geo_service.get_location_coordinates(
            components={
                "country": data.pharmacy.country,
                "city": data.pharmacy.city,
                "state": data.pharmacy.state,
                "zip_code": data.pharmacy.zip_code,
                "address_line_1": data.pharmacy.address_line_1,
                "address_line_2": data.pharmacy.address_line_2,
            }
        )

        pharmacy, created = PharmacyModel.objects.get_or_create(
            latitude=lat,
            longitude=lng,
            defaults={
                "name": data.pharmacy.name,
                "address_line_1": data.pharmacy.address_line_1,
                "address_line_2": data.pharmacy.address_line_2,
                "city": data.pharmacy.city,
                "state": data.pharmacy.state,
                "zip_code": data.pharmacy.zip_code,
                "country": data.pharmacy.country,
            },
        )

        PrescriptionModel.objects.filter(id=id).update(
            pharmacy_id=pharmacy.id,
            state=data.state,
            patient_id=data.patient_id,
            practice_id=data.practice_id,
            assigned_to_id=data.assigned_to_id,
        )

        items_ids = list(map(lambda x: x.id, data.items))
        PrescriptionLineItemModel.objects.filter(request_id=id).exclude(
            id__in=items_ids
        ).delete()

        for item in data.items:
            if item.id is None:
                PrescriptionLineItemModel.objects.create(
                    request_id=id,
                    name=item.name,
                    quantity=item.quantity,
                )

            PrescriptionLineItemModel.objects.filter(id=item.id).update(
                name=item.name,
                quantity=item.quantity,
            )

        if data.comments:
            comment_ids = list(map(lambda x: x.id, data.comments))
            PrescriptionCommentModel.objects.filter(prescription_id=id).exclude(
                id__in=comment_ids
            ).delete()

            for comment in data.comments:
                if comment.id is None:
                    PrescriptionCommentModel.objects.create(
                        prescription_id=comment.prescription_id,
                        user_id=comment.user_id,
                        comment=comment.comment,
                    )

                PrescriptionCommentModel.objects.filter(id=comment.id).update(
                    comment=comment.comment,
                    user_id=comment.user_id,
                )

        result = self.get(id)
        transaction.on_commit(
            lambda: self.elastic_service.update(id=id, doc_data=result)
        )
        return result

    @atomic
    def delete(self, id: int):
        prescription = PrescriptionModel.objects.get(id=id)
        prescription.delete()
        transaction.on_commit(lambda: self.elastic_service.remove(id=id))

    def update_index_by_patient_id(self, patient_id: int) -> None:
        queryset = PrescriptionModel.objects.filter(patient_id=patient_id)
        for prescript in queryset:
            p = self.get(id=prescript.id)
            self.elastic_service.update(id=prescript.id, doc_data=p)

    def recreate_index(self) -> None:
        queryset = PrescriptionModel.objects.all()
        with ElasticMigration(self.elastic_service):
            for prescript in queryset:
                result = self.get(id=prescript.id)
                self.elastic_service.add(id=prescript.id, doc_data=result)

    def search(self, term: str, size: int = 10) -> list[PrescriptionSchema]:
        if size > 50:
            size = 50

        search_result = self.elastic_service.search(
            query={"multi_match": {"query": term, "fields": ["patient_id"]}},
            size=size,
        )
        hits = search_result["hits"]["hits"]
        result = list(
            map(
                lambda x: PrescriptionSchema(**x["_source"]),
                hits,
            )
        )
        return result

    def autocomplete_search(self, term: str, size: int = 5) -> list[PrescriptionSchema]:
        autocomplete_fields = [
            "patient.full_name",
            "assigned_to.full_name",
        ]
        search_result = self.elastic_service.search(
            query={
                "multi_match": {
                    "query": term,
                    "type": "bool_prefix",
                    "fields": autocomplete_fields,
                },
            },
            size=size,
        )

        all_sources = []
        suggestions = search_result.body["hits"]["hits"]
        for sugg in suggestions:
            all_sources.append(sugg["_source"])

        result = list(map(lambda x: PrescriptionSchema(**x), all_sources))
        result_drop_duplicates = list({v.id: v for v in result}.values())
        return result_drop_duplicates
