import pytest
from rest_framework.test import APIClient
from django.utils import timezone
from apps.accounts.models import User, ClinicianAssignment, PatientProfile
from apps.devices.models import Device, DeviceCredential
from apps.exercises.models import ExerciseDefinition, PlanVersion, ExercisePrescription
from apps.telemetry.models import Session, TelemetryBatch


def test_system_health(api_client, db):
    response = api_client.get("/api/v1/health/")
    assert response.status_code == 200
    assert response.data["status"] == "healthy"
    assert response.data["components"]["database"]["status"] == "connected"


def test_auth_login_and_me(api_client, seed_environment):
    # Test login
    login_resp = api_client.post("/api/v1/auth/login/", {
        "email": "pat_a@orthosense.health",
        "password": "password123"
    })
    assert login_resp.status_code == 200
    assert "csrfToken" in login_resp.data
    assert "token" not in login_resp.data
    assert login_resp.data["user"]["role"] == "PATIENT"

    # Test me endpoint
    me_resp = api_client.get("/api/v1/auth/me/")
    assert me_resp.status_code == 200
    assert me_resp.data["email"] == "pat_a@orthosense.health"


def test_tenant_scoping_clinician_cannot_view_unassigned_patient(api_client, seed_environment):
    doc_a = seed_environment["doc_a"]
    pat_b = seed_environment["pat_b"]

    api_client.force_authenticate(user=doc_a)

    # Clinician A list should only contain Patient A, NOT Patient B
    list_resp = api_client.get("/api/v1/patients/")
    assert list_resp.status_code == 200
    returned_ids = [p["id"] for p in list_resp.data["results"]]
    assert str(seed_environment["pat_a"].id) in returned_ids
    assert str(pat_b.id) not in returned_ids

    # Direct query to unassigned Patient B should return 404
    detail_resp = api_client.get(f"/api/v1/patients/{pat_b.id}/")
    assert detail_resp.status_code in [403, 404]


def test_patient_self_access_only(api_client, seed_environment):
    pat_a = seed_environment["pat_a"]
    pat_b = seed_environment["pat_b"]

    api_client.force_authenticate(user=pat_a)

    # Patient A querying Patient B receives 404
    resp = api_client.get(f"/api/v1/patients/{pat_b.id}/")
    assert resp.status_code in [403, 404]


def test_exercise_plan_immutability(api_client, seed_environment):
    doc_a = seed_environment["doc_a"]
    pat_a = seed_environment["pat_a"]

    api_client.force_authenticate(user=doc_a)

    # Create draft plan
    ex = ExerciseDefinition.objects.create(
        code="flexion-test",
        name="Flexion Test",
        description="Test",
        target_angle_max_deg=105.0,
    )
    plan = PlanVersion.objects.create(
        patient=pat_a,
        authored_by=doc_a,
        version_number=1,
        status=PlanVersion.Status.DRAFT,
        clinical_notes="Initial Draft",
    )
    ExercisePrescription.objects.create(
        plan_version=plan,
        exercise=ex,
        target_repetitions=10,
        target_flexion_deg=105.0,
    )

    # Publish plan
    pub_resp = api_client.post(f"/api/v1/plans/{plan.id}/publish/")
    assert pub_resp.status_code == 200
    plan.refresh_from_db()
    assert plan.status == PlanVersion.Status.PUBLISHED

    # Attempting to edit a published plan returns HTTP 400
    edit_resp = api_client.put(f"/api/v1/plans/{plan.id}/", {
        "clinical_notes": "Attempted illegal modification"
    })
    assert edit_resp.status_code == 400


def test_patient_my_plan_endpoint(api_client, seed_environment):
    pat_a = seed_environment["pat_a"]
    doc_a = seed_environment["doc_a"]

    # Create published plan
    plan = PlanVersion.objects.create(
        patient=pat_a,
        authored_by=doc_a,
        version_number=1,
        status=PlanVersion.Status.DRAFT,
    )
    plan.publish()

    api_client.force_authenticate(user=pat_a)
    resp = api_client.get("/api/v1/my-plan/")
    assert resp.status_code == 200
    assert resp.data["version_number"] == 1
    assert resp.data["status"] == "PUBLISHED"


def test_telemetry_device_ingest_and_idempotency(api_client, seed_environment):
    device = seed_environment["device"]
    pat_a = seed_environment["pat_a"]
    token = seed_environment["device_token"]

    session = Session.objects.create(patient=pat_a, device=device, status=Session.Status.IN_PROGRESS)

    payload = {
        "device_id": device.device_identifier,
        "boot_id": "urn:uuid:boot-test-1122",
        "session_id": str(session.id),
        "sequence_number": 42,
        "elapsed_ms": 1000,
        "samples": [
            {
                "offset_ms": 0,
                "knee_angle_deg": 94.5,
                "imu1": {"accel": [0.0, 9.8, 0.0]},
                "imu2": {"accel": [0.0, 9.8, 0.0]},
                "fsr": [1400.0, 1500.0],
                "temp_c": [32.8],
            }
        ]
    }

    # Authenticate via DeviceBearer
    api_client.credentials(HTTP_AUTHORIZATION=f"DeviceBearer {token}")

    # First transmission: should return 201 Created
    resp1 = api_client.post("/api/v1/telemetry/ingest/", payload, format="json")
    assert resp1.status_code == 201
    assert resp1.data["status"] == "stored"

    # Second transmission with exact same (device, boot_id, sequence_number): Idempotent 200
    resp2 = api_client.post("/api/v1/telemetry/ingest/", payload, format="json")
    assert resp2.status_code == 200
    assert resp2.data["status"] == "already_stored"


def test_downsampled_telemetry_endpoint(api_client, seed_environment):
    pat_a = seed_environment["pat_a"]
    session = Session.objects.create(patient=pat_a, duration_seconds=120)

    api_client.force_authenticate(user=pat_a)
    resp = api_client.get(f"/api/v1/sessions/{session.id}/telemetry/?max_points=50")
    assert resp.status_code == 200
    assert len(resp.data) <= 50
    assert "kneeAngleDeg" in resp.data[0]


def test_invalid_device_token_rejected(api_client, seed_environment):
    api_client.credentials(HTTP_AUTHORIZATION="DeviceBearer invalid_fake_token")
    resp = api_client.post("/api/v1/telemetry/ingest/", {"device_id": "fake"}, format="json")
    assert resp.status_code in [401, 403]


def test_doctor_session_review(api_client, seed_environment):
    doc_a = seed_environment["doc_a"]
    pat_a = seed_environment["pat_a"]
    session = Session.objects.create(patient=pat_a, doctor_reviewed=False)

    api_client.force_authenticate(user=doc_a)
    resp = api_client.post(f"/api/v1/sessions/{session.id}/review/", {
        "notes": "Patient achieved 98° active flexion smoothly. Approved."
    })
    assert resp.status_code == 200
    assert resp.data["doctor_reviewed"] is True
    assert "Approved" in resp.data["doctor_review_notes"]


def test_openapi_schema_endpoint(api_client, db):
    resp = api_client.get("/api/schema/")
    assert resp.status_code == 200
    assert "openapi" in str(resp.content) or "openapi" in resp.data

