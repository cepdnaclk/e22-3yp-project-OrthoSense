import pytest
from apps.accounts.models import AuditLogEntry, PatientProfile


def test_patient_profile_updates_persist_and_are_own_only(api_client, seed_environment):
    env=seed_environment
    api_client.force_authenticate(user=env["pat_a"])
    response=api_client.patch("/api/v1/auth/me/",{"full_name":"Updated patient","emergency_contact_name":"Trusted contact","emergency_contact_phone":"1234567","haptic_alerts_enabled":False},format="json")
    assert response.status_code==200
    assert response.data["full_name"]=="Updated patient"
    profile=PatientProfile.objects.get(user=env["pat_a"])
    assert profile.emergency_contact_name=="Trusted contact" and not profile.haptic_alerts_enabled
    assert api_client.get("/api/v1/auth/me/").data["patient_profile"]["emergency_contact_phone"]=="1234567"
    assert PatientProfile.objects.get(user=env["pat_b"]).emergency_contact_phone==""
    assert AuditLogEntry.objects.filter(actor=env["pat_a"],action="PATIENT_PROFILE_UPDATED").exists()

@pytest.mark.parametrize("field,value",[("role","ADMIN"),("diagnosis","Unapproved"),("target_rom_flexion",999),("email","other@example.test"),("user_id","another-user")])
def test_patient_clinical_and_identity_fields_rejected(api_client,seed_environment,field,value):
    api_client.force_authenticate(user=seed_environment["pat_a"])
    assert api_client.patch("/api/v1/auth/me/",{field:value},format="json").status_code==400

@pytest.mark.parametrize("role",["admin","doc_a"])
def test_nonpatient_cannot_use_patient_profile_write(api_client,seed_environment,role):
    api_client.force_authenticate(user=seed_environment[role])
    assert api_client.patch("/api/v1/auth/me/",{"full_name":"Changed"},format="json").status_code==403


def test_missing_profile_does_not_create_fake_clinical_data(api_client,seed_environment):
    patient=seed_environment["pat_a"]
    PatientProfile.objects.filter(user=patient).delete()
    api_client.force_authenticate(user=patient)
    assert api_client.patch("/api/v1/auth/me/",{"full_name":"Must not save","emergency_contact_name":"Contact"},format="json").status_code==400
    patient.refresh_from_db()
    assert patient.full_name!="Must not save"
    assert not PatientProfile.objects.filter(user=patient).exists()
    assert api_client.patch("/api/v1/auth/me/",{"full_name":"Allowed name"},format="json").status_code==200
