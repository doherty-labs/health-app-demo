from unittest.mock import MagicMock

import boto3
from injector import Module, provider, singleton

from django_project import settings
from rest_api.services.s3 import ObjectStorageService


class ObjectStorageModule(Module):
    @singleton
    @provider
    def get_instance(self) -> ObjectStorageService:
        client = boto3.client(
            "s3",
            aws_access_key_id=settings.BUCKET_KEY,
            aws_secret_access_key=settings.BUCKET_SECRET,
            endpoint_url=settings.BUCKET_ENDPOINT,
            region_name=settings.BUCKET_REGION,
        )
        return ObjectStorageService(bucket_name=settings.BUCKET_NAME, s3_client=client)


class TestObjectStorageModule(Module):
    @singleton
    @provider
    def get_instance(self) -> ObjectStorageService:
        return MagicMock()
