"use client";

import * as React from "react";
import Link from "next/link";
import { AppShell } from "@/components/ui/AppShell";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { DataTable, Column } from "@/components/ui/DataTable";
import { INITIAL_SESSIONS } from "@/lib/services/mock-data";
import { ExerciseSession } from "@/lib/types";
import { ArrowLeft, Play, Calendar } from "lucide-react";

export default function PatientSessionsHistoryPage() {
  const sessions = INITIAL_SESSIONS;

  const columns: Column<ExerciseSession>[] = [
    { key: "startedAt", header: "Date / Time", sortable: true, render: (s) => new Date(s.startedAt).toLocaleString() },
    { key: "exerciseName", header: "Routine", sortable: true },
    {
      key: "patientReportedReps",
      header: "Reps Completed",
      render: (s) => (
        <span className="font-semibold text-slate-800">
          {s.patientReportedReps} reps
        </span>
      ),
    },
    {
      key: "maxFlexionDeg",
      header: "Max Angle Reached",
      render: (s) => <span className="font-semibold text-[#0F766E]">{s.maxFlexionDeg}°</span>,
    },
    {
      key: "durationSeconds",
      header: "Duration",
      render: (s) => <span>{Math.round(s.durationSeconds / 60)} mins</span>,
    },
    {
      key: "doctorReviewed",
      header: "Clinical Review",
      render: (s) =>
        s.doctorReviewed ? (
          <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
            Reviewed by Dr. Vance
          </span>
        ) : (
          <span className="text-xs text-slate-400">Pending Review</span>
        ),
    },
  ];

  return (
    <AppShell>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Link href="/patient/dashboard">
              <Button size="sm" variant="outline" className="gap-1.5">
                <ArrowLeft className="h-4 w-4" /> Back to Dashboard
              </Button>
            </Link>
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-slate-900">
                My Session History (W4.6)
              </h1>
              <p className="text-xs text-slate-500 mt-1">
                Completed exercise sessions tracked with your OrthoSense smart knee brace.
              </p>
            </div>
          </div>
          <Link href="/patient/session/record">
            <Button size="sm" variant="primary" className="gap-1.5">
              <Play className="h-4 w-4 fill-current" /> Record New Session
            </Button>
          </Link>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Session History</CardTitle>
            <CardDescription>
              Every session records synchronized IMU angles and load data stored securely for your clinical team.
            </CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            <DataTable
              data={sessions}
              columns={columns}
              keyExtractor={(s) => s.id}
            />
          </CardContent>
        </Card>
      </div>
    </AppShell>
  );
}

