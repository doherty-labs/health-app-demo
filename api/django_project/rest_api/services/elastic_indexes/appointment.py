from rest_api.schemas.appointment import AppointmentElasticMapping, AppointmentSchema
from rest_api.services.elastic import ElasticSearchService
from rest_api.services.elastic_indexes.elastic_indexes import APPOINTMENT_INDEX_NAME


class AppointmentIndex(ElasticSearchService):
    es_index_name = APPOINTMENT_INDEX_NAME
    pydantic_model = AppointmentSchema
    es_index_mapping = AppointmentElasticMapping
    es_settings = {}
