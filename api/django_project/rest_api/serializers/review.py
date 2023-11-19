from rest_framework import serializers


class ReviewSerializer(serializers.Serializer):
    id = serializers.IntegerField(
        read_only=True,
    )
    title = serializers.CharField(
        max_length=100,
    )
    review = serializers.CharField(
        max_length=1000,
    )
    rating = serializers.IntegerField()
    created_at = serializers.DateTimeField(
        read_only=True,
    )
    updated_at = serializers.DateTimeField(
        read_only=True,
    )
