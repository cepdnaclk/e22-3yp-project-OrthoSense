import type { PatientDto, ExerciseDto, PrescriptionInput, PlanDto, SessionDto, DeviceDto, AuditDto, AlertDto, HealthDto } from "./api-contract";
import { apiClient, setCsrfToken } from "./api-client";
import type { ApiAuthSession, ApiUser } from "./auth-contract";
import { normalizeRole } from "./auth-contract";
import {
  User,
  Device,
  ExerciseDefinition,
  ExercisePlan,
  ExerciseSession,
  AuditLogEntry,
  TelemetryPoint,
} from "@/lib/types";

// ==========================================
// 1. AUTH & IDENTITY API
// ==========================================
export const authApi = {
  login: async (email: string, password: string): Promise<ApiAuthSession> => {
    const session = await apiClient.post<ApiAuthSession>("/auth/login/", { email, password });
    setCsrfToken(session.csrfToken);
    return session;
  },

  logout: async (): Promise<void> => {
    await apiClient.post("/auth/logout/");
  },

  me: async (): Promise<ApiUser> => {
    return apiClient.get<ApiUser>("/auth/me/");
  },
};

// ==========================================
// 2. PATIENTS API
// ==========================================
export interface PaginatedResponse<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}

async function allPages<T>(endpoint: string): Promise<T[]> {
  const rows: T[] = [];
  const visited = new Set<string>();
  let next: string | null = endpoint;
  while (next) {
    if (visited.has(next)) throw new Error("The API returned a pagination loop.");
    visited.add(next);
    const page: PaginatedResponse<T> | T[] = await apiClient.get(next);
    if (Array.isArray(page)) return rows.concat(page);
    rows.push(...page.results);
    next = page.next;
  }
  return rows;
}

export const patientsApi = {
  getAll: async (): Promise<User[]> => {
    const list = await allPages<PatientDto>("/patients/");
    return list.map((p) => ({
      id: p.id,
      email: p.email,
      username: p.username || p.email,
      fullName: p.full_name || p.email,
      role: normalizeRole(p.role),
      department: p.department || p.patient_profile?.diagnosis || "",
      assignedDoctorId: p.assigned_doctor?.id,
      assignedDoctorName: p.assigned_doctor?.fullName,
      assignedDeviceId: p.assigned_device?.id,
      isActive: p.is_active ?? true,
      createdAt: p.created_at,
    }));
  },

  getById: async (id: string): Promise<User> => {
    const p = await apiClient.get<PatientDto>(`/patients/${id}/`);
    return {
      id: p.id,
      email: p.email,
      username: p.username || p.email,
      fullName: p.full_name || p.email,
      role: normalizeRole(p.role),
      department: p.department || p.patient_profile?.diagnosis || "",
      assignedDoctorId: p.assigned_doctor?.id,
      assignedDoctorName: p.assigned_doctor?.fullName,
      assignedDeviceId: p.assigned_device?.id,
      isActive: p.is_active ?? true,
      createdAt: p.created_at,
    };
  },
};

// ==========================================
// 3. EXERCISE PLANS API
// ==========================================
export const plansApi = {
  getMyPlan: async (patientId?: string): Promise<ExercisePlan> => {
    const endpoint = patientId ? `/my-plan/?patient_id=${patientId}` : "/my-plan/";
    const p = await apiClient.get<PlanDto>(endpoint);
    return {
      id: p.id,
      patientId: p.patient,
      patientName: p.patient_name,
      doctorId: p.authored_by,
      doctorName: p.doctor_name,
      version: p.version_number,
      state: ({ DRAFT: "Draft", PUBLISHED: "Published", ARCHIVED: "Archived" } as const)[p.status],
      createdAt: p.created_at,
      publishedAt: p.published_at ?? undefined,
      clinicalNotes: p.clinical_notes,
      items: (p.prescriptions || []).map((rx) => ({
        id: rx.id,
        exerciseId: rx.exercise?.id,
        exerciseName: rx.exercise?.name,
        targetReps: rx.target_repetitions,
        targetSets: rx.target_sets,
        targetFlexionDeg: rx.target_flexion_deg,
        targetExtensionDeg: rx.target_extension_deg,
        restIntervalSeconds: rx.rest_interval_seconds,
        instructions: rx.notes || rx.exercise?.description || "",
      })),
    };
  },

  getAll: async (): Promise<ExercisePlan[]> => {
    const list = await allPages<PlanDto>("/plans/");
    return list.map((p) => ({
      id: p.id,
      patientId: p.patient,
      patientName: p.patient_name,
      doctorId: p.authored_by,
      doctorName: p.doctor_name,
      version: p.version_number,
      state: ({ DRAFT: "Draft", PUBLISHED: "Published", ARCHIVED: "Archived" } as const)[p.status],
      createdAt: p.created_at,
      publishedAt: p.published_at ?? undefined,
      clinicalNotes: p.clinical_notes,
      items: (p.prescriptions || []).map((rx) => ({
        id: rx.id,
        exerciseId: rx.exercise?.id,
        exerciseName: rx.exercise?.name,
        targetReps: rx.target_repetitions,
        targetSets: rx.target_sets,
        targetFlexionDeg: rx.target_flexion_deg,
        targetExtensionDeg: rx.target_extension_deg,
        restIntervalSeconds: rx.rest_interval_seconds,
        instructions: rx.notes || rx.exercise?.description || "",
      })),
    }));
  },

  create: async (data: { patient: string; clinical_notes?: string; items?: PrescriptionInput[] }): Promise<PlanDto> => {
    return apiClient.post("/plans/", data);
  },

  publish: async (id: string): Promise<PlanDto> => {
    return apiClient.post(`/plans/${id}/publish/`);
  },
};

// ==========================================
// 4. EXERCISES CATALOG API
// ==========================================
export const exercisesApi = {
  getAll: async (): Promise<ExerciseDefinition[]> => {
    const list = await allPages<ExerciseDto>("/exercises/");
    return list.map((e) => ({
      id: e.id,
      name: e.name,
      targetJoint: e.target_joint,
      description: e.description,
      targetAngleMinDeg: e.target_angle_min_deg,
      targetAngleMaxDeg: e.target_angle_max_deg,
      defaultRepetitions: e.default_repetitions,
      restIntervalSeconds: e.rest_interval_seconds,
    }));
  },
};

// ==========================================
// 5. SESSIONS & TELEMETRY API
// ==========================================
export const sessionsApi = {
  getAll: async (): Promise<ExerciseSession[]> => {
    const list = await allPages<SessionDto>("/sessions/");
    return list.map((s) => ({
      id: s.id,
      patientId: s.patient_id,
      patientName: s.patient_name,
      planId: s.plan_version,
      planVersion: s.plan_version_number ?? null,
      exerciseName: s.exercise_name,
      startedAt: s.started_at,
      endedAt: s.ended_at ?? undefined,
      durationSeconds: s.duration_seconds,
      targetReps: s.target_reps,
      patientReportedReps: s.patient_reported_reps,
      sensorEstimatedReps: s.sensor_estimated_reps,
      maxFlexionDeg: s.max_flexion_deg,
      maxExtensionDeg: s.max_extension_deg,
      status: s.status,
      qualityFlag: s.quality_flag,
      doctorReviewed: s.doctor_reviewed,
      doctorReviewedAt: s.doctor_reviewed_at ?? undefined,
      reviewNotes: s.doctor_review_notes,
    }));
  },

  getById: async (id: string): Promise<ExerciseSession> => {
    const s = await apiClient.get<SessionDto>(`/sessions/${id}/`);
    return {
      id: s.id,
      patientId: s.patient_id,
      patientName: s.patient_name,
      planId: s.plan_version,
      planVersion: s.plan_version_number ?? null,
      exerciseName: s.exercise_name,
      startedAt: s.started_at,
      endedAt: s.ended_at ?? undefined,
      durationSeconds: s.duration_seconds,
      targetReps: s.target_reps,
      patientReportedReps: s.patient_reported_reps,
      sensorEstimatedReps: s.sensor_estimated_reps,
      maxFlexionDeg: s.max_flexion_deg,
      maxExtensionDeg: s.max_extension_deg,
      status: s.status,
      qualityFlag: s.quality_flag,
      doctorReviewed: s.doctor_reviewed,
      doctorReviewedAt: s.doctor_reviewed_at ?? undefined,
      reviewNotes: s.doctor_review_notes,
    };
  },

  review: async (id: string, notes: string): Promise<SessionDto> => {
    return apiClient.post(`/sessions/${id}/review/`, { notes });
  },

  getTelemetry: async (id: string, maxPoints = 500): Promise<TelemetryPoint[]> => {
    return apiClient.get<TelemetryPoint[]>(`/sessions/${id}/telemetry/?max_points=${maxPoints}`);
  },

  create: async (data: Partial<ExerciseSession>): Promise<ExerciseSession> => {
    const saved = await apiClient.post<{ id: string }>("/sessions/", {
      exercise_name: data.exerciseName,
      patient_reported_reps: data.patientReportedReps,
      status: data.status,
    });
    return sessionsApi.getById(saved.id);
  },
};

// ==========================================
// 6. DEVICES & HARDWARE API
// ==========================================
function channelHealth(device: DeviceDto, type: string): import("@/lib/types").SensorHealthStatus {
  const channels = device.sensor_channels.filter(channel => channel.sensor_type === type);
  if (!channels.length || !device.last_seen_at || Date.now() - Date.parse(device.last_seen_at) > 90000) return "unverified";
  const health = channels.map(channel => channel.health_status.toLowerCase());
  for (const state of ["invalid", "rail", "stale", "degraded", "unverified", "healthy"] as const) if (health.includes(state)) return state;
  return "unverified";
}

export const devicesApi = {
  getAll: async (): Promise<Device[]> => {
    const list = await allPages<DeviceDto>("/devices/");
    return list.map((d) => ({
      id: d.id,
      macAddress: d.mac_address,
      serialNumber: d.device_identifier,
      firmwareVersion: d.firmware_version,
      status: d.status === "ACTIVE" ? "unknown" : d.status === "REVOKED" ? "revoked" : d.status === "MAINTENANCE" ? "maintenance" : "unpaired",
      enrollmentStatus: d.status,
      batteryPercent: d.battery_percent,
      assignedPatientId: d.assigned_patient?.id,
      assignedPatientName: d.assigned_patient?.fullName,
      lastSeenAt: d.last_seen_at,
      sensorHealth: {
        imuThigh: channelHealth(d, "IMU_THIGH"),
        imuShank: channelHealth(d, "IMU_SHANK"),
        fsrFoot: channelHealth(d, "FSR_INSOLE"),
        tempSensor: channelHealth(d, "NTC_TEMP"),
      },
    }));
  },

  create: async (data: { device_identifier: string; mac_address: string; hardware_revision?: string; firmware_version?: string; assigned_patient_id?: string }): Promise<DeviceDto & { hardwareBearerToken: string }> => {
    return apiClient.post("/devices/", data);
  },

  revoke: async (id: string): Promise<{ status: string }> => {
    return apiClient.post(`/devices/${id}/revoke/`);
  },

  ping: async (id: string): Promise<{ status: string; device_id: string; last_seen_at: string | null }> => {
    return apiClient.post(`/devices/${id}/ping/`);
  },

  getAlerts: (): Promise<AlertDto[]> => allPages<AlertDto>("/alerts/"),
};

// ==========================================
// 7. AUDIT LOG & HEALTH API
// ==========================================
export const auditApi = {
  getAll: async (): Promise<AuditLogEntry[]> => {
    const list = await allPages<AuditDto>("/audit-log/");
    return list.map((a) => ({
      id: a.id,
      timestamp: a.timestamp,
      actorId: a.actor_id || "system",
      actorName: a.actorName || "Automated System",
      actorRole: ["ADMIN", "CLINICIAN", "PATIENT"].includes(a.actorRole) ? normalizeRole(a.actorRole) : "system",
      action: a.action,
      details: a.details,
      severity: a.severity || "info",
    }));
  },
};

export const healthApi = {
  getHealth: async (): Promise<HealthDto> => {
    return apiClient.get("/health/");
  },
};
