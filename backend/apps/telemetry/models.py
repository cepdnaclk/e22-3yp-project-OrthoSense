import uuid
from django.db import models
from django.utils import timezone
from apps.accounts.models import User
from apps.devices.models import Device
from apps.exercises.models import PlanVersion


class Session(models.Model):
    """
    Rehabilitation workout session performed by a patient while wearing the smart knee brace.
    Links to prescribed PlanVersion, records kinematic outcomes, and supports clinical doctor review.
    """
    class Status(models.TextChoices):
        IN_PROGRESS = "in_progress", "In Progress"
        COMPLETED = "completed", "Completed"
        ABANDONED = "abandoned", "Abandoned"

    class QualityFlag(models.TextChoices):
        GOOD = "good", "Good (Nominal Quality)"
        DEGRADED = "degraded", "Degraded (Sensor Noise / Strap Slip)"
        INCOMPLETE = "incomplete", "Incomplete"

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    patient = models.ForeignKey(User, on_delete=models.CASCADE, related_name="telemetry_sessions")
    device = models.ForeignKey(Device, null=True, blank=True, on_delete=models.SET_NULL, related_name="recorded_sessions")
    plan_version = models.ForeignKey(PlanVersion, null=True, blank=True, on_delete=models.SET_NULL, related_name="guided_sessions")
    prescription = models.ForeignKey("exercises.ExercisePrescription", null=True, blank=True, on_delete=models.PROTECT)
    paused_at = models.DateTimeField(null=True, blank=True)
    exercise_name = models.CharField(max_length=255, default="Active Knee Flexion")
    started_at = models.DateTimeField(default=timezone.now, db_index=True)
    ended_at = models.DateTimeField(null=True, blank=True)
    duration_seconds = models.IntegerField(default=0)
    status = models.CharField(max_length=20, choices=Status.choices, default=Status.COMPLETED, db_index=True)
    quality_flag = models.CharField(max_length=20, choices=QualityFlag.choices, default=QualityFlag.GOOD)
    
    # Repetition Counts & Biomechanical Milestones
    target_reps = models.IntegerField(default=10)
    patient_reported_reps = models.IntegerField(null=True, blank=True)
    sensor_estimated_reps = models.IntegerField(null=True, blank=True)
    max_flexion_deg = models.FloatField(null=True, blank=True)
    max_extension_deg = models.FloatField(null=True, blank=True)

    # Doctor Review Status
    doctor_reviewed = models.BooleanField(default=False, db_index=True)
    doctor_reviewed_at = models.DateTimeField(null=True, blank=True)
    doctor_review_notes = models.TextField(blank=True)

    class Meta:
        ordering = ["-started_at"]
        indexes = [
            models.Index(fields=["patient", "started_at"]),
            models.Index(fields=["status", "doctor_reviewed"]),
        ]

    def __str__(self):
        return f"Session {self.id} - {self.patient.full_name} ({self.exercise_name}) on {self.started_at.strftime('%Y-%m-%d')}"


class TelemetryBatch(models.Model):
    """
    High-frequency sensor batch streamed from ESP32-S3 over Wi-Fi/HTTPS or BLE.
    Enforces idempotency on (device, boot_id, sequence_number).
    """
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    session = models.ForeignKey(Session, on_delete=models.CASCADE, related_name="telemetry_batches")
    device = models.ForeignKey(Device, on_delete=models.CASCADE, related_name="emitted_batches")
    sequence_number = models.IntegerField(db_index=True)
    boot_id = models.CharField(max_length=64, db_index=True)
    elapsed_ms = models.BigIntegerField(default=0)
    server_received_at = models.DateTimeField(auto_now_add=True)
    sample_count = models.IntegerField(default=1)
    raw_payload = models.JSONField()

    class Meta:
        ordering = ["sequence_number"]
        unique_together = ("device", "boot_id", "sequence_number")
        indexes = [
            models.Index(fields=["session", "sequence_number"]),
            models.Index(fields=["device", "boot_id", "sequence_number"]),
        ]

    def __str__(self):
        return f"Batch #{self.sequence_number} for Session {self.session_id} ({self.sample_count} samples)"


class ReviewNote(models.Model):
    """
    Formal clinician evaluation note and sign-off attached to a session.
    """
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    session = models.ForeignKey(Session, on_delete=models.CASCADE, related_name="review_notes")
    clinician = models.ForeignKey(User, on_delete=models.CASCADE, related_name="authored_session_reviews")
    content = models.TextField()
    reviewed_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-reviewed_at"]

    def __str__(self):
        return f"Review by {self.clinician.full_name} for Session {self.session_id}"

