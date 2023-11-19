from django.db import models

from rest_api.models.address import AddressModel
from rest_api.models.common import (
    CommonAssignLogModel,
    CommonCommentModel,
    CommonPatientOrgModel,
    CommonStateLogModel,
    CommonViewedLogModel,
)
from rest_api.models.staff import StaffModel


class PharmacyModel(AddressModel):
    name = models.CharField(max_length=1000)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)


class PrescriptionModel(CommonPatientOrgModel):
    pharmacy = models.ForeignKey(PharmacyModel, on_delete=models.CASCADE)
    state = models.CharField(max_length=100)
    assigned_to = models.ForeignKey(
        StaffModel, on_delete=models.DO_NOTHING, null=True, blank=True
    )


class PrescriptionStateLogModel(CommonStateLogModel):
    prescription = models.ForeignKey(PrescriptionModel, on_delete=models.CASCADE)


class PrescriptionAssignLogModel(CommonAssignLogModel):
    prescription = models.ForeignKey(PrescriptionModel, on_delete=models.CASCADE)


class PrescriptionViewedLogModel(CommonViewedLogModel):
    prescription = models.ForeignKey(PrescriptionModel, on_delete=models.CASCADE)


class PrescriptionCommentModel(CommonCommentModel):
    prescription = models.ForeignKey(PrescriptionModel, on_delete=models.CASCADE)


class PrescriptionLineItemModel(models.Model):
    name = models.CharField(max_length=1000)
    quantity = models.IntegerField()
    request = models.ForeignKey(PrescriptionModel, on_delete=models.CASCADE)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
