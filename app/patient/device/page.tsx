"use client";

import * as React from "react";
import Link from "next/link";
import { AppShell } from "@/components/ui/AppShell";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { INITIAL_DEVICES } from "@/lib/services/mock-data";
import { Cpu, ArrowLeft, RefreshCw, HelpCircle, CheckCircle2, AlertTriangle, ShieldCheck } from "lucide-react";

export default function PatientDevicePage() {
  const device = INITIAL_DEVICES[0];
  const [testing, setTesting] = React.useState(false);
  const [testResult, setTestResult] = React.useState<string | null>(null);

  const runDiagnostic = () => {
    setTesting(true);
    setTestResult(null);
    setTimeout(() => {
      setTesting(false);
      setTestResult("All 4 sensor channels responding within nominal range (ADC jitter < 1.2%).");
    }, 1500);
  };

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
                My Edge Device & Sensors (W4.5)
              </h1>
              <p className="text-xs text-slate-500 mt-1">
                Hardware: {device.serialNumber} • Firmware {device.firmwareVersion}
              </p>
            </div>
          </div>

          <Button
            size="sm"
            variant="outline"
            loading={testing}
            onClick={runDiagnostic}
            className="gap-1.5"
          >
            <RefreshCw className="h-4 w-4" /> Run Live Diagnostics
          </Button>
        </div>

        {testResult && (
          <div className="p-3 bg-emerald-50 border border-emerald-200 text-xs font-semibold text-emerald-800 rounded-lg flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
            {testResult}
          </div>
        )}

        {/* Live Channel Readiness Matrix */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Sensor Hardware Readiness Matrix</CardTitle>
              <CardDescription>
                Continuous status telemetry streamed over BLE / WiFi.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between p-3 rounded-lg border border-slate-100 bg-slate-50 text-xs">
                <div>
                  <p className="font-semibold text-slate-900">ESP32-S3 Microcontroller</p>
                  <p className="text-slate-500 text-[11px]">Primary SoC & FreeRTOS Telemetry Loop</p>
                </div>
                <StatusBadge status="healthy" labelOverride="ONLINE (94%)" size="sm" />
              </div>

              <div className="flex items-center justify-between p-3 rounded-lg border border-slate-100 bg-slate-50 text-xs">
                <div>
                  <p className="font-semibold text-slate-900">IMU 1 — Thigh Segment</p>
                  <p className="text-slate-500 text-[11px]">Accelerometer / Gyroscope (Sagittal Angle)</p>
                </div>
                <StatusBadge status="healthy" labelOverride="NOMINAL" size="sm" />
              </div>

              <div className="flex items-center justify-between p-3 rounded-lg border border-slate-100 bg-slate-50 text-xs">
                <div>
                  <p className="font-semibold text-slate-900">IMU 2 — Shank Segment</p>
                  <p className="text-slate-500 text-[11px]">Lower Leg Inflection Angle</p>
                </div>
                <StatusBadge status="healthy" labelOverride="NOMINAL" size="sm" />
              </div>

              <div className="flex items-center justify-between p-3 rounded-lg border border-slate-100 bg-slate-50 text-xs">
                <div>
                  <p className="font-semibold text-slate-900">Foot Insole FSRs (Heel & Toe)</p>
                  <p className="text-slate-500 text-[11px]">Weight-bearing tactile load resistance</p>
                </div>
                <StatusBadge status="healthy" labelOverride="NOMINAL" size="sm" />
              </div>

              <div className="flex items-center justify-between p-3 rounded-lg border border-slate-100 bg-slate-50 text-xs">
                <div>
                  <p className="font-semibold text-slate-900">Skin Temperature Probe (NTC)</p>
                  <p className="text-slate-500 text-[11px]">Localized thermal monitoring</p>
                </div>
                <StatusBadge status="healthy" labelOverride="32.8°C (NOMINAL)" size="sm" />
              </div>
            </CardContent>
          </Card>

          {/* Troubleshooting Guide */}
          <Card>
            <CardHeader>
              <CardTitle>Troubleshooting & Sensor Maintenance</CardTitle>
              <CardDescription>
                Common hardware resolution steps for patients.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 text-xs">
              <div className="space-y-1">
                <h4 className="font-bold text-slate-900 flex items-center gap-1.5">
                  <span className="h-4 w-4 rounded-full bg-slate-100 text-slate-700 flex items-center justify-center text-[10px]">1</span>
                  Knee Brace Straps Feel Loose?
                </h4>
                <p className="text-slate-600 pl-5 leading-relaxed">
                  Fasten both elastic velcro straps snugly around the distal thigh and proximal shank. Proper alignment prevents IMU axis slippage during knee flexion.
                </p>
              </div>

              <div className="space-y-1">
                <h4 className="font-bold text-slate-900 flex items-center gap-1.5">
                  <span className="h-4 w-4 rounded-full bg-slate-100 text-slate-700 flex items-center justify-center text-[10px]">2</span>
                  Status LED Blinking Yellow (Degraded)?
                </h4>
                <p className="text-slate-600 pl-5 leading-relaxed">
                  A yellow light signifies intermittent telemetry packet loss. Ensure your phone or home hub is within 5 meters of your knee brace.
                </p>
              </div>

              <div className="space-y-1">
                <h4 className="font-bold text-slate-900 flex items-center gap-1.5">
                  <span className="h-4 w-4 rounded-full bg-slate-100 text-slate-700 flex items-center justify-center text-[10px]">3</span>
                  Charging the Battery:
                </h4>
                <p className="text-slate-600 pl-5 leading-relaxed">
                  Use the provided USB-C clinical charging cable. A full charge takes approximately 45 minutes and lasts up to 14 days of typical home rehabilitation routines.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </AppShell>
  );
}

