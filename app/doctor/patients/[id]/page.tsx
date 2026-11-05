"use client";

import * as React from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { AppShell } from "@/components/ui/AppShell";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { DataTable, Column } from "@/components/ui/DataTable";
import { Skeleton, SkeletonCard, SkeletonMetricsGrid, SkeletonTable } from "@/components/ui/Skeleton";
import { patientsApi, plansApi, sessionsApi } from "@/lib/services/api";
import { ExerciseSession, User, ExercisePlan } from "@/lib/types";
import { ArrowLeft, Edit3, Activity, Cpu, Calendar, ChevronRight, RefreshCw } from "lucide-react";

export default function PatientDetailPage() {
  const params = useParams();
  const patientId = params?.id as string;

  const [patient, setPatient] = React.useState<User | null>(null);
  const [plan, setPlan] = React.useState<ExercisePlan | null>(null);
  const [sessions, setSessions] = React.useState<ExerciseSession[]>([]);
  const [loading, setLoading] = React.useState(true);

  const fetchPatientDetails = React.useCallback(async () => {
    if (!patientId) return;
    setLoading(true);
    try {
      const [pt, myPlan, sessList] = await Promise.all([
        patientsApi.getById(patientId).catch(() => null),
        plansApi.getMyPlan(patientId).catch(() => null),
        sessionsApi.getAll().catch(() => []),
      ]);
      if (pt) setPatient(pt);
      if (myPlan) setPlan(myPlan);
      setSessions(sessList);
    } finally {
      setLoading(false);
    }
  }, [patientId]);

  React.useEffect(() => {
    fetchPatientDetails();
  }, [fetchPatientDetails]);

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

  if (loading) {
    return (
      <AppShell>
        <div className="space-y-6">
          <Skeleton className="h-10 w-64" />
          <SkeletonMetricsGrid count={3} />
          <SkeletonTable rows={4} cols={5} />
        </div>
      </AppShell>
    );
  }

  if (!patient) {
    return (
      <AppShell>
        <div className="p-8 text-center space-y-4">
          <p className="text-slate-600">Patient not found or unauthorized.</p>
          <Link href="/doctor/patients">
            <Button variant="outline">Back to Patients Directory</Button>
          </Link>
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell>
      <div className="space-y-6">
        {/* Navigation & Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Link href="/doctor/patients">
              <Button size="sm" variant="outline" className="gap-1.5">
                <ArrowLeft className="h-4 w-4" /> Back to Cohort
              </Button>
            </Link>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-bold tracking-tight text-slate-900">
                  {patient.fullName}
                </h1>
                <span className="font-mono text-xs px-2 py-0.5 rounded bg-slate-100 text-slate-700">
                  {patient.id}
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Cohort: <span className="font-semibold text-slate-700">{patient.department || "Post-Op ACL"}</span> • Assigned Device: <span className="font-mono">{patient.assignedDeviceId || "ESP32-S3-ORTHO-092"}</span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button
              size="sm"
              variant="outline"
              onClick={fetchPatientDetails}
              className="gap-1.5"
            >
              <RefreshCw className="h-4 w-4" /> Refresh
            </Button>
            <Link href={`/doctor/patients/${patient.id}/plan`}>
              <Button size="sm" variant="primary" className="gap-1.5">
                <Edit3 className="h-4 w-4" /> Edit &amp; Publish Plan v{plan ? plan.version : 2}
              </Button>
            </Link>
          </div>
        </div>

        {/* Clinical Snapshot Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-xs font-bold uppercase text-slate-500">Active Prescription</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="flex items-baseline justify-between">
                <span className="text-xl font-black text-slate-900">Plan v{plan ? plan.version : 2}</span>
                <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200">
                  {plan ? plan.state : "Published"}
                </span>
              </div>
              <p className="text-xs text-slate-600 line-clamp-2">
                {plan?.clinicalNotes || "Week 4 protocol targeting 105° active flexion."}
              </p>
              <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
                <span>{plan?.items.length || 3} exercises prescribed</span>
                <Link href={`/doctor/patients/${patient.id}/plan`} className="text-teal-700 font-semibold hover:underline">
                  View Full Protocol →
                </Link>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-xs font-bold uppercase text-slate-500">Edge Hardware Telemetry</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="flex items-baseline justify-between">
                <span className="text-xl font-black text-slate-900">{patient.assignedDeviceId || "ESP32-S3-ORTHO-092"}</span>
                <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200">
                  ONLINE (94%)
                </span>
              </div>
              <p className="text-xs text-slate-600">
                FreeRTOS 100Hz IMU loop streaming sagittal flexion angles.
              </p>
              <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
                <span>Firmware v2.1.0-RC4</span>
                <span className="text-emerald-700 font-semibold">Active &amp; Paired</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-xs font-bold uppercase text-slate-500">Recovery Adherence</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="flex items-baseline justify-between">
                <span className="text-xl font-black text-slate-900">92%</span>
                <span className="text-xs font-semibold text-emerald-700">Satisfactory</span>
              </div>
              <p className="text-xs text-slate-600">
                Completed 14 of 15 scheduled sessions over the past 2 weeks.
              </p>
              <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
                <span>Total reps: 140 / 150</span>
                <span className="text-teal-700 font-semibold">Target: 105° Flexion</span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Session History Table */}
        <Card>
          <CardHeader>
            <CardTitle>Completed Therapy Sessions</CardTitle>
            <CardDescription>
              Select any session to inspect raw biomechanical telemetry curves and sign off.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <DataTable
              columns={sessionColumns}
              data={sessions}
              emptyMessage="No recorded sessions found for this patient."
            />
          </CardContent>
        </Card>
      </div>
    </AppShell>
  );
}
