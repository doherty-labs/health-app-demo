from rest_framework import serializers

from rest_api.serializers.common import TeamMemberSerializer


class AvailabilitySerializer(serializers.Serializer):
    id = serializers.IntegerField(
        read_only=True,
    )
    staff_id = serializers.IntegerField(read_only=True)
    practice_id = serializers.IntegerField(read_only=True)
    team_member_id = serializers.IntegerField()
    start_time = serializers.DateTimeField()
    end_time = serializers.DateTimeField()
    schedule_release_time = serializers.DateTimeField(required=False)
    team_member = TeamMemberSerializer(read_only=True)
    created_at = serializers.DateTimeField(
        read_only=True,
    )
    updated_at = serializers.DateTimeField(
        read_only=True,
    )
