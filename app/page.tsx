"use client";

import * as React from "react";
import Link from "next/link";
import { AppShell } from "@/components/ui/AppShell";
import { Button } from "@/components/ui/Button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/Card";
import { StatusBadge } from "@/components/ui/StatusBadge";
import {
  Activity,
  Users,
  Shield,
  Radio,
  FileText,
  Sliders,
  ChevronRight,
  ArrowUpRight,
  CheckCircle2,
} from "lucide-react";

export default function HomePage() {
  return (
    <AppShell>
      <div className="space-y-8">
        {/* Banner */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-xs relative overflow-hidden">
          <div className="max-w-2xl space-y-3 relative z-10">
            <div className="h-12 w-fit px-3 py-1.5 rounded-xl bg-slate-900 shadow-sm border border-slate-800 flex items-center mb-1">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/images/orthosense-logo.png"
                alt="OrthoSense Logo"
                className="h-9 w-auto object-contain"
              />
            </div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-50 border border-teal-200 text-teal-800 text-xs font-semibold">
              <span className="h-2 w-2 rounded-full bg-[#0F766E] animate-pulse"></span>
              OrthoSense Continuous Rehabilitation Telemetry
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-[#0F172A] tracking-tight">
              Clinical Orthopedic Web Portal
            </h1>
            <p className="text-slate-600 text-sm sm:text-base leading-relaxed">
              Real-time multi-sensor telemetry monitoring, prescriptive exercise plan management, and edge-device hardware telemetry for orthopedic knee rehabilitation.
            </p>
            <div className="flex flex-wrap gap-3 pt-2">
              <Link href="/doctor/dashboard">
                <Button variant="primary" className="gap-2">
                  <Activity className="h-4 w-4" /> Open Clinician Workspace
                </Button>
              </Link>
              <Link href="/patient/dashboard">
                <Button variant="outline" className="gap-2">
                  <Users className="h-4 w-4" /> Open Patient Workspace
                </Button>
              </Link>
              <Link href="/design-system">
                <Button variant="ghost" className="gap-2 text-slate-600">
                  <Sliders className="h-4 w-4" /> Design System (W0)
                </Button>
              </Link>
            </div>
          </div>
        </div>

        {/* Workspaces Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Clinician Card */}
          <Card className="hover:border-teal-300 transition-all">
            <CardHeader>
              <div className="h-10 w-10 rounded-lg bg-teal-50 border border-teal-200 flex items-center justify-center text-[#0F766E] mb-2">
                <Activity className="h-5 w-5" />
              </div>
              <CardTitle>Doctor Workspace</CardTitle>
              <CardDescription>Phases W3 & W5</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-xs text-slate-600 leading-relaxed">
                Review assigned patient cohorts, inspect synchronized multi-channel IMU angle & FSR load charts, stamp revision plans, and log clinical review notes.
              </p>
              <div className="space-y-1.5 pt-2">
                <Link
                  href="/doctor/dashboard"
                  className="flex items-center justify-between text-xs font-semibold text-[#0F766E] hover:underline"
                >
                  <span>Doctor Dashboard</span>
                  <ChevronRight className="h-3.5 w-3.5" />
                </Link>
                <Link
                  href="/doctor/patients"
                  className="flex items-center justify-between text-xs font-semibold text-[#0F766E] hover:underline"
                >
                  <span>Patient Cohort Triage</span>
                  <ChevronRight className="h-3.5 w-3.5" />
                </Link>
                <Link
                  href="/doctor/sessions/ses_2026_1104_01"
                  className="flex items-center justify-between text-xs font-semibold text-[#0F766E] hover:underline"
                >
                  <span>Telemetry Graph & Review</span>
                  <ChevronRight className="h-3.5 w-3.5" />
                </Link>
              </div>
            </CardContent>
          </Card>

          {/* Patient Card */}
          <Card className="hover:border-blue-300 transition-all">
            <CardHeader>
              <div className="h-10 w-10 rounded-lg bg-blue-50 border border-blue-200 flex items-center justify-center text-[#1D4ED8] mb-2">
                <Radio className="h-5 w-5" />
              </div>
              <CardTitle>Patient Workspace</CardTitle>
              <CardDescription>Phase W4</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-xs text-slate-600 leading-relaxed">
                Follow prescribed daily exercise routines, execute live sessions with dual repetition tracking (patient manual vs edge IMU algorithms), and monitor sensor readiness.
              </p>
              <div className="space-y-1.5 pt-2">
                <Link
                  href="/patient/dashboard"
                  className="flex items-center justify-between text-xs font-semibold text-[#1D4ED8] hover:underline"
                >
                  <span>Patient Dashboard</span>
                  <ChevronRight className="h-3.5 w-3.5" />
                </Link>
                <Link
                  href="/patient/session/record"
                  className="flex items-center justify-between text-xs font-semibold text-[#1D4ED8] hover:underline"
                >
                  <span>Live Session Recording</span>
                  <ChevronRight className="h-3.5 w-3.5" />
                </Link>
                <Link
                  href="/patient/device"
                  className="flex items-center justify-between text-xs font-semibold text-[#1D4ED8] hover:underline"
                >
                  <span>Sensor Health & Status</span>
                  <ChevronRight className="h-3.5 w-3.5" />
                </Link>
              </div>
            </CardContent>
          </Card>

          {/* Administrator Card */}
          <Card className="hover:border-slate-400 transition-all">
            <CardHeader>
              <div className="h-10 w-10 rounded-lg bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-800 mb-2">
                <Shield className="h-5 w-5" />
              </div>
              <CardTitle>Admin Workspace</CardTitle>
              <CardDescription>Phase W2</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-xs text-slate-600 leading-relaxed">
                Manage medical user directories, provision cryptographic tokens for ESP32-S3 boards, inspect immutable security audit logs, and monitor technical pipelines.
              </p>
              <div className="space-y-1.5 pt-2">
                <Link
                  href="/admin/users"
                  className="flex items-center justify-between text-xs font-semibold text-slate-800 hover:underline"
                >
                  <span>User Directory & Invites</span>
                  <ChevronRight className="h-3.5 w-3.5" />
                </Link>
                <Link
                  href="/admin/devices"
                  className="flex items-center justify-between text-xs font-semibold text-slate-800 hover:underline"
                >
                  <span>Hardware Device Registry</span>
                  <ChevronRight className="h-3.5 w-3.5" />
                </Link>
                <Link
                  href="/admin/audit-log"
                  className="flex items-center justify-between text-xs font-semibold text-slate-800 hover:underline"
                >
                  <span>Security & System Health</span>
                  <ChevronRight className="h-3.5 w-3.5" />
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* System Architecture Guarantees */}
        <div className="bg-amber-50/70 border border-amber-200 rounded-xl p-5 space-y-2">
          <div className="flex items-center gap-2 text-amber-900 font-bold text-sm">
            <span>🛡️ Clinical & Administrative Separation Guarantee</span>
          </div>
          <p className="text-xs text-amber-800 leading-relaxed">
            Per the OrthoSense implementation governance rules, administrators have zero access to diagnostic clinical notes or raw sensor telemetry. Clinicians manage patient cohorts and plans, while patients enjoy cognitive-load minimized exercise routines with dual rep reporting.
          </p>
        </div>
      </div>
    </AppShell>
  );
}
