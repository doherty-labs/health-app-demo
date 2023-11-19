from abc import abstractmethod
from typing import Generic, TypeVar

from pydantic import BaseModel

from rest_api.services.elastic import ElasticSearchService

PydanticType = TypeVar("PydanticType", bound=BaseModel)


class CommonModelRepo(Generic[PydanticType]):
    pydantic_model: PydanticType
    es_instance: ElasticSearchService

    def __init__(
        self,
        es_instance: ElasticSearchService,
    ):
        self.es_instance = es_instance

    @abstractmethod
    def get(self, id: int) -> PydanticType:
        pass

    @abstractmethod
    def create(self, data: PydanticType) -> PydanticType:
        pass

    @abstractmethod
    def update(self, id: int, data: PydanticType) -> PydanticType:
        pass

    @abstractmethod
    def delete(self, id: int):
        pass
