import uuid
from django.contrib.auth.models import AbstractUser, BaseUserManager
from django.db import models


class CustomUserManager(BaseUserManager):
    """Custom user manager supporting email-based authentication."""
    def create_user(self, email, password=None, **extra_fields):
        if not email:
            raise ValueError("The Email field must be set")
        email = self.normalize_email(email)
        user = self.model(email=email, **extra_fields)
        if password:
            user.set_password(password)
        else:
            user.set_unusable_password()
        user.save(using=self._db)
        return user

    def create_superuser(self, email, password=None, **extra_fields):
        extra_fields.setdefault("is_staff", True)
        extra_fields.setdefault("is_superuser", True)
        extra_fields.setdefault("role", User.Role.ADMIN)

        if extra_fields.get("is_staff") is not True:
            raise ValueError("Superuser must have is_staff=True.")
        if extra_fields.get("is_superuser") is not True:
            raise ValueError("Superuser must have is_superuser=True.")

        return self.create_user(email, password, **extra_fields)


class User(AbstractUser):
    """
    Primary User model for OrthoSense.
    Supports ADMIN, CLINICIAN, and PATIENT roles.
    """
    class Role(models.TextChoices):
        ADMIN = "ADMIN", "Administrator"
        CLINICIAN = "CLINICIAN", "Clinician"
        PATIENT = "PATIENT", "Patient"

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    username = models.CharField(max_length=150, unique=True, blank=True, null=True)
    email = models.EmailField(unique=True, db_index=True)
    role = models.CharField(max_length=20, choices=Role.choices, default=Role.PATIENT, db_index=True)
    full_name = models.CharField(max_length=255, blank=True)
    department = models.CharField(max_length=255, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    objects = CustomUserManager()

    USERNAME_FIELD = "email"
    REQUIRED_FIELDS = []

    def __str__(self):
        return f"{self.full_name or self.email} ({self.role})"

    def save(self, *args, **kwargs):
        if not self.username:
            self.username = self.email.split("@")[0] + "_" + str(uuid.uuid4())[:6]
        if not self.full_name:
            self.full_name = self.first_name + " " + self.last_name if (self.first_name or self.last_name) else self.username
        super().save(*args, **kwargs)


class PatientProfile(models.Model):
    """
    Clinical case profile for patients undergoing orthopedic rehabilitation.
    """
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name="patient_profile")
    date_of_birth = models.DateField(null=True, blank=True)
    diagnosis = models.CharField(max_length=255, default="Post-Op ACL Reconstruction")
    surgical_protocol = models.CharField(max_length=255, default="Quad Tendon Autograft • Left Knee")
    surgery_date = models.DateField(null=True, blank=True)
    target_rom_flexion = models.FloatField(default=105.0)
    target_rom_extension = models.FloatField(default=0.0)
    recovery_week = models.IntegerField(default=4)
    emergency_contact_name = models.CharField(max_length=255, blank=True)
    emergency_contact_phone = models.CharField(max_length=50, blank=True)
    haptic_alerts_enabled = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"Patient: {self.user.full_name} ({self.diagnosis})"


class ClinicianProfile(models.Model):
    """
    Professional profile for doctors and orthopedic physical therapists.
    """
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name="clinician_profile")
    license_number = models.CharField(max_length=100, blank=True)
    specialization = models.CharField(max_length=255, default="Orthopedic Surgery & Rehabilitation")
    hospital_affiliation = models.CharField(max_length=255, default="Metropolitan Orthopedic Institute")
    clinic_phone = models.CharField(max_length=50, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Clinician: {self.user.full_name} ({self.specialization})"


class ClinicianAssignment(models.Model):
    """
    Authoritative assignment link between clinician and patient.
    Multi-tenant role scoping relies on active rows here.
    """
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    clinician = models.ForeignKey(User, on_delete=models.CASCADE, related_name="patient_assignments")
    patient = models.ForeignKey(User, on_delete=models.CASCADE, related_name="clinician_assignments")
    assigned_at = models.DateTimeField(auto_now_add=True)
    active = models.BooleanField(default=True, db_index=True)
    assigned_by = models.ForeignKey(User, null=True, blank=True, on_delete=models.SET_NULL, related_name="authorized_assignments")

    class Meta:
        unique_together = ("clinician", "patient")
        indexes = [
            models.Index(fields=["clinician", "active"]),
            models.Index(fields=["patient", "active"]),
        ]

    def __str__(self):
        return f"{self.clinician.full_name} -> {self.patient.full_name} (Active: {self.active})"


class AuditLogEntry(models.Model):
    """
    Immutable security audit trail capturing all administrative, clinical, and hardware actions.
    """
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    actor = models.ForeignKey(User, null=True, blank=True, on_delete=models.SET_NULL, related_name="audit_logs")
    actor_name = models.CharField(max_length=255, blank=True)
    actor_role = models.CharField(max_length=50, blank=True)
    action = models.CharField(max_length=100, db_index=True)
    target_type = models.CharField(max_length=100, blank=True)
    target_id = models.CharField(max_length=255, blank=True)
    details = models.TextField(blank=True)
    severity = models.CharField(max_length=20, default="info")  # info, warning, critical
    ip_address = models.GenericIPAddressField(null=True, blank=True)
    timestamp = models.DateTimeField(auto_now_add=True, db_index=True)

    class Meta:
        ordering = ["-timestamp"]
        indexes = [
            models.Index(fields=["action", "timestamp"]),
        ]

    def __str__(self):
        return f"[{self.timestamp}] {self.actor_name or 'System'}: {self.action} ({self.severity})"

