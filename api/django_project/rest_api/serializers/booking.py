from rest_framework import serializers

from rest_api.serializers.appointment import AppointmentSerializer
from rest_api.serializers.availability import AvailabilitySerializer
from rest_api.serializers.common import UserSerializer
from rest_api.serializers.staff import StaffMemberSerializer


class BookingInviteSerializer(serializers.Serializer):
    id = serializers.IntegerField(
        read_only=True,
    )
    appointment_id = serializers.IntegerField()
    appointment = AppointmentSerializer(read_only=True)
    practice_id = serializers.IntegerField()
    staff_id = serializers.IntegerField()
    staff = StaffMemberSerializer(read_only=True)
    can_book = serializers.BooleanField(
        required=False,
    )
    created_at = serializers.DateTimeField(
        read_only=True,
    )
    updated_at = serializers.DateTimeField(
        read_only=True,
    )


class BookingSerializer(serializers.Serializer):
    id = serializers.IntegerField(
        read_only=True,
    )
    appointment_id = serializers.IntegerField()
    available_appointment_id = serializers.IntegerField()
    appointment = AppointmentSerializer(read_only=True)
    available_appointment = AvailabilitySerializer(read_only=True)
    invitation_id = serializers.IntegerField()
    invitation = BookingInviteSerializer(read_only=True)
    booked_by = UserSerializer(read_only=True)
    attendance_status = serializers.CharField(
        max_length=100,
        required=False,
    )
    created_at = serializers.DateTimeField(
        read_only=True,
    )
    updated_at = serializers.DateTimeField(
        read_only=True,
    )
