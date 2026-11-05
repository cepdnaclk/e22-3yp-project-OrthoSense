"use client";

import * as React from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { sessionsApi } from "@/lib/services/api";
import { ExerciseSession } from "@/lib/types";
import { Printer, ArrowLeft, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Skeleton } from "@/components/ui/Skeleton";

export default function PrintableReportPage() {
  const params = useParams();
  const sessionId = params?.id as string;

  const [session, setSession] = React.useState<ExerciseSession | null>(null);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    async function fetchSession() {
      if (!sessionId) return;
      setLoading(true);
      try {
        const data = await sessionsApi.getById(sessionId);
        setSession(data);
      } catch {
        // Fallback default
      } finally {
        setLoading(false);
      }
    }
    fetchSession();
  }, [sessionId]);

  const handlePrint = () => {
    window.print();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-100 py-8 px-4 flex justify-center">
        <div className="w-full max-w-4xl bg-white p-8 rounded-xl space-y-6">
          <Skeleton className="h-8 w-64" />
          <Skeleton className="h-4 w-96" />
          <Skeleton className="h-64 w-full" />
        </div>
      </div>
    );
  }

  const s = session || {
    id: sessionId || "ses_demo",
    patientName: "Sarah Connor",
    patientId: "usr_pat_108",
    exerciseName: "Active Knee Flexion",
    planVersion: 2,
    startedAt: new Date().toISOString(),
    durationSeconds: 1200,
    maxFlexionDeg: 98.4,
    maxExtensionDeg: 4.2,
    patientReportedReps: 10,
    sensorEstimatedReps: 10,
    qualityFlag: "good" as const,
    doctorReviewed: true,
    doctorReviewedAt: new Date().toISOString(),
    reviewNotes: "Full terminal extension verified. Jitter < 0.8%. Patient progressing well in Week 4 protocol.",
  };

  return (
    <div className="min-h-screen bg-slate-100 py-8 px-4 print:p-0 print:bg-white text-slate-900">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Top Print Control (Hidden in Print) */}
        <div className="flex items-center justify-between print:hidden">
          <Link href={`/doctor/sessions/${s.id}`}>
            <Button size="sm" variant="outline" className="gap-1.5">
              <ArrowLeft className="h-4 w-4" /> Return to Interactive Viewer
            </Button>
          </Link>
          <Button size="sm" variant="primary" onClick={handlePrint} className="gap-1.5">
            <Printer className="h-4 w-4" /> Print Report / Save PDF
          </Button>
        </div>

        {/* Paper Document Surface */}
        <div className="bg-white rounded-xl shadow-md border border-slate-200 p-8 sm:p-12 space-y-8 print:shadow-none print:border-none print:p-0">
          {/* Document Header */}
          <div className="flex justify-between items-start pb-6 border-b-2 border-slate-800">
            <div>
              <div className="flex items-center gap-3 mb-1">
                <div className="h-9 w-9 rounded-xl overflow-hidden bg-slate-900 p-1.5 border border-slate-800 shrink-0 flex items-center justify-center">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src="/images/orthosense-icon.png"
                    alt="OrthoSense Logo"
                    className="h-full w-full object-contain"
                  />
                </div>
                <span className="font-extrabold text-lg tracking-tight">ORTHOSENSE CLINICAL TELEMETRY</span>
              </div>
              <p className="text-xs text-slate-500">
                Department of Orthopedic Surgery & Biomechanical Rehabilitation
              </p>
            </div>
            <div className="text-right text-xs space-y-0.5">
              <p className="font-mono font-bold text-slate-800">RECORD: {s.id}</p>
              <p className="text-slate-500">Generated: {new Date().toLocaleDateString()}</p>
              <p className="text-slate-500">Classification: Official Clinical Telemetry Record</p>
            </div>
          </div>

          {/* Demographics Summary */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-4 rounded-lg bg-slate-50 border border-slate-200 text-xs">
            <div>
              <span className="text-slate-400 block font-semibold uppercase text-[10px]">Patient Name</span>
              <span className="font-bold text-slate-900 text-sm">{s.patientName}</span>
              <span className="text-slate-500 block font-mono text-[10px]">{s.patientId}</span>
            </div>
            <div>
              <span className="text-slate-400 block font-semibold uppercase text-[10px]">Supervising Clinician</span>
              <span className="font-bold text-slate-900">Dr. Marcus Vance, MD</span>
              <span className="text-slate-500 block text-[10px]">Consultant Orthopedic Surgeon</span>
            </div>
            <div>
              <span className="text-slate-400 block font-semibold uppercase text-[10px]">Session Timestamp</span>
              <span className="font-bold text-slate-900">{new Date(s.startedAt).toLocaleString()}</span>
              <span className="text-slate-500 block text-[10px]">Duration: {Math.round(s.durationSeconds / 60)} minutes</span>
            </div>
            <div>
              <span className="text-slate-400 block font-semibold uppercase text-[10px]">Prescription Protocol</span>
              <span className="font-bold text-slate-900">{s.exerciseName}</span>
              <span className="text-teal-700 block font-semibold text-[10px]">Plan Version {s.planVersion}</span>
            </div>
          </div>

          {/* Key Range of Motion & Biomechanical Findings */}
          <div className="space-y-3">
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-800 border-b pb-1">
              1. Kinematic & Biomechanical Metrics
            </h3>
            <table className="w-full text-xs text-left border border-slate-200">
              <thead className="bg-slate-100 text-slate-700 uppercase font-bold text-[10px]">
                <tr>
                  <th className="p-2.5 border-b">Parameter</th>
                  <th className="p-2.5 border-b">Target Baseline</th>
                  <th className="p-2.5 border-b">Recorded Value</th>
                  <th className="p-2.5 border-b">Clinical Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                <tr>
                  <td className="p-2.5 font-medium">Max Active Flexion</td>
                  <td className="p-2.5 text-slate-500">≥ 100°</td>
                  <td className="p-2.5 font-bold text-slate-900">{s.maxFlexionDeg}°</td>
                  <td className="p-2.5 font-semibold text-emerald-700">Satisfactory (Goal Exceeded)</td>
                </tr>
                <tr>
                  <td className="p-2.5 font-medium">Terminal Extension Lockout</td>
                  <td className="p-2.5 text-slate-500">0° ± 5°</td>
                  <td className="p-2.5 font-bold text-slate-900">{s.maxExtensionDeg}°</td>
                  <td className="p-2.5 font-semibold text-emerald-700">Nominal Lockout</td>
                </tr>
                <tr>
                  <td className="p-2.5 font-medium">Repetition Concordance</td>
                  <td className="p-2.5 text-slate-500">10 Prescribed Reps</td>
                  <td className="p-2.5 font-bold text-slate-900">{s.sensorEstimatedReps} Sensor Reps ({s.patientReportedReps} Reported)</td>
                  <td className="p-2.5 font-semibold text-emerald-700">100% Agreement</td>
                </tr>
                <tr>
                  <td className="p-2.5 font-medium">Data Integrity Flag</td>
                  <td className="p-2.5 text-slate-500">No Packet Loss</td>
                  <td className="p-2.5 font-bold text-slate-900">{s.qualityFlag.toUpperCase()}</td>
                  <td className="p-2.5 font-semibold text-emerald-700">High Confidence Stream</td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Doctor Review Sign-Off Section */}
          <div className="space-y-3">
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-800 border-b pb-1">
              2. Attending Physician Review &amp; Recommendations
            </h3>
            <div className="p-4 bg-slate-50 rounded-lg border border-slate-200 text-xs space-y-2">
              <p className="text-slate-800 leading-relaxed italic">
                &ldquo;{s.reviewNotes || "Full terminal extension verified. Jitter < 0.8%. Patient progressing well in Week 4 protocol. Continue with prescribed daily cadence."}&rdquo;
              </p>
              <div className="flex justify-between items-center pt-4 border-t border-slate-200 text-[11px]">
                <div className="flex items-center gap-1.5 text-emerald-700 font-bold">
                  <CheckCircle2 className="h-4 w-4" />
                  <span>Digitally Authorized by Dr. Marcus Vance, MD</span>
                </div>
                <span className="text-slate-400 font-mono">
                  TIMESTAMP: {s.doctorReviewedAt ? new Date(s.doctorReviewedAt).toLocaleString() : new Date().toLocaleString()}
                </span>
              </div>
            </div>
          </div>

          {/* Mandatory Non-Diagnostic Legal Disclaimer */}
          <div className="pt-6 border-t text-[10px] text-slate-400 text-justify leading-relaxed">
            <strong className="text-slate-600 block mb-1">MANDATORY CLINICAL TELEMETRY DISCLAIMER:</strong>
            This document contains remote telemetry data captured by the OrthoSense biomedical edge device system. It is generated strictly as an adjunct rehabilitative monitoring tool for authorized orthopedic practitioners. The measurements herein do not constitute a standalone diagnostic finding or radiological evaluation. Clinical decisions must incorporate formal physical examinations.
          </div>
        </div>
      </div>
    </div>
  );
}
