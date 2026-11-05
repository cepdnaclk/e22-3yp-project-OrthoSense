import secrets
import hashlib
from datetime import date, timedelta
from django.core.management.base import BaseCommand
from django.utils import timezone
from django.contrib.auth import get_user_model

from apps.accounts.models import PatientProfile, ClinicianProfile, ClinicianAssignment, AuditLogEntry
from apps.devices.models import Device, DeviceCredential, SensorChannel, DeviceAssignment, TechnicalAlert
from apps.exercises.models import ExerciseDefinition, PlanVersion, ExercisePrescription
from apps.telemetry.models import Session, ReviewNote

User = get_user_model()


class Command(BaseCommand):
    help = "Seeds database with comprehensive clinical demo users, devices, plans, and historical telemetry."

    def handle(self, *args, **options):
        self.stdout.write(self.style.NOTICE("Initializing OrthoSense Clinical Seed Data..."))

        # 1. Administrator
        admin_user, _ = User.objects.get_or_create(
            email="admin@orthosense.health",
            defaults={
                "username": "sysadmin",
                "full_name": "Elena Rostova (System Admin)",
                "role": User.Role.ADMIN,
                "department": "Clinical Engineering & IT",
                "is_staff": True,
                "is_superuser": True,
            }
        )
        admin_user.set_password("admin12345")
        admin_user.save()

        # 2. Clinician (Doctor)
        doctor_user, _ = User.objects.get_or_create(
            email="dr.smith@orthosense.health",
            defaults={
                "username": "dr_smith",
                "full_name": "Dr. Marcus Vance, MD",
                "role": User.Role.CLINICIAN,
                "department": "Orthopedic Surgery & Rehabilitation",
                "is_staff": True,
            }
        )
        doctor_user.set_password("doctor12345")
        doctor_user.save()

        ClinicianProfile.objects.get_or_create(
            user=doctor_user,
            defaults={
                "license_number": "MD-ORTHO-49210",
                "specialization": "Orthopedic Surgery & Biomechanical Rehabilitation",
                "hospital_affiliation": "Metropolitan Orthopedic Institute",
            }
        )

        # 3. Patient: Sarah Connor
        sarah_user, _ = User.objects.get_or_create(
            email="sarah.connor@orthosense.health",
            defaults={
                "username": "sarah_c",
                "full_name": "Sarah Connor (Post-Op ACL)",
                "role": User.Role.PATIENT,
            }
        )
        sarah_user.set_password("patient12345")
        sarah_user.save()

        PatientProfile.objects.get_or_create(
            user=sarah_user,
            defaults={
                "date_of_birth": date(1996, 5, 14),
                "diagnosis": "Post-Op ACL Reconstruction (Left Knee)",
                "surgical_protocol": "Bone-Patellar Tendon-Bone Autograft",
                "surgery_date": date.today() - timedelta(days=28),
                "target_rom_flexion": 105.0,
                "target_rom_extension": 0.0,
                "recovery_week": 4,
                "emergency_contact_name": "John Connor (Brother)",
                "emergency_contact_phone": "+1 (555) 019-2834",
            }
        )

        # Additional Patients
        patients_data = [
            ("david.kim@orthosense.health", "david_k", "David Kim", "Meniscus Repair (Lateral)", 6, 115.0),
            ("maria.santos@orthosense.health", "maria_s", "Maria Santos", "Total Knee Arthroplasty (TKA)", 2, 90.0),
            ("james.wilson@orthosense.health", "james_w", "James Wilson", "MCL Grade II Sprain", 3, 100.0),
            ("robert.taylor@orthosense.health", "robert_t", "Robert Taylor", "PCL Reconstruction", 5, 110.0),
        ]
        for email, username, name, diag, week, target in patients_data:
            p_user, _ = User.objects.get_or_create(
                email=email,
                defaults={"username": username, "full_name": name, "role": User.Role.PATIENT}
            )
            p_user.set_password("patient12345")
            p_user.save()
            PatientProfile.objects.get_or_create(
                user=p_user,
                defaults={"diagnosis": diag, "recovery_week": week, "target_rom_flexion": target}
            )
            ClinicianAssignment.objects.get_or_create(
                clinician=doctor_user,
                patient=p_user,
                defaults={"active": True, "assigned_by": admin_user}
            )

        # Assign Sarah to Dr. Marcus Vance
        ClinicianAssignment.objects.get_or_create(
            clinician=doctor_user,
            patient=sarah_user,
            defaults={"active": True, "assigned_by": admin_user}
        )

        # 4. Hardware Smart Knee Brace Device
        device, _ = Device.objects.get_or_create(
            device_identifier="ESP32-S3-ORTHO-092",
            defaults={
                "mac_address": "7C:DF:A1:88:9B:40",
                "hardware_revision": "v2.1-BionicX",
                "firmware_version": "v2.1.0-RC4",
                "status": Device.Status.ACTIVE,
                "battery_percent": 94,
                "battery_voltage": 3.98,
                "last_seen_at": timezone.now(),
            }
        )

        # Device Credential (Hardware Bearer Token)
        raw_demo_token = "ortho_demo_token_esp32_s3_bionic_x_99"
        token_hash = hashlib.sha256(raw_demo_token.encode("utf-8")).hexdigest()
        DeviceCredential.objects.get_or_create(
            device=device,
            defaults={
                "hashed_token": token_hash,
                "salt": "demo_salt_hex_12345",
                "raw_token_display": raw_demo_token,
            }
        )

        # Assign device to Sarah
        DeviceAssignment.objects.get_or_create(
            device=device,
            patient=sarah_user,
            defaults={"active": True, "assigned_by": admin_user}
        )

        # 6 Sensor Channels
        channel_configs = [
            (0, SensorChannel.SensorType.IMU_THIGH, "ESP32-S3 Master SoC", "Hz", 100),
            (1, SensorChannel.SensorType.IMU_THIGH, "IMU 1 — Thigh Segment", "deg", 100),
            (2, SensorChannel.SensorType.IMU_SHANK, "IMU 2 — Shank Segment", "deg", 100),
            (3, SensorChannel.SensorType.FSR_INSOLE, "Foot Insole Pressure FSRs", "kg-f", 50),
            (4, SensorChannel.SensorType.SEMG, "Surface sEMG Muscle Lead", "% RMS", 200),
            (5, SensorChannel.SensorType.NTC_TEMP, "Skin Temp & Patellar Hinge", "°C", 1),
        ]
        for idx, stype, label, unit, rate in channel_configs:
            SensorChannel.objects.get_or_create(
                device=device,
                channel_index=idx,
                defaults={
                    "sensor_type": stype,
                    "label": label,
                    "unit": unit,
                    "sampling_rate_hz": rate,
                    "health_status": SensorChannel.ChannelHealth.HEALTHY,
                    "calibration_date": date.today() - timedelta(days=10),
                }
            )

        # 5. Standard Exercise Definitions
        exercises_list = [
            ("active-knee-flexion", "Active Knee Flexion", "Seated or prone active knee flexion with smooth controlled cadence. Stop on first onset of sharp pain.", 0.0, 105.0, 10, 3),
            ("patella-slide", "Patella Slide (Extension)", "Supine straight-leg elevation with 2-second pause at peak extension to mobilize patella.", 0.0, 10.0, 12, 3),
            ("hamstring-curls", "Hamstring Curls", "Prone flexion targeting posterior chain co-contraction with sensor angle verification.", 15.0, 95.0, 10, 4),
            ("straight-leg-raises", "Straight Leg Raises", "Supine leg raise with locked knee joint, strengthening quadriceps and hip flexors.", 0.0, 45.0, 10, 4),
            ("knee-extensions", "Knee Extensions", "Seated active terminal knee extension with isometric hold at terminal zero degrees.", 0.0, 90.0, 10, 4),
        ]
        created_exercises = {}
        for code, name, desc, min_a, max_a, reps, sets in exercises_list:
            ex, _ = ExerciseDefinition.objects.get_or_create(
                code=code,
                defaults={
                    "name": name,
                    "description": desc,
                    "target_angle_min_deg": min_a,
                    "target_angle_max_deg": max_a,
                    "default_repetitions": reps,
                    "default_sets": sets,
                    "rest_interval_seconds": 60,
                }
            )
            created_exercises[code] = ex

        # 6. Sarah's Plan Version 2 (Create as Draft first, attach exercises, then publish)
        # Clear any prior uncompleted plan version 2 for clean idempotency
        PlanVersion.objects.filter(patient=sarah_user, version_number=2).delete()

        plan_v2 = PlanVersion.objects.create(
            patient=sarah_user,
            version_number=2,
            authored_by=doctor_user,
            status=PlanVersion.Status.DRAFT,
            clinical_notes=(
                "Week 4 progression: Target active flexion increased from 90° to 105°. "
                "Insole weight-bearing threshold adjusted to 50kg. Continue 3 sets daily."
            ),
        )

        for order, (code, ex) in enumerate(created_exercises.items()):
            ExercisePrescription.objects.create(
                plan_version=plan_v2,
                exercise=ex,
                target_repetitions=ex.default_repetitions,
                target_sets=ex.default_sets,
                target_flexion_deg=ex.target_angle_max_deg,
                target_extension_deg=ex.target_angle_min_deg,
                order=order,
                notes="Maintain steady tempo. Do not force past onset of acute pain.",
            )

        plan_v2.publish()

        # 7. Completed Sessions
        sessions_seed = [
            ("Active Knee Flexion", 10, 10, 10, 98.4, 4.2, 1200, timedelta(hours=3), True, "Excellent cadence and smooth flexion trapezoid curve. No abnormal patellar tracking."),
            ("Patella Slide (Extension)", 12, 12, 11, 8.5, 0.5, 960, timedelta(days=1), True, "Full terminal extension verified. Jitter < 0.8%."),
            ("Hamstring Curls", 10, 10, 9, 94.0, 14.5, 1100, timedelta(days=2), True, "Good co-contraction on sEMG Vastus Medialis."),
            ("Straight Leg Raises", 10, 10, 10, 42.0, 0.0, 900, timedelta(days=3), False, ""),
        ]

        for ex_name, t_reps, p_reps, s_reps, max_f, max_e, dur, delta, rev, notes in sessions_seed:
            s_time = timezone.now() - delta
            session, _ = Session.objects.get_or_create(
                patient=sarah_user,
                exercise_name=ex_name,
                started_at=s_time,
                defaults={
                    "device": device,
                    "plan_version": plan_v2,
                    "ended_at": s_time + timedelta(seconds=dur),
                    "duration_seconds": dur,
                    "status": Session.Status.COMPLETED,
                    "target_reps": t_reps,
                    "patient_reported_reps": p_reps,
                    "sensor_estimated_reps": s_reps,
                    "max_flexion_deg": max_f,
                    "max_extension_deg": max_e,
                    "doctor_reviewed": rev,
                    "doctor_reviewed_at": (s_time + timedelta(hours=1)) if rev else None,
                    "doctor_review_notes": notes,
                }
            )
            if rev and notes:
                ReviewNote.objects.get_or_create(
                    session=session,
                    clinician=doctor_user,
                    defaults={"content": notes, "reviewed_at": s_time + timedelta(hours=1)}
                )

        # 8. Audit Log
        AuditLogEntry.objects.create(
            actor=doctor_user,
            actor_name=doctor_user.full_name,
            actor_role=doctor_user.role,
            action="PLAN_PUBLISHED",
            target_type="plan_version",
            target_id=str(plan_v2.id),
            details="Published Plan Version 2 (Target: 105° Flexion) for patient Sarah Connor.",
            severity="info",
        )

        self.stdout.write(self.style.SUCCESS("OrthoSense Clinical Seed Data successfully created!"))
        self.stdout.write("  - Administrator: admin@orthosense.health (pass: admin12345)")
        self.stdout.write("  - Clinician: dr.smith@orthosense.health (pass: doctor12345)")
        self.stdout.write("  - Patient: sarah.connor@orthosense.health (pass: patient12345)")
        self.stdout.write(f"  - Device: {device.device_identifier} (Bearer: {raw_demo_token})")
