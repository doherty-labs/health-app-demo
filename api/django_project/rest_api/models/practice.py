from django.db import models

from rest_api.models.address import AddressModel


class PracticeModel(AddressModel):
    name = models.CharField(max_length=100)
    slug = models.SlugField(unique=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
