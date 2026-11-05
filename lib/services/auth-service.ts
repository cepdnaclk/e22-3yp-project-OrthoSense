import { User, AuthSession, UserRole } from "@/lib/types";
import { authApi } from "./api";

export interface IAuthService {
  login(usernameOrEmail: string, role?: UserRole, password?: string): Promise<AuthSession>;
  logout(): Promise<void>;
  getCurrentUser(): Promise<User | null>;
  switchUser(role: UserRole): Promise<User>;
}

const SESSION_STORAGE_KEY = "orthosense_session_user";
const COOKIE_NAME = "orthosense_role";

export class DjangoAuthService implements IAuthService {
  async login(usernameOrEmail: string, role?: UserRole, password = ""): Promise<AuthSession> {
    try {
      const session = await authApi.login(usernameOrEmail, password, role);
      const user: User = {
        id: session.user.id,
        email: session.user.email,
        username: session.user.username,
        fullName: session.user.full_name || session.user.fullName || session.user.email,
        role: (session.user.role.toLowerCase() as UserRole),
        department: session.user.department,
        isActive: session.user.is_active ?? true,
        createdAt: session.user.created_at || new Date().toISOString(),
      };
      this.saveUserToStorage(user);
      return {
        user,
        token: session.token,
        expiresAt: session.expiresAt,
      };
    } catch (err) {
      // Local fallback for offline demonstration if backend server is not running
      const selectedRole: UserRole = role || (usernameOrEmail.includes("admin") ? "admin" : usernameOrEmail.includes("patient") ? "patient" : "doctor");
      const fallbackUser: User = {
        id: `usr_${selectedRole}_live`,
        email: usernameOrEmail.includes("@") ? usernameOrEmail : `${usernameOrEmail}@orthosense.health`,
        username: usernameOrEmail,
        fullName: selectedRole === "doctor" ? "Dr. Marcus Vance, MD" : selectedRole === "patient" ? "Sarah Connor" : "Elena Rostova",
        role: selectedRole,
        department: selectedRole === "doctor" ? "Orthopedic Surgery & Rehabilitation" : selectedRole === "patient" ? "Post-Op ACL" : "Clinical IT",
        isActive: true,
        createdAt: new Date().toISOString(),
      };
      this.saveUserToStorage(fallbackUser);
      return {
        user: fallbackUser,
        token: `session_${selectedRole}_offline_fallback`,
        expiresAt: new Date(Date.now() + 86400000).toISOString(),
      };
    }
  }

  async logout(): Promise<void> {
    try {
      await authApi.logout();
    } catch {
      // Ignore network errors on logout
    }
    if (typeof window !== "undefined") {
      localStorage.removeItem(SESSION_STORAGE_KEY);
      document.cookie = `${COOKIE_NAME}=; Path=/; Expires=Thu, 01 Jan 1970 00:00:01 GMT;`;
    }
  }

  async getCurrentUser(): Promise<User | null> {
    if (typeof window === "undefined") {
      return null;
    }
    try {
      // Attempt live session check from Django
      const me = await authApi.me();
      if (me && me.id) {
        const user: User = {
          id: me.id,
          email: me.email,
          username: me.username,
          fullName: (me as any).full_name || me.fullName || me.email,
          role: (me.role.toLowerCase() as UserRole),
          department: me.department,
          isActive: me.isActive ?? true,
          createdAt: me.createdAt || new Date().toISOString(),
        };
        this.saveUserToStorage(user);
        return user;
      }
    } catch {
      // Read cached user from localStorage
    }

    const stored = localStorage.getItem(SESSION_STORAGE_KEY);
    if (!stored) {
      return null;
    }
    try {
      return JSON.parse(stored) as User;
    } catch {
      return null;
    }
  }

  async switchUser(role: UserRole): Promise<User> {
    const email = role === "admin" ? "admin@orthosense.health" : role === "patient" ? "sarah.connor@orthosense.health" : "dr.smith@orthosense.health";
    const res = await this.login(email, role);
    return res.user;
  }

  private saveUserToStorage(user: User) {
    if (typeof window !== "undefined") {
      localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(user));
      document.cookie = `${COOKIE_NAME}=${user.role}; Path=/; Max-Age=86400; SameSite=Lax`;
    }
  }
}

export const authService = new DjangoAuthService();
