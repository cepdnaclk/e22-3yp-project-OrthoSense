import type { User, UserRole } from "@/lib/types";

export interface ApiUser {
  id: string;
  email: string;
  username: string | null;
  full_name: string;
  role: string;
  department: string;
  is_active: boolean;
  created_at: string;
  patient_profile?: {
    date_of_birth: string | null; diagnosis: string; surgical_protocol: string; surgery_date: string | null;
    recovery_week: number; target_rom_flexion: number; target_rom_extension: number;
    emergency_contact_name: string; emergency_contact_phone: string; haptic_alerts_enabled: boolean;
  } | null;
  assigned_doctor?: { id: string; fullName: string } | null;
  assigned_device?: { id: string; identifier: string } | null;
}

export interface ApiAuthSession {
  user: ApiUser;
  csrfToken: string;
  expiresAt: string;
}

export function normalizeRole(role: string): UserRole {
  switch (role) {
    case "ADMIN": return "admin";
    case "CLINICIAN": return "doctor";
    case "PATIENT": return "patient";
    default: throw new Error("The server returned an unsupported account role.");
  }
}

export function mapAuthUser(user: ApiUser): User {
  if (!user.is_active) throw new Error("This account is inactive.");
  return {
    id: user.id,
    email: user.email,
    username: user.username || user.email,
    fullName: user.full_name || user.email,
    role: normalizeRole(user.role),
    department: user.department,
    isActive: user.is_active,
    createdAt: user.created_at,
    assignedDoctorId: user.assigned_doctor?.id,
    assignedDoctorName: user.assigned_doctor?.fullName,
    assignedDeviceId: user.assigned_device?.id,
  };
}

export const ROLE_HOME: Record<UserRole, string> = {
  admin: "/admin/users", doctor: "/doctor/dashboard", patient: "/patient/dashboard",
};
