from django.db import models

from rest_api.models.common import CommonStaffOrgModel
from rest_api.models.practice import PracticeModel


class OpeningHourModel(CommonStaffOrgModel):
    day_of_week = models.PositiveIntegerField()
    start_time = models.CharField(max_length=100)
    end_time = models.CharField(max_length=100)
    is_closed = models.BooleanField(default=False)


class OpeningTimeExceptionModel(CommonStaffOrgModel):
    start_datetime = models.DateField()
    end_datetime = models.DateField()
    is_closed = models.BooleanField(default=True)
    reason = models.CharField(max_length=100)


class ContactOptionModel(CommonStaffOrgModel):
    name = models.CharField(max_length=100)
    value = models.CharField(max_length=100)
    href_type = models.CharField(max_length=100)


class NoticeModel(CommonStaffOrgModel):
    title = models.CharField(max_length=100)
    description_markdown = models.TextField()


class TeamMemberModel(CommonStaffOrgModel):
    first_name = models.CharField(max_length=100)
    last_name = models.CharField(max_length=100)
    job_title = models.CharField(max_length=100)
    bio = models.TextField(blank=True)


class PracticeOrgLinkModel(models.Model):
    practice = models.OneToOneField(PracticeModel, on_delete=models.CASCADE)
    org_id = models.CharField(max_length=100)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
