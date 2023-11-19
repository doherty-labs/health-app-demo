from django.core.management.base import BaseCommand

from rest_api.tasks.elastic import task_fail_always_test


class Command(BaseCommand):
    def handle(self, *args, **options):
        task_fail_always_test.apply_async()
        self.stdout.write(self.style.SUCCESS("Task fail trigger"))
