from datetime import datetime

from pydantic import BaseModel

from rest_api.schemas.appointment import AppointmentElasticMapping, AppointmentSchema
from rest_api.schemas.availability import (
    AvailabilityElasticMapping,
    AvailableAppointmentSchema,
)
from rest_api.schemas.staff import StaffMemberElasticMapping, StaffMemberSchema
from rest_api.schemas.user import UserElasticMapping, UserSchema


class BookingInviteSchema(BaseModel):
    id: int | None
    appointment_id: int
    appointment: AppointmentSchema | None
    practice_id: int
    staff_id: int
    staff: StaffMemberSchema | None
    can_book: bool | None
    created_at: datetime | None
    updated_at: datetime | None


class BookingSchema(BaseModel):
    id: int | None
    appointment_id: int
    appointment: AppointmentSchema | None
    available_appointment_id: int
    available_appointment: AvailableAppointmentSchema | None
    invitation_id: int | None
    invitation: BookingInviteSchema | None
    booked_by_id: int
    booked_by: UserSchema | None
    attendance_status: str | None
    created_at: datetime | None
    updated_at: datetime | None


BookingElasticMapping = {
    "properties": {
        "id": {"type": "keyword"},
        "appointment_id": {"type": "keyword"},
        "appointment": {
            "type": "nested",
            "properties": AppointmentElasticMapping["properties"],
            "include_in_parent": True,
        },
        "available_appointment_id": {"type": "keyword"},
        "available_appointment": {
            "type": "nested",
            "properties": AvailabilityElasticMapping["properties"],
            "include_in_parent": True,
        },
        "invitation_id": {"type": "keyword"},
        "invitation": {
            "type": "nested",
            "properties": {
                "id": {"type": "keyword"},
                "appointment_id": {"type": "keyword"},
                "appointment": {
                    "type": "nested",
                    "properties": AppointmentElasticMapping["properties"],
                    "include_in_parent": True,
                },
                "staff_id": {"type": "keyword"},
                "staff": {
                    "type": "nested",
                    "properties": StaffMemberElasticMapping["properties"],
                    "include_in_parent": True,
                },
                "practice_id": {"type": "keyword"},
                "created_at": {"type": "date"},
                "updated_at": {"type": "date"},
            },
        },
        "created_at": {"type": "date"},
        "updated_at": {"type": "date"},
        "booked_by_id": {"type": "keyword"},
        "booked_by": {
            "type": "nested",
            "properties": UserElasticMapping["properties"],
            "include_in_parent": True,
        },
        "attendance_status": {"type": "keyword"},
    }
}
