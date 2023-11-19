from faker.providers import BaseProvider

from rest_api.schemas.staff import StaffMemberSchema
from rest_api.schemas.user import UserSchema


class StaffProvider(BaseProvider):
    def get_staff(
        self, user_id: int, practice_id: int, user: UserSchema
    ) -> StaffMemberSchema:
        return StaffMemberSchema(
            bio=self.generator.paragraph(),
            email=user.email,
            first_name=user.first_name,
            last_name=user.last_name,
            job_title=self.generator.job(),
            practice_id=practice_id,
            user_id=user_id,
        )
