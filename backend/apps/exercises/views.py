from django.utils import timezone
from rest_framework import viewsets, permissions, status, views
from rest_framework.decorators import action
from rest_framework.response import Response
from drf_spectacular.utils import extend_schema

from .models import ExerciseDefinition, PlanVersion, ExercisePrescription
from .serializers import (
    ExerciseDefinitionSerializer,
    PlanVersionSerializer,
    PlanVersionCreateSerializer,
)
from apps.accounts.models import User, AuditLogEntry
from apps.accounts.permissions import IsClinician, IsAdministrator, IsAssignedClinicianOrSelf
from apps.accounts.mixins import ScopedPatientQuerySetMixin


class ExerciseDefinitionViewSet(viewsets.ModelViewSet):
    """
    Standardized orthopedic exercise library.
    """
    queryset = ExerciseDefinition.objects.all().order_by("name")
    serializer_class = ExerciseDefinitionSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_permissions(self):
        if self.action in ["create", "update", "partial_update", "destroy"]:
            return [permissions.IsAuthenticated(), IsClinician()]
        return [permissions.IsAuthenticated()]


class PlanVersionViewSet(ScopedPatientQuerySetMixin, viewsets.ModelViewSet):
    """
    Exercise plan authoring, versioning, and publishing workflow.
    Once a plan is published, it becomes legally immutable.
    """
    queryset = PlanVersion.objects.all().prefetch_related(
        "prescriptions__exercise", "patient", "authored_by"
    )
    permission_classes = [permissions.IsAuthenticated, IsAssignedClinicianOrSelf]
    patient_field_lookup = "patient"

    def get_serializer_class(self):
        if self.action == "create":
            return PlanVersionCreateSerializer
        return PlanVersionSerializer

    def update(self, request, *args, **kwargs):
        instance = self.get_object()
        if instance.status != PlanVersion.Status.DRAFT:
            return Response(
                {"error": "Published or archived plans cannot be edited. Please create a new draft version."},
                status=status.HTTP_400_BAD_REQUEST,
            )
        return super().update(request, *args, **kwargs)

    @action(detail=True, methods=["post"], permission_classes=[permissions.IsAuthenticated, IsClinician])
    def publish(self, request, pk=None):
        """
        POST /api/v1/plans/{id}/publish/
        Freezes the draft plan, stamps it as PUBLISHED, and archives any older published version.
        """
        plan = self.get_object()
        if plan.status == PlanVersion.Status.PUBLISHED:
            return Response({"detail": "Plan is already published."}, status=status.HTTP_200_OK)

        plan.publish()

        AuditLogEntry.objects.create(
            actor=request.user,
            actor_name=request.user.full_name,
            actor_role=request.user.role,
            action="PLAN_PUBLISHED",
            target_type="plan_version",
            target_id=str(plan.id),
            details=f"Plan Version {plan.version_number} published for patient {plan.patient.full_name}.",
            severity="info",
            ip_address=request.META.get("REMOTE_ADDR"),
        )

        return Response(PlanVersionSerializer(plan).data, status=status.HTTP_200_OK)


class MyPlanView(views.APIView):
    """
    GET /api/v1/my-plan/
    Returns the single most recently published PlanVersion for the authenticated patient.
    """
    permission_classes = [permissions.IsAuthenticated]

    @extend_schema(
        responses={200: PlanVersionSerializer},
        summary="My Published Exercise Plan",
        description="Returns the active published prescription for the current logged-in patient."
    )
    def get(self, request):
        patient = request.user
        if patient.role != User.Role.PATIENT:
            # If clinician or admin views this, allow specifying ?patient_id=...
            patient_id = request.query_params.get("patient_id")
            if patient_id:
                patient = User.objects.filter(id=patient_id, role=User.Role.PATIENT).first()
            if not patient:
                return Response(
                    {"detail": "Clinicians must provide a valid ?patient_id parameter."},
                    status=status.HTTP_400_BAD_REQUEST
                )

        plan = PlanVersion.objects.filter(
            patient=patient,
            status=PlanVersion.Status.PUBLISHED
        ).order_by("-version_number").prefetch_related("prescriptions__exercise").first()

        if not plan:
            # Fallback to latest draft if no published plan exists
            plan = PlanVersion.objects.filter(
                patient=patient
            ).order_by("-version_number").prefetch_related("prescriptions__exercise").first()

        if not plan:
            return Response(
                {"detail": "No active rehabilitation plan found for this patient."},
                status=status.HTTP_404_NOT_FOUND
            )

        return Response(PlanVersionSerializer(plan).data)

