import pytest
from rest_framework.test import APIClient
from django.utils import timezone
from apps.accounts.models import User, ClinicianAssignment, PatientProfile
from apps.devices.models import Device, DeviceCredential, DeviceAssignment
from apps.exercises.models import ExerciseDefinition, PlanVersion, ExercisePrescription
from apps.telemetry.models import Session, TelemetryBatch


@pytest.fixture
def api_client():
    return APIClient()


@pytest.fixture
def seed_environment(db):
    # Admin
    admin = User.objects.create_user(
        email="test_admin@orthosense.health",
        username="test_admin",
        password="password123",
        role=User.Role.ADMIN,
        full_name="Admin User"
    )

    # Clinician A and B
    doc_a = User.objects.create_user(
        email="doc_a@orthosense.health",
        username="doc_a",
        password="password123",
        role=User.Role.CLINICIAN,
        full_name="Dr. Vance"
    )
    doc_b = User.objects.create_user(
        email="doc_b@orthosense.health",
        username="doc_b",
        password="password123",
        role=User.Role.CLINICIAN,
        full_name="Dr. Stone"
    )

    # Patients A and B
    pat_a = User.objects.create_user(
        email="pat_a@orthosense.health",
        username="pat_a",
        password="password123",
        role=User.Role.PATIENT,
        full_name="Sarah Connor"
    )
    PatientProfile.objects.create(user=pat_a, diagnosis="Post-Op ACL")

    pat_b = User.objects.create_user(
        email="pat_b@orthosense.health",
        username="pat_b",
        password="password123",
        role=User.Role.PATIENT,
        full_name="David Kim"
    )
    PatientProfile.objects.create(user=pat_b, diagnosis="Meniscus Repair")

    # Assignment: Doc A -> Patient A
    ClinicianAssignment.objects.create(clinician=doc_a, patient=pat_a, active=True)
    # Assignment: Doc B -> Patient B
    ClinicianAssignment.objects.create(clinician=doc_b, patient=pat_b, active=True)

    # Device for Patient A
    device = Device.objects.create(
        device_identifier="ESP32-S3-TEST-001",
        mac_address="11:22:33:44:55:66",
        status=Device.Status.ACTIVE,
    )
    DeviceAssignment.objects.create(device=device, patient=pat_a, active=True)
    token = "test_token_secret_123"
    import hashlib
    h = hashlib.sha256(token.encode("utf-8")).hexdigest()
    DeviceCredential.objects.create(device=device, hashed_token=h, salt="salt")

    return {
        "admin": admin,
        "doc_a": doc_a,
        "doc_b": doc_b,
        "pat_a": pat_a,
        "pat_b": pat_b,
        "device": device,
        "device_token": token,
    }


