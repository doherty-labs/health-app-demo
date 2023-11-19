from rest_framework import generics, status
from rest_framework.pagination import PageNumberPagination
from rest_framework.permissions import BasePermission
from rest_framework.response import Response
from rest_framework.schemas.openapi import AutoSchema
from rest_framework.views import APIView

from django_project.auth_utils import requires_scopes
from rest_api.factory.repo import GpBaseInjector
from rest_api.models.booking import BookingInviteModel, BookingModel
from rest_api.repositories.booking import BookingRepo
from rest_api.repositories.permissions import (
    PatientPermissionReadWrite,
    StaffPermission,
)
from rest_api.schemas.booking import BookingSchema
from rest_api.serializers.availability import AvailabilitySerializer
from rest_api.serializers.booking import BookingInviteSerializer, BookingSerializer
from rest_api.utils.request_handler import get_request_meta_data


class BookingPagination(PageNumberPagination):
    page_size = 50
    max_page_size = 50


class CommonBookingView(APIView, AutoSchema):
    serializer_class = BookingSerializer
    permission_classes: list[BasePermission] = [
        PatientPermissionReadWrite | StaffPermission
    ]
    pydantic_schema = BookingSchema
    repo = GpBaseInjector.get(BookingRepo)
    queryset = BookingModel.objects.all()


class CreateBookingView(
    CommonBookingView,
    generics.CreateAPIView,
):
    @requires_scopes(["create:appointment"])
    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        mapped_data = BookingSchema(
            appointment_id=serializer.data.get("appointment_id"),
            available_appointment_id=serializer.data.get("available_appointment_id"),
            booked_by_id=request.user.id,
            invitation_id=serializer.data.get("invitation_id"),
        )
        result = self.repo.submit_booking(mapped_data)
        return Response(
            data=self.serializer_class(result).data, status=status.HTTP_201_CREATED
        )


class CreateBookingInvitationView(
    CommonBookingView,
    generics.CreateAPIView,
):
    serializer_class = BookingInviteSerializer
    permission_classes: list[BasePermission] = [StaffPermission]

    @requires_scopes(["create:appointment"])
    def create(self, request, *args, **kwargs):
        staff_id = get_request_meta_data(request).staff_id
        appointment_id = kwargs.get("pk")
        result = self.repo.create_invitation(
            appointment_id=appointment_id, staff_id=staff_id
        )
        return Response(
            data=self.serializer_class(result).data, status=status.HTTP_201_CREATED
        )


class GetBookingOptionsView(CommonBookingView, generics.RetrieveAPIView):
    serializer_class = AvailabilitySerializer

    @requires_scopes(["get:appointment"])
    def retrieve(self, request, *args, **kwargs):
        practice_id = int(self.request.query_params.get("practice_id"))
        team_member_id = self.request.query_params.get("team_member_id", None)
        from_date = self.request.query_params.get("from_date", None)
        to_date = self.request.query_params.get("to_date", None)

        q = self.repo.get_booking_options(
            practice_id=practice_id,
            team_member_id=int(team_member_id) if team_member_id else None,
            from_date=from_date,
            to_date=to_date,
        )

        serializer = self.get_serializer(q, many=True)
        return Response(
            data={
                "results": serializer.data,
            },
            status=status.HTTP_200_OK,
        )


class ManageBookingView(CommonBookingView, generics.RetrieveUpdateDestroyAPIView):
    permission_classes = [StaffPermission | PatientPermissionReadWrite]

    @requires_scopes(["get:appointment"])
    def get(self, request, *args, **kwargs):
        instance = self.get_object()
        result = self.repo.get(instance.id)
        return Response(
            data=self.serializer_class(result).data, status=status.HTTP_200_OK
        )

    @requires_scopes(["update:appointment"])
    def update(self, request, *args, **kwargs):
        instance = self.get_object()
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        mapped_data = self.repo.get(instance.id)
        mapped_data.attendance_status = serializer.data.get("attendance_status")
        result = self.repo.update(instance.id, mapped_data)
        return Response(
            data=self.serializer_class(result).data, status=status.HTTP_200_OK
        )

    @requires_scopes(["update:appointment"])
    def delete(self, request, *args, **kwargs):
        instance = self.get_object()
        self.repo.delete(instance.id)
        return Response(status=status.HTTP_204_NO_CONTENT)


class SearchBookingView(CommonBookingView, generics.RetrieveAPIView):
    @requires_scopes(["get:appointment"])
    def retrieve(self, request, *args, **kwargs):
        practice_id = self.request.query_params.get("practice_id")
        team_member_id = self.request.query_params.get("team_member_id")
        from_date = self.request.query_params.get("from_date")
        to_date = self.request.query_params.get("to_date")
        patient_id = self.request.query_params.get("patient_id")
        appointment_id = self.request.query_params.get("appointment_id")

        meta = get_request_meta_data(request)
        if meta.patient_id:
            patient_id = meta.patient_id

        q = self.repo.search(
            practice_id=practice_id,
            team_member_id=team_member_id,
            from_date=from_date,
            to_date=to_date,
            patient_id=patient_id,
            appointment_id=appointment_id,
        )

        serializer = self.get_serializer(q, many=True)
        return Response(
            data={
                "results": serializer.data,
            },
            status=status.HTTP_200_OK,
        )


class GetInviteView(CommonBookingView, generics.RetrieveAPIView):
    serializer_class = BookingInviteSerializer
    queryset = BookingInviteModel.objects.all()

    @requires_scopes(["get:appointment"])
    def get(self, request, *args, **kwargs):
        instance = self.get_object()
        result = self.repo.get_booking_invite(instance.id)
        return Response(
            data=self.serializer_class(result).data, status=status.HTTP_200_OK
        )
