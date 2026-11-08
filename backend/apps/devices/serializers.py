import secrets
import hashlib
from rest_framework import serializers
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
    sensor_channels = SensorChannelSerializer(many=True, read_only=True)
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
            "assigned_patient",
            "created_at",
        ]

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

    def create(self, validated_data):
        patient_id = validated_data.pop("assigned_patient_id", None)
        device = Device.objects.create(**validated_data)

        # Generate secure hardware token
        raw_token = f"ortho_{secrets.token_urlsafe(32)}"
        token_hash = hashlib.sha256(raw_token.encode("utf-8")).hexdigest()
        salt = secrets.token_hex(16)

        DeviceCredential.objects.create(
            device=device,
            hashed_token=token_hash,
            salt=salt,
            raw_token_display=raw_token,
        )

        # Initialize default 6 sensor channels
        default_channels = [
            (0, SensorChannel.SensorType.IMU_THIGH, "ESP32-S3 Master SoC", "Hz", 100),
            (1, SensorChannel.SensorType.IMU_THIGH, "IMU 1 — Thigh Segment", "deg", 100),
            (2, SensorChannel.SensorType.IMU_SHANK, "IMU 2 — Shank Segment", "deg", 100),
            (3, SensorChannel.SensorType.FSR_INSOLE, "Foot Insole Pressure FSRs", "kg-f", 50),
            (4, SensorChannel.SensorType.SEMG, "Surface sEMG Muscle Lead", "% RMS", 200),
            (5, SensorChannel.SensorType.NTC_TEMP, "Skin Temp & Patellar Hinge", "°C", 1),
        ]
        for idx, stype, label, unit, rate in default_channels:
            SensorChannel.objects.create(
                device=device,
                channel_index=idx,
                sensor_type=stype,
                label=label,
                unit=unit,
                sampling_rate_hz=rate,
                health_status=SensorChannel.ChannelHealth.HEALTHY,
            )

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

