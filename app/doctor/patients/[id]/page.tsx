"use client";

import * as React from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { AppShell } from "@/components/ui/AppShell";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { DataTable, Column } from "@/components/ui/DataTable";
import { INITIAL_USERS, INITIAL_PLANS, INITIAL_SESSIONS, INITIAL_DEVICES } from "@/lib/services/mock-data";
import { ExerciseSession } from "@/lib/types";
import { ArrowLeft, Edit3, Activity, Cpu, Calendar, ChevronRight } from "lucide-react";

export default function PatientDetailPage() {
  const params = useParams();
  const patientId = (params?.id as string) || "usr_pat_108";

  const patient = INITIAL_USERS.find((u) => u.id === patientId) || INITIAL_USERS[3];
  const plan = INITIAL_PLANS.find((p) => p.patientId === patientId) || INITIAL_PLANS[0];
  const device = INITIAL_DEVICES.find((d) => d.id === "dev_001") || INITIAL_DEVICES[0];
  const sessions = INITIAL_SESSIONS.filter((s) => s.patientId === patientId);

  const sessionColumns: Column<ExerciseSession>[] = [
    { key: "startedAt", header: "Date / Time", sortable: true, render: (s) => new Date(s.startedAt).toLocaleString() },
    { key: "exerciseName", header: "Exercise Routine", sortable: true },
    {
      key: "patientReportedReps",
      header: "Reps (Reported / Est.)",
      render: (s) => (
        <span className="font-mono text-xs">
          {s.patientReportedReps} / <span className="text-teal-700 font-semibold">{s.sensorEstimatedReps}</span>
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
      header: "Quality",
      render: (s) => (
        <StatusBadge
          status={s.qualityFlag === "good" ? "healthy" : "degraded"}
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
            Inspect Session →
          </Button>
        </Link>
      ),
    },
  ];

  return (
    <AppShell>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Link href="/doctor/patients">
              <Button size="sm" variant="outline" className="gap-1.5">
                <ArrowLeft className="h-4 w-4" /> Back to Cohort
              </Button>
            </Link>
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-slate-900">
                {patient.fullName}
              </h1>
              <p className="text-xs text-slate-500">
                {patient.department} • Clinician: Dr. Marcus Vance, MD
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Link href={`/doctor/patients/${patient.id}/plan`}>
              <Button size="sm" variant="primary" className="gap-1.5">
                <Edit3 className="h-4 w-4" /> Edit Rehabilitation Plan (W3.7)
              </Button>
            </Link>
          </div>
        </div>

        {/* Demographics & Hardware Strip */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <CardHeader className="py-4">
              <CardTitle className="text-sm font-semibold">Subject Clinical Profile</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-xs pt-0">
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-slate-500">Patient Identifier:</span>
                <span className="font-mono font-medium text-slate-800">{patient.id}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-slate-500">Email Address:</span>
                <span className="font-medium text-slate-800">{patient.email}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-slate-500">Rehabilitation State:</span>
                <span className="text-emerald-700 font-semibold">Week 4 Post-Surgical</span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-slate-500">Compliance Rate:</span>
                <span className="text-[#0F766E] font-bold">92%</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="py-4">
              <CardTitle className="text-sm font-semibold">Paired Edge Telemetry Device</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-xs pt-0">
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-slate-500">Device Hardware ID:</span>
                <span className="font-mono font-medium text-slate-800">{device.serialNumber}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-slate-500">Connection Status:</span>
                <StatusBadge status="healthy" labelOverride="Online & Paired" size="sm" />
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-slate-500">Battery Level:</span>
                <span className="font-semibold text-slate-800">{device.batteryPercent}%</span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-slate-500">Firmware Version:</span>
                <span className="font-mono text-slate-700">{device.firmwareVersion}</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="py-4 flex flex-row items-center justify-between">
              <CardTitle className="text-sm font-semibold">Current Active Plan</CardTitle>
              <span className="text-xs font-semibold text-teal-800 bg-teal-50 px-2 py-0.5 rounded-full border border-teal-200">
                v{plan.version} ({plan.state})
              </span>
            </CardHeader>
            <CardContent className="space-y-2 text-xs pt-0">
              <p className="text-slate-600 italic pb-2 border-b border-slate-100">
                &ldquo;{plan.clinicalNotes}&rdquo;
              </p>
              <div className="space-y-1">
                {plan.items.map((it) => (
                  <div key={it.id} className="flex justify-between text-slate-700">
                    <span>{it.exerciseName}:</span>
                    <span className="font-semibold">{it.targetReps} reps × {it.targetSets} sets ({it.targetFlexionDeg}°)</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Session History Table (Task W3.4) */}
        <Card>
          <CardHeader>
            <CardTitle>Session History Log (W3.4)</CardTitle>
            <CardDescription>
              Chronological records of exercises performed with ESP32-S3 synchronized telemetry.
            </CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            <DataTable
              data={sessions}
              columns={sessionColumns}
              keyExtractor={(s) => s.id}
            />
          </CardContent>
        </Card>
      </div>
    </AppShell>
  );
}

