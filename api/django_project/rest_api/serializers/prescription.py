from rest_framework import serializers

from rest_api.serializers.common import (
    AddressModelSerializer,
    AssignedToSerializer,
    CommentSerializer,
    GroupByPointSerializer,
    StateLogSerializer,
    TimeSeriesPointSerializer,
    UserSerializer,
    ViewedLogSerializer,
)
from rest_api.serializers.patient import PatientSerializer


class PharmacySerializer(AddressModelSerializer):
    id = serializers.IntegerField(
        read_only=True,
    )
    name = serializers.CharField(max_length=1000)
    created_at = serializers.DateTimeField(read_only=True)
    updated_at = serializers.DateTimeField(read_only=True)


class PrescriptionLineItemSerializer(serializers.Serializer):
    id = serializers.IntegerField(
        read_only=True,
    )
    name = serializers.CharField(max_length=1000)
    quantity = serializers.IntegerField()
    created_at = serializers.DateTimeField(read_only=True)
    updated_at = serializers.DateTimeField(read_only=True)


class PrescriptionAssignSerializer(AssignedToSerializer):
    prescription_id = serializers.IntegerField()


class PrescriptionStateLogSerializer(StateLogSerializer):
    prescription_id = serializers.IntegerField()


class PrescriptionCommentSerializer(CommentSerializer):
    prescription_id = serializers.IntegerField()


class PrescriptionViewedLogSerializer(ViewedLogSerializer):
    prescription_id = serializers.IntegerField()


class PrescriptionSerializer(serializers.Serializer):
    id = serializers.IntegerField(
        read_only=True,
    )
    items = PrescriptionLineItemSerializer(many=True)
    pharmacy = PharmacySerializer(many=False)
    state = serializers.CharField(max_length=100, required=False)
    patient_id = serializers.IntegerField(required=False)
    practice_id = serializers.IntegerField(required=False)
    created_at = serializers.DateTimeField(read_only=True)
    updated_at = serializers.DateTimeField(read_only=True)
    assigned_to_id = serializers.IntegerField(required=False, allow_null=True)
    logs = PrescriptionStateLogSerializer(many=True, required=False)
    comments = PrescriptionCommentSerializer(many=True, required=False)
    patient = PatientSerializer(required=False, many=False)
    assigned_to = UserSerializer(required=False, many=False, allow_null=True)
    assign_history = PrescriptionAssignSerializer(many=True, required=False)
    viewed_logs = PrescriptionViewedLogSerializer(many=True, required=False)


class PrescriptionAnalyticsSchemaSerializer(serializers.Serializer):
    count_by_state = GroupByPointSerializer(many=True)
    overall_count = TimeSeriesPointSerializer(many=True)
    avg_time_in_state = GroupByPointSerializer(many=True)
