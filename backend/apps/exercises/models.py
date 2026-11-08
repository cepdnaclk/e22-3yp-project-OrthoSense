import uuid
from django.db import models
from django.core.exceptions import ValidationError
from django.utils import timezone
from apps.accounts.models import User


class ExerciseDefinition(models.Model):
    """
    Standardized orthopedic exercise library definitions.
    """
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    code = models.CharField(max_length=50, unique=True, db_index=True)
    name = models.CharField(max_length=255)
    description = models.TextField()
    target_joint = models.CharField(max_length=100, default="Knee (Tibiofemoral & Patellofemoral)")
    video_url = models.URLField(blank=True)
    thumbnail_url = models.CharField(max_length=255, blank=True)
    default_repetitions = models.IntegerField(default=10)
    default_sets = models.IntegerField(default=3)
    target_angle_min_deg = models.FloatField(default=0.0)
    target_angle_max_deg = models.FloatField(default=105.0)
    rest_interval_seconds = models.IntegerField(default=60)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["name"]

    def __str__(self):
        return f"{self.name} ({self.code})"


class PlanVersion(models.Model):
    """
    Clinician-prescribed exercise protocol.
    Enforces the clinical immutable versioning pattern:
    Draft -> Published -> Archived. Once published, a version can never be mutated.
    """
    class Status(models.TextChoices):
        DRAFT = "DRAFT", "Draft"
        PUBLISHED = "PUBLISHED", "Published"
        ARCHIVED = "ARCHIVED", "Archived"

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    patient = models.ForeignKey(User, on_delete=models.CASCADE, related_name="prescribed_plans")
    authored_by = models.ForeignKey(User, on_delete=models.CASCADE, related_name="authored_plans")
    version_number = models.IntegerField(default=1)
    status = models.CharField(max_length=20, choices=Status.choices, default=Status.DRAFT, db_index=True)
    clinical_notes = models.TextField(blank=True)
    published_at = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["-version_number"]
        unique_together = ("patient", "version_number")

    def __str__(self):
        return f"Plan v{self.version_number} for {self.patient.full_name} ({self.status})"

    def clean(self):
        # Enforce legal immutability of published medical records
        if self.pk:
            original = PlanVersion.objects.filter(pk=self.pk).first()
            if original and original.status in (self.Status.PUBLISHED, self.Status.ARCHIVED):
                protected = ("clinical_notes", "patient_id", "authored_by_id", "version_number", "published_at")
                changed = any(getattr(self, field) != getattr(original, field) for field in protected)
                legal_status = self.status == original.status or (original.status == self.Status.PUBLISHED and self.status == self.Status.ARCHIVED)
                if changed or not legal_status:
                    raise ValidationError("Published and archived plans are immutable. Create a new draft version.")

    def save(self, *args, **kwargs):
        self.clean()
        if self.status == self.Status.PUBLISHED and not self.published_at:
            self.published_at = timezone.now()
        super().save(*args, **kwargs)

    def publish(self):
        """Freezes version and archives prior published plans."""
        PlanVersion.objects.filter(
            patient=self.patient,
            status=self.Status.PUBLISHED
        ).exclude(pk=self.pk).update(status=self.Status.ARCHIVED)

        self.status = self.Status.PUBLISHED
        self.published_at = timezone.now()
        self.save()


class ExercisePrescription(models.Model):
    """
    Individual exercise item within a prescribed PlanVersion.
    """
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    plan_version = models.ForeignKey(PlanVersion, on_delete=models.CASCADE, related_name="prescriptions")
    exercise = models.ForeignKey(ExerciseDefinition, on_delete=models.CASCADE, related_name="prescriptions")
    target_repetitions = models.IntegerField(default=10)
    target_sets = models.IntegerField(default=3)
    target_flexion_deg = models.FloatField(default=105.0)
    target_extension_deg = models.FloatField(default=0.0)
    rest_interval_seconds = models.IntegerField(default=60)
    order = models.IntegerField(default=0)
    notes = models.TextField(blank=True)

    class Meta:
        ordering = ["order"]

    def __str__(self):
        return f"{self.exercise.name}: {self.target_sets}x{self.target_repetitions} (Max {self.target_flexion_deg}°)"

    def clean(self):
        original = ExercisePrescription.objects.filter(pk=self.pk).select_related("plan_version").first()
        if original and original.plan_version.status != PlanVersion.Status.DRAFT:
            raise ValidationError("Published and archived prescriptions are immutable.")
        if self.plan_version and self.plan_version.status != PlanVersion.Status.DRAFT:
            raise ValidationError("Cannot modify exercise prescriptions of an already-published plan.")

    def save(self, *args, **kwargs):
        self.clean()
        super().save(*args, **kwargs)

