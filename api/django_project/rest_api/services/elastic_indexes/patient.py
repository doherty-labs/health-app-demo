from rest_api.schemas.patient import PatientElasticMapping, PatientSchema
from rest_api.services.elastic import ElasticSearchService
from rest_api.services.elastic_indexes.elastic_indexes import PATIENT_INDEX_NAME


class PatientIndex(ElasticSearchService):
    es_index_name = PATIENT_INDEX_NAME
    pydantic_model = PatientSchema
    es_index_mapping = PatientElasticMapping
    es_settings = {}
