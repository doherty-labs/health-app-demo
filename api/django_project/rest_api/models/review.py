from django.db import models

from rest_api.models.common import CommonPatientOrgModel


class ReviewModel(CommonPatientOrgModel):
    title = models.CharField(max_length=100, blank=True)
    review = models.TextField(blank=True)
    rating = models.PositiveIntegerField(default=1)
