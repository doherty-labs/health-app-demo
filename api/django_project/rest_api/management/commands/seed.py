from django.core.management.base import BaseCommand

from rest_api.factory.repo import GpBaseInjector
from rest_api.services.seed_data import SeedData


class Command(BaseCommand):
    help = "Seed practice with patients, staff, appointments, prescriptions"

    def add_arguments(self, parser):
        parser.add_argument("practice_id", nargs="+", type=int)

    def handle(self, *args, **options) -> None:
        repo: SeedData = GpBaseInjector.get(SeedData)
        for practice_id in options["practice_id"]:
            repo.seed_env(practice_id)
        self.stdout.write(self.style.SUCCESS("Triggered seed_data_task"))
