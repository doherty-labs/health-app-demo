from django.utils.text import slugify
from faker.providers import BaseProvider

from rest_api.schemas.common import AddressSchema
from rest_api.schemas.practice import (
    ContactOptionSchema,
    NoticeSchema,
    OpeningHourSchema,
    OpeningTimeExceptionSchema,
    PracticeSummarySchema,
    TeamMemberSchema,
)


class PracticeProvider(BaseProvider):
    def phone_contract_option(self) -> ContactOptionSchema:
        return ContactOptionSchema(
            href_type="tel",
            name=self.generator.name(),
            value=self.generator.phone_number(),
        )

    def email_contract_option(self) -> ContactOptionSchema:
        return ContactOptionSchema(
            href_type="mailto",
            name=self.generator.name(),
            value=self.generator.email(),
        )

    def random_contact_options(self) -> list[ContactOptionSchema]:
        return [
            self.phone_contract_option(),
            self.phone_contract_option(),
            self.phone_contract_option(),
            self.email_contract_option(),
            self.email_contract_option(),
        ]

    def generate_notice(self) -> NoticeSchema:
        return NoticeSchema(
            description_markdown=self.generator.paragraph(),
            title=self.generator.sentence(),
        )

    def generate_team_member(self) -> TeamMemberSchema:
        return TeamMemberSchema(
            bio=self.generator.paragraph(),
            first_name=self.generator.first_name(),
            last_name=self.generator.last_name(),
            job_title=self.generator.job(),
        )

    def generate_opening_hours(self) -> list[OpeningHourSchema]:
        return [
            OpeningHourSchema(
                day_of_week=1,
                start_time="09:00",
                end_time="17:00",
                is_closed=False,
            ),
            OpeningHourSchema(
                day_of_week=1,
                start_time="13:00",
                end_time="14:00",
                is_closed=True,
            ),
            OpeningHourSchema(
                day_of_week=2,
                start_time="09:00",
                end_time="17:00",
                is_closed=False,
            ),
            OpeningHourSchema(
                day_of_week=2,
                start_time="13:00",
                end_time="14:00",
                is_closed=True,
            ),
            OpeningHourSchema(
                day_of_week=3,
                start_time="09:00",
                end_time="17:00",
                is_closed=False,
            ),
            OpeningHourSchema(
                day_of_week=3,
                start_time="13:00",
                end_time="14:00",
                is_closed=True,
            ),
            OpeningHourSchema(
                day_of_week=4,
                start_time="09:00",
                end_time="17:00",
                is_closed=False,
            ),
            OpeningHourSchema(
                day_of_week=4,
                start_time="13:00",
                end_time="14:00",
                is_closed=True,
            ),
            OpeningHourSchema(
                day_of_week=5,
                start_time="09:00",
                end_time="17:00",
                is_closed=False,
            ),
            OpeningHourSchema(
                day_of_week=5,
                start_time="13:00",
                end_time="14:00",
                is_closed=True,
            ),
            OpeningHourSchema(
                day_of_week=6,
                start_time="",
                end_time="",
                is_closed=True,
            ),
            OpeningHourSchema(
                day_of_week=0,
                start_time="",
                end_time="",
                is_closed=True,
            ),
        ]

    def generate_opening_time_exceptions(self) -> list[OpeningTimeExceptionSchema]:
        return [
            OpeningTimeExceptionSchema(
                start_datetime="2021-01-01",
                end_datetime="2021-01-01",
                reason="New Year's Day",
                is_closed=True,
            ),
            OpeningTimeExceptionSchema(
                start_datetime="2021-03-17",
                end_datetime="2021-03-17",
                reason="St. Patrick's Day",
                is_closed=True,
            ),
            OpeningTimeExceptionSchema(
                start_datetime="2021-04-02",
                end_datetime="2021-04-02",
                reason="Good Friday",
                is_closed=True,
            ),
        ]

    def get_practice(self, user_id: int) -> PracticeSummarySchema:
        name = self.generator.company()
        fake_address: AddressSchema = self.generator.full_address()
        return PracticeSummarySchema(
            address_line_1=fake_address.address_line_1,
            address_line_2=fake_address.address_line_2,
            city=fake_address.city,
            country=fake_address.country,
            latitude=fake_address.latitude,
            longitude=fake_address.longitude,
            state=fake_address.state,
            zip_code=fake_address.zip_code,
            name=name,
            slug=slugify(name),
            contact_options=self.random_contact_options(),
            notices=[self.generate_notice() for _ in range(3)],
            team_members=[self.generate_team_member() for _ in range(10)],
            opening_hours=self.generate_opening_hours(),
            opening_time_exceptions=self.generate_opening_time_exceptions(),
            staff_id=user_id,
            feature_flags=[],
        )
