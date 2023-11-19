from rest_framework import serializers

from rest_api.serializers.common import (
    AddressModelSerializer,
    FeatureFlagSerializer,
    TeamMemberSerializer,
)


class OpeningHourModelSerializer(serializers.Serializer):
    id = serializers.IntegerField(
        read_only=True,
    )
    day_of_week = serializers.IntegerField()
    start_time = serializers.CharField(allow_blank=True, max_length=100, required=False)
    end_time = serializers.CharField(allow_blank=True, max_length=100, required=False)
    is_closed = serializers.BooleanField()
    created_at = serializers.DateTimeField(
        read_only=True,
    )
    updated_at = serializers.DateTimeField(
        read_only=True,
    )


class OpeningTimeExceptionModelSerializer(serializers.Serializer):
    id = serializers.IntegerField(
        read_only=True,
    )
    start_datetime = serializers.DateField(
        input_formats=["%d/%m/%Y", "iso-8601"], required=False
    )
    end_datetime = serializers.DateField(
        input_formats=["%d/%m/%Y", "iso-8601"], required=False
    )
    is_closed = serializers.BooleanField()
    reason = serializers.CharField(
        max_length=100,
    )
    created_at = serializers.DateTimeField(
        read_only=True,
    )
    updated_at = serializers.DateTimeField(
        read_only=True,
    )


class ContactOptionModelSerializer(serializers.Serializer):
    id = serializers.IntegerField(
        read_only=True,
    )
    name = serializers.CharField(
        max_length=100,
    )
    value = serializers.CharField(
        max_length=100,
    )
    href_type = serializers.CharField(
        max_length=100,
    )
    created_at = serializers.DateTimeField(
        read_only=True,
    )
    updated_at = serializers.DateTimeField(
        read_only=True,
    )


class NoticeSerializer(serializers.Serializer):
    id = serializers.IntegerField(
        read_only=True,
    )
    title = serializers.CharField(
        max_length=100,
    )
    description_markdown = serializers.CharField(
        max_length=1000,
    )
    created_at = serializers.DateTimeField(
        read_only=True,
    )
    updated_at = serializers.DateTimeField(
        read_only=True,
    )


class PracticeSerializer(AddressModelSerializer):
    id = serializers.IntegerField(
        read_only=True,
    )
    org_id = serializers.CharField(
        read_only=True,
        required=False,
        max_length=100,
    )
    name = serializers.CharField(
        max_length=100,
    )
    slug = serializers.SlugField(
        read_only=True,
    )
    team_members = TeamMemberSerializer(many=True)
    opening_hours = OpeningHourModelSerializer(many=True)
    opening_time_exceptions = OpeningTimeExceptionModelSerializer(many=True)
    contact_options = ContactOptionModelSerializer(many=True)
    notices = NoticeSerializer(many=True)
    feature_flags = FeatureFlagSerializer(many=True)
    created_at = serializers.DateTimeField(
        read_only=True,
    )
    updated_at = serializers.DateTimeField(
        read_only=True,
    )


class InviteUserSerializer(serializers.Serializer):
    email = serializers.EmailField()
