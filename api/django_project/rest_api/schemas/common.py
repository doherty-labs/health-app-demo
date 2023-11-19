from datetime import datetime

from pydantic import BaseModel

from rest_api.schemas.user import UserSchema


class GeoPointSchema(BaseModel):
    lat: float
    lon: float


class AddressSchema(BaseModel):
    address_line_1: str
    address_line_2: str
    city: str
    state: str
    zip_code: str
    country: str
    latitude: float | None
    longitude: float | None
    full_address: str | None
    geo_point: GeoPointSchema | None


class StateLogSchema(BaseModel):
    id: int | None
    from_state: str | None
    to_state: str
    triggered_by_id: int
    triggered_by: UserSchema | None
    created_at: datetime | None
    transition_away_at: datetime | None
    transition_delta: float | None


class AssignedLogSchema(BaseModel):
    id: int | None
    created_at: datetime | None
    from_user: UserSchema | None
    to_user: UserSchema | None
    triggered_by: UserSchema | None


class CommentSchema(BaseModel):
    id: int | None
    user_id: int | None
    user: UserSchema | None
    created_at: datetime | None
    updated_at: datetime | None
    comment: str


class StateSchema(BaseModel):
    id: str
    name: str
    description: str


class ViewedLogSchema(BaseModel):
    id: int | None
    created_at: datetime | None
    viewed_by: UserSchema | None


class FeatureFlagSchema(BaseModel):
    id: int | None
    practice_id: int | None
    flag_id: str
    flag_value: bool
    created_at: datetime | None
    updated_at: datetime | None
