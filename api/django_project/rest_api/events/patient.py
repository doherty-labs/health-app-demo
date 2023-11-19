from celery import shared_task
from celery_singleton import Singleton

from rest_api.factory.repo import GpBaseInjector


@shared_task(base=Singleton)
def update_patient_event(patient_id: int):
    from rest_api.repositories.appointment import AppointmentRepo
    from rest_api.repositories.prescription import PrescriptionRepo

    apt_repo = GpBaseInjector.get(AppointmentRepo)
    apt_repo.update_index_by_patient_id(patient_id)

    prescription_repo = GpBaseInjector.get(PrescriptionRepo)
    prescription_repo.update_index_by_patient_id(patient_id)
