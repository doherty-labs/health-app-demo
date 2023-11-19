from datetime import datetime

from pydantic import BaseModel


class ReviewSchema(BaseModel):
    id: int | None
    practice_id: int
    patient_id: int
    patient_name: str | None
    title: str
    review: str
    rating: int
    updated_at: datetime | None
    created_at: datetime | None


ReviewElasticMapping = {
    "properties": {
        "id": {"type": "keyword"},
        "practice_id": {"type": "keyword"},
        "patient_id": {"type": "keyword"},
        "patient_name": {"type": "text"},
        "title": {"type": "text"},
        "review": {"type": "text"},
        "rating": {"type": "integer"},
        "updated_at": {"type": "date"},
        "created_at": {"type": "date"},
    }
}
