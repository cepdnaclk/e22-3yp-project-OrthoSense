from rest_framework import serializers
from .models import Session, TelemetryBatch, ReviewNote
from apps.devices.models import Device
from apps.exercises.models import PlanVersion, ExercisePrescription
from apps.exercises.serializers import ExercisePrescriptionSerializer
import math
from apps.accounts.serializers import StrictWriteFieldsMixin


class ReviewNoteSerializer(serializers.ModelSerializer):
    doctor_name = serializers.CharField(source="clinician.full_name", read_only=True)

    class Meta:
        model = ReviewNote
        fields = [
            "id",
            "doctor_name", "clinician",
            "content",
            "reviewed_at",
        ]


class SessionSerializer(serializers.ModelSerializer):
    patient_name = serializers.CharField(source="patient.full_name", read_only=True)
    patient_id = serializers.CharField(source="patient.id", read_only=True)
    plan_version_number = serializers.IntegerField(source="plan_version.version_number", read_only=True)
    review_notes = ReviewNoteSerializer(many=True, read_only=True)
    prescribed_item = ExercisePrescriptionSerializer(source="prescription", read_only=True)
    plan_author_name = serializers.CharField(source="plan_version.authored_by.full_name", read_only=True, default=None)

    class Meta:
        model = Session
        fields = [
            "id",
            "patient_id",
            "patient_name",
            "plan_version",
            "plan_version_number",
            "prescription", "prescribed_item", "plan_author_name", "device", "paused_at",
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


class SessionCreateSerializer(StrictWriteFieldsMixin, serializers.Serializer):
    prescription_id = serializers.UUIDField()
    session_id = serializers.UUIDField()

    def create(self, validated_data):
        patient = self.context["request"].user
        existing = Session.objects.filter(pk=validated_data["session_id"]).first()
        if existing:
            if existing.patient_id != patient.pk or str(existing.prescription_id) != str(validated_data["prescription_id"]):
                raise serializers.ValidationError("Session identity conflict.")
            return existing
        item = ExercisePrescription.objects.select_related("plan_version", "exercise").filter(
            pk=validated_data["prescription_id"], plan_version__patient=patient,
            plan_version__status=PlanVersion.Status.PUBLISHED).first()
        assignment = patient.device_assignments.filter(active=True, device__status=Device.Status.ACTIVE).select_related("device").first()
        if not item or not assignment:
            raise serializers.ValidationError("A published prescription and active assigned device are required.")
        return Session.objects.create(id=validated_data["session_id"], patient=patient, prescription=item, plan_version=item.plan_version,
            device=assignment.device, exercise_name=item.exercise.name,
            target_reps=item.target_repetitions * item.target_sets,
            status=Session.Status.IN_PROGRESS, quality_flag=Session.QualityFlag.INCOMPLETE)

    def to_representation(self, instance):
        return SessionSerializer(instance, context=self.context).data


class PatientSessionUpdateSerializer(StrictWriteFieldsMixin, serializers.Serializer):
    # Lifecycle changes must use the transactional transition endpoint.
    def update(self, instance, validated_data):
        return instance


class SessionTransitionSerializer(StrictWriteFieldsMixin, serializers.Serializer):
    operation = serializers.ChoiceField(choices=["pause", "resume", "finish", "abandon"])
    patient_reported_reps = serializers.IntegerField(min_value=0, max_value=10000, required=False)


class SessionReviewSerializer(serializers.Serializer):
    notes = serializers.CharField(required=True, max_length=20000)
    replace_review = serializers.BooleanField(default=False)
    expected_review_id = serializers.UUIDField(required=False, allow_null=True)


class FiniteFloat(serializers.FloatField):
    def to_internal_value(self, value):
        number = super().to_internal_value(value)
        if not math.isfinite(number):
            raise serializers.ValidationError("Must be finite.")
        return number


class ImuSerializer(StrictWriteFieldsMixin, serializers.Serializer):
    accel_m_s2 = serializers.ListField(child=FiniteFloat(), min_length=3, max_length=3)
    gyro_deg_s = serializers.ListField(child=FiniteFloat(), min_length=3, max_length=3)


class TelemetrySampleSerializer(StrictWriteFieldsMixin, serializers.Serializer):
    offset_ms = serializers.IntegerField(min_value=0, max_value=60000)
    knee_angle_deg = FiniteFloat(required=False, allow_null=True, min_value=-180, max_value=180)
    imu1 = ImuSerializer(required=False)
    imu2 = ImuSerializer(required=False)
    fsr = serializers.ListField(child=FiniteFloat(allow_null=True, min_value=0, max_value=4095), max_length=3, required=False)
    temp_c = serializers.ListField(child=FiniteFloat(allow_null=True, min_value=-40, max_value=125), max_length=2, required=False)
    observed_ms = serializers.DictField(child=serializers.IntegerField(min_value=0, max_value=604800000), required=False)
    health = serializers.DictField(child=serializers.ChoiceField(choices=["READ_OK", "STALE", "NO_RESPONSE", "RAIL_ERROR", "INVALID", "UNVERIFIED"]), required=False)

    def validate(self, data):
        supported = {"angle", "imu1", "imu2", "fsr", "temp"}
        for field in ("health", "observed_ms"):
            if set(data.get(field, {})) - supported:
                raise serializers.ValidationError({field: "Unsupported channel name."})
        return data


class TelemetryIngestPayloadSerializer(StrictWriteFieldsMixin, serializers.Serializer):
    schema_version = serializers.IntegerField(min_value=1, max_value=1)
    source = serializers.ChoiceField(choices=["hardware", "simulation"])
    device_id = serializers.CharField(max_length=100)
    boot_id = serializers.CharField(max_length=64)
    session_id = serializers.UUIDField()
    sequence_number = serializers.IntegerField(min_value=0, max_value=2147483647)
    elapsed_ms = serializers.IntegerField(min_value=0, max_value=604800000)
    samples = TelemetrySampleSerializer(many=True, allow_empty=False, max_length=256)

    def validate(self, data):
        offsets = [s["offset_ms"] for s in data["samples"]]
        if offsets != sorted(set(offsets)):
            raise serializers.ValidationError({"samples": "Offsets must be strictly increasing."})
        return data


class SessionFilterSerializer(serializers.Serializer):
    patient_id = serializers.UUIDField(required=False)
    date_from = serializers.DateField(required=False)
    date_to = serializers.DateField(required=False)
    status = serializers.ChoiceField(choices=Session.Status.values, required=False)
    reviewed = serializers.BooleanField(required=False)
    ordering = serializers.ChoiceField(choices=["started_at", "-started_at"], default="-started_at")

    def validate(self, data):
        if data.get("date_from") and data.get("date_to") and data["date_from"] > data["date_to"]:
            raise serializers.ValidationError({"date_to": "Must be on or after date_from."})
        return data
