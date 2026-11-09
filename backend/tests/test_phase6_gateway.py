"""Gateway failure behavior with a fake HTTP boundary, not physical transport proof."""
import importlib.util
from pathlib import Path
from urllib.error import HTTPError, URLError
import pytest

spec=importlib.util.spec_from_file_location("phase6_gateway",Path(__file__).resolve().parents[2]/"edge/gateway/gateway.py")
gateway=importlib.util.module_from_spec(spec)
spec.loader.exec_module(gateway)


def test_retry_persists_exact_packet_and_ack_identity(tmp_path):
    path=tmp_path/"outbox.sqlite3"
    packet={"session_id":"saved-session","sequence_number":42,"samples":[{"offset_ms":0}]}
    box=gateway.Outbox(path)
    box.enqueue(packet)
    def offline(payload):
        assert payload==packet
        raise URLError("offline")
    assert box.flush_one(offline) is False
    box.db.close()
    box=gateway.Outbox(path)
    with box.db:
        box.db.execute("UPDATE packets SET next_at=0")
    assert not box.flush_one(lambda _: {"status":"stored","sequence_number":41,"session_id":"saved-session"})
    with box.db:
        box.db.execute("UPDATE packets SET next_at=0")
    assert box.flush_one(lambda _: {"status":"already_stored","sequence_number":42,"session_id":"saved-session"})
    assert box.db.execute("SELECT COUNT(*) FROM packets").fetchone()[0]==0


def test_outbox_capacity_and_permanent_rejection(tmp_path):
    box=gateway.Outbox(tmp_path/"outbox.sqlite3",limit=1)
    box.enqueue({"session_id":"session","sequence_number":0})
    with pytest.raises(RuntimeError,match="full"):
        box.enqueue({})
    def conflict(_):
        raise HTTPError("https://test.invalid",409,"Conflict",{},None)
    with pytest.raises(RuntimeError,match="409"):
        box.flush_one(conflict)
    assert box.db.execute("SELECT error FROM packets").fetchone()[0]
    assert not box.flush_one(lambda _: pytest.fail("Permanent errors must not retry blindly"))


def test_encoder_preserves_simulation_quality_and_units():
    record={"source":"simulation","imu1":{"quality":"STALE","last_success_ms":9,"accel_m_s2":[1,2,3],"gyro_deg_s":[4,5,6]},"fsr_pot_sim":{"quality":"RAIL/CHECK","value":4095},"temperature":{"quality":"NO RESPONSE","value":None}}
    packet=gateway.encode_debug(record,"device","session","boot",0,20)
    sample=packet["samples"][0]
    assert packet["source"]=="simulation" and "knee_angle_deg" not in sample
    assert sample["health"]["imu1"]=="STALE" and sample["health"]["fsr"]=="RAIL_ERROR"
    assert sample["observed_ms"]["imu1"]==9 and sample["temp_c"]==[None]
    with pytest.raises(ValueError):
        gateway.encode_debug({"source":"hardware"},"d","s","b",0,0)
