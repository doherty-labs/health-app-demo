# Generated by Django 4.2.2 on 2023-07-26 08:05

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ("rest_api", "0020_appointmentviewedlogmodel"),
    ]

    operations = [
        migrations.AddField(
            model_name="appointmentstatelogmodel",
            name="transition_away_at",
            field=models.DateTimeField(null=True),
        ),
        migrations.AddField(
            model_name="prescriptionstatelogmodel",
            name="transition_away_at",
            field=models.DateTimeField(null=True),
        ),
    ]
