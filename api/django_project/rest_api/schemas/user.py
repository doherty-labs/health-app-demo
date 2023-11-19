from pydantic import BaseModel


class UserSchema(BaseModel):
    id: int | None
    first_name: str
    last_name: str
    full_name: str | None
    email: str


UserElasticMapping = {
    "properties": {
        "id": {"type": "keyword"},
        "first_name": {"type": "text"},
        "full_name": {"type": "search_as_you_type"},
        "last_name": {"type": "text"},
        "email": {"type": "keyword"},
    }
}
