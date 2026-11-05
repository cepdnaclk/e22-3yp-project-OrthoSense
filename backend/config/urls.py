from django.contrib import admin
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from drf_spectacular.views import SpectacularAPIView, SpectacularSwaggerView

from apps.accounts.views import (
    LoginView,
    LogoutView,
    MeView,
    PatientViewSet,
    AuditLogViewSet,
)
from apps.devices.views import DeviceViewSet, TechnicalAlertViewSet
from apps.exercises.views import (
    ExerciseDefinitionViewSet,
    PlanVersionViewSet,
    MyPlanView,
)
from apps.telemetry.views import SessionViewSet, TelemetryIngestView
from apps.analytics.views import SystemHealthView

router = DefaultRouter()
router.register(r"patients", PatientViewSet, basename="patient")
router.register(r"plans", PlanVersionViewSet, basename="plan")
router.register(r"exercises", ExerciseDefinitionViewSet, basename="exercise")
router.register(r"devices", DeviceViewSet, basename="device")
router.register(r"alerts", TechnicalAlertViewSet, basename="alert")
router.register(r"sessions", SessionViewSet, basename="session")
router.register(r"audit-log", AuditLogViewSet, basename="audit-log")

urlpatterns = [
    path("admin/", admin.site.urls),
    
    # OpenAPI 3.1 Schema & Swagger UI Interactive Documentation
    path("api/schema/", SpectacularAPIView.as_view(), name="schema"),
    path("api/docs/", SpectacularSwaggerView.as_view(url_name="schema"), name="swagger-ui"),

    # System Health
    path("api/v1/health/", SystemHealthView.as_view(), name="health-check"),

    # Identity and Session Authentication
    path("api/v1/auth/login/", LoginView.as_view(), name="auth-login"),
    path("api/v1/auth/logout/", LogoutView.as_view(), name="auth-logout"),
    path("api/v1/auth/me/", MeView.as_view(), name="auth-me"),

    # Direct Clinical Endpoints
    path("api/v1/my-plan/", MyPlanView.as_view(), name="my-plan"),
    path("api/v1/telemetry/ingest/", TelemetryIngestView.as_view(), name="telemetry-ingest"),

    # Router Endpoints
    path("api/v1/", include(router.urls)),
]

