from django.core.management.base import BaseCommand

from rest_api.tasks.elastic import recreate_all_indices


class Command(BaseCommand):
    def handle(self, *args, **options):
        recreate_all_indices.apply_async()
        self.stdout.write(self.style.SUCCESS("Recreated indexes successfully"))
