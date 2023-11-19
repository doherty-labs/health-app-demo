from django.db import models

from rest_api.models.patient import PatientModel
from rest_api.models.practice import PracticeModel


class PatientPracticeModel(models.Model):
    patient = models.ForeignKey(PatientModel, on_delete=models.CASCADE)
    practice = models.ForeignKey(PracticeModel, on_delete=models.CASCADE)
    created_at = models.DateTimeField(auto_now_add=True)
