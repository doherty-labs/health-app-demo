from pydantic import BaseModel
from rest_framework.request import Request

from django_project.auth_utils import jwt_decode_token
from rest_api.models.patient import PatientModel
from rest_api.models.staff import StaffModel
from rest_api.repositories.utils import convert_org_id_to_practice


class RequestMetaData(BaseModel):
    practice_id: int | None
    patient_id: int | None
    staff_id: int | None
    user_id: int | None
    org_id: str | None
    token: str | None
    method: str


def get_request_meta_data(request: Request) -> RequestMetaData:
    token = request.META.get("HTTP_AUTHORIZATION", None).split(" ")[1]
    decoded = jwt_decode_token(token)
    org_id = decoded.get("org_id", None)
    user_id = request.user.id
    user_practice = None
    if org_id:
        user_practice = convert_org_id_to_practice(org_id)

    patient = PatientModel.objects.filter(user_id=user_id).first()
    staff = StaffModel.objects.filter(user_id=user_id).first()

    return RequestMetaData(
        user_id=user_id,
        org_id=org_id,
        practice_id=user_practice.id if user_practice else None,
        patient_id=patient.id if patient else None,
        staff_id=staff.id if staff else None,
        token=token,
        method=request.method,
    )
