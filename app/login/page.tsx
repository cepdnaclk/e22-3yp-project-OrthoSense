"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/Card";
import { authService } from "@/lib/services/auth-service";
import { UserRole } from "@/lib/types";
import { ShieldAlert, Stethoscope, UserCircle, Cpu } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState("");

  const handleLogin = async (rolePreset?: UserRole) => {
    setLoading(true);
    setError("");
    try {
      const selected = rolePreset || (email.includes("admin") ? "admin" : email.includes("patient") ? "patient" : "doctor");
      await authService.login(email || `${selected}@orthosense.health`, selected);

      if (selected === "admin") router.push("/admin/users");
      else if (selected === "patient") router.push("/patient/dashboard");
      else router.push("/doctor/dashboard");
    } catch {
      setError("Invalid credentials or session expired.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col justify-center items-center p-4">
      <div className="w-full max-w-md space-y-6">
        {/* Brand */}
        <div className="text-center space-y-2">
          <div className="h-12 w-12 rounded-xl bg-[#0F766E] text-white font-extrabold text-xl flex items-center justify-center mx-auto shadow-md">
            OS
          </div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
            OrthoSense Portal Sign In
          </h1>
          <p className="text-xs text-slate-500">
            Secure Session Gateway & Role Separation
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Sign in to your account</CardTitle>
            <CardDescription>
              Enter your clinical staff or patient credentials
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {error && (
              <div
                role="alert"
                className="p-3 bg-red-50 border border-red-200 text-xs text-red-700 rounded-lg"
              >
                {error}
              </div>
            )}
            <Input
              label="Username or Email"
              type="text"
              placeholder="e.g. dr.smith@orthosense.health"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <Input
              label="Password"
              type="password"
              placeholder="••••••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <div className="flex items-center justify-between text-xs">
              <label className="flex items-center gap-2 text-slate-600">
                <input type="checkbox" className="rounded border-slate-300" defaultChecked />
                <span>Remember session</span>
              </label>
              <a href="#" className="text-[#0F766E] hover:underline font-medium">
                Forgot password?
              </a>
            </div>
            <Button
              className="w-full"
              variant="primary"
              loading={loading}
              onClick={() => handleLogin()}
            >
              Sign In
            </Button>

            {/* Quick Demo Logins */}
            <div className="pt-4 border-t border-slate-100 space-y-2">
              <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider text-center">
                Quick Role Sandbox Switcher
              </p>
              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => handleLogin("doctor")}
                  className="p-2 border border-slate-200 rounded-lg hover:border-teal-500 hover:bg-teal-50 transition-colors text-center text-xs text-slate-700 flex flex-col items-center gap-1"
                >
                  <Stethoscope className="h-4 w-4 text-[#0F766E]" />
                  <span className="font-semibold text-[11px]">Doctor</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleLogin("patient")}
                  className="p-2 border border-slate-200 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-colors text-center text-xs text-slate-700 flex flex-col items-center gap-1"
                >
                  <UserCircle className="h-4 w-4 text-[#1D4ED8]" />
                  <span className="font-semibold text-[11px]">Patient</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleLogin("admin")}
                  className="p-2 border border-slate-200 rounded-lg hover:border-slate-500 hover:bg-slate-100 transition-colors text-center text-xs text-slate-700 flex flex-col items-center gap-1"
                >
                  <ShieldAlert className="h-4 w-4 text-slate-700" />
                  <span className="font-semibold text-[11px]">Admin</span>
                </button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

