from faker.providers import BaseProvider

from rest_api.schemas.appointment import AppointmentSchema


class AppointmentProvider(BaseProvider):
    def random_appointment_state(self) -> str:
        return self.random_element(
            [
                "submitted",
                "waiting_triage",
                "in_triage",
                "awaiting_time_selection",
                "booked",
                "cancelled",
                "rejected",
            ]
        )

    def random_symptom_category(self) -> str:
        return self.random_element(
            [
                "Muscles and joints",
                "Cold and flu",
                "Cough",
                "Mental Health",
                "Skin Problem",
                "Stomach ache or pain",
                "Urine problem",
                "Other",
            ]
        )

    def random_duration_seconds(self) -> int:
        return self.random_element([86400, 172800, 259200, 432000, 864000])

    def get_appointment(self, patient_id: int, practice_id: int) -> AppointmentSchema:
        return AppointmentSchema(
            patient_id=patient_id,
            practice_id=practice_id,
            state=self.random_appointment_state(),
            priority=self.random_int(min=1, max=5),
            symptom_category=self.random_symptom_category(),
            symptoms_duration_seconds=self.random_duration_seconds(),
            symptoms=self.generator.paragraph(),
        )
