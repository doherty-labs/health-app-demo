from datetime import datetime

from pydantic import BaseModel

from rest_api.schemas.common import (
    AssignedLogSchema,
    CommentSchema,
    StateLogSchema,
    ViewedLogSchema,
)
from rest_api.schemas.patient import PatientElasticMapping, PatientSchema
from rest_api.schemas.user import UserElasticMapping, UserSchema


class PatientDocumentSchema(BaseModel):
    id: int | None
    download_url: str
    uploaded_at: datetime | None


class AppointmentAssignSchema(AssignedLogSchema):
    appointment_id: int


class AppointmentStateLogSchema(StateLogSchema):
    appointment_id: int


class AppointmentViewedLogSchema(ViewedLogSchema):
    appointment_id: int


class AppointmentCommentSchema(CommentSchema):
    appointment_id: int


class AppointmentSchema(BaseModel):
    id: int | None
    symptoms: str
    symptom_category: str
    symptoms_duration_seconds: int
    priority: int | None
    state: str | None
    patient_id: int
    practice_id: int
    assigned_to_id: int | None
    documents: list[PatientDocumentSchema] | None
    logs: list[AppointmentStateLogSchema] | None
    comments: list[AppointmentCommentSchema] | None
    assign_history: list[AppointmentAssignSchema] | None
    created_at: datetime | None
    updated_at: datetime | None
    patient: PatientSchema | None
    assigned_to: UserSchema | None
    viewed_logs: list[AppointmentViewedLogSchema] | None


AppointmentElasticMapping = {
    "properties": {
        "id": {"type": "keyword"},
        "patient_id": {"type": "keyword"},
        "practice_id": {"type": "keyword"},
        "assigned_to_id": {"type": "keyword"},
        "created_at": {"type": "date"},
        "updated_at": {"type": "date"},
        "documents": {
            "type": "nested",
            "include_in_parent": True,
            "properties": {
                "id": {"type": "keyword"},
                "download_url": {"type": "text"},
                "uploaded_at": {"type": "date"},
            },
        },
        "logs": {
            "type": "nested",
            "include_in_parent": True,
            "properties": {
                "id": {"type": "keyword"},
                "appointment_id": {"type": "keyword"},
                "from_state": {"type": "keyword"},
                "to_state": {"type": "keyword"},
                "triggered_by_id": {"type": "keyword"},
                "created_at": {"type": "date"},
                "transition_away_at": {"type": "date"},
                "transition_delta": {"type": "float"},
            },
        },
        "comments": {
            "type": "nested",
            "include_in_parent": True,
            "properties": {
                "id": {"type": "keyword"},
                "appointment_id": {"type": "keyword"},
                "user_id": {"type": "keyword"},
                "comment": {"type": "text"},
                "created_at": {"type": "date"},
                "updated_at": {"type": "date"},
                "user": {
                    "type": "nested",
                    "include_in_parent": True,
                    "properties": UserElasticMapping["properties"],
                },
            },
        },
        "viewed_logs": {
            "type": "nested",
            "include_in_parent": True,
            "properties": {
                "id": {"type": "keyword"},
                "appointment_id": {"type": "keyword"},
                "created_at": {"type": "date"},
                "viewed_by": {
                    "type": "nested",
                    "include_in_parent": True,
                    "properties": UserElasticMapping["properties"],
                },
            },
        },
        "assign_history": {
            "type": "nested",
            "include_in_parent": True,
            "properties": {
                "id": {"type": "keyword"},
                "created_at": {"type": "date"},
                "from_user": {
                    "type": "nested",
                    "include_in_parent": True,
                    "properties": UserElasticMapping["properties"],
                },
                "to_user": {
                    "type": "nested",
                    "include_in_parent": True,
                    "properties": UserElasticMapping["properties"],
                },
                "triggered_by": {
                    "type": "nested",
                    "include_in_parent": True,
                    "properties": UserElasticMapping["properties"],
                },
            },
        },
        "symptoms": {"type": "text"},
        "symptom_category": {"type": "keyword"},
        "symptoms_duration_seconds": {"type": "integer"},
        "priority": {"type": "integer"},
        "state": {"type": "keyword"},
        "patient": {
            "type": "nested",
            "include_in_parent": True,
            "properties": PatientElasticMapping["properties"],
        },
        "assigned_to": {
            "type": "nested",
            "include_in_parent": True,
            "properties": UserElasticMapping["properties"],
        },
    }
}
