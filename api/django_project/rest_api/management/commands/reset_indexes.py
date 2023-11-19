from django.core.management.base import BaseCommand

from rest_api.tasks.elastic import full_es_reset


class Command(BaseCommand):
    def handle(self, *args, **options):
        full_es_reset.apply_async()
        self.stdout.write(self.style.SUCCESS("Reseted indexes successfully"))
