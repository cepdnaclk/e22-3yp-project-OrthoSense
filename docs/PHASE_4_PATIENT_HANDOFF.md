# Phase 4: patient profile, dashboard and prescriptions

Implemented with local automated checks; real browser acceptance remains manual.

## Changes

The patient dashboard now has four readable cards: Your prescribed exercises, Your progress, Your knee brace, and Your care team. The original wallpaper remains without a green gradient. A neutral dark overlay supports readable text.

All names, clinician assignments, recovery week, published plan/version, exercises, instructions, session counts and assigned-device metadata come from authenticated APIs. Removed the fixed Sarah persona, sample progress charts, fabricated cadence/EMG/load values, preset compliance percentages and simulated live streams from these screens.

Progress shows completed records in the last rolling seven days and overall completed records, plus recent manual repetition counts. It does not infer daily completion, streak or adherence percentages: the current prescription model does not define a daily schedule/frequency, so a valid denominator is unavailable. This is a deliberate product boundary rather than invented progress.

The exercise page loads only the active published prescription. It shows each saved set/repetition/angle/rest/instruction value and uses real catalog video URLs when available; missing videos have an explicit no-media state. Buttons carry prescription and plan IDs to the recorder URL. The recorder's handling of that selection and actual sensor acquisition remain Phase 6 work.

Profile reads the authenticated user's account, assigned clinician and clinical record. PATCH /api/v1/auth/me/ saves full_name, emergency_contact_name, emergency_contact_phone and haptic_alerts_enabled only. Writes are patient-only, CSRF/JWT protected, transactional and audited. Clinical fields, account role, email and submitted identity IDs are rejected. No fake profile is auto-created when the clinical profile is missing. Full name remains editable without a clinical profile.

Only supported persisted preferences/fields are displayed. Removed the old unsupported phone/address/emergency-relationship/reminder/BLE toggles rather than presenting controls that cannot save. Vibration is explicitly a stored preference, with device activation unconfirmed.

All three screens display loading/failure/empty states instead of sample records. A failed multi-source dashboard load does not display partial fabricated success. Device lookup uses the assigned UUID rather than list[0]. Unknown connection status and last-reported battery remain truthful; detailed device diagnostics and heartbeat behavior belong to Phase 5.

## Files

- app/patient/dashboard/page.tsx
- app/patient/exercises/page.tsx
- app/patient/profile/page.tsx
- components/features/usePatientData.ts
- lib/services/api.ts, api-contract.ts and auth-contract.ts; lib/types/index.ts
- backend/apps/accounts/views.py and serializers.py
- backend/tests/test_phase4_profile.py; tests/auth.test.mjs

## Checks

- Backend suite: 130 passed.
- Frontend auth/transport suite: 19 passed.
- TypeScript passed.
- ESLint passed for changed patient pages, hook and API service.
- Production build passed.
- Tests cover persisted personal changes, cross-user isolation, protected clinical/identity fields, nonpatient denial, missing-profile rollback, exercise media/defaults and frontend profile write contracts.
- Existing database contents/passwords were not reset or seeded. No new model fields or migrations are required.
- These checks do not establish actual browser appearance, video playback, deployment, physical sensors or device preference acknowledgment.

## Manual test checklist

1. Restart backend on localhost:8085 and frontend with NEXT_PUBLIC_API_URL=http://localhost:8085/api/v1.
2. Login as patient A. Check the dashboard greeting, assigned clinician, clinical recovery week and device identifier against Django admin/API records.
3. Check the four-card layout on desktop and a narrow/mobile window. Confirm wallpaper has no green gradient and card labels are readable.
4. Publish a plan for patient A as the assigned doctor, then refresh the patient's exercise page. Verify version, notes, movements, sets/reps, targets, rest and instructions exactly match.
5. Leave a newer revision in Draft. Patient A must still see the previous published version. Publish the revision and refresh; the patient should now see the new published prescription.
6. For an account without a published plan/device/clinical profile, verify explicit unavailable states rather than sample exercises or hardware.
7. If actual video_url is configured, test playback. Without a URL, confirm No demonstration video available. Not every hosted webpage URL is a playable video file; use a supported direct media URL.
8. Update full name and emergency contact, save, then reload. Verify the values persist in the same patient's record. Toggle vibration preference and verify persistence without claiming the device changed.
9. Attempt a PATCH containing role, diagnosis, target_rom_flexion or another user ID: expect 400. Doctors/admins cannot use this patient personal-update operation.
10. Sign in as patient B in another browser profile. Their dashboard/profile/exercises must contain only their own data.
11. Stop the backend and reload/save: expect an error, not invented records or a successful-save message. Restart and retry.
12. Check session totals against actual completed records, including more than 20 records. Counts exclude in-progress/abandoned sessions and do not claim adherence.

## Subsequent phases

Phase 5 completes assigned device health, acknowledgments and measured connectivity. Phase 6 completes selected-prescription recording, actual sensor metrics and lifecycle. Existing recorded summaries may still contain earlier demo/model defaults; these screens display stored history, not independently validated measurements. Phase 7 handles full clinical reports and raw telemetry provenance. A future explicit prescription schedule is required before daily compliance/streak calculations can be implemented correctly.
