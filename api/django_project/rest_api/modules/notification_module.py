from unittest.mock import MagicMock

from injector import Module, provider, singleton

from django_project import settings
from rest_api.services.notification import NotificationService


class NotificationModule(Module):
    @singleton
    @provider
    def notf_instance(self) -> NotificationService:
        return NotificationService(
            mail_gun_key=settings.MAILGUN_API_KEY,
            mail_gun_domain=settings.MAILGUN_DOMAIN,
        )


class TestNotificationModule(Module):
    @singleton
    @provider
    def notf_instance(self) -> NotificationService:
        return MagicMock()
