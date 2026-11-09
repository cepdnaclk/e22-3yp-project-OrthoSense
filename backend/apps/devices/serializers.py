import secrets
import hashlib
from rest_framework import serializers
from django.db import transaction
from django.utils import timezone
from .models import Device, DeviceCredential, SensorChannel, TechnicalAlert, DeviceAssignment
from apps.accounts.models import User


class SensorChannelSerializer(serializers.ModelSerializer):
    class Meta:
        model = SensorChannel
        fields = [
            "channel_index",
            "sensor_type",
            "label",
            "unit",
            "sampling_rate_hz",
            "health_status",
            "calibration_date",
        ]


class DeviceSerializer(serializers.ModelSerializer):
    sensor_channels = serializers.SerializerMethodField()
    battery_percent = serializers.SerializerMethodField()
    battery_voltage = serializers.SerializerMethodField()
    connectivity = serializers.SerializerMethodField()

    def get_sensor_channels(self, obj):
        from django.utils.dateparse import parse_datetime
        reported = parse_datetime(obj.health_report.get("reported_at", ""))
        channels = obj.health_report.get("channels", [])
        fresh = reported and timezone.is_aware(reported) and 0 <= (timezone.now()-reported).total_seconds() <= 90
        return channels if fresh else [{**channel, "health_status": "STALE"} for channel in channels]

    def get_battery_percent(self, obj):
        return obj.health_report.get("battery_percent")

    def get_battery_voltage(self, obj):
        return obj.health_report.get("battery_voltage")

    def get_connectivity(self, obj):
        if obj.status != Device.Status.ACTIVE:
            return obj.status.lower()
        if not obj.last_seen_at:
            return "unknown"
        from django.conf import settings
        return "online" if 0 <= (timezone.now()-obj.last_seen_at).total_seconds() <= getattr(settings, "DEVICE_HEARTBEAT_TIMEOUT_SECONDS", 90) else "offline"

    assigned_patient = serializers.SerializerMethodField()

    class Meta:
        model = Device
        fields = [
            "id",
            "device_identifier",
            "mac_address",
            "hardware_revision",
            "firmware_version",
            "status",
            "battery_percent",
            "battery_voltage",
            "last_seen_at",
            "sensor_channels",
            "connectivity",
            "assigned_patient",
            "created_at",
        ]
        read_only_fields = ["last_seen_at", "created_at"]

    def get_assigned_patient(self, obj):
        assignment = obj.assignments.filter(active=True).select_related("patient").first()
        if assignment:
            return {
                "id": str(assignment.patient.id),
                "fullName": assignment.patient.full_name,
                "email": assignment.patient.email,
            }
        return None


class DeviceCreateSerializer(serializers.ModelSerializer):
    assigned_patient_id = serializers.UUIDField(required=False, allow_null=True)

    class Meta:
        model = Device
        fields = [
            "device_identifier",
            "mac_address",
            "hardware_revision",
            "firmware_version",
            "assigned_patient_id",
        ]

    def validate_assigned_patient_id(self, value):
        if value is not None and not User.objects.filter(pk=value, role=User.Role.PATIENT, is_active=True).exists():
            raise serializers.ValidationError("An active patient is required.")
        return value

    @transaction.atomic
    def create(self, validated_data):
        patient_id = validated_data.pop("assigned_patient_id", None)
        if patient_id:
            User.objects.select_for_update().get(pk=patient_id)
            if DeviceAssignment.objects.filter(patient_id=patient_id, active=True).exists():
                raise serializers.ValidationError({"assigned_patient_id": "Patient already has an active device. Unassign it explicitly first."})
        device = Device.objects.create(**validated_data)

        # Generate secure hardware token
        raw_token = f"ortho_{secrets.token_urlsafe(32)}"
        token_hash = hashlib.sha256(raw_token.encode("utf-8")).hexdigest()
        salt = secrets.token_hex(16)

        DeviceCredential.objects.create(
            device=device,
            hashed_token=token_hash,
            salt=salt,
            raw_token_display="",
        )

        device._provisioned_token = raw_token

        if patient_id:
            patient = User.objects.filter(id=patient_id, role=User.Role.PATIENT).first()
            if patient:
                DeviceAssignment.objects.create(device=device, patient=patient, active=True)

        return device


class TechnicalAlertSerializer(serializers.ModelSerializer):
    deviceIdentifier = serializers.CharField(source="device.device_identifier", read_only=True)

    class Meta:
        model = TechnicalAlert
        fields = [
            "id",
            "device_id",
            "deviceIdentifier",
            "code",
            "message",
            "severity",
            "created_at",
            "resolved_at",
        ]



class HealthChannelInput(serializers.Serializer):
    channel_index = serializers.IntegerField(min_value=0)
    sensor_type = serializers.ChoiceField(choices=SensorChannel.SensorType.choices)
    label = serializers.CharField(max_length=100)
    unit = serializers.CharField(max_length=30, allow_blank=True, default="")
    sampling_rate_hz = serializers.IntegerField(min_value=0, required=False)
    health_status = serializers.ChoiceField(choices=["HEALTHY", "DEGRADED", "STALE", "RAIL", "INVALID", "UNVERIFIED"])


class HeartbeatInput(serializers.Serializer):
    device_id = serializers.CharField(max_length=64)
    battery_percent = serializers.IntegerField(min_value=0, max_value=100, required=False, allow_null=True)
    battery_voltage = serializers.FloatField(min_value=0, required=False, allow_null=True)
    firmware_version = serializers.CharField(max_length=50, required=False)
    channels = HealthChannelInput(many=True, required=False, max_length=32)

    def validate_channels(self, channels):
        indices = [item["channel_index"] for item in channels]
        if len(indices) != len(set(indices)):
            raise serializers.ValidationError("Channel indexes must be unique.")
        return channels


class AssignmentInput(serializers.Serializer):
    patient_id = serializers.UUIDField(allow_null=True)
