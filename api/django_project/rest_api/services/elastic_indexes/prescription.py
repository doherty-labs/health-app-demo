from rest_api.schemas.prescription import PrescriptionElasticMapping, PrescriptionSchema
from rest_api.services.elastic import ElasticSearchService
from rest_api.services.elastic_indexes.elastic_indexes import PRESCRIPTION_INDEX_NAME


class PrescriptionIndex(ElasticSearchService):
    es_index_name = PRESCRIPTION_INDEX_NAME
    pydantic_model = PrescriptionSchema
    es_index_mapping = PrescriptionElasticMapping
    es_settings = {}
