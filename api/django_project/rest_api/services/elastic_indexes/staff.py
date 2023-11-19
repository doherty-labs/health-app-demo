from rest_api.schemas.staff import StaffMemberElasticMapping, StaffMemberSchema
from rest_api.services.elastic import ElasticSearchService
from rest_api.services.elastic_indexes.elastic_indexes import STAFF_INDEX_NAME


class StaffIndex(ElasticSearchService):
    es_index_name = STAFF_INDEX_NAME
    pydantic_model = StaffMemberSchema
    es_index_mapping = StaffMemberElasticMapping
    es_settings = {}
