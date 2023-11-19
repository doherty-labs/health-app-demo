from unittest.mock import MagicMock

from injector import Module, provider, singleton
from redis import Redis

from django_project import settings


class RedisModule(Module):
    @singleton
    @provider
    def get_instance(self) -> Redis:
        url = settings.CELERY_RESULT_BACKEND
        return Redis.from_url(url)


class TestRedisModule(Module):
    @singleton
    @provider
    def get_instance(self) -> Redis:
        return MagicMock()
