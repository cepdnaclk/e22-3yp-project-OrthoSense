import type { User, AuthSession } from "@/lib/types";
import { authApi } from "./api";
import { ApiError } from "./api-client";
import { mapAuthUser } from "./auth-contract";

export interface IAuthService {
  login(usernameOrEmail: string, password: string): Promise<AuthSession>;
  logout(): Promise<void>;
  getCurrentUser(): Promise<User | null>;
}

export function clearLegacyIdentity() {
  if (typeof window === "undefined") return;
  localStorage.removeItem("orthosense_session_user");
  document.cookie = "orthosense_role=; Path=/; Max-Age=0; SameSite=Lax";
}

export class DjangoAuthService implements IAuthService {
  async login(usernameOrEmail: string, password: string): Promise<AuthSession> {
    clearLegacyIdentity();
    const session = await authApi.login(usernameOrEmail, password);
    return { user: mapAuthUser(session.user), expiresAt: session.expiresAt };
  }

  async logout(): Promise<void> {
    await authApi.logout();
    clearLegacyIdentity();
  }

  async getCurrentUser(): Promise<User | null> {
    clearLegacyIdentity();
    try {
      return mapAuthUser(await authApi.me());
    } catch (error) {
      if (error instanceof ApiError && error.status === 401) return null;
      throw error;
    }
  }
}

export const authService = new DjangoAuthService();
