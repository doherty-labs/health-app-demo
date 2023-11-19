from rest_framework import serializers


class UserSerializer(serializers.Serializer):
    id = serializers.IntegerField(
        read_only=True,
    )
    first_name = serializers.CharField(max_length=100)
    last_name = serializers.CharField(max_length=100)
    full_name = serializers.CharField(max_length=100, read_only=True, required=False)
    email = serializers.EmailField(max_length=100)


class AddressModelSerializer(serializers.Serializer):
    address_line_1 = serializers.CharField(
        max_length=100,
    )
    address_line_2 = serializers.CharField(max_length=100, allow_blank=True)
    city = serializers.CharField(
        max_length=100,
    )
    state = serializers.CharField(
        max_length=100,
    )
    zip_code = serializers.CharField(
        max_length=100,
    )
    country = serializers.CharField(
        max_length=100,
    )
    latitude = serializers.FloatField(read_only=True)
    longitude = serializers.FloatField(read_only=True)


class StateLogSerializer(serializers.Serializer):
    id = serializers.IntegerField(
        read_only=True,
    )
    from_state = serializers.CharField(read_only=True)
    to_state = serializers.CharField(max_length=100)
    triggered_by_id = serializers.IntegerField()
    triggered_by = UserSerializer(read_only=True)
    created_at = serializers.DateTimeField(read_only=True)
    transition_away_at = serializers.DateTimeField(read_only=True)
    transition_delta = serializers.FloatField(read_only=True)


class ViewedLogSerializer(serializers.Serializer):
    id = serializers.IntegerField(
        read_only=True,
    )
    viewed_by = UserSerializer(read_only=True)
    created_at = serializers.DateTimeField(read_only=True)


class AssignedToSerializer(serializers.Serializer):
    id = serializers.IntegerField(
        read_only=True,
    )
    created_at = serializers.DateTimeField(read_only=True)
    triggered_by = UserSerializer(read_only=True)
    from_user = UserSerializer(read_only=True)
    to_user = UserSerializer(read_only=True)


class CommentSerializer(serializers.Serializer):
    id = serializers.IntegerField(
        required=False,
    )
    user_id = serializers.IntegerField(
        required=False,
    )
    user = UserSerializer(read_only=True)
    created_at = serializers.DateTimeField(read_only=True)
    updated_at = serializers.DateTimeField(read_only=True)
    comment = serializers.CharField(max_length=1000)


class StateSerializer(serializers.Serializer):
    id = serializers.CharField(max_length=100)
    name = serializers.CharField(max_length=100)
    description = serializers.CharField(max_length=100)


class StatesSerializer(serializers.Serializer):
    states = StateSerializer(many=True)


class TimeSeriesPointSerializer(serializers.Serializer):
    date = serializers.DateTimeField()
    value = serializers.FloatField()


class GroupByPointSerializer(serializers.Serializer):
    by = serializers.CharField(max_length=1000)
    value = serializers.FloatField()


class OnboardedSerializer(serializers.Serializer):
    has_onboarded = serializers.BooleanField()


class FeatureFlagSerializer(serializers.Serializer):
    id = serializers.IntegerField(
        read_only=True,
    )
    practice_id = serializers.IntegerField(
        read_only=True,
    )
    flag_id = serializers.CharField(max_length=100)
    flag_value = serializers.BooleanField()
    created_at = serializers.DateTimeField(read_only=True)
    updated_at = serializers.DateTimeField(read_only=True)


class AllFeatureFlagsSerializer(serializers.Serializer):
    flags = FeatureFlagSerializer(many=True)


class TeamMemberSerializer(serializers.Serializer):
    id = serializers.IntegerField(
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
    bio = serializers.CharField(max_length=1000, required=False, allow_blank=True)
    created_at = serializers.DateTimeField(
        read_only=True,
    )
    updated_at = serializers.DateTimeField(
        read_only=True,
    )
