"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { useAuth } from "@/components/auth/AuthProvider";
import { ROLE_HOME } from "@/lib/services/auth-contract";
import { ApiError } from "@/lib/services/api-client";
import { Radio } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const { login, user, status } = useAuth();
  React.useEffect(() => {
    if (status === "authenticated" && user) router.replace(ROLE_HOME[user.role]);
  }, [user, status, router]);
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState("");

  const handleLogin = async () => {
    setLoading(true);
    setError("");
    try {
      const user = await login(email.trim(), password);
      router.replace(ROLE_HOME[user.role]);
    } catch (error) {
      setError(error instanceof ApiError ? error.message : "Unable to sign in. Check the backend connection and retry.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col lg:grid lg:grid-cols-12 overflow-hidden">
      {/* ========================================================= */}
      {/* LEFT COLUMN: HERO SMART BRACE VISUAL (7 Columns on LG)    */}
      {/* ========================================================= */}
      <div className="lg:col-span-7 xl:col-span-7 relative hidden lg:flex flex-col justify-between p-10 bg-slate-900 overflow-hidden select-none">
        {/* Background Image Layer */}
        <div className="absolute inset-0 z-0 pointer-events-none">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/images/login-hero-brace.jpg"
            alt="OrthoSense Smart Knee Brace Telemetry in Rehabilitation"
            className="w-full h-full object-cover object-center filter brightness-[0.9] contrast-[1.15]"
          />
          {/* Multi-stage Clinical Green Gradient Overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-[#022D28] via-[#035E54]/55 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-r from-black/50 via-transparent to-[#022D28]/40" />
        </div>

        {/* Top Header Over Image */}
        <div className="relative z-10 flex items-center justify-between">
          <div className="flex items-center gap-3">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/images/orthosense-logo.png"
              alt="OrthoSense Logo"
              className="h-11 w-auto object-contain drop-shadow-[0_2px_8px_rgba(0,0,0,0.8)]"
            />
          </div>

          <span className="px-3 py-1 rounded-full text-[11px] font-semibold bg-white/20 backdrop-blur-md text-white border border-white/30 shadow-md">
            Research Prototype
          </span>
        </div>

        {/* Floating Telemetry Metric Badges */}
        <div className="relative z-10 my-auto py-8">
          <div className="max-w-md p-4 rounded-2xl bg-black/40 backdrop-blur-md border border-white/25 shadow-2xl space-y-3">
            <div className="flex items-center justify-between border-b border-white/20 pb-2.5">
              <div className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse"></span>
                <span className="text-xs font-bold text-white uppercase tracking-wider">
                  Live Sensor Stream
                </span>
              </div>
              <span className="text-[11px] font-mono text-teal-200">ESP32-S3 BLE</span>
            </div>

            <div className="grid grid-cols-3 gap-2 text-center">
              <div className="bg-white/10 rounded-lg p-2 border border-white/10">
                <span className="text-[10px] text-slate-300 block uppercase">Flexion</span>
                <span className="text-base font-extrabold text-white font-mono">98.4°</span>
              </div>
              <div className="bg-white/10 rounded-lg p-2 border border-white/10">
                <span className="text-[10px] text-slate-300 block uppercase">Load Heel</span>
                <span className="text-base font-extrabold text-teal-300 font-mono">68%</span>
              </div>
              <div className="bg-white/10 rounded-lg p-2 border border-white/10">
                <span className="text-[10px] text-slate-300 block uppercase">EMG VMO</span>
                <span className="text-base font-extrabold text-emerald-300 font-mono">85%</span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Hero Caption */}
        <div className="relative z-10 space-y-2 text-white max-w-xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/15 backdrop-blur-md border border-white/30 text-xs text-teal-100 font-semibold shadow-sm">
            <Radio className="h-3.5 w-3.5 text-emerald-300" />
            Synchronized Knee Kinematics &amp; FSR Sensor Telemetry
          </div>
          <h2 className="text-2xl font-black text-white drop-shadow-[0_2px_8px_rgba(0,0,0,0.8)] [text-shadow:_0_2px_12px_rgba(255,255,255,0.3)]">
            Continuous Orthopedic Rehabilitation Precision
          </h2>
          <p className="text-xs text-teal-100 leading-relaxed drop-shadow-[0_1px_3px_rgba(0,0,0,0.8)]">
            Connecting clinicians and patients through real-time IMU joint kinematics, prescriptive exercise plans, and hardware telemetry tracking.
          </p>
        </div>
      </div>

      {/* ========================================================= */}
      {/* RIGHT COLUMN: LOGIN CREDENTIALS & ROLE GATEWAY (5 Cols)   */}
      {/* ========================================================= */}
      <div className="lg:col-span-5 xl:col-span-5 flex flex-col justify-center px-6 sm:px-12 py-10 bg-white min-h-screen">
        <div className="w-full max-w-md mx-auto space-y-6">
          {/* Mobile Top Brand Header (Shown when left hero is hidden) */}
          <div className="lg:hidden text-center space-y-2 pb-2">
            <div className="relative h-36 rounded-2xl overflow-hidden mb-4 shadow-md border border-slate-200">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/images/login-hero-brace.jpg"
                alt="Smart Knee Brace"
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#035E54] via-[#035E54]/70 to-transparent" />
              <div className="absolute bottom-3 left-4 text-left text-white">
                <span className="font-extrabold text-base block">OrthoSense</span>
                <span className="text-[11px] text-teal-200">Clinical Telemetry Portal</span>
              </div>
            </div>
          </div>

          {/* Form Header */}
          <div className="space-y-3">
            <div className="inline-block bg-[#2E3A42] rounded-xl px-3.5 py-2 border border-slate-700/50 shadow-xs">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/images/orthosense-logo.png"
                alt="OrthoSense Logo"
                className="h-8 w-auto object-contain"
              />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-slate-900">
                Sign in to your account
              </h1>
              <p className="text-xs text-slate-500 mt-1">
                Access your clinical patient cohorts or rehabilitation dashboard
              </p>
            </div>
          </div>

          {/* Error Notice */}
          {error && (
            <div
              role="alert"
              className="p-3 bg-red-50 border border-red-200 text-xs text-red-700 rounded-xl"
            >
              {error}
            </div>
          )}

          {/* Form Fields */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleLogin();
            }}
            className="space-y-4"
          >
            <Input
              label="Username or Clinical Email"
              type="text"
              placeholder="e.g. dr.smith@orthosense.health"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="h-11 text-sm"
              required
            />

            <Input
              label="Password"
              type="password"
              placeholder="••••••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="h-11 text-sm"
              required
            />

            <div className="flex items-center justify-between text-xs pt-1">
              <label className="flex items-center gap-2 text-slate-600 cursor-pointer select-none">
                <input
                  type="checkbox"
                  className="rounded border-slate-300 text-[#0F766E] focus:ring-[#0F766E]"
                  defaultChecked
                />
                <span>Remember this session</span>
              </label>
              <a href="#" className="text-[#0F766E] hover:underline font-semibold">
                Forgot password?
              </a>
            </div>

            <Button
              type="submit"
              className="w-full h-11 text-sm font-bold shadow-sm"
              variant="primary"
              loading={loading}
            >
              Sign In to Portal
            </Button>
          </form>

          <p className="pt-5 border-t border-slate-200 text-xs text-slate-500 text-center">
            Sign in with your assigned account. Your workspace is determined by your account permissions.
          </p>

          {/* Legal Compliance Footer */}
          <div className="pt-2 text-center">
            <p className="text-[10px] text-slate-400 leading-relaxed">
              University Demonstration System. Non-diagnostic. Values for research &amp; telemetry monitoring only.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
