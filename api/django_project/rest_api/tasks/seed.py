from celery import shared_task
from celery_singleton import Singleton

from rest_api.factory.repo import GpBaseInjector
from rest_api.services.seed_data import SeedData


@shared_task(base=Singleton)
def seed_data_task():
    repo = GpBaseInjector.get(SeedData)
    repo.seed_env()
