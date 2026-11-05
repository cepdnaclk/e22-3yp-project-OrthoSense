import { apiClient } from "./api-client";
import {
  User,
  AuthSession,
  UserRole,
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
  login: async (email: string, password = "", role?: UserRole): Promise<AuthSession> => {
    return apiClient.post<AuthSession>("/auth/login/", { email, password, role });
  },

  logout: async (): Promise<void> => {
    await apiClient.post("/auth/logout/");
  },

  me: async (): Promise<User> => {
    return apiClient.get<User>("/auth/me/");
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

export const patientsApi = {
  getAll: async (): Promise<User[]> => {
    const res = await apiClient.get<PaginatedResponse<any> | any[]>("/patients/");
    const list = Array.isArray(res) ? res : res.results || [];
    return list.map((p) => ({
      id: p.id,
      email: p.email,
      username: p.username,
      fullName: p.full_name || p.fullName || p.email,
      role: (p.role?.toLowerCase() as UserRole) || "patient",
      department: p.department || p.patient_profile?.diagnosis || "Post-Op ACL Reconstruction",
      assignedDoctorId: p.assigned_doctor?.id,
      assignedDoctorName: p.assigned_doctor?.fullName,
      assignedDeviceId: p.assigned_device?.identifier,
      isActive: p.is_active ?? true,
      createdAt: p.created_at,
    }));
  },

  getById: async (id: string): Promise<User> => {
    const p = await apiClient.get<any>(`/patients/${id}/`);
    return {
      id: p.id,
      email: p.email,
      username: p.username,
      fullName: p.full_name || p.fullName || p.email,
      role: (p.role?.toLowerCase() as UserRole) || "patient",
      department: p.department || p.patient_profile?.diagnosis || "Post-Op ACL Reconstruction",
      assignedDoctorId: p.assigned_doctor?.id,
      assignedDoctorName: p.assigned_doctor?.fullName,
      assignedDeviceId: p.assigned_device?.identifier,
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
    const p = await apiClient.get<any>(endpoint);
    return {
      id: p.id,
      patientId: p.patient,
      patientName: p.patient_name,
      doctorId: p.authored_by,
      doctorName: p.doctor_name,
      version: p.version_number,
      state: (p.status?.charAt(0).toUpperCase() + p.status?.slice(1).toLowerCase()) as any,
      createdAt: p.created_at,
      publishedAt: p.published_at,
      clinicalNotes: p.clinical_notes,
      items: (p.prescriptions || []).map((rx: any) => ({
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
    const res = await apiClient.get<PaginatedResponse<any> | any[]>("/plans/");
    const list = Array.isArray(res) ? res : res.results || [];
    return list.map((p) => ({
      id: p.id,
      patientId: p.patient,
      patientName: p.patient_name,
      doctorId: p.authored_by,
      doctorName: p.doctor_name,
      version: p.version_number,
      state: (p.status?.charAt(0).toUpperCase() + p.status?.slice(1).toLowerCase()) as any,
      createdAt: p.created_at,
      publishedAt: p.published_at,
      clinicalNotes: p.clinical_notes,
      items: (p.prescriptions || []).map((rx: any) => ({
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

  create: async (data: { patient: string; clinical_notes?: string; items?: any[] }): Promise<any> => {
    return apiClient.post("/plans/", data);
  },

  publish: async (id: string): Promise<any> => {
    return apiClient.post(`/plans/${id}/publish/`);
  },
};

// ==========================================
// 4. EXERCISES CATALOG API
// ==========================================
export const exercisesApi = {
  getAll: async (): Promise<ExerciseDefinition[]> => {
    const res = await apiClient.get<PaginatedResponse<any> | any[]>("/exercises/");
    const list = Array.isArray(res) ? res : res.results || [];
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
    const res = await apiClient.get<PaginatedResponse<any> | any[]>("/sessions/");
    const list = Array.isArray(res) ? res : res.results || [];
    return list.map((s) => ({
      id: s.id,
      patientId: s.patient_id,
      patientName: s.patient_name,
      planId: s.plan_version,
      planVersion: s.plan_version_number || 2,
      exerciseName: s.exercise_name,
      startedAt: s.started_at,
      endedAt: s.ended_at,
      durationSeconds: s.duration_seconds,
      targetReps: s.target_reps,
      patientReportedReps: s.patient_reported_reps,
      sensorEstimatedReps: s.sensor_estimated_reps,
      maxFlexionDeg: s.max_flexion_deg,
      maxExtensionDeg: s.max_extension_deg,
      status: s.status,
      qualityFlag: s.quality_flag,
      doctorReviewed: s.doctor_reviewed,
      doctorReviewedAt: s.doctor_reviewed_at,
      reviewNotes: s.doctor_review_notes,
    }));
  },

  getById: async (id: string): Promise<ExerciseSession> => {
    const s = await apiClient.get<any>(`/sessions/${id}/`);
    return {
      id: s.id,
      patientId: s.patient_id,
      patientName: s.patient_name,
      planId: s.plan_version,
      planVersion: s.plan_version_number || 2,
      exerciseName: s.exercise_name,
      startedAt: s.started_at,
      endedAt: s.ended_at,
      durationSeconds: s.duration_seconds,
      targetReps: s.target_reps,
      patientReportedReps: s.patient_reported_reps,
      sensorEstimatedReps: s.sensor_estimated_reps,
      maxFlexionDeg: s.max_flexion_deg,
      maxExtensionDeg: s.max_extension_deg,
      status: s.status,
      qualityFlag: s.quality_flag,
      doctorReviewed: s.doctor_reviewed,
      doctorReviewedAt: s.doctor_reviewed_at,
      reviewNotes: s.doctor_review_notes,
    };
  },

  review: async (id: string, notes: string): Promise<any> => {
    return apiClient.post(`/sessions/${id}/review/`, { notes });
  },

  getTelemetry: async (id: string, maxPoints = 500): Promise<TelemetryPoint[]> => {
    return apiClient.get<TelemetryPoint[]>(`/sessions/${id}/telemetry/?max_points=${maxPoints}`);
  },

  create: async (data: Partial<ExerciseSession>): Promise<ExerciseSession> => {
    return apiClient.post("/sessions/", data);
  },
};

// ==========================================
// 6. DEVICES & HARDWARE API
// ==========================================
export const devicesApi = {
  getAll: async (): Promise<Device[]> => {
    const res = await apiClient.get<PaginatedResponse<any> | any[]>("/devices/");
    const list = Array.isArray(res) ? res : res.results || [];
    return list.map((d) => ({
      id: d.id,
      macAddress: d.mac_address,
      serialNumber: d.device_identifier,
      firmwareVersion: d.firmware_version,
      status: d.status.toLowerCase(),
      batteryPercent: d.battery_percent,
      assignedPatientId: d.assigned_patient?.id,
      assignedPatientName: d.assigned_patient?.fullName,
      lastSeenAt: d.last_seen_at || d.created_at,
      sensorHealth: {
        imuThigh: "healthy",
        imuShank: "healthy",
        fsrFoot: "healthy",
        tempSensor: "healthy",
      },
    }));
  },

  create: async (data: { device_identifier: string; mac_address: string; hardware_revision?: string; firmware_version?: string; assigned_patient_id?: string }): Promise<any> => {
    return apiClient.post("/devices/", data);
  },

  revoke: async (id: string): Promise<any> => {
    return apiClient.post(`/devices/${id}/revoke/`);
  },

  ping: async (id: string): Promise<any> => {
    return apiClient.post(`/devices/${id}/ping/`);
  },

  getAlerts: async (): Promise<any[]> => {
    const res = await apiClient.get<PaginatedResponse<any> | any[]>("/alerts/");
    return Array.isArray(res) ? res : res.results || [];
  },
};

// ==========================================
// 7. AUDIT LOG & HEALTH API
// ==========================================
export const auditApi = {
  getAll: async (): Promise<AuditLogEntry[]> => {
    const res = await apiClient.get<PaginatedResponse<any> | any[]>("/audit-log/");
    const list = Array.isArray(res) ? res : res.results || [];
    return list.map((a) => ({
      id: a.id,
      timestamp: a.timestamp,
      actorId: a.actor_id || "system",
      actorName: a.actorName || "Automated System",
      actorRole: (a.actorRole?.toLowerCase() as UserRole) || "admin",
      action: a.action,
      details: a.details,
      severity: a.severity || "info",
    }));
  },
};

export const healthApi = {
  getHealth: async (): Promise<any> => {
    return apiClient.get("/health/");
  },
};
