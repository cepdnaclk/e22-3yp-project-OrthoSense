import uuid
from django.db import models
from apps.accounts.models import User


class Device(models.Model):
    """
    Physical OrthoSense Smart Bionic Knee Brace running on ESP32-S3.
    """
    class Status(models.TextChoices):
        ACTIVE = "ACTIVE", "Active & Paired"
        REVOKED = "REVOKED", "Revoked"
        MAINTENANCE = "MAINTENANCE", "In Maintenance"
        UNPAIRED = "UNPAIRED", "Unpaired"

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    device_identifier = models.CharField(max_length=64, unique=True, db_index=True)
    mac_address = models.CharField(max_length=24, unique=True)
    hardware_revision = models.CharField(max_length=50, default="v2.1-BionicX")
    firmware_version = models.CharField(max_length=50, default="v2.1.0-RC4")
    status = models.CharField(max_length=30, choices=Status.choices, default=Status.ACTIVE, db_index=True)
    battery_percent = models.IntegerField(default=94)
    battery_voltage = models.FloatField(default=3.98)
    last_seen_at = models.DateTimeField(null=True, blank=True, db_index=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["-created_at"]

    def __str__(self):
        return f"{self.device_identifier} ({self.status}) - {self.battery_percent}%"


class DeviceAssignment(models.Model):
    """
    Associates a hardware device with an active patient rehabilitation lifecycle.
    """
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    device = models.ForeignKey(Device, on_delete=models.CASCADE, related_name="assignments")
    patient = models.ForeignKey(User, on_delete=models.CASCADE, related_name="device_assignments")
    assigned_at = models.DateTimeField(auto_now_add=True)
    active = models.BooleanField(default=True, db_index=True)
    assigned_by = models.ForeignKey(User, null=True, blank=True, on_delete=models.SET_NULL, related_name="device_deployments")

    class Meta:
        indexes = [
            models.Index(fields=["device", "active"]),
            models.Index(fields=["patient", "active"]),
        ]

    def __str__(self):
        return f"{self.device.device_identifier} -> {self.patient.full_name} (Active: {self.active})"


class DeviceCredential(models.Model):
    """
    Hardware cryptographic token for ESP32-S3 bearer authentication.
    """
    device = models.OneToOneField(Device, on_delete=models.CASCADE, related_name="credential")
    hashed_token = models.CharField(max_length=128, db_index=True)
    salt = models.CharField(max_length=64)
    raw_token_display = models.CharField(max_length=128, blank=True)
    expires_at = models.DateTimeField(null=True, blank=True)
    is_revoked = models.BooleanField(default=False, db_index=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Credential for {self.device.device_identifier} (Revoked: {self.is_revoked})"


class SensorChannel(models.Model):
    """
    Individual sensor channel exposed by the smart knee brace.
    """
    class SensorType(models.TextChoices):
        IMU_THIGH = "IMU_THIGH", "IMU 1 — Thigh Segment"
        IMU_SHANK = "IMU_SHANK", "IMU 2 — Shank Segment"
        FSR_INSOLE = "FSR_INSOLE", "Foot Insole Pressure FSRs"
        SEMG = "SEMG", "Surface sEMG Muscle Lead"
        NTC_TEMP = "NTC_TEMP", "Skin Temperature & Hinge Monitor"

    class ChannelHealth(models.TextChoices):
        HEALTHY = "HEALTHY", "Nominal & Active"
        DEGRADED = "DEGRADED", "Jitter / Noise Detected"
        STALE = "STALE", "No Response"
        RAIL = "RAIL", "ADC Rail Error"

    device = models.ForeignKey(Device, on_delete=models.CASCADE, related_name="sensor_channels")
    channel_index = models.IntegerField()
    sensor_type = models.CharField(max_length=50, choices=SensorType.choices)
    label = models.CharField(max_length=100)
    unit = models.CharField(max_length=30, blank=True)
    sampling_rate_hz = models.IntegerField(default=100)
    health_status = models.CharField(max_length=30, choices=ChannelHealth.choices, default=ChannelHealth.HEALTHY)
    calibration_date = models.DateField(null=True, blank=True)

    class Meta:
        unique_together = ("device", "channel_index")
        ordering = ["channel_index"]

    def __str__(self):
        return f"{self.device.device_identifier} [CH-{self.channel_index}] {self.label} ({self.health_status})"


class TechnicalAlert(models.Model):
    """
    Real-time technical alerts raised by device firmware or backend packet monitoring.
    """
    class Severity(models.TextChoices):
        INFO = "INFO", "Information"
        WARNING = "WARNING", "Warning"
        CRITICAL = "CRITICAL", "Critical Hardware Fault"

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    device = models.ForeignKey(Device, on_delete=models.CASCADE, related_name="technical_alerts")
    code = models.CharField(max_length=50, db_index=True)
    message = models.CharField(max_length=255)
    severity = models.CharField(max_length=20, choices=Severity.choices, default=Severity.WARNING)
    created_at = models.DateTimeField(auto_now_add=True, db_index=True)
    resolved_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        ordering = ["-created_at"]

    def __str__(self):
        return f"[{self.severity}] {self.device.device_identifier}: {self.code} - {self.message}"

