from celery import group, shared_task
from celery_singleton import Singleton
from elasticsearch import Elasticsearch

from rest_api.factory.repo import GpBaseInjector
from rest_api.repositories.appointment import AppointmentRepo
from rest_api.repositories.availability import AvailabilityRepo
from rest_api.repositories.booking import BookingRepo
from rest_api.repositories.patient import PatientRepo
from rest_api.repositories.practice import PracticeRepo
from rest_api.repositories.prescription import PrescriptionRepo


@shared_task(base=Singleton)
def recreate_practice_index():
    repo = GpBaseInjector.get(PracticeRepo)
    repo.recreate_index()


@shared_task(base=Singleton)
def recreate_appointment_index():
    repo = GpBaseInjector.get(AppointmentRepo)
    repo.recreate_index()


@shared_task(base=Singleton)
def recreate_patient_index():
    repo = GpBaseInjector.get(PatientRepo)
    repo.recreate_index()


@shared_task(base=Singleton)
def recreate_prescription_index():
    repo = GpBaseInjector.get(PrescriptionRepo)
    repo.recreate_index()


@shared_task(base=Singleton)
def recreate_availability_index():
    repo = GpBaseInjector.get(AvailabilityRepo)
    repo.recreate_index()


@shared_task(base=Singleton)
def recreate_booking_index():
    repo = GpBaseInjector.get(BookingRepo)
    repo.recreate_index()


@shared_task(base=Singleton)
def recreate_all_indices():
    practice_sig = recreate_practice_index.s()
    appointment_sig = recreate_appointment_index.s()
    patient_sig = recreate_patient_index.s()
    prescription_sig = recreate_prescription_index.s()
    availability_sig = recreate_availability_index.s()
    booking_sig = recreate_booking_index.s()
    group(
        [
            practice_sig,
            appointment_sig,
            patient_sig,
            prescription_sig,
            availability_sig,
            booking_sig,
        ]
    ).apply_async()


@shared_task(base=Singleton)
def full_es_reset():
    es = GpBaseInjector.get(Elasticsearch)
    aliases = es.indices.get_alias(name="*").keys()
    for alias in aliases:
        es.indices.delete(index=alias, ignore_unavailable=True)
    recreate_all_indices.delay()


@shared_task(base=Singleton)
def task_fail_always_test():
    raise Exception("I always fail")
