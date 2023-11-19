from rest_framework.exceptions import NotFound

from rest_api.models.patient import PatientModel
from rest_api.models.practice import PracticeModel
from rest_api.models.practice_items import PracticeOrgLinkModel
from rest_api.models.staff import StaffModel


def convert_user_id_to_staff_id(user_id: int) -> int:
    patient = StaffModel.objects.filter(user_id=user_id).first()
    if not patient:
        raise NotFound
    return patient.id


def convert_user_id_to_patient_id(user_id: int) -> int:
    patient = PatientModel.objects.filter(user_id=user_id).first()
    if not patient:
        raise NotFound
    return patient.id


def convert_patient_id_to_user_id(patient_id: int) -> int:
    patient = PatientModel.objects.filter(id=patient_id).first()
    if not patient:
        raise NotFound
    return patient.user.id


def convert_practice_slug_to_id(slug: str) -> int:
    practice = PracticeModel.objects.filter(slug=slug).first()
    if not practice:
        raise NotFound
    return practice.id


def convert_org_id_to_practice(org_id: str) -> PracticeModel | None:
    org = PracticeOrgLinkModel.objects.filter(org_id=org_id).first()
    return org.practice if org else None


def get_patient_id_or_none(user_id: int) -> int | None:
    patient = PatientModel.objects.filter(user_id=user_id).first()
    if not patient:
        return None
    return patient.id
