import json
import uuid
from functools import wraps
from typing import Any, Callable, Generic, TypeVar, cast

from elasticsearch import Elasticsearch, helpers
from injector import Inject
from pydantic import BaseModel
from redis import Redis

FuncT = TypeVar("FuncT", bound=Callable[..., Any])
ElasticPydanticModel = TypeVar("ElasticPydanticModel", bound=BaseModel)


class ElasticSearchService(Generic[ElasticPydanticModel]):
    es_index_name: str
    pydantic_model: ElasticPydanticModel
    es_index_mapping: dict
    es_settings: dict

    def __init__(
        self,
        es: Inject[Elasticsearch],
        redis: Inject[Redis],
    ):
        self.es = es
        self.redis = redis
        self.lock = self.redis.lock(
            f"{self.es_index_name}_index_lock", timeout=60 * 60 * 2
        )

    @staticmethod
    def index_check_decorator(func: FuncT) -> FuncT:
        @wraps(func)
        def wrapper(self, *args, **kwargs):
            if not self.check_index_exists():
                self.create_index()
            return func(self, *args, **kwargs)

        return cast(FuncT, wrapper)

    @property
    def read_name(self) -> str:
        return self.es_index_name

    @property
    def write_name(self) -> str:
        return self.es_index_name + ".write"

    def get_new_index_name(self):
        guid = str(uuid.uuid4())
        return f"{self.es_index_name}_{guid}"

    def get_index_names_with_alias(self, alias) -> list[str]:
        return list(self.es.indices.get_alias(name=alias).keys())

    def create_index(self):
        index_name = self.get_new_index_name()
        result = self.es.indices.create(
            index=index_name, mappings=self.es_index_mapping, settings=self.es_settings
        )
        self.es.indices.update_aliases(
            actions=[
                {
                    "add": {
                        "index": index_name,
                        "alias": self.read_name,
                    }
                },
                {
                    "add": {
                        "index": index_name,
                        "alias": self.write_name,
                    }
                },
            ]
        )
        return result

    def begin_migration(self):
        self.lock.acquire(blocking=True)
        new_index_name = self.get_new_index_name()
        self.es.indices.create(
            index=new_index_name,
            mappings=self.es_index_mapping,
            settings=self.es_settings,
        )
        actions = [
            {
                "add": {
                    "index": new_index_name,
                    "alias": self.write_name,
                }
            },
        ]
        current_index_names = self.get_index_names_with_alias(self.write_name)
        for index_name in current_index_names:
            actions.append(
                {
                    "remove": {
                        "index": index_name,
                        "alias": self.write_name,
                    }
                }
            )
        self.es.indices.update_aliases(actions=actions)

    def end_migration(self):
        action = []
        current_index_names = self.get_index_names_with_alias(self.read_name)
        for index_name in current_index_names:
            action.append(
                {
                    "remove": {
                        "index": index_name,
                        "alias": self.read_name,
                    }
                }
            )

        migrated_index_names = self.get_index_names_with_alias(self.write_name)
        for index_name in migrated_index_names:
            action.append(
                {
                    "add": {
                        "index": index_name,
                        "alias": self.read_name,
                    }
                }
            )

        self.es.indices.update_aliases(actions=action)
        for index_name in current_index_names:
            self.es.indices.delete(index=index_name, ignore_unavailable=True)

        self.refresh_index()
        self.lock.release()

    def handle_migration_exception(self):
        action = []
        new_index_names = self.get_index_names_with_alias(self.write_name)
        for index_name in new_index_names:
            action.append(
                {
                    "remove": {
                        "index": index_name,
                        "alias": self.write_name,
                    }
                }
            )

        current_index_names = self.get_index_names_with_alias(self.read_name)
        for index_name in current_index_names:
            action.append(
                {
                    "add": {
                        "index": index_name,
                        "alias": self.write_name,
                    }
                }
            )

        self.es.indices.update_aliases(actions=action)
        for index_name in new_index_names:
            self.es.indices.delete(index=index_name, ignore_unavailable=True)

        self.lock.release()

    def update_index_mapping(self):
        return self.es.indices.put_mapping(
            index=self.write_name,
            body=self.es_index_mapping,
        )

    def delete_index(self):
        return self.es.indices.delete(index=self.write_name, ignore_unavailable=True)

    def check_index_exists(self):
        return self.es.indices.exists(index=self.write_name)

    def refresh_index(self):
        return self.es.indices.refresh(index=self.write_name)

    @index_check_decorator
    def add(self, id: str, doc_data: ElasticPydanticModel):
        if not self.es.exists(index=self.write_name, id=id):
            return self.es.index(
                index=self.write_name,
                id=id,
                document=doc_data.dict(),
                refresh=True,
            )

    @index_check_decorator
    def remove(self, id):
        if self.es.exists(index=self.write_name, id=id):
            return self.es.delete(index=self.write_name, id=id, refresh=True)

    @index_check_decorator
    def get(self, id) -> ElasticPydanticModel | None:
        res = self.es.get(index=self.read_name, id=id)["_source"]
        if res:
            return self.pydantic_model.parse_obj(**res)
        return None

    @index_check_decorator
    def update(self, id, doc_data: ElasticPydanticModel):
        return self.es.update(
            index=self.write_name,
            id=id,
            doc=doc_data.dict(),
            refresh=True,
            doc_as_upsert=True,
        )

    @index_check_decorator
    def search(
        self,
        query: dict | None = None,
        size: int | None = None,
        suggest: dict | None = None,
        aggs: dict | None = None,
    ):
        return self.es.search(
            index=self.read_name, query=query, suggest=suggest, size=size, aggs=aggs
        )

    def bulk_add_docs(self, documents: list[ElasticPydanticModel]) -> int:
        actions = []
        for doc in documents:
            data_dict = doc.dict()
            actions.append(
                {
                    "_index": self.write_name,
                    "_op_type": "create",
                    "_id": data_dict.get("id"),
                    "_source": doc.dict(),
                }
            )
        success_count, fails = helpers.bulk(self.es, actions)
        if isinstance(fails, list) and len(fails) > 0:
            raise Exception(f"Failed to bulk add docs: {json.dumps(fails)}")
        return success_count
