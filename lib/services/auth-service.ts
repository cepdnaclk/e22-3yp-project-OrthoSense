import { User, AuthSession, UserRole } from "@/lib/types";

export interface IAuthService {
  login(usernameOrEmail: string, role?: UserRole): Promise<AuthSession>;
  logout(): Promise<void>;
  getCurrentUser(): Promise<User | null>;
  switchUser(role: UserRole): Promise<User>;
}

const MOCK_USERS: Record<UserRole, User> = {
  admin: {
    id: "usr_admin_001",
    email: "admin@orthosense.health",
    username: "sysadmin",
    fullName: "Elena Rostova (System Admin)",
    role: "admin",
    department: "Clinical Engineering & IT",
    isActive: true,
    createdAt: "2026-01-10T09:00:00Z",
  },
  doctor: {
    id: "usr_doc_042",
    email: "dr.smith@orthosense.health",
    username: "dr_smith",
    fullName: "Dr. Marcus Vance, MD",
    role: "doctor",
    department: "Orthopedic Surgery & Rehabilitation",
    isActive: true,
    createdAt: "2026-02-15T08:30:00Z",
  },
  patient: {
    id: "usr_pat_108",
    email: "sarah.connor@orthosense.health",
    username: "sarah_c",
    fullName: "Sarah Connor (Post-Op ACL)",
    role: "patient",
    assignedDoctorId: "usr_doc_042",
    assignedDoctorName: "Dr. Marcus Vance, MD",
    assignedDeviceId: "ESP32-S3-ORTHO-092",
    isActive: true,
    createdAt: "2026-03-01T14:15:00Z",
  },
};

const SESSION_STORAGE_KEY = "orthosense_session_user";
const COOKIE_NAME = "orthosense_role";

export class MockAuthService implements IAuthService {
  async login(usernameOrEmail: string, role?: UserRole): Promise<AuthSession> {
    await new Promise((resolve) => setTimeout(resolve, 400)); // simulate network latency
    
    // Choose role by parameter, email/username substring, or default to doctor
    let selectedRole: UserRole = role || "doctor";
    const lower = usernameOrEmail.toLowerCase();
    if (lower.includes("admin")) {
      selectedRole = "admin";
    } else if (lower.includes("patient") || lower.includes("sarah")) {
      selectedRole = "patient";
    }

    const user = MOCK_USERS[selectedRole];
    this.saveUserToStorage(user);

    return {
      user,
      token: `mock_jwt_token_${user.id}_${Date.now()}`,
      expiresAt: new Date(Date.now() + 86400000).toISOString(),
    };
  }

  async logout(): Promise<void> {
    await new Promise((resolve) => setTimeout(resolve, 200));
    if (typeof window !== "undefined") {
      localStorage.removeItem(SESSION_STORAGE_KEY);
      document.cookie = `${COOKIE_NAME}=; Path=/; Expires=Thu, 01 Jan 1970 00:00:01 GMT;`;
    }
  }

  async getCurrentUser(): Promise<User | null> {
    if (typeof window === "undefined") {
      return null;
    }
    const stored = localStorage.getItem(SESSION_STORAGE_KEY);
    if (!stored) {
      // Default initial mock user for seamless demonstration
      return MOCK_USERS.doctor;
    }
    try {
      return JSON.parse(stored) as User;
    } catch {
      return MOCK_USERS.doctor;
    }
  }

  async switchUser(role: UserRole): Promise<User> {
    const user = MOCK_USERS[role];
    this.saveUserToStorage(user);
    return user;
  }

  private saveUserToStorage(user: User) {
    if (typeof window !== "undefined") {
      localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(user));
      document.cookie = `${COOKIE_NAME}=${user.role}; Path=/; Max-Age=86400; SameSite=Lax`;
    }
  }
}

export const authService = new MockAuthService();

