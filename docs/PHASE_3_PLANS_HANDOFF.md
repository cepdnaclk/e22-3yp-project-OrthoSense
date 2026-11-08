# Phase 3: persisted exercise prescriptions

Implementation complete; browser acceptance remains manual.

## Completed

- Replaced the editor's local-only edits with Save draft and Save and publish workflows.
- Save and publish first persists notes and every exercise item, obtains the server ID, then publishes that saved draft. Errors retain the editor and show an error rather than a fabricated publish confirmation.
- Editor loads scoped plan history, resumes an existing draft when available, otherwise displays the published version. New patients can start their first draft without an existing plan ID.
- Published/archived plans are read-only. Create revised draft copies their content into a new draft; saving allocates a new UUID/version without modifying the source. The original remains active until the revision is published.
- Prescriptions persist sets, repetitions, flexion, extension, rest seconds, instructions and ordering. Add/remove/Move up controls are available. Defaults come from the selected exercise catalog, including default sets.
- Saved-version controls show history; unsaved changes are labeled. Switching versions/back navigation prompts before discarding edits; browser unload is guarded.
- Added typed plansApi.update and patient-filtered plan history service.
- Backend draft updates validate and replace nested prescription items atomically. Unknown exercise IDs, invalid counts, negative rest periods, non-finite angles and inverted angle ranges are rejected before saved content changes.
- Creation serializes version allocation under a patient row lock. Publish locks patient/plan and performs archival plus audit logging inside the transaction. A published plan cannot be edited/deleted; an archived plan cannot be republished.
- Empty drafts can be saved, but publishing requires at least one exercise.
- Patients can retrieve published plans only; draft/history authoring remains clinician-scoped. The active-plan endpoint remains separate from clinician draft history.
- Published/archived model metadata and prescriptions resist direct model edits, including moving a published prescription into a draft. Prior sessions retain their original plan reference after revision.

## Main files

- app/doctor/patients/[id]/plan/page.tsx
- lib/services/api.ts and lib/types/index.ts
- backend/apps/exercises/serializers.py, views.py, models.py
- backend/tests/test_phase3_plans.py

## Verification

- Backend suite: 121 passed, including eight Phase 3 cases.
- Frontend existing auth/transport suite: 17 passed.
- TypeScript: passed.
- Changed editor/API lint: passed.
- Production build: final result recorded in the completion response.
- No existing database was migrated/seeded and no password was reset. Model method changes add no migration requirement.
- Tests use disposable data. They do not establish browser layout, real device behavior or PostgreSQL concurrency under deployed load.

## Manual acceptance

Run backend at localhost:8085 and frontend at localhost:3000 with its matching NEXT_PUBLIC_API_URL.

1. Login as a clinician with an active patient assignment. Open Patient cohorts -> patient -> plan editor.
2. For a patient with no plan, add an exercise. Set distinct values such as 2 sets, 7 reps and 45 seconds rest; enter your intended angle targets/instructions and clinical notes. Save draft.
3. Reload: every saved value, draft UUID and version should remain. If there is no catalog exercise, create its definition first; the editor does not invent catalog records.
4. Add another movement, change its instructions, move it up, remove an item and save again. Reload and verify exact contents/order.
5. Enter an invalid count or extension greater than flexion. Saving must show validation errors and preserve the last saved draft in the database.
6. Remove all items: Save draft can succeed, Save and publish is disabled. The API also rejects publishing an empty draft.
7. Restore valid items and select Save and publish. The saved version becomes Published and editing controls lock.
8. As that patient, request /api/v1/my-plan/ with the authenticated browser/API client. It should return exactly the published items/notes. Patients must not access the draft through /plans/{id}/.
9. Back as clinician, Create revised draft, modify it and Save draft. Verify a new version/ID; the patient's active-plan endpoint must still return the earlier published version.
10. Publish the revision. The prior version becomes Archived and remains in saved history; existing sessions still reference it. The patient active-plan endpoint now returns the new version.
11. Stop the backend before saving/publishing: no success message should appear, edits should remain available for retry.
12. Use an unrelated clinician/patient account to try editing/publishing: access must be denied.

## Boundaries

Patient dashboard/exercise pages still require Phase 4 data binding; verify publication through the actual active-plan API rather than the current static patient cards. Device-enforced exercise limits and live feedback are not established by saving prescriptions. The editor no longer claims that saving alone enables hardware enforcement.

Next: Phase 4 patient profile, dashboard and exercise integration.
