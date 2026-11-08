# Phase 1: authentication, sessions and permissions

Date: 2026-11-08.

Status: implementation and automated checks complete. Manual browser checks below remain to be performed. Phase 2 has not been started.

## What changed

### Real sign-in and sign-out

- The login form sends the entered password. The returned server role determines the landing page; text in the email address does not determine permissions.
- Backend login requires a valid email/username and password. Missing passwords, incorrect credentials, inactive accounts and unsupported roles cannot establish a session.
- Removed passwordless account fallback, automatic URL-driven account switching, quick sandbox logins, and the navigation role switcher.
- Removed fabricated offline identities, cached-user authorization and blank-password reconnection. Legacy localStorage identity/role cookies are cleared instead of trusted.
- Login uses Django's HttpOnly session cookie. The previous synthetic `token` field was removed; no session credential is exposed to JavaScript.
- Login returns the actual session expiration and a new CSRF token. A failed logout is shown as a failure; the interface does not pretend the server session ended.
- Explicitly mapped backend roles: `ADMIN -> admin`, `CLINICIAN -> doctor`, `PATIENT -> patient`. Unsupported roles fail closed.

### CSRF and origins

- Restored DRF session CSRF checking through `BrowserSessionAuthentication`; removed the exempt implementation.
- Added public `GET /api/v1/auth/csrf/`. It issues a CSRF cookie and returns the masked token for the configured frontend.
- Anonymous login and logout are CSRF protected as well as authenticated writes.
- The fetch client obtains a token before its first unsafe request, includes credentials, and uses the rotated token after login. It shares simultaneous bootstrap requests.
- Development CORS no longer allows every origin. `CORS_ALLOWED_ORIGINS` defaults to localhost/127.0.0.1 on port 3000; `CSRF_TRUSTED_ORIGINS` defaults to those allowed origins and can be explicitly configured.
- Session cookies are HttpOnly and use `SameSite=Lax`. Production's existing secure-cookie settings remain in `production.py`; selecting production settings/deployment verification is still a later-phase task.
- Identity and CSRF responses use `Cache-Control: no-store`; frontend API requests also avoid caching.
- Protected API requests return `401` for missing/expired identity and `403` for a valid identity without the required permission. The client invalidates the displayed identity on protected API `401`.
- Fixed the HTTP error parser to read non-JSON responses once, retaining the actual HTTP status instead of failing while parsing the error.

### Frontend session and route guards

- Added one shared `AuthProvider` using `/auth/me/`, plus role-aware `RequireAuth` layouts for `/admin`, `/doctor`, `/patient` and `/reports`.
- Protected page components are not mounted while identity is unresolved, unavailable, unauthenticated or has the wrong role. Their data-fetch effects therefore cannot run before the guard allows them.
- Signed-out visitors go to `/login`; wrong-role users see Access denied with a link to their own workspace.
- A session-check network/server failure shows a retry state rather than a cached or invented user. Window focus rechecks the session without switching personas.
- `/` remains public and no longer signs visitors into a doctor account. Public pages show a sign-in link without an authenticated navigation sidebar.
- The printable report route is guarded. Missing/forbidden/failed report requests now show Report unavailable rather than generating a fabricated patient report.

### Backend ownership and write permissions

| Identity | Permitted scope in Phase 1 |
|---|---|
| Patient | Own patient record, plans/sessions, assigned device and its technical alerts; own-session creation and permitted manual/status updates. |
| Clinician | Actively assigned patients and their clinical records/devices/alerts; assigned-patient plan authoring/publishing and session review. |
| Administrator | Patient-directory identity metadata, device administration and audit log; clinical plans/sessions/raw telemetry are denied. |
| Hardware credential | Telemetry ingestion for the same authenticated device and a recording session belonging to its actively assigned patient. Other browser APIs reject the hardware token. |
| Visitor | Public views, login/CSRF bootstrap and currently public health/schema routes; protected records require authentication. |

- The administrator policy follows the existing project statement that technical administration does not grant clinical-record access. Admin patient-directory responses omit nested diagnoses, surgical profiles and assigned-clinician details.
- Device and alert list/detail requests are scoped by active assignments. Non-admin device registration/update/deletion/revocation is denied.
- A device with session/telemetry history cannot be deleted through the device API; revocation is available instead, preserving clinical history.
- Browser `ping` reports server reachability and the stored last-seen value. It no longer refreshes the device heartbeat.
- `my-plan` validates clinician assignment, rejects cross-patient parameters and malformed patient UUIDs, and does not substitute a draft for an active published plan.
- Plan creation validates the submitted patient is an assigned patient. Ordinary plan updates cannot change owner, author, version or publication metadata. Published/archived plans cannot be edited or deleted through these API actions; archived plans cannot be republished.
- Patient requests cannot write clinician-review fields, measured ROM, sensor-estimated reps or plan ownership/version fields. Protected/unsupported fields are explicitly rejected rather than silently accepted.
- Session deletion is not exposed. Review is restricted to the assigned clinician's review action.
- Device registration validates optional patient assignment before creating a device.

### Device ingestion fixes brought forward

S01/S02 were moved forward from Phase 6 because their authorization flaws would leave Phase 1 incomplete:

- Ingestion accepts device bearer authentication only, not a browser login cookie.
- The payload's device identifier must equal the authenticated device and the device must be active.
- The session must already exist, reference that device, belong to its currently assigned active patient and be in progress. Unknown devices/sessions are not auto-created.
- Expired/revoked credentials are rejected. Authenticating a rejected upload does not refresh its heartbeat; accepted ingestion does.
- Duplicate-batch protection remains. An existing batch identifier cannot be claimed by a different session.

## Files and implementation areas

Frontend:

- `components/auth/AuthProvider.tsx`, `RequireAuth.tsx` (new).
- `app/admin/layout.tsx`, `app/doctor/layout.tsx`, `app/patient/layout.tsx`, `app/reports/layout.tsx` (new), and root `app/layout.tsx`.
- `app/login/page.tsx`, `components/ui/AppShell.tsx`, `components/ui/Navigation.tsx`.
- `app/reports/session/[id]/page.tsx` for unavailable/error handling.
- `lib/services/auth-contract.ts` (new), auth service, API client, auth API methods and role mapping; `lib/types/index.ts` session type.
- `package.json`: added `typecheck` and `test:auth` scripts.
- `tests/auth.test.mjs` (new).

Backend:

- Accounts authentication, views, serializers, permissions and scoping mixin.
- Device authentication, views, create validation and scoped alert access.
- Exercise plan views and serializers.
- Telemetry views and serializers.
- Base/development settings and the CSRF route in `config/urls.py`.
- `tests/conftest.py` and `tests/test_phase1_security.py` (new); existing tests adapted for the real CSRF/session response and assigned recording-session ingestion.

No model fields were changed in this phase. No migration, seed command or credential reset was run on the existing database. Existing uncommitted work was retained.

## Automated verification

| Check | Result |
|---|---|
| Backend test suite | **67 passed**: original flows plus security regressions. |
| Frontend authentication/guard tests | **15 passed**: real password payload, CSRF bootstrap/rotation, cookies, failed login/outage/logout, role mapping, expired identity, and protected-child mounting. |
| TypeScript | **Passed** with `npm.cmd run typecheck`. |
| Production build | **Passed** with `npm.cmd run build`. |
| Lint of Phase 1 auth/client/guard/report files and new frontend tests | **Passed**. |
| Full-project ESLint | **47 errors remain** in existing page effect patterns, `api.ts` general DTO typing, `DataTable` and `Skeleton`. The review baseline had 55. Broad cleanup belongs to later integration/verification work. |
| Django system check | **Passed**, no issues. |
| Migration consistency | The same three pre-existing ordering-option migrations remain pending: accounts User, devices Device, exercises ExerciseDefinition. No new migration requirement was introduced by this phase. |
| Real browser interaction, physical device, gateway and deployment | **Not verified** by these automated checks. |

The backend tests use an isolated in-memory database. Frontend tests use mocked HTTP responses and server-rendered route guards; they do not replace the browser tests below.

In this Windows sandbox, Next.js workers and Node's process-isolated test runner initially failed with `spawn EPERM`. The production build and initial auth test run succeeded with approved execution outside the sandbox. The expanded 15-test suite also passed directly in one Node process with `node tests/auth.test.mjs`.

## How to run locally

Use two laptop PowerShell terminals. The examples consistently use `localhost` for both frontend and backend. Avoid mixing a `127.0.0.1` frontend with a `localhost` API; cross-site cookie restrictions can prevent that configuration from establishing a session.

Terminal 1 — backend:

```powershell
Set-Location 'D:\clone\pyqt\e22-3yp-project-OrthoSense\backend'
python -B manage.py runserver localhost:8000
```

Terminal 2 — frontend:

```powershell
Set-Location 'D:\clone\pyqt\e22-3yp-project-OrthoSense'
$env:NEXT_PUBLIC_API_URL = 'http://localhost:8000/api/v1'
npm.cmd run dev
```

Open `http://localhost:3000/login`. Use your existing account credentials. The sandbox persona buttons are intentionally removed. Do not rerun the demo seed command merely to test this phase: that command resets demo-account passwords and is unnecessary for these changes.

For LAN testing, set the actual frontend origin in the backend terminal before startup and point the frontend at the actual backend host before starting Next.js:

```powershell
# Replace these placeholders with the real host and frontend port.
$env:CORS_ALLOWED_ORIGINS = 'http://<your-laptop-host>:3000'
$env:CSRF_TRUSTED_ORIGINS = $env:CORS_ALLOWED_ORIGINS
```

`NEXT_PUBLIC_API_URL` in the frontend terminal must similarly be `http://<your-laptop-host>:8000/api/v1`. Restart both servers after changing their environment.

## Manual test checklist

Use separate browser profiles/private sessions for different accounts. Do not judge Phase 1 by the currently static patient-dashboard content; that is scheduled for Phase 4.

| # | What to do | Expected result |
|---|---|---|
| 1 | In a signed-out private window, open `/doctor/dashboard`, `/patient/sessions`, `/admin/devices`, and a report URL directly. | Redirect to login; no protected page content or patient API fetch starts before identity resolution. |
| 2 | Attempt login with an unknown account or an incorrect password; try a blank password. | Login fails. Blank password is rejected by the form/backend. No sidebar/demo persona appears. |
| 3 | Log in with a real clinician account. | Redirect to `/doctor/dashboard`; sidebar shows that clinician and clinician navigation. API role `CLINICIAN` correctly becomes the doctor workspace. |
| 4 | Navigate through several clinician pages and refresh. | The same account remains signed in; URL navigation does not issue another login or change identity. |
| 5 | As a patient, open `/admin/users` and `/doctor/dashboard`; as admin, open a doctor/patient workspace or report URL. | Access denied; identity remains unchanged. Use the return link to reach the account's own workspace. |
| 6 | Inspect Network during login and a permitted write. | `GET auth/csrf/` precedes the first write, login includes the entered password and CSRF header, subsequent writes use the rotated token and session cookie. No synthetic bearer session token is used. |
| 7 | Replay an unsafe session-authenticated request in an API client with its CSRF header removed. Also try an untrusted Origin. | `403`; the intended change is not saved. Keep cookies/token handling enabled for legitimate writes. |
| 8 | Log out, then use Back and refresh a protected URL. | Return to login; `/auth/me/` returns `401`. A previous localStorage user or role cookie cannot restore the session. |
| 9 | Stop the backend and open/refresh a protected route or attempt login. Restart and use Retry. | Session-check error or login error; no fabricated offline login. Successful retry restores only the actual server session. |
| 10 | Log in as patient A; request patient B's detail, session, telemetry, device and alert URLs using known test IDs. Repeat as an unassigned clinician. | `404`/denied; lists contain only the current user's permitted scope. An assigned clinician's legitimate access still works. |
| 11 | As admin, inspect `/patients/`, then request `/plans/`, `/sessions/` and a session telemetry URL. | Patient directory returns identity metadata without `patient_profile`; clinical routes return `403`. Device registry/audit reads still work. |
| 12 | As patient, attempt a session PATCH containing `doctor_reviewed`, `doctor_review_notes`, `max_flexion_deg`, `sensor_estimated_reps` or `plan_version`; attempt a plan create/publish. | Protected session fields return `400`; plan writes return `403`; no protected value changes. |
| 13 | As the assigned clinician, read an assigned session and submit a review using the dedicated review endpoint/UI. | Review succeeds. The same operation by an unrelated clinician or patient is denied. |
| 14 | Call device `ping`, then inspect `last_seen_at`. | Server reachability response; device last-seen does not advance. This is not a physical-device diagnostic. |
| 15 | In a disposable test setup, upload with device A's token using device B's ID or session. Try an unknown session, revoked token or browser session without a device token. | Rejected, with no device/session auto-registration or saved batch. A valid assigned in-progress session accepts the matching device token and deduplicates a retry. |
| 16 | Open a missing or inaccessible report. | Report unavailable/access-denied/login state, with no invented patient, review or printable fallback record. |

The existing test suite creates two clinicians/two patients and exercises the ownership cases automatically. Those fixture accounts exist only in the test database; they are not created in your running project database.

## Commands to repeat the automated checks

From the project root:

```powershell
npm.cmd run typecheck
npm.cmd run test:auth
npm.cmd run build
```

If the Node test runner cannot spawn workers in a restricted environment, its single-process equivalent is:

```powershell
node tests/auth.test.mjs
```

From `backend`:

```powershell
python -B -m pytest -q -p no:cacheprovider
python -B manage.py check --settings=config.settings.testing
```

## Known limits and next work

- Phase 2 must complete general DTOs, pagination, measurement/status mapping and normal page error handling.
- The recorder still sends the old camelCase body and includes protected sensor-derived fields. Phase 1 now rejects these fields; correct request mapping and recording lifecycle remain to be implemented. Its existing catch-path success message is also scheduled for correction. Do not treat the current recorder confirmation as proof of a saved session.
- The plan editor still needs persisted draft/item saving before publishing (Phase 3).
- Patient dashboard/profile/exercise/device views still contain fixed values and simulated diagnostics (Phases 4/5).
- Creating new sessions still uses existing model defaults for unmeasured metrics; changing measurement nullability/provenance is pending. Read-only permissions do not establish sensor accuracy.
- Historical telemetry retrieval still generates demo data for empty sessions (Phase 7); the report fallback on fetch failure was removed now, but static report targets/clinician labels still require actual-data integration.
- The admin user screen still uses the patient metadata endpoint and local-only invites/toggles. The complete all-role user-management API/UI is Phase 8.
- The “remember session” checkbox and password-recovery link still need their later-phase behavior. They do not change this phase's session configuration.
- Three existing model-ordering migrations and 47 full-project lint errors remain, as recorded above.
- Firmware BLE/HTTPS transport, real diagnostic acknowledgments and deployment/physical verification remain future work.

Next implementation phase: Phase 2 — API contracts and request handling. Use this checklist to report any Phase 1 login, permission or cookie failures before testing later data workflows.
