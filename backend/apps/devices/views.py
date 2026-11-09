from django.utils import timezone
from django.db import transaction
from rest_framework import views
from .authentication import DeviceBearerAuthentication
from .serializers import HeartbeatInput, AssignmentInput
from .models import DeviceAssignment, DeviceCredential
from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response
from drf_spectacular.utils import extend_schema

from .models import Device, TechnicalAlert
from .serializers import DeviceSerializer, DeviceCreateSerializer, TechnicalAlertSerializer
from apps.accounts.permissions import IsAdministrator, IsClinician
from apps.accounts.models import AuditLogEntry, User, ClinicianAssignment


def scoped_device_ids(user):
    devices = Device.objects.all()
    if not user or not user.is_authenticated:
        return devices.none().values_list("pk", flat=True)
    if user.role == User.Role.ADMIN:
        return devices.values_list("pk", flat=True)
    if user.role == User.Role.PATIENT:
        devices = devices.filter(assignments__active=True, assignments__patient=user)
    elif user.role == User.Role.CLINICIAN:
        patient_ids = ClinicianAssignment.objects.filter(clinician=user, active=True).values_list("patient_id", flat=True)
        devices = devices.filter(assignments__active=True, assignments__patient_id__in=patient_ids)
    else:
        devices = devices.none()
    return devices.values_list("pk", flat=True)


class DeviceViewSet(viewsets.ModelViewSet):
    """
    CRUD for ESP32-S3 hardware devices and token issuance.
    """
    queryset = Device.objects.all().prefetch_related("sensor_channels", "assignments__patient")
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return super().get_queryset().filter(pk__in=scoped_device_ids(self.request.user))

    def get_permissions(self):
        if self.action in ("create", "update", "partial_update", "destroy", "revoke"):
            return [IsAdministrator()]
        return super().get_permissions()

    def get_serializer_class(self):
        if self.action == "create":
            return DeviceCreateSerializer
        return DeviceSerializer

    def destroy(self, request, *args, **kwargs):
        device = self.get_object()
        if device.recorded_sessions.exists() or device.emitted_batches.exists():
            return Response({"detail": "A device with session history must be revoked, not deleted."}, status=status.HTTP_400_BAD_REQUEST)
        return super().destroy(request, *args, **kwargs)

    def create(self, request, *args, **kwargs):
        # Only Admins can register/provision new devices
        if request.user.role != "ADMIN":
            return Response(
                {"error": "Only system administrators can register hardware devices."},
                status=status.HTTP_403_FORBIDDEN,
            )

        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        device = serializer.save()

        # Audit log
        AuditLogEntry.objects.create(
            actor=request.user,
            actor_name=request.user.full_name,
            actor_role=request.user.role,
            action="DEVICE_REGISTERED",
            target_type="device",
            target_id=str(device.id),
            details=f"Device {device.device_identifier} registered with MAC {device.mac_address}.",
            severity="info",
            ip_address=request.META.get("REMOTE_ADDR"),
        )

        # Retrieve raw token display from credential
        raw_token = getattr(device, "_provisioned_token", "")

        response_data = DeviceSerializer(device).data
        response_data["hardwareBearerToken"] = raw_token
        return Response(response_data, status=status.HTTP_201_CREATED)

    @action(detail=True, methods=["post"], permission_classes=[permissions.IsAuthenticated, IsAdministrator])
    def revoke(self, request, pk=None):
        """Revokes bearer credentials for a compromised or retired device."""
        device = self.get_object()
        if hasattr(device, "credential"):
            device.credential.is_revoked = True
            device.credential.save()

        device.status = Device.Status.REVOKED
        device.save()

        AuditLogEntry.objects.create(
            actor=request.user,
            actor_name=request.user.full_name,
            actor_role=request.user.role,
            action="DEVICE_REVOKED",
            target_type="device",
            target_id=str(device.id),
            details=f"Device {device.device_identifier} access token was permanently revoked.",
            severity="warning",
            ip_address=request.META.get("REMOTE_ADDR"),
        )
        return Response({"status": "Device credentials permanently revoked."}, status=status.HTTP_200_OK)

    @action(detail=True, methods=["post"])
    def ping(self, request, pk=None):
        """Diagnostic ping from web portal or hardware."""
        device = self.get_object()
        return Response({"status": "server_reachable", "device_id": str(device.id), "last_seen_at": device.last_seen_at})

    @action(detail=True, methods=["post"], permission_classes=[IsAdministrator])
    @transaction.atomic
    def assign(self, request, pk=None):
        self.get_object()
        data = AssignmentInput(data=request.data)
        data.is_valid(raise_exception=True)
        patient_id = data.validated_data["patient_id"]
        if patient_id:
            patient = User.objects.select_for_update().filter(pk=patient_id, role=User.Role.PATIENT, is_active=True).first()
            if not patient:
                return Response({"detail": "Active patient not found."}, status=400)
        device = Device.objects.select_for_update().get(pk=pk)
        if patient_id and device.status == Device.Status.REVOKED:
            return Response({"detail": "Rotate credentials before assigning a revoked device."}, status=400)
        if patient_id and (DeviceAssignment.objects.filter(patient_id=patient_id, active=True).exclude(device=device).exists() or DeviceAssignment.objects.filter(device=device, active=True).exclude(patient_id=patient_id).exists()):
            return Response({"detail": "Unassign the existing device/patient relationship explicitly first."}, status=409)
        DeviceAssignment.objects.filter(device=device, active=True).update(active=False)
        if patient_id:
            DeviceAssignment.objects.create(device=device, patient_id=patient_id, active=True, assigned_by=request.user)
        AuditLogEntry.objects.create(actor=request.user, actor_name=request.user.full_name, actor_role=request.user.role, action="DEVICE_ASSIGNMENT_CHANGED", target_type="device", target_id=str(device.pk), details="Device assignment updated.")
        return Response(DeviceSerializer(Device.objects.get(pk=device.pk)).data)

    @action(detail=True, methods=["post"], permission_classes=[IsAdministrator])
    @transaction.atomic
    def rotate(self, request, pk=None):
        import secrets, hashlib
        self.get_object()
        device = Device.objects.select_for_update().get(pk=pk)
        raw = "ortho_" + secrets.token_urlsafe(32)
        DeviceCredential.objects.update_or_create(device=device, defaults={"hashed_token": hashlib.sha256(raw.encode()).hexdigest(), "salt": secrets.token_hex(16), "raw_token_display": "", "is_revoked": False, "expires_at": None})
        device.status = Device.Status.ACTIVE
        device.last_seen_at = None
        device.health_report = {}
        device.save()
        AuditLogEntry.objects.create(actor=request.user, actor_name=request.user.full_name, actor_role=request.user.role, action="DEVICE_TOKEN_ROTATED", target_type="device", target_id=str(device.pk), details="Device credentials rotated.")
        return Response({"hardwareBearerToken": raw})


class TechnicalAlertViewSet(viewsets.ReadOnlyModelViewSet):
    """
    Real-time technical alerts emitted across the device fleet.
    """
    queryset = TechnicalAlert.objects.all()
    serializer_class = TechnicalAlertSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return super().get_queryset().filter(device_id__in=scoped_device_ids(self.request.user))


    @action(detail=True, methods=["post"], permission_classes=[IsAdministrator | IsClinician])
    def resolve(self, request, pk=None):
        alert = self.get_object()
        if not alert.resolved_at:
            alert.resolved_at = timezone.now()
            alert.save(update_fields=["resolved_at"])
            AuditLogEntry.objects.create(actor=request.user, actor_name=request.user.full_name, actor_role=request.user.role,
                action="TECHNICAL_ALERT_RESOLVED", target_type="alert", target_id=str(alert.pk), details="Technical alert marked resolved.")
        return Response(TechnicalAlertSerializer(alert).data)


class DeviceHeartbeatView(views.APIView):
    authentication_classes = [DeviceBearerAuthentication]
    permission_classes = [permissions.IsAuthenticated]

    @transaction.atomic
    @extend_schema(request=HeartbeatInput)
    def post(self, request):
        payload = HeartbeatInput(data=request.data)
        payload.is_valid(raise_exception=True)
        values = dict(payload.validated_data)
        device = Device.objects.select_for_update().get(pk=request.auth.pk)
        if values.pop("device_id") != device.device_identifier or device.status != Device.Status.ACTIVE:
            return Response({"detail": "Device identity/status mismatch."}, status=403)
        if "firmware_version" in values:
            device.firmware_version = values.pop("firmware_version")
        # Each heartbeat is a complete current health snapshot, not cached healthy defaults.
        values["reported_at"] = timezone.now().isoformat()
        device.health_report = values
        device.last_seen_at = timezone.now()
        device.save(update_fields=["health_report", "last_seen_at", "firmware_version", "updated_at"])
        for channel in values.get("channels", []):
            health = channel["health_status"]
            if health in ("DEGRADED", "STALE", "RAIL", "INVALID"):
                TechnicalAlert.objects.get_or_create(device=device, code=f"CH{channel['channel_index']}_{health}", resolved_at=None,
                    defaults={"message": f"{channel['label']}: device reported {health}", "severity": "WARNING"})
        return Response({"status": "accepted", "server_received_at": device.last_seen_at.isoformat()})
