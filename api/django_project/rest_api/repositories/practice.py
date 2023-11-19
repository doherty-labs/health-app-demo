from django.contrib.auth.models import User
from django.db import transaction
from django.db.transaction import atomic
from django.utils.text import slugify
from injector import inject

from django_project import settings
from rest_api.models.feature_flags import PracticeFeatureFlagModel
from rest_api.models.practice import PracticeModel
from rest_api.models.practice_items import (
    ContactOptionModel,
    NoticeModel,
    OpeningHourModel,
    OpeningTimeExceptionModel,
    PracticeOrgLinkModel,
    TeamMemberModel,
)
from rest_api.models.staff import StaffModel
from rest_api.repositories.common import CommonModelRepo
from rest_api.repositories.staff import StaffRepo
from rest_api.schemas.common import FeatureFlagSchema, GeoPointSchema
from rest_api.schemas.practice import (
    ContactOptionSchema,
    NoticeSchema,
    OpeningHourSchema,
    OpeningTimeExceptionSchema,
    PracticeSummarySchema,
    TeamMemberSchema,
)
from rest_api.schemas.staff import StaffMemberSchema
from rest_api.serializers.common import FeatureFlagSerializer
from rest_api.serializers.practice import (
    ContactOptionModelSerializer,
    NoticeSerializer,
    OpeningHourModelSerializer,
    TeamMemberSerializer,
)
from rest_api.services.auth0 import Auth0Service
from rest_api.services.elastic_indexes.practice import PracticeIndex
from rest_api.services.geo import GeoPyService
from rest_api.services.s3 import ObjectStorageService
from rest_api.utils.caching_annotations import create_cache, invalidate_cache
from rest_api.utils.elastic_migration import ElasticMigration


class PracticeRepo(CommonModelRepo[PracticeSummarySchema]):

    auth0_service: Auth0Service
    elastic_service: PracticeIndex
    geo_service: GeoPyService
    storage_service: ObjectStorageService
    staff_repo: StaffRepo

    cache_prefix = "practice"

    feature_flags = [
        FeatureFlagSchema(flag_id="appointment_request", flag_value=False),
        FeatureFlagSchema(flag_id="prescription_request", flag_value=False),
    ]

    @inject
    def __init__(
        self,
        auth0_service: Auth0Service,
        elastic_service: PracticeIndex,
        geo_service: GeoPyService,
        storage_service: ObjectStorageService,
        staff_repo: StaffRepo,
    ):
        super(PracticeRepo, self).__init__(es_instance=elastic_service)
        self.auth0_service = auth0_service
        self.elastic_service = elastic_service
        self.geo_service = geo_service
        self.storage_service = storage_service
        self.staff_repo = staff_repo

    def get_model(self, id: int) -> PracticeModel:
        return PracticeModel.objects.get(
            id=id,
        )

    def get_model_by_slug(self, slug: str) -> PracticeModel:
        return PracticeModel.objects.get(
            slug=slug,
        )

    def get_model_by_org_id(self, org_id: str) -> PracticeModel:
        org_query = PracticeOrgLinkModel.objects.filter(org_id=org_id).first()
        return org_query.practice

    @create_cache(object_name=cache_prefix, pydantic_model=PracticeSummarySchema)
    def get(self, id: int, **kwargs) -> PracticeSummarySchema:
        practice = PracticeModel.objects.get(
            id=id,
        )
        team_members_query = TeamMemberModel.objects.filter(practice=practice)
        team_members: list[TeamMemberSchema] = list(
            map(
                lambda x: TeamMemberSchema(**TeamMemberSerializer(x).data),
                team_members_query,
            )
        )
        notices_query = NoticeModel.objects.filter(practice=practice)
        notices: list[NoticeSchema] = list(
            map(lambda x: NoticeSchema(**NoticeSerializer(x).data), notices_query)
        )
        contacts_query = ContactOptionModel.objects.filter(practice=practice)
        contacts: list[ContactOptionSchema] = list(
            map(
                lambda x: ContactOptionSchema(**ContactOptionModelSerializer(x).data),
                contacts_query,
            )
        )
        hour_exceptions_query = OpeningTimeExceptionModel.objects.filter(
            practice=practice
        )
        hours_exception: list[OpeningTimeExceptionSchema] = list(
            map(
                lambda x: x.__dict__,
                hour_exceptions_query,
            )
        )
        hours_query = OpeningHourModel.objects.filter(practice=practice)
        hours: list[OpeningHourSchema] = list(
            map(
                lambda x: OpeningHourSchema(**OpeningHourModelSerializer(x).data),
                hours_query,
            )
        )

        flags_query = PracticeFeatureFlagModel.objects.filter(practice=practice)
        flags: list[FeatureFlagSchema] = list(
            map(
                lambda x: FeatureFlagSchema(**FeatureFlagSerializer(x).data),
                flags_query,
            )
        )

        org_query = PracticeOrgLinkModel.objects.filter(practice_id=practice.id)
        org_id: str | None = org_query.first().org_id if org_query.exists() else None

        full_address: str = ", ".join(
            [
                practice.address_line_1,
                practice.address_line_2,
                practice.city,
                practice.state,
                practice.zip_code,
                practice.country,
            ]
        )

        geo_point: GeoPointSchema | None = (
            GeoPointSchema(
                lat=practice.latitude,
                lon=practice.longitude,
            )
            if practice.latitude
            else None
        )
        return PracticeSummarySchema(
            id=practice.id,
            org_id=org_id,
            name=practice.name,
            slug=practice.slug,
            address_line_1=practice.address_line_1,
            address_line_2=practice.address_line_2,
            latitude=practice.latitude,
            longitude=practice.longitude,
            full_address=full_address,
            city=practice.city,
            state=practice.state,
            zip_code=practice.zip_code,
            country=practice.country,
            team_members=team_members,
            notices=notices,
            contact_options=contacts,
            opening_hours=hours,
            opening_time_exceptions=hours_exception,
            created_at=practice.created_at,
            updated_at=practice.updated_at,
            geo_point=geo_point,
            feature_flags=flags,
        )

    def check_if_org_exists(self, practice_id: int) -> bool:
        return PracticeOrgLinkModel.objects.filter(practice_id=practice_id).exists()

    @atomic
    def create_org(self, practice_id: int):
        practice = PracticeModel.objects.get(id=practice_id)
        if self.check_if_org_exists(practice_id=practice_id):
            raise ValueError("Practice already has an org")

        org_id = self.auth0_service.add_org(org_name=practice.name, slug=practice.slug)
        PracticeOrgLinkModel.objects.create(practice_id=practice_id, org_id=org_id)
        result = self.get(id=practice.id)
        transaction.on_commit(
            self.elastic_service.update(id=practice.id, doc_data=result)
        )

    def create_auth0_user(self, practice_id: int, email: str):
        if not self.check_if_org_exists(practice_id=practice_id):
            self.create_org(practice_id=practice_id)
        org_id = PracticeOrgLinkModel.objects.get(practice_id=practice_id).org_id
        self.auth0_service.add_org_user(
            org_id=org_id, email=email, roles=[settings.AUTH0_STAFF_ROLE_ID]
        )

    def delete_org(self, practice_id: int):
        link = PracticeOrgLinkModel.objects.filter(practice_id=practice_id)
        if link.exists():
            if self.auth0_service is not None:
                self.auth0_service.delete_org(id=link.first().org_id)
            else:
                raise ValueError("Auth0 service not available")

    def add_staff_user(self, user_id: str, practice_id: str) -> StaffModel:
        if StaffModel.objects.filter(user_id=user_id).count() == 0:
            user = User.objects.get(id=user_id)
            add_result = self.staff_repo.create(
                StaffMemberSchema(
                    first_name=user.first_name,
                    last_name=user.last_name,
                    email=user.email,
                    full_name=user.get_full_name(),
                    practice_id=practice_id,
                    user_id=user_id,
                    job_title="",
                    bio="",
                )
            )
            return add_result
        else:
            return StaffModel.objects.filter(user_id=user_id).first()

    @atomic
    def create(
        self, data: PracticeSummarySchema, skip_gmaps=False
    ) -> PracticeSummarySchema:
        if not skip_gmaps:
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

        practice = PracticeModel.objects.create(
            name=data.name,
            slug=slugify(data.name),
            address_line_1=data.address_line_1,
            address_line_2=data.address_line_2,
            city=data.city,
            state=data.state,
            zip_code=data.zip_code,
            country=data.country,
            latitude=lat,
            longitude=lng,
        )

        if data.staff_id:
            data.staff_id = self.add_staff_user(
                data.staff_id, practice_id=practice.id
            ).id

        for member in data.team_members:
            TeamMemberModel.objects.create(
                first_name=member.first_name,
                last_name=member.last_name,
                practice=practice,
                staff_id=data.staff_id,
                job_title=member.job_title,
                bio=member.bio,
            )

        if data.notices:
            for notice in data.notices:
                NoticeModel.objects.create(
                    title=notice.title,
                    description_markdown=notice.description_markdown,
                    practice=practice,
                    staff_id=data.staff_id,
                )

        if data.contact_options:
            for contact in data.contact_options:
                ContactOptionModel.objects.create(
                    name=contact.name,
                    value=contact.value,
                    href_type=contact.href_type,
                    practice=practice,
                    staff_id=data.staff_id,
                )

        for hour_exc in data.opening_time_exceptions:
            OpeningTimeExceptionModel.objects.create(
                start_datetime=hour_exc.start_datetime,
                end_datetime=hour_exc.end_datetime,
                is_closed=hour_exc.is_closed,
                reason=hour_exc.reason,
                practice=practice,
                staff_id=data.staff_id,
            )

        for hour in data.opening_hours:
            OpeningHourModel.objects.create(
                day_of_week=hour.day_of_week,
                start_time=hour.start_time,
                end_time=hour.end_time,
                is_closed=hour.is_closed,
                practice=practice,
                staff_id=data.staff_id,
            )

        for flag in self.feature_flags:
            flag_val_filter = [
                x.flag_value for x in data.feature_flags if x.flag_id == flag.flag_id
            ]
            if len(flag_val_filter) > 0:
                flag_val = flag_val_filter[0]
            else:
                flag_val = flag.flag_value
            PracticeFeatureFlagModel.objects.create(
                practice=practice,
                flag_id=flag.flag_id,
                flag_value=flag_val,
            )

        result = self.get(id=practice.id)
        transaction.on_commit(
            lambda: self.elastic_service.add(id=practice.id, doc_data=result)
        )
        return result

    @atomic
    @invalidate_cache(object_name=cache_prefix)
    def update(self, id: int, data: PracticeSummarySchema) -> PracticeSummarySchema:
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

        PracticeModel.objects.filter(id=id).update(
            name=data.name,
            slug=slugify(data.name),
            address_line_1=data.address_line_1,
            address_line_2=data.address_line_2,
            city=data.city,
            state=data.state,
            zip_code=data.zip_code,
            country=data.country,
            latitude=lat,
            longitude=lng,
        )

        practice = PracticeModel.objects.get(id=id)

        team_members_ids = list(map(lambda x: x.id, data.team_members))
        TeamMemberModel.objects.filter(practice=practice).exclude(
            id__in=team_members_ids
        ).delete()
        for member in data.team_members:
            if member.id is None:
                TeamMemberModel.objects.create(
                    first_name=member.first_name,
                    last_name=member.last_name,
                    job_title=member.job_title,
                    bio=member.bio,
                    practice=practice,
                    staff_id=data.staff_id,
                )
                continue

            TeamMemberModel.objects.filter(id=member.id).update(
                first_name=member.first_name,
                last_name=member.last_name,
                job_title=member.job_title,
                bio=member.bio,
                practice=practice,
                staff_id=data.staff_id,
            )

        if data.notices:
            notice_ids = list(map(lambda x: x.id, data.notices))
            NoticeModel.objects.filter(practice=practice).exclude(
                id__in=notice_ids
            ).delete()
            for notice in data.notices:
                if notice.id is None:
                    NoticeModel.objects.create(
                        title=notice.title,
                        description_markdown=notice.description_markdown,
                        practice=practice,
                        staff_id=data.staff_id,
                    )
                    continue

                NoticeModel.objects.filter(id=notice.id).update(
                    title=notice.title,
                    description_markdown=notice.description_markdown,
                    practice=practice,
                    staff_id=data.staff_id,
                )

        if data.contact_options:
            contact_ids = list(map(lambda x: x.id, data.contact_options))
            ContactOptionModel.objects.filter(practice=practice).exclude(
                id__in=contact_ids
            ).delete()
            for contact in data.contact_options:
                if contact.id is None:
                    ContactOptionModel.objects.create(
                        name=contact.name,
                        value=contact.value,
                        href_type=contact.href_type,
                        practice=practice,
                        staff_id=data.staff_id,
                    )
                    continue

                ContactOptionModel.objects.filter(id=contact.id).update(
                    name=contact.name,
                    value=contact.value,
                    href_type=contact.href_type,
                    practice=practice,
                    staff_id=data.staff_id,
                )

        exception_ids = list(map(lambda x: x.id, data.opening_time_exceptions))
        OpeningTimeExceptionModel.objects.filter(practice=practice).exclude(
            id__in=exception_ids
        ).delete()
        for hour_exc in data.opening_time_exceptions:
            if hour_exc.id is None:
                OpeningTimeExceptionModel.objects.create(
                    start_datetime=hour_exc.start_datetime,
                    end_datetime=hour_exc.end_datetime,
                    is_closed=hour_exc.is_closed,
                    reason=hour_exc.reason,
                    practice=practice,
                    staff_id=data.staff_id,
                )
                continue

            OpeningTimeExceptionModel.objects.filter(id=hour_exc.id).update(
                start_datetime=hour_exc.start_datetime,
                end_datetime=hour_exc.end_datetime,
                is_closed=hour_exc.is_closed,
                reason=hour_exc.reason,
                practice=practice,
                staff_id=data.staff_id,
            )

        hour_ids = list(map(lambda x: x.id, data.opening_hours))
        OpeningHourModel.objects.filter(practice=practice).exclude(
            id__in=hour_ids
        ).delete()
        for hour in data.opening_hours:
            if hour.id is None:
                OpeningHourModel.objects.create(
                    day_of_week=hour.day_of_week,
                    start_time=hour.start_time,
                    end_time=hour.end_time,
                    is_closed=hour.is_closed,
                    practice=practice,
                    staff_id=data.staff_id,
                )
                continue

            OpeningHourModel.objects.filter(id=hour.id).update(
                day_of_week=hour.day_of_week,
                start_time=hour.start_time,
                end_time=hour.end_time,
                is_closed=hour.is_closed,
                practice=practice,
                staff_id=data.staff_id,
            )

        for flag in data.feature_flags:
            PracticeFeatureFlagModel.objects.filter(
                practice=practice, flag_id=flag.flag_id
            ).update(flag_value=flag.flag_value)

        result = self.get(id=practice.id, disabled_cache=True)
        transaction.on_commit(
            lambda: self.elastic_service.update(id=practice.id, doc_data=result)
        )
        return result

    @atomic
    @invalidate_cache(object_name=cache_prefix)
    def delete(self, id: int):
        practice = PracticeModel.objects.get(id=id)
        self.delete_org(practice_id=id)
        transaction.on_commit(lambda: self.elastic_service.remove(id=id))
        practice.delete()

    def search(self, term: str, size: int = 10) -> list[PracticeSummarySchema]:
        if size > 50:
            size = 50

        search_result = self.elastic_service.search(
            query={"multi_match": {"query": term, "fields": ["name", "slug"]}},
            size=size,
        )
        hits = search_result["hits"]["hits"]
        result = list(
            map(
                lambda x: PracticeSummarySchema(**x["_source"]),
                hits,
            )
        )
        return result

    def autocomplete_search(
        self, term: str, size: int = 5
    ) -> list[PracticeSummarySchema]:
        autocomplete_fields = [
            "name",
            "address_line_1",
            "address_line_2",
            "city",
            "state",
            "zip_code",
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

        result = list(map(lambda x: PracticeSummarySchema(**x), all_sources))
        result_drop_duplicates = list({v.id: v for v in result}.values())
        return result_drop_duplicates

    def recreate_index(self) -> None:
        queryset = PracticeModel.objects.all()
        with ElasticMigration(self.elastic_service):
            for practice in queryset:
                result = self.get(id=practice.id)
                self.elastic_service.add(id=practice.id, doc_data=result)
