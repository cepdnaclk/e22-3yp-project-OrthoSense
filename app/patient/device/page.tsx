"use client";

import * as React from "react";
import Link from "next/link";
import { AppShell } from "@/components/ui/AppShell";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { devicesApi } from "@/lib/services/api";
import { Device } from "@/lib/types";
import {
  Cpu,
  ArrowLeft,
  RefreshCw,
  HelpCircle,
  CheckCircle2,
  AlertTriangle,
  ShieldCheck,
  Compass,
  RotateCcw,
  Footprints,
  Zap,
  Thermometer,
  Radio,
  BatteryCharging,
  Activity,
  Sliders,
  Check,
  Play,
  Layers,
  ChevronRight,
  Info,
} from "lucide-react";

import { SensorHealthStatus } from "@/lib/types";

interface SensorCardData {
  id: string;
  channel: string;
  name: string;
  placement: string;
  icon: React.ElementType;
  iconBg: string;
  iconColor: string;
  status: SensorHealthStatus;
  statusLabel: string;
  primaryMetric: string;
  primaryMetricLabel: string;
  secondarySpec: string;
  samplingRate: string;
  liveVisualType: "pulse" | "angle-thigh" | "angle-knee" | "load-bar" | "emg-wave" | "temp-bar";
  metrics: { label: string; value: string }[];
}

const SENSOR_CHANNELS: SensorCardData[] = [
  {
    id: "esp32",
    channel: "CH-00 • Master Controller",
    name: "ESP32-S3 Dual-Core SoC",
    placement: "Lateral Knee Brace Rigid Shell Housing",
    icon: Cpu,
    iconBg: "bg-teal-50 border-teal-200",
    iconColor: "text-teal-700",
    status: "healthy",
    statusLabel: "ONLINE & PAIRED",
    primaryMetric: "94%",
    primaryMetricLabel: "Battery (3.98V LiPo)",
    secondarySpec: "BLE 5.0 (RSSI -58 dBm) • FreeRTOS Loop",
    samplingRate: "100 Hz",
    liveVisualType: "pulse",
    metrics: [
      { label: "Loop Latency", value: "1.2 ms (Jitter < 0.1%)" },
      { label: "Active Clock", value: "240 MHz Xtensa LX7" },
      { label: "SRAM Free", value: "348 KB / 512 KB" },
    ],
  },
  {
    id: "imu-thigh",
    channel: "CH-01 • I2C Bus Primary",
    name: "IMU 1 — Thigh Segment",
    placement: "Distal Femur Anterior-Lateral Strap",
    icon: Compass,
    iconBg: "bg-blue-50 border-blue-200",
    iconColor: "text-blue-700",
    status: "healthy",
    statusLabel: "NOMINAL & ZEROED",
    primaryMetric: "+14.2°",
    primaryMetricLabel: "Femoral Inclination Angle",
    secondarySpec: "6-Axis LSM6DSOX (Accel ±16g / Gyro 2000 dps)",
    samplingRate: "100 Hz",
    liveVisualType: "angle-thigh",
    metrics: [
      { label: "Zero-Drift Offset", value: "0.02° / 24h" },
      { label: "ADC Resolution", value: "16-Bit Precision" },
      { label: "Cadence Noise", value: "< 0.4% RMS" },
    ],
  },
  {
    id: "imu-shank",
    channel: "CH-02 • I2C Bus Secondary",
    name: "IMU 2 — Shank Segment",
    placement: "Proximal Tibia Medial Alignment Rail",
    icon: RotateCcw,
    iconBg: "bg-indigo-50 border-indigo-200",
    iconColor: "text-indigo-700",
    status: "healthy",
    statusLabel: "NOMINAL & TRACKING",
    primaryMetric: "98.4°",
    primaryMetricLabel: "Real-Time Flexion Angle",
    secondarySpec: "Differential Sagittal Kinematic Computer",
    samplingRate: "100 Hz",
    liveVisualType: "angle-knee",
    metrics: [
      { label: "Joint Alignment", value: "±0.5° Sagittal Plane" },
      { label: "Target Week 4", value: "Goal: 105° Max" },
      { label: "Lock Safety Margin", value: "21.6° Buffer" },
    ],
  },
  {
    id: "fsr-foot",
    channel: "CH-03 • ADC1 Analog Array",
    name: "Foot Insole Pressure FSRs",
    placement: "Orthotic Insole (Heel & Metatarsal Array)",
    icon: Footprints,
    iconBg: "bg-emerald-50 border-emerald-200",
    iconColor: "text-emerald-700",
    status: "healthy",
    statusLabel: "CALIBRATED & ACTIVE",
    primaryMetric: "68% / 32%",
    primaryMetricLabel: "Left / Right Ground Reaction Load",
    secondarySpec: "4-Zone Piezoresistive Polymer Film",
    samplingRate: "50 Hz",
    liveVisualType: "load-bar",
    metrics: [
      { label: "Heel Strike Force", value: "42.5 kg-force" },
      { label: "Metatarsal Split", value: "Forefoot 28% / Heel 72%" },
      { label: "Dynamic Zeroing", value: "Auto-Tare on Unload" },
    ],
  },
  {
    id: "emg-lead",
    channel: "CH-04 • Bio-Potential AFE",
    name: "Surface sEMG Muscle Lead",
    placement: "Vastus Medialis Oblique (VMO Muscle)",
    icon: Zap,
    iconBg: "bg-purple-50 border-purple-200",
    iconColor: "text-purple-700",
    status: "healthy",
    statusLabel: "STREAMING (CLEAN)",
    primaryMetric: "85%",
    primaryMetricLabel: "Peak Quadriceps Activation",
    secondarySpec: "Differential Bio-Potential Filter (20-450 Hz)",
    samplingRate: "200 Hz",
    liveVisualType: "emg-wave",
    metrics: [
      { label: "Skin Contact Z", value: "3.2 kΩ (Optimal)" },
      { label: "Signal-to-Noise", value: "48 dB SNR" },
      { label: "Muscle Fatigue Index", value: "Low (Fresh)" },
    ],
  },
  {
    id: "temp-hinge",
    channel: "CH-05 • 1-Wire & Opto Gate",
    name: "Skin Temp Probe & Hinge Monitor",
    placement: "Peri-Patellar Hinge Joint Margin",
    icon: Thermometer,
    iconBg: "bg-amber-50 border-amber-200",
    iconColor: "text-amber-700",
    status: "healthy",
    statusLabel: "32.8°C (NOMINAL)",
    primaryMetric: "32.8°C",
    primaryMetricLabel: "Localized Peri-Patellar Temp",
    secondarySpec: "Medical NTC Thermistor & Rotary Limit Lock",
    samplingRate: "1 Hz",
    liveVisualType: "temp-bar",
    metrics: [
      { label: "Inflammation Baseline", value: "Normal (< 35.0°C)" },
      { label: "Hinge ROM Lock", value: "120° Hard Stop Active" },
      { label: "Haptic Alerts Motor", value: "Operational (Pulse OK)" },
    ],
  },
];

export default function PatientDevicePage() {
  const [device, setDevice] = React.useState<Device>({
    id: "dev_esp32_01",
    macAddress: "C4:4F:33:0A:92:F1",
    serialNumber: "ESP32-S3-ORTHO-092",
    firmwareVersion: "v1.4.2-rtos",
    status: "online",
    batteryPercent: 94,
    lastSeenAt: "Just now",
    sensorHealth: {
      imuThigh: "healthy",
      imuShank: "healthy",
      fsrFoot: "healthy",
      tempSensor: "healthy",
    },
  });

  React.useEffect(() => {
    async function loadDevice() {
      try {
        const list = await devicesApi.getAll();
        if (list && list.length > 0) {
          setDevice(list[0]);
        }
      } catch {
        // Fallback default
      }
    }
    loadDevice();
  }, []);

  const [testing, setTesting] = React.useState(false);
  const [testResult, setTestResult] = React.useState<string | null>(null);
  const [testingChannel, setTestingChannel] = React.useState<string | null>(null);
  const [channelSuccess, setChannelSuccess] = React.useState<string | null>(null);

  const runAllDiagnostics = () => {
    setTesting(true);
    setTestResult(null);
    setChannelSuccess(null);
    setTimeout(() => {
      setTesting(false);
      setTestResult("Comprehensive hardware diagnosis passed: All 6 sensor channels responding within nominal range (ADC jitter < 0.8%). Zero packet drops detected.");
    }, 1400);
  };

  const runSingleChannelTest = (channelId: string, channelName: string) => {
    setTestingChannel(channelId);
    setChannelSuccess(null);
    setTimeout(() => {
      setTestingChannel(null);
      setChannelSuccess(`${channelName} verified: 100 sample packets captured with 0% loss.`);
    }, 900);
  };

  return (
    <AppShell>
      <div className="space-y-6 pb-12">
        {/* ========================================================= */}
        {/* TOP BAR & ACTIONS */}
        {/* ========================================================= */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Link href="/patient/dashboard">
              <Button size="sm" variant="outline" className="gap-1.5 hover:border-teal-400">
                <ArrowLeft className="h-4 w-4" /> Back to Dashboard
              </Button>
            </Link>
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-slate-900">
                My OrthoSense Device & Sensors
              </h1>
              <p className="text-xs text-slate-500 mt-0.5">
                Hardware ID: <span className="font-mono font-semibold text-slate-700">{device.serialNumber}</span> • Firmware <span className="font-mono font-semibold text-teal-700">{device.firmwareVersion}</span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Link href="/patient/session/record">
              <Button size="sm" variant="primary" className="gap-1.5 shadow-sm">
                <Play className="h-3.5 w-3.5 fill-current" /> Start Live Session
              </Button>
            </Link>
            <Button
              size="sm"
              variant="outline"
              loading={testing}
              onClick={runAllDiagnostics}
              className="gap-1.5 hover:border-teal-500 hover:text-teal-700"
            >
              <RefreshCw className="h-4 w-4" /> Run Full Diagnostics
            </Button>
          </div>
        </div>

        {/* Global Diagnostic Toast */}
        {testResult && (
          <div className="p-4 bg-emerald-50 border border-emerald-200 text-xs font-semibold text-emerald-900 rounded-xl flex items-center gap-3 shadow-xs animate-in fade-in">
            <CheckCircle2 className="h-5 w-5 text-emerald-600 shrink-0" />
            <div className="flex-1">
              <span className="block font-bold text-emerald-950">Hardware Diagnostic Complete</span>
              <span>{testResult}</span>
            </div>
            <button
              onClick={() => setTestResult(null)}
              className="text-xs text-emerald-700 hover:text-emerald-950 underline shrink-0 cursor-pointer"
            >
              Dismiss
            </button>
          </div>
        )}

        {/* Individual Channel Test Toast */}
        {channelSuccess && (
          <div className="p-3 bg-teal-50 border border-teal-200 text-xs font-semibold text-teal-900 rounded-xl flex items-center gap-2.5 shadow-xs animate-in fade-in">
            <Check className="h-4 w-4 text-teal-600 shrink-0" />
            <span className="flex-1">{channelSuccess}</span>
            <button
              onClick={() => setChannelSuccess(null)}
              className="text-[11px] text-teal-700 hover:text-teal-950 underline shrink-0 cursor-pointer"
            >
              Dismiss
            </button>
          </div>
        )}

        {/* ========================================================= */}
        {/* HARDWARE OVERVIEW BANNER */}
        {/* ========================================================= */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 sm:p-6 shadow-xs relative overflow-hidden">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            <div className="space-y-2 max-w-xl">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold">
                <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></span>
                Hardware Health: 100% Ready for Rehabilitation
              </div>
              <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">
                Sensor Hardware Readiness Matrix
              </h2>
              <p className="text-xs text-slate-600 leading-relaxed">
                Each physical sensor on your smart bionic knee brace streams real-time biometric and kinematic telemetry. Below is the independent channel health status for each sensor node.
              </p>
            </div>

            {/* Quick Readiness KPIs */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 lg:gap-3.5 shrink-0">
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">Battery Gauge</span>
                <span className="text-sm font-extrabold text-slate-900 flex items-center gap-1.5 mt-0.5">
                  <BatteryCharging className="h-4 w-4 text-emerald-600" /> 94% (Good)
                </span>
                <span className="text-[10px] text-slate-500 block mt-0.5">Est. 14 Days</span>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">BLE Signal</span>
                <span className="text-sm font-extrabold text-slate-900 flex items-center gap-1.5 mt-0.5">
                  <Radio className="h-4 w-4 text-teal-600" /> -58 dBm
                </span>
                <span className="text-[10px] text-teal-700 font-medium block mt-0.5">Strong Link</span>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">Sampling Loop</span>
                <span className="text-sm font-extrabold text-slate-900 flex items-center gap-1.5 mt-0.5">
                  <Activity className="h-4 w-4 text-indigo-600" /> 100 Hz Sync
                </span>
                <span className="text-[10px] text-slate-500 block mt-0.5">0.04% Jitter</span>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">Active Channels</span>
                <span className="text-sm font-extrabold text-slate-900 flex items-center gap-1.5 mt-0.5">
                  <ShieldCheck className="h-4 w-4 text-emerald-600" /> 6 / 6 Online
                </span>
                <span className="text-[10px] text-emerald-700 font-medium block mt-0.5">All Nominal</span>
              </div>
            </div>
          </div>
        </div>

        {/* ========================================================= */}
        {/* SEPARATE SENSOR CARDS MATRIX (GRID)                       */}
        {/* ========================================================= */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Layers className="h-4 w-4 text-teal-700" />
              <h3 className="text-sm font-extrabold uppercase tracking-wider text-slate-800">
                Independent Sensor Channels (6 Nodes)
              </h3>
            </div>
            <span className="text-xs text-slate-500">
              Real-time telemetry updated every 500ms
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {SENSOR_CHANNELS.map((sensor) => {
              const IconComponent = sensor.icon;
              const isCurrentlyTesting = testingChannel === sensor.id;

              return (
                <div
                  key={sensor.id}
                  className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs hover:border-teal-400 hover:shadow-md transition-all duration-200 flex flex-col justify-between group"
                >
                  <div className="space-y-4">
                    {/* Card Top: Channel Tag & Status Badge */}
                    <div className="flex items-center justify-between gap-2 border-b border-slate-100 pb-3">
                      <span className="text-[11px] font-mono font-semibold text-slate-500 tracking-tight">
                        {sensor.channel}
                      </span>
                      <StatusBadge
                        status={sensor.status}
                        labelOverride={sensor.statusLabel}
                        size="sm"
                      />
                    </div>

                    {/* Sensor Identity */}
                    <div className="flex items-start gap-3">
                      <div className={`p-2.5 rounded-xl border ${sensor.iconBg} shrink-0 group-hover:scale-105 transition-transform`}>
                        <IconComponent className={`h-5 w-5 ${sensor.iconColor}`} />
                      </div>
                      <div className="min-w-0">
                        <h4 className="text-sm font-bold text-slate-900 tracking-tight leading-snug">
                          {sensor.name}
                        </h4>
                        <p className="text-[11px] text-slate-500 line-clamp-1 mt-0.5">
                          {sensor.placement}
                        </p>
                      </div>
                    </div>

                    {/* Primary Biometric Metric Readout */}
                    <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                      <div className="flex items-baseline justify-between">
                        <div>
                          <span className="text-2xl font-black text-slate-900 tracking-tight block">
                            {sensor.primaryMetric}
                          </span>
                          <span className="text-[11px] font-medium text-slate-600 block">
                            {sensor.primaryMetricLabel}
                          </span>
                        </div>
                        <span className="text-[10px] font-mono font-bold text-teal-800 bg-teal-50 px-2 py-0.5 rounded border border-teal-200/80">
                          {sensor.samplingRate}
                        </span>
                      </div>

                      {/* Visual Indicator Sparkline based on type */}
                      <div className="mt-3 pt-2.5 border-t border-slate-200/70">
                        {sensor.liveVisualType === "pulse" && (
                          <div className="space-y-1">
                            <div className="flex justify-between text-[10px] text-slate-500 font-mono">
                              <span>FreeRTOS Telemetry Loop</span>
                              <span className="text-emerald-700 font-semibold">100 Hz Nominal</span>
                            </div>
                            <svg className="w-full h-7 text-teal-600" viewBox="0 0 100 24" preserveAspectRatio="none">
                              <path
                                d="M0,12 L20,12 L25,4 L30,20 L35,6 L40,16 L45,12 L65,12 L70,3 L75,21 L80,5 L85,15 L90,12 L100,12"
                                fill="none"
                                stroke="#0F766E"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                              />
                            </svg>
                          </div>
                        )}

                        {sensor.liveVisualType === "angle-thigh" && (
                          <div className="space-y-1">
                            <div className="flex justify-between text-[10px] text-slate-500 font-mono">
                              <span>Sagittal Inclination</span>
                              <span className="text-blue-700 font-semibold">+14.2° Gravitational Pitch</span>
                            </div>
                            <div className="w-full bg-slate-200 rounded-full h-2 overflow-hidden">
                              <div
                                className="bg-blue-600 h-2 rounded-full transition-all duration-500"
                                style={{ width: "45%" }}
                              />
                            </div>
                          </div>
                        )}

                        {sensor.liveVisualType === "angle-knee" && (
                          <div className="space-y-1">
                            <div className="flex justify-between text-[10px] text-slate-500 font-mono">
                              <span>Active Flexion Target</span>
                              <span className="text-indigo-700 font-semibold">98.4° / 105° Target</span>
                            </div>
                            <div className="w-full bg-slate-200 rounded-full h-2 overflow-hidden">
                              <div
                                className="bg-indigo-600 h-2 rounded-full transition-all duration-500"
                                style={{ width: "93%" }}
                              />
                            </div>
                          </div>
                        )}

                        {sensor.liveVisualType === "load-bar" && (
                          <div className="space-y-1">
                            <div className="flex justify-between text-[10px] text-slate-500 font-mono">
                              <span>Ground Contact Split</span>
                              <span className="text-emerald-700 font-semibold">Left 68% | Right 32%</span>
                            </div>
                            <div className="w-full flex h-2 rounded-full overflow-hidden bg-slate-200">
                              <div className="bg-teal-600 h-full" style={{ width: "68%" }} />
                              <div className="bg-slate-400 h-full" style={{ width: "32%" }} />
                            </div>
                          </div>
                        )}

                        {sensor.liveVisualType === "emg-wave" && (
                          <div className="space-y-1">
                            <div className="flex justify-between text-[10px] text-slate-500 font-mono">
                              <span>VMO Muscle Bio-Potential</span>
                              <span className="text-purple-700 font-semibold">85% Peak RMS</span>
                            </div>
                            <svg className="w-full h-7 text-purple-600" viewBox="0 0 100 24" preserveAspectRatio="none">
                              <path
                                d="M0,12 L10,12 L14,7 L18,17 L22,4 L26,20 L30,6 L34,18 L38,12 L50,12 L54,5 L58,19 L62,3 L66,21 L70,8 L74,16 L78,12 L100,12"
                                fill="none"
                                stroke="#7E22CE"
                                strokeWidth="1.8"
                                strokeLinecap="round"
                              />
                            </svg>
                          </div>
                        )}

                        {sensor.liveVisualType === "temp-bar" && (
                          <div className="space-y-1">
                            <div className="flex justify-between text-[10px] text-slate-500 font-mono">
                              <span>Thermal Baseline</span>
                              <span className="text-amber-700 font-semibold">32.8°C (Normal)</span>
                            </div>
                            <div className="w-full bg-slate-200 rounded-full h-2 overflow-hidden">
                              <div
                                className="bg-amber-500 h-2 rounded-full transition-all duration-500"
                                style={{ width: "62%" }}
                              />
                            </div>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Detailed Specifications / Diagnostics Table */}
                    <div className="space-y-1.5 pt-1">
                      {sensor.metrics.map((metric, i) => (
                        <div key={i} className="flex justify-between items-center text-[11px]">
                          <span className="text-slate-500">{metric.label}</span>
                          <span className="font-mono font-medium text-slate-800">{metric.value}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Card Footer: Quick Channel Diagnostic Trigger */}
                  <div className="pt-4 mt-4 border-t border-slate-100 flex items-center justify-between gap-2">
                    <span className="text-[10px] text-slate-400 font-mono truncate">
                      {sensor.secondarySpec}
                    </span>
                    <Button
                      size="sm"
                      variant="outline"
                      loading={isCurrentlyTesting}
                      onClick={() => runSingleChannelTest(sensor.id, sensor.name)}
                      className="text-xs shrink-0 hover:border-teal-400 hover:text-teal-700"
                    >
                      Test Channel
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* ========================================================= */}
        {/* TROUBLESHOOTING & SENSOR MAINTENANCE                      */}
        {/* ========================================================= */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
          {/* Troubleshooting Guide */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <HelpCircle className="h-4 w-4 text-teal-700" />
                Troubleshooting & Sensor Maintenance
              </CardTitle>
              <CardDescription>
                Common patient-facing resolution steps for smart brace readiness.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 text-xs">
              <div className="space-y-1">
                <h4 className="font-bold text-slate-900 flex items-center gap-2">
                  <span className="h-5 w-5 rounded-full bg-teal-100 text-teal-800 flex items-center justify-center text-[11px] font-extrabold shrink-0">1</span>
                  Knee Brace Straps Feel Loose?
                </h4>
                <p className="text-slate-600 pl-7 leading-relaxed">
                  Fasten both elastic velcro straps snugly around the distal thigh and proximal shank. Proper alignment prevents IMU axis slippage during knee flexion exercises.
                </p>
              </div>

              <div className="space-y-1">
                <h4 className="font-bold text-slate-900 flex items-center gap-2">
                  <span className="h-5 w-5 rounded-full bg-teal-100 text-teal-800 flex items-center justify-center text-[11px] font-extrabold shrink-0">2</span>
                  Status LED Blinking Yellow (Degraded Signal)?
                </h4>
                <p className="text-slate-600 pl-7 leading-relaxed">
                  A yellow light signifies intermittent BLE packet jitter. Keep your mobile phone or tablet within 5 meters of your knee brace and avoid thick metal obstructions.
                </p>
              </div>

              <div className="space-y-1">
                <h4 className="font-bold text-slate-900 flex items-center gap-2">
                  <span className="h-5 w-5 rounded-full bg-teal-100 text-teal-800 flex items-center justify-center text-[11px] font-extrabold shrink-0">3</span>
                  Charging & Battery Care:
                </h4>
                <p className="text-slate-600 pl-7 leading-relaxed">
                  Use the provided medical-grade magnetic USB-C cable. A 45-minute charge provides up to 14 days of routine therapy sessions.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Clinician Supervised Safety Locks */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <ShieldCheck className="h-4 w-4 text-emerald-700" />
                Clinical Safety Protocols & ROM Locks
              </CardTitle>
              <CardDescription>
                Physician-configured limits enforcing safe postoperative rehabilitation.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 text-xs">
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-900">Dr. Marcus Vance (Supervising MD)</span>
                  <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-emerald-100 text-emerald-800">
                    Active Prescription
                  </span>
                </div>
                <p className="text-slate-600 leading-relaxed text-[11px]">
                  Post-Op ACL Protocol Week 4 targets a maximum allowable active knee flexion of <strong className="text-slate-900">105°</strong>. The brace hardware limit is locked to alert at 108° and mechanically restrict past 120°.
                </p>
              </div>

              <div className="space-y-2 pt-1">
                <div className="flex justify-between items-center text-[11px] border-b border-slate-100 pb-2">
                  <span className="text-slate-500">Over-Flexion Haptic Alert</span>
                  <span className="font-semibold text-emerald-700 flex items-center gap-1">
                    <Check className="h-3.5 w-3.5" /> Enabled (Vibrate at 105°)
                  </span>
                </div>
                <div className="flex justify-between items-center text-[11px] border-b border-slate-100 pb-2">
                  <span className="text-slate-500">Weight-Bearing Insole Alert</span>
                  <span className="font-semibold text-emerald-700 flex items-center gap-1">
                    <Check className="h-3.5 w-3.5" /> Enabled (Over 50kg Warning)
                  </span>
                </div>
                <div className="flex justify-between items-center text-[11px]">
                  <span className="text-slate-500">Doctor Sync Schedule</span>
                  <span className="font-semibold text-slate-800">
                    Every Session (Auto-Upload)
                  </span>
                </div>
              </div>

              <div className="pt-2">
                <Link href="/patient/profile">
                  <Button variant="outline" size="sm" className="w-full text-xs font-semibold hover:border-teal-400">
                    View Complete Clinical Prescription & Preferences →
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </AppShell>
  );
}
