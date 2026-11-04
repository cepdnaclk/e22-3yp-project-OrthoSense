export type UserRole = "admin" | "doctor" | "patient";

export interface User {
  id: string;
  email: string;
  username: string;
  fullName: string;
  role: UserRole;
  department?: string;
  assignedDoctorId?: string;
  assignedDoctorName?: string;
  assignedDeviceId?: string;
  isActive: boolean;
  createdAt: string;
}

export interface AuthSession {
  user: User;
  token: string;
  expiresAt: string;
}

export type SensorHealthStatus = 
  | "healthy" 
  | "degraded" 
  | "stale" 
  | "invalid" 
  | "rail" 
  | "unverified";

export type ChannelHealth = "READ_OK" | "STALE" | "NO_RESPONSE" | "RAIL_ERROR";

export type DeviceStatus = "online" | "offline" | "unpaired" | "maintenance";

export interface Device {
  id: string;
  macAddress: string;
  serialNumber: string;
  firmwareVersion: string;
  status: DeviceStatus;
  batteryPercent: number;
  assignedPatientId?: string;
  assignedPatientName?: string;
  lastSeenAt: string;
  token?: string;
  sensorHealth: {
    imuThigh: SensorHealthStatus;
    imuShank: SensorHealthStatus;
    fsrFoot: SensorHealthStatus;
    tempSensor: SensorHealthStatus;
  };
}

export interface ExerciseDefinition {
  id: string;
  name: string;
  targetJoint: string;
  description: string;
  targetAngleMinDeg: number;
  targetAngleMaxDeg: number;
  defaultRepetitions: number;
  restIntervalSeconds: number;
}

export type PlanState = "Draft" | "Published" | "Revised" | "Archived";

export interface ExercisePlanItem {
  id: string;
  exerciseId: string;
  exerciseName: string;
  targetReps: number;
  targetSets: number;
  targetFlexionDeg: number;
  targetExtensionDeg: number;
  restIntervalSeconds: number;
  instructions: string;
}

export interface ExercisePlan {
  id: string;
  patientId: string;
  patientName: string;
  doctorId: string;
  doctorName: string;
  version: number;
  state: PlanState;
  createdAt: string;
  publishedAt?: string;
  items: ExercisePlanItem[];
  clinicalNotes?: string;
}

export interface TelemetryPoint {
  timestampMs: number;
  kneeAngleDeg: number | null;
  fsrHeelRaw: number | null;
  fsrToeRaw: number | null;
  skinTemperatureC: number | null;
  channelHealth: {
    angle: ChannelHealth;
    fsr: ChannelHealth;
    temp: ChannelHealth;
  };
}

export interface ExerciseSession {
  id: string;
  patientId: string;
  patientName: string;
  planId: string;
  planVersion: number;
  exerciseName: string;
  startedAt: string;
  endedAt?: string;
  durationSeconds: number;
  targetReps: number;
  patientReportedReps: number;
  sensorEstimatedReps: number;
  maxFlexionDeg: number;
  maxExtensionDeg: number;
  status: "completed" | "in_progress" | "abandoned";
  qualityFlag: "good" | "degraded" | "incomplete";
  reviewNotes?: string;
  doctorReviewed?: boolean;
  doctorReviewedAt?: string;
  telemetrySample?: TelemetryPoint[];
}

export interface AuditLogEntry {
  id: string;
  timestamp: string;
  actorId: string;
  actorName: string;
  actorRole: UserRole;
  action: string;
  details: string;
  severity: "info" | "warning" | "critical";
}

