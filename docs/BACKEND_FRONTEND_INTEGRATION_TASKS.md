# OrthoSense backend/frontend integration review

Reviewed: 2026-11-08. This report describes the current working tree, including existing uncommitted changes.

Implementation progress: Phase 1 and Phase 2 transport work are implemented and automatically checked. See [Phase 2 handoff](PHASE_2_PROGRESS.md) for scope and follow-up work. See [Phase 1 summary and manual test guide](PHASE_1_AUTH_PERMISSIONS_HANDOFF.md). The review findings/status tables below preserve the pre-implementation audit; checked tasks record subsequent work.

## Summary

The repository has a substantial Next.js interface and a Django REST Framework backend. Many directory and detail screens already call the API. Integration remains incomplete: authentication uses unrestricted demo behavior, some writes do not persist the displayed values, patient/dashboard/device views contain fixed data, and the firmware has no implemented network upload path.

The next milestone should be one trustworthy workflow: authenticated clinician creates and publishes a persisted plan; its assigned patient sees it, records a session against the assigned device, and submits it; the clinician reviews that same saved session and prints its actual data.

Do not use page appearance, a successful HTTP response, or the current passing tests as evidence that this workflow is complete.

## Review scope

- Frontend: all 21 `app/**/page.tsx` routes, shared shell/navigation/UI/chart code, frontend types, API services, mock-data definitions, and configuration.
- Backend: accounts, devices, exercises, telemetry, analytics, models, serializers, views, authentication/permissions, migrations, seed command, existing tests, settings, Docker configuration, and backup script.
- Edge: `sketch.ino`, `health.h`, Wokwi wiring and library definitions.
- Text documentation: root README, project-site README, route/permission plan, and phase handoff. Embedded PDF/DOCX documents and image assets were inventoried; they were not visually reviewed or used as runtime implementation evidence.
- Generated dependencies, caches, compiled Python, and the contents of the existing SQLite database were not treated as authoritative implementation documentation.

No application implementation was changed during this review. The temporary API checks used an in-memory test database; the existing project database was not migrated or seeded.

## What is already implemented

Checked items mean source exists; runtime verification is stated separately below.

- [x] Next.js App Router, strict TypeScript configuration, Tailwind styling, and 21 page routes.
- [x] Patient, doctor, and administrator navigation and workspaces.
- [x] Shared buttons, cards, inputs, dialogs, data tables, status badges, and loading skeletons.
- [x] Telemetry chart/table component with channel selection and CSV export in the doctor session viewer.
- [x] Central fetch client with credentials, JSON requests, error wrapper, and a CSRF-header lookup.
- [x] Frontend services for authentication, patients, plans, exercise catalog, sessions/reviews/telemetry, devices, alerts, audit log, and health.
- [x] Django accounts, patient/clinician profiles, clinician assignments, and audit-event models.
- [x] Django device registry, patient assignments, credentials, sensor channels, and technical-alert models.
- [x] Exercise definitions, plan versions, prescriptions, and publish/archive logic.
- [x] Session records, clinician review records, telemetry batches, and database uniqueness for batch deduplication.
- [x] Session-cookie login/logout/current-user endpoints; their demo bypasses still require replacement.
- [x] Patient/plan/session queryset scoping for several list/detail routes; coverage is incomplete for other endpoints and writes.
- [x] Device registration/token issuance and administrator-only credential revocation actions.
- [x] Device bearer-token validation with revoked/expired credential checks.
- [x] Telemetry ingestion endpoint, retrieval, and LTTB downsampling implementation.
- [x] Session-summary helper exists; it is not connected to ingestion or session completion.
- [x] Database health endpoint, OpenAPI schema endpoint, and Swagger UI wiring.
- [x] Initial migrations, a demo seed command, Docker/PostgreSQL/Redis service definitions, and a local SQLite-copy backup utility.
- [x] Eleven backend tests covering selected successful flows, selected patient scoping, published-plan update rejection, telemetry deduplication, invalid tokens, review, and schema availability.
- [x] ESP32-S3 simulation firmware for two MPU6050s, a simulated FSR analog input, NTC temperature, OLED output, and sensor-quality/freshness handling.

## Current page integration status

“Partial” means API calls exist but do not establish a complete, reliable workflow.

| Route | Current behavior | Remaining integration |
|---|---|---|
| `/` | Workspace gateway with shared shell | Restore public-page behavior or explicitly require login; remove claims of guarantees the API does not enforce. |
| `/login` | Calls login service | Send entered password, use returned role, remove unrestricted sandbox sign-in and fabricated offline identity. |
| `/design-system` | Component showcase | No domain backend required; define exposure outside development. |
| `/doctor/dashboard` | Partial: patients, sessions, devices fetched | Correct scope, pagination, time-window metrics, device connectivity, and error presentation. |
| `/doctor/patients` | Partial: patient list fetched | Server search/filter/pagination and real account/protocol state. |
| `/doctor/patients/[id]` | Partial: patient, plan, sessions fetched | Session request currently fetches the cohort and displays it without filtering to this patient; replace fixed clinical/device/compliance values. |
| `/doctor/patients/[id]/plan` | Partial: loads plan/catalog and calls publish | Create/save draft and prescriptions; persist edits before publishing; create a new version when revising. |
| `/doctor/exercises` | Catalog reads connected | Add create/edit/archive UI if catalog management is in scope; backend write routes already exist. |
| `/doctor/sessions/[id]` | Session, telemetry, review API calls exist | Real telemetry provenance, authoritative saved review refresh, errors, and honest CSV labeling. |
| `/doctor/reports` | Patient list fetched | Trend metrics are fixed; print link passes patient ID to a session-ID route. |
| `/patient/dashboard` | Fixed patient, plan, progress, charts, health | Connect current profile, published plan, actual history, assigned device, and calculated progress. |
| `/patient/exercises` | Local exercise/telemetry array and simulated video UI | Load prescribed items and actual media; pass selected prescription into recorder. |
| `/patient/session/record` | Partial device fetch and final session POST | Assigned device, real preflight/samples, correct write payload, session lifecycle, and failure handling. |
| `/patient/sessions` | Session history fetched | Pagination, meaningful error state, correct saved metrics and optional feedback detail. |
| `/patient/device` | Partial: first registry device fetched | Resolve own device, map actual sensor channels; diagnostics and readings currently use fixed data/timers. |
| `/patient/profile` | Local state and timed success message | Current-user/profile read and persisted update endpoints, field permissions, and preferences storage. |
| `/admin/users` | Uses patient endpoint; invites/toggles local only | All-role administrative directory and persisted invitations, activation, role/assignment management. |
| `/admin/devices` | Register/list/revoke calls exist | Status normalization, assignment/reassignment, token lifecycle, and confirmed state refresh. |
| `/admin/audit-log` | Audit endpoint fetched | Pagination, server filters, complete actor-role mapping and action coverage. |
| `/admin/health` | Entirely fixed infrastructure numbers | Connect health service and measured infrastructure/fleet data. |
| `/reports/session/[id]` | Session fetch and browser print | Remove fabricated fallback, authorize access, use actual author/review/targets, and correct source links. |

## Existing endpoint inventory

All paths below are relative to `/api/v1/`, except the schema/docs paths.

| Area | Implemented routes | Needed work |
|---|---|---|
| Identity | `POST auth/login/`, `POST auth/logout/`, `GET auth/me/` | Real credential enforcement, session lifecycle, CSRF, typed profile response, profile updates and recovery. |
| Patients | `GET patients/`, `GET patients/{id}/` | Filters/pagination; separate admin metadata directory from clinical access. |
| Plans | Router CRUD `plans/`, `plans/{id}/`; `POST plans/{id}/publish/`; `GET my-plan/` | Restrict writers, enforce assignment, persist nested draft items, return IDs, separate draft/active-plan retrieval, immutable versions. |
| Exercises | Router CRUD `exercises/`, `exercises/{id}/` | Typed writes, media fields and lifecycle UI as needed. |
| Sessions | Router CRUD `sessions/`, `sessions/{id}/`; `POST sessions/{id}/review/`; `GET sessions/{id}/telemetry/` | Restrict writable fields/actions, filter by patient, start/finish lifecycle and full canonical responses. |
| Devices | Router CRUD `devices/`, `devices/{id}/`; `POST devices/{id}/revoke/`; `POST devices/{id}/ping/` | Scope every action, real heartbeat/diagnostics, assignment lifecycle and credential rotation. |
| Alerts | `GET alerts/`, `GET alerts/{id}/` | Scope, detection pipeline, acknowledgment/resolution writes if required. |
| Hardware | `POST telemetry/ingest/` | Bind authenticated device and assigned session, validate quality/units, integrate gateway/firmware. |
| Audit | `GET audit-log/`, `GET audit-log/{id}/` | Filters/pagination and coverage of remaining mutations. |
| Health | `GET health/` | Currently checks database; pipeline “active” is fixed. Add measured dependency/fleet status. |
| API docs | `/api/schema/`, `/api/docs/` | Complete/authentication-aware schema and contract checks. |

Proposed user-management, profile-update, assignment, diagnostic, and aggregate endpoints in the tasks below are additions, not existing routes.

## Confirmed blockers and evidence

### Authentication and authorization

1. `app/login/page.tsx:40` omits the password when calling the auth service. `backend/apps/accounts/views.py:61` validates passwords only when a password is supplied; its fallback can choose an account for an unknown login.
2. `components/ui/AppShell.tsx:22` signs in a different predefined account based on the URL on navigation. `lib/services/auth-service.ts` fabricates an authenticated user after any login error and also attempts passwordless reconnection from cached identity.
3. Backend `CLINICIAN` is lowercased into `clinician`, while frontend `UserRole`/navigation expect `doctor`. A type assertion does not translate the role.
4. `backend/apps/accounts/authentication.py` disables session CSRF enforcement. Production settings inherit that authentication class.
5. `MyPlanView` does not check clinician assignment for `patient_id`, and returns a draft when no published plan exists.
6. Devices and technical alerts use global authenticated querysets. Generic device update/delete actions lack administrator-only restrictions. Patient/plan/session object checks do not supply sufficient create/field-level write restrictions.
7. Ingestion resolves the device from the body before enforcing equality with the authenticated device. It also accepts session users and can auto-register devices/auto-create sessions without a strict assignment check.

The following were reproduced using isolated in-memory data and Django APIClient:

| Check | Observed response/result | Required result |
|---|---|---|
| Existing admin email with blank password | `200` login | Reject. |
| Unknown email with an incorrect password | `200`, clinician selected by fallback | Reject. |
| Clinician reads unassigned patient's `my-plan` | `200` | Deny. |
| Patient lists device registry | Both patients' devices returned | Return own allowed metadata only. |
| Patient patches another patient's device | `200` | Deny. |
| Patient changes own `doctor_reviewed`/notes through session PATCH | `200` | Deny these fields. |
| Patient creates a plan for another patient | `201` | Deny. |
| Device A token submits device B/session B identifiers | `201`, batch stored against device B | Deny identity mismatch. |

### Persistence and data correctness

- The recorder sends camelCase session fields directly through `sessionsApi.create`, while Django expects snake_case. An isolated POST with intended 3 reported reps and 42 seconds returned `201` but saved the defaults: 10 reps and 0 seconds. The create response also omitted the session ID.
- The plan create response uses the input serializer and omits the new plan ID. The editor does not call `plansApi.create` or a draft-update service; publish can therefore publish old saved content, or show success with no plan ID.
- Session create/reads and plan writes need separate typed request/response adapters. Current `Promise<ExerciseSession>` declarations do not transform the server response.
- Device `ACTIVE` means enrollment state; lowercasing produces `active`, outside the frontend connectivity union. `REVOKED` similarly produces an unsupported state. Missing `last_seen_at` is replaced with `created_at`; every sensor is assigned `healthy` in the adapter.
- Backend telemetry retrieval fabricates a wave when no batches exist and supplies fixed fallback measurements/`READ_OK` flags when fields are missing. A raw acceleration component is also converted into an angle using a placeholder formula.
- Recorder submission failure still sets `finishSuccess`; profile save, sensor diagnostics and preflight success use timers.
- Doctor report links use patient UUIDs for session reports; the report fabricates reviewed patient data when the fetch fails and displays fixed approval/goal messages.
- All `getAll` adapters discard `next`/`previous` and use only the first server page (default page size 20). Cohort totals and trends are consequently incomplete when more data exists.
- Firmware emits local serial debug JSON explicitly labeled as simulation. It has no BLE/Wi-Fi/HTTPS upload implementation. Its field names, channel count, sampling rates and health vocabulary differ from API/UI assumptions; the implemented simulation has no sEMG channel.

## Integration task list

Priority: **P0** = required before real authenticated data workflows; **P1** = complete the core integration; **P2** = later feature/deployment work. Owners describe implementation areas, not assigned team members.

### Phase 1 — Identity, session handling and permissions (P0)

Primary files: `app/login/page.tsx`, `components/ui/AppShell.tsx`, `components/ui/Navigation.tsx`, `lib/services/auth-service.ts`, `backend/apps/accounts/`, and all API viewsets.

- [x] A01 [Frontend] Pass the entered password; choose the landing page from the authenticated user's normalized role.
- [x] A02 [Backend] Require valid credentials; remove passwordless account lookup/fallback from normal login. Keep any demo mode explicitly isolated and disabled outside demonstration environments.
- [x] A03 [Frontend] Replace URL-driven `switchUser` with a shared current-session provider using `/auth/me/`; wait for session resolution before protected data requests.
- [x] A04 [Frontend] Remove fabricated login success, cached-user authorization, automatic blank-password login, and unrestricted role switcher behavior.
- [x] A05 [Both] Map `ADMIN -> admin`, `CLINICIAN -> doctor`, `PATIENT -> patient` in one explicit adapter. Treat unknown roles as an error.
- [x] A06 [Both] Restore CSRF protection and establish a working CSRF-cookie bootstrap/header flow for unsafe requests; configure exact allowed frontend origins and deployment cookies.
- [x] A07 [Frontend] Add route guards and distinct unauthenticated/forbidden states, including printable reports; clear identity on invalid/expired sessions.
- [x] A08 [Backend] Define and enforce allowed actions by role: clinician-only assigned-patient plan authoring/review, patient-only own-session recording, admin-only hardware/user management.
- [x] A09 [Backend] Scope devices and alerts by active patient/clinician assignments; enforce scope on retrieve, update, delete, ping and custom actions.
- [x] A10 [Backend] Apply assignment checks to `my-plan/?patient_id=...` and submitted patient/device/plan IDs during creation; queryset filtering alone does not protect creates.
- [x] A11 [Backend] Make patient identity, clinician review fields, device-derived metrics and protected plan metadata read-only in ordinary patient writes.
- [x] A12 [Both] Resolve the admin-access policy mismatch: the landing page promises no clinical access while the scoping mixin currently grants admins all clinical rows. Enforce the agreed metadata/clinical separation and cover it with tests.

Phase acceptance: failed/blank credentials never create a session; URL changes cannot change identity; unrelated users/devices cannot read or mutate each other's data; legitimate assigned flows still work.

### Phase 2 — API contracts and request handling (P0)

Primary files: `lib/types/index.ts`, `lib/services/api.ts`, `lib/services/api-client.ts`, backend serializers, `backend/config/urls.py`.

- [ ] C01 [Both] Document request/response DTOs for each existing endpoint, including nullability, enums, UUIDs, date/time units, paging and validation errors; make OpenAPI reflect actual behavior.
- [ ] C02 [Frontend] Replace transport `any` casts with API DTOs and reusable domain mappers; preserve nested `patient_profile`, assigned doctor/device UUIDs, exercise media, and review-author fields.
- [x] C03 [Both] Implement explicit session write mapping (`patientReportedReps -> patient_reported_reps`, etc.) and return a full canonical session including ID after creation.
- [x] C04 [Both] Return full plan detail including ID/version/items after creation/update; map snake_case write fields and canonical read responses.
- [x] C05 [Both] Separate device provisioning state from connectivity/freshness. Represent revoked, offline, unknown, never-seen and missing-battery states explicitly.
- [x] C06 [Frontend] Map `sensor_channels` into health rows using real sensor type/index; preserve `invalid`, `rail`, `stale`, `unverified` and unavailable states end to end.
- [ ] C07 [Both] Support page parameters, counts, filters, sorting and search. Add scoped aggregate results when totals cannot be computed from one page.
- [ ] C08 [Frontend] Standardize loading, empty, stale, offline, validation, forbidden and server-error UI; stop converting failed requests into empty success data.
- [x] C09 [Frontend] Fix non-JSON error parsing so a failed JSON parse does not try to reread an already consumed response body; add cancellation and controlled retry behavior where appropriate.
- [ ] C10 [Both] Remove fabricated diagnosis, plan-version, device, health and measurement defaults from operational responses; use null/unknown/empty states and clearly isolated demo fixtures.
- [x] C11 [Both] Add frontend/backend environment examples with placeholder configuration and documented local origin/API URL settings. Do not assume a remote browser can reach the backend through `localhost`.

Phase acceptance: submitted values survive a POST/GET round trip exactly, created resources return usable IDs, and records beyond the first 20 are accessible.

### Phase 3 — Plans and clinician prescription workflow (P1)

Primary files: `app/doctor/patients/[id]/plan/page.tsx`, plan services, `backend/apps/exercises/`.

- [x] P01 [Backend] Implement validated nested prescription writes for drafts, including add/edit/remove/order; current normal plan serializer exposes prescriptions read-only.
- [x] P02 [Frontend] Implement Save Draft using create/update services; persist clinical notes, sets, reps, ROM targets, rest intervals and instructions.
- [x] P03 [Both] Implement revision as a new draft with a new version/ID; retain the published prescription and session references.
- [x] P04 [Frontend] Publish only a successfully saved server draft; require an ID, handle dirty edits and reflect the canonical publish response.
- [x] P05 [Backend] Validate patient role/assignment, exercise existence, nonempty items and numeric limits before writes; make multi-item creation and publish/archive/version allocation transactional.
- [x] P06 [Backend] Enforce immutable published/archived content across PATCH, PUT, DELETE, prescription modifications and status/version changes; make the publish transition explicit.
- [x] P07 [Both] Separate patient active-published-plan lookup from clinician draft/history lookup; return a truthful no-active-plan state instead of a draft fallback.
- [x] P08 [Frontend] Reload the patient-visible plan after successful publication; expose saved version/date/author accurately.

Phase acceptance: edit/save/reload preserves all items; publishing exposes exactly those saved values to the assigned patient; revising leaves the prior version intact.

### Phase 4 — Patient profile, dashboard and exercise screens (P1)

Primary files: `app/patient/dashboard/page.tsx`, `app/patient/exercises/page.tsx`, `app/patient/profile/page.tsx`, accounts serializers/views.

- [x] U01 [Both] Expose and map own demographic/profile data and clinician/device assignments; add a restricted update endpoint for editable personal/emergency-contact fields.
- [ ] U02 [Both] Persist supported preferences. Add fields/endpoints for phone, address, emergency relationship and notification choices only when retained in the product; the current model does not store every displayed field.
- [x] U03 [Frontend] Replace profile timers with real update requests, validation errors and confirmed success; keep diagnosis, recovery protocol and prescribed limits under clinician control.
- [x] U04 [Frontend] Bind dashboard greeting, recovery week, clinician, published-plan metadata and prescribed exercise cards to the current user's data.
- [ ] U05 [Both] Define and calculate daily completion, streak, adherence and ROM trends using actual prescriptions, dates/timezone and completed sessions; add scoped aggregate APIs as needed.
- [x] U06 [Frontend] Replace all fixed dashboard chart paths/values with actual results and unavailable/insufficient-data states.
- [x] U07 [Frontend] Load patient exercises from the published plan with real instructions/sets/reps/limits; carry the selected prescription ID into the recorder.
- [x] U08 [Frontend] Use real exercise media from catalog data, or show no media; replace pretend video playback/progress.
- [x] U09 [Frontend] Replace fixed device/sensor/EMG/load indicators in patient screens with supported measured data; show unsupported channels as unavailable.

Phase acceptance: two different patients see their own profile, prescription, history and hardware; edits survive reload; a patient without a plan/device sees an explicit empty state.

### Phase 5 — Device enrollment, assignments and health (P1)

Primary files: `app/admin/devices/page.tsx`, `app/patient/device/page.tsx`, device services, `backend/apps/devices/`.

- [x] D01 [Both] Add assignment/reassignment/unassignment workflows for registered devices and clinicians, with transaction rules preventing conflicting active assignments and audit events.
- [x] D02 [Frontend] Resolve the signed-in patient's assigned device by UUID; remove `list[0]` selection and fixed fallback devices in patient device/record pages.
- [x] D03 [Backend] Derive connectivity from authenticated device/gateway heartbeat evidence and a defined freshness policy; do not infer it from `ACTIVE` or enrollment time.
- [x] D04 [Backend] Replace browser `ping` updating `last_seen_at` with an honest server-connectivity response or an acknowledged device diagnostic operation; a web request must not prove device contact.
- [x] D05 [Both] Persist/expose measured battery voltage/percentage, firmware, sensor health, timestamps and capability information without default healthy readings.
- [ ] D06 [Both] Replace timed “diagnostics passed” and preflight checks with measured freshness/quality or acknowledged diagnostic jobs; expose failures/timeouts/unverified results.
- [x] D07 [Backend] Store only credential verification material after one-time provisioning; remove persistent raw-token display storage, and implement controlled rotation/re-pairing if needed.
- [x] D08 [Both] Initialize only supported channels from the actual hardware profile. Align MPU6050 versus displayed LSM6DSOX, sensor counts, sampling rates and units; do not initialize unobserved channels as healthy.
- [x] D09 [Both] Connect technical alerts to real health events and scoped UI; implement acknowledged/resolved status if included in the MVP.

Phase acceptance: unplugging/stopping the device makes it stale/offline; opening or pinging the website cannot make it online; another patient's device never appears as the current patient's device.

### Phase 6 — Session recording and sensor transport (P0 ownership fixes; P1 workflow)

Primary files: `app/patient/session/record/page.tsx`, telemetry/device authentication and serializers/views, `edge/`.

- [x] S01 [Backend, P0] Require a permitted device/gateway identity for ingestion and bind the body device ID to the authenticated credential. Reject mismatches and unprovisioned devices.
- [x] S02 [Backend, P0] Check session/device/patient assignment and session state on every ingest; remove unrestricted auto-registration and fallback session ownership.
- [x] S03 [Both] Define start, pause/resume, finish and abandon semantics, including timestamps and partial-data retention; persist a session ID before streaming samples.
- [x] S04 [Both] Bind the session to a selected prescribed item, published version and active assigned device; avoid hardcoded exercise/target values.
- [ ] S05 [Edge/gateway] Select and implement the actual transport path: direct HTTPS or BLE plus a gateway. Define versioned packets, boot/session IDs, units, monotonic offsets, sequence counters and acknowledgments.
- [ ] S06 [Both] Carry all supported channel health/provenance/timestamps through ingestion/storage/retrieval; align edge debug fields with the agreed API format through an explicit encoder/adapter.
- [x] S07 [Backend] Validate batch size, sample counts, time ordering, finite values, array shapes, sequence bounds and `max_points`; return structured client errors.
- [ ] S08 [Edge/gateway/backend] Preserve deduplication and add bounded retry/backoff/offline buffering; detect conflicting duplicate payloads, gaps and reconnects across boot IDs.
- [x] S09 [Frontend] Replace simulated angles and time-based rep increments with actual samples/server results; show disconnected/stale/unsupported states.
- [x] S10 [Backend] Connect the summary helper or a validated replacement to completion; compute measured duration/ROM/reps/quality from valid samples and the applicable exercise configuration.
- [x] S11 [Both] Keep manual patient reps distinct from sensor estimates; represent unavailable estimates as unavailable rather than copying defaults/manual counts.
- [x] S12 [Frontend] Submit the corrected request DTO, use the returned session ID, show success only after acknowledgment, preserve work on failure and prevent duplicate finalization.
- [x] S13 [Both] Persist abandonment/incomplete quality according to the chosen lifecycle and keep clinician review restricted to the review operation.

Phase acceptance: a recorded session has real samples under one authorized session/device identity; retries do not duplicate data; loss of backend/device produces a truthful state and never a false saved confirmation.

Phase 6 software progress: see [session lifecycle, packet contract and gateway handoff](PHASE_6_RECORDING_HANDOFF.md). S05/S06/S08 remain open for live firmware transport, channel/timestamp alignment on hardware, and reboot/offline recovery acceptance. Host HTTPS outbox and simulation debug adapter are implemented and tested; physical phase acceptance is not claimed.

### Phase 7 — Clinician views, telemetry and reports (P1)

Primary files: doctor pages, `app/reports/session/[id]/page.tsx`, `components/features/TelemetryChart.tsx`, analytics/telemetry endpoints.

- [x] R01 [Both] Add backend patient/date/status/review filters for sessions; patient detail must request only that patient's sessions while retaining server authorization.
- [x] R02 [Both] Replace dashboard page-length counts and fixed patient-detail device/compliance snapshots with scoped totals and agreed reporting periods.
- [x] R03 [Backend] Return an empty telemetry result when no data exists; remove generated waves, placeholder angle conversion, substituted measurements and forced `READ_OK` flags from normal retrieval.
- [x] R04 [Frontend] Render timestamp-based charts with gaps for null/invalid/stale channels; handle one-point input, avoid connecting across missing intervals and use meaningful per-channel scales/units.
- [x] R05 [Both] Preserve quality/provenance and important extrema through downsampling; bound `max_points`. Clarify that knee-angle-based LTTB does not guarantee pressure/temperature peak preservation.
- [x] R06 [Frontend] After review, refresh canonical review status, author, time and notes; handle duplicate submissions and editing an already-reviewed session explicitly.
- [x] R07 [Both] Implement patient/date-scoped longitudinal trends with defined formulas; replace the fixed 75-to-105-degree and 92-percent report values.
- [x] R08 [Frontend] Fix report navigation to pass a session UUID; introduce a separate patient-report route only if a patient-level report is required.
- [x] R09 [Frontend] Remove report fallback identities/notes/authorization stamps; show not-found/forbidden/error states and actual reviewed/pending status.
- [x] R10 [Both] Build reports from the session's referenced prescription version and actual review author. Derive comparisons from stored targets rather than unconditional “goal exceeded” or “100% agreement” labels.
- [x] R11 [Both] Label the existing CSV as a downsampled view; add a separately authorized full-data export only if required, including units, quality and provenance.

Phase acceptance: all screens and exports agree on the same stored patient/session/version; missing data cannot turn into a completed or reviewed report.

Phase 7 software implementation: see [clinician summaries, review, telemetry and report handoff](PHASE_7_CLINICIAN_HANDOFF.md). Automated API/contract/static-render checks are recorded there. Live browser/print and deployed-device acceptance remain separate; adherence stays unavailable until a schedule-matching contract exists.

### Phase 8 — Administration and operational health (P1/P2)

Primary files: `app/admin/`, account/device APIs, `backend/apps/analytics/views.py`.

- [ ] O01 [Both, P1] Add an administrator-only all-role user directory; do not use the patient-clinical endpoint as the user directory.
- [ ] O02 [Both, P1] Persist account creation/invitation, suspension/reactivation and permitted role changes; remove local-only list updates and audit successful mutations.
- [ ] O03 [Both, P1] Expose accurate active-account status and search/role filters; current patient serializer omits `is_active` and frontend defaults it to true.
- [ ] O04 [Both, P1] Add server-side audit filters/pagination and consistent actor-role mapping; record assignment, credential, profile, account and clinical mutations as appropriate.
- [ ] O05 [Both, P1] Connect `/admin/health` to `healthApi`; use real database status and last successful check time with offline/error UI.
- [ ] O06 [Backend, P2] Measure fleet activity, ingestion lag, errors and queue/cache state if those features are implemented; replace unconditional pipeline “active” and fixed UI numbers.
- [ ] O07 [Both, P2] Implement password recovery and the “remember session” option if retained; current links/checkbox have no completed backend workflow.
- [ ] O08 [Both, P2] Treat WebSocket streaming, Redis metrics, EMG, haptics and other unimplemented capabilities as planned/unavailable until their real producers and acknowledgments exist.

### Phase 9 — Verification and deployment readiness (P1; before release)

- [x] V01 Add regression coverage for every reproduced identity/ownership/field-permission failure above, including real session/CSRF behavior rather than relying only on `force_authenticate`.
- [ ] V02 Add contract tests for session payload round trips, resource IDs on create, role/status normalization, null health values, nested prescriptions, pagination and invalid payloads.
- [ ] V03 Add end-to-end browser checks for clinician save/publish -> patient record/submit -> clinician review -> print, with multiple patients/clinicians and server/network failures.
- [ ] V04 Add tests that no-plan/no-telemetry/unknown-device/failed-save cases never fabricate data or success; check patient detail cannot show another patient's sessions.
- [ ] V05 Resolve the 55 current ESLint errors in API typings, shared UI types and React effect patterns; add documented typecheck/test scripts alongside existing scripts.
- [ ] V06 Generate/review/commit the three pending model-option migrations and verify a clean install/upgrade path using a disposable database first.
- [ ] V07 Explicitly select production Django settings in WSGI/ASGI/container deployment; they currently default to development, regardless of the Compose `DEBUG=False` variable.
- [ ] V08 Externalize production secrets/configuration, disable automatic demo seeding/password reset on startup, and configure allowed hosts/origins, secure cookies, HTTPS and static-file collection.
- [ ] V09 Make container health probes compatible with HTTPS redirects and permitted hosts; database liveness must remain distinguishable from protected operational metrics.
- [ ] V10 Remove tracked bytecode/database artifacts from future source tracking through a deliberate cleanup, retain local data safely, and add ignore rules for generated Python/runtime data.
- [ ] V11 Implement scheduled backups for the configured database and prove restore. The current script only copies a local SQLite file and does not implement PostgreSQL backup/restore.
- [ ] V12 Update root setup/run/API documentation and project-site architecture claims to match implemented session auth, transport, storage and hardware. Label TinyML, BLE/mobile buffering, WebSockets, encryption and clinical-performance claims as targets unless verified.
- [ ] V13 Run lint, typecheck, build, backend tests, migration consistency, schema validation and browser acceptance checks; retain results by environment.
- [ ] V14 Separately validate compiled firmware, live gateway/device transport, physical sensor calibration and disconnect behavior. Passing local web/API tests does not establish physical performance.

Phase 3 completion: see [persisted plan summary and manual tests](PHASE_3_PLANS_HANDOFF.md).

Phase 4 implementation: see [patient interface handoff](PHASE_4_PATIENT_HANDOFF.md). Unsupported preferences are removed; schedule-dependent adherence calculations require a future schedule contract.

Phase 5 software: see [device and hardware heartbeat handoff](PHASE_5_DEVICES_HANDOFF.md). Hardware acknowledgment/physical testing remains separate.

## Suggested implementation order

1. Phase 1 identity and permissions, plus S01/S02 ingestion ownership fixes.
2. Phase 2 typed contracts and truthful error/data handling.
3. Phase 3 persisted clinician draft/publish flow.
4. Phase 4 patient profile/plan display and Phase 5 assigned hardware/health.
5. Phase 6 session recording and actual sensor transport.
6. Phase 7 clinician review, trends, telemetry and reports.
7. Phase 8 remaining administration and operational visibility.
8. Phase 9 checks throughout implementation, followed by deployment and physical validation.

The first practical integration slice is A01-A11 -> C02-C06 -> P01-P08 -> U04/U07 -> D02/D03 -> S01-S04/S12 -> R01/R06/R08-R10. Actual sensor recording additionally requires the transport and measurement tasks in Phase 6.

## Verification performed during this review

| Check | Command/method | Result |
|---|---|---|
| Existing backend suite | From `backend`: `python -B -m pytest -q -p no:cacheprovider` | 11 passed. |
| Django checks | `python -B manage.py check --settings=config.settings.testing` | No issues reported. |
| Migration consistency | `python -B manage.py makemigrations --check --dry-run --settings=config.settings.testing` | Failed: missing ordering-option migrations for `accounts.User`, `devices.Device`, `exercises.ExerciseDefinition`. No migration files created. |
| Frontend type checking | From root: `.\node_modules\.bin\tsc.cmd --noEmit --incremental false` | Passed. |
| Frontend lint | `npm.cmd run lint -- --quiet` | Failed: 55 errors. Warnings were suppressed by `--quiet`; this is not a full warning count. |
| Additional API probes | Django APIClient, migrations and synthetic identities in a temporary in-memory database | Confirmed permission and persistence defects documented above. |
| Production build/browser workflow | Not run in this review | Unverified. |
| Docker/PostgreSQL/Redis deployment | Configuration reviewed, services not started | Unverified. |
| Firmware compilation/Wokwi run/physical hardware/BLE/cloud upload | Source reviewed only | Unverified. |

The existing suite does not cover the confirmed bypasses, and its telemetry retrieval test currently succeeds on generated data. Keep the passing result as a limited baseline and add behavior-focused coverage before marking integration complete.
