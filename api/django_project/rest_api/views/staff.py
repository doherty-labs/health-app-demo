from rest_framework import generics, permissions, status
from rest_framework.exceptions import NotFound
from rest_framework.permissions import BasePermission
from rest_framework.response import Response
from rest_framework.schemas.openapi import AutoSchema
from rest_framework.views import APIView

from django_project.auth_utils import requires_scopes
from rest_api.factory.repo import GpBaseInjector
from rest_api.models.staff import StaffModel
from rest_api.repositories.permissions import PatientPermissionReadOnly, StaffPermission
from rest_api.repositories.staff import StaffRepo
from rest_api.schemas.staff import StaffMemberSchema
from rest_api.serializers.common import OnboardedSerializer
from rest_api.serializers.staff import StaffMemberSerializer
from rest_api.utils.request_handler import get_request_meta_data


class CommonStaffView(APIView, AutoSchema):
    serializer_class = StaffMemberSerializer
    permission_classes: list[BasePermission] = [
        PatientPermissionReadOnly | StaffPermission
    ]
    pydantic_schema = StaffMemberSchema
    repo = GpBaseInjector.get(StaffRepo)
    queryset = StaffModel.objects.all()


class ManageStaffView(
    CommonStaffView,
    generics.RetrieveAPIView,
    generics.UpdateAPIView,
    generics.CreateAPIView,
):
    @requires_scopes(["get:staff"])
    def retrieve(self, request, *args, **kwargs):
        meta = get_request_meta_data(request)
        result = self.repo.get(meta.staff_id)
        return Response(data=self.serializer_class(result).data)

    @requires_scopes(["update:staff"])
    def update(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        meta = get_request_meta_data(request)
        mapped_data = self.pydantic_schema(
            **serializer.data, user_id=request.user.id, practice_id=meta.practice_id
        )
        result = self.repo.update(meta.staff_id, mapped_data)
        return Response(data=self.serializer_class(result).data)

    @requires_scopes(["create:staff"])
    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        meta = get_request_meta_data(request)
        mapped_data = self.pydantic_schema(
            **serializer.data, user_id=request.user.id, practice_id=meta.practice_id
        )
        result = self.repo.create(mapped_data)
        return Response(data=self.serializer_class(result).data)


class SearchStaffAutocompleteView(CommonStaffView, generics.RetrieveAPIView):
    permission_classes = [permissions.IsAuthenticated]

    @requires_scopes(["get:staff"])
    def get(self, request, *args, **kwargs):
        name = self.request.query_params.get("name")
        size = int(self.request.query_params.get("size", "5"))
        meta = get_request_meta_data(request)
        search_result = self.repo.autocomplete_search(name, meta.practice_id, size)
        return Response(
            data=self.serializer_class(search_result, many=True).data,
            status=status.HTTP_200_OK,
        )


class CheckStaffOnboardedView(
    CommonStaffView,
    generics.RetrieveAPIView,
):
    permission_classes = [permissions.IsAuthenticated]
    serializer_class = OnboardedSerializer

    @requires_scopes(["get:staff"])
    def get(self, request, *args, **kwargs):
        try:
            meta = get_request_meta_data(request)
            result = self.repo.check_has_onboarded(meta.staff_id)
        except NotFound:
            result = False

        return Response(
            data=self.serializer_class({"has_onboarded": result}).data,
            status=status.HTTP_200_OK,
        )
