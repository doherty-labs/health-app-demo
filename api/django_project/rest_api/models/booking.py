from django.contrib.auth.models import User
from django.db import models

from rest_api.models.appointment import AppointmentModel, AvailableAppointmentModel
from rest_api.models.common import CommonStaffOrgModel


class BookingInviteModel(CommonStaffOrgModel):
    appointment = models.ForeignKey(AppointmentModel, on_delete=models.CASCADE)


class BookingModel(models.Model):
    appointment = models.ForeignKey(AppointmentModel, on_delete=models.CASCADE)
    available_appointment = models.ForeignKey(
        AvailableAppointmentModel, on_delete=models.CASCADE
    )
    invitation = models.ForeignKey(
        BookingInviteModel, on_delete=models.DO_NOTHING, null=True, blank=True
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    booked_by = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
    )
    attendance_status = models.CharField(max_length=50, blank=True, null=True)
