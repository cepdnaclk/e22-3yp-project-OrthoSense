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
  VolumeX,
  RotateCcw,
  ShieldCheck,
  ChevronRight,
  Flame,
} from "lucide-react";

interface ExerciseItem {
  id: string;
  number: number;
  title: string;
  status: "In Progress" | "Completed" | "Pending";
  statusColor: string;
  iconBg: string;
  iconType: "curl" | "raise" | "extension" | "slide";
  sets: string;
  repsSets: string;
  duration: string;
  activeTimer?: string;
  repsCurrent?: string;
  load?: string;
  videoType: "curl" | "raise" | "extension";
  description: string;
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
    },
  ];

  const togglePlay = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setPlayingVideoId(playingVideoId === id ? null : id);
  };

  return (
    <AppShell>
      <div className="space-y-6 max-w-5xl mx-auto pb-10">
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
                Prescribed Exercise Protocols
              </h1>
              <p className="text-xs text-slate-500">
                Dr. Marcus Vance, MD • Plan Version 2 (Published 10/25/2026)
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Link href="/patient/session/record">
              <Button size="sm" variant="primary" className="gap-1.5 shadow-xs font-semibold">
                <Play className="h-4 w-4 fill-current" /> Start Live Recording Session
              </Button>
            </Link>
          </div>
        </div>

        {/* Doctor's Note Strip */}
        <div className="p-3.5 bg-teal-50 border border-teal-200 rounded-xl text-xs flex items-center justify-between text-teal-900">
          <div className="flex items-center gap-2">
            <ShieldCheck className="h-4 w-4 text-[#0F766E] shrink-0" />
            <span>
              <strong>Clinical Goal:</strong> Target knee flexion is currently <strong>105°</strong>. Focus on controlled eccentric return and keep cadence smooth.
            </span>
          </div>
          <span className="text-teal-700 font-semibold font-mono text-[11px] shrink-0 hidden sm:inline">
            Week 4 Post-Op ACL
          </span>
        </div>

        {/* SECTION HEADER: CURRENT EXERCISES */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-xs font-black tracking-wider uppercase text-slate-700">
              CURRENT EXERCISES
            </h2>
            <span className="text-[11px] text-slate-500 font-medium">
              3 active protocols prescribed
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
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-5">
                    {/* LEFT COLUMN: Icon, Title, Status, Metrics */}
                    <div className="space-y-3 flex-1 min-w-0">
                      {/* Title & Badge Row */}
                      <div className="flex items-start gap-3.5">
                        {/* Rounded Square Exercise Icon Badge */}
                        <div
                          className={`h-11 w-11 rounded-xl ${item.iconBg} flex items-center justify-center text-white shrink-0 shadow-xs`}
                        >
                          {item.iconType === "curl" && (
                            /* Hamstring Curl Figure */
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
                            /* Straight Leg Raise Sitting / Lying Figure */
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
                            /* Knee Extension Figure */
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

                        {/* Title & Status Badge */}
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

                      {/* Active Sub-Detail Strip (Timer, Reps, Load as shown in card 2 of screenshot) */}
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

                    {/* RIGHT COLUMN: Realistic Embedded Video Player Thumbnail */}
                    <div className="w-full md:w-[280px] shrink-0">
                      <div className="relative rounded-xl overflow-hidden bg-slate-900 shadow-md group/video border border-slate-700/50 aspect-video">
                        {/* Video Content Graphic (Stylized Physical Therapy Demo) */}
                        <div className="absolute inset-0 bg-slate-800 flex items-center justify-center overflow-hidden">
                          {item.videoType === "curl" && (
                            /* Hamstring Curl Demonstration Scene */
                            <svg
                              viewBox="0 0 300 170"
                              className="w-full h-full object-cover"
                            >
                              <rect width="300" height="170" fill="#E2E8F0" />
                              {/* Floor Mat */}
                              <rect x="30" y="110" width="240" height="40" fill="#3B82F6" opacity="0.3" rx="4" />
                              {/* Physical Therapy Patient Silhouette */}
                              <circle cx="95" cy="55" r="14" fill="#475569" />
                              {/* Torso Quadruped */}
                              <path d="M 95 69 L 115 105 L 180 100" stroke="#1E293B" strokeWidth="16" strokeLinecap="round" strokeLinejoin="round" />
                              {/* Arms supporting on mat */}
                              <path d="M 115 105 L 115 140" stroke="#1E293B" strokeWidth="8" strokeLinecap="round" />
                              <path d="M 135 105 L 135 140" stroke="#334155" strokeWidth="8" strokeLinecap="round" />
                              {/* Grounded Knee */}
                              <path d="M 180 100 L 180 140" stroke="#1E293B" strokeWidth="10" strokeLinecap="round" />
                              {/* Active Curled Leg with Foam Roller/Band */}
                              <path d="M 180 100 L 225 80 L 210 50" stroke="#0F766E" strokeWidth="10" strokeLinecap="round" strokeLinejoin="round" />
                              <ellipse cx="215" cy="72" rx="10" ry="14" fill="#0F172A" />
                            </svg>
                          )}

                          {item.videoType === "raise" && (
                            /* Straight Leg Raise Bridge Scene */
                            <svg
                              viewBox="0 0 300 170"
                              className="w-full h-full object-cover"
                            >
                              <rect width="300" height="170" fill="#E2E8F0" />
                              {/* Blue Mat */}
                              <rect x="25" y="125" width="250" height="25" fill="#2563EB" opacity="0.35" rx="4" />
                              {/* Head & Torso on mat */}
                              <circle cx="230" cy="120" r="14" fill="#475569" />
                              <path d="M 220 125 L 175 105 L 140 105" stroke="#1E293B" strokeWidth="18" strokeLinecap="round" strokeLinejoin="round" />
                              {/* Arms holding thigh */}
                              <path d="M 185 118 L 155 90" stroke="#334155" strokeWidth="7" strokeLinecap="round" />
                              {/* Grounded bent foot */}
                              <path d="M 140 105 L 110 135" stroke="#1E293B" strokeWidth="10" strokeLinecap="round" />
                              {/* Elevated active leg flexed 90 deg */}
                              <path d="M 140 105 L 130 65 L 95 65" stroke="#0284C7" strokeWidth="10" strokeLinecap="round" strokeLinejoin="round" />
                              {/* Shoe */}
                              <ellipse cx="90" cy="65" rx="10" ry="6" fill="#1E293B" />
                            </svg>
                          )}

                          {item.videoType === "extension" && (
                            /* Knee Extension Scene with Kettlebell / Resistance */
                            <svg
                              viewBox="0 0 300 170"
                              className="w-full h-full object-cover"
                            >
                              <rect width="300" height="170" fill="#E2E8F0" />
                              {/* Mat */}
                              <rect x="25" y="125" width="250" height="25" fill="#2563EB" opacity="0.35" rx="4" />
                              {/* Head on mat */}
                              <circle cx="235" cy="120" r="14" fill="#475569" />
                              <path d="M 225 125 L 175 105 L 145 105" stroke="#1E293B" strokeWidth="18" strokeLinecap="round" strokeLinejoin="round" />
                              {/* Arm pressing kettlebell upward */}
                              <path d="M 185 110 L 205 60" stroke="#1E293B" strokeWidth="7" strokeLinecap="round" />
                              <circle cx="208" cy="50" r="9" fill="#0F172A" />
                              {/* Foam roller under knee */}
                              <ellipse cx="140" cy="115" rx="16" ry="12" fill="#047857" opacity="0.8" />
                              {/* Extended lower leg straight out */}
                              <path d="M 145 105 L 110 95 L 80 95" stroke="#0F766E" strokeWidth="10" strokeLinecap="round" strokeLinejoin="round" />
                              <ellipse cx="75" cy="95" rx="8" ry="6" fill="#1E293B" />
                            </svg>
                          )}
                        </div>

                        {/* Top Video Camera / Play Tag Icons matching screenshot */}
                        <div className="absolute top-2 left-2 flex items-center gap-1 bg-black/50 text-white p-1 rounded backdrop-blur-xs text-[10px]">
                          <Play className="h-3 w-3 fill-current" />
                        </div>
                        <div className="absolute top-2 right-2 bg-black/50 text-white p-1 rounded backdrop-blur-xs text-[10px]">
                          <Play className="h-3 w-3 fill-current" />
                        </div>

                        {/* Center Hover Play Button */}
                        <button
                          type="button"
                          onClick={(e) => togglePlay(item.id, e)}
                          className="absolute inset-0 m-auto h-11 w-11 rounded-full bg-black/60 hover:bg-[#0F766E] text-white flex items-center justify-center backdrop-blur-xs transition-all shadow-lg hover:scale-110"
                          aria-label={isPlaying ? "Pause video" : "Play video demonstration"}
                        >
                          {isPlaying ? (
                            <Pause className="h-5 w-5 fill-current" />
                          ) : (
                            <Play className="h-5 w-5 fill-current ml-0.5" />
                          )}
                        </button>

                        {/* Bottom Video Controls & Scrub Bar Bar */}
                        <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/90 via-black/60 to-transparent p-2 text-white flex items-center gap-2">
                          <button
                            type="button"
                            onClick={(e) => togglePlay(item.id, e)}
                            className="p-1 hover:text-teal-300"
                          >
                            {isPlaying ? (
                              <Pause className="h-3.5 w-3.5 fill-current" />
                            ) : (
                              <Play className="h-3.5 w-3.5 fill-current" />
                            )}
                          </button>

                          {/* Scrub Progress Bar with Head Indicator */}
                          <div className="flex-1 h-1.5 bg-white/30 rounded-full relative overflow-visible cursor-pointer">
                            <div
                              className="h-full bg-white rounded-full"
                              style={{ width: `${progress}%` }}
                            ></div>
                            <div
                              className="absolute top-1/2 -translate-y-1/2 h-3 w-3 rounded-full bg-white shadow-sm"
                              style={{ left: `calc(${progress}% - 6px)` }}
                            ></div>
                          </div>

                          <span className="text-[10px] font-mono text-slate-300">
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

        {/* Selected Routine Action Bar */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <span className="text-xs font-bold text-slate-900 block">
              Ready to execute today&apos;s routine?
            </span>
            <p className="text-xs text-slate-500">
              Your smart knee brace sensors will automatically log joint flexion and cadence.
            </p>
          </div>
          <Link href="/patient/session/record">
            <Button size="lg" variant="primary" className="gap-2 font-bold px-6">
              <Play className="h-4 w-4 fill-current" /> Launch Exercise Session Recorder
            </Button>
          </Link>
        </div>
      </div>
    </AppShell>
  );
}
