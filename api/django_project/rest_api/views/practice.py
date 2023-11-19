from rest_framework import filters, generics, permissions, status
from rest_framework.generics import GenericAPIView
from rest_framework.pagination import PageNumberPagination
from rest_framework.response import Response
from rest_framework.schemas.openapi import AutoSchema
from rest_framework.views import APIView

from django_project.auth_utils import requires_scopes
from rest_api.factory.repo import GpBaseInjector
from rest_api.models.practice import PracticeModel
from rest_api.repositories.practice import PracticeRepo
from rest_api.schemas.practice import PracticeSummarySchema
from rest_api.serializers.common import AllFeatureFlagsSerializer
from rest_api.serializers.practice import InviteUserSerializer, PracticeSerializer
from rest_api.utils.request_handler import get_request_meta_data


class CommonPracticeView(APIView, AutoSchema):
    serializer_class = PracticeSerializer
    permission_classes = [permissions.IsAuthenticated]
    pydantic_schema = PracticeSummarySchema
    repo = GpBaseInjector.get(PracticeRepo)
    queryset = PracticeModel.objects.all()


class PracticePagination(PageNumberPagination):
    page_size = 50
    max_page_size = 50


class CreatePracticeView(
    CommonPracticeView,
    generics.CreateAPIView,
):
    @requires_scopes(["create:practice"])
    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        mapped_data = self.pydantic_schema(**serializer.data, staff_id=request.user.id)
        result = self.repo.create(mapped_data)
        return Response(
            data=self.serializer_class(result).data, status=status.HTTP_201_CREATED
        )


class ManagePracticeView(CommonPracticeView, generics.RetrieveUpdateDestroyAPIView):
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
        mapped_data = self.pydantic_schema(**serializer.data, staff_id=meta.staff_id)
        result = self.repo.update(instance.id, mapped_data)
        return Response(
            data=self.serializer_class(result).data, status=status.HTTP_200_OK
        )

    @requires_scopes(["delete:practice"])
    def delete(self, request, *args, **kwargs):
        instance = self.get_object()
        self.repo.delete(instance.id)
        return Response(status=status.HTTP_204_NO_CONTENT)


class ListPracticeView(CommonPracticeView, generics.ListAPIView):
    pagination_class = PracticePagination
    filter_backends = [filters.OrderingFilter]
    ordering_fields = ["name"]
    permission_classes = [permissions.AllowAny]

    def list(self, request, *args, **kwargs):
        queryset = self.filter_queryset(self.get_queryset())
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


class SearchPracticeView(CommonPracticeView, generics.ListAPIView):
    permission_classes = [permissions.AllowAny]

    def get_queryset(self):
        name = self.request.query_params.get("name")
        size = int(self.request.query_params.get("size", "10"))
        search_result = self.repo.search(name, size)
        return self.queryset.filter(id__in=[x.id for x in search_result])

    def list(self, request, *args, **kwargs):
        queryset = self.filter_queryset(self.get_queryset())
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


class OnboardPracticeView(CommonPracticeView, GenericAPIView):
    @requires_scopes(["update:practice"])
    def post(self, request, *args, **kwargs):
        instance = self.get_object()
        self.repo.create_org(instance.id)
        return Response(status=status.HTTP_204_NO_CONTENT)


class InviteUserToPracticeView(CommonPracticeView, GenericAPIView):
    serializer_class = InviteUserSerializer

    @requires_scopes(["update:practice"])
    def post(self, request, *args, **kwargs):
        instance = self.get_object()
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        self.repo.create_auth0_user(instance.id, serializer.data["email"])
        return Response(status=status.HTTP_204_NO_CONTENT)


class DeletePracticeOrgView(CommonPracticeView, GenericAPIView):
    @requires_scopes(["update:practice"])
    def delete(self, request, *args, **kwargs):
        instance = self.get_object()
        self.repo.delete_org(instance.id)
        return Response(status=status.HTTP_204_NO_CONTENT)


class SearchPracticeAutocompleteView(CommonPracticeView, generics.RetrieveAPIView):
    permission_classes = [permissions.AllowAny]

    def get(self, request, *args, **kwargs):
        name = self.request.query_params.get("name")
        size = int(self.request.query_params.get("size", "5"))
        search_result = self.repo.autocomplete_search(name, size)
        return Response(
            data=self.serializer_class(search_result, many=True).data,
            status=status.HTTP_200_OK,
        )


class GetPracticeBySlugView(CommonPracticeView, generics.RetrieveAPIView):
    permission_classes = [permissions.AllowAny]
    lookup_field = "slug"

    def get(self, request, *args, **kwargs):
        instance = self.repo.get_model_by_slug(kwargs["slug"])
        result = self.repo.get(instance.id)
        return Response(
            data=self.serializer_class(result).data, status=status.HTTP_200_OK
        )


class GetPracticeByOrgIDView(CommonPracticeView, generics.RetrieveAPIView):
    permission_classes = [permissions.AllowAny]
    lookup_field = "org_id"

    def get(self, request, *args, **kwargs):
        instance = self.repo.get_model_by_org_id(kwargs["org_id"])
        result = self.repo.get(instance.id)
        return Response(
            data=self.serializer_class(result).data, status=status.HTTP_200_OK
        )


class FeatureFlagsView(CommonPracticeView, generics.RetrieveAPIView):
    permission_classes = [permissions.AllowAny]
    serializer_class = AllFeatureFlagsSerializer

    def get(self, request, *args, **kwargs):
        flags = self.repo.feature_flags
        return Response(
            data=self.serializer_class({"flags": flags}).data, status=status.HTTP_200_OK
        )
