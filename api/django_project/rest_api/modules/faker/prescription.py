from faker.providers import BaseProvider

from rest_api.schemas.common import AddressSchema
from rest_api.schemas.prescription import (
    PharmacySchema,
    PrescriptionLineItemSchema,
    PrescriptionSchema,
)


class PrescriptionProvider(BaseProvider):
    def random_prescription_state(self) -> str:
        return self.random_element(
            [
                "submitted",
                "in_review",
                "rejected",
                "approved",
                "ready_for_collection",
            ]
        )

    def random_drug_name(self) -> str:
        return self.random_element(
            [
                "Paracetamol",
                "Ibuprofen",
                "Aspirin",
                "Codeine",
                "Morphine",
                "Tramadol",
                "Methadone",
                "Oxycodone",
                "Hydrocodone",
                "Fentanyl",
            ]
        )

    def random_pharmacy(self) -> PharmacySchema:
        name = self.generator.company()
        fake_address: AddressSchema = self.generator.full_address()
        return PharmacySchema(
            address_line_1=fake_address.address_line_1,
            address_line_2=fake_address.address_line_2,
            city=fake_address.city,
            country=fake_address.country,
            latitude=fake_address.latitude,
            longitude=fake_address.longitude,
            state=fake_address.state,
            zip_code=fake_address.zip_code,
            name=name,
        )

    def get_line_item(self) -> PrescriptionLineItemSchema:
        return PrescriptionLineItemSchema(
            name=self.random_drug_name(),
            quantity=self.random_int(min=1, max=10),
        )

    def get_prescription(self, patient_id: int, practice_id: int) -> PrescriptionSchema:
        return PrescriptionSchema(
            patient_id=patient_id,
            practice_id=practice_id,
            state=self.random_prescription_state(),
            items=[self.get_line_item() for _ in range(self.random_int(min=1, max=5))],
            pharmacy=self.random_pharmacy(),
        )
