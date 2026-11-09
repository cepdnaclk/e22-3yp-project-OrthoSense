import uuid
from apps.exercises.models import ExerciseDefinition, ExercisePrescription
from apps.exercises.models import PlanVersion
from apps.telemetry.models import Session


def test_create_responses_include_canonical_identity(api_client, seed_environment):
    env = seed_environment
    api_client.force_authenticate(user=env["doc_a"])
    response = api_client.post("/api/v1/plans/", {"patient": str(env["pat_a"].pk), "clinical_notes": "Contract test"}, format="json")
    assert response.status_code == 201
    assert response.data["id"] and response.data["version_number"] == 1
    assert response.data["clinical_notes"] == "Contract test"
    assert response.data["prescriptions"] == []
    plan=PlanVersion.objects.get(pk=response.data["id"])
    exercise=ExerciseDefinition.objects.create(code="contract",name="Contract exercise",description="test")
    item=ExercisePrescription.objects.create(plan_version=plan,exercise=exercise)
    plan.publish()
    api_client.force_authenticate(user=env["pat_a"])
    response = api_client.post("/api/v1/sessions/", {"prescription_id": str(item.pk), "session_id": str(uuid.uuid4())}, format="json")
    assert response.status_code == 201
    assert response.data["id"] and response.data["patient_reported_reps"] is None
    assert response.data["patient_id"] == str(env["pat_a"].pk)
    assert Session.objects.get(pk=response.data["id"]).exercise_name == "Contract exercise"


def test_patient_filter_does_not_expand_clinician_scope(api_client, seed_environment):
    env = seed_environment
    Session.objects.create(patient=env["pat_a"])
    Session.objects.create(patient=env["pat_b"])
    api_client.force_authenticate(user=env["doc_a"])
    response = api_client.get("/api/v1/sessions/", {"patient_id": str(env["pat_b"].pk)})
    assert response.status_code == 200 and response.data["count"] == 0
    assert api_client.get("/api/v1/sessions/", {"patient_id": "invalid"}).status_code == 400
