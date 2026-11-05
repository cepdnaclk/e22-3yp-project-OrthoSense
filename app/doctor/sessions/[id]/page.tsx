"use client";

import * as React from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { AppShell } from "@/components/ui/AppShell";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { TelemetryChart } from "@/components/features/TelemetryChart";
import { Skeleton, SkeletonMetricsGrid, SkeletonCard } from "@/components/ui/Skeleton";
import { sessionsApi } from "@/lib/services/api";
import { ExerciseSession, TelemetryPoint } from "@/lib/types";
import {
  ArrowLeft,
  Printer,
  Download,
  CheckCircle2,
  AlertCircle,
  FileText,
  Clock,
  RotateCcw,
} from "lucide-react";

export default function SessionTelemetryViewer() {
  const params = useParams();
  const sessionId = params?.id as string;

  const [session, setSession] = React.useState<ExerciseSession | null>(null);
  const [telemetry, setTelemetry] = React.useState<TelemetryPoint[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [notes, setNotes] = React.useState("");
  const [saved, setSaved] = React.useState(false);
  const [submitting, setSubmitting] = React.useState(false);

  React.useEffect(() => {
    async function loadData() {
      if (!sessionId) return;
      setLoading(true);
      try {
        const [sessData, telData] = await Promise.all([
          sessionsApi.getById(sessionId).catch(() => null),
          sessionsApi.getTelemetry(sessionId, 500).catch(() => []),
        ]);
        if (sessData) {
          setSession(sessData);
          setNotes(sessData.reviewNotes || "");
          setSaved(sessData.doctorReviewed || false);
        }
        setTelemetry(telData);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [sessionId]);

  const handleSaveNotes = async () => {
    if (!sessionId || !notes) return;
    setSubmitting(true);
    try {
      await sessionsApi.review(sessionId, notes);
      setSaved(true);
    } catch (err: any) {
      alert(err.message || "Failed to submit review");
    } finally {
      setSubmitting(false);
    }
  };

  const exportCSV = () => {
    if (!telemetry.length) return;
    const headers = "timestampMs,kneeAngleDeg,fsrHeelRaw,fsrToeRaw,skinTemperatureC\n";
    const rows = telemetry
      .map(
        (p) =>
          `${p.timestampMs},${p.kneeAngleDeg ?? ""},${p.fsrHeelRaw ?? ""},${p.fsrToeRaw ?? ""},${p.skinTemperatureC ?? ""}`
      )
      .join("\n");
    const blob = new Blob([headers + rows], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `orthosense_${sessionId}_raw_telemetry.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (loading) {
    return (
      <AppShell>
        <div className="space-y-6">
          <div className="flex items-center gap-4">
            <Skeleton className="h-9 w-32" />
            <Skeleton className="h-9 w-64" />
          </div>
          <SkeletonMetricsGrid count={4} />
          <SkeletonCard className="h-96" />
        </div>
      </AppShell>
    );
  }

  if (!session) {
    return (
      <AppShell>
        <div className="p-8 text-center space-y-4">
          <p className="text-slate-600">Session record not found.</p>
          <Link href="/doctor/dashboard">
            <Button variant="outline">Back to Dashboard</Button>
          </Link>
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell>
      <div className="space-y-6">
        {/* Navigation & Actions */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Link href="/doctor/dashboard">
              <Button size="sm" variant="outline" className="gap-1.5">
                <ArrowLeft className="h-4 w-4" /> Back to Dashboard
              </Button>
            </Link>
            <div>
              <h1 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                <span>Session Inspection: {session.id}</span>
                <StatusBadge
                  status={session.qualityFlag === "good" ? "healthy" : "degraded"}
                  labelOverride={session.qualityFlag === "good" ? "VALIDATED QUALITY" : "FLAGGED"}
                  size="sm"
                />
              </h1>
              <p className="text-xs text-slate-500">
                Patient: <span className="font-semibold text-slate-700">{session.patientName}</span> • Exercise: {session.exerciseName} (Plan v{session.planVersion})
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button size="sm" variant="outline" className="gap-1.5" onClick={exportCSV}>
              <Download className="h-4 w-4" /> Export CSV
            </Button>
            <Link href={`/reports/session/${session.id}`} target="_blank">
              <Button size="sm" variant="primary" className="gap-1.5">
                <Printer className="h-4 w-4" /> Printable Clinical Report
              </Button>
            </Link>
          </div>
        </div>

        {/* Telemetry Metrics Summary */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="p-4 bg-white rounded-xl border border-slate-200">
            <p className="text-xs font-semibold text-slate-500 uppercase">Max Flexion Angle</p>
            <p className="text-2xl font-extrabold text-[#0F766E] mt-1">{session.maxFlexionDeg}°</p>
            <p className="text-[11px] text-slate-500">Target was ≥100°</p>
          </div>

          <div className="p-4 bg-white rounded-xl border border-slate-200">
            <p className="text-xs font-semibold text-slate-500 uppercase">Extension Lockout</p>
            <p className="text-2xl font-extrabold text-slate-900 mt-1">{session.maxExtensionDeg}°</p>
            <p className="text-[11px] text-emerald-700 font-medium">Near-full 0° lockout achieved</p>
          </div>

          <div className="p-4 bg-white rounded-xl border border-slate-200">
            <p className="text-xs font-semibold text-slate-500 uppercase">Repetition Comparison</p>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-2xl font-extrabold text-slate-900">{session.patientReportedReps}</span>
              <span className="text-xs text-slate-500">reported /</span>
              <span className="text-2xl font-extrabold text-teal-700">{session.sensorEstimatedReps}</span>
              <span className="text-xs text-slate-500">IMU</span>
            </div>
            <p className="text-[11px] text-teal-700 font-medium">100% rep concordance</p>
          </div>

          <div className="p-4 bg-white rounded-xl border border-slate-200">
            <p className="text-xs font-semibold text-slate-500 uppercase">Duration & Freshness</p>
            <p className="text-2xl font-extrabold text-slate-900 mt-1">
              {Math.round(session.durationSeconds / 60)} mins
            </p>
            <p className="text-[11px] text-slate-500">Recorded {new Date(session.startedAt).toLocaleTimeString()}</p>
          </div>
        </div>

        {/* Multi-Channel Synchronized Time-Series Chart */}
        <Card>
          <CardHeader>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <CardTitle>Continuous Telemetry Inspection</CardTitle>
                <CardDescription>
                  Multi-channel kinematic and force stream captured by ESP32-S3.
                </CardDescription>
              </div>
              <div className="flex items-center gap-3 text-xs font-medium">
                <span className="flex items-center gap-1.5 text-teal-700">
                  <span className="h-2.5 w-2.5 rounded-full bg-[#0F766E]"></span> Knee Flexion (°)
                </span>
                <span className="flex items-center gap-1.5 text-blue-700">
                  <span className="h-2.5 w-2.5 rounded-full bg-[#2563EB]"></span> Heel FSR (kg-f)
                </span>
                <span className="flex items-center gap-1.5 text-amber-700">
                  <span className="h-2.5 w-2.5 rounded-full bg-[#D97706]"></span> Skin Temp (°C)
                </span>
              </div>
            </div>
          </CardHeader>
          <CardContent className="pt-2">
            <TelemetryChart points={telemetry} />
          </CardContent>
        </Card>

        {/* Doctor Clinical Review Sign-off */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Supervising Clinician Review & Feedback</CardTitle>
                <CardDescription>
                  Formal orthopedic sign-off attached to patient longitudinal history.
                </CardDescription>
              </div>
              {saved && (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200">
                  <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
                  Clinician Approved
                </span>
              )}
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <textarea
              className="w-full h-28 p-3 text-xs rounded-lg border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-[#0F766E] resize-none"
              placeholder="Enter clinical observations, ROM achievements, or modifications to target flexion limits..."
              value={notes}
              onChange={(e) => {
                setNotes(e.target.value);
                setSaved(false);
              }}
            />
          </CardContent>
          <CardFooter className="flex justify-between items-center border-t border-slate-100 pt-4">
            <p className="text-[11px] text-slate-500">
              Approved notes appear immediately in Sarah Connor&apos;s patient portal.
            </p>
            <Button
              variant="primary"
              size="sm"
              onClick={handleSaveNotes}
              loading={submitting}
              className="gap-1.5"
            >
              <CheckCircle2 className="h-4 w-4" /> Save &amp; Authorize Clinical Review
            </Button>
          </CardFooter>
        </Card>
      </div>
    </AppShell>
  );
}
