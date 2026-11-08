import hashlib
from django.utils import timezone
from rest_framework import authentication, exceptions
from .models import DeviceCredential, Device


class AnonymousHardwareUser:
    """Represents an authenticated hardware device persona in DRF request context."""
    is_authenticated = True
    is_anonymous = False
    role = "DEVICE"

    def __init__(self, device: Device):
        self.device = device
        self.id = device.id
        self.username = f"device_{device.device_identifier}"
        self.email = f"{device.device_identifier}@device.orthosense.health"

    def __str__(self):
        return f"HardwareUser({self.device.device_identifier})"


class DeviceBearerAuthentication(authentication.BaseAuthentication):
    """
    Authenticates hardware devices transmitting high-frequency telemetry via:
    Authorization: DeviceBearer <token>
    or Authorization: Bearer <token>
    or header X-Device-Token: <token>
    """
    keyword = "DeviceBearer"

    def authenticate(self, request):
        auth_header = request.headers.get("Authorization")
        device_token = None

        if auth_header:
            parts = auth_header.split()
            if len(parts) == 2 and parts[0].lower() in ["devicebearer", "bearer"]:
                device_token = parts[1]

        if not device_token:
            device_token = request.headers.get("X-Device-Token")

        if not device_token:
            return None  # Pass to next authentication class (e.g. SessionAuth)

        token_hash = hashlib.sha256(device_token.encode("utf-8")).hexdigest()

        try:
            credential = DeviceCredential.objects.select_related("device").get(
                hashed_token=token_hash
            )
        except DeviceCredential.DoesNotExist:
            raise exceptions.AuthenticationFailed("Invalid hardware device credentials.")

        if credential.is_revoked or credential.device.status == Device.Status.REVOKED:
            raise exceptions.AuthenticationFailed("Device credentials have been revoked by clinical administrator.")

        if credential.expires_at and credential.expires_at < timezone.now():
            raise exceptions.AuthenticationFailed("Device credentials have expired. Please re-pair device.")

        hardware_user = AnonymousHardwareUser(credential.device)
        return (hardware_user, credential.device)

    def authenticate_header(self, request):
        return self.keyword

