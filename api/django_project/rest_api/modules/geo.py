from unittest.mock import MagicMock

from injector import Module, provider, singleton

from django_project import settings
from rest_api.services.geo import GeoPyService


class GeoModule(Module):
    @singleton
    @provider
    def geo_instance(self) -> GeoPyService:
        return GeoPyService(api_key=settings.GMAPS_API_KEY)


class TestGeoModule(Module):
    @singleton
    @provider
    def geo_instance(self) -> GeoPyService:
        mock = MagicMock()
        mock.get_location_coordinates.return_value = (1, 1)
        return mock
