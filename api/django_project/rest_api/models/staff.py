from django.contrib.auth.models import User
from django.db import models

from rest_api.models.practice import PracticeModel


class StaffModel(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE)
    practice = models.ForeignKey(PracticeModel, on_delete=models.CASCADE, null=True)
    job_title = models.CharField(max_length=100, blank=True)
    bio = models.TextField(blank=True)
