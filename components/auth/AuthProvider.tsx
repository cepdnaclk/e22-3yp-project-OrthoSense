"use client";

import * as React from "react";
import type { User } from "@/lib/types";
import { authService } from "@/lib/services/auth-service";

type AuthStatus = "loading" | "authenticated" | "unauthenticated" | "error";
interface AuthContextValue {
  user: User | null;
  status: AuthStatus;
  error: string | null;
  refresh: () => Promise<void>;
  login: (email: string, password: string) => Promise<User>;
  logout: () => Promise<void>;
}

const AuthContext = React.createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = React.useState<User | null>(null);
  const [status, setStatus] = React.useState<AuthStatus>("loading");
  const [error, setError] = React.useState<string | null>(null);
  const generation = React.useRef(0);

  const refresh = React.useCallback(() => {
    const current = ++generation.current;
    return authService.getCurrentUser().then((identity) => {
      if (current !== generation.current) return;
      setUser(identity);
      setError(null);
      setStatus(identity ? "authenticated" : "unauthenticated");
    }, () => {
      if (current !== generation.current) return;
      setUser(null);
      setStatus("error");
      setError("Unable to verify your session. Check the backend connection and retry.");
    });
  }, []);

  React.useEffect(() => {
    const invalidate = () => {
      ++generation.current;
      setUser(null);
      setError(null);
      setStatus("unauthenticated");
    };
    const recheck = () => { void refresh(); };
    window.addEventListener("orthosense:session-expired", invalidate);
    window.addEventListener("focus", recheck);
    void refresh();
    return () => {
      ++generation.current;
      window.removeEventListener("orthosense:session-expired", invalidate);
      window.removeEventListener("focus", recheck);
    };
  }, [refresh]);

  const login = async (email: string, password: string) => {
    ++generation.current;
    const session = await authService.login(email, password);
    setUser(session.user);
    setError(null);
    setStatus("authenticated");
    return session.user;
  };

  const logout = async () => {
    await authService.logout();
    ++generation.current;
    setUser(null);
    setStatus("unauthenticated");
  };

  return <AuthContext.Provider value={{ user, status, error, refresh, login, logout }}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = React.useContext(AuthContext);
  if (!context) throw new Error("useAuth requires an AuthProvider.");
  return context;
}
