from datetime import datetime

from pydantic import BaseModel

from rest_api.schemas.common import (
    AddressSchema,
    AssignedLogSchema,
    CommentSchema,
    StateLogSchema,
    ViewedLogSchema,
)
from rest_api.schemas.patient import PatientElasticMapping, PatientSchema
from rest_api.schemas.user import UserElasticMapping, UserSchema


class PharmacySchema(AddressSchema):
    id: int | None
    name: str
    updated_at: datetime | None
    created_at: datetime | None


class PrescriptionLineItemSchema(BaseModel):
    id: int | None
    updated_at: datetime | None
    created_at: datetime | None
    name: str
    quantity: int


class PrescriptionAssignSchema(AssignedLogSchema):
    prescription_id: int


class PrescriptionStateLogSchema(StateLogSchema):
    prescription_id: int


class PrescriptionViewedLogSchema(ViewedLogSchema):
    prescription_id: int


class PrescriptionCommentSchema(CommentSchema):
    prescription_id: int


class PrescriptionSchema(BaseModel):
    id: int | None
    updated_at: datetime | None
    created_at: datetime | None
    items: list[PrescriptionLineItemSchema]
    pharmacy: PharmacySchema
    state: str
    patient_id: int | None
    assigned_to_id: int | None
    practice_id: int
    logs: list[PrescriptionStateLogSchema] | None
    comments: list[PrescriptionCommentSchema] | None
    assigned_to: UserSchema | None
    viewed_logs: list[PrescriptionViewedLogSchema] | None
    patient: PatientSchema | None


PrescriptionElasticMapping = {
    "properties": {
        "id": {"type": "keyword"},
        "updated_at": {"type": "date"},
        "created_at": {"type": "date"},
        "state": {"type": "keyword"},
        "patient_id": {"type": "keyword"},
        "practice_id": {"type": "keyword"},
        "assigned_to_id": {"type": "keyword"},
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
        "items": {
            "type": "nested",
            "include_in_parent": True,
            "properties": {
                "id": {"type": "keyword"},
                "updated_at": {"type": "date"},
                "created_at": {"type": "date"},
                "name": {"type": "text"},
                "quantity": {"type": "integer"},
            },
        },
        "pharmacy": {
            "type": "nested",
            "include_in_parent": True,
            "properties": {
                "id": {"type": "keyword"},
                "name": {"type": "text"},
                "address_line_1": {"type": "search_as_you_type"},
                "address_line_2": {"type": "search_as_you_type"},
                "city": {"type": "search_as_you_type"},
                "state": {"type": "search_as_you_type"},
                "zip_code": {"type": "search_as_you_type"},
                "country": {"type": "search_as_you_type"},
                "latitude": {"type": "float"},
                "longitude": {"type": "float"},
                "updated_at": {"type": "date"},
                "created_at": {"type": "date"},
            },
        },
        "logs": {
            "type": "nested",
            "include_in_parent": True,
            "properties": {
                "id": {"type": "keyword"},
                "prescription_id": {"type": "keyword"},
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
                "prescription_id": {"type": "keyword"},
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
                "prescription_id": {"type": "keyword"},
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
    }
}
