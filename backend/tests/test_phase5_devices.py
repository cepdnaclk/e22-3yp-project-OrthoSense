import pytest
from django.utils import timezone
from datetime import timedelta
from apps.devices.models import Device, DeviceCredential
from rest_framework.test import APIClient


def hardware(env):
    c=APIClient()
    c.credentials(HTTP_AUTHORIZATION="DeviceBearer "+env["device_token"])
    return c


def test_heartbeat_health_and_staleness(api_client,seed_environment):
    env=seed_environment
    client=hardware(env)
    payload={"device_id":env["device"].device_identifier,"battery_percent":63,"firmware_version":"test-hw","channels":[{"channel_index":0,"sensor_type":"IMU_THIGH","label":"Thigh","health_status":"DEGRADED"}]}
    assert client.post("/api/v1/devices/heartbeat/",payload,format="json").status_code==200
    api_client.force_authenticate(user=env["pat_a"])
    url=f'/api/v1/devices/{env["device"].pk}/'
    data=api_client.get(url).data
    assert data["connectivity"]=="online" and data["battery_percent"]==63
    assert data["sensor_channels"][0]["health_status"]=="DEGRADED"
    from apps.devices.models import TechnicalAlert
    assert TechnicalAlert.objects.filter(device=env["device"],code="CH0_DEGRADED",resolved_at=None).count()==1
    Device.objects.filter(pk=env["device"].pk).update(last_seen_at=timezone.now()-timedelta(seconds=100))
    assert api_client.get(url).data["connectivity"]=="offline"
    assert client.post("/api/v1/devices/heartbeat/",{"device_id":env["device"].device_identifier},format="json").status_code==200
    data=api_client.get(url).data
    assert data["battery_percent"] is None and data["sensor_channels"]==[]


def test_heartbeat_identity_and_payload_rejection(api_client,seed_environment):
    env=seed_environment
    c=hardware(env)
    assert c.post("/api/v1/devices/heartbeat/",{"device_id":"OTHER"},format="json").status_code==403
    assert c.post("/api/v1/devices/heartbeat/",{"device_id":env["device"].device_identifier,"battery_percent":101},format="json").status_code==400
    api_client.force_authenticate(user=env["pat_a"])
    # Browser sessions have no device bearer identity.
    plain=APIClient()
    plain.force_login(env["pat_a"])
    assert plain.post("/api/v1/devices/heartbeat/",{},format="json").status_code==401


def test_assignment_conflicts_and_explicit_unassignment(api_client,seed_environment):
    env=seed_environment
    other=Device.objects.create(device_identifier="OTHER",mac_address="22:22:22:22:22:22")
    api_client.force_authenticate(user=env["admin"])
    target=f"/api/v1/devices/{other.pk}/assign/"
    assert api_client.post(target,{"patient_id":str(env["pat_a"].pk)},format="json").status_code==409
    original=f'/api/v1/devices/{env["device"].pk}/assign/'
    assert api_client.post(original,{"patient_id":None},format="json").status_code==200
    assert api_client.post(target,{"patient_id":str(env["pat_a"].pk)},format="json").status_code==200
    api_client.force_authenticate(user=env["pat_a"])
    assert api_client.post(target,{"patient_id":None},format="json").status_code==403


def test_one_time_provisioning_rotation_revokes_old_token(api_client,seed_environment):
    env=seed_environment
    api_client.force_authenticate(user=env["admin"])
    created=api_client.post("/api/v1/devices/",{"device_identifier":"NEW","mac_address":"33:33:33:33:33:33"},format="json")
    assert created.status_code==201 and created.data["hardwareBearerToken"]
    credential=DeviceCredential.objects.get(device_id=created.data["id"])
    assert credential.raw_token_display==""
    assert created.data["battery_percent"] is None and created.data["sensor_channels"]==[]
    rotated=api_client.post(f'/api/v1/devices/{env["device"].pk}/rotate/')
    assert rotated.status_code==200 and rotated.data["hardwareBearerToken"]
    assert hardware(env).post("/api/v1/devices/heartbeat/",{"device_id":env["device"].device_identifier},format="json").status_code==401
