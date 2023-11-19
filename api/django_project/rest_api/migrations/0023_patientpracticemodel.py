# Generated by Django 4.2.2 on 2023-08-08 15:47

import django.db.models.deletion
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ("rest_api", "0022_prescriptionassignlogmodel_and_more"),
    ]

    operations = [
        migrations.CreateModel(
            name="PatientPracticeModel",
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
                    "patient",
                    models.ForeignKey(
                        on_delete=django.db.models.deletion.CASCADE,
                        to="rest_api.patientmodel",
                    ),
                ),
                (
                    "practice",
                    models.ForeignKey(
                        on_delete=django.db.models.deletion.CASCADE,
                        to="rest_api.practicemodel",
                    ),
                ),
            ],
        ),
    ]