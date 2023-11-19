"""django_project URL Configuration

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/3.2/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""
from django.contrib import admin
from django.urls import path
from rest_framework import permissions
from rest_framework.schemas import get_schema_view

from rest_api.channels import AvailabilityConsumer, TaskProgressConsumer
from rest_api.views.appointment import (
    AppointmentDocDownloadPresignedUrlView,
    CreateAppointmentStaffAppView,
    CreateAppointmentView,
    GetAppointmentAnalyticsView,
    GetAppointmentStateView,
    GetAppointmentUploadPresignedUrlView,
    GetAppointmentView,
    ListAppointmentByPracticeStateView,
    ListAppointmentView,
)
from rest_api.views.availability import (
    CreateAvailabilityView,
    ListAvailabilityByTeamMemberView,
    ManageAvailabilityView,
)
from rest_api.views.booking import (
    CreateBookingInvitationView,
    CreateBookingView,
    GetBookingOptionsView,
    GetInviteView,
    ManageBookingView,
    SearchBookingView,
)
from rest_api.views.patient import (
    CheckPatientOnboardedView,
    CreatePatientViewViaStaffApp,
    GetPatientIDPresignedUrlView,
    GetPatientPOAPresignedUrlView,
    ManagePatientView,
    PatientDocumentView,
    SearchPatientAutocompleteView,
)
from rest_api.views.practice import (
    CreatePracticeView,
    DeletePracticeOrgView,
    FeatureFlagsView,
    GetPracticeByOrgIDView,
    GetPracticeBySlugView,
    InviteUserToPracticeView,
    ListPracticeView,
    ManagePracticeView,
    OnboardPracticeView,
    SearchPracticeAutocompleteView,
    SearchPracticeView,
)
from rest_api.views.prescription import (
    CreatePrescriptionStaffAppView,
    CreatePrescriptionView,
    GetPrescriptionAnalyticsView,
    GetPrescriptionStateView,
    GetPrescriptionView,
    ListPrescriptionByPracticeStateView,
    ListPrescriptionView,
)
from rest_api.views.sample import AuthViewTest
from rest_api.views.staff import (
    CheckStaffOnboardedView,
    ManageStaffView,
    SearchStaffAutocompleteView,
)

rest_api_urlpatterns = [
    # Practice
    path("practice/create", CreatePracticeView.as_view()),
    path("practice/<int:pk>/manage", ManagePracticeView.as_view()),
    path("practices/<int:pk>/create-org", OnboardPracticeView.as_view()),
    path("practices/<int:pk>/delete-org", DeletePracticeOrgView.as_view()),
    path("practices/<int:pk>/invite-user", InviteUserToPracticeView.as_view()),
    path("practices", ListPracticeView.as_view()),
    path("practices/search", SearchPracticeView.as_view()),
    path("practices/autocomplete", SearchPracticeAutocompleteView.as_view()),
    path("practices/find/<slug:slug>", GetPracticeBySlugView.as_view()),
    path("practices/get/org-id/<str:org_id>", GetPracticeByOrgIDView.as_view()),
    path("feature-flags", FeatureFlagsView.as_view()),
    # Patient
    path("patient/manage", ManagePatientView.as_view()),
    path("patient/onboarded", CheckPatientOnboardedView.as_view()),
    path("patient/upload/id/<str:extension>", GetPatientIDPresignedUrlView.as_view()),
    path("patient/upload/poa/<str:extension>", GetPatientPOAPresignedUrlView.as_view()),
    path("patient/document/<int:pk>", PatientDocumentView.as_view()),
    # Staff
    path("staff/user", ManageStaffView.as_view()),
    path("staff/onboarded", CheckStaffOnboardedView.as_view()),
    path("staff/user/search", SearchStaffAutocompleteView.as_view()),
    path("staff/patient/create", CreatePatientViewViaStaffApp.as_view()),
    path("staff/patient/search", SearchPatientAutocompleteView.as_view()),
    path(
        "staff/patient/<int:patient_id>/appointment/create",
        CreateAppointmentStaffAppView.as_view(),
    ),
    path(
        "staff/patient/<int:patient_id>/prescription/create",
        CreatePrescriptionStaffAppView.as_view(),
    ),
    # Analytics
    path(
        "analytics/appointment/start-date/<str:start_date>/end-date/<str:end_date>/interval/<str:interval>",
        GetAppointmentAnalyticsView.as_view(),
    ),
    path(
        "analytics/prescription/start-date/<str:start_date>/end-date/<str:end_date>/interval/<str:interval>",
        GetPrescriptionAnalyticsView.as_view(),
    ),
    # Appointment
    path(
        "appointment/create/practice/<slug:practice_slug>",
        CreateAppointmentView.as_view(),
    ),
    path(
        "appointment/<int:pk>/upload/extension/<str:extension>",
        GetAppointmentUploadPresignedUrlView.as_view(),
    ),
    path(
        "appointment/<int:pk>",
        GetAppointmentView.as_view(),
    ),
    path(
        "appointments",
        ListAppointmentView.as_view(),
    ),
    path(
        "practice/<int:pk>/appointments/state/<str:state>",
        ListAppointmentByPracticeStateView.as_view(),
    ),
    path(
        "states/appointment",
        GetAppointmentStateView.as_view(),
    ),
    path(
        "appointment/doc/<int:pk>/download",
        AppointmentDocDownloadPresignedUrlView.as_view(),
    ),
    # Prescription
    path(
        "prescription/create/practice/<slug:practice_slug>",
        CreatePrescriptionView.as_view(),
    ),
    path(
        "prescription/<int:pk>",
        GetPrescriptionView.as_view(),
    ),
    path(
        "prescriptions",
        ListPrescriptionView.as_view(),
    ),
    path(
        "states/prescription",
        GetPrescriptionStateView.as_view(),
    ),
    path(
        "practice/<int:pk>/prescriptions/state/<str:state>",
        ListPrescriptionByPracticeStateView.as_view(),
    ),
    # Availability
    path("availability/create", CreateAvailabilityView.as_view()),
    path(
        "availability/practice/<int:practice_id>/member/<int:team_member_id>",
        ListAvailabilityByTeamMemberView.as_view(),
    ),
    path("availability/<int:pk>/manage", ManageAvailabilityView.as_view()),
    # Booking
    path("booking/create", CreateBookingView.as_view()),
    path(
        "booking/invitation/create/appointment/<int:pk>/",
        CreateBookingInvitationView.as_view(),
    ),
    path("booking/options", GetBookingOptionsView.as_view()),
    path("booking/invitation/<int:pk>/", GetInviteView.as_view()),
    path("booking/<int:pk>/manage", ManageBookingView.as_view()),
    path("booking/search", SearchBookingView.as_view()),
    # Test
    path("sample/get", AuthViewTest.as_view()),
]

urlpatterns = [
    path("admin/", admin.site.urls),
    path(
        "openapi",
        get_schema_view(
            title="GPBase API",
            description="API for all things …",
            version="1.0.0",
            permission_classes=[permissions.AllowAny],
            public=True,
            patterns=rest_api_urlpatterns,
        ),
    ),
] + rest_api_urlpatterns

websocket_urlpatterns = [
    path("task/progress/<str:taskID>/", TaskProgressConsumer.as_asgi()),
    path("practice/<str:practiceID>/availability", AvailabilityConsumer.as_asgi()),
]
