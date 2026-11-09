# Phase 6 session recording and transport handoff

Implemented locally on 2026-11-09. Physical acceptance remains open.

## Implemented behavior

- `POST /api/v1/sessions/` starts an in-progress session from `{session_id, prescription_id}`. The client generates a UUID once and reuses it after a timeout. The server resolves the patient's published prescription, immutable version, exercise name, total target repetitions (sets × reps), and active assigned device. Repeating the start returns the same resource. Legacy free-form creation is rejected.
- `POST /api/v1/sessions/{id}/transition/` accepts `operation`: `pause`, `resume`, `finish`, or `abandon`. Finish also requires `patient_reported_reps` (0–10000). Pause records `paused_at`; resume clears it. Both retain samples. Finish/abandon stamp `ended_at` and close ingestion. Repeating the same finalization is safe; changing a saved manual count or terminal operation returns 409. Abandonment retains partial data with incomplete quality.
- Generic PATCH cannot edit outcomes, manual counts, or lifecycle. Clinician review remains a separate authorized action.
- Recorder starts the server resource before samples, restores its ID from sessionStorage, polls real telemetry, and shows stale/unavailable/connection states. It preserves the pending request and manual input on failures and guards duplicate button submissions. No generated angle, elapsed-time rep counter, fixed doctor, fabricated ROM, or false upload-success message remains. Navigate back to the recorder to recover a pending session; navigating away does not silently abandon it.
- Live angle display requires hardware provenance, READ_OK angle quality, and a recently received sample. An unchanged last sample cannot remain fresh by repeated polling.

## Packet v1

The authenticated gateway sends JSON to `POST /api/v1/telemetry/ingest/` with `Authorization: DeviceBearer <provisioned token>`:

```json
{
  "schema_version": 1,
  "source": "hardware",
  "device_id": "registered-device-identifier",
  "session_id": "saved-session-uuid",
  "boot_id": "unique-acquisition-boot-uuid",
  "sequence_number": 0,
  "elapsed_ms": 0,
  "samples": [{
    "offset_ms": 0,
    "knee_angle_deg": 12.3,
    "imu1": {"accel_m_s2": [0, 9.81, 0], "gyro_deg_s": [0, 0, 0]},
    "fsr": [1200],
    "temp_c": [31.2],
    "health": {"angle": "READ_OK", "imu1": "READ_OK", "fsr": "UNVERIFIED", "temp": "READ_OK"},
    "observed_ms": {"angle": 0, "imu1": 0, "fsr": 0, "temp": 0}
  }]
}
```

This is an illustrative packet, not measured device evidence. Do not substitute these values for readings. Missing channels are omitted or null. No sEMG producer is implemented. FSR values are ADC counts, not force units. The existing simulation has one FSR and one temperature channel.

- Each packet has 1–256 samples; offsets are strictly increasing, 0–60000 ms. `elapsed_ms` is a monotonic session-relative base (0–7 days), continuing across pauses/reboots. Producers must maintain continuity or obtain the last stored offset before reconnecting. Sequence is 0–2147483647 and strictly increases within a boot; generate a fresh boot ID on acquisition restart.
- IMU vectors have exactly three finite values with explicit units. FSR arrays have at most 3 values (0–4095); temperature arrays at most 2 (-40–125 °C). Angle range is -180–180°. Health vocabulary: READ_OK, STALE, NO_RESPONSE, RAIL_ERROR, INVALID, UNVERIFIED. Health/observation keys are angle, imu1, imu2, fsr, temp. Observation times use the same monotonic timeline as packet/sample offsets. They are retained as producer evidence; the server cannot authenticate physical calibration.
- Only the active assigned device may ingest for the active assigned patient's unpaused in-progress session. Device and session rows are locked during ingestion. Existing identical retries are acknowledged even after closure; conflicting content/session for the same device/boot/sequence is 409. New overlapping/backward batches are 400. Out-of-order arrivals must be retried in acquisition order, not relabeled.
- Success is `{status: "stored" | "already_stored", session_id, sequence_number}`. Do not drop a packet before validating all acknowledgment identity fields.
- Retrieval returns only stored samples, nulls for unavailable values, source/boot/sequence/server time, and full raw sample health, vectors and observation timestamps. It returns `[]` for no telemetry. `max_points` is restricted to 3–5000. LTTB is still angle-oriented; full quality/extrema-preserving decimation is Phase 7 work.

## Gateway software

`edge/gateway/gateway.py` implements a standard-library HTTPS sender with a SQLite outbox. It accepts canonical packet JSON lines from an acquisition bridge on stdin. The current firmware emits USB serial simulation debug JSON, for which `--debug-session` is an explicit encoder. That encoder always preserves `source=simulation`, units, quality, and last-success timestamps; it never creates knee angles from acceleration. The firmware has no BLE producer or calibrated angle estimator. Therefore S05's specified direct-device HTTPS / BLE gateway path and physical acceptance remain open; this is an implemented host HTTPS bridge, not firmware networking.

From the repository root in PowerShell, set `ORTHOSENSE_DEVICE_TOKEN` privately, then:

```powershell
# packets.jsonl must contain actual canonical packets for a saved session.
Get-Content .\packets.jsonl | python -B .\edge\gateway\gateway.py --url https://your-host/api/v1/telemetry/ingest/ --outbox .\edge\gateway\outbox.sqlite3

# Existing captured simulation serial records, retaining simulation provenance:
Get-Content .\serial-debug.jsonl | python -B .\edge\gateway\gateway.py --url https://your-host/api/v1/telemetry/ingest/ --device YOUR_REGISTERED_IDENTIFIER --debug-session SAVED_SESSION_UUID --outbox .\edge\gateway\outbox.sqlite3

# Drain retained packets after reconnecting; run before pause/finalization:
python -B .\edge\gateway\gateway.py --url https://your-host/api/v1/telemetry/ingest/ --outbox .\edge\gateway\outbox.sqlite3 --flush
```

HTTPS verifies certificates through the platform trust store; local-only HTTP requires `--allow-local-http` and localhost/127.0.0.1. Do not put credentials in files or command arguments. Protect the local outbox as patient data. It stores immutable packets, at most 10000 queued records, and stops at capacity without evicting samples. Retries use capped exponential delay (60 seconds) plus jitter. Non-429 4xx stops with retained error state for operator investigation. No automatic replay into another session, relabeling, or deletion occurs. Existing permanent errors need deliberate operator repair before `--flush`; it cannot skip a rejected head packet. Stop acquisition and drain the queue before pausing/finishing. Late unseen packets are intentionally rejected after closure; a successful finish does not claim that external queues were uploaded.

## Summary rules and limits

- Manual repetitions are stored independently. Sensor repetitions and ROM are null without valid hardware READ_OK angle samples. Simulation, missing, invalid and stale angles never contribute.
- A sensor repetition requires crossing the referenced prescription flexion target then returning to its extension target. Invalid observations, boot changes, missing sequence numbers and >1-second gaps reset the detector. This is a conservative software estimate, not a clinically validated algorithm.
- Measured duration sums only covered valid-angle intervals of at most one second within a boot and without sequence gaps. It excludes pauses/disconnect gaps. Quality remains degraded when usable data exists because calibration/coverage is not yet proven; no usable angles means incomplete. Abandoned sessions are always incomplete.
- Existing historical records are retained. This migration does not infer whether historical defaults were measured. Paused state is additive (`paused_at`) while status remains in_progress/completed/abandoned for existing consumers.

## Validation and remaining acceptance

- Full backend suite: 152 passed, including lifecycle, binding, cross-patient/role denial, immutable closure, duplicate conflicts, malformed packets, provenance, empty telemetry, and outbox restart/retry/acknowledgment/capacity/permanent failures. Uses disposable SQLite test databases, not the local patient database. PostgreSQL locking/concurrency is not runtime-verified.
- Django system check passed. Frontend TypeScript and focused lint passed.
- Production build passed after retrying outside the sandbox (the initial sandbox run failed with spawn EPERM). Browser interaction, real COM/BLE/network acquisition, firmware compilation, physical sensor calibration, and unplug/reconnect are not verified.
- Added telemetry migration; not applied to the existing local database. Run `python -B manage.py migrate` from backend after reviewing normal environment settings and backup procedure. Existing accounts/devices/exercises model-ordering migration drift is unrelated and remains open.
- Remaining: choose/connect a live firmware network or BLE producer, provision transport credentials/CA, implement calibrated angle production and readiness heartbeat, validate boot/timeline recovery on real hardware, and demonstrate patient start ? gateway samples ? disconnect/retry ? drain ? finish ? clinician review. The host bridge can be exercised with captured packets now, but does not meet physical Phase 6 acceptance by itself.
