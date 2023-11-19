from faker import Faker
from faker.providers import (
    company,
    date_time,
    internet,
    job,
    lorem,
    person,
    phone_number,
)
from injector import Module, provider, singleton

from rest_api.modules.faker.appointment import AppointmentProvider
from rest_api.modules.faker.common import CustomAddressProvider
from rest_api.modules.faker.patient import PatientProvider
from rest_api.modules.faker.practice import PracticeProvider
from rest_api.modules.faker.prescription import PrescriptionProvider
from rest_api.modules.faker.staff import StaffProvider
from rest_api.modules.faker.user import UserProvider


class FakerModule(Module):
    @singleton
    @provider
    def faker_instance(self) -> Faker:
        faker = Faker(locale="en_GB")
        # Default providers
        faker.add_provider(company)
        faker.add_provider(date_time)
        faker.add_provider(internet)
        faker.add_provider(job)
        faker.add_provider(lorem)
        faker.add_provider(person)
        faker.add_provider(phone_number)

        # Custom providers
        faker.add_provider(CustomAddressProvider)
        faker.add_provider(PracticeProvider)
        faker.add_provider(AppointmentProvider)
        faker.add_provider(UserProvider)
        faker.add_provider(StaffProvider)
        faker.add_provider(PatientProvider)
        faker.add_provider(PrescriptionProvider)
        return faker
