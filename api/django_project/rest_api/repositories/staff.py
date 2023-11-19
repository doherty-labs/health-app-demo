from django.contrib.auth import get_user_model
from django.db import transaction
from django.db.transaction import atomic
from injector import inject

from rest_api.models.staff import StaffModel
from rest_api.repositories.common import CommonModelRepo
from rest_api.schemas.staff import StaffMemberSchema
from rest_api.services.auth0 import Auth0Service
from rest_api.services.elastic_indexes.staff import StaffIndex
from rest_api.utils.elastic_migration import ElasticMigration

User = get_user_model()


class StaffRepo(CommonModelRepo[StaffMemberSchema]):

    elastic_service: StaffIndex
    auth0_service: Auth0Service

    @inject
    def __init__(self, elastic_service: StaffIndex, auth0_service: Auth0Service):
        super(StaffRepo, self).__init__(es_instance=elastic_service)
        self.elastic_service = elastic_service
        self.auth0_service = auth0_service

    def get_model(self, id: int) -> StaffModel:
        return StaffModel.objects.get(
            id=id,
        )

    def get(self, id: int) -> StaffMemberSchema:
        model = self.get_model(id=id)
        return StaffMemberSchema(
            id=model.id,
            user_id=model.user.id,
            practice_id=model.practice.id if model.practice else None,
            bio=model.bio,
            email=model.user.email,
            first_name=model.user.first_name,
            last_name=model.user.last_name,
            job_title=model.job_title,
            full_name=model.user.get_full_name(),
        )

    def get_by_user_id(self, user_id: int) -> StaffMemberSchema:
        model = StaffModel.objects.get(user_id=user_id)
        return self.get(id=model.id)

    @atomic
    def create(self, data: StaffMemberSchema) -> StaffMemberSchema:
        user = User.objects.get(id=data.user_id)
        user.is_staff = True
        user.first_name = data.first_name
        user.last_name = data.last_name
        user.email = data.email
        user.save()
        staff = StaffModel.objects.create(
            user_id=data.user_id,
            bio=data.bio,
            job_title=data.job_title,
            practice_id=data.practice_id,
        )
        result = self.get(id=staff.id)
        transaction.on_commit(
            lambda: self.elastic_service.add(id=staff.id, doc_data=result)
        )
        transaction.on_commit(
            lambda: self.auth0_service.assign_staff_role(id=user.username)
        )
        return result

    @atomic
    def update(self, id: int, data: StaffMemberSchema) -> StaffMemberSchema:
        user = User.objects.get(id=data.user_id)
        user.is_staff = True
        user.first_name = data.first_name
        user.last_name = data.last_name
        user.email = data.email
        user.save()
        StaffModel.objects.filter(id=id).update(
            user_id=data.user_id,
            bio=data.bio,
            job_title=data.job_title,
            practice_id=data.practice_id,
        )
        staff = StaffModel.objects.get(id=id)
        result = self.get(id=staff.id)
        transaction.on_commit(
            lambda: self.elastic_service.update(id=staff.id, doc_data=result)
        )
        transaction.on_commit(
            lambda: self.auth0_service.assign_staff_role(id=user.username)
        )
        return result

    @atomic
    def delete(self, id: int):
        staff = StaffModel.objects.get(id=id)
        staff.delete()
        transaction.on_commit(lambda: self.elastic_service.remove(id=id))

    def search(self, term: str, size: int = 10) -> list[StaffMemberSchema]:
        if size > 50:
            size = 50

        search_result = self.elastic_service.search(
            query={"multi_match": {"query": term, "fields": ["full_name"]}},
            size=size,
        )
        hits = search_result["hits"]["hits"]
        result = list(
            map(
                lambda x: StaffMemberSchema(**x["_source"]),
                hits,
            )
        )
        return result

    def autocomplete_search(
        self, term: str, practice_id: int, size: int = 5
    ) -> list[StaffMemberSchema]:
        autocomplete_fields = [
            "full_name",
        ]
        search_result = self.elastic_service.search(
            query={
                "bool": {
                    "must": [
                        {
                            "match": {
                                "practice_id": practice_id,
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

        result = list(map(lambda x: StaffMemberSchema(**x), all_sources))
        result_drop_duplicates = list({v.id: v for v in result}.values())
        return result_drop_duplicates

    def recreate_index(self) -> None:
        queryset = StaffModel.objects.all()
        with ElasticMigration(self.elastic_service):
            for staff in queryset:
                result = self.get(id=staff.id)
                self.elastic_service.add(id=staff.id, doc_data=result)

    def check_has_onboarded(self, staff_id: int) -> bool:
        staff = self.get(staff_id)
        checks: list[str] = [
            staff.first_name,
            staff.last_name,
            staff.email,
        ]
        check_result: list[bool] = []
        for check in checks:
            check_result.append(check is not None and check != "")
        return all(check_result)
