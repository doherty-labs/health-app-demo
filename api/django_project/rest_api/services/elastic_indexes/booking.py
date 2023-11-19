from rest_api.schemas.booking import BookingElasticMapping, BookingSchema
from rest_api.services.elastic import ElasticSearchService
from rest_api.services.elastic_indexes.elastic_indexes import BOOKING_INDEX_NAME


class BookingIndex(ElasticSearchService):
    es_index_name = BOOKING_INDEX_NAME
    pydantic_model = BookingSchema
    es_index_mapping = BookingElasticMapping
    es_settings = {}
