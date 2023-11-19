from django.contrib.auth.models import User
from django.db import models

from rest_api.models.address import AddressModel


class PatientModel(AddressModel):
    user = models.OneToOneField(User, on_delete=models.CASCADE)
    phone = models.CharField(max_length=20)
    date_of_birth = models.DateField()
    gender = models.CharField(max_length=10)
    health_care_number = models.CharField(max_length=20, blank=True)


class PatientDocumentModel(models.Model):
    patient = models.ForeignKey(PatientModel, on_delete=models.CASCADE)
    s3_url = models.CharField(max_length=200)
    uploaded_at = models.DateTimeField(auto_now_add=True)


class PatientVerificationModel(models.Model):
    patient_document = models.OneToOneField(
        PatientDocumentModel, on_delete=models.CASCADE
    )
    is_id = models.BooleanField(default=False)
    is_proof_of_address = models.BooleanField(default=False)
    state = models.CharField(max_length=100)
