from rest_framework import serializers
from .models import ExerciseDefinition, PlanVersion, ExercisePrescription
from apps.accounts.models import User
from apps.accounts.permissions import can_access_patient
from apps.accounts.serializers import StrictWriteFieldsMixin


class ExerciseDefinitionSerializer(serializers.ModelSerializer):
    class Meta:
        model = ExerciseDefinition
        fields = [
            "id",
            "code",
            "name",
            "description",
            "target_joint",
            "video_url",
            "thumbnail_url",
            "default_repetitions",
            "default_sets",
            "target_angle_min_deg",
            "target_angle_max_deg",
            "rest_interval_seconds",
        ]


class ExercisePrescriptionSerializer(serializers.ModelSerializer):
    exercise = ExerciseDefinitionSerializer(read_only=True)
    exercise_id = serializers.UUIDField(write_only=True)

    class Meta:
        model = ExercisePrescription
        fields = [
            "id",
            "exercise",
            "exercise_id",
            "target_repetitions",
            "target_sets",
            "target_flexion_deg",
            "target_extension_deg",
            "rest_interval_seconds",
            "order",
            "notes",
        ]


class PlanVersionSerializer(StrictWriteFieldsMixin, serializers.ModelSerializer):
    prescriptions = ExercisePrescriptionSerializer(many=True, read_only=True)
    patient_name = serializers.CharField(source="patient.full_name", read_only=True)
    doctor_name = serializers.CharField(source="authored_by.full_name", read_only=True)

    class Meta:
        model = PlanVersion
        fields = [
            "id",
            "patient",
            "patient_name",
            "authored_by",
            "doctor_name",
            "version_number",
            "status",
            "clinical_notes",
            "published_at",
            "prescriptions",
            "created_at",
            "updated_at",
        ]
        read_only_fields = [name for name in fields if name != "clinical_notes"]


class PrescriptionItemInputSerializer(serializers.Serializer):
    exercise_id = serializers.UUIDField()
    target_repetitions = serializers.IntegerField(default=10)
    target_sets = serializers.IntegerField(default=3)
    target_flexion_deg = serializers.FloatField(default=105.0)
    target_extension_deg = serializers.FloatField(default=0.0)
    rest_interval_seconds = serializers.IntegerField(default=60)
    order = serializers.IntegerField(default=0)
    notes = serializers.CharField(required=False, allow_blank=True, default="")


class PlanVersionCreateSerializer(StrictWriteFieldsMixin, serializers.ModelSerializer):
    items = PrescriptionItemInputSerializer(many=True, required=False, write_only=True)

    class Meta:
        model = PlanVersion
        fields = [
            "patient",
            "clinical_notes",
            "items",
        ]

    def validate_patient(self, patient):
        if patient.role != User.Role.PATIENT or not can_access_patient(self.context["request"].user, patient):
            raise serializers.ValidationError("An actively assigned patient is required.")
        return patient

    def to_representation(self, instance):
        return PlanVersionSerializer(instance, context=self.context).data

    def create(self, validated_data):
        items_data = validated_data.pop("items", [])
        patient = validated_data["patient"]
        clinician = self.context["request"].user

        # Determine next version number
        latest_version = PlanVersion.objects.filter(patient=patient).order_by("-version_number").first()
        version_num = (latest_version.version_number + 1) if latest_version else 1

        plan = PlanVersion.objects.create(
            patient=patient,
            authored_by=clinician,
            version_number=version_num,
            status=PlanVersion.Status.DRAFT,
            clinical_notes=validated_data.get("clinical_notes", ""),
        )

        for item in items_data:
            exercise = ExerciseDefinition.objects.get(id=item["exercise_id"])
            ExercisePrescription.objects.create(
                plan_version=plan,
                exercise=exercise,
                target_repetitions=item.get("target_repetitions", 10),
                target_sets=item.get("target_sets", 3),
                target_flexion_deg=item.get("target_flexion_deg", 105.0),
                target_extension_deg=item.get("target_extension_deg", 0.0),
                rest_interval_seconds=item.get("rest_interval_seconds", 60),
                order=item.get("order", 0),
                notes=item.get("notes", ""),
            )

        return plan

