"use client";

import * as React from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { INITIAL_SESSIONS } from "@/lib/services/mock-data";
import { Printer, ArrowLeft, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/Button";

export default function PrintableReportPage() {
  const params = useParams();
  const sessionId = (params?.id as string) || "ses_2026_1104_01";
  const session = INITIAL_SESSIONS.find((s) => s.id === sessionId) || INITIAL_SESSIONS[0];

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="min-h-screen bg-slate-100 py-8 px-4 print:p-0 print:bg-white text-slate-900">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Top Print Control (Hidden in Print) */}
        <div className="flex items-center justify-between print:hidden">
          <Link href={`/doctor/sessions/${session.id}`}>
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
              <p className="font-mono font-bold text-slate-800">RECORD: {session.id}</p>
              <p className="text-slate-500">Generated: {new Date().toLocaleDateString()}</p>
              <p className="text-slate-500">Classification: Official Clinical Telemetry Record</p>
            </div>
          </div>

          {/* Demographics Summary */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-4 rounded-lg bg-slate-50 border border-slate-200 text-xs">
            <div>
              <span className="text-slate-400 block font-semibold uppercase text-[10px]">Patient Name</span>
              <span className="font-bold text-slate-900 text-sm">{session.patientName}</span>
              <span className="text-slate-500 block font-mono text-[10px]">{session.patientId}</span>
            </div>
            <div>
              <span className="text-slate-400 block font-semibold uppercase text-[10px]">Supervising Clinician</span>
              <span className="font-bold text-slate-900">Dr. Marcus Vance, MD</span>
              <span className="text-slate-500 block text-[10px]">Consultant Orthopedic Surgeon</span>
            </div>
            <div>
              <span className="text-slate-400 block font-semibold uppercase text-[10px]">Session Timestamp</span>
              <span className="font-bold text-slate-900">{new Date(session.startedAt).toLocaleString()}</span>
              <span className="text-slate-500 block text-[10px]">Duration: {Math.round(session.durationSeconds / 60)} minutes</span>
            </div>
            <div>
              <span className="text-slate-400 block font-semibold uppercase text-[10px]">Prescription Protocol</span>
              <span className="font-bold text-slate-900">{session.exerciseName}</span>
              <span className="text-teal-700 block font-semibold text-[10px]">Plan Version {session.planVersion}</span>
            </div>
          </div>

          {/* Key Range of Motion & Biomechanical Findings */}
          <div className="space-y-3">
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-800 border-b pb-1">
              1. Kinematic & Biomechanical Metrics
            </h3>
            <table className="w-full text-xs text-left border border-slate-200">
              <thead className="bg-slate-50 font-semibold text-slate-600 border-b border-slate-200">
                <tr>
                  <th className="p-2.5">Kinematic Parameter</th>
                  <th className="p-2.5">Target Value</th>
                  <th className="p-2.5">Recorded Value</th>
                  <th className="p-2.5">Clinical Concordance Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                <tr>
                  <td className="p-2.5 font-medium">Max Knee Flexion (Sagittal Plane)</td>
                  <td className="p-2.5 font-mono">≥ 100°</td>
                  <td className="p-2.5 font-mono font-bold text-teal-800">{session.maxFlexionDeg}°</td>
                  <td className="p-2.5 text-emerald-700 font-semibold">Exceeded Baseline Goal (+2°)</td>
                </tr>
                <tr>
                  <td className="p-2.5 font-medium">Terminal Extension Lockout</td>
                  <td className="p-2.5 font-mono">0°</td>
                  <td className="p-2.5 font-mono font-bold text-slate-800">{session.maxExtensionDeg}°</td>
                  <td className="p-2.5 text-emerald-700 font-semibold">Near-Complete Extension Lockout</td>
                </tr>
                <tr>
                  <td className="p-2.5 font-medium">Completed Repetitions (Self-Reported)</td>
                  <td className="p-2.5 font-mono">{session.targetReps} reps</td>
                  <td className="p-2.5 font-mono font-bold text-slate-800">{session.patientReportedReps} reps</td>
                  <td className="p-2.5 text-emerald-700 font-semibold">Target Completed</td>
                </tr>
                <tr>
                  <td className="p-2.5 font-medium">Completed Repetitions (IMU Sensor Count)</td>
                  <td className="p-2.5 font-mono">{session.targetReps} reps</td>
                  <td className="p-2.5 font-mono font-bold text-teal-800">{session.sensorEstimatedReps} reps</td>
                  <td className="p-2.5 text-emerald-700 font-semibold">100% Repetition Agreement</td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Clinician Review Observations */}
          <div className="space-y-2">
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-800 border-b pb-1">
              2. Physician Clinical Review Notes
            </h3>
            <div className="p-4 rounded-lg bg-slate-50 border border-slate-200 text-xs text-slate-800 leading-relaxed italic">
              &ldquo;{session.reviewNotes || "Patient tolerated session well. Knee flexion progressed symmetrically with steady eccentric return. No adverse sensor rail faults detected."}&rdquo;
            </div>
            <div className="flex justify-between items-center pt-4 text-xs text-slate-500">
              <span>Electronically signed by Dr. Marcus Vance, MD</span>
              <span className="font-mono">Audit ID: SIG_2026_MARCUS_VANCE_MD</span>
            </div>
          </div>

          {/* Mandatory Non-Diagnostic Legal Disclaimer (Task W5.4) */}
          <div className="pt-6 border-t border-slate-300">
            <div className="p-3 bg-amber-50 border border-amber-200 text-amber-900 rounded text-center text-xs font-semibold">
              Legal Disclaimer: University Demonstration System. Non-diagnostic. Values for research monitoring only.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

