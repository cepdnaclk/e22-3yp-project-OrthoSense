from rest_framework import serializers
from .models import Session, TelemetryBatch, ReviewNote
from apps.devices.models import Device
from apps.exercises.models import PlanVersion
from apps.accounts.serializers import StrictWriteFieldsMixin


class ReviewNoteSerializer(serializers.ModelSerializer):
    doctor_name = serializers.CharField(source="clinician.full_name", read_only=True)

    class Meta:
        model = ReviewNote
        fields = [
            "id",
            "doctor_name",
            "content",
            "reviewed_at",
        ]


class SessionSerializer(serializers.ModelSerializer):
    patient_name = serializers.CharField(source="patient.full_name", read_only=True)
    patient_id = serializers.CharField(source="patient.id", read_only=True)
    plan_version_number = serializers.IntegerField(source="plan_version.version_number", read_only=True)
    review_notes = ReviewNoteSerializer(many=True, read_only=True)

    class Meta:
        model = Session
        fields = [
            "id",
            "patient_id",
            "patient_name",
            "plan_version",
            "plan_version_number",
            "exercise_name",
            "started_at",
            "ended_at",
            "duration_seconds",
            "status",
            "quality_flag",
            "target_reps",
            "patient_reported_reps",
            "sensor_estimated_reps",
            "max_flexion_deg",
            "max_extension_deg",
            "doctor_reviewed",
            "doctor_reviewed_at",
            "doctor_review_notes",
            "review_notes",
        ]
        read_only_fields = fields


class SessionCreateSerializer(StrictWriteFieldsMixin, serializers.ModelSerializer):
    class Meta:
        model = Session
        fields = [
            "exercise_name",
            "patient_reported_reps",
            "status",
        ]

    def to_representation(self, instance):
        return SessionSerializer(instance, context=self.context).data

    def create(self, validated_data):
        patient = self.context["request"].user
        # Stamp with currently published plan
        published_plan = PlanVersion.objects.filter(
            patient=patient,
            status=PlanVersion.Status.PUBLISHED
        ).order_by("-version_number").first()

        device = None
        device_assignment = patient.device_assignments.filter(active=True).first()
        if device_assignment:
            device = device_assignment.device

        session = Session.objects.create(
            patient=patient,
            plan_version=published_plan,
            device=device,
            **validated_data
        )
        return session


class PatientSessionUpdateSerializer(StrictWriteFieldsMixin, serializers.ModelSerializer):
    class Meta:
        model = Session
        fields = ["patient_reported_reps", "status"]


class SessionReviewSerializer(serializers.Serializer):
    notes = serializers.CharField(required=True)


class TelemetrySampleSerializer(serializers.Serializer):
    offset_ms = serializers.IntegerField(default=0)
    knee_angle_deg = serializers.FloatField(required=False, allow_null=True)
    imu1 = serializers.DictField(required=False)
    imu2 = serializers.DictField(required=False)
    fsr = serializers.ListField(child=serializers.FloatField(), required=False)
    temp_c = serializers.ListField(child=serializers.FloatField(), required=False)


class TelemetryIngestPayloadSerializer(serializers.Serializer):
    device_id = serializers.CharField(required=True)
    boot_id = serializers.CharField(required=True)
    session_id = serializers.UUIDField(required=True)
    sequence_number = serializers.IntegerField(required=True)
    elapsed_ms = serializers.IntegerField(default=0)
    samples = TelemetrySampleSerializer(many=True, required=True)

