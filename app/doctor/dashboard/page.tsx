"use client";

import * as React from "react";
import Link from "next/link";
import { AppShell } from "@/components/ui/AppShell";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { DataTable, Column } from "@/components/ui/DataTable";
import { INITIAL_USERS, INITIAL_SESSIONS, INITIAL_DEVICES } from "@/lib/services/mock-data";
import { ExerciseSession } from "@/lib/types";
import {
  Users,
  Activity,
  AlertTriangle,
  Cpu,
  ChevronRight,
  TrendingUp,
  FileSpreadsheet,
} from "lucide-react";

export default function DoctorDashboard() {
  const doctorPatients = INITIAL_USERS.filter((u) => u.role === "patient");

  const sessionColumns: Column<ExerciseSession>[] = [
    { key: "startedAt", header: "Timestamp", sortable: true, render: (s) => new Date(s.startedAt).toLocaleString() },
    { key: "patientName", header: "Patient", sortable: true },
    { key: "exerciseName", header: "Exercise Routine", sortable: true },
    {
      key: "patientReportedReps",
      header: "Reps (Reported / Estimated)",
      render: (s) => (
        <span className="font-mono text-xs">
          <span className="font-semibold text-slate-800">{s.patientReportedReps}</span>
          <span className="text-slate-400"> / </span>
          <span className="text-teal-700 font-semibold">{s.sensorEstimatedReps}</span>
        </span>
      ),
    },
    {
      key: "maxFlexionDeg",
      header: "Max Flexion",
      render: (s) => <span className="font-semibold text-teal-800">{s.maxFlexionDeg}°</span>,
    },
    {
      key: "qualityFlag",
      header: "Data Integrity",
      render: (s) => (
        <StatusBadge
          status={s.qualityFlag === "good" ? "healthy" : "degraded"}
          labelOverride={s.qualityFlag.toUpperCase()}
          size="sm"
        />
      ),
    },
    {
      key: "id",
      header: "Actions",
      render: (s) => (
        <Link href={`/doctor/sessions/${s.id}`}>
          <Button size="sm" variant="outline" className="h-7 text-xs">
            Review Graph
          </Button>
        </Link>
      ),
    },
  ];

  return (
    <AppShell>
      <div className="space-y-6">
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">
              Clinical Telemetry Dashboard
            </h1>
            <p className="text-xs text-slate-500 mt-1">
              Active patient cohort monitoring, range-of-motion metrics, and session review triage.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Link href="/doctor/patients">
              <Button variant="primary" size="sm" className="gap-1.5">
                <Users className="h-4 w-4" /> View Patient Cohort
              </Button>
            </Link>
            <Link href="/doctor/exercises">
              <Button variant="outline" size="sm" className="gap-1.5">
                <FileSpreadsheet className="h-4 w-4" /> Exercise Protocols
              </Button>
            </Link>
          </div>
        </div>

        {/* Top KPI Cards (Task W3.1) */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4 flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  Assigned Patients
                </p>
                <p className="text-2xl font-extrabold text-slate-900 mt-1">
                  {doctorPatients.length}
                </p>
                <p className="text-[11px] text-teal-700 font-medium mt-0.5">100% Active Rehabilitation</p>
              </div>
              <div className="h-10 w-10 rounded-xl bg-teal-50 border border-teal-200 flex items-center justify-center text-[#0F766E]">
                <Users className="h-5 w-5" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4 flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  Sessions Today
                </p>
                <p className="text-2xl font-extrabold text-slate-900 mt-1">1</p>
                <p className="text-[11px] text-slate-500 mt-0.5">3 prescribed for today</p>
              </div>
              <div className="h-10 w-10 rounded-xl bg-blue-50 border border-blue-200 flex items-center justify-center text-[#1D4ED8]">
                <Activity className="h-5 w-5" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4 flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  Active Alerts
                </p>
                <p className="text-2xl font-extrabold text-amber-700 mt-1">1</p>
                <p className="text-[11px] text-amber-800 mt-0.5">Sensor Rail Check required</p>
              </div>
              <div className="h-10 w-10 rounded-xl bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-700">
                <AlertTriangle className="h-5 w-5" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4 flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  Edge Devices
                </p>
                <p className="text-2xl font-extrabold text-slate-900 mt-1">3 / 4</p>
                <p className="text-[11px] text-emerald-700 font-medium mt-0.5">Online & Streaming</p>
              </div>
              <div className="h-10 w-10 rounded-xl bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-700">
                <Cpu className="h-5 w-5" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Patient Cohort Quick View */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Assigned Patient Cohort Triage</CardTitle>
              <CardDescription>
                Stratified by protocol compliance, range of motion progression, and edge telemetry freshness.
              </CardDescription>
            </div>
            <Link href="/doctor/patients" className="text-xs text-[#0F766E] font-semibold hover:underline">
              View All Patients →
            </Link>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {doctorPatients.map((pat) => (
                <div
                  key={pat.id}
                  className="p-4 rounded-xl border border-slate-200 bg-white hover:border-teal-400 transition-colors space-y-3"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className="text-sm font-bold text-slate-900">{pat.fullName}</h4>
                      <p className="text-xs text-slate-500">{pat.department}</p>
                    </div>
                    <span className="px-2 py-0.5 text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-full">
                      85% Compliant
                    </span>
                  </div>

                  <div className="text-xs text-slate-600 space-y-1 bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                    <p className="flex justify-between">
                      <span className="text-slate-400">Assigned Edge Device:</span>
                      <span className="font-mono font-medium text-slate-700">{pat.assignedDeviceId}</span>
                    </p>
                    <p className="flex justify-between">
                      <span className="text-slate-400">Latest Session:</span>
                      <span className="font-medium text-slate-700">Today, 10:15 AM</span>
                    </p>
                  </div>

                  <div className="flex items-center justify-between pt-1">
                    <Link
                      href={`/doctor/patients/${pat.id}`}
                      className="text-xs font-semibold text-[#0F766E] hover:underline"
                    >
                      Patient Profile & Plan →
                    </Link>
                    <Link href={`/doctor/patients/${pat.id}/plan`}>
                      <Button size="sm" variant="ghost" className="h-7 text-xs">
                        Edit Plan
                      </Button>
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Recent Sessions Table */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Telemetry Sessions Recorded</CardTitle>
            <CardDescription>
              Dual repetition count comparison and sensor data validation.
            </CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            <DataTable
              data={INITIAL_SESSIONS}
              columns={sessionColumns}
              keyExtractor={(s) => s.id}
            />
          </CardContent>
        </Card>
      </div>
    </AppShell>
  );
}

