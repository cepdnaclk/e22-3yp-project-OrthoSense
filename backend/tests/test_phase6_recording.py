import uuid
import pytest
from rest_framework.test import APIClient
from apps.exercises.models import ExerciseDefinition, ExercisePrescription, PlanVersion
from apps.telemetry.models import TelemetryBatch


@pytest.fixture
def recording(api_client, seed_environment):
    env = seed_environment
    exercise = ExerciseDefinition.objects.create(code="phase6", name="Prescribed flexion", description="test")
    plan = PlanVersion.objects.create(patient=env["pat_a"], authored_by=env["doc_a"])
    item = ExercisePrescription.objects.create(plan_version=plan, exercise=exercise, target_sets=2, target_repetitions=3, target_flexion_deg=80, target_extension_deg=10)
    plan.publish()
    api_client.force_authenticate(user=env["pat_a"])
    request = {"session_id": str(uuid.uuid4()), "prescription_id": str(item.pk)}
    response = api_client.post("/api/v1/sessions/", request, format="json")
    assert response.status_code == 201, response.data
    hardware = APIClient()
    hardware.credentials(HTTP_AUTHORIZATION="DeviceBearer " + env["device_token"])
    payload = {"schema_version": 1, "source": "hardware", "device_id": env["device"].device_identifier, "session_id": response.data["id"], "boot_id": "boot-a", "sequence_number": 0, "elapsed_ms": 0,
               "samples": [{"offset_ms": i*500, "knee_angle_deg": angle, "health": {"angle": "READ_OK"}} for i,angle in enumerate([5,85,5])]}
    return env, response.data, request, hardware, payload


def test_lifecycle_and_measurements(api_client, recording):
    env, session, start, hardware, payload = recording
    url = f'/api/v1/sessions/{session["id"]}/transition/'
    assert session["target_reps"] == 6 and session["sensor_estimated_reps"] is None
    assert api_client.post("/api/v1/sessions/", start, format="json").data["id"] == session["id"]
    assert hardware.post("/api/v1/telemetry/ingest/", payload, format="json").status_code == 201
    assert api_client.post(url, {"operation":"pause"}, format="json").data["paused_at"]
    later = {**payload, "sequence_number":1,"elapsed_ms":2000}
    assert hardware.post("/api/v1/telemetry/ingest/", later, format="json").status_code == 409
    assert api_client.post(url, {"operation":"resume"}, format="json").data["paused_at"] is None
    saved = api_client.post(url, {"operation":"finish","patient_reported_reps":4}, format="json")
    assert saved.status_code == 200
    assert saved.data["sensor_estimated_reps"] == 1 and saved.data["patient_reported_reps"] == 4
    assert saved.data["max_flexion_deg"] == 85 and saved.data["duration_seconds"] == 1
    assert api_client.post(url, {"operation":"finish","patient_reported_reps":4}, format="json").data == saved.data
    assert api_client.post(url, {"operation":"finish","patient_reported_reps":5}, format="json").status_code == 409
    assert hardware.post("/api/v1/telemetry/ingest/", payload, format="json").status_code == 200
    assert hardware.post("/api/v1/telemetry/ingest/", later, format="json").status_code == 409


@pytest.mark.parametrize("change", [
    {"samples":[]}, {"sequence_number":-1}, {"schema_version":2},
    {"samples":[{"offset_ms":0,"knee_angle_deg":float("inf")}]},
    {"samples":[{"offset_ms":0,"imu1":{"accel_m_s2":[1,2],"gyro_deg_s":[1,2,3]}}]},
    {"samples":[{"offset_ms":1},{"offset_ms":0}]},
    {"samples":[{"offset_ms":0}]*257},
])
def test_invalid_batches(api_client, recording, change):
    _,_,_,hardware,payload=recording
    # Bypass JSON encoding only for nonfinite input, to exercise the field directly.
    from apps.telemetry.serializers import TelemetryIngestPayloadSerializer
    serializer=TelemetryIngestPayloadSerializer(data={**payload, **change})
    assert not serializer.is_valid()
    assert TelemetryBatch.objects.count()==0


def test_duplicates_gaps_reboots_and_provenance(api_client, recording):
    _,session,_,hardware,payload=recording
    url="/api/v1/telemetry/ingest/"
    assert hardware.post(url,payload,format="json").status_code==201
    assert hardware.post(url,{**payload,"elapsed_ms":1},format="json").status_code==409
    assert hardware.post(url,{**payload,"sequence_number":1},format="json").status_code==400
    assert hardware.post(url,{**payload,"boot_id":"boot-b","source":"simulation","elapsed_ms":5000},format="json").status_code==201
    result=api_client.get(f'/api/v1/sessions/{session["id"]}/telemetry/').data
    assert result[-1]["source"]=="simulation" and result[-1]["bootId"]=="boot-b"
    assert result[0]["fsrHeelRaw"] is None
    for value in ("bad","0","2","5001"):
        assert api_client.get(f'/api/v1/sessions/{session["id"]}/telemetry/?max_points={value}').status_code==400


def test_abandon_empty_and_ownership(api_client, recording):
    env,session,start,hardware,payload=recording
    url=f'/api/v1/sessions/{session["id"]}/transition/'
    api_client.force_authenticate(user=env["pat_b"])
    assert api_client.post(url,{"operation":"abandon"},format="json").status_code==404
    assert api_client.post("/api/v1/sessions/",start,format="json").status_code==400
    api_client.force_authenticate(user=env["doc_a"])
    assert api_client.post(url,{"operation":"abandon"},format="json").status_code==403
    api_client.force_authenticate(user=env["pat_a"])
    assert api_client.get(f'/api/v1/sessions/{session["id"]}/telemetry/').data==[]
    saved=api_client.post(url,{"operation":"abandon"},format="json").data
    assert saved["quality_flag"]=="incomplete" and saved["ended_at"]
    assert saved["max_flexion_deg"] is None and saved["sensor_estimated_reps"] is None


def test_simulated_or_invalid_angles_never_become_measured_results(api_client, recording):
    _,session,_,hardware,payload=recording
    payload["source"]="simulation"
    assert hardware.post("/api/v1/telemetry/ingest/",payload,format="json").status_code==201
    saved=api_client.post(f'/api/v1/sessions/{session["id"]}/transition/',{"operation":"finish","patient_reported_reps":3},format="json").data
    assert saved["sensor_estimated_reps"] is None and saved["max_flexion_deg"] is None
    assert saved["duration_seconds"]==0 and saved["quality_flag"]=="incomplete"
    assert saved["patient_reported_reps"]==3


def test_invalid_sample_breaks_covered_duration(api_client, recording):
    _,session,_,hardware,payload=recording
    payload["samples"][1]["health"]["angle"]="STALE"
    assert hardware.post("/api/v1/telemetry/ingest/",payload,format="json").status_code==201
    saved=api_client.post(f'/api/v1/sessions/{session["id"]}/transition/',{"operation":"finish","patient_reported_reps":0},format="json").data
    assert saved["duration_seconds"]==0 and saved["sensor_estimated_reps"]==0


def test_start_rejects_unpublished_unassigned_or_missing_item(api_client, recording):
    env,session,start,_,_=recording
    from apps.devices.models import DeviceAssignment
    assert api_client.post("/api/v1/sessions/",{**start,"session_id":str(uuid.uuid4()),"prescription_id":str(uuid.uuid4())},format="json").status_code==400
    DeviceAssignment.objects.filter(patient=env["pat_a"]).update(active=False)
    assert api_client.post("/api/v1/sessions/",{**start,"session_id":str(uuid.uuid4())},format="json").status_code==400
