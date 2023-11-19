from rest_framework.permissions import SAFE_METHODS, BasePermission

from rest_api.models.patient import PatientModel
from rest_api.models.practice import PracticeModel
from rest_api.models.staff import StaffModel
from rest_api.utils.request_handler import get_request_meta_data


class PatientPermissionReadWrite(BasePermission):
    def has_object_permission(self, request, view, obj):
        meta = get_request_meta_data(request=request)

        if hasattr(obj, "patient"):
            return obj.patient.id == meta.patient_id

        if hasattr(obj, "appointment"):
            return obj.appointment.patient.id == meta.patient_id

        if hasattr(obj, "id") and isinstance(obj, PatientModel):
            return obj.id == meta.patient_id

        return False

    def has_permission(self, request, view):
        meta = get_request_meta_data(request=request)
        return meta.patient_id is not None


class PatientPermissionReadOnly(PatientPermissionReadWrite):
    def has_permission(self, request, view):
        meta = get_request_meta_data(request=request)
        return meta.patient_id is not None and meta.method in SAFE_METHODS


class StaffPermission(BasePermission):
    def has_object_permission(self, request, view, obj):
        meta = get_request_meta_data(request=request)
        if hasattr(obj, "practice"):
            return meta.practice_id == obj.practice.id

        if hasattr(obj, "appointment"):
            return meta.practice_id == obj.appointment.practice.id

        if isinstance(obj, StaffModel):
            return obj.id == meta.staff_id

        if isinstance(obj, PracticeModel):
            return obj.id == meta.practice_id

        return False

    def has_permission(self, request, view):
        meta = get_request_meta_data(request=request)
        return meta.staff_id is not None
