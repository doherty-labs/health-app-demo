from datetime import date, datetime

from pydantic import BaseModel

from rest_api.schemas.common import AddressSchema, FeatureFlagSchema


class OpeningHourSchema(BaseModel):
    id: int | None
    day_of_week: int
    start_time: str | None
    end_time: str | None
    is_closed: bool
    updated_at: datetime | None
    created_at: datetime | None


class OpeningTimeExceptionSchema(BaseModel):
    id: int | None
    start_datetime: date | None
    end_datetime: date | None
    is_closed: bool
    reason: str
    updated_at: datetime | None
    created_at: datetime | None


class ContactOptionSchema(BaseModel):
    id: int | None
    name: str
    value: str
    href_type: str
    updated_at: datetime | None
    created_at: datetime | None


class NoticeSchema(BaseModel):
    id: int | None
    title: str
    description_markdown: str
    updated_at: datetime | None
    created_at: datetime | None


class TeamMemberSchema(BaseModel):
    id: int | None
    first_name: str
    last_name: str
    job_title: str
    bio: str | None
    updated_at: datetime | None
    created_at: datetime | None


class AdminUserSchema(BaseModel):
    email: str
    forename: str
    surname: str


class PracticeSummarySchema(AddressSchema):
    id: int | None
    org_id: str | None
    staff_id: str | None
    name: str
    slug: str | None
    team_members: list[TeamMemberSchema]
    notices: list[NoticeSchema]
    contact_options: list[ContactOptionSchema]
    opening_hours: list[OpeningHourSchema]
    opening_time_exceptions: list[OpeningTimeExceptionSchema]
    feature_flags: list[FeatureFlagSchema]
    updated_at: datetime | None
    created_at: datetime | None


PracticeElasticSettings: dict = {}

PracticeSummaryElasticMapping = {
    "properties": {
        "id": {"type": "keyword"},
        "org_id": {"type": "keyword"},
        "staff_id": {"type": "keyword"},
        "name": {"type": "search_as_you_type"},
        "slug": {"type": "keyword"},
        "address_line_1": {"type": "search_as_you_type"},
        "address_line_2": {"type": "search_as_you_type"},
        "city": {"type": "search_as_you_type"},
        "state": {"type": "search_as_you_type"},
        "zip_code": {"type": "search_as_you_type"},
        "country": {"type": "search_as_you_type"},
        "latitude": {"type": "float"},
        "longitude": {"type": "float"},
        "full_address": {
            "type": "search_as_you_type",
        },
        "geo_point": {
            "type": "geo_point",
            "ignore_malformed": True,
            "null_value": None,
        },
        "team_members": {
            "type": "nested",
            "include_in_parent": True,
            "properties": {
                "id": {"type": "keyword"},
                "first_name": {"type": "text"},
                "last_name": {"type": "text"},
                "job_title": {"type": "text"},
                "bio": {"type": "text"},
                "updated_at": {"type": "date"},
                "created_at": {"type": "date"},
            },
        },
        "notices": {
            "type": "nested",
            "include_in_parent": True,
            "properties": {
                "id": {"type": "keyword"},
                "title": {"type": "text"},
                "description_markdown": {"type": "text"},
                "updated_at": {"type": "date"},
                "created_at": {"type": "date"},
            },
        },
        "contact_options": {
            "type": "nested",
            "include_in_parent": True,
            "properties": {
                "id": {"type": "keyword"},
                "name": {"type": "text"},
                "value": {"type": "text"},
                "href_type": {"type": "keyword"},
                "updated_at": {"type": "date"},
                "created_at": {"type": "date"},
            },
        },
        "opening_hours": {
            "type": "nested",
            "include_in_parent": True,
            "properties": {
                "id": {"type": "keyword"},
                "day_of_week": {"type": "integer"},
                "start_time": {"type": "keyword"},
                "end_time": {"type": "keyword"},
                "is_closed": {"type": "boolean"},
                "updated_at": {"type": "date"},
                "created_at": {"type": "date"},
            },
        },
        "opening_time_exceptions": {
            "type": "nested",
            "include_in_parent": True,
            "properties": {
                "id": {"type": "keyword"},
                "start_datetime": {"type": "date"},
                "end_datetime": {"type": "date"},
                "is_closed": {"type": "boolean"},
                "reason": {"type": "text"},
                "updated_at": {"type": "date"},
                "created_at": {"type": "date"},
            },
        },
        "feature_flags": {
            "type": "nested",
            "include_in_parent": True,
            "properties": {
                "id": {"type": "keyword"},
                "practice_id": {"type": "keyword"},
                "flag_id": {"type": "keyword"},
                "flag_value": {"type": "boolean"},
                "updated_at": {"type": "date"},
                "created_at": {"type": "date"},
            },
        },
        "updated_at": {"type": "date"},
        "created_at": {"type": "date"},
    }
}
