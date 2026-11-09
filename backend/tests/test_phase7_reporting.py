from datetime import datetime, timezone, timedelta
import pytest
from apps.telemetry.models import Session, TelemetryBatch, ReviewNote
from apps.exercises.models import ExerciseDefinition, ExercisePrescription, PlanVersion
from apps.devices.models import Device
from apps.telemetry.reporting import downsample_envelope


def test_session_filters_and_cross_patient_scope(api_client, seed_environment):
    e=seed_environment
    inside=Session.objects.create(patient=e["pat_a"],status="completed",started_at=datetime(2026,11,9,23,59,tzinfo=timezone.utc))
    Session.objects.create(patient=e["pat_a"],status="in_progress",started_at=datetime(2026,11,9,tzinfo=timezone.utc))
    Session.objects.create(patient=e["pat_a"],status="completed",started_at=datetime(2026,11,10,tzinfo=timezone.utc))
    Session.objects.create(patient=e["pat_b"],status="completed",started_at=inside.started_at)
    api_client.force_authenticate(user=e["doc_a"])
    filters={"patient_id":str(e["pat_a"].pk),"date_from":"2026-11-09","date_to":"2026-11-09","status":"completed","reviewed":"false"}
    result=api_client.get("/api/v1/sessions/",filters)
    assert result.status_code==200 and result.data["count"]==1
    assert result.data["results"][0]["id"]==str(inside.pk)
    assert api_client.get("/api/v1/sessions/",{**filters,"patient_id":str(e["pat_b"].pk)}).data["count"]==0
    assert api_client.get("/api/v1/sessions/summary/",{**filters,"patient_id":str(e["pat_b"].pk)}).data["patients"]==0


@pytest.mark.parametrize("query",[{"date_from":"bad"},{"date_from":"2026-11-10","date_to":"2026-11-09"},{"status":"invented"},{"reviewed":"maybe"},{"ordering":"patient__password"},{"patient_id":"bad"}])
def test_bad_filters_are_structured_errors(api_client,seed_environment,query):
    api_client.force_authenticate(user=seed_environment["doc_a"])
    for url in ("/api/v1/sessions/","/api/v1/sessions/summary/"):
        response=api_client.get(url,query)
        assert response.status_code==400 and isinstance(response.data,dict)


def test_summary_counts_all_pages_and_fresh_devices(api_client,seed_environment):
    e=seed_environment
    now=datetime.now(timezone.utc)
    for _ in range(25):
        Session.objects.create(patient=e["pat_a"],status="completed",started_at=now)
    Session.objects.create(patient=e["pat_a"],status="in_progress",started_at=now)
    Session.objects.create(patient=e["pat_b"],status="completed",started_at=now)
    Device.objects.filter(pk=e["device"].pk).update(last_seen_at=now-timedelta(seconds=100))
    api_client.force_authenticate(user=e["doc_a"])
    assert len(api_client.get("/api/v1/sessions/").data["results"])==20
    data=api_client.get("/api/v1/sessions/summary/").data
    assert data["completed"]==25 and data["sessions"]==26 and data["pending_review"]==25
    assert data["patients"]==1 and data["assigned_devices"]==1 and data["online_devices"]==0
    assert data["adherence_percent"] is None and data["trends"][0]["daily"]==[]
    Device.objects.filter(pk=e["device"].pk).update(last_seen_at=now)
    assert api_client.get("/api/v1/sessions/summary/").data["online_devices"]==1
    api_client.force_authenticate(user=e["admin"])
    assert api_client.get("/api/v1/sessions/summary/").status_code==403


def measured_records(e):
    exercise=ExerciseDefinition.objects.create(code="phase7",name="Knee flexion",description="Test")
    plan=PlanVersion.objects.create(patient=e["pat_a"],authored_by=e["doc_a"])
    item=ExercisePrescription.objects.create(plan_version=plan,exercise=exercise,target_flexion_deg=95,target_extension_deg=5)
    plan.publish()
    return plan,item


def test_patient_daily_trends_and_saved_prescription_version(api_client,seed_environment):
    e=seed_environment
    plan,item=measured_records(e)
    last=None
    for index,(day,angle,source) in enumerate([(1,70,"hardware"),(1,90,"hardware"),(2,100,"hardware"),(2,160,"simulation")]):
        last=Session.objects.create(patient=e["pat_a"],device=e["device"],prescription=item,plan_version=plan,exercise_name=item.exercise.name,status="completed",quality_flag="degraded",max_flexion_deg=angle,started_at=datetime(2026,11,day,hour=index,tzinfo=timezone.utc))
        TelemetryBatch.objects.create(session=last,device=e["device"],boot_id=str(last.pk),sequence_number=0,raw_payload={"source":source,"samples":[{"offset_ms":0,"knee_angle_deg":angle,"health":{"angle":"READ_OK"}}]})
    new=PlanVersion.objects.create(patient=e["pat_a"],authored_by=e["doc_a"],version_number=2)
    ExercisePrescription.objects.create(plan_version=new,exercise=item.exercise,target_flexion_deg=120)
    new.publish()
    api_client.force_authenticate(user=e["doc_a"])
    data=api_client.get("/api/v1/sessions/summary/",{"date_from":"2026-11-01","date_to":"2026-11-02"}).data
    trend=data["trends"][0]
    assert [d["mean_max_flexion_deg"] for d in trend["daily"]]==[80,100]
    assert trend["flexion_change_deg"]==20
    assert trend["latest_session_id"]==str(last.pk)
    saved=api_client.get(f"/api/v1/sessions/{last.pk}/").data
    assert saved["plan_version_number"]==1 and saved["prescribed_item"]["target_flexion_deg"]==95
    assert saved["plan_author_name"]==e["doc_a"].full_name


def test_review_retry_revision_conflict_and_canonical_author(api_client,seed_environment):
    e=seed_environment
    session=Session.objects.create(patient=e["pat_a"],status="completed")
    api_client.force_authenticate(user=e["doc_a"])
    url=f"/api/v1/sessions/{session.pk}/review/"
    first=api_client.post(url,{"notes":"Initial"},format="json")
    assert first.status_code==200
    note=first.data["review_notes"][0]
    assert note["doctor_name"]==e["doc_a"].full_name and note["clinician"]==e["doc_a"].pk
    assert first.data["doctor_reviewed_at"]==note["reviewed_at"]
    assert api_client.post(url,{"notes":"Initial"},format="json").data==first.data
    assert ReviewNote.objects.count()==1
    assert api_client.post(url,{"notes":"Changed"},format="json").status_code==409
    second=api_client.post(url,{"notes":"Changed","replace_review":True,"expected_review_id":note["id"]},format="json")
    assert second.status_code==200 and len(second.data["review_notes"])==2
    assert second.data["review_notes"][0]["content"]=="Changed"
    assert api_client.post(url,{"notes":"Concurrent edit","replace_review":True,"expected_review_id":note["id"]},format="json").status_code==409
    session.status="in_progress";session.save()
    assert api_client.post(url,{"notes":"Not finished"},format="json").status_code==409


def point(i,**values):
    return {"timestampMs":i*100,"kneeAngleDeg":i%3,"fsrHeelRaw":i%2,"fsrToeRaw":None,"skinTemperatureC":30,
      "channelHealth":{"angle":"READ_OK","fsr":"READ_OK","temp":"READ_OK"},"source":"hardware","bootId":"a","sequenceNumber":i,"rawSample":{},**values}


def test_envelope_preserves_extrema_quality_provenance_and_bounds():
    points=[point(i) for i in range(200)]
    points[17]["fsrHeelRaw"]=4095
    points[42]["skinTemperatureC"]=80
    points[63]["kneeAngleDeg"]=-15
    points[78]["channelHealth"]["angle"]="STALE"
    points[89]["source"]="simulation"
    result=downsample_envelope(points,20)
    assert len(result)<=20 and result[0]["timestampMs"]==0 and result[-1]["timestampMs"]==19900
    assert max(p["fsrHeelRaw"] for p in result)==4095
    assert max(p["skinTemperatureC"] for p in result)==80
    assert min(p["kneeAngleDeg"] for p in result)==-15
    assert any(p["gapBefore"]["angle"] for p in result)
    assert any(p["qualitySummary"]["angle"].get("STALE") for p in result)
    assert any(p["sourceSummary"].get("simulation") for p in result)
    assert all(p["source"]==points[p["timestampMs"]//100]["source"] for p in result)


def test_gap_is_specific_to_missing_toe_and_handles_single_point():
    points=[point(0,fsrToeRaw=1),point(1),point(2,fsrToeRaw=2)]
    result=downsample_envelope(points,3)
    assert not result[-1]["gapBefore"]["fsrHeelRaw"]
    assert result[-1]["gapBefore"]["fsrToeRaw"]
    assert len(downsample_envelope([point(0)],3))==1
