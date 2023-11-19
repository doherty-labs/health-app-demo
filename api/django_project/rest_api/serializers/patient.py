from rest_framework import serializers

from rest_api.serializers.common import AddressModelSerializer


class PatientDocumentSerializer(serializers.Serializer):
    id = serializers.IntegerField(
        read_only=True,
    )
    download_url = serializers.CharField(max_length=200)
    state = serializers.CharField(max_length=100, read_only=True)
    uploaded_at = serializers.DateTimeField(read_only=True)
    is_id = serializers.BooleanField()
    is_proof_of_address = serializers.BooleanField()


class PatientSerializer(AddressModelSerializer):
    id = serializers.IntegerField(
        read_only=True,
    )
    first_name = serializers.CharField(max_length=100)
    last_name = serializers.CharField(max_length=100)
    full_name = serializers.CharField(max_length=200, required=False, allow_blank=True)
    email = serializers.EmailField()
    phone = serializers.CharField(max_length=100)
    date_of_birth = serializers.DateField(input_formats=["%d/%m/%Y", "iso-8601"])
    gender = serializers.CharField(max_length=10)
    health_care_number = serializers.CharField(
        max_length=100, required=False, allow_blank=True
    )
    documents = PatientDocumentSerializer(many=True, required=False)
