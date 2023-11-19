from django.db import models
from django.db.models import UniqueConstraint

from rest_api.models.common import (
    CommonAssignLogModel,
    CommonCommentModel,
    CommonPatientOrgModel,
    CommonStaffOrgModel,
    CommonStateLogModel,
    CommonViewedLogModel,
)
from rest_api.models.patient import PatientDocumentModel
from rest_api.models.practice_items import TeamMemberModel
from rest_api.models.staff import StaffModel


class AppointmentModel(CommonPatientOrgModel):
    symptoms = models.TextField()
    symptom_category = models.CharField(max_length=100)
    symptoms_duration_seconds = models.PositiveBigIntegerField()
    priority = models.PositiveIntegerField(null=True)
    state = models.CharField(max_length=100)
    assigned_to = models.ForeignKey(
        StaffModel, on_delete=models.DO_NOTHING, null=True, blank=True
    )


class AppointmentStateLogModel(CommonStateLogModel):
    appointment = models.ForeignKey(AppointmentModel, on_delete=models.CASCADE)


class AppointmentAssignLogModel(CommonAssignLogModel):
    appointment = models.ForeignKey(AppointmentModel, on_delete=models.CASCADE)


class AppointmentViewedLogModel(CommonViewedLogModel):
    appointment = models.ForeignKey(AppointmentModel, on_delete=models.CASCADE)


class AppointmentCommentModel(CommonCommentModel):
    appointment = models.ForeignKey(AppointmentModel, on_delete=models.CASCADE)


class AppointmentDocumentModel(CommonPatientOrgModel):
    appointment = models.ForeignKey(AppointmentModel, on_delete=models.CASCADE)
    document = models.ForeignKey(PatientDocumentModel, on_delete=models.CASCADE)


class AvailableAppointmentModel(CommonStaffOrgModel):
    team_member = models.ForeignKey(TeamMemberModel, on_delete=models.CASCADE)
    start_time = models.DateTimeField()
    end_time = models.DateTimeField()
    schedule_release_time = models.DateTimeField(null=True, blank=True)

    class Meta:
        constraints = [
            UniqueConstraint(
                fields=["team_member", "start_time", "end_time", "practice"],
                name="unique_available_appointment",
            )
        ]
