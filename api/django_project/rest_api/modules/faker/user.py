from faker.providers import BaseProvider

from rest_api.schemas.user import UserSchema


class UserProvider(BaseProvider):
    def get_user(self) -> UserSchema:
        return UserSchema(
            first_name=self.generator.first_name(),
            last_name=self.generator.last_name(),
            email=self.generator.email(),
        )
