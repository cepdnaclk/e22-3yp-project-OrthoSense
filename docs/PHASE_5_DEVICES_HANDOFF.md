# Phase 5: device software integration

Software implementation is ready for hardware integration. Firmware, BLE/HTTPS transport and physical validation are the hardware integrator's responsibility.

## Required database update

A migration adds Device.health_report and removes previously stored plaintext token display copies without changing credential verification hashes. It has NOT been applied to your existing project database during this work. Run before using the new backend:

```cmd
cd /d D:\clone\pyqt\e22-3yp-project-OrthoSense\backend
python -B manage.py migrate devices
python -B manage.py runserver localhost:8085
```

This migration does not reset accounts/passwords or invalidate existing hardware tokens. Old raw token values cannot be retrieved afterward; rotate credentials if a replacement is needed. Back up your database through your normal workflow before schema changes.

## Completed software

- Administrator device registry supports explicit patient assignment/unassignment and credential rotation, alongside existing register/revoke actions.
- Assignment API rejects conflicting active relationships with 409; an existing relationship must be explicitly unassigned before reassignment. Operations are transactional and audited. Django's clinician-assignment administration remains available for doctor/patient links.
- Provisioning returns a one-time token; plaintext is not saved. Rotation returns a new one-time token, invalidates the previous hash, clears old health evidence, and reactivates enrollment. Revocation rejects authentication.
- New registrations no longer create six fictional healthy sensor channels. Hardware describes the channels it actually supports.
- POST /api/v1/devices/heartbeat/ accepts device bearer authentication only, validates identity/status and payload, and persists a current health snapshot plus server receive time.
- ACTIVE enrollment is independent of connectivity. Last authenticated device contact within 90 seconds yields online; older contact yields offline; never-seen yields unknown. Revoked/maintenance/unpaired states remain explicit. API browser ping does not update last_seen_at.
- Battery values are reported values or null; old model defaults are not substituted. Each heartbeat is a complete snapshot, so omitted battery/channels become unavailable rather than previous healthy evidence.
- Sensor snapshot age is checked independently from general last_seen_at. A later telemetry packet cannot make an old sensor-health report fresh.
- Fault states DEGRADED/STALE/RAIL/INVALID create an unresolved technical alert without duplicating an already open identical code. Scoped administrators/clinicians can resolve alerts through POST /api/v1/alerts/{uuid}/resolve/.
- Patient device page uses the signed-in patient's assigned UUID, polls every 15 seconds, shows report freshness and recorded alerts, and removes fixed readings/timed diagnostics/simulated sensor waves.
- Recorder device selection also uses assigned UUID. Removed fixed fallback hardware and timed preflight success. It waits for online assigned hardware, reported battery and both IMU health states. This is report-based readiness, not proof of calibration or a diagnostic acknowledgment.

## Hardware heartbeat contract

Send JSON to http://<backend-host>:8085/api/v1/devices/heartbeat/ with Content-Type: application/json and Authorization: DeviceBearer <one-time-provisioned-token>. Never put user names or clinical history in the payload. device_id is the registered device_identifier string, not its database UUID.

Example schema (replace identifiers and values with the real device's current report):

```json
{
  "device_id": "YOUR_REGISTERED_IDENTIFIER",
  "firmware_version": "YOUR_ACTUAL_FIRMWARE_VERSION",
  "battery_percent": 63,
  "battery_voltage": 3.8,
  "channels": [
    {"channel_index": 0, "sensor_type": "IMU_THIGH", "label": "Thigh IMU", "unit": "deg", "sampling_rate_hz": 50, "health_status": "HEALTHY"},
    {"channel_index": 1, "sensor_type": "IMU_SHANK", "label": "Shank IMU", "unit": "deg", "sampling_rate_hz": 50, "health_status": "UNVERIFIED"}
  ]
}
```

Allowed sensor_type: IMU_THIGH, IMU_SHANK, FSR_INSOLE, SEMG, NTC_TEMP. Include only physically implemented channels. Allowed health_status: HEALTHY, DEGRADED, STALE, RAIL, INVALID, UNVERIFIED. Channel indexes must be unique. Battery percent is 0..100 or null; voltage is nonnegative or null. Unknown/unmeasured values must be omitted/null and analog channel health must remain UNVERIFIED unless actually validated. Sampling rates are device-supplied, not assumed by the website.

A successful heartbeat returns status=accepted and server_received_at. An identifier mismatch or inactive enrollment is rejected; invalid/revoked/expired tokens fail authentication. No browser JWT can substitute for a hardware credential. Send periodically at an interval safely below the 90-second timeout. Use the backend host/IP reachable by the device, not the device's own localhost.

General connectivity measures server contact. It does not establish BLE RSSI, calibration, sensor accuracy or physical hardware diagnostic success. Existing telemetry ingestion remains a separate endpoint requiring a valid assigned in-progress session.

## Integration actions

- POST devices/{uuid}/assign/ with {"patient_id":"PATIENT_UUID"}, or null to unassign.
- POST devices/{uuid}/rotate/ returns hardwareBearerToken once; old token immediately fails.
- POST devices/{uuid}/revoke/ rejects subsequent hardware authentication.
- GET devices/ and devices/{uuid}/ provide scoped enrollment/connectivity/battery/channel metadata.
- POST devices/{uuid}/ping/ checks backend reachability only.
- GET alerts/ provides scoped alerts; POST alerts/{uuid}/resolve/ requires admin/assigned clinician.

Browser actions use JWT cookies plus CSRF. Hardware heartbeat uses the device token. No new credentials are hardcoded in the firmware or source.

## Validation and manual tests

Automated checks: 134 backend tests passed, 19 frontend tests passed, TypeScript passed, changed device-page/API lint passed, and production build passed before the final recorder-preflight adjustment (that adjustment was typechecked). Existing data was not migrated/seeded/reset. Tests use disposable migrated databases.

Manual acceptance:
1. Apply the migration and restart backend/frontend.
2. Register a new device as portal admin. Save the one-time token securely; GET must not reveal it or fabricate battery/channels.
3. Assign an actual patient. Attempt a conflicting assignment: expect 409. Explicitly unassign then assign again.
4. Login as that patient: only their assigned device should appear; no heartbeat means unknown/unverified.
5. From your hardware integration, send the correct heartbeat. Confirm connectivity, reported battery and actual channels.
6. Stop heartbeats/contact for more than 90 seconds: polling should display offline; sensor report must not remain healthy.
7. Omit battery/channels from the next report: confirm unavailable states. Test DEGRADED/RAIL to verify alerts.
8. Rotate credentials and confirm the old token fails while the new one works. Revoke and confirm rejection.
9. Test a device ID mismatch, invalid battery percent and duplicate channel indexes: all must be rejected without changing health data.
10. Open/refresh/ping the web page without sending hardware traffic: no device heartbeat should advance.
11. Confirm recorder no longer automatically passes preflight after a timer. No fresh dual-IMU/battery report means not ready.

Remaining: firmware uploads, physical calibration, real diagnostics/command acknowledgments and device-side settings are not implemented or verified here. Recorder sensor movement/repetition logic remains Phase 6. Model defaults/old data elsewhere do not establish measured hardware behavior.
