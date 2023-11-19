from rest_api.schemas.user import UserElasticMapping, UserSchema
from rest_api.services.elastic import ElasticSearchService
from rest_api.services.elastic_indexes.elastic_indexes import USER_INDEX_NAME


class UserIndex(ElasticSearchService):
    es_index_name = USER_INDEX_NAME
    pydantic_model = UserSchema
    es_index_mapping = UserElasticMapping
    es_settings = {}
