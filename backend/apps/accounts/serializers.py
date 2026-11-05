from rest_framework import serializers
from .models import User, PatientProfile, ClinicianProfile, ClinicianAssignment, AuditLogEntry


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = [
            "id",
            "email",
            "username",
            "full_name",
            "role",
            "department",
            "is_active",
            "created_at",
        ]


class PatientProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = PatientProfile
        fields = [
            "date_of_birth",
            "diagnosis",
            "surgical_protocol",
            "surgery_date",
            "target_rom_flexion",
            "target_rom_extension",
            "recovery_week",
            "emergency_contact_name",
            "emergency_contact_phone",
            "haptic_alerts_enabled",
        ]


class PatientDetailSerializer(serializers.ModelSerializer):
    patient_profile = PatientProfileSerializer(read_only=True)
    assigned_doctor = serializers.SerializerMethodField()
    assigned_device = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = [
            "id",
            "email",
            "username",
            "full_name",
            "role",
            "department",
            "patient_profile",
            "assigned_doctor",
            "assigned_device",
            "created_at",
        ]

    def get_assigned_doctor(self, obj):
        assignment = ClinicianAssignment.objects.filter(patient=obj, active=True).first()
        if assignment:
            return {
                "id": str(assignment.clinician.id),
                "fullName": assignment.clinician.full_name,
                "email": assignment.clinician.email,
            }
        return None

    def get_assigned_device(self, obj):
        assignment = obj.device_assignments.filter(active=True).first()
        if assignment:
            return {
                "id": str(assignment.device.id),
                "identifier": assignment.device.device_identifier,
                "status": assignment.device.status,
                "batteryPercent": assignment.device.battery_percent,
            }
        return None


class AuditLogSerializer(serializers.ModelSerializer):
    actorName = serializers.CharField(source="actor_name", read_only=True)
    actorRole = serializers.CharField(source="actor_role", read_only=True)

    class Meta:
        model = AuditLogEntry
        fields = [
            "id",
            "timestamp",
            "actor_id",
            "actorName",
            "actorRole",
            "action",
            "target_type",
            "target_id",
            "details",
            "severity",
            "ip_address",
        ]


class LoginRequestSerializer(serializers.Serializer):
    email = serializers.CharField(required=True)
    password = serializers.CharField(required=False, default="")
    role = serializers.CharField(required=False, default="")


class AuthSessionResponseSerializer(serializers.Serializer):
    user = UserSerializer()
    token = serializers.CharField()
    expiresAt = serializers.CharField()

