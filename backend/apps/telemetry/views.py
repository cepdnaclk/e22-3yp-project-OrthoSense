from django.db import transaction
from django.utils import timezone
from rest_framework import viewsets, permissions, status, views, mixins
from rest_framework.decorators import action
from rest_framework.response import Response
from drf_spectacular.utils import extend_schema, OpenApiTypes

from .models import Session, TelemetryBatch, ReviewNote
from .serializers import (
    SessionFilterSerializer,
    SessionTransitionSerializer,
    SessionSerializer,
    SessionCreateSerializer,
    SessionReviewSerializer,
    TelemetryIngestPayloadSerializer,
    PatientSessionUpdateSerializer,
)
from apps.devices.models import Device
from apps.accounts.permissions import IsClinician, IsPatient, IsClinicalUser, IsAssignedClinicianOrSelf
from apps.accounts.mixins import ScopedPatientQuerySetMixin
from apps.accounts.models import AuditLogEntry
from apps.devices.authentication import DeviceBearerAuthentication


class SessionViewSet(ScopedPatientQuerySetMixin, mixins.CreateModelMixin, mixins.UpdateModelMixin, viewsets.ReadOnlyModelViewSet):
    """
    Rehabilitation exercise session management and clinician review sign-offs.
    """
    queryset = Session.objects.all().select_related("patient", "plan_version__authored_by", "device", "prescription__exercise").prefetch_related("review_notes__clinician")
    patient_field_lookup = "patient"
    permission_classes = [IsClinicalUser, IsAssignedClinicianOrSelf]

    def get_permissions(self):
        if self.action in ("create", "update", "partial_update", "transition"):
            return [IsPatient(), IsAssignedClinicianOrSelf()]
        if self.action == "review":
            return [IsClinician(), IsAssignedClinicianOrSelf()]
        return super().get_permissions()

    def get_queryset(self):
        query = SessionFilterSerializer(data=self.request.query_params)
        query.is_valid(raise_exception=True)
        filters = query.validated_data
        qs = super().get_queryset()
        from datetime import datetime, time, timedelta, timezone as dt_timezone
        if "date_from" in filters:
            qs = qs.filter(started_at__gte=datetime.combine(filters["date_from"], time.min, tzinfo=dt_timezone.utc))
        if "date_to" in filters:
            qs = qs.filter(started_at__lte=datetime.combine(filters["date_to"], time.max, tzinfo=dt_timezone.utc))
        if "reviewed" in self.request.query_params:
            qs = qs.filter(doctor_reviewed=filters["reviewed"])
        return qs.order_by(filters["ordering"], "id")

    @extend_schema(parameters=[SessionFilterSerializer], responses={200: OpenApiTypes.OBJECT}, description="Scoped UTC session totals and patient/exercise daily mean maximum-flexion trends. Defaults to the latest 30 UTC dates.")
    @action(detail=False, methods=["get"])
    def summary(self, request):
        from .reporting import clinical_summary
        return Response(clinical_summary(self.get_queryset(), request.user, request.query_params))

    @transaction.atomic
    def perform_create(self, serializer):
        # Serialize retries of the same client-generated session UUID.
        from apps.accounts.models import User
        User.objects.select_for_update().get(pk=self.request.user.pk)
        serializer.save()

    def get_serializer_class(self):
        if self.action == "create":
            return SessionCreateSerializer
        if self.action == "transition":
            return SessionTransitionSerializer
        if self.action in ("update", "partial_update"):
            return PatientSessionUpdateSerializer
        return SessionSerializer

    @extend_schema(request=SessionReviewSerializer, responses={200: SessionSerializer})
    @action(detail=True, methods=["post"], permission_classes=[permissions.IsAuthenticated, IsClinician])
    def review(self, request, pk=None):
        """
        POST /api/v1/sessions/{id}/review/
        Allows supervising clinician to approve session, submit clinical feedback, and update review stamp.
        """
        serializer = SessionReviewSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        data = serializer.validated_data
        with transaction.atomic():
            scoped = self.get_object()
            session = Session.objects.select_for_update().get(pk=scoped.pk)
            if session.status != Session.Status.COMPLETED:
                return Response({"detail": "Only completed sessions can be reviewed."}, status=409)
            latest = session.review_notes.order_by("-reviewed_at", "-id").first()
            if latest and latest.content == data["notes"] and latest.clinician_id == request.user.pk:
                return Response(SessionSerializer(self.get_queryset().get(pk=session.pk)).data)
            if latest or session.doctor_reviewed:
                if not data["replace_review"] or str(data.get("expected_review_id")) != str(latest.pk if latest else None):
                    return Response({"detail": "Review changed. Reload and explicitly save a revision."}, status=409)
            note = ReviewNote.objects.create(session=session, clinician=request.user, content=data["notes"])
            session.doctor_reviewed = True
            session.doctor_reviewed_at = note.reviewed_at
            session.doctor_review_notes = note.content
            session.save(update_fields=["doctor_reviewed", "doctor_reviewed_at", "doctor_review_notes"])
            AuditLogEntry.objects.create(actor=request.user, actor_name=request.user.full_name,
                actor_role=request.user.role, action="SESSION_REVIEWED", target_type="session",
                target_id=str(session.pk), details="Saved clinician review " + str(note.pk),
                severity="info", ip_address=request.META.get("REMOTE_ADDR"))
            return Response(SessionSerializer(self.get_queryset().get(pk=session.pk)).data)

    @action(detail=True, methods=["get"])
    def telemetry(self, request, pk=None):
        """
        GET /api/v1/sessions/{id}/telemetry/?max_points=500
        Returns downsampled time-series trajectory points (knee angle, FSR ground load, skin temp).
        """
        session = self.get_object()
        try:
            max_points = int(request.query_params.get("max_points", 500))
            if not 3 <= max_points <= 5000:
                raise ValueError()
        except (ValueError, TypeError):
            return Response({"max_points": "Must be an integer between 3 and 5000."}, status=400)
        from .services import telemetry_points
        from .reporting import downsample_envelope
        return Response(downsample_envelope(telemetry_points(session), max_points))

    @action(detail=True, methods=["post"])
    def transition(self, request, pk=None):
        data = SessionTransitionSerializer(data=request.data)
        data.is_valid(raise_exception=True)
        operation = data.validated_data["operation"]
        with transaction.atomic():
            scoped = self.get_object()
            session = Session.objects.select_for_update().get(pk=scoped.pk)
            terminal = {"finish": Session.Status.COMPLETED, "abandon": Session.Status.ABANDONED}
            if session.status != Session.Status.IN_PROGRESS:
                if terminal.get(operation) == session.status:
                    if operation == "finish" and data.validated_data.get("patient_reported_reps") != session.patient_reported_reps:
                        return Response({"detail": "Finalization payload conflicts with saved values."}, status=409)
                    return Response(SessionSerializer(session).data)
                return Response({"detail": "Session is already closed."}, status=409)
            if operation == "pause":
                session.paused_at = session.paused_at or timezone.now()
            elif operation == "resume":
                session.paused_at = None
            else:
                if operation == "finish" and "patient_reported_reps" not in data.validated_data:
                    return Response({"patient_reported_reps": "Required to finish."}, status=400)
                from .services import summarize
                for key, value in summarize(session).items():
                    setattr(session, key, value)
                session.status = terminal[operation]
                session.ended_at = timezone.now()
                session.paused_at = None
                if operation == "finish":
                    session.patient_reported_reps = data.validated_data["patient_reported_reps"]
                else:
                    session.quality_flag = Session.QualityFlag.INCOMPLETE
            session.save()
            return Response(SessionSerializer(session).data)


class TelemetryIngestView(views.APIView):
    """
    POST /api/v1/telemetry/ingest/
    Hardware ingestion endpoint accepting batches from ESP32-S3 over Wi-Fi/HTTPS or BLE gateway.
    Enforces device token authentication, payload schema, and (device, boot_id, sequence_number) idempotency.
    """
    permission_classes = [permissions.IsAuthenticated]
    authentication_classes = [DeviceBearerAuthentication]

    @extend_schema(
        request=TelemetryIngestPayloadSerializer,
        summary="Device Telemetry Batch Ingestion",
        description="Ingests high-frequency IMU, FSR, and NTC data from physical smart knee brace."
    )
    def post(self, request):
        serializer = TelemetryIngestPayloadSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        data = serializer.validated_data

        device_identifier = data["device_id"]
        device = request.auth
        if not isinstance(device, Device) or device.device_identifier != device_identifier or device.status != Device.Status.ACTIVE:
            return Response({"detail": "Device identity does not match an active credential."}, status=status.HTTP_403_FORBIDDEN)

        # Lock the session for both ingestion and lifecycle transitions.
        with transaction.atomic():
            device = Device.objects.select_for_update().get(pk=device.pk)
            if device.status != Device.Status.ACTIVE:
                return Response({"detail": "Device is not active."}, status=403)
            session = Session.objects.select_for_update().filter(
                id=data["session_id"], device=device, patient__is_active=True,
                patient__device_assignments__device=device,
                patient__device_assignments__active=True).first()
            if not session:
                return Response({"detail": "Assigned session not found."}, status=404)
            seq = data["sequence_number"]
            payload = {key: value for key, value in data.items() if key != "session_id"}
            existing = TelemetryBatch.objects.filter(device=device, boot_id=data["boot_id"], sequence_number=seq).first()
            if existing:
                if existing.session_id != session.pk or existing.raw_payload != payload:
                    return Response({"detail": "Conflicting duplicate batch."}, status=409)
                return Response({"status": "already_stored", "sequence_number": seq, "session_id": str(session.pk)})
            if session.status != Session.Status.IN_PROGRESS or session.paused_at:
                return Response({"detail": "Session is not recording."}, status=409)
            previous = session.telemetry_batches.order_by("-elapsed_ms").first()
            if previous:
                last_ms = previous.elapsed_ms + previous.raw_payload["samples"][-1]["offset_ms"]
                if data["elapsed_ms"] + data["samples"][0]["offset_ms"] <= last_ms:
                    return Response({"elapsed_ms": "Batch overlaps or precedes stored samples."}, status=400)
                if previous.boot_id == data["boot_id"] and seq <= previous.sequence_number:
                    return Response({"sequence_number": "Must increase within a boot."}, status=400)
            TelemetryBatch.objects.create(session=session, device=device, sequence_number=seq,
                boot_id=data["boot_id"], elapsed_ms=data["elapsed_ms"], sample_count=len(data["samples"]), raw_payload=payload)
            device.last_seen_at = timezone.now()
            device.save(update_fields=["last_seen_at"])
            return Response({"status": "stored", "session_id": str(session.pk), "sequence_number": seq}, status=201)
