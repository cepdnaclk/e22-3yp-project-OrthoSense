import uuid
import pytest
from django.core.exceptions import ValidationError
from apps.exercises.models import ExerciseDefinition, ExercisePrescription, PlanVersion
from apps.telemetry.models import Session

@pytest.fixture
def editor(api_client, seed_environment):
    api_client.force_authenticate(user=seed_environment["doc_a"])
    exercise = ExerciseDefinition.objects.create(code="phase3", name="Test exercise", description="Test")
    body = {"patient":str(seed_environment["pat_a"].pk),"clinical_notes":"Initial", "items":[{"exercise_id":str(exercise.pk),"target_repetitions":7,"target_sets":2,"target_flexion_deg":90,"target_extension_deg":0,"rest_interval_seconds":45,"notes":"Slow movement"}]}
    return api_client,seed_environment,body

def test_draft_save_publish_revision_history(editor):
    client,env,body=editor
    created=client.post("/api/v1/plans/",body,format="json")
    assert created.status_code==201
    first=created.data["id"]
    url=f"/api/v1/plans/{first}/"
    item={**body["items"][0],"target_repetitions":9,"notes":"Updated instructions"}
    result=client.patch(url,{"clinical_notes":"Saved rationale","items":[item]},format="json")
    assert result.status_code==200 and result.data["prescriptions"][0]["target_repetitions"]==9
    assert client.get(url).data["clinical_notes"]=="Saved rationale"
    assert client.post(url+"publish/").status_code==200
    historical=Session.objects.create(patient=env["pat_a"],plan_version_id=first)
    assert client.patch(url,{"clinical_notes":"Forbidden"},format="json").status_code==400
    revised=client.post("/api/v1/plans/",{**body,"items":[item]},format="json")
    assert revised.status_code==201 and revised.data["version_number"]==2
    assert revised.data["id"]!=first
    client.force_authenticate(user=env["pat_a"])
    assert client.get("/api/v1/my-plan/").data["id"]==first
    assert client.get(f'/api/v1/plans/{revised.data["id"]}/').status_code==404
    client.force_authenticate(user=env["doc_a"])
    assert client.post(f'/api/v1/plans/{revised.data["id"]}/publish/').status_code==200
    assert PlanVersion.objects.get(pk=first).status=="ARCHIVED"
    historical.refresh_from_db()
    assert str(historical.plan_version_id)==first
    assert client.post(url+"publish/").status_code==400
    assert client.delete(url).status_code==400

@pytest.mark.parametrize("invalid",[{"exercise_id":str(uuid.uuid4())},{"target_sets":0},{"target_repetitions":-1},{"rest_interval_seconds":-1},{"target_extension_deg":100,"target_flexion_deg":90}])
def test_invalid_items_leave_draft_unchanged(editor,invalid):
    client,env,body=editor
    response=client.post("/api/v1/plans/",body,format="json")
    url=f'/api/v1/plans/{response.data["id"]}/'
    bad={**body["items"][0],**invalid}
    assert client.patch(url,{"clinical_notes":"Must not persist","items":[bad]},format="json").status_code==400
    assert client.get(url).data["clinical_notes"]=="Initial"
    assert client.get(url).data["prescriptions"][0]["target_repetitions"]==7

def test_replace_remove_order_and_empty_publish(editor):
    client,env,body=editor
    response=client.post("/api/v1/plans/",body,format="json")
    url=f'/api/v1/plans/{response.data["id"]}/'
    first=body["items"][0]
    result=client.patch(url,{"items":[{**first,"notes":"First"},{**first,"notes":"Second"}]},format="json")
    assert [x["notes"] for x in result.data["prescriptions"]]==["First","Second"]
    assert client.patch(url,{"items":[]},format="json").data["prescriptions"]==[]
    assert client.post(url+"publish/").status_code==400

def test_archived_model_content_and_moving_prescriptions_are_rejected(editor):
    client,env,body=editor
    response=client.post("/api/v1/plans/",body,format="json")
    plan=PlanVersion.objects.get(pk=response.data["id"])
    plan.publish()
    draft=PlanVersion.objects.create(patient=env["pat_a"],authored_by=env["doc_a"],version_number=2)
    rx=plan.prescriptions.first()
    rx.plan_version=draft
    with pytest.raises(ValidationError): rx.save()
    plan.status="ARCHIVED"
    plan.save()
    plan.clinical_notes="Changed archive"
    with pytest.raises(ValidationError): plan.save()
