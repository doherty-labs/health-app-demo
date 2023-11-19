from rest_framework import filters, generics, status
from rest_framework.pagination import PageNumberPagination
from rest_framework.permissions import BasePermission
from rest_framework.response import Response
from rest_framework.schemas.openapi import AutoSchema
from rest_framework.views import APIView

from django_project.auth_utils import requires_scopes
from rest_api.analytics.appointment import AppointmentAnalytics
from rest_api.analytics.schema import AppointmentAnalyticsSchema
from rest_api.factory.repo import GpBaseInjector
from rest_api.models.appointment import AppointmentDocumentModel, AppointmentModel
from rest_api.repositories.appointment import AppointmentRepo
from rest_api.repositories.permissions import (
    PatientPermissionReadWrite,
    StaffPermission,
)
from rest_api.repositories.utils import convert_practice_slug_to_id
from rest_api.schemas.appointment import AppointmentSchema
from rest_api.serializers.appointment import (
    AppointmentAnalyticsSchemaSerializer,
    AppointmentSerializer,
)
from rest_api.serializers.common import StatesSerializer
from rest_api.utils.request_handler import get_request_meta_data


class AppointmentPagination(PageNumberPagination):
    page_size = 50
    max_page_size = 50


class CommonAppointmentView(APIView, AutoSchema):
    serializer_class = AppointmentSerializer
    permission_classes: list[BasePermission] = [
        PatientPermissionReadWrite | StaffPermission
    ]
    pydantic_schema = AppointmentSchema
    repo = GpBaseInjector.get(AppointmentRepo)
    queryset = AppointmentModel.objects.all()


class CommonAppointmentAnalyticsView(APIView, AutoSchema):
    serializer_class = AppointmentAnalyticsSchemaSerializer
    permission_classes = [StaffPermission]
    pydantic_schema = AppointmentAnalyticsSchema
    repo = GpBaseInjector.get(AppointmentAnalytics)
    queryset = AppointmentModel.objects.all()


class CreateAppointmentView(
    CommonAppointmentView,
    generics.CreateAPIView,
):
    @requires_scopes(["create:appointment"])
    def create(self, request, *args, **kwargs):
        practice_slug = kwargs.get("practice_slug")
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        meta = get_request_meta_data(request)
        practice_id = convert_practice_slug_to_id(practice_slug)
        mapped_data = self.pydantic_schema(
            **serializer.data,
            patient_id=meta.patient_id,
            practice_id=practice_id,
            state="submitted"
        )
        result = self.repo.create(mapped_data)
        return Response(
            data=self.serializer_class(result).data, status=status.HTTP_201_CREATED
        )


class GetAppointmentView(
    CommonAppointmentView,
    generics.RetrieveAPIView,
    generics.UpdateAPIView,
):
    @requires_scopes(["get:appointment"])
    def retrieve(self, request, *args, **kwargs):
        pk = kwargs.get("pk")
        result = self.repo.get_with_tracking(pk, request.user.id)
        return Response(data=self.serializer_class(result).data)

    @requires_scopes(["update:appointment"])
    def update(self, request, *args, **kwargs):
        pk = kwargs.get("pk")
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user_id = request.user.id
        mapped_data = self.pydantic_schema(**serializer.data)
        result = self.repo.update(pk, mapped_data, user_id)
        return Response(data=self.serializer_class(result).data)


class ListAppointmentView(CommonAppointmentView, generics.ListAPIView):
    pagination_class = AppointmentPagination
    filter_backends = [filters.OrderingFilter]
    ordering_fields = ["-updated_at"]

    @requires_scopes(["get:appointment"])
    def list(self, request, *args, **kwargs):
        meta = get_request_meta_data(request)
        queryset = self.filter_queryset(
            self.get_queryset()
            .filter(patient_id=meta.patient_id)
            .order_by("-updated_at")
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


class GetAppointmentUploadPresignedUrlView(
    CommonAppointmentView, generics.RetrieveAPIView
):
    @requires_scopes(["update:appointment"])
    def get(self, request, *args, **kwargs):
        extension = kwargs.get("extension")
        id = kwargs.get("pk")
        meta = get_request_meta_data(request)
        instance = AppointmentModel.objects.get(id=id, patient_id=meta.patient_id)
        result = self.repo.create_upload_appointment_file(instance.id, extension)
        return Response(data=result, status=status.HTTP_200_OK)


class AppointmentDocDownloadPresignedUrlView(
    CommonAppointmentView, generics.RetrieveAPIView
):
    @requires_scopes(["update:appointment"])
    def get(self, request, *args, **kwargs):
        id = kwargs.get("pk")
        AppointmentDocumentModel.objects.get(id=id)
        result = self.repo.get_download_url(id)
        return Response(data=result, status=status.HTTP_200_OK)


class GetAppointmentStateView(CommonAppointmentView, generics.RetrieveAPIView):
    serializer_class = StatesSerializer

    def get(self, request, *args, **kwargs):
        states = self.repo.states
        result = self.serializer_class({"states": states}).data
        return Response(data=result, status=status.HTTP_200_OK)


class ListAppointmentByPracticeStateView(CommonAppointmentView, generics.ListAPIView):
    pagination_class = AppointmentPagination
    filter_backends = [filters.OrderingFilter]
    ordering_fields = ["-updated_at"]
    permission_classes = [StaffPermission]
    practice_id_arg = "pk"
    state_arg = "state"

    def get_queryset(self):
        name = self.request.query_params.get("name")
        size = int(self.request.query_params.get("size", "50"))
        if name and len(name) > 0:
            search_result = self.repo.autocomplete_search(name, size)
            return self.queryset.filter(id__in=[x.id for x in search_result])
        else:
            return self.queryset

    @requires_scopes(["manage:appointment"])
    def list(self, request, *args, **kwargs):
        practice_id = kwargs.get(self.practice_id_arg)
        state = kwargs.get(self.state_arg)
        queryset = self.filter_queryset(
            self.get_queryset()
            .filter(practice_id=practice_id, state=state)
            .order_by("-updated_at")
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


class CreateAppointmentStaffAppView(
    CommonAppointmentView,
    generics.CreateAPIView,
):
    @requires_scopes(["manage:appointment"])
    def create(self, request, *args, **kwargs):
        meta = get_request_meta_data(request)
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        mapped_data = self.pydantic_schema(
            **serializer.data,
            patient_id=meta.patient_id,
            practice_id=meta.practice_id,
            state="submitted"
        )
        result = self.repo.create(mapped_data)
        return Response(
            data=self.serializer_class(result).data, status=status.HTTP_201_CREATED
        )


class GetAppointmentAnalyticsView(
    CommonAppointmentAnalyticsView,
    generics.RetrieveAPIView,
):
    @requires_scopes(["manage:appointment"])
    def retrieve(self, request, *args, **kwargs):
        start_date = kwargs.get("start_date")
        end_date = kwargs.get("end_date")
        interval = kwargs.get("interval")
        meta = get_request_meta_data(request)
        result = self.repo.get_all_stats(
            meta.practice_id, start_date, end_date, interval
        )
        return Response(data=self.serializer_class(result).data)
