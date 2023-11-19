from faker.providers import BaseProvider

from rest_api.schemas.common import AddressSchema


class CustomAddressProvider(BaseProvider):
    states = [
        "Antrim",
        "Armagh",
        "Carlow",
        "Cavan",
        "Clare",
        "Cork",
        "Derry",
        "Donegal",
        "Down",
        "Dublin",
        "Fermanagh",
    ]

    def full_address(self) -> AddressSchema:
        return AddressSchema(
            address_line_1=self.generator.street_address(),
            address_line_2=self.generator.street_address(),
            city=self.generator.city(),
            country=self.generator.country(),
            state=self.random_element(self.states),
            zip_code=self.generator.postcode(),
            latitude=self.random_number(),
            longitude=self.random_number(),
        )
