# Generated by Django 4.2.2 on 2023-08-07 09:13

import django.db.models.deletion
from django.conf import settings
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
        ("rest_api", "0021_appointmentstatelogmodel_transition_away_at_and_more"),
    ]

    operations = [
        migrations.CreateModel(
            name="PrescriptionAssignLogModel",
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
                (
                    "from_user",
                    models.ForeignKey(
                        null=True,
                        on_delete=django.db.models.deletion.DO_NOTHING,
                        related_name="%(app_label)s_%(class)s_from_user_related",
                        related_query_name="%(app_label)s_%(class)s_from_user",
                        to=settings.AUTH_USER_MODEL,
                    ),
                ),
                (
                    "prescription",
                    models.ForeignKey(
                        on_delete=django.db.models.deletion.CASCADE,
                        to="rest_api.prescriptionmodel",
                    ),
                ),
                (
                    "to_user",
                    models.ForeignKey(
                        null=True,
                        on_delete=django.db.models.deletion.DO_NOTHING,
                        related_name="%(app_label)s_%(class)s_to_user_related",
                        related_query_name="%(app_label)s_%(class)s_to_user",
                        to=settings.AUTH_USER_MODEL,
                    ),
                ),
                (
                    "triggered_by",
                    models.ForeignKey(
                        null=True,
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
        migrations.CreateModel(
            name="PrescriptionViewedLogModel",
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
                (
                    "prescription",
                    models.ForeignKey(
                        on_delete=django.db.models.deletion.CASCADE,
                        to="rest_api.prescriptionmodel",
                    ),
                ),
                (
                    "viewed_by",
                    models.ForeignKey(
                        on_delete=django.db.models.deletion.DO_NOTHING,
                        related_name="%(app_label)s_%(class)s_viewed_by_related",
                        related_query_name="%(app_label)s_%(class)s_viewed_by",
                        to=settings.AUTH_USER_MODEL,
                    ),
                ),
            ],
            options={
                "abstract": False,
            },
        ),
        migrations.DeleteModel(
            name="AppointmentTriageQuestion",
        ),
    ]
