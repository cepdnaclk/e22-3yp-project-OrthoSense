import type { ApiUser } from "./auth-contract";
import type { ExerciseSession, AuditLogEntry } from "@/lib/types";
export type PatientDto = ApiUser;
export interface ExerciseDto { id: string; name: string; target_joint: string; description: string; target_angle_min_deg: number; target_angle_max_deg: number; default_repetitions: number; default_sets: number; rest_interval_seconds: number; video_url: string; thumbnail_url: string; }
export interface PrescriptionInput { exercise_id: string; target_repetitions?: number; target_sets?: number; target_flexion_deg?: number; target_extension_deg?: number; rest_interval_seconds?: number; order?: number; notes?: string; }
export interface PrescriptionDto { id: string; exercise: ExerciseDto; target_repetitions: number; target_sets: number; target_flexion_deg: number; target_extension_deg: number; rest_interval_seconds: number; notes: string; }
export interface PlanDto { schedule?: {exercise_id:string;scheduled_at:string}[]; id: string; patient: string; patient_name: string; authored_by: string; doctor_name: string; version_number: number; status: "DRAFT" | "PUBLISHED" | "ARCHIVED"; created_at: string; published_at: string | null; clinical_notes: string; prescriptions: PrescriptionDto[]; }
export interface ReviewDto { id: string; doctor_name: string; clinician: string; content: string; reviewed_at: string; }
export interface SessionDto { prescribed_item: PrescriptionDto | null; plan_author_name: string | null; review_notes: ReviewDto[]; prescription: string | null; device: string | null; paused_at: string | null; id: string; patient_id: string; patient_name: string; plan_version: string | null; plan_version_number: number | null; exercise_name: string; started_at: string; ended_at: string | null; duration_seconds: number; target_reps: number; patient_reported_reps: number | null; sensor_estimated_reps: number | null; max_flexion_deg: number | null; max_extension_deg: number | null; status: ExerciseSession["status"]; quality_flag: ExerciseSession["qualityFlag"]; doctor_reviewed: boolean; doctor_reviewed_at: string | null; doctor_review_notes: string; }
export interface DeviceDto { connectivity?: "online" | "offline" | "unknown" | "revoked" | "maintenance" | "unpaired"; id: string; mac_address: string; device_identifier: string; firmware_version: string; status: "ACTIVE" | "REVOKED" | "MAINTENANCE" | "UNPAIRED"; battery_percent: number | null; last_seen_at: string | null; assigned_patient: { id: string; fullName: string } | null; sensor_channels: { sensor_type: string; health_status: string }[]; }
export interface AuditDto { id: string; timestamp: string; actor_id: string | null; actorName: string; actorRole: string; action: string; details: string; severity: AuditLogEntry["severity"]; }
export interface AlertDto { id: string; device_id: string; deviceIdentifier: string; code: string; message: string; severity: "INFO" | "WARNING" | "CRITICAL"; created_at: string; resolved_at: string | null; }
export interface HealthDto { status: string; version: string; uptime_seconds: number; components: Record<string, Record<string, string | number | null>>; }

export interface ClinicalFilters { patient_id?: string; date_from?: string; date_to?: string; status?: "completed" | "in_progress" | "abandoned"; reviewed?: boolean; ordering?: "started_at" | "-started_at"; page?: number; }
export interface ClinicalSummary {
  period: { date_from: string; date_to: string; timezone: string };
  patients: number; assigned_devices: number; online_devices: number; sessions: number; completed: number; pending_review: number; reviewed: number;
  adherence_percent: number | null; adherence_reason: string;
  trends: {patient_id: string; patient_name: string; exercise_id: string | null; exercise_name: string; completed_sessions: number; latest_session_id: string; flexion_change_deg: number | null; daily: {date: string; mean_max_flexion_deg: number; measured_sessions: number}[]}[];
}
