from django.utils import timezone
from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response
from drf_spectacular.utils import extend_schema

from .models import Device, TechnicalAlert
from .serializers import DeviceSerializer, DeviceCreateSerializer, TechnicalAlertSerializer
from apps.accounts.permissions import IsAdministrator
from apps.accounts.models import AuditLogEntry


class DeviceViewSet(viewsets.ModelViewSet):
    """
    CRUD for ESP32-S3 hardware devices and token issuance.
    """
    queryset = Device.objects.all().prefetch_related("sensor_channels", "assignments__patient")
    permission_classes = [permissions.IsAuthenticated]

    def get_serializer_class(self):
        if self.action == "create":
            return DeviceCreateSerializer
        return DeviceSerializer

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
        raw_token = getattr(device.credential, "raw_token_display", "")

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
        device.last_seen_at = timezone.now()
        device.save(update_fields=["last_seen_at"])
        return Response({"status": "pong", "device_id": str(device.id), "timestamp": timezone.now().isoformat()})


class TechnicalAlertViewSet(viewsets.ReadOnlyModelViewSet):
    """
    Real-time technical alerts emitted across the device fleet.
    """
    queryset = TechnicalAlert.objects.all()
    serializer_class = TechnicalAlertSerializer
    permission_classes = [permissions.IsAuthenticated]

