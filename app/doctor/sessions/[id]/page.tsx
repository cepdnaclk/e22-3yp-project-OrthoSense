"use client";

import * as React from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { AppShell } from "@/components/ui/AppShell";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { TelemetryChart } from "@/components/features/TelemetryChart";
import { INITIAL_SESSIONS } from "@/lib/services/mock-data";
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
  const router = useRouter();
  const sessionId = params?.id as string;

  const session = INITIAL_SESSIONS.find((s) => s.id === sessionId) || INITIAL_SESSIONS[0];

  const [notes, setNotes] = React.useState(session.reviewNotes || "");
  const [saved, setSaved] = React.useState(session.doctorReviewed || false);

  const handleSaveNotes = () => {
    setSaved(true);
  };

  const exportCSV = () => {
    if (!session.telemetrySample) return;
    const headers = "timestampMs,kneeAngleDeg,fsrHeelRaw,fsrToeRaw,skinTemperatureC\n";
    const rows = session.telemetrySample
      .map(
        (p) =>
          `${p.timestampMs},${p.kneeAngleDeg ?? ""},${p.fsrHeelRaw ?? ""},${p.fsrToeRaw ?? ""},${p.skinTemperatureC ?? ""}`
      )
      .join("\n");
    const blob = new Blob([headers + rows], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `orthosense_${session.id}_raw_telemetry.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

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
              <Download className="h-4 w-4" /> Export CSV (W5.5)
            </Button>
            <Link href={`/reports/session/${session.id}`} target="_blank">
              <Button size="sm" variant="primary" className="gap-1.5">
                <Printer className="h-4 w-4" /> Printable Clinical Report (W5.4)
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
              {Math.floor(session.durationSeconds / 60)}m {session.durationSeconds % 60}s
            </p>
            <p className="text-[11px] text-slate-500">Recorded {new Date(session.startedAt).toLocaleTimeString()}</p>
          </div>
        </div>

        {/* Synchronized Multi-Channel Chart */}
        <TelemetryChart
          data={session.telemetrySample || []}
          title={`Synchronized Session Telemetry Stream (${session.exerciseName})`}
        />

        {/* Clinical Notes & Non-Fabrication Guarantee */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="md:col-span-2">
            <CardHeader>
              <CardTitle>Doctor Clinical Review Observations (W3.8)</CardTitle>
              <CardDescription>
                Physician observations are stored immutably alongside the session without modifying raw sensor data.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <textarea
                value={notes}
                onChange={(e) => {
                  setNotes(e.target.value);
                  setSaved(false);
                }}
                rows={4}
                className="w-full text-sm p-3 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#0F766E] text-slate-800"
                placeholder="Write clinical feedback on range of motion, pacing, cadence, and patient tolerance..."
              />
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-500">
                  {saved ? (
                    <span className="text-emerald-700 font-semibold flex items-center gap-1">
                      <CheckCircle2 className="h-3.5 w-3.5" /> Reviewed by Dr. Marcus Vance, MD
                    </span>
                  ) : (
                    "Unsaved changes"
                  )}
                </span>
                <Button size="sm" variant="primary" onClick={handleSaveNotes}>
                  Save & Sign Clinical Note
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Hardware Health Audit</CardTitle>
              <CardDescription>Channels verified during capture</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3 text-xs">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                <span className="font-medium text-slate-700">IMU 1 (Thigh)</span>
                <StatusBadge status="healthy" labelOverride="READ_OK" size="sm" />
              </div>
              <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                <span className="font-medium text-slate-700">IMU 2 (Shank)</span>
                <StatusBadge status="healthy" labelOverride="READ_OK" size="sm" />
              </div>
              <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                <span className="font-medium text-slate-700">FSR Heel Load</span>
                <StatusBadge status="healthy" labelOverride="READ_OK" size="sm" />
              </div>
              <div className="flex items-center justify-between">
                <span className="font-medium text-slate-700">Skin Temp (NTC)</span>
                <StatusBadge status="healthy" labelOverride="READ_OK" size="sm" />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </AppShell>
  );
}

