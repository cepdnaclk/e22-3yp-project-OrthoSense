/**
 * OrthoSense Telemetry API Client
 * Manages communication with the Node.js backend.
 */

export interface IMUData {
  ax: number;
  ay: number;
  az: number;
  gx: number;
  gy: number;
  gz: number;
}

export interface TelemetryAlert {
  type: string;
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  message: string;
  timestamp: number;
}

export interface TelemetryPacket {
  deviceId: string;
  timestamp: number;
  flexionAngle: number;
  pressureKPa: number;
  imu: IMUData;
  predictedState: string;
  batteryLevel: number;
  alerts?: TelemetryAlert[];
}

export interface SessionStats {
  sampleCount: number;
  peakFlexionAngle: number;
  minFlexionAngle: number;
  avgFlexionAngle: number;
  avgPressureKPa: number;
  totalAlerts: number;
}

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

export async function fetchLatestTelemetry(): Promise<TelemetryPacket> {
  const res = await fetch(`${API_BASE_URL}/telemetry/latest`);
  if (!res.ok) {
    throw new Error(`Failed to fetch latest telemetry: ${res.statusText}`);
  }
  const json = await res.json();
  return json.data;
}

export async function fetchTelemetryHistory(limit = 30): Promise<TelemetryPacket[]> {
  const res = await fetch(`${API_BASE_URL}/telemetry/history?limit=${limit}`);
  if (!res.ok) {
    throw new Error(`Failed to fetch telemetry history: ${res.statusText}`);
  }
  const json = await res.json();
  return json.data;
}

export async function fetchSessionStats(): Promise<SessionStats> {
  const res = await fetch(`${API_BASE_URL}/telemetry/stats`);
  if (!res.ok) {
    throw new Error(`Failed to fetch session stats: ${res.statusText}`);
  }
  const json = await res.json();
  return json.data;
}
