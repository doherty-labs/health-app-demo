from injector import Injector

from django_project import settings
from rest_api.modules.auth0 import Auth0Module, TestAuth0Module
from rest_api.modules.es_module import EsModule, TestEsModule
from rest_api.modules.faker.module import FakerModule
from rest_api.modules.geo import GeoModule, TestGeoModule
from rest_api.modules.notification_module import (
    NotificationModule,
    TestNotificationModule,
)
from rest_api.modules.object_storage import ObjectStorageModule, TestObjectStorageModule
from rest_api.modules.redis_module import RedisModule, TestRedisModule

GpBaseInjector = Injector(
    [
        RedisModule,
        Auth0Module,
        EsModule,
        GeoModule,
        ObjectStorageModule,
        NotificationModule,
        FakerModule,
    ]
)

TestGpBaseInjector = Injector(
    [
        TestRedisModule,
        TestAuth0Module,
        TestEsModule,
        TestGeoModule,
        TestObjectStorageModule,
        TestNotificationModule,
        FakerModule,
    ]
)

if settings.TESTING:
    GpBaseInjector = TestGpBaseInjector
