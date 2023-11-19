# Generated by Django 4.2.2 on 2023-09-09 13:19

import django.db.models.deletion
from django.conf import settings
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
        ("rest_api", "0027_availableappointmentmodel_unique_available_appointment"),
    ]

    operations = [
        migrations.CreateModel(
            name="BookingInviteModel",
            fields=[
                (
                    "id",
                    models.BigAutoField(
                        auto_created=True,
                        primary_key=True,
                        serialize=False,
                        verbose_name="ID",
                    ),
                ),
                ("created_at", models.DateTimeField(auto_now_add=True)),
                ("updated_at", models.DateTimeField(auto_now=True)),
                (
                    "appointment",
                    models.ForeignKey(
                        on_delete=django.db.models.deletion.CASCADE,
                        to="rest_api.appointmentmodel",
                    ),
                ),
                (
                    "practice",
                    models.ForeignKey(
                        on_delete=django.db.models.deletion.CASCADE,
                        related_name="%(app_label)s_%(class)s_practice_related",
                        related_query_name="%(app_label)s_%(class)s_practices",
                        to="rest_api.practicemodel",
                    ),
                ),
                (
                    "staff",
                    models.ForeignKey(
                        on_delete=django.db.models.deletion.DO_NOTHING,
                        related_name="%(app_label)s_%(class)s_staff_related",
                        related_query_name="%(app_label)s_%(class)s_staff",
                        to="rest_api.staffmodel",
                    ),
                ),
            ],
            options={
                "abstract": False,
            },
        ),
        migrations.CreateModel(
            name="BookingModel",
            fields=[
                (
                    "id",
                    models.BigAutoField(
                        auto_created=True,
                        primary_key=True,
                        serialize=False,
                        verbose_name="ID",
                    ),
                ),
                ("created_at", models.DateTimeField(auto_now_add=True)),
                ("updated_at", models.DateTimeField(auto_now=True)),
                (
                    "attendance_status",
                    models.CharField(blank=True, max_length=50, null=True),
                ),
                (
                    "appointment",
                    models.ForeignKey(
                        on_delete=django.db.models.deletion.CASCADE,
                        to="rest_api.appointmentmodel",
                    ),
                ),
                (
                    "available_appointment",
                    models.ForeignKey(
                        on_delete=django.db.models.deletion.CASCADE,
                        to="rest_api.availableappointmentmodel",
                    ),
                ),
                (
                    "booked_by",
                    models.ForeignKey(
                        on_delete=django.db.models.deletion.CASCADE,
                        to=settings.AUTH_USER_MODEL,
                    ),
                ),
                (
                    "invitation",
                    models.ForeignKey(
                        blank=True,
                        null=True,
                        on_delete=django.db.models.deletion.DO_NOTHING,
                        to="rest_api.bookinginvitemodel",
                    ),
                ),
            ],
        ),
        migrations.CreateModel(
            name="BookingStateLogModel",
            fields=[
                (
                    "id",
                    models.BigAutoField(
                        auto_created=True,
                        primary_key=True,
                        serialize=False,
                        verbose_name="ID",
                    ),
                ),
                ("from_state", models.CharField(max_length=100)),
                ("to_state", models.CharField(max_length=100)),
                ("created_at", models.DateTimeField(auto_now_add=True)),
                ("transition_away_at", models.DateTimeField(null=True)),
                (
                    "booking",
                    models.ForeignKey(
                        on_delete=django.db.models.deletion.CASCADE,
                        to="rest_api.bookingmodel",
                    ),
                ),
                (
                    "triggered_by",
                    models.ForeignKey(
                        on_delete=django.db.models.deletion.DO_NOTHING,
                        related_name="%(app_label)s_%(class)s_trigger_by_related",
                        related_query_name="%(app_label)s_%(class)s_trigger_by",
                        to=settings.AUTH_USER_MODEL,
                    ),
                ),
            ],
            options={
                "abstract": False,
            },
        ),
    ]