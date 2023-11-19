from rest_framework import serializers


class StaffMemberSerializer(serializers.Serializer):
    id = serializers.IntegerField(
        read_only=True,
    )
    practice_id = serializers.IntegerField(
        read_only=True,
    )
    first_name = serializers.CharField(
        max_length=100,
    )
    last_name = serializers.CharField(
        max_length=100,
    )
    job_title = serializers.CharField(
        max_length=100,
    )
    email = serializers.EmailField()
    bio = serializers.CharField(max_length=1000, required=False, allow_blank=True)
    full_name = serializers.CharField(
        max_length=300,
        read_only=True,
    )
