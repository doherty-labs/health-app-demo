from rest_api.schemas.practice import (
    PracticeElasticSettings,
    PracticeSummaryElasticMapping,
    PracticeSummarySchema,
)
from rest_api.services.elastic import ElasticSearchService
from rest_api.services.elastic_indexes.elastic_indexes import PRACTICE_INDEX_NAME


class PracticeIndex(ElasticSearchService):
    es_index_name = PRACTICE_INDEX_NAME
    pydantic_model = PracticeSummarySchema
    es_index_mapping = PracticeSummaryElasticMapping
    es_settings = PracticeElasticSettings
