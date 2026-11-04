"use client";

import * as React from "react";
import Link from "next/link";
import { AppShell } from "@/components/ui/AppShell";
import { Button } from "@/components/ui/Button";
import {
  Play,
  Pause,
  ArrowLeft,
  CheckCircle2,
  Clock,
  Dumbbell,
  Maximize2,
  Volume2,
  RotateCcw,
  ShieldCheck,
  ChevronRight,
  AlertTriangle,
  Radio,
  Zap,
} from "lucide-react";

interface ExerciseItem {
  id: string;
  number: number;
  title: string;
  status: "In Progress" | "Completed" | "Pending";
  statusColor: string;
  iconBg: string;
  iconType: "curl" | "raise" | "extension";
  sets: string;
  repsSets: string;
  duration: string;
  activeTimer?: string;
  repsCurrent?: string;
  load?: string;
  videoType: "curl" | "raise" | "extension";
  description: string;
  // Telemetry metrics corresponding to this exercise
  telemetry: {
    kneeFlexion: number;
    angleVariance: string;
    loadDistLeft: number;
    loadDistRight: number;
    quadsPct: number;
    hamstringsPct: number;
  };
}

export default function PatientExercisesPage() {
  const [selectedExerciseId, setSelectedExerciseId] = React.useState<string>("ex_2");
  const [playingVideoId, setPlayingVideoId] = React.useState<string | null>("ex_2");
  const [videoProgress, setVideoProgress] = React.useState<Record<string, number>>({
    ex_1: 45,
    ex_2: 68,
    ex_3: 100,
  });

  const exercises: ExerciseItem[] = [
    {
      id: "ex_1",
      number: 1,
      title: "1. Hamstring Curls",
      status: "In Progress",
      statusColor: "bg-emerald-50 text-emerald-700 border-emerald-200",
      iconBg: "bg-[#0F766E]",
      iconType: "curl",
      sets: "3x12",
      repsSets: "4x10",
      duration: "20 mins",
      videoType: "curl",
      description: "Prone or quadruped controlled knee flexion targeting the biceps femoris with resistance.",
      telemetry: {
        kneeFlexion: 104,
        angleVariance: "0.6°",
        loadDistLeft: 55,
        loadDistRight: 45,
        quadsPct: 40,
        hamstringsPct: 88,
      },
    },
    {
      id: "ex_2",
      number: 2,
      title: "2. Straight Leg Raises",
      status: "Completed",
      statusColor: "bg-emerald-50 text-emerald-700 border-emerald-200",
      iconBg: "bg-[#0284C7]",
      iconType: "raise",
      sets: "04:18",
      repsSets: "4x10",
      duration: "20 mins",
      activeTimer: "04:18",
      repsCurrent: "7/12",
      load: "4.5 kg",
      videoType: "raise",
      description: "Supine straight leg elevation locking the knee at full extension (0°).",
      telemetry: {
        kneeFlexion: 98,
        angleVariance: "0.8°",
        loadDistLeft: 68,
        loadDistRight: 32,
        quadsPct: 85,
        hamstringsPct: 45,
      },
    },
    {
      id: "ex_3",
      number: 3,
      title: "3. Knee Extensions",
      status: "Completed",
      statusColor: "bg-emerald-50 text-emerald-700 border-emerald-200",
      iconBg: "bg-[#0F766E]",
      iconType: "extension",
      sets: "3x12",
      repsSets: "4x10",
      duration: "20 mins",
      videoType: "extension",
      description: "Terminal knee extension strengthening the vastus medialis obliquus (VMO).",
      telemetry: {
        kneeFlexion: 102,
        angleVariance: "0.5°",
        loadDistLeft: 62,
        loadDistRight: 38,
        quadsPct: 92,
        hamstringsPct: 35,
      },
    },
  ];

  const selectedExercise =
    exercises.find((e) => e.id === selectedExerciseId) || exercises[1];

  const togglePlay = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setPlayingVideoId(playingVideoId === id ? null : id);
  };

  return (
    <AppShell>
      <div className="space-y-5 max-w-[1450px] mx-auto pb-10">
        {/* Navigation & Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200">
          <div className="flex items-center gap-3">
            <Link href="/patient/dashboard">
              <Button size="sm" variant="outline" className="gap-1.5 text-xs">
                <ArrowLeft className="h-4 w-4" /> Back to Dashboard
              </Button>
            </Link>
            <div>
              <h1 className="text-xl font-bold tracking-tight text-slate-900">
                Prescribed Exercise Protocols &amp; Live Telemetry
              </h1>
              <p className="text-xs text-slate-500">
                Dr. Marcus Vance, MD • Plan Version 2 (Published 10/25/2026)
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Link href="/patient/session/record">
              <Button size="sm" variant="primary" className="gap-1.5 shadow-xs font-semibold">
                <Play className="h-4 w-4 fill-current" /> Launch Exercise Session Recorder
              </Button>
            </Link>
          </div>
        </div>

        {/* Doctor's Note Strip */}
        <div className="p-3 bg-teal-50 border border-teal-200 rounded-xl text-xs flex items-center justify-between text-teal-900">
          <div className="flex items-center gap-2">
            <ShieldCheck className="h-4 w-4 text-[#0F766E] shrink-0" />
            <span>
              <strong>Clinical Protocol Guidance:</strong> Target knee flexion goal is currently <strong>105°</strong>. Focus on controlled eccentric return and keep cadence smooth.
            </span>
          </div>
          <span className="text-teal-700 font-semibold font-mono text-[11px] shrink-0 hidden sm:inline">
            Week 4 Post-Op ACL
          </span>
        </div>

        {/* 2-COLUMN MAIN LAYOUT: Exercises List (Left) + Telemetry & Alerts (Right) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* ========================================================= */}
          {/* LEFT COLUMN: CURRENT EXERCISES (8 Cols)                   */}
          {/* ========================================================= */}
          <div className="lg:col-span-8 space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="text-xs font-black tracking-wider uppercase text-slate-700">
                CURRENT EXERCISES
              </h2>
              <span className="text-[11px] text-slate-500 font-medium">
                Click an exercise card to inspect telemetry
              </span>
            </div>

            {/* EXERCISE CARDS LIST */}
            <div className="space-y-3.5">
              {exercises.map((item) => {
                const isSelected = selectedExerciseId === item.id;
                const isPlaying = playingVideoId === item.id;
                const progress = videoProgress[item.id] || 50;

                return (
                  <div
                    key={item.id}
                    onClick={() => setSelectedExerciseId(item.id)}
                    className={`rounded-2xl border transition-all duration-200 cursor-pointer p-4 sm:p-5 select-none ${
                      isSelected
                        ? "bg-[#F0F9FF] border-[#38BDF8] shadow-sm ring-1 ring-[#38BDF8]/40"
                        : "bg-white border-slate-200 hover:border-slate-300 shadow-xs hover:bg-slate-50/50"
                    }`}
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-5">
                      {/* Left: Icon, Title, Status, Metrics */}
                      <div className="space-y-3 flex-1 min-w-0">
                        {/* Title & Badge Row */}
                        <div className="flex items-start gap-3.5">
                          {/* Rounded Square Exercise Icon Badge */}
                          <div
                            className={`h-11 w-11 rounded-xl ${item.iconBg} flex items-center justify-center text-white shrink-0 shadow-xs`}
                          >
                            {item.iconType === "curl" && (
                              <svg
                                viewBox="0 0 40 40"
                                className="h-7 w-7"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                              >
                                <circle cx="28" cy="12" r="3.5" fill="currentColor" />
                                <path d="M 28 16 L 22 24 L 12 24" />
                                <path d="M 25 20 L 29 28 L 34 28" />
                                <path d="M 12 24 L 8 16" strokeWidth="2.5" />
                                <path d="M 6 30 L 36 30" stroke="#94A3B8" strokeWidth="1.5" />
                              </svg>
                            )}
                            {item.iconType === "raise" && (
                              <svg
                                viewBox="0 0 40 40"
                                className="h-7 w-7"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                              >
                                <circle cx="20" cy="12" r="3.5" fill="currentColor" />
                                <path d="M 20 16 L 18 26 L 28 26" />
                                <path d="M 28 26 L 36 18" strokeWidth="2.5" />
                                <path d="M 18 26 L 14 34" />
                                <path d="M 6 34 L 34 34" stroke="#94A3B8" strokeWidth="1.5" />
                              </svg>
                            )}
                            {item.iconType === "extension" && (
                              <svg
                                viewBox="0 0 40 40"
                                className="h-7 w-7"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                              >
                                <circle cx="20" cy="10" r="3.5" fill="currentColor" />
                                <path d="M 20 14 L 20 25 L 14 28" />
                                <path d="M 20 25 L 28 25 L 34 20" strokeWidth="2.5" />
                                <path d="M 14 28 L 12 34" />
                                <path d="M 8 34 L 32 34" stroke="#94A3B8" strokeWidth="1.5" />
                              </svg>
                            )}
                          </div>

                          <div className="space-y-1">
                            <h3 className="text-base font-bold text-slate-900 leading-tight">
                              {item.title}
                            </h3>
                            <span
                              className={`inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-semibold border ${item.statusColor}`}
                            >
                              {item.status}
                            </span>
                          </div>
                        </div>

                        {/* 3 Metrics: Status/Timer, Reps/Sets, Duration */}
                        <div className="grid grid-cols-3 max-w-xs gap-4 pt-1 text-slate-700">
                          <div>
                            <span className="text-[11px] text-slate-400 block font-medium">
                              {item.activeTimer ? "Timer" : "Status"}
                            </span>
                            <span className="font-bold text-sm text-slate-800 font-mono">
                              {item.sets}
                            </span>
                          </div>

                          <div>
                            <span className="text-[11px] text-slate-400 block font-medium">
                              Reps/Sets
                            </span>
                            <span className="font-bold text-sm text-slate-800 font-mono">
                              {item.repsSets}
                            </span>
                          </div>

                          <div>
                            <span className="text-[11px] text-slate-400 block font-medium">
                              Duration
                            </span>
                            <span className="font-bold text-sm text-slate-800 font-mono">
                              {item.duration}
                            </span>
                          </div>
                        </div>

                        {/* Detail Sub-Row */}
                        {item.activeTimer && (
                          <div className="flex items-center gap-4 text-xs font-semibold text-slate-700 pt-1 font-mono">
                            <span>
                              Timer: <strong className="text-slate-900">{item.activeTimer}</strong>
                            </span>
                            <span>
                              Reps: <strong className="text-teal-700">{item.repsCurrent}</strong>
                            </span>
                            <span>
                              Load: <strong className="text-slate-900">{item.load}</strong>
                            </span>
                          </div>
                        )}
                      </div>

                      {/* Video Player Thumbnail */}
                      <div className="w-full sm:w-[240px] md:w-[260px] shrink-0">
                        <div className="relative rounded-xl overflow-hidden bg-slate-900 shadow-md group/video border border-slate-700/50 aspect-video">
                          <div className="absolute inset-0 bg-slate-800 flex items-center justify-center overflow-hidden">
                            {item.videoType === "curl" && (
                              <svg viewBox="0 0 300 170" className="w-full h-full object-cover">
                                <rect width="300" height="170" fill="#E2E8F0" />
                                <rect x="30" y="110" width="240" height="40" fill="#3B82F6" opacity="0.3" rx="4" />
                                <circle cx="95" cy="55" r="14" fill="#475569" />
                                <path d="M 95 69 L 115 105 L 180 100" stroke="#1E293B" strokeWidth="16" strokeLinecap="round" strokeLinejoin="round" />
                                <path d="M 115 105 L 115 140" stroke="#1E293B" strokeWidth="8" strokeLinecap="round" />
                                <path d="M 135 105 L 135 140" stroke="#334155" strokeWidth="8" strokeLinecap="round" />
                                <path d="M 180 100 L 180 140" stroke="#1E293B" strokeWidth="10" strokeLinecap="round" />
                                <path d="M 180 100 L 225 80 L 210 50" stroke="#0F766E" strokeWidth="10" strokeLinecap="round" strokeLinejoin="round" />
                                <ellipse cx="215" cy="72" rx="10" ry="14" fill="#0F172A" />
                              </svg>
                            )}

                            {item.videoType === "raise" && (
                              <svg viewBox="0 0 300 170" className="w-full h-full object-cover">
                                <rect width="300" height="170" fill="#E2E8F0" />
                                <rect x="25" y="125" width="250" height="25" fill="#2563EB" opacity="0.35" rx="4" />
                                <circle cx="230" cy="120" r="14" fill="#475569" />
                                <path d="M 220 125 L 175 105 L 140 105" stroke="#1E293B" strokeWidth="18" strokeLinecap="round" strokeLinejoin="round" />
                                <path d="M 185 118 L 155 90" stroke="#334155" strokeWidth="7" strokeLinecap="round" />
                                <path d="M 140 105 L 110 135" stroke="#1E293B" strokeWidth="10" strokeLinecap="round" />
                                <path d="M 140 105 L 130 65 L 95 65" stroke="#0284C7" strokeWidth="10" strokeLinecap="round" strokeLinejoin="round" />
                                <ellipse cx="90" cy="65" rx="10" ry="6" fill="#1E293B" />
                              </svg>
                            )}

                            {item.videoType === "extension" && (
                              <svg viewBox="0 0 300 170" className="w-full h-full object-cover">
                                <rect width="300" height="170" fill="#E2E8F0" />
                                <rect x="25" y="125" width="250" height="25" fill="#2563EB" opacity="0.35" rx="4" />
                                <circle cx="235" cy="120" r="14" fill="#475569" />
                                <path d="M 225 125 L 175 105 L 145 105" stroke="#1E293B" strokeWidth="18" strokeLinecap="round" strokeLinejoin="round" />
                                <path d="M 185 110 L 205 60" stroke="#1E293B" strokeWidth="7" strokeLinecap="round" />
                                <circle cx="208" cy="50" r="9" fill="#0F172A" />
                                <ellipse cx="140" cy="115" rx="16" ry="12" fill="#047857" opacity="0.8" />
                                <path d="M 145 105 L 110 95 L 80 95" stroke="#0F766E" strokeWidth="10" strokeLinecap="round" strokeLinejoin="round" />
                                <ellipse cx="75" cy="95" rx="8" ry="6" fill="#1E293B" />
                              </svg>
                            )}
                          </div>

                          <div className="absolute top-2 left-2 flex items-center gap-1 bg-black/50 text-white p-1 rounded backdrop-blur-xs text-[10px]">
                            <Play className="h-3 w-3 fill-current" />
                          </div>
                          <div className="absolute top-2 right-2 bg-black/50 text-white p-1 rounded backdrop-blur-xs text-[10px]">
                            <Play className="h-3 w-3 fill-current" />
                          </div>

                          <button
                            type="button"
                            onClick={(e) => togglePlay(item.id, e)}
                            className="absolute inset-0 m-auto h-10 w-10 rounded-full bg-black/60 hover:bg-[#0F766E] text-white flex items-center justify-center backdrop-blur-xs transition-all shadow-lg hover:scale-110"
                            aria-label={isPlaying ? "Pause video" : "Play video demonstration"}
                          >
                            {isPlaying ? (
                              <Pause className="h-4 w-4 fill-current" />
                            ) : (
                              <Play className="h-4 w-4 fill-current ml-0.5" />
                            )}
                          </button>

                          <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/90 via-black/60 to-transparent p-2 text-white flex items-center gap-2">
                            <button
                              type="button"
                              onClick={(e) => togglePlay(item.id, e)}
                              className="p-1 hover:text-teal-300"
                            >
                              {isPlaying ? (
                                <Pause className="h-3 w-3 fill-current" />
                              ) : (
                                <Play className="h-3 w-3 fill-current" />
                              )}
                            </button>

                            <div className="flex-1 h-1.5 bg-white/30 rounded-full relative overflow-visible cursor-pointer">
                              <div
                                className="h-full bg-white rounded-full"
                                style={{ width: `${progress}%` }}
                              ></div>
                              <div
                                className="absolute top-1/2 -translate-y-1/2 h-2.5 w-2.5 rounded-full bg-white shadow-sm"
                                style={{ left: `calc(${progress}% - 5px)` }}
                              ></div>
                            </div>

                            <span className="text-[9px] font-mono text-slate-300">
                              {isPlaying ? "0:14" : "0:00"}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* ========================================================= */}
          {/* RIGHT COLUMN: TELEMETRY & RECENT ALERTS (4 Cols)          */}
          {/* ========================================================= */}
          <div className="lg:col-span-4 space-y-4">
            {/* CARD: SMART KNEE BRACE TELEMETRY */}
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs space-y-4">
              <div>
                <h3 className="text-xs font-black tracking-wider uppercase text-slate-800">
                  SMART KNEE BRACE TELEMETRY
                </h3>
                <div className="flex justify-between items-center text-xs text-slate-600 mt-1 font-mono">
                  <span>Device: OrthoSync G2</span>
                  <span>Battery: 92%</span>
                </div>
              </div>

              {/* 1. Knee Flexion Trapezoid Curve */}
              <div className="pt-2 border-t border-slate-100 space-y-1.5">
                <div className="flex items-center justify-between text-xs font-bold text-slate-800">
                  <span>Knee Flexion</span>
                  <span className="font-mono text-base text-[#0284C7]">
                    {selectedExercise.telemetry.kneeFlexion}°
                  </span>
                </div>

                <div className="bg-slate-50 rounded-lg p-2 border border-slate-100">
                  <svg viewBox="0 0 240 75" className="w-full h-auto">
                    {/* Y Axis Grid */}
                    <text x="22" y="14" fontSize="8" fill="#94A3B8" textAnchor="end">
                      100°
                    </text>
                    <text x="22" y="42" fontSize="8" fill="#94A3B8" textAnchor="end">
                      50°
                    </text>
                    <text x="22" y="70" fontSize="8" fill="#94A3B8" textAnchor="end">
                      0
                    </text>

                    <line x1="26" y1="12" x2="235" y2="12" stroke="#E2E8F0" strokeDasharray="2 2" />
                    <line x1="26" y1="40" x2="235" y2="40" stroke="#E2E8F0" strokeDasharray="2 2" />
                    <line x1="26" y1="68" x2="235" y2="68" stroke="#E2E8F0" />

                    {/* Flexion Trapezoid Plateau Curve */}
                    <path
                      d="M 28 68 L 75 68 C 88 68 98 25 110 16 L 200 16 C 208 16 215 45 225 60"
                      fill="none"
                      stroke="#0284C7"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                    <path
                      d="M 28 68 L 75 68 C 88 68 98 25 110 16 L 200 16 C 208 16 215 45 225 60 L 225 68 Z"
                      fill="#0284C7"
                      fillOpacity="0.15"
                    />

                    {/* Peak Marker Dashed Line */}
                    <line
                      x1="130"
                      y1="16"
                      x2="130"
                      y2="68"
                      stroke="#0284C7"
                      strokeWidth="1"
                      strokeDasharray="2 2"
                    />
                  </svg>
                </div>
              </div>

              {/* 2. Angle Variance */}
              <div className="pt-2 border-t border-slate-100 space-y-1.5">
                <div className="flex items-center justify-between text-xs font-bold text-slate-800">
                  <span>Angle Variance</span>
                  <span className="font-mono text-xs text-slate-600">
                    {selectedExercise.telemetry.angleVariance}
                  </span>
                </div>

                <div className="bg-slate-50 rounded-lg p-2 border border-slate-100">
                  <svg viewBox="0 0 240 30" className="w-full h-auto">
                    <line x1="10" y1="24" x2="230" y2="24" stroke="#E2E8F0" />
                    {/* Smooth Variance Wave */}
                    <path
                      d="M 12 24 C 50 24 90 23 115 22 C 122 21 125 10 135 10 C 145 10 155 24 185 24 L 228 24"
                      fill="none"
                      stroke="#64748B"
                      strokeWidth="1.75"
                    />
                    <path
                      d="M 12 24 C 50 24 90 23 115 22 C 122 21 125 10 135 10 C 145 10 155 24 185 24 L 228 24 Z"
                      fill="#64748B"
                      fillOpacity="0.3"
                    />
                  </svg>
                </div>
              </div>

              {/* 3. Load Distribution */}
              <div className="pt-2 border-t border-slate-100 space-y-2">
                <div className="text-xs font-bold text-slate-800">Load Distribution</div>

                {/* Progress bar split */}
                <div className="w-full h-2 rounded-full overflow-hidden flex bg-slate-200">
                  <div
                    className="bg-[#0284C7] h-full transition-all duration-300"
                    style={{ width: `${selectedExercise.telemetry.loadDistLeft}%` }}
                  ></div>
                  <div
                    className="bg-slate-300 h-full transition-all duration-300"
                    style={{ width: `${selectedExercise.telemetry.loadDistRight}%` }}
                  ></div>
                </div>

                <div className="flex justify-between text-xs font-bold text-slate-800 font-mono px-1">
                  <span>{selectedExercise.telemetry.loadDistLeft}%</span>
                  <span>{selectedExercise.telemetry.loadDistRight}%</span>
                </div>
              </div>

              {/* 4. Muscle Activation (EMG) */}
              <div className="pt-2 border-t border-slate-100 space-y-2.5">
                <div>
                  <div className="text-xs font-bold text-slate-800">Muscle Activation</div>
                  <span className="text-[10px] uppercase font-bold text-slate-400">EMG</span>
                </div>

                {/* Quadriceps Bar */}
                <div className="space-y-1">
                  <div className="flex justify-between text-xs text-slate-700">
                    <span className="font-medium">Quadriceps</span>
                    <span className="font-bold text-slate-900 font-mono">
                      {selectedExercise.telemetry.quadsPct}%
                    </span>
                  </div>
                  <div className="w-full h-1.5 rounded-full bg-slate-100 overflow-hidden">
                    <div
                      className="bg-[#0284C7] h-full rounded-full transition-all duration-300"
                      style={{ width: `${selectedExercise.telemetry.quadsPct}%` }}
                    ></div>
                  </div>
                </div>

                {/* Hamstrings Bar */}
                <div className="space-y-1">
                  <div className="flex justify-between text-xs text-slate-700">
                    <span className="font-medium">Hamstrings</span>
                    <span className="font-bold text-slate-900 font-mono">
                      {selectedExercise.telemetry.hamstringsPct}%
                    </span>
                  </div>
                  <div className="w-full h-1.5 rounded-full bg-slate-100 overflow-hidden">
                    <div
                      className="bg-[#0F766E] h-full rounded-full transition-all duration-300"
                      style={{ width: `${selectedExercise.telemetry.hamstringsPct}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            </div>

            {/* CARD: RECENT ALERTS */}
            <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-xs space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-black tracking-wider uppercase text-slate-800">
                  RECENT ALERTS
                </h3>
                <AlertTriangle className="h-4 w-4 text-red-500 fill-red-100" />
              </div>

              <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-xl text-xs font-medium flex items-center justify-between">
                <span>High Flexion Limit Exceeded</span>
                <span className="text-[10px] font-mono text-red-600">10/24 14:22</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
