from faker.providers import BaseProvider

from rest_api.schemas.patient import PatientSchema
from rest_api.schemas.user import UserSchema


class PatientProvider(BaseProvider):
    def gender(self) -> str:
        return self.random_element(["male", "female"])

    def get_patient(self, user_id: int, user: UserSchema) -> PatientSchema:
        address = self.generator.full_address()
        date_of_birth = self.generator.date_between(start_date="-100y", end_date="-18y")
        return PatientSchema(
            first_name=user.first_name,
            last_name=user.last_name,
            email=user.email,
            phone=self.generator.phone_number(),
            date_of_birth=date_of_birth,
            address_line_1=address.address_line_1,
            address_line_2=address.address_line_2,
            city=address.city,
            country=address.country,
            gender=self.gender(),
            latitude=address.latitude,
            longitude=address.longitude,
            state=address.state,
            zip_code=address.zip_code,
            user_id=user_id,
            health_care_number=self.numerify(text="##########"),
        )
