from rest_framework import serializers

from rest_api.serializers.common import (
    AssignedToSerializer,
    CommentSerializer,
    GroupByPointSerializer,
    StateLogSerializer,
    TimeSeriesPointSerializer,
    UserSerializer,
    ViewedLogSerializer,
)
from rest_api.serializers.patient import PatientSerializer


class PatientDocumentSerializer(serializers.Serializer):
    id = serializers.IntegerField(
        read_only=True,
    )
    download_url = serializers.CharField(max_length=200)
    uploaded_at = serializers.DateTimeField(read_only=True)


class AppointmentAssignSerializer(AssignedToSerializer):
    appointment_id = serializers.IntegerField()


class AppointmentStateLogSerializer(StateLogSerializer):
    appointment_id = serializers.IntegerField()


class AppointmentCommentSerializer(CommentSerializer):
    appointment_id = serializers.IntegerField()


class AppointmentViewedLogSerializer(ViewedLogSerializer):
    appointment_id = serializers.IntegerField()


class AppointmentSerializer(serializers.Serializer):
    id = serializers.IntegerField(
        read_only=True,
    )
    symptoms = serializers.CharField(max_length=1000)
    symptom_category = serializers.CharField(max_length=100)
    symptoms_duration_seconds = serializers.IntegerField()
    priority = serializers.IntegerField(required=False, allow_null=True)
    state = serializers.CharField(max_length=100, required=False)
    patient_id = serializers.IntegerField(required=False)
    practice_id = serializers.IntegerField(required=False)
    documents = PatientDocumentSerializer(many=True, required=False)
    created_at = serializers.DateTimeField(read_only=True)
    updated_at = serializers.DateTimeField(read_only=True)
    assigned_to_id = serializers.IntegerField(required=False, allow_null=True)
    logs = AppointmentStateLogSerializer(many=True, required=False)
    comments = AppointmentCommentSerializer(many=True, required=False)
    patient = PatientSerializer(required=False, many=False)
    assigned_to = UserSerializer(required=False, many=False, allow_null=True)
    assign_history = AppointmentAssignSerializer(many=True, required=False)
    viewed_logs = AppointmentViewedLogSerializer(many=True, required=False)


class AppointmentAnalyticsSchemaSerializer(serializers.Serializer):
    count_by_state = GroupByPointSerializer(many=True)
    overall_count = TimeSeriesPointSerializer(many=True)
    avg_time_in_state = GroupByPointSerializer(many=True)
