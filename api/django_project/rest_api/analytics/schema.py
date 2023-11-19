from datetime import datetime

from pydantic import BaseModel


class TimeSeriesPoint(BaseModel):
    date: datetime
    value: float | int


class GroupByPoint(BaseModel):
    by: str
    value: float | int


class AppointmentAnalyticsSchema(BaseModel):
    count_by_state: list[GroupByPoint]
    overall_count: list[TimeSeriesPoint]
    avg_time_in_state: list[GroupByPoint]


class PrescriptionAnalyticsSchema(BaseModel):
    count_by_state: list[GroupByPoint]
    overall_count: list[TimeSeriesPoint]
    avg_time_in_state: list[GroupByPoint]
