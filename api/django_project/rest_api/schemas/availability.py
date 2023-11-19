from datetime import datetime

from pydantic import BaseModel


class TeamMemberSchema(BaseModel):
    id: int | None
    first_name: str
    last_name: str
    job_title: str
    bio: str | None
    created_at: datetime | None
    updated_at: datetime | None


class AvailableAppointmentSchema(BaseModel):
    id: int | None
    staff_id: str
    practice_id: int
    team_member_id: int
    start_time: datetime
    end_time: datetime
    schedule_release_time: datetime | None
    team_member: TeamMemberSchema | None
    created_at: datetime | None
    updated_at: datetime | None


AvailabilityElasticMapping = {
    "properties": {
        "id": {"type": "keyword"},
        "staff_id": {"type": "keyword"},
        "practice_id": {"type": "keyword"},
        "team_member_id": {"type": "keyword"},
        "start_time": {"type": "date"},
        "end_time": {"type": "date"},
        "schedule_release_time": {"type": "date"},
        "created_at": {"type": "date"},
        "updated_at": {"type": "date"},
        "team_member": {
            "type": "nested",
            "include_in_parent": True,
            "properties": {
                "id": {"type": "keyword"},
                "first_name": {"type": "text"},
                "last_name": {"type": "text"},
                "job_title": {"type": "text"},
                "bio": {"type": "text"},
                "created_at": {"type": "date"},
                "updated_at": {"type": "date"},
            },
        },
    }
}
