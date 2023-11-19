from django.contrib.auth.models import User
from django.db import models

from rest_api.models.patient import PatientModel
from rest_api.models.practice import PracticeModel
from rest_api.models.staff import StaffModel


class CommonPatientOrgModel(models.Model):
    patient = models.ForeignKey(
        PatientModel,
        on_delete=models.DO_NOTHING,
        related_name="%(app_label)s_%(class)s_patient_related",
        related_query_name="%(app_label)s_%(class)s_patients",
    )
    practice = models.ForeignKey(
        PracticeModel,
        on_delete=models.CASCADE,
        related_name="%(app_label)s_%(class)s_practice_related",
        related_query_name="%(app_label)s_%(class)s_practices",
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        abstract = True


class CommonStaffOrgModel(models.Model):
    staff = models.ForeignKey(
        StaffModel,
        on_delete=models.DO_NOTHING,
        related_name="%(app_label)s_%(class)s_staff_related",
        related_query_name="%(app_label)s_%(class)s_staff",
    )
    practice = models.ForeignKey(
        PracticeModel,
        on_delete=models.CASCADE,
        related_name="%(app_label)s_%(class)s_practice_related",
        related_query_name="%(app_label)s_%(class)s_practices",
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        abstract = True


class CommonStateLogModel(models.Model):
    from_state = models.CharField(max_length=100)
    to_state = models.CharField(max_length=100)
    created_at = models.DateTimeField(auto_now_add=True)
    transition_away_at = models.DateTimeField(null=True)
    triggered_by = models.ForeignKey(
        User,
        on_delete=models.DO_NOTHING,
        related_name="%(app_label)s_%(class)s_trigger_by_related",
        related_query_name="%(app_label)s_%(class)s_trigger_by",
    )

    class Meta:
        abstract = True


class CommonAssignLogModel(models.Model):
    from_user = models.ForeignKey(
        User,
        on_delete=models.DO_NOTHING,
        related_name="%(app_label)s_%(class)s_from_user_related",
        related_query_name="%(app_label)s_%(class)s_from_user",
        null=True,
    )
    to_user = models.ForeignKey(
        User,
        on_delete=models.DO_NOTHING,
        related_name="%(app_label)s_%(class)s_to_user_related",
        related_query_name="%(app_label)s_%(class)s_to_user",
        null=True,
    )
    triggered_by = models.ForeignKey(
        User,
        on_delete=models.DO_NOTHING,
        related_name="%(app_label)s_%(class)s_trigger_by_related",
        related_query_name="%(app_label)s_%(class)s_trigger_by",
        null=True,
    )
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        abstract = True


class CommonCommentModel(models.Model):
    user = models.ForeignKey(
        User,
        on_delete=models.DO_NOTHING,
        related_name="%(app_label)s_%(class)s_written_by_related",
        related_query_name="%(app_label)s_%(class)s_written_by",
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    comment = models.TextField()

    class Meta:
        abstract = True


class CommonViewedLogModel(models.Model):
    created_at = models.DateTimeField(auto_now_add=True)
    viewed_by = models.ForeignKey(
        User,
        on_delete=models.DO_NOTHING,
        related_name="%(app_label)s_%(class)s_viewed_by_related",
        related_query_name="%(app_label)s_%(class)s_viewed_by",
    )

    class Meta:
        abstract = True
