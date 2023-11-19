from rest_framework import serializers


class UserSerializer(serializers.Serializer):
    id = serializers.IntegerField(
        read_only=True,
    )
    first_name = serializers.CharField(
        max_length=100,
    )
    last_name = serializers.CharField(
        max_length=100,
    )
    full_name = serializers.CharField(
        max_length=100,
    )
    email = serializers.CharField(
        max_length=100,
    )
