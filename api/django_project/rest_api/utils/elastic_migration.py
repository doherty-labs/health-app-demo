from rest_api.services.elastic import ElasticSearchService


class ElasticMigration:
    def __init__(self, es_service: ElasticSearchService) -> None:
        self.es_service = es_service

    def __enter__(self):
        self.es_service.begin_migration()

    def __exit__(self, exc_type, exc_value, traceback):
        if exc_type is not None:
            self.es_service.handle_migration_exception()
        else:
            self.es_service.end_migration()
