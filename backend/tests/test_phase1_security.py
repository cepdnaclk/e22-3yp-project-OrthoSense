"""Identity, CSRF and ownership regressions for integration phase 1."""
import hashlib
import uuid

import pytest
from django.utils import timezone
from rest_framework.test import APIClient

from apps.accounts.models import AuditLogEntry, ClinicianAssignment
from apps.devices.models import Device, DeviceAssignment, DeviceCredential, TechnicalAlert
from apps.exercises.models import PlanVersion
from apps.telemetry.models import Session, TelemetryBatch


@pytest.fixture
def clinical_records(seed_environment):
    env = seed_environment
    other_device = Device.objects.create(device_identifier="TEST-OTHER", mac_address="22:33:44:55:66:77")
    DeviceAssignment.objects.create(device=other_device, patient=env["pat_b"])
    plan = PlanVersion.objects.create(patient=env["pat_a"], authored_by=env["doc_a"])
    other_plan = PlanVersion.objects.create(patient=env["pat_b"], authored_by=env["doc_b"])
    plan.publish()
    other_plan.publish()
    own_session = Session.objects.create(patient=env["pat_a"], device=env["device"], plan_version=plan, status=Session.Status.IN_PROGRESS)
    other_session = Session.objects.create(patient=env["pat_b"], device=other_device, plan_version=other_plan, status=Session.Status.IN_PROGRESS)
    own_alert = TechnicalAlert.objects.create(device=env["device"], code="AUDIT", message="Own test alert")
    other_alert = TechnicalAlert.objects.create(device=other_device, code="AUDIT", message="Other test alert")
    return {**env, "other_device": other_device, "plan": plan, "other_plan": other_plan,
            "session": own_session, "other_session": other_session, "alert": own_alert, "other_alert": other_alert}


def csrf_client():
    client = APIClient(enforce_csrf_checks=True)
    response = client.get("/api/v1/auth/csrf/")
    assert response.status_code == 200
    assert response["Cache-Control"] == "no-store"
    assert "csrftoken" in client.cookies
    return client, response.data["csrfToken"]


@pytest.mark.parametrize("key", ["admin", "doc_a", "pat_a"])
def test_real_cookie_login_csrf_rotation_me_and_logout(seed_environment, key):
    client, before_token = csrf_client()
    user = seed_environment[key]
    response = client.post("/api/v1/auth/login/", {"email": user.email.upper(), "password": "password123"}, format="json", HTTP_X_CSRFTOKEN=before_token, HTTP_ORIGIN="http://localhost:3000")
    assert response.status_code == 200
    assert response.data["user"]["id"] == str(user.pk)
    assert response.data["user"]["role"] == user.role
    assert "token" not in response.data
    assert client.cookies["sessionid"]["httponly"]
    token = response.data["csrfToken"]
    me = client.get("/api/v1/auth/me/")
    assert me.status_code == 200 and me.data["id"] == str(user.pk)
    assert me["Cache-Control"] == "no-store"
    assert client.post("/api/v1/auth/logout/", {}, format="json").status_code == 403
    assert client.post("/api/v1/auth/logout/", {}, format="json", HTTP_X_CSRFTOKEN=before_token).status_code == 403
    assert client.post("/api/v1/auth/logout/", {}, format="json", HTTP_X_CSRFTOKEN=token).status_code == 200
    assert client.get("/api/v1/auth/me/").status_code == 401
    assert AuditLogEntry.objects.filter(actor=user, action="USER_LOGIN").count() == 1
    assert AuditLogEntry.objects.filter(actor=user, action="USER_LOGOUT").count() == 1


@pytest.mark.parametrize("payload", [
    {"email": "test_admin@orthosense.health", "password": ""},
    {"email": "test_admin@orthosense.health"},
    {"email": "unknown-admin@example.test", "password": "wrong", "role": "ADMIN"},
    {"email": "test_admin@orthosense.health", "password": "wrong"},
    {"role": "ADMIN", "password": "password123"},
])
def test_invalid_credentials_never_create_session(seed_environment, payload):
    client, token = csrf_client()
    response = client.post("/api/v1/auth/login/", payload, format="json", HTTP_X_CSRFTOKEN=token)
    assert response.status_code in (400, 401)
    assert client.get("/api/v1/auth/me/").status_code == 401
    assert not AuditLogEntry.objects.filter(action="USER_LOGIN").exists()


def test_login_requires_csrf_and_trusted_origin(seed_environment):
    client, token = csrf_client()
    credentials = {"username": "test_admin", "password": "password123"}
    assert client.post("/api/v1/auth/login/", credentials, format="json").status_code == 403
    assert client.post("/api/v1/auth/login/", credentials, format="json", HTTP_X_CSRFTOKEN=token, HTTP_ORIGIN="https://untrusted.example").status_code == 403
    assert client.post("/api/v1/auth/login/", credentials, format="json", HTTP_X_CSRFTOKEN=token).status_code == 200


def test_inactive_login_and_expired_session(seed_environment):
    client, token = csrf_client()
    patient = seed_environment["pat_a"]
    client.force_login(patient)
    session = client.session
    session.set_expiry(timezone.now() - timezone.timedelta(seconds=1))
    session.save()
    assert client.get("/api/v1/auth/me/").status_code == 401
    patient.is_active = False
    patient.save(update_fields=["is_active"])
    assert client.post("/api/v1/auth/login/", {"email": patient.email, "password": "password123"}, format="json", HTTP_X_CSRFTOKEN=token).status_code == 401


def test_authenticated_writes_require_csrf(seed_environment):
    client, token = csrf_client()
    login = client.post("/api/v1/auth/login/", {"email": seed_environment["doc_a"].email, "password": "password123"}, format="json", HTTP_X_CSRFTOKEN=token)
    assert login.status_code == 200
    assert client.post("/api/v1/plans/", {"patient": str(seed_environment["pat_a"].pk)}, format="json").status_code == 403
    token = client.get("/api/v1/auth/csrf/").data["csrfToken"]
    assert client.post("/api/v1/plans/", {"patient": str(seed_environment["pat_a"].pk)}, format="json", HTTP_X_CSRFTOKEN=token).status_code == 201


@pytest.mark.parametrize("key", ["pat_a", "doc_a"])
def test_scoped_devices_alerts_and_ping(api_client, clinical_records, key):
    env = clinical_records
    api_client.force_authenticate(user=env[key])
    for endpoint, own, other in [("devices", env["device"], env["other_device"]), ("alerts", env["alert"], env["other_alert"])]:
        response = api_client.get(f"/api/v1/{endpoint}/")
        assert response.status_code == 200
        assert {row["id"] for row in response.data["results"]} == {str(own.pk)}
        assert api_client.get(f"/api/v1/{endpoint}/{other.pk}/").status_code == 404
    before = env["device"].last_seen_at
    assert api_client.post(f'/api/v1/devices/{env["device"].pk}/ping/').status_code == 200
    env["device"].refresh_from_db()
    assert env["device"].last_seen_at == before
    assert api_client.post(f'/api/v1/devices/{env["other_device"].pk}/ping/').status_code == 404


@pytest.mark.parametrize("key", ["pat_a", "doc_a"])
@pytest.mark.parametrize("action", ["create", "patch", "delete", "revoke"])
def test_device_mutations_require_admin(api_client, clinical_records, key, action):
    env = clinical_records
    api_client.force_authenticate(user=env[key])
    url = f'/api/v1/devices/{env["device"].pk}/'
    if action == "create": response = api_client.post("/api/v1/devices/", {}, format="json")
    elif action == "patch": response = api_client.patch(url, {"firmware_version": "untrusted"}, format="json")
    elif action == "delete": response = api_client.delete(url)
    else: response = api_client.post(url + "revoke/")
    assert response.status_code == 403
    assert Device.objects.filter(pk=env["device"].pk).exists()


def test_admin_metadata_and_clinical_separation(api_client, clinical_records):
    env = clinical_records
    api_client.force_authenticate(user=env["admin"])
    for url in ["/api/v1/patients/", f'/api/v1/patients/{env["pat_a"].pk}/']:
        response = api_client.get(url)
        assert response.status_code == 200
        rows = response.data["results"] if "results" in response.data else [response.data]
        assert all("patient_profile" not in row and "assigned_doctor" not in row for row in rows)
    assert api_client.get("/api/v1/devices/").data["count"] == 2
    assert api_client.get("/api/v1/audit-log/").status_code == 200
    assert api_client.delete(f'/api/v1/devices/{env["device"].pk}/').status_code == 400
    assert Session.objects.filter(pk=env["session"].pk).exists()
    for url in ["/api/v1/plans/", "/api/v1/sessions/", f'/api/v1/sessions/{env["session"].pk}/telemetry/', f'/api/v1/my-plan/?patient_id={env["pat_a"].pk}']:
        assert api_client.get(url).status_code == 403


@pytest.mark.parametrize("key", ["pat_a", "doc_a"])
def test_cross_patient_clinical_reads_denied(api_client, clinical_records, key):
    env = clinical_records
    api_client.force_authenticate(user=env[key])
    for url in [f'/api/v1/my-plan/?patient_id={env["pat_b"].pk}', f'/api/v1/plans/{env["other_plan"].pk}/', f'/api/v1/sessions/{env["other_session"].pk}/', f'/api/v1/sessions/{env["other_session"].pk}/telemetry/']:
        assert api_client.get(url).status_code == 404


def test_clinician_plan_lookup_parameters_and_draft_visibility(api_client, seed_environment):
    env = seed_environment
    PlanVersion.objects.create(patient=env["pat_a"], authored_by=env["doc_a"])
    api_client.force_authenticate(user=env["doc_a"])
    assert api_client.get("/api/v1/my-plan/").status_code == 400
    assert api_client.get("/api/v1/my-plan/?patient_id=not-a-uuid").status_code == 404
    api_client.force_authenticate(user=env["pat_a"])
    assert api_client.get("/api/v1/my-plan/").status_code == 404


@pytest.mark.parametrize("key", ["pat_a", "admin"])
@pytest.mark.parametrize("action", ["create", "patch", "delete", "publish"])
def test_plan_writers_must_be_clinicians(api_client, clinical_records, key, action):
    env = clinical_records
    api_client.force_authenticate(user=env[key])
    url = f'/api/v1/plans/{env["plan"].pk}/'
    if action == "create": response = api_client.post("/api/v1/plans/", {"patient": str(env["pat_b"].pk)}, format="json")
    elif action == "patch": response = api_client.patch(url, {"clinical_notes": "untrusted"}, format="json")
    elif action == "delete": response = api_client.delete(url)
    else: response = api_client.post(url + "publish/")
    assert response.status_code == 403


def test_clinician_cannot_create_for_unassigned_or_nonpatient(api_client, clinical_records):
    env = clinical_records
    api_client.force_authenticate(user=env["doc_a"])
    for patient in [env["pat_b"], env["doc_a"]]:
        assert api_client.post("/api/v1/plans/", {"patient": str(patient.pk)}, format="json").status_code == 400
    assert api_client.post("/api/v1/plans/", {"patient": str(env["pat_a"].pk)}, format="json").status_code == 201


@pytest.mark.parametrize("field,value", [("patient", "pat_b"), ("authored_by", "doc_b"), ("status", "PUBLISHED"), ("version_number", 77)])
def test_draft_metadata_cannot_be_overwritten(api_client, seed_environment, field, value):
    env = seed_environment
    draft = PlanVersion.objects.create(patient=env["pat_a"], authored_by=env["doc_a"])
    api_client.force_authenticate(user=env["doc_a"])
    value = str(env[value].pk) if value in ("pat_b", "doc_b") else value
    assert api_client.patch(f"/api/v1/plans/{draft.pk}/", {field: value}, format="json").status_code == 400
    assert api_client.patch(f"/api/v1/plans/{draft.pk}/", {"clinical_notes": "Allowed draft edit"}, format="json").status_code == 200


@pytest.mark.parametrize("field,value", [("doctor_reviewed", True), ("doctor_review_notes", "Forged approval"), ("patient", "untrusted"), ("plan_version", None), ("max_flexion_deg", 999), ("sensor_estimated_reps", 99)])
def test_patient_cannot_write_protected_session_fields(api_client, clinical_records, field, value):
    env = clinical_records
    api_client.force_authenticate(user=env["pat_a"])
    assert api_client.patch(f'/api/v1/sessions/{env["session"].pk}/', {field: value}, format="json").status_code == 400
    env["session"].refresh_from_db()
    assert not env["session"].doctor_reviewed
    assert api_client.post("/api/v1/sessions/", {field: value}, format="json").status_code == 400


def test_patient_allowed_session_fields_and_clinician_review(api_client, clinical_records):
    env = clinical_records
    api_client.force_authenticate(user=env["pat_a"])
    assert api_client.post("/api/v1/sessions/", {"exercise_name": "Allowed exercise", "patient_reported_reps": 3}, format="json").status_code == 201
    url = f'/api/v1/sessions/{env["session"].pk}/'
    assert api_client.patch(url, {"patient_reported_reps": 7}, format="json").status_code == 200
    assert api_client.post(url + "review/", {"notes": "Forged"}).status_code == 403
    assert api_client.delete(url).status_code == 405
    api_client.force_authenticate(user=env["doc_b"])
    assert api_client.post(url + "review/", {"notes": "Unassigned"}).status_code == 404
    api_client.force_authenticate(user=env["doc_a"])
    assert api_client.post("/api/v1/sessions/", {}, format="json").status_code == 403
    assert api_client.patch(url, {"doctor_reviewed": True}, format="json").status_code == 403
    assert api_client.post(url + "review/", {"notes": "Assigned review"}).status_code == 200


def payload(env, **overrides):
    return {"device_id": env["device"].device_identifier, "session_id": str(env["session"].pk),
            "boot_id": "security-test", "sequence_number": 1, "samples": [{"offset_ms": 0, "knee_angle_deg": 15}], **overrides}


def hardware_client(env):
    client = APIClient()
    client.credentials(HTTP_AUTHORIZATION=f'DeviceBearer {env["device_token"]}')
    return client


def test_device_token_scope_and_ingest_identity(clinical_records):
    env = clinical_records
    client = hardware_client(env)
    for url in ["/api/v1/auth/me/", "/api/v1/patients/", "/api/v1/devices/", "/api/v1/sessions/", "/api/v1/audit-log/"]:
        assert client.get(url).status_code == 401
    for changed in [{"device_id": env["other_device"].device_identifier, "session_id": str(env["other_session"].pk)}, {"session_id": str(env["other_session"].pk)}, {"device_id": "UNREGISTERED"}, {"session_id": str(uuid.uuid4())}]:
        assert client.post("/api/v1/telemetry/ingest/", payload(env, **changed), format="json").status_code in (403, 404)
    assert not TelemetryBatch.objects.exists()
    assert not Device.objects.filter(device_identifier="UNREGISTERED").exists()
    assert client.post("/api/v1/telemetry/ingest/", payload(env), format="json").status_code == 201
    assert client.post("/api/v1/telemetry/ingest/", payload(env), format="json").status_code == 200
    assert TelemetryBatch.objects.count() == 1


@pytest.mark.parametrize("key", ["admin", "doc_a", "pat_a"])
def test_browser_identity_cannot_ingest(seed_environment, key):
    client = APIClient()
    client.force_login(seed_environment[key])
    assert client.post("/api/v1/telemetry/ingest/", {}, format="json").status_code == 401


@pytest.mark.parametrize("state", ["revoked", "expired", "unassigned", "completed"])
def test_device_ingest_requires_valid_credential_assignment_and_session(clinical_records, state):
    env = clinical_records
    if state in ("revoked", "expired"):
        credential = DeviceCredential.objects.get(device=env["device"])
        if state == "revoked": credential.is_revoked = True
        else: credential.expires_at = timezone.now() - timezone.timedelta(seconds=1)
        credential.save()
    elif state == "unassigned": DeviceAssignment.objects.filter(device=env["device"]).update(active=False)
    else: Session.objects.filter(pk=env["session"].pk).update(status=Session.Status.COMPLETED)
    assert hardware_client(env).post("/api/v1/telemetry/ingest/", payload(env), format="json").status_code in (401, 404, 409)
    assert not TelemetryBatch.objects.exists()


def test_admin_can_register_validate_assignment_and_revoke(api_client, seed_environment):
    env = seed_environment
    api_client.force_authenticate(user=env["admin"])
    data = {"device_identifier": "NEW-ADMIN-DEVICE", "mac_address": "33:44:55:66:77:88", "assigned_patient_id": str(env["doc_a"].pk)}
    assert api_client.post("/api/v1/devices/", data, format="json").status_code == 400
    assert not Device.objects.filter(device_identifier=data["device_identifier"]).exists()
    data["assigned_patient_id"] = str(env["pat_a"].pk)
    response = api_client.post("/api/v1/devices/", data, format="json")
    assert response.status_code == 201
    assert "hardwareBearerToken" in response.data
    assert api_client.post(f'/api/v1/devices/{response.data["id"]}/revoke/').status_code == 200


def test_inactive_clinician_assignment_removes_reads_and_writes(api_client, clinical_records):
    env = clinical_records
    ClinicianAssignment.objects.filter(clinician=env["doc_a"], patient=env["pat_a"]).update(active=False)
    api_client.force_authenticate(user=env["doc_a"])
    assert api_client.get("/api/v1/devices/").data["count"] == 0
    assert api_client.get(f'/api/v1/my-plan/?patient_id={env["pat_a"].pk}').status_code == 404
    assert api_client.post("/api/v1/plans/", {"patient": str(env["pat_a"].pk)}, format="json").status_code == 400


def test_unknown_backend_role_cannot_establish_session(seed_environment):
    user = seed_environment["pat_a"]
    user.role = "UNSUPPORTED"
    user.save(update_fields=["role"])
    client, token = csrf_client()
    assert client.post("/api/v1/auth/login/", {"email": user.email, "password": "password123"}, format="json", HTTP_X_CSRFTOKEN=token).status_code == 401
    assert client.get("/api/v1/auth/me/").status_code == 401
