# Patient exercise calendar

The dashboard calendar shows completed saved sessions and published doctor reminders. Dates use the viewing browser's local timezone. Session completion is grouped by ended_at when available, otherwise started_at; only status=completed counts. A scheduled reminder is not marked completed merely because it is on a day with another session.

Doctor reminders use explicit dates/times. In the plan editor, add an exercise, choose its Calendar reminder date/time, Save draft, then Save and publish. Several reminders can be added. Remove reminder deletes an entry from the editable draft. Published/archived schedules are immutable and carried into new revisions. Patient calendar reminders come only from the active published plan. Repeating weekly schedules and push/email/phone notifications are not implemented.

Apply the new schedule migration before using these changes:

```cmd
cd /d D:\clone\pyqt\e22-3yp-project-OrthoSense\backend
python -B manage.py migrate
python -B manage.py runserver localhost:8085
```

Migration exercises/0002_planversion_schedule adds a JSON schedule to each version; old plans default to an empty schedule. The command also applies any earlier pending migrations, including Phase 5 device health storage. Existing data/passwords are not reset. No migration was applied to your project database during this work.

The dashboard reloads authenticated patient data every 30 seconds and on browser focus. It also reloads on navigation back from the recorder. Failed refreshes display an outdated-data warning. Exercise activity appears only after the backend saves a completed session; physical movement alone cannot update the web calendar without hardware integration.

Tests: 136 backend tests passed, including reminder persistence, prescription membership validation, patient write rejection and published schedule immutability. TypeScript passed. Changed-file lint and frontend auth tests are checked separately. Real browser layout, local timezone display and session recording still need manual acceptance.

Manual tests:
1. Apply migrations and restart both servers.
2. As the assigned doctor, edit a draft and add at least one date/time for a prescribed exercise. Save/reload and verify persistence.
3. Before publishing, confirm the patient cannot see the draft reminder. Publish and refresh the patient dashboard.
4. Navigate calendar months, select the scheduled date and verify the exercise/time appears with an amber dot.
5. Save a completed session through the actual recording/API path. Return to dashboard or wait for refresh; its day gains a teal dot and the completed-session entry.
6. In-progress/abandoned/failed submissions must not become completed calendar entries.
7. Verify another patient account cannot see the first patient's sessions or reminders.
8. Test midnight/timezone boundaries in the intended user's browser. Dates should match that browser's local timezone.
9. Revise and republish the plan to change reminders; the old version must stay intact.
10. Stop the backend during a refresh; show the warning rather than silently presenting old data as freshly loaded.
