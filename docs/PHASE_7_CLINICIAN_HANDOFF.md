# Phase 7 — Clinician views, telemetry and reports

Implemented locally on 2026-11-09. This handoff covers software behavior; it does not certify physical sensor performance or a deployed browser workflow.

## Delivered

- **R01/R02:** The clinician dashboard, patient detail and reports workspace use the same server-side patient/date/status/review filters, canonical pagination and scoped summary results. Patient detail includes `patient_id` in requests, and backend clinician assignment / patient ownership checks still apply. Invalid UUIDs, dates, date order, statuses, review flags and ordering return structured 400 errors. Session ordering is deterministic by started time and UUID. Patients without sessions remain in assigned-cohort totals.
- **R03:** Empty telemetry is `[]`. Missing channels are null/unverified, without generated waves, acceleration-to-angle guesses, substituted measurements or forced READ_OK. This behavior was introduced in Phase 6 and remains covered by tests.
- **R04/R05:** Charts use original monotonic timestamps, independent channel scales and units, including heel and toe ADC counts. A single valid point renders as a dot. Null/nonfinite/non-READ_OK readings break paths; boot/source changes, missing sequence numbers and gaps over one second break continuity. Server gap metadata distinguishes real discontinuities from spacing introduced by downsampling. The accessible table retains raw displayed values, quality, timestamps and source/boot/sequence evidence.
- **R06:** Saving a clinician review returns the fully refreshed server record, including review author, time, notes and history. Identical retries by the same author do not create another note/audit event. Revising a review requires explicit opt-in and the current review ID. A stale revision returns 409 and preserves the entered text. Previous notes remain in history. In-progress/abandoned sessions cannot be reviewed.
- **R07:** Longitudinal summaries are calculated per patient/exercise and UTC date. Fixed progression and compliance percentages are removed. Insufficient data is explicit.
- **R08/R09/R10:** Report links always contain session UUIDs. The printable report and session viewer share the same stored facts component: patient/session identity, status, quality, referenced prescription version, actual prescription author, targets/instructions, review author/time and full review history. Failed/forbidden/not-found requests show errors without a fabricated record. Pending reviews remain pending. Target comparisons use the session's referenced prescription, including an older archived version after revision. Missing values remain unavailable.
- **R11:** CSV is labeled and named **downsampled telemetry**, with session/version identity, units in headings, per-channel quality, provenance, timing and decimation gap/quality/source/boot summaries. Strings are quoted and formula-like cells escaped. No separate full-data export was required or introduced.

## API contract and formulas

`GET /api/v1/sessions/` supports:

- `patient_id`: UUID; always intersects authorization scope.
- `date_from`, `date_to`: inclusive UTC calendar dates based on `started_at`.
- `status`: completed, in_progress, abandoned.
- `reviewed`: true/false.
- `ordering`: started_at or -started_at; ties use UUID ascending.
- `page`: normal backend pagination; responses retain count, next and previous.

`GET /api/v1/sessions/summary/` accepts the same scope filters, with an inclusive default period of today and the previous 29 UTC dates. UI requests pass explicit dates to both list and summary endpoints. Summary totals are computed over all matching sessions, independently of the displayed page:

- `patients`: all assigned patients in scope, optionally intersecting `patient_id`; this is current assignment metadata, independent of session status/date filters.
- `assigned_devices`: distinct currently assigned devices for that patient scope.
- `online_devices`: those devices with ACTIVE enrollment and a server-observed heartbeat/ingestion timestamp within 90 seconds. Device counts describe current connectivity, not historic connectivity during the selected period.
- `sessions`, `completed`: all matching records and completed matching records.
- `pending_review`: completed matching sessions without a saved review; in-progress/abandoned sessions do not contribute.
- `reviewed`: completed matching sessions with a saved review.
- `trends`: completed sessions grouped by patient, referenced exercise UUID and saved exercise name. `daily.mean_max_flexion_deg` is the arithmetic mean of saved session maxima on that UTC day. Eligibility requires a referenced prescription, a hardware-provenance telemetry batch, usable saved quality and a non-null maximum. Legacy unbound defaults and simulation-only sessions do not contribute.
- `flexion_change_deg`: last daily mean minus first daily mean within a group, only when at least two measured UTC dates exist. This is a numerical change, not a clinical prediction.
- `latest_session_id`: latest completed matching session in that group, for an actual session report link. That session may have incomplete/simulation data, which the report labels through its saved quality and unavailable outcomes.
- `adherence_percent`: null. A schedule-to-session matching rule has not been defined, so completion counts are not presented as adherence.

Current device, assignment and published-plan cards use real API data. There is no fallback device, diagnosis, version, battery, online state or compliance percentage.

Session reads now also include `prescribed_item`, `plan_author_name`, and review notes with `clinician` UUID, `doctor_name`, `content`, `reviewed_at` and note ID.

`POST /sessions/{id}/review/` accepts `notes`, optional `replace_review`, and `expected_review_id`. The initial save requires only notes. Revising a normal saved review requires `replace_review: true` and the latest review ID. The server locks the session, stores a new immutable historical note, updates the canonical review fields and records the audit event transactionally. An identical retry returns the existing record. A legacy reviewed record without a historical note can be explicitly revised with a null expected ID; its missing historical author is not invented.

## Downsampling contract

`GET /sessions/{id}/telemetry/?max_points=500` remains an array response. The bound is 3–5000. The normal path now uses a multi-channel min/max envelope instead of angle-only LTTB:

1. Retain first/last observations and global minima/maxima for angle, heel ADC, toe ADC and temperature, both for finite raw values and READ_OK values.
2. Add complete multi-channel extrema buckets that fit, then fill remaining capacity with evenly distributed original observations. Never synthesize values or timestamps.
3. Attach per-channel/key `gapBefore`, inclusive span `qualitySummary`, `sourceSummary` and `bootSummary`. These summarize all original observations between the previous and current retained points; shared endpoints occur in adjacent spans, so counts must not be summed as a unique sample total.
4. If the requested limit cannot retain mandatory extrema, return a structured 400 with `required_min_points`. The clinician UI offers limits of 100–5000. Repeated quality changes can be represented in span summaries without exceeding the cap.

Global extrema are retained across channels. Some local extrema/timing detail can still be omitted. The earlier knee-angle LTTB implementation does not guarantee pressure/temperature peak retention and is no longer used for this endpoint. Original telemetry stays in storage; the CSV exports the displayed decimated view only.

## Verification

- Backend suite: **164 passed** on disposable SQLite test databases. Includes scope/filter validation, UTC date boundaries, totals beyond one page, heartbeat freshness, legacy/simulation exclusions, daily arithmetic, referenced archived targets, canonical review metadata, retry/revision conflict handling, per-channel extrema and quality/provenance gaps.
- Frontend suites: **28 passed** (19 existing auth/transport checks and 9 clinical checks). Covers timestamp spacing, one-point rendering, null/stale/restart/decimated gaps, per-channel toe gaps, CSV escaping/units/provenance, scoped DTOs, request-failure propagation, saved target comparisons, unavailable/pending content, session-ID report links and forbidden report markup.
- TypeScript and focused lint: passed. Django system check: passed. Production build: passed.
- No new schema migration is needed for Phase 7. Phase 6's migration remains necessary for a database that has not yet been upgraded. The existing local database was not migrated or seeded by this work. Migration consistency still reports existing ordering-option drift for accounts.User, devices.Device and exercises.ExerciseDefinition; this remains outside the phase.
- Actual browser interactions/print pagination, PostgreSQL concurrency, deployment and physical transport/calibration are **not verified** by these checks. Static React rendering is not live browser acceptance.

## Manual acceptance

1. Apply required prior-phase migrations in the intended environment. Use two clinicians and two separately assigned patients. Confirm each clinician sees only their assigned cohort.
2. Open the dashboard and choose dates/status/review filters. With over 20 matching records, page forward; confirm totals remain stable and accurate. Open a patient's detail and verify every row belongs to that patient.
3. Compare a device's reported freshness/battery with the API. An old/missing heartbeat must not show it online. A patient without a plan/device must see explicit empty states.
4. Inspect sessions with no telemetry, a single sample, invalid channels, source/boot changes and transport gaps. Check timestamps, per-channel axes, data/quality table and downsampled CSV. Verify ADC units are never labeled kg-force.
5. Save a completed-session review; check author/time/notes after reload. Retry the same request, then explicitly revise. Attempt a stale concurrent revision and confirm 409 without losing text. Verify patient and unassigned-clinician writes fail.
6. Publish a new plan after a recorded session. Open that older session's report from the patient history, reports workspace and viewer. All must reference the original version/targets and the same review history.
7. Print pending and reviewed reports and inspect browser print pagination. Disconnect the backend and request a forbidden/nonexistent report; ensure errors never produce an official-looking substitute record or saved-success confirmation.
