from rest_api.schemas.availability import (
    AvailabilityElasticMapping,
    AvailableAppointmentSchema,
)
from rest_api.services.elastic import ElasticSearchService
from rest_api.services.elastic_indexes.elastic_indexes import AVAILABILITY_INDEX_NAME


class AvailabilityIndex(ElasticSearchService):
    es_index_name = AVAILABILITY_INDEX_NAME
    pydantic_model = AvailableAppointmentSchema
    es_index_mapping = AvailabilityElasticMapping
    es_settings = {}
