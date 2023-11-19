from rest_framework import filters, generics, permissions, status
from rest_framework.exceptions import NotFound
from rest_framework.pagination import PageNumberPagination
from rest_framework.permissions import BasePermission
from rest_framework.response import Response
from rest_framework.schemas.openapi import AutoSchema
from rest_framework.views import APIView

from django_project.auth_utils import requires_scopes
from rest_api.factory.repo import GpBaseInjector
from rest_api.models.patient import PatientModel, PatientVerificationModel
from rest_api.models.patient_practice import PatientPracticeModel
from rest_api.repositories.patient import PatientRepo
from rest_api.repositories.permissions import (
    PatientPermissionReadWrite,
    StaffPermission,
)
from rest_api.repositories.utils import convert_user_id_to_patient_id
from rest_api.schemas.patient import PatientSchema
from rest_api.serializers.common import OnboardedSerializer
from rest_api.serializers.patient import PatientSerializer
from rest_api.utils.request_handler import get_request_meta_data


class PatientPagination(PageNumberPagination):
    page_size = 50
    max_page_size = 50


class CommonPatientView(APIView, AutoSchema):
    serializer_class = PatientSerializer
    permission_classes: list[BasePermission] = [
        PatientPermissionReadWrite | StaffPermission
    ]
    pydantic_schema = PatientSchema
    repo = GpBaseInjector.get(PatientRepo)
    queryset = PatientModel.objects.all()


class ManagePatientView(
    CommonPatientView,
    generics.CreateAPIView,
    generics.RetrieveUpdateDestroyAPIView,
):
    permission_classes = [permissions.IsAuthenticated]

    @requires_scopes(["create:patient"])
    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        mapped_data = self.pydantic_schema(**serializer.data, user_id=request.user.id)
        result = self.repo.create(mapped_data)
        return Response(
            data=self.serializer_class(result).data, status=status.HTTP_201_CREATED
        )

    @requires_scopes(["get:patient"])
    def get(self, request, *args, **kwargs):
        meta = get_request_meta_data(request)
        if meta.patient_id is None:
            raise NotFound("Patient not found")
        result = self.repo.get(meta.patient_id)
        return Response(
            data=self.serializer_class(result).data, status=status.HTTP_200_OK
        )

    @requires_scopes(["update:patient"])
    def update(self, request, *args, **kwargs):
        meta = get_request_meta_data(request)
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        mapped_data = self.pydantic_schema(**serializer.data, user_id=request.user.id)
        if meta.patient_id is None:
            raise NotFound("Patient not found")
        result = self.repo.update(meta.patient_id, mapped_data)
        return Response(
            data=self.serializer_class(result).data, status=status.HTTP_200_OK
        )

    @requires_scopes(["delete:patient"])
    def delete(self, request, *args, **kwargs):
        meta = get_request_meta_data(request)
        if meta.patient_id is None:
            raise NotFound("Patient not found")
        self.repo.delete(meta.patient_id)
        return Response(status=status.HTTP_204_NO_CONTENT)


class GetPatientIDPresignedUrlView(CommonPatientView, generics.RetrieveAPIView):
    @requires_scopes(["update:patient"])
    def get(self, request, *args, **kwargs):
        extension = kwargs.get("extension")
        meta = get_request_meta_data(request)
        result = self.repo.create_upload_id_card(meta.patient_id, extension)
        return Response(data=result, status=status.HTTP_200_OK)


class GetPatientPOAPresignedUrlView(CommonPatientView, generics.RetrieveAPIView):
    @requires_scopes(["update:patient"])
    def get(self, request, *args, **kwargs):
        extension = kwargs.get("extension")
        meta = get_request_meta_data(request)
        result = self.repo.create_upload_poa_card(meta.patient_id, extension)
        return Response(data=result, status=status.HTTP_200_OK)


class PatientDocumentView(
    CommonPatientView, generics.RetrieveAPIView, generics.DestroyAPIView
):
    @requires_scopes(["get:patient"])
    def get(self, request, *args, **kwargs):
        id = kwargs.get("pk")
        PatientVerificationModel.objects.get(id=id)
        result = self.repo.get_download_url(id)
        return Response(data=result, status=status.HTTP_200_OK)

    @requires_scopes(["update:patient"])
    def delete(self, request, *args, **kwargs):
        id = kwargs.get("pk")
        PatientVerificationModel.objects.get(id=id)
        result = self.repo.delete_document(id)
        return Response(data=result, status=status.HTTP_204_NO_CONTENT)


class CreatePatientViewViaStaffApp(
    CommonPatientView,
    generics.CreateAPIView,
):
    permission_classes = [StaffPermission]

    @requires_scopes(["manage:patient"])
    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        mapped_data = self.pydantic_schema(**serializer.data)
        meta = get_request_meta_data(request)
        result = self.repo.create_via_staff_app(mapped_data, meta.practice_id)
        return Response(
            data=self.serializer_class(result).data, status=status.HTTP_201_CREATED
        )


class SearchPatientAutocompleteView(CommonPatientView, generics.ListAPIView):
    pagination_class = PatientPagination
    filter_backends = [filters.OrderingFilter]
    permission_classes = [StaffPermission]

    @requires_scopes(["manage:patient"])
    def list(self, request, *args, **kwargs):
        meta = get_request_meta_data(request)
        patient_ids = PatientPracticeModel.objects.filter(practice_id=meta.practice_id)

        name = self.request.query_params.get("name")
        size = int(self.request.query_params.get("size", "50"))
        search_result = self.repo.autocomplete_search(name, meta.practice_id, size)
        q = self.queryset.filter(id__in=[x.id for x in search_result])

        queryset = self.filter_queryset(
            q.filter(id__in=[x.patient.id for x in patient_ids])
        )
        page = self.paginate_queryset(queryset)
        if page is not None:
            q = list(
                map(
                    lambda x: self.repo.get(x.id),
                    page,
                )
            )
            serializer = self.get_serializer(q, many=True)
            return self.get_paginated_response(serializer.data)

        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data)


class CheckPatientOnboardedView(
    CommonPatientView,
    generics.RetrieveUpdateDestroyAPIView,
):
    serializer_class = OnboardedSerializer

    @requires_scopes(["get:patient"])
    def get(self, request, *args, **kwargs):
        try:
            instance_id = convert_user_id_to_patient_id(request.user.id)
            result = self.repo.check_has_onboarded(instance_id)
        except NotFound:
            result = False
        return Response(
            data=self.serializer_class({"has_onboarded": result}).data,
            status=status.HTTP_200_OK,
        )
