from rest_framework import serializers
from django.db import transaction
from django.db.models import Max
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
            "schedule",
            "published_at",
            "prescriptions",
            "created_at",
            "updated_at",
        ]
        read_only_fields = [name for name in fields if name != "clinical_notes"]


class PrescriptionItemInputSerializer(serializers.Serializer):
    exercise_id = serializers.UUIDField()
    target_repetitions = serializers.IntegerField(default=10, min_value=1)
    target_sets = serializers.IntegerField(default=3, min_value=1)
    target_flexion_deg = serializers.FloatField(default=105.0)
    target_extension_deg = serializers.FloatField(default=0.0)
    rest_interval_seconds = serializers.IntegerField(default=60, min_value=0)
    order = serializers.IntegerField(default=0, min_value=0)
    notes = serializers.CharField(required=False, allow_blank=True, default="")


    def validate_exercise_id(self, value):
        if not ExerciseDefinition.objects.filter(pk=value).exists():
            raise serializers.ValidationError("Exercise not found.")
        return value

    def validate(self, attrs):
        import math
        low, high = attrs["target_extension_deg"], attrs["target_flexion_deg"]
        if not math.isfinite(low) or not math.isfinite(high) or low > high:
            raise serializers.ValidationError("Extension must not exceed flexion; angles must be finite.")
        return attrs


class ScheduleEntrySerializer(serializers.Serializer):
    exercise_id = serializers.UUIDField()
    scheduled_at = serializers.DateTimeField()


class ScheduleValidationMixin:
    def validate_schedule(self, value):
        result = ScheduleEntrySerializer(data=value, many=True)
        result.is_valid(raise_exception=True)
        return [{"exercise_id": str(item["exercise_id"]), "scheduled_at": item["scheduled_at"].isoformat()} for item in result.validated_data]

    def validate(self, attrs):
        attrs = super().validate(attrs)
        schedule = attrs.get("schedule", self.instance.schedule if self.instance else [])
        if "items" in attrs:
            exercises = {str(item["exercise_id"]) for item in attrs["items"]}
        elif self.instance:
            exercises = {str(value) for value in self.instance.prescriptions.values_list("exercise_id", flat=True)}
        else:
            exercises = set()
        if any(item["exercise_id"] not in exercises for item in schedule):
            raise serializers.ValidationError({"schedule": "Reminder exercises must be present in this draft."})
        return attrs


class PlanVersionCreateSerializer(ScheduleValidationMixin, StrictWriteFieldsMixin, serializers.ModelSerializer):
    schedule = serializers.ListField(child=serializers.DictField(), required=False, max_length=366)
    items = PrescriptionItemInputSerializer(many=True, required=False, write_only=True)

    class Meta:
        model = PlanVersion
        fields = [
            "patient",
            "clinical_notes",
            "schedule",
            "items",
        ]

    def validate_patient(self, patient):
        if patient.role != User.Role.PATIENT or not can_access_patient(self.context["request"].user, patient):
            raise serializers.ValidationError("An actively assigned patient is required.")
        return patient

    def to_representation(self, instance):
        return PlanVersionSerializer(instance, context=self.context).data

    @transaction.atomic
    def create(self, validated_data):
        items = validated_data.pop("items", [])
        patient = User.objects.select_for_update().get(pk=validated_data["patient"].pk)
        maximum = PlanVersion.objects.filter(patient=patient).aggregate(value=Max("version_number"))["value"] or 0
        plan = PlanVersion.objects.create(patient=patient, authored_by=self.context["request"].user,
            version_number=maximum + 1, clinical_notes=validated_data.get("clinical_notes", ""), schedule=validated_data.get("schedule", []))
        replace_items(plan, items)
        return plan


def replace_items(plan, items):
    plan.prescriptions.all().delete()
    for index, item in enumerate(items):
        values = dict(item)
        values["order"] = index
        ExercisePrescription.objects.create(plan_version=plan, **values)


class PlanDraftUpdateSerializer(ScheduleValidationMixin, StrictWriteFieldsMixin, serializers.ModelSerializer):
    schedule = serializers.ListField(child=serializers.DictField(), required=False, max_length=366)
    items = PrescriptionItemInputSerializer(many=True, required=False, write_only=True)

    class Meta:
        model = PlanVersion
        fields = ["clinical_notes", "items", "schedule"]

    def to_representation(self, instance):
        return PlanVersionSerializer(instance, context=self.context).data

    @transaction.atomic
    def update(self, instance, validated_data):
        instance = PlanVersion.objects.select_for_update().get(pk=instance.pk)
        if instance.status != PlanVersion.Status.DRAFT:
            raise serializers.ValidationError("Only drafts can be edited.")
        items = validated_data.pop("items", None)
        if "clinical_notes" in validated_data:
            instance.clinical_notes = validated_data["clinical_notes"]
        if "schedule" in validated_data:
            instance.schedule = validated_data["schedule"]
        instance.save()
        if items is not None:
            replace_items(instance, items)
        return instance
