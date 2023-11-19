from unittest.mock import MagicMock

from elasticsearch import Elasticsearch
from injector import Module, provider, singleton
from opentelemetry.instrumentation.elasticsearch import ElasticsearchInstrumentor

from django_project import settings

ElasticsearchInstrumentor().instrument()


class EsModule(Module):
    @singleton
    @provider
    def elastic_server(self) -> Elasticsearch:
        if (
            settings.ELASTIC_SEARCH.get("user") is not None
            and settings.ELASTIC_SEARCH.get("user") != ""
        ):
            es = Elasticsearch(
                [str(settings.ELASTIC_SEARCH.get("host"))],
                http_auth=(
                    settings.ELASTIC_SEARCH.get("user", ""),
                    settings.ELASTIC_SEARCH.get("password", ""),
                ),
                verify_certs=False,
                max_retries=10,
                retry_on_timeout=True,
            )
        else:
            host_url = (
                "http://"
                + str(settings.ELASTIC_SEARCH.get("host"))
                + ":"
                + str(settings.ELASTIC_SEARCH.get("port"))
            )
            es = Elasticsearch([host_url], verify_certs=False)

        return es


class TestEsModule(Module):
    @singleton
    @provider
    def elastic_server(self) -> Elasticsearch:
        return MagicMock()
