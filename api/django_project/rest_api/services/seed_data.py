from django.db.transaction import atomic
from faker import Faker
from injector import inject

from rest_api.repositories.appointment import AppointmentRepo
from rest_api.repositories.patient import PatientRepo
from rest_api.repositories.practice import PracticeRepo
from rest_api.repositories.prescription import PrescriptionRepo
from rest_api.repositories.staff import StaffRepo
from rest_api.repositories.user import UserRepo
from rest_api.schemas.appointment import AppointmentSchema
from rest_api.schemas.patient import PatientSchema
from rest_api.schemas.practice import PracticeSummarySchema
from rest_api.schemas.prescription import PrescriptionSchema
from rest_api.schemas.staff import StaffMemberSchema
from rest_api.schemas.user import UserSchema


class SeedData:
    @inject
    def __init__(
        self,
        practice_repo: PracticeRepo,
        patient_repo: PatientRepo,
        appointment_repo: AppointmentRepo,
        prescription_repo: PrescriptionRepo,
        staff_repo: StaffRepo,
        user_repo: UserRepo,
        faker: Faker,
    ):
        self.practice_repo = practice_repo
        self.patient_repo = patient_repo
        self.appointment_repo = appointment_repo
        self.prescription_repo = prescription_repo
        self.staff_repo = staff_repo
        self.user_repo = user_repo
        self.faker = faker

    def _generate_fake_practice(self, user_id: int) -> PracticeSummarySchema:
        return self.faker.get_practice(user_id)

    def _generate_fake_patient(self, user_id: int, user: UserSchema) -> PatientSchema:
        return self.faker.get_patient(user_id, user)

    def _generate_fake_appointment(
        self, patient_id: int, practice_id: int
    ) -> AppointmentSchema:
        return self.faker.get_appointment(patient_id, practice_id)

    def _generate_fake_prescription(
        self, patient_id: int, practice_id: int
    ) -> PrescriptionSchema:
        return self.faker.get_prescription(patient_id, practice_id)

    def _generate_fake_staff(
        self, user_id: int, practice_id: int | None, user: UserSchema
    ) -> StaffMemberSchema:
        return self.faker.get_staff(user_id, practice_id, user)

    def _generate_fake_user(self) -> UserSchema:
        return self.faker.get_user()

    @atomic
    def seed_env(self, practice_id: int | None = None):
        if not practice_id:
            fake_admin_user = self._generate_fake_user()
            fake_admin_user_result = self.user_repo.create(fake_admin_user)
            fake_admin_user_id = fake_admin_user_result.id

            fake_practice = self._generate_fake_practice(fake_admin_user_id)
            fake_practice_result = self.practice_repo.create(
                fake_practice, skip_gmaps=True
            )
            fake_practice_id = fake_practice_result.id
        else:
            fake_practice_id = practice_id

        how_many_patients = 20
        max_elems_per_patient = 4

        for _ in range(how_many_patients):
            fake_patient_user = self._generate_fake_user()
            fake_patient_user_result = self.user_repo.create(fake_patient_user)
            fake_patient_user_id = fake_patient_user_result.id

            fake_patient = self._generate_fake_patient(
                fake_patient_user_id, fake_patient_user
            )
            fake_patient_result = self.patient_repo.create(fake_patient, test_data=True)
            fake_patient_id = fake_patient_result.id

            for _ in range(max_elems_per_patient):
                fake_appointment = self._generate_fake_appointment(
                    fake_patient_id, fake_practice_id
                )
                fake_prescription = self._generate_fake_prescription(
                    fake_patient_id, fake_practice_id
                )
                self.appointment_repo.create(fake_appointment)
                self.prescription_repo.create(fake_prescription, test_data=True)
