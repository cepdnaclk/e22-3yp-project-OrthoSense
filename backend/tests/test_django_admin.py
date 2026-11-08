import pytest
from django.apps import apps
from django.contrib import admin
from django.contrib.auth.models import Permission
from django.urls import reverse

from apps.accounts.admin import PortalUserCreationForm
from apps.accounts.models import AuditLogEntry, ClinicianAssignment, ClinicianProfile, PatientProfile, User
from apps.devices.models import Device, DeviceAssignment, DeviceCredential, SensorChannel, TechnicalAlert
from apps.exercises.models import ExerciseDefinition, ExercisePrescription, PlanVersion
from apps.telemetry.models import ReviewNote, Session, TelemetryBatch


PROJECT_MODELS = tuple(model for label in ("accounts", "devices", "exercises", "telemetry", "analytics")
                       for model in apps.get_app_config(label).get_models())


@pytest.fixture
def superuser(db):
    return User.objects.create_superuser(email="django-admin@example.test", password="Admin-check-password-2026")


def admin_url(model, action, *args):
    return reverse(f"admin:{model._meta.app_label}_{model._meta.model_name}_{action}", args=args)


def test_all_project_models_registered():
    assert len(PROJECT_MODELS) == 16
    assert all(admin.site.is_registered(model) for model in PROJECT_MODELS)


@pytest.mark.parametrize("model", PROJECT_MODELS, ids=lambda model: model.__name__)
def test_superuser_can_load_every_model_list(client, superuser, model):
    client.force_login(superuser)
    assert client.get(admin_url(model, "changelist")).status_code == 200


@pytest.mark.parametrize("model", [User, PatientProfile, ClinicianProfile, ClinicianAssignment, Device,
                                     DeviceAssignment, SensorChannel, TechnicalAlert, ExerciseDefinition,
                                     PlanVersion, ExercisePrescription, Session])
def test_superuser_can_open_model_creation_forms(client, superuser, model):
    client.force_login(superuser)
    assert client.get(admin_url(model, "add")).status_code == 200


@pytest.mark.parametrize("role", [User.Role.CLINICIAN, User.Role.PATIENT, User.Role.ADMIN])
def test_admin_user_creation_hashes_password_and_allows_portal_login(client, superuser, role):
    client.force_login(superuser)
    email = f"new-{role.lower()}@example.test"
    password = "Strong-test-password-2026"
    response = client.post(admin_url(User, "add"), {
        "email": email, "username": "", "full_name": "New account", "role": role,
        "department": "", "password1": password, "password2": password, "_save": "Save",
    })
    assert response.status_code == 302
    user = User.objects.get(email=email)
    assert user.check_password(password)
    assert user.password != password
    assert user.role == role and user.username and user.is_active
    assert not user.is_superuser and not user.is_staff
    client.logout()
    assert client.login(email=email, password=password)


def test_admin_password_change_and_profile_edit_preserve_hashing(client, superuser, seed_environment):
    patient = seed_environment["pat_a"]
    client.force_login(superuser)
    assert client.get(admin_url(User, "change", patient.pk)).status_code == 200
    response = client.post(reverse("admin:auth_user_password_change", args=[patient.pk]), {
        "password1": "Another-strong-password-2026", "password2": "Another-strong-password-2026",
        "set_usable_password": "true",
    })
    assert response.status_code == 302
    patient.refresh_from_db()
    assert patient.check_password("Another-strong-password-2026")
    response = client.post(admin_url(User, "change", patient.pk), {
        "email": patient.email, "username": patient.username, "full_name": "Updated patient name",
        "first_name": "", "last_name": "", "role": patient.role, "department": "",
        "is_active": "on", "_save": "Save",
    })
    assert response.status_code == 302
    patient.refresh_from_db()
    assert patient.full_name == "Updated patient name"
    assert patient.check_password("Another-strong-password-2026")


def test_creation_form_rejects_duplicate_email_and_mismatched_passwords(seed_environment):
    data = {"email": seed_environment["pat_a"].email.upper(), "username": "",
            "role": User.Role.PATIENT, "password1": "Strong-test-password-2026", "password2": "Different-password-2026"}
    form = PortalUserCreationForm(data=data)
    assert not form.is_valid()
    assert "email" in form.errors and "password2" in form.errors


def test_non_superuser_staff_cannot_use_project_admin_even_with_model_permissions(client, seed_environment):
    user = seed_environment["admin"]
    user.is_staff = True
    user.save(update_fields=["is_staff"])
    user.user_permissions.set(Permission.objects.all())
    client.force_login(user)
    for model in PROJECT_MODELS:
        assert client.get(admin_url(model, "changelist")).status_code == 403
    assert client.post(admin_url(User, "add"), {}).status_code == 403


def test_anonymous_admin_access_redirects_to_login(client):
    response = client.get(admin_url(User, "changelist"))
    assert response.status_code == 302 and "/admin/login/" in response.url


def test_role_constrained_assignments_can_be_created(client, superuser, seed_environment):
    env = seed_environment
    client.force_login(superuser)
    # Both are valid roles, and no assignment exists for this pair yet.
    response = client.post(admin_url(ClinicianAssignment, "add"), {
        "clinician": str(env["doc_a"].pk), "patient": str(env["pat_b"].pk),
        "active": "on", "assigned_by": str(superuser.pk), "_save": "Save",
    })
    assert response.status_code == 302
    assert ClinicianAssignment.objects.filter(clinician=env["doc_a"], patient=env["pat_b"], active=True).exists()
    invalid = client.post(admin_url(ClinicianAssignment, "add"), {
        "clinician": str(env["pat_a"].pk), "patient": str(env["doc_b"].pk), "active": "on", "_save": "Save",
    })
    assert invalid.status_code == 200
    assert not ClinicianAssignment.objects.filter(clinician=env["pat_a"], patient=env["doc_b"]).exists()


def test_recorded_evidence_is_viewable_but_read_only(client, superuser, seed_environment):
    env = seed_environment
    session = Session.objects.create(patient=env["pat_a"], device=env["device"])
    records = [
        AuditLogEntry.objects.create(actor=superuser, actor_name="Admin", action="TEST_READ_ONLY"),
        TelemetryBatch.objects.create(session=session, device=env["device"], sequence_number=1, boot_id="admin-test", raw_payload={"samples": []}),
        ReviewNote.objects.create(session=session, clinician=env["doc_a"], content="Original review"),
    ]
    client.force_login(superuser)
    for obj in records:
        model = type(obj)
        assert client.get(admin_url(model, "change", obj.pk)).status_code == 200
        assert client.post(admin_url(model, "change", obj.pk), {}).status_code == 403
        assert client.post(admin_url(model, "delete", obj.pk), {"post": "yes"}).status_code == 403
        assert client.get(admin_url(model, "add")).status_code == 403
        assert model.objects.filter(pk=obj.pk).exists()


def test_credential_admin_does_not_expose_tokens(client, superuser, seed_environment):
    credential = DeviceCredential.objects.get(device=seed_environment["device"])
    credential.raw_token_display = "private-token-must-not-render"
    credential.save(update_fields=["raw_token_display"])
    client.force_login(superuser)
    response = client.get(admin_url(DeviceCredential, "change", credential.pk))
    assert response.status_code == 200
    assert "private-token-must-not-render" not in response.content.decode()
    assert client.get(admin_url(DeviceCredential, "add")).status_code == 403


def test_published_plan_and_prescription_are_read_only(client, superuser, seed_environment):
    env = seed_environment
    plan = PlanVersion.objects.create(patient=env["pat_a"], authored_by=env["doc_a"])
    exercise = ExerciseDefinition.objects.create(code="admin-test", name="Test", description="Test exercise")
    prescription = ExercisePrescription.objects.create(plan_version=plan, exercise=exercise)
    plan.publish()
    client.force_login(superuser)
    for obj in (plan, prescription):
        assert client.get(admin_url(type(obj), "change", obj.pk)).status_code == 200
        assert client.post(admin_url(type(obj), "change", obj.pk), {}).status_code == 403
        assert client.post(admin_url(type(obj), "delete", obj.pk), {"post": "yes"}).status_code == 403
