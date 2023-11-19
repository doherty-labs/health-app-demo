from datetime import date, datetime

from pydantic import BaseModel

from rest_api.schemas.common import AddressSchema


class PatientPracticeLinkSchema(BaseModel):
    id: int | None
    patient_id: int
    practice_id: int
    created_at: datetime | None


class PatientDocumentSchema(BaseModel):
    id: int | None
    download_url: str
    is_id: bool
    is_proof_of_address: bool
    state: str | None
    uploaded_at: datetime | None


class PatientSchema(AddressSchema):
    id: int | None
    user_id: int | None
    first_name: str
    last_name: str
    full_name: str | None
    email: str
    phone: str
    date_of_birth: date
    gender: str
    health_care_number: str | None
    documents: list[PatientDocumentSchema] | None
    practice_links: list[PatientPracticeLinkSchema] | None


PatientElasticMapping = {
    "properties": {
        "id": {"type": "keyword"},
        "user_id": {"type": "keyword"},
        "first_name": {"type": "text"},
        "last_name": {"type": "text"},
        "full_name": {"type": "search_as_you_type"},
        "email": {"type": "text"},
        "phone": {"type": "text"},
        "date_of_birth": {"type": "date"},
        "gender": {"type": "keyword"},
        "health_care_number": {"type": "keyword"},
        "address_line_1": {"type": "search_as_you_type"},
        "address_line_2": {"type": "search_as_you_type"},
        "full_address": {"type": "search_as_you_type"},
        "geo_point": {
            "type": "geo_point",
            "ignore_malformed": True,
            "null_value": None,
        },
        "city": {"type": "search_as_you_type"},
        "state": {"type": "search_as_you_type"},
        "zip_code": {"type": "search_as_you_type"},
        "country": {"type": "search_as_you_type"},
        "latitude": {"type": "float"},
        "longitude": {"type": "float"},
        "documents": {
            "type": "nested",
            "include_in_parent": True,
            "properties": {
                "id": {"type": "keyword"},
                "download_url": {"type": "text"},
                "is_id": {"type": "boolean"},
                "is_proof_of_address": {"type": "boolean"},
                "state": {"type": "keyword"},
                "uploaded_at": {"type": "date"},
            },
        },
        "practice_links": {
            "type": "nested",
            "include_in_parent": True,
            "properties": {
                "id": {"type": "keyword"},
                "patient_id": {"type": "keyword"},
                "practice_id": {"type": "keyword"},
                "created_at": {"type": "date"},
            },
        },
    }
}
