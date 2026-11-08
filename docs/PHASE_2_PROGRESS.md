# Phase 2 handoff: API transport contracts

Implemented and automatically verified. Browser acceptance checks remain manual.

## Completed changes

- Added explicit transport DTOs for patients, plans, prescriptions, exercises, sessions, devices, alerts, audit and health. Removed all transport `any` declarations from the API service.
- Session writes translate supported frontend fields into backend names. Sensor-derived fields are not writable by patients. Session and plan creation return full canonical detail with IDs; repeated publication returns the same plan response shape.
- Every list service, including alerts, follows pagination with loop detection. Pagination cannot forward cookies/CSRF credentials to another origin.
- Patient UUID and status filters are applied before authorization scoping in patient/plan/session querysets. A submitted filter cannot widen access. Invalid patient UUIDs return 400.
- Missing plan references/versions and device battery/last-seen values retain null rather than invented version 2, creation time or healthy readings.
- Device enrollment status is separate from connectivity. ACTIVE enrollment is displayed as unknown connectivity until a proper heartbeat policy is implemented in Phase 5. Revoked, maintenance and unpaired states are mapped explicitly.
- Channel health maps server channels by sensor type. Missing/stale evidence becomes unverified; invalid/rail/stale/degraded states survive mapping. No channel is automatically healthy because its device was registered.
- Diagnosis and audit actor mappings no longer invent a diagnosis or turn a system actor into an administrator.
- A shared visible API notice reports HTTP/network failures even on existing pages that catch errors. It distinguishes HTTP status, offers dismissal/reload and does not retry writes automatically. Session 401 handling remains separate. Existing per-page loading skeletons remain.
- Request cancellation is supported through RequestInit signals and checked before requests; cancelled requests do not report network failures. No automatic write retry was introduced.
- Added root/backend environment examples with placeholders and the currently working backend port 8085. Existing local environment files are unchanged.
- Failed recorder submissions no longer display success.

## Contract conventions

API base is NEXT_PUBLIC_API_URL. Requests use Django session cookies and CSRF headers for unsafe operations. API wire fields use snake_case; frontend domain objects use camelCase. IDs are server UUID strings. Timestamps are ISO strings, telemetry elapsed offsets are milliseconds, and unavailable references/timestamps remain null. Pagination is {count,next,previous,results}; current list screens consume the full authorized list rather than compute totals from one page. For larger deployments, aggregate endpoints and page-by-page screen controls are a subsequent scaling task.

The existing OpenAPI endpoint remains /api/schema/ and Swagger remains /api/docs/. Create serializers now serialize full read responses. Further automatic schema generation/client generation is not introduced here.

## Validation

- TypeScript passed.
- 109 backend tests passed, including canonical create responses and filter isolation.
- 17 frontend auth/transport tests passed, including pagination, missing device evidence and cross-origin pagination rejection.
- ESLint passed for the changed API contracts/client/services, API notice and frontend tests.
- Production build passed.
- Browser behavior, physical sensors and deployed infrastructure were not validated by these local tests.

## Manual tests

1. Restart backend on localhost:8085 and frontend with NEXT_PUBLIC_API_URL=http://localhost:8085/api/v1.
2. Login normally. Load directories with more than 20 authorized rows; confirm subsequent page requests and records appear.
3. Save a patient session with 3 manually reported repetitions. Inspect POST/GET: patient_reported_reps must remain 3 and the response must contain a session UUID.
4. Create a draft plan through the API and confirm ID/version/prescriptions in the response. This does not implement the plan editor save button; that is Phase 3.
5. Request sessions with patient_id and status filters. An unassigned patient filter must return no records; invalid UUID must return 400.
6. Stop backend and refresh a directory or attempt a write: a visible error must appear, not only an empty list. Recorder failure must not show successful saving.
7. Check a never-seen device: connectivity unknown, absent channels unverified, no substituted last-seen timestamp. Revoked enrollment must display revoked.
8. Check a session without a plan: no fabricated version 2.
9. Verify ordinary login/logout, assigned-patient access and cross-patient rejection still work.

## Boundaries

Phase 3 still implements persisted draft editing and revision workflow. Phases 4/5 replace fixed patient/dashboard/profile/device widgets and add measured heartbeats. Phase 6 supplies actual sensor recording and computed measurements. Phase 7 removes historical synthetic telemetry and fixed report content. This transport work does not establish sensor accuracy or remove all existing model defaults. Full-project lint cleanup and production deployment remain in Phase 9. No existing database migration, seed or password reset was run.
