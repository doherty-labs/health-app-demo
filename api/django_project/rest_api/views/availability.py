from rest_framework import generics, status
from rest_framework.permissions import BasePermission
from rest_framework.response import Response
from rest_framework.schemas.openapi import AutoSchema
from rest_framework.views import APIView

from django_project.auth_utils import requires_scopes
from rest_api.factory.repo import GpBaseInjector
from rest_api.models.appointment import AvailableAppointmentModel
from rest_api.repositories.availability import AvailabilityRepo
from rest_api.repositories.permissions import (
    PatientPermissionReadOnly,
    PatientPermissionReadWrite,
    StaffPermission,
)
from rest_api.schemas.availability import AvailableAppointmentSchema
from rest_api.serializers.availability import AvailabilitySerializer
from rest_api.utils.request_handler import get_request_meta_data


class CommonAvailabilityView(APIView, AutoSchema):
    serializer_class = AvailabilitySerializer
    permission_classes: list[BasePermission] = [
        PatientPermissionReadWrite | StaffPermission
    ]
    pydantic_schema = AvailableAppointmentSchema
    repo = GpBaseInjector.get(AvailabilityRepo)
    queryset = AvailableAppointmentModel.objects.all()


class CreateAvailabilityView(
    CommonAvailabilityView,
    generics.CreateAPIView,
):
    permission_classes = [StaffPermission]

    @requires_scopes(["update:practice"])
    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        meta = get_request_meta_data(request)
        mapped_data = self.pydantic_schema(
            **serializer.data, staff_id=meta.staff_id, practice_id=meta.practice_id
        )
        result = self.repo.create(mapped_data)
        return Response(
            data=self.serializer_class(result).data, status=status.HTTP_201_CREATED
        )


class ManageAvailabilityView(
    CommonAvailabilityView, generics.RetrieveUpdateDestroyAPIView
):
    permission_classes = [StaffPermission | PatientPermissionReadOnly]

    @requires_scopes(["get:practice"])
    def get(self, request, *args, **kwargs):
        instance = self.get_object()
        result = self.repo.get(instance.id)
        return Response(
            data=self.serializer_class(result).data, status=status.HTTP_200_OK
        )

    @requires_scopes(["update:practice"])
    def update(self, request, *args, **kwargs):
        instance = self.get_object()
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        meta = get_request_meta_data(request)
        mapped_data = self.pydantic_schema(
            **serializer.data, staff_id=meta.staff_id, practice_id=meta.practice_id
        )
        result = self.repo.update(instance.id, mapped_data)
        return Response(
            data=self.serializer_class(result).data, status=status.HTTP_200_OK
        )

    @requires_scopes(["update:practice"])
    def delete(self, request, *args, **kwargs):
        instance = self.get_object()
        self.repo.delete(instance.id)
        return Response(status=status.HTTP_204_NO_CONTENT)


class ListAvailabilityByTeamMemberView(
    CommonAvailabilityView, generics.RetrieveAPIView
):
    @requires_scopes(["get:practice"])
    def get(self, request, *args, **kwargs):
        practice_id = kwargs.get("practice_id")
        team_member_id = kwargs.get("team_member_id")
        start_date = request.query_params.get("start_date", "")
        end_date = request.query_params.get("end_date", "")
        queryset = self.filter_queryset(
            self.get_queryset()
            .filter(
                practice_id=practice_id,
                team_member_id=team_member_id,
                start_time__gte=start_date,
                start_time__lte=end_date,
            )
            .order_by("-updated_at")
        )

        q = list(
            map(
                lambda x: self.repo.get(x.id),
                queryset,
            )
        )
        serializer = self.get_serializer(q, many=True)
        return Response(
            data={
                "results": serializer.data,
            },
            status=status.HTTP_200_OK,
        )
