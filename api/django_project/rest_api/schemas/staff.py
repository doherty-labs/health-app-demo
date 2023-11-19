from pydantic import BaseModel


class StaffMemberSchema(BaseModel):
    id: int | None
    user_id: int
    practice_id: int | None
    first_name: str
    last_name: str
    full_name: str | None
    email: str
    job_title: str
    bio: str | None


StaffMemberElasticMapping = {
    "properties": {
        "id": {"type": "keyword"},
        "user_id": {"type": "keyword"},
        "practice_id": {"type": "keyword"},
        "first_name": {"type": "text"},
        "full_name": {
            "type": "search_as_you_type",
        },
        "last_name": {"type": "text"},
        "email": {"type": "keyword"},
        "job_title": {"type": "text"},
        "bio": {"type": "text"},
    }
}
