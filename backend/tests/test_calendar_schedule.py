import pytest
from apps.exercises.models import ExerciseDefinition


def test_doctor_calendar_schedule_roundtrip_and_patient_visibility(api_client,seed_environment):
    env=seed_environment
    ex=ExerciseDefinition.objects.create(code="calendar",name="Calendar exercise",description="Test")
    api_client.force_authenticate(user=env["doc_a"])
    body={"patient":str(env["pat_a"].pk),"items":[{"exercise_id":str(ex.pk)}],"schedule":[{"exercise_id":str(ex.pk),"scheduled_at":"2026-12-01T10:00:00+05:30"}]}
    result=api_client.post("/api/v1/plans/",body,format="json")
    assert result.status_code==201
    url=f'/api/v1/plans/{result.data["id"]}/'
    assert result.data["schedule"][0]["exercise_id"]==str(ex.pk)
    assert api_client.post(url+"publish/").status_code==200
    api_client.force_authenticate(user=env["pat_a"])
    assert len(api_client.get("/api/v1/my-plan/").data["schedule"])==1
    assert api_client.patch(url,{"schedule":[]},format="json").status_code==403
    api_client.force_authenticate(user=env["doc_a"])
    assert api_client.patch(url,{"schedule":[]},format="json").status_code==400


def test_reminder_requires_a_prescribed_exercise(api_client,seed_environment):
    api_client.force_authenticate(user=seed_environment["doc_a"])
    result=api_client.post("/api/v1/plans/",{"patient":str(seed_environment["pat_a"].pk),"schedule":[{"exercise_id":"00000000-0000-0000-0000-000000000001","scheduled_at":"2026-12-01T10:00:00Z"}]},format="json")
    assert result.status_code==400
