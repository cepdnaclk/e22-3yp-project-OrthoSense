# Django administration

All 16 project models are registered at the backend's `/admin/` URL. The analytics app currently defines no models. Django's built-in Groups registration remains available.

## Open the admin

From Command Prompt:

```cmd
cd /d D:\clone\pyqt\e22-3yp-project-OrthoSense\backend
python -B manage.py createsuperuser
python -B manage.py runserver localhost:8085
```

Skip `createsuperuser` if you already have a Django superuser. Enter your own email/password at its prompts. Open http://localhost:8085/admin/ and sign in with that email and password.

Port 8085 is used because this laptop's Windows excluded range includes ports 8000/8001. Use the backend address, not the frontend's `/admin/users` route.

## Add a doctor or patient

1. Open **Accounts -> Users -> Add**.
2. Enter email, full name, role, password and password confirmation. Username is optional and generated when left blank.
3. Select **Clinician** for a doctor or **Patient** for a patient. Save.
4. Optionally add the corresponding **Clinician profile** or **Patient profile**, selecting the account you just created. Review clinical/profile fields before saving them.
5. Open **Clinician assignments -> Add** to assign a clinician to a patient; select the accounts, enable **Active**, and save. Without an active assignment the clinician cannot access that patient's records through the portal.
6. Use **Device assignments** to associate a registered device with a patient when needed.
7. Sign into http://localhost:3000/login with the new user's email and password, using a private browser window or signing out of the existing account first.

Passwords are hashed through Django's user forms. To change a password later, open the user and use Django's password-change link. Changing profile fields preserves the password hash. Case-insensitive duplicate emails and mismatched passwords are rejected.

An **Administrator** portal role does not automatically grant Django superuser access. New accounts created through the add form default to active ordinary users, without staff or superuser privileges. Project model administration requires `is_superuser`; staff model permissions alone do not expose these project records. This keeps full database administration separate from the portal's restricted administrative role.

## Registered models

| App | Models |
|---|---|
| Accounts | User, PatientProfile, ClinicianProfile, ClinicianAssignment, AuditLogEntry |
| Devices | Device, DeviceAssignment, DeviceCredential, SensorChannel, TechnicalAlert |
| Exercises | ExerciseDefinition, PlanVersion, ExercisePrescription |
| Telemetry | Session, TelemetryBatch, ReviewNote |

Lists include useful columns, search and filters. Related user selectors reject incorrect roles, such as a patient in a clinician assignment field.

Audit entries, telemetry batches and review notes can be inspected but are read-only in the admin. Published/archived plans and their prescriptions are also read-only; draft plans and draft prescriptions can be edited. Plan publication continues through the existing publish API rather than a direct admin status edit.

Device credentials show revocation/expiry metadata without exposing stored raw tokens. Credentials must be generated through the existing device-provisioning API; creating a Device model row directly does not perform that API's token/channel provisioning.

## Verification

```cmd
python -B manage.py check --settings=config.settings.testing
python -B -m pytest -q -p no:cacheprovider
```

The backend suite covers all 16 list pages, editable creation forms, user creation/password changes, doctor-patient assignment, superuser-only access, protected evidence records and credential masking. Tests use a separate in-memory database. This registration change does not require database migrations or reset existing accounts.

Manual checks: log in as your superuser, verify the four project sections appear, create a test doctor and patient, link them through Clinician assignments, and confirm the new credentials work on the frontend. Browser styling and your running database's content are not established by the automated Django test-client checks.
