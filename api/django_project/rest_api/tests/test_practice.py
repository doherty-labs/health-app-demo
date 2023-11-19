from django.test import TestCase
from faker import Faker

from rest_api.factory.repo import TestGpBaseInjector
from rest_api.repositories.practice import PracticeRepo
from rest_api.repositories.staff import StaffRepo
from rest_api.repositories.user import UserRepo


class TestPracticeRepo(TestCase):

    faker = TestGpBaseInjector.get(Faker)
    user_repo = TestGpBaseInjector.get(UserRepo)
    practice_repo = TestGpBaseInjector.get(PracticeRepo)
    staff_repo = TestGpBaseInjector.get(StaffRepo)

    def setUp(self):
        fake_admin_user = self.faker.get_user()
        fake_admin_user_result = self.user_repo.create(fake_admin_user)
        fake_admin_user_id = fake_admin_user_result.id
        fake_practice = self.faker.get_practice(fake_admin_user_id)
        self.practice = self.practice_repo.create(data=fake_practice)
        self.staff = self.staff_repo.get_by_user_id(user_id=fake_admin_user_id)

    def test_practice_crud(self):
        r = self.practice_repo.get(id=self.practice.id)
        assert r is not None

        r.address_line_1 = "new address"
        r.staff_id = self.staff.id
        updated_practice = self.practice_repo.update(id=r.id, data=r)
        assert updated_practice.address_line_1 == "new address"

        self.practice_repo.delete(id=self.practice.id)
        with self.assertRaises(Exception):
            self.practice_repo.get(id=self.practice.id)
