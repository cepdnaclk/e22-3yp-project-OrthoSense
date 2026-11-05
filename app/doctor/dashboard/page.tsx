"use client";

import * as React from "react";
import Link from "next/link";
import { AppShell } from "@/components/ui/AppShell";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { DataTable, Column } from "@/components/ui/DataTable";
import { SkeletonMetricsGrid, SkeletonTable } from "@/components/ui/Skeleton";
import { patientsApi, sessionsApi, devicesApi } from "@/lib/services/api";
import { ExerciseSession, User, Device } from "@/lib/types";
import {
  Users,
  Activity,
  AlertTriangle,
  Cpu,
  ChevronRight,
  TrendingUp,
  FileSpreadsheet,
  RefreshCw,
} from "lucide-react";

export default function DoctorDashboard() {
  const [patients, setPatients] = React.useState<User[]>([]);
  const [sessions, setSessions] = React.useState<ExerciseSession[]>([]);
  const [devices, setDevices] = React.useState<Device[]>([]);
  const [loading, setLoading] = React.useState(true);

  const fetchDashboardData = React.useCallback(async () => {
    setLoading(true);
    try {
      const [pts, sess, devs] = await Promise.all([
        patientsApi.getAll().catch(() => []),
        sessionsApi.getAll().catch(() => []),
        devicesApi.getAll().catch(() => []),
      ]);
      setPatients(pts);
      setSessions(sess);
      setDevices(devs);
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  const pendingReviews = sessions.filter((s) => !s.doctorReviewed);

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
            <Button
              variant="outline"
              size="sm"
              onClick={fetchDashboardData}
              loading={loading}
              className="gap-1.5"
            >
              <RefreshCw className="h-4 w-4" /> Refresh
            </Button>
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

        {/* Top KPI Cards */}
        {loading ? (
          <SkeletonMetricsGrid count={4} />
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-4 flex items-center justify-between">
                <div>
                  <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                    Assigned Patients
                  </p>
                  <p className="text-2xl font-extrabold text-slate-900 mt-1">
                    {patients.length}
                  </p>
                  <p className="text-[11px] text-teal-700 font-medium mt-0.5">Active Rehabilitation</p>
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
                    Completed Sessions
                  </p>
                  <p className="text-2xl font-extrabold text-slate-900 mt-1">{sessions.length}</p>
                  <p className="text-[11px] text-slate-500 mt-0.5">Synced Telemetry Records</p>
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
                    Pending Reviews
                  </p>
                  <p className="text-2xl font-extrabold text-amber-700 mt-1">{pendingReviews.length}</p>
                  <p className="text-[11px] text-amber-800 mt-0.5">Requires Doctor Sign-off</p>
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
                  <p className="text-2xl font-extrabold text-slate-900 mt-1">{devices.length}</p>
                  <p className="text-[11px] text-emerald-700 font-medium mt-0.5">Hardware Online</p>
                </div>
                <div className="h-10 w-10 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-700">
                  <Cpu className="h-5 w-5" />
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Recent Telemetry Sessions Table */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Recent Patient Rehabilitation Sessions</CardTitle>
                <CardDescription>
                  Sessions recorded by patients using OrthoSense smart knee braces.
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {loading ? (
              <SkeletonTable rows={4} cols={6} />
            ) : (
              <DataTable
                columns={sessionColumns}
                data={sessions}
                emptyMessage="No clinical sessions recorded yet."
              />
            )}
          </CardContent>
        </Card>
      </div>
    </AppShell>
  );
}
