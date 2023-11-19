from django.contrib.auth.models import User
from django.db import transaction
from django.db.transaction import atomic
from injector import inject

from rest_api.repositories.common import CommonModelRepo
from rest_api.schemas.user import UserSchema
from rest_api.services.elastic_indexes.user import UserIndex
from rest_api.utils.elastic_migration import ElasticMigration


class UserRepo(CommonModelRepo[UserSchema]):

    elastic_service: UserIndex

    @inject
    def __init__(
        self,
        elastic_service: UserIndex,
    ):
        super(UserRepo, self).__init__(es_instance=elastic_service)
        self.elastic_service = elastic_service

    def get_model(self, id: int) -> User:
        return User.objects.get(
            id=id,
        )

    def get(self, id: int) -> UserSchema:
        model = self.get_model(id=id)
        return UserSchema(
            id=model.id,
            email=model.email,
            first_name=model.first_name,
            last_name=model.last_name,
            full_name=model.get_full_name(),
        )

    @atomic
    def create(self, data: UserSchema) -> UserSchema:
        user = User.objects.create(
            email=data.email,
            first_name=data.first_name,
            last_name=data.last_name,
            username=data.email,
        )
        result = self.get(id=user.id)
        transaction.on_commit(
            lambda: self.elastic_service.add(id=user.id, doc_data=result)
        )

        return result

    @atomic
    def update(self, id: int, data: UserSchema) -> UserSchema:
        user = User.objects.get(id=id)
        user.first_name = data.first_name
        user.last_name = data.last_name
        user.email = data.email
        user.save()
        result = self.get(id=user.id)
        transaction.on_commit(
            lambda: self.elastic_service.update(id=id, doc_data=result)
        )

        return result

    @atomic
    def delete(self, id: int):
        staff = User.objects.get(id=id)
        staff.delete()
        transaction.on_commit(lambda: self.elastic_service.remove(id=id))

    def search(self, term: str, size: int = 10) -> list[UserSchema]:
        if size > 50:
            size = 50

        search_result = self.elastic_service.search(
            query={"multi_match": {"query": term, "fields": ["full_name"]}},
            size=size,
        )
        hits = search_result["hits"]["hits"]
        result = list(
            map(
                lambda x: UserSchema(**x["_source"]),
                hits,
            )
        )
        return result

    def autocomplete_search(self, term: str, size: int = 5) -> list[UserSchema]:
        autocomplete_fields = [
            "full_name",
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

        result = list(map(lambda x: UserSchema(**x), all_sources))
        result_drop_duplicates = list({v.id: v for v in result}.values())
        return result_drop_duplicates

    def recreate_index(self) -> None:
        queryset = User.objects.all()
        with ElasticMigration(self.elastic_service):
            for user in queryset:
                result = self.get(id=user.id)
                self.elastic_service.add(id=user.id, doc_data=result)
