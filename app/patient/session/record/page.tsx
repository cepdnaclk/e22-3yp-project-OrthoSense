"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AppShell } from "@/components/ui/AppShell";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { Input } from "@/components/ui/Input";
import { INITIAL_PLANS, INITIAL_DEVICES } from "@/lib/services/mock-data";
import {
  Play,
  Pause,
  Square,
  RotateCcw,
  CheckCircle2,
  AlertCircle,
  Radio,
  BatteryCharging,
  ArrowLeft,
  ChevronRight,
} from "lucide-react";

export default function RecordSessionPage() {
  const router = useRouter();
  const plan = INITIAL_PLANS[0];
  const device = INITIAL_DEVICES[0];

  // Pre-flight checks
  const [preflightPassed, setPreflightPassed] = React.useState(false);
  const [preflightStep, setPreflightStep] = React.useState(0);

  // Recording State
  const [sessionState, setSessionState] = React.useState<"idle" | "running" | "paused" | "finished">("idle");
  const [elapsedSeconds, setElapsedSeconds] = React.useState(0);
  const [sensorReps, setSensorReps] = React.useState(0);
  const [patientReps, setPatientReps] = React.useState(10);
  const [currentAngle, setCurrentAngle] = React.useState(15);
  const [submitting, setSubmitting] = React.useState(false);
  const [finishSuccess, setFinishSuccess] = React.useState(false);

  // Run preflight check
  React.useEffect(() => {
    const timer1 = setTimeout(() => setPreflightStep(1), 500); // Check hardware ping
    const timer2 = setTimeout(() => setPreflightStep(2), 1100); // Check IMU1 & IMU2
    const timer3 = setTimeout(() => {
      setPreflightStep(3);
      setPreflightPassed(true);
    }, 1800);

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
      clearTimeout(timer3);
    };
  }, []);

  // Timer loop when running
  React.useEffect(() => {
    let interval: NodeJS.Timeout;
    if (sessionState === "running") {
      interval = setInterval(() => {
        setElapsedSeconds((prev) => prev + 1);

        // Simulate real-time angle oscillation
        const t = Date.now() / 1000;
        const angle = Math.round(50 + 45 * Math.sin(t * 1.5));
        setCurrentAngle(Math.max(2, angle));

        // Increment rep every 5 seconds of movement
        if (elapsedSeconds > 0 && elapsedSeconds % 5 === 0) {
          setSensorReps((r) => Math.min(10, r + 1));
        }
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [sessionState, elapsedSeconds]);

  const handleStart = () => {
    setSessionState("running");
  };

  const handlePause = () => {
    setSessionState("paused");
  };

  const handleResume = () => {
    setSessionState("running");
  };

  const handleFinish = () => {
    setSessionState("finished");
    setPatientReps(sensorReps || 10);
  };

  const handleAbandon = () => {
    if (confirm("Are you sure you want to abandon this session? Recorded partial data will not be submitted.")) {
      router.push("/patient/dashboard");
    }
  };

  const handleSubmitSession = () => {
    setSubmitting(true);
    setTimeout(() => {
      setSubmitting(false);
      setFinishSuccess(true);
      setTimeout(() => {
        router.push("/patient/dashboard");
      }, 2000);
    }, 800);
  };

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  };

  return (
    <AppShell>
      <div className="space-y-6 max-w-4xl mx-auto">
        <div className="flex items-center justify-between">
          <Link href="/patient/dashboard">
            <Button size="sm" variant="outline" className="gap-1.5">
              <ArrowLeft className="h-4 w-4" /> Back to Dashboard
            </Button>
          </Link>
          <span className="text-xs text-slate-500 font-mono">
            Device: {device.serialNumber} (Battery: {device.batteryPercent}%)
          </span>
        </div>

        {/* Pre-Flight Sensor Check Card (Task W4.3) */}
        {!preflightPassed ? (
          <Card className="border-teal-300">
            <CardHeader>
              <CardTitle>ESP32-S3 Hardware Pre-Flight Verification</CardTitle>
              <CardDescription>
                Checking edge sensor telemetry connectivity before session initialization...
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between text-xs p-2.5 rounded-lg bg-slate-50">
                <span>1. Microcontroller WiFi / BLE Handshake:</span>
                {preflightStep >= 1 ? (
                  <StatusBadge status="healthy" labelOverride="CONNECTED" size="sm" />
                ) : (
                  <span className="text-slate-400 animate-pulse">Pinging...</span>
                )}
              </div>
              <div className="flex items-center justify-between text-xs p-2.5 rounded-lg bg-slate-50">
                <span>2. Dual IMU Accelerometer Alignment:</span>
                {preflightStep >= 2 ? (
                  <StatusBadge status="healthy" labelOverride="IMU 1 & 2 READY" size="sm" />
                ) : (
                  <span className="text-slate-400">Waiting...</span>
                )}
              </div>
              <div className="flex items-center justify-between text-xs p-2.5 rounded-lg bg-slate-50">
                <span>3. Battery Charge Level:</span>
                {preflightStep >= 3 ? (
                  <StatusBadge status="healthy" labelOverride={`${device.batteryPercent}% (SUFFICIENT)`} size="sm" />
                ) : (
                  <span className="text-slate-400">Verifying...</span>
                )}
              </div>
            </CardContent>
          </Card>
        ) : sessionState !== "finished" ? (
          /* Active Recording Console */
          <div className="space-y-6">
            <Card className="overflow-hidden border-2 border-teal-600">
              <div className="bg-[#0F766E] text-white p-4 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Radio className={sessionState === "running" ? "h-5 w-5 animate-pulse text-teal-200" : "h-5 w-5"} />
                  <span className="font-bold text-sm tracking-wide uppercase">
                    {sessionState === "running"
                      ? "Recording Session in Progress — Exercise at your comfortable pace"
                      : sessionState === "paused"
                      ? "Session Paused"
                      : "Ready to Begin Routine"}
                  </span>
                </div>
                <span className="font-mono text-xl font-bold bg-teal-800/80 px-3 py-1 rounded-md">
                  {formatTime(elapsedSeconds)}
                </span>
              </div>

              <CardContent className="p-6 space-y-6">
                <div className="text-center space-y-1">
                  <h2 className="text-xl font-bold text-slate-900">
                    Active Knee Flexion & Extension
                  </h2>
                  <p className="text-xs text-slate-500">
                    Goal: 10 repetitions • Keep movement smooth and controlled
                  </p>
                </div>

                {/* Live Knee Angle Meter */}
                <div className="flex flex-col items-center justify-center p-6 bg-slate-50 rounded-2xl border border-slate-200 space-y-3">
                  <span className="text-xs uppercase font-semibold text-slate-400">
                    Live Knee Joint Angle
                  </span>
                  <div className="text-5xl font-extrabold text-[#0F766E] font-mono">
                    {currentAngle}°
                  </div>
                  <div className="w-full max-w-md bg-slate-200 h-3 rounded-full overflow-hidden">
                    <div
                      className="bg-[#0F766E] h-full transition-all duration-300"
                      style={{ width: `${Math.min(100, (currentAngle / 105) * 100)}%` }}
                    ></div>
                  </div>
                  <span className="text-xs text-slate-500">
                    Target Flexion: <span className="font-semibold text-slate-800">105°</span>
                  </span>
                </div>

                {/* Live Rep Counters */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 rounded-xl border border-slate-200 bg-white text-center space-y-1">
                    <span className="text-xs font-semibold text-slate-400 uppercase">
                      Sensor-Estimated Reps
                    </span>
                    <p className="text-3xl font-extrabold text-teal-800 font-mono">
                      {sensorReps} <span className="text-sm font-normal text-slate-400">/ 10</span>
                    </p>
                    <p className="text-[11px] text-teal-600 font-medium">Computed by ESP32-S3 IMUs</p>
                  </div>

                  <div className="p-4 rounded-xl border border-slate-200 bg-white text-center space-y-1">
                    <span className="text-xs font-semibold text-slate-400 uppercase">
                      Target Repetitions
                    </span>
                    <p className="text-3xl font-extrabold text-slate-800 font-mono">10</p>
                    <p className="text-[11px] text-slate-500">Prescribed by Dr. Vance</p>
                  </div>
                </div>

                {/* Control Action Buttons */}
                <div className="flex flex-wrap items-center justify-center gap-3 pt-4 border-t border-slate-100">
                  {sessionState === "idle" && (
                    <Button size="lg" variant="primary" onClick={handleStart} className="gap-2 px-8">
                      <Play className="h-5 w-5 fill-current" /> Start Recording
                    </Button>
                  )}
                  {sessionState === "running" && (
                    <>
                      <Button size="lg" variant="secondary" onClick={handlePause} className="gap-2">
                        <Pause className="h-5 w-5" /> Pause
                      </Button>
                      <Button size="lg" variant="primary" onClick={handleFinish} className="gap-2 px-6">
                        <Square className="h-5 w-5 fill-current" /> Finish Session
                      </Button>
                      <Button size="lg" variant="ghost" onClick={handleAbandon} className="text-red-600 hover:bg-red-50">
                        Abandon
                      </Button>
                    </>
                  )}
                  {sessionState === "paused" && (
                    <>
                      <Button size="lg" variant="primary" onClick={handleResume} className="gap-2 px-6">
                        <Play className="h-5 w-5 fill-current" /> Resume
                      </Button>
                      <Button size="lg" variant="secondary" onClick={handleFinish} className="gap-2">
                        <Square className="h-5 w-5 fill-current" /> Finish Session
                      </Button>
                    </>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        ) : (
          /* Dual Completion Tracking Summary Screen (Task W4.4) */
          <Card className="border-teal-400">
            <CardHeader className="text-center pb-2">
              <div className="h-12 w-12 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto mb-2">
                <CheckCircle2 className="h-6 w-6" />
              </div>
              <CardTitle className="text-xl">Session Completed!</CardTitle>
              <CardDescription>
                Confirm your completed repetitions before transmitting telemetry to your clinical team.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6 pt-4">
              {finishSuccess ? (
                <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-center space-y-2">
                  <p className="font-bold">Telemetry Data Successfully Uploaded</p>
                  <p className="text-xs text-emerald-700">Redirecting to your dashboard...</p>
                </div>
              ) : (
                <>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* Field 1: Patient-reported repetitions */}
                    <div className="p-4 rounded-xl border border-blue-200 bg-blue-50/50 space-y-3">
                      <div>
                        <span className="text-xs uppercase font-bold text-blue-800">Field 1 (Manual)</span>
                        <h4 className="text-sm font-semibold text-slate-900">Your Self-Reported Reps</h4>
                        <p className="text-xs text-slate-500">How many reps did you complete?</p>
                      </div>
                      <Input
                        type="number"
                        min="0"
                        max="50"
                        value={patientReps}
                        onChange={(e) => setPatientReps(parseInt(e.target.value) || 0)}
                        className="text-lg font-bold"
                      />
                    </div>

                    {/* Field 2: Sensor-derived estimated repetitions */}
                    <div className="p-4 rounded-xl border border-teal-200 bg-teal-50/50 space-y-3">
                      <div>
                        <span className="text-xs uppercase font-bold text-teal-800">Field 2 (Edge Sensor)</span>
                        <h4 className="text-sm font-semibold text-slate-900">Sensor-Derived Reps</h4>
                        <p className="text-xs text-slate-500">Calculated from IMU inflection angles</p>
                      </div>
                      <div className="h-10 px-3 py-2 bg-white rounded-lg border border-teal-300 font-mono font-bold text-lg text-teal-800 flex items-center">
                        {sensorReps || 10} Repetitions
                      </div>
                    </div>
                  </div>

                  <p className="text-xs text-slate-500 text-center leading-relaxed">
                    Note: Both your self-reported count and the sensor-calculated count are preserved side-by-side in your permanent medical telemetry record for Dr. Vance to inspect.
                  </p>

                  <div className="flex justify-end gap-3 pt-2">
                    <Button variant="ghost" onClick={() => router.push("/patient/dashboard")}>
                      Cancel
                    </Button>
                    <Button
                      variant="primary"
                      loading={submitting}
                      onClick={handleSubmitSession}
                      className="px-6"
                    >
                      Submit Session & Upload Telemetry
                    </Button>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </AppShell>
  );
}

