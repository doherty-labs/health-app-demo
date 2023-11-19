from django.db import models

from rest_api.models.practice import PracticeModel


class PracticeFeatureFlagModel(models.Model):
    practice = models.ForeignKey(
        PracticeModel,
        on_delete=models.CASCADE,
        related_name="%(app_label)s_%(class)s_practice_related",
        related_query_name="%(app_label)s_%(class)s_practices",
    )
    flag_id = models.CharField(max_length=100)
    flag_value = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
