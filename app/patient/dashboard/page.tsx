"use client";

import * as React from "react";
import Link from "next/link";
import { AppShell } from "@/components/ui/AppShell";
import { Button } from "@/components/ui/Button";
import {
  Play,
  Zap,
  CheckCircle2,
  Cpu,
  ShieldCheck,
  ChevronRight,
  ArrowRight,
  Maximize2,
  Activity,
  Layers,
} from "lucide-react";

export default function PatientDashboardPage() {
  return (
    <AppShell>
      <div className="space-y-5 pb-8">
        {/* ========================================================= */}
        {/* TOP HERO BANNER WITH SMART BRACE BACKGROUND & WHITE SHADOW*/}
        {/* ========================================================= */}
        <div className="relative overflow-hidden bg-[#035E54] rounded-2xl p-6 sm:p-7 text-white shadow-xl border border-teal-600/30">
          {/* Background Image Layer with Clinical Green Gradient Overlay */}
          <div className="absolute inset-0 z-0 pointer-events-none">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/images/smart-knee-brace.jpg"
              alt="Bionic-X Smart Knee Brace Telemetry"
              className="w-full h-full object-cover object-right md:object-[80%_center] opacity-90 mix-blend-luminosity filter brightness-110 contrast-125"
            />
            {/* Multi-stop gradient ensuring high-contrast readability on text */}
            <div className="absolute inset-0 bg-gradient-to-r from-[#035E54] via-[#035E54]/85 to-transparent" />
          </div>

          {/* Banner Content (Elevated with Z-Index and White Shadow Glow) */}
          <div className="relative z-10 space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
              <div className="space-y-1.5 max-w-2xl">
                <span className="text-[11px] uppercase tracking-wider font-bold text-teal-200 block drop-shadow-[0_1px_3px_rgba(0,0,0,0.8)]">
                  PATIENT REHABILITATION PORTAL
                </span>
                <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white drop-shadow-[0_2px_10px_rgba(255,255,255,0.35)] [text-shadow:_0_2px_14px_rgba(255,255,255,0.45),_0_2px_6px_rgba(0,0,0,0.7)]">
                  Welcome back, Sarah
                </h1>
                <p className="text-xs sm:text-sm text-white/95 leading-relaxed font-medium drop-shadow-[0_1px_4px_rgba(0,0,0,0.85)]">
                  You are on Week 4 of your Post-Op ACL Recovery. Your doctor (Dr. Marcus Vance)
                  updated your plan to target 105° (Updated today)
                </p>
              </div>

              <Link href="/patient/session/record" className="shrink-0">
                <Button
                  size="lg"
                  className="bg-white text-[#035E54] hover:bg-teal-50 border-0 font-extrabold gap-2 px-6 py-2.5 rounded-xl shadow-[0_0_20px_rgba(255,255,255,0.45)] hover:shadow-[0_0_28px_rgba(255,255,255,0.7)] cursor-pointer transition-all hover:scale-[1.03]"
                >
                  <Play className="h-4 w-4 fill-current text-[#035E54]" />
                  <span className="text-sm font-bold">Start Today&apos;s Session</span>
                </Button>
              </Link>
            </div>

            {/* 4 Status Pills with Frosted Backdrop & White Shadow Glow */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5 pt-3 border-t border-teal-500/40 text-xs">
              <div className="bg-white/15 backdrop-blur-md px-3.5 py-2 rounded-xl border border-white/30 shadow-[0_2px_10px_rgba(255,255,255,0.18)] flex items-center gap-2 text-white hover:bg-white/20 transition-colors">
                <Zap className="h-4 w-4 text-emerald-300 shrink-0 drop-shadow-[0_0_6px_rgba(52,211,153,0.8)]" />
                <span className="font-semibold drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)]">4-Day Active Streak</span>
              </div>
              <div className="bg-white/15 backdrop-blur-md px-3.5 py-2 rounded-xl border border-white/30 shadow-[0_2px_10px_rgba(255,255,255,0.18)] flex items-center gap-2 text-white hover:bg-white/20 transition-colors">
                <CheckCircle2 className="h-4 w-4 text-emerald-300 shrink-0 drop-shadow-[0_0_6px_rgba(52,211,153,0.8)]" />
                <span className="font-semibold drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)]">1 / 2 Routines Done Today</span>
              </div>
              <div className="bg-white/15 backdrop-blur-md px-3.5 py-2 rounded-xl border border-white/30 shadow-[0_2px_10px_rgba(255,255,255,0.18)] flex items-center gap-2 text-white hover:bg-white/20 transition-colors">
                <Cpu className="h-4 w-4 text-teal-200 shrink-0 drop-shadow-[0_0_6px_rgba(153,246,228,0.8)]" />
                <span className="font-semibold drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)]">Knee Brace: Connected (94%)</span>
              </div>
              <div className="bg-white/15 backdrop-blur-md px-3.5 py-2 rounded-xl border border-white/30 shadow-[0_2px_10px_rgba(255,255,255,0.18)] flex items-center gap-2 text-white hover:bg-white/20 transition-colors">
                <ShieldCheck className="h-4 w-4 text-teal-200 shrink-0 drop-shadow-[0_0_6px_rgba(153,246,228,0.8)]" />
                <span className="font-semibold drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)]">Doctor Review: Up to date</span>
              </div>
            </div>
          </div>
        </div>

        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 items-start">
         
          <div className="space-y-5">
            {/* CARD 1: Today's Prescribed Exercises */}
            <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs hover:border-teal-400 transition-all">
              <div className="flex items-start justify-between pb-3 border-b border-slate-100">
                <div>
                  <h2 className="text-base font-bold text-slate-900 leading-tight">
                    Today&apos;s Prescribed Exercises
                  </h2>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Plan Version 2 • Published 10/25/2026
                  </p>
                </div>
                <Link
                  href="/patient/exercises"
                  className="text-xs font-semibold text-[#0F766E] hover:underline shrink-0"
                >
                  View Full Details →
                </Link>
              </div>

              {/* Exercise 1: Active Knee Flexion */}
              <div className="pt-4 space-y-3">
                <Link
                  href="/patient/session/record"
                  className="group block rounded-lg p-2.5 -mx-2 hover:bg-slate-50 transition-colors"
                >
                  <div className="flex items-start gap-3">
                    {/* Exercise Thumbnail */}
                    <div className="h-14 w-14 rounded-lg bg-teal-50 border border-teal-100 flex items-center justify-center shrink-0 overflow-hidden">
                      <svg
                        viewBox="0 0 60 60"
                        className="h-11 w-11 text-teal-800"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        {/* Seated Knee Flexion Stick Figure */}
                        <circle cx="28" cy="14" r="5" fill="#0F766E" />
                        <path d="M 28 20 L 26 34 L 14 36" />
                        <path d="M 28 26 L 36 32 L 44 26" />
                        <path d="M 26 34 L 38 42 L 36 54" stroke="#0F766E" strokeWidth="2.5" />
                        <path d="M 14 36 L 10 52" />
                        <path d="M 6 54 L 52 54" stroke="#CBD5E1" strokeWidth="2" />
                      </svg>
                    </div>

                    <div className="flex-1 min-w-0">
                      <h3 className="text-sm font-bold text-slate-900 group-hover:text-[#0F766E] transition-colors flex items-center justify-between">
                        <span>1) Active Knee Flexion</span>
                        <ChevronRight className="h-4 w-4 text-slate-400 group-hover:text-[#0F766E] group-hover:translate-x-0.5 transition-all" />
                      </h3>
                      <p className="text-[11px] text-slate-600 leading-snug mt-0.5">
                        Smooth controlled Cadence. Do not force past onset of sharp pain.
                        <br />
                        <span className="font-semibold text-slate-800">
                          Goal: 10 reps x target: 105°
                        </span>
                      </p>
                    </div>
                  </div>
                </Link>

                {/* Sub-Legend & Metrics */}
                <div className="grid grid-cols-2 gap-2 text-[10px] text-slate-600 px-1 font-medium">
                  <div className="flex items-center gap-1.5">
                    <span className="h-2 w-2 rounded-full bg-[#0F766E]"></span>
                    <span>Active Knee Flexion</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-right justify-end">
                    <span>Average speed: 1.6s</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="h-2 w-2 rounded-full bg-[#2DD4BF]"></span>
                    <span>Active Knee Extension</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-right justify-end">
                    <span>Average speed: 2.3s</span>
                  </div>
                </div>

                {/* ACL ROM Performance Area Chart */}
                <div className="bg-slate-50/80 rounded-lg p-2.5 border border-slate-100">
                  <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider text-center mb-1">
                    ACL ROM Performance
                  </div>
                  <div className="w-full">
                    <svg viewBox="0 0 320 100" className="w-full h-auto">
                      {/* Grid Lines */}
                      {[0, 30, 60, 90, 120].map((deg) => {
                        const y = 85 - (deg / 120) * 70;
                        return (
                          <g key={deg}>
                            <line
                              x1="28"
                              y1={y}
                              x2="310"
                              y2={y}
                              stroke="#E2E8F0"
                              strokeDasharray="2 2"
                            />
                            <text
                              x="24"
                              y={y + 3}
                              textAnchor="end"
                              fontSize="8"
                              fill="#94A3B8"
                              fontFamily="monospace"
                            >
                              {deg}
                            </text>
                          </g>
                        );
                      })}

                      {/* Flexion Area (Green/Teal) */}
                      <path
                        d="M 35 70 Q 75 40 120 48 T 205 32 T 285 24 L 285 85 L 35 85 Z"
                        fill="#0F766E"
                        fillOpacity="0.25"
                      />
                      <path
                        d="M 35 70 Q 75 40 120 48 T 205 32 T 285 24"
                        fill="none"
                        stroke="#0F766E"
                        strokeWidth="2"
                      />

                      {/* Extension Area (Light Teal) */}
                      <path
                        d="M 35 78 Q 80 62 130 68 T 215 58 T 285 45 L 285 85 L 35 85 Z"
                        fill="#2DD4BF"
                        fillOpacity="0.2"
                      />
                      <path
                        d="M 35 78 Q 80 62 130 68 T 215 58 T 285 45"
                        fill="none"
                        stroke="#2DD4BF"
                        strokeWidth="1.5"
                      />

                      {/* X-Axis Days */}
                      {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Week"].map((day, i) => (
                        <text
                          key={day}
                          x={35 + i * 41}
                          y="96"
                          textAnchor="middle"
                          fontSize="8"
                          fill="#64748B"
                        >
                          {day}
                        </text>
                      ))}
                    </svg>
                  </div>
                </div>

                {/* Exercise 2: Patella Slide (Extension) */}
                <Link
                  href="/patient/session/record"
                  className="group block rounded-lg p-2.5 -mx-2 hover:bg-slate-50 transition-colors pt-3 border-t border-slate-100"
                >
                  <div className="flex items-start gap-3">
                    <div className="h-14 w-14 rounded-lg bg-teal-50 border border-teal-100 flex items-center justify-center shrink-0 overflow-hidden">
                      <svg
                        viewBox="0 0 60 60"
                        className="h-11 w-11 text-teal-800"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        {/* Supine Straight Leg Extension */}
                        <circle cx="16" cy="38" r="5" fill="#0F766E" />
                        <path d="M 21 40 L 34 40 L 46 32" stroke="#0F766E" strokeWidth="2.5" />
                        <path d="M 46 32 L 54 24" stroke="#0F766E" strokeWidth="2.5" />
                        <path d="M 20 40 L 26 44 L 38 44" />
                        <path d="M 6 46 L 56 46" stroke="#CBD5E1" strokeWidth="2" />
                      </svg>
                    </div>

                    <div className="flex-1 min-w-0">
                      <h3 className="text-sm font-bold text-slate-900 group-hover:text-[#0F766E] transition-colors flex items-center justify-between">
                        <span>2) Patella Slide (Extension)</span>
                        <ChevronRight className="h-4 w-4 text-slate-400 group-hover:text-[#0F766E] group-hover:translate-x-0.5 transition-all" />
                      </h3>
                      <p className="text-[11px] text-slate-600 leading-snug mt-0.5">
                        Keep knee rigidly straight; pause 2 seconds at peak elevation.
                        <br />
                        <span className="font-semibold text-slate-800">
                          Goal: 12 reps x target: 5°
                        </span>
                      </p>
                    </div>
                  </div>
                </Link>
              </div>
            </div>

            {/* CARD 4: Session History: Completed Reps Trend */}
            <Link
              href="/patient/sessions"
              className="block bg-white rounded-xl border border-slate-200 p-5 shadow-xs hover:border-teal-400 transition-all group"
            >
              <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                <h2 className="text-xs font-bold text-slate-900 group-hover:text-[#0F766E] transition-colors">
                  Session History: Completed Reps Trend
                  <span className="font-normal text-slate-500 block text-[10px]">
                    (ACL-specific range)
                  </span>
                </h2>
                <ArrowRight className="h-4 w-4 text-slate-400 group-hover:text-[#0F766E] transition-transform group-hover:translate-x-0.5" />
              </div>

              {/* Reps Area Wave */}
              <div className="pt-2">
                <svg viewBox="0 0 300 70" className="w-full h-auto">
                  <path
                    d="M 25 50 Q 60 45 100 35 T 180 20 T 270 15 L 270 60 L 25 60 Z"
                    fill="#0F766E"
                    fillOpacity="0.2"
                  />
                  <path
                    d="M 25 50 Q 60 45 100 35 T 180 20 T 270 15"
                    fill="none"
                    stroke="#0F766E"
                    strokeWidth="2"
                  />
                  {["Mon", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day, i) => (
                    <text
                      key={i}
                      x={25 + i * 40}
                      y="68"
                      textAnchor="middle"
                      fontSize="8"
                      fill="#64748B"
                    >
                      {day}
                    </text>
                  ))}
                  {[0, 10, 20, 30].map((v) => (
                    <text
                      key={v}
                      x="16"
                      y={60 - (v / 30) * 45}
                      fontSize="7"
                      fill="#94A3B8"
                      textAnchor="end"
                      fontFamily="monospace"
                    >
                      {v}
                    </text>
                  ))}
                </svg>
              </div>

              {/* Goal Completion Rate by Week */}
              <div className="pt-3 border-t border-slate-100">
                <div className="text-[10px] font-bold text-slate-700 mb-1">
                  Goal Completion Rate by Week
                </div>
                <svg viewBox="0 0 300 65" className="w-full h-auto">
                  {[25, 50, 75, 100].map((v) => {
                    const y = 52 - (v / 100) * 44;
                    return (
                      <line
                        key={v}
                        x1="25"
                        y1={y}
                        x2="285"
                        y2={y}
                        stroke="#F1F5F9"
                        strokeDasharray="2 2"
                      />
                    );
                  })}
                  {[
                    { day: "Mon", h: 75 },
                    { day: "Tue", h: 80 },
                    { day: "Wed", h: 90 },
                    { day: "Thu", h: 85 },
                    { day: "Fri", h: 95 },
                    { day: "Sat", h: 90 },
                    { day: "Sun", h: 100 },
                  ].map((bar, i) => {
                    const barH = (bar.h / 100) * 44;
                    return (
                      <g key={i}>
                        <rect
                          x={32 + i * 36}
                          y={52 - barH}
                          width="18"
                          height={barH}
                          fill="#0F766E"
                          rx="2"
                        />
                        <text
                          x={41 + i * 36}
                          y="62"
                          textAnchor="middle"
                          fontSize="7"
                          fill="#64748B"
                        >
                          {bar.day}
                        </text>
                      </g>
                    );
                  })}
                  {[0, 25, 50, 75, 100].map((v) => (
                    <text
                      key={v}
                      x="20"
                      y={54 - (v / 100) * 44}
                      fontSize="7"
                      fill="#94A3B8"
                      textAnchor="end"
                      fontFamily="monospace"
                    >
                      {v}
                    </text>
                  ))}
                </svg>
              </div>

              {/* ACL Flexion Angle Trend Over Time */}
              <div className="pt-3 border-t border-slate-100">
                <div className="flex justify-between items-center text-[10px]">
                  <span className="font-bold text-slate-700">ACL Flexion Angle Trend Over Time</span>
                  <span className="text-teal-700 font-semibold">Goal line: 105°</span>
                </div>
                <svg viewBox="0 0 300 65" className="w-full h-auto mt-1">
                  {/* Goal dashed line */}
                  <line
                    x1="25"
                    y1="18"
                    x2="285"
                    y2="18"
                    stroke="#0F766E"
                    strokeWidth="1"
                    strokeDasharray="3 2"
                  />
                  <text x="285" y="14" fontSize="7" fill="#0F766E" textAnchor="end">
                    Goal line
                  </text>

                  {/* Rising trend */}
                  <path
                    d="M 30 46 L 70 38 L 110 32 L 155 26 L 200 24 L 245 20 L 280 18"
                    fill="none"
                    stroke="#0F766E"
                    strokeWidth="2"
                  />
                  {[
                    [30, 46],
                    [70, 38],
                    [110, 32],
                    [155, 26],
                    [200, 24],
                    [245, 20],
                    [280, 18],
                  ].map(([cx, cy], idx) => (
                    <circle key={idx} cx={cx} cy={cy} r="2.5" fill="#0F766E" />
                  ))}

                  {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((day, i) => (
                    <text
                      key={day}
                      x={30 + i * 41}
                      y="62"
                      textAnchor="middle"
                      fontSize="7"
                      fill="#64748B"
                    >
                      {day}
                    </text>
                  ))}
                  {[0, 30, 60, 90, 120].map((v) => (
                    <text
                      key={v}
                      x="20"
                      y={58 - (v / 120) * 44}
                      fontSize="7"
                      fill="#94A3B8"
                      textAnchor="end"
                      fontFamily="monospace"
                    >
                      {v}
                    </text>
                  ))}
                </svg>
              </div>
            </Link>
          </div>

          {/* ======================================================= */}
          {/* COLUMN 2 (MIDDLE)                                       */}
          {/* ======================================================= */}
          <div className="space-y-5">
            {/* CARD 2: Rep Cadence & Consistency + Rep Smoothness */}
            <Link
              href="/patient/sessions"
              className="block bg-white rounded-xl border border-slate-200 p-5 shadow-xs hover:border-teal-400 transition-all group"
            >
              <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                <h2 className="text-sm font-bold text-slate-900 group-hover:text-[#0F766E] transition-colors">
                  Rep Cadence &amp; Consistency
                </h2>
                <ArrowRight className="h-4 w-4 text-slate-400 group-hover:text-[#0F766E] transition-transform group-hover:translate-x-0.5" />
              </div>

              {/* Rep Duration Bar Chart */}
              <div className="pt-2">
                <svg viewBox="0 0 300 115" className="w-full h-auto">
                  {/* Grid Lines */}
                  {[0, 20, 40, 60, 80, 100].map((val) => {
                    const y = 95 - (val / 100) * 80;
                    return (
                      <g key={val}>
                        <line
                          x1="28"
                          y1={y}
                          x2="285"
                          y2={y}
                          stroke="#F1F5F9"
                          strokeDasharray="2 2"
                        />
                        <text
                          x="22"
                          y={y + 3}
                          textAnchor="end"
                          fontSize="7"
                          fill="#94A3B8"
                          fontFamily="monospace"
                        >
                          {val}
                        </text>
                      </g>
                    );
                  })}
                  <text
                    x="8"
                    y="55"
                    transform="rotate(-90 8 55)"
                    fontSize="7"
                    fill="#64748B"
                    textAnchor="middle"
                  >
                    Rep Duration (s)
                  </text>

                  {/* 10 Rep Bars */}
                  {[72, 85, 76, 88, 70, 74, 82, 80, 78, 75].map((duration, i) => {
                    const barH = (duration / 100) * 80;
                    return (
                      <g key={i}>
                        <rect
                          x={36 + i * 24}
                          y={95 - barH}
                          width="14"
                          height={barH}
                          fill="#0F766E"
                          rx="2"
                        />
                        <text
                          x={43 + i * 24}
                          y="105"
                          textAnchor="middle"
                          fontSize="7"
                          fill="#64748B"
                        >
                          {i + 1}
                        </text>
                      </g>
                    );
                  })}
                  <text x="160" y="114" fontSize="7" fill="#94A3B8" textAnchor="middle">
                    Last Session
                  </text>
                </svg>
              </div>

              {/* Rep Smoothness Scatter Plot */}
              <div className="pt-4 border-t border-slate-100">
                <div className="text-xs font-bold text-slate-800 mb-1">
                  Rep Smoothness <span className="font-normal text-slate-500">(all session types)</span>
                </div>
                <svg viewBox="0 0 300 115" className="w-full h-auto">
                  {/* Grid Lines */}
                  {[0.0, 0.2, 0.4, 0.6, 0.8, 1.0, 1.2].map((val) => {
                    const y = 95 - (val / 1.2) * 80;
                    return (
                      <g key={val}>
                        <line
                          x1="28"
                          y1={y}
                          x2="285"
                          y2={y}
                          stroke="#F1F5F9"
                          strokeDasharray="2 2"
                        />
                        <text
                          x="22"
                          y={y + 3}
                          textAnchor="end"
                          fontSize="7"
                          fill="#94A3B8"
                          fontFamily="monospace"
                        >
                          {val.toFixed(1)}
                        </text>
                      </g>
                    );
                  })}
                  <text
                    x="8"
                    y="55"
                    transform="rotate(-90 8 55)"
                    fontSize="7"
                    fill="#64748B"
                    textAnchor="middle"
                  >
                    Rep Smoothness
                  </text>

                  {/* Scatter Points Cloud */}
                  {[
                    [45, 42],
                    [65, 38],
                    [78, 48],
                    [92, 45],
                    [105, 52],
                    [118, 46],
                    [132, 58],
                    [145, 54],
                    [152, 48],
                    [160, 52],
                    [168, 49],
                    [175, 47],
                    [182, 53],
                    [190, 56],
                    [198, 51],
                    [205, 48],
                    [214, 52],
                    [222, 57],
                    [235, 54],
                    [248, 62],
                    [265, 58],
                  ].map(([cx, cy], i) => (
                    <circle key={i} cx={cx} cy={cy} r="2.5" fill="#0F766E" opacity="0.8" />
                  ))}

                  {/* X Axis */}
                  {[0, 0.2, 0.4, 0.6, 0.8, 1.0].map((v, i) => (
                    <text
                      key={v}
                      x={35 + i * 48}
                      y="105"
                      textAnchor="middle"
                      fontSize="7"
                      fill="#64748B"
                    >
                      {v.toFixed(1)}
                    </text>
                  ))}
                  <text x="160" y="114" fontSize="7" fill="#94A3B8" textAnchor="middle">
                    All Session Types
                  </text>
                </svg>
              </div>
            </Link>

            {/* CARD 5: Real-Time Data Streams (Simulated) */}
            <Link
              href="/patient/session/record"
              className="block bg-white rounded-xl border border-slate-200 p-5 shadow-xs hover:border-teal-400 transition-all group"
            >
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div>
                  <h2 className="text-sm font-bold text-slate-900 group-hover:text-[#0F766E] transition-colors">
                    Real-Time Data Streams (Simulated)
                  </h2>
                  <span className="text-[10px] text-teal-700 font-semibold block">
                    (Live Session)
                  </span>
                </div>
                <div className="flex items-center gap-1 text-xs text-[#0F766E] font-semibold">
                  <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></span>
                  <ArrowRight className="h-4 w-4 text-slate-400 group-hover:text-[#0F766E] transition-transform group-hover:translate-x-0.5" />
                </div>
              </div>

              {/* 4 Synchronized Waveform Channels */}
              <div className="space-y-3 pt-2">
                {/* 1. Medial Condyle Force */}
                <div>
                  <div className="text-[10px] font-bold text-slate-700">Medial Condyle Force</div>
                  <svg viewBox="0 0 300 36" className="w-full h-auto">
                    <line x1="20" y1="18" x2="290" y2="18" stroke="#F1F5F9" />
                    <text x="14" y="8" fontSize="6" fill="#94A3B8" textAnchor="end">
                      100
                    </text>
                    <text x="14" y="20" fontSize="6" fill="#94A3B8" textAnchor="end">
                      0
                    </text>
                    <text x="14" y="32" fontSize="6" fill="#94A3B8" textAnchor="end">
                      -100
                    </text>
                    <path
                      d="M 22 18 Q 40 10 55 18 T 85 24 T 120 14 T 155 22 T 185 16 T 220 25 T 255 14 T 285 20"
                      fill="none"
                      stroke="#0F766E"
                      strokeWidth="1.75"
                    />
                  </svg>
                </div>

                {/* 2. Tibial Rotation */}
                <div className="pt-1 border-t border-slate-50">
                  <div className="text-[10px] font-bold text-slate-700">Tibial Rotation</div>
                  <svg viewBox="0 0 300 36" className="w-full h-auto">
                    <line x1="20" y1="18" x2="290" y2="18" stroke="#F1F5F9" />
                    <text x="14" y="8" fontSize="6" fill="#94A3B8" textAnchor="end">
                      100
                    </text>
                    <text x="14" y="16" fontSize="6" fill="#94A3B8" textAnchor="end">
                      0
                    </text>
                    <text x="14" y="26" fontSize="6" fill="#94A3B8" textAnchor="end">
                      -100
                    </text>
                    <text x="14" y="34" fontSize="6" fill="#94A3B8" textAnchor="end">
                      -200
                    </text>
                    <path
                      d="M 22 16 C 50 14 90 22 130 24 C 170 26 210 12 250 14 C 270 15 280 14 288 15"
                      fill="none"
                      stroke="#0F766E"
                      strokeWidth="1.75"
                    />
                  </svg>
                </div>

                {/* 3. ACL Strain (Est. Model) */}
                <div className="pt-1 border-t border-slate-50">
                  <div className="text-[10px] font-bold text-slate-700">
                    ACL Strain (Est. Model)
                  </div>
                  <svg viewBox="0 0 300 36" className="w-full h-auto">
                    <line x1="20" y1="18" x2="290" y2="18" stroke="#F1F5F9" />
                    <text x="14" y="8" fontSize="6" fill="#94A3B8" textAnchor="end">
                      0.23
                    </text>
                    <text x="14" y="16" fontSize="6" fill="#94A3B8" textAnchor="end">
                      0.21
                    </text>
                    <text x="14" y="26" fontSize="6" fill="#94A3B8" textAnchor="end">
                      0.20
                    </text>
                    <text x="14" y="34" fontSize="6" fill="#94A3B8" textAnchor="end">
                      0.18
                    </text>
                    <path
                      d="M 22 22 Q 45 18 70 25 T 115 15 T 160 26 T 205 18 T 250 24 T 288 20"
                      fill="none"
                      stroke="#0F766E"
                      strokeWidth="1.75"
                    />
                  </svg>
                </div>

                {/* 4. Sensor Sync Status */}
                <div className="pt-1 border-t border-slate-50">
                  <div className="text-[10px] font-bold text-slate-700">Sensor Sync Status</div>
                  <svg viewBox="0 0 300 32" className="w-full h-auto">
                    <path
                      d="M 22 24 L 38 24 L 44 8 L 50 24 L 66 24 L 72 8 L 78 24 L 105 24 L 115 8 L 125 24 L 150 24 L 158 8 L 166 24 L 195 24 L 202 8 L 210 24 L 240 24 L 248 8 L 256 24 L 288 24"
                      fill="none"
                      stroke="#0F766E"
                      strokeWidth="1.75"
                      strokeLinejoin="round"
                    />
                  </svg>
                </div>
              </div>
            </Link>
          </div>

          {/* ======================================================= */}
          {/* COLUMN 3 (RIGHT)                                        */}
          {/* ======================================================= */}
          <div className="space-y-5">
            {/* CARD 3: My Knee Sensor */}
            <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs hover:border-teal-400 transition-all">
              <div className="pb-3 border-b border-slate-100">
                <h2 className="text-base font-bold text-slate-900 leading-tight">My Knee Sensor</h2>
                <p className="text-xs font-mono text-slate-500 mt-0.5">ESP32-S3-ORTHO-092</p>
              </div>

              <div className="space-y-3.5 pt-3.5 text-xs">
                {/* Hardware Link */}
                <div className="flex items-center justify-between">
                  <span className="text-slate-600 font-medium">Hardware Link:</span>
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                    <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
                    Online &amp; Paired
                  </span>
                </div>

                {/* Battery Gauge */}
                <div className="flex items-center justify-between">
                  <span className="text-slate-600 font-medium">Battery Gauge:</span>
                  <span className="font-bold text-slate-800">94% (Good)</span>
                </div>

                {/* IMU Accelerometers */}
                <div className="flex items-center justify-between">
                  <span className="text-slate-600 font-medium">IMU Accelerometers:</span>
                  <div className="text-right">
                    <span className="text-[10px] text-slate-400 block font-mono">X-Y-Z G-Force</span>
                    <svg viewBox="0 0 70 16" className="w-16 h-4 inline-block">
                      <path
                        d="M 2 8 Q 12 2 24 8 T 46 8 T 68 8"
                        fill="none"
                        stroke="#0F766E"
                        strokeWidth="1.5"
                      />
                    </svg>
                  </div>
                </div>

                {/* Foot Force Sensors */}
                <div className="flex items-center justify-between">
                  <span className="text-slate-600 font-medium">Foot Force Sensors:</span>
                  <div className="text-right">
                    <span className="text-[10px] text-slate-400 block font-mono">
                      Foot Load Distribution (L/R)
                    </span>
                    <svg viewBox="0 0 70 16" className="w-16 h-4 inline-block">
                      <path
                        d="M 2 12 Q 20 2 35 12 T 68 12"
                        fill="none"
                        stroke="#0F766E"
                        strokeWidth="1.5"
                      />
                    </svg>
                  </div>
                </div>

                {/* Diagnostics Button */}
                <div className="pt-2">
                  <Link href="/patient/device">
                    <Button
                      variant="outline"
                      className="w-full text-xs font-semibold hover:border-[#0F766E] hover:text-[#0F766E] flex items-center justify-center gap-1.5"
                    >
                      <span>Sensor Hardware Readiness Matrix</span>
                      <span>→</span>
                    </Button>
                  </Link>
                </div>

                {/* Diagnostics Footer */}
                <p className="text-[10px] text-slate-400 text-center pt-1">
                  Device Log: Normal | Last Ping: 30s ago | FW Ver: 2.1.0
                </p>
              </div>
            </div>

            {/* CARD 6: Doctor's Detailed Progress Log */}
            <Link
              href="/patient/exercises"
              className="block bg-white rounded-xl border border-slate-200 p-4 shadow-xs hover:border-teal-400 transition-all group"
            >
              <h2 className="text-xs font-bold text-slate-900 group-hover:text-[#0F766E] transition-colors pb-2 border-b border-slate-100 flex items-center justify-between">
                <span>Doctor&apos;s Detailed Progress Log</span>
                <ChevronRight className="h-3.5 w-3.5 text-slate-400 group-hover:text-[#0F766E] transition-transform group-hover:translate-x-0.5" />
              </h2>
              <div className="mt-2.5 p-3 rounded-lg bg-slate-50 border border-slate-100 text-xs text-slate-700 leading-relaxed font-sans relative">
                <p>
                  <strong className="text-slate-900">Dr. Vance:</strong> Range of motion increasing
                  on Week 4... Patella mobilization encouraged. Next goal: 110°.
                  <br />
                  <span className="text-teal-700 font-semibold block mt-1">
                    Next check-in: 11/02
                  </span>
                </p>
                {/* Scroll track indicator to match screenshot */}
                <div className="absolute right-1 top-2 bottom-2 w-1 bg-slate-300 rounded-full"></div>
              </div>
            </Link>

            {/* CARD 7: Interactive 3D Knee Model */}
            <Link
              href="/patient/device"
              className="block bg-white rounded-xl border border-slate-200 p-5 shadow-xs hover:border-teal-400 transition-all group"
            >
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <h2 className="text-sm font-bold text-slate-900 group-hover:text-[#0F766E] transition-colors">
                  Interactive 3D Knee Model
                </h2>
                <Maximize2 className="h-4 w-4 text-slate-400 group-hover:text-[#0F766E] transition-colors" />
              </div>

              {/* Wireframe Anatomical Knee Illustration */}
              <div className="flex justify-center items-center py-4 relative">
                <svg
                  viewBox="0 0 200 240"
                  className="w-44 h-auto text-slate-700 select-none group-hover:scale-105 transition-transform duration-300"
                >
                  <defs>
                    <radialGradient id="sensorGlow" cx="50%" cy="50%" r="50%">
                      <stop offset="0%" stopColor="#2DD4BF" stopOpacity="1" />
                      <stop offset="100%" stopColor="#0F766E" stopOpacity="0.8" />
                    </radialGradient>
                    <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
                      <feGaussianBlur in="SourceGraphic" stdDeviation="2" />
                    </filter>
                  </defs>

                  {/* Wireframe Femur (Upper Thigh Bone) */}
                  <g stroke="#94A3B8" strokeWidth="1.25" fill="none">
                    {/* Femoral Shaft Grid Lines */}
                    <path d="M 85 15 C 80 40 70 70 65 95 C 60 115 50 125 50 135 C 50 150 70 155 85 150" />
                    <path d="M 115 15 C 120 40 130 70 135 95 C 140 115 150 125 150 135 C 150 150 130 155 115 150" />
                    <path d="M 85 15 L 115 15" />
                    <ellipse cx="100" cy="35" rx="16" ry="6" />
                    <ellipse cx="100" cy="65" rx="20" ry="7" />
                    <ellipse cx="100" cy="95" rx="25" ry="8" />

                    {/* Femoral Condyles (Medial & Lateral) */}
                    <path d="M 65 130 C 65 155 82 165 95 160 C 100 158 100 158 105 160 C 118 165 135 155 135 130" />
                    <ellipse cx="78" cy="145" rx="12" ry="8" />
                    <ellipse cx="122" cy="145" rx="12" ry="8" />
                  </g>

                  {/* Wireframe Tibia & Fibula (Lower Leg Bone) */}
                  <g stroke="#94A3B8" strokeWidth="1.25" fill="none">
                    {/* Tibial Plateau */}
                    <ellipse cx="100" cy="165" rx="36" ry="10" />
                    <path d="M 66 165 C 66 185 75 200 80 230" />
                    <path d="M 134 165 C 134 185 125 200 120 230" />
                    <ellipse cx="100" cy="190" rx="24" ry="7" />
                    <ellipse cx="100" cy="215" rx="18" ry="6" />

                    {/* Fibula (Lateral Head & Shaft) */}
                    <path d="M 136 172 C 144 176 150 185 148 195 L 140 230" stroke="#CBD5E1" />
                    <ellipse cx="145" cy="182" rx="6" ry="4" stroke="#CBD5E1" />
                  </g>

                  {/* Patella (Knee Cap) */}
                  <g stroke="#0F766E" strokeWidth="1.5" fill="#E6FFFA" fillOpacity="0.4">
                    <polygon points="100,118 116,132 108,148 92,148 84,132" />
                    <line x1="100" y1="118" x2="100" y2="148" stroke="#0F766E" strokeWidth="1" />
                  </g>

                  {/* Ligament Tendon Bands */}
                  <path
                    d="M 100 148 L 100 178"
                    stroke="#0F766E"
                    strokeWidth="2"
                    strokeDasharray="2 2"
                  />

                  {/* SENSOR NODES (Glowing Teal Indicators matching screenshot) */}
                  {/* Node 1: Thigh IMU (Lateral Femur) */}
                  <g filter="url(#glow)">
                    <circle cx="65" cy="95" r="5" fill="#2DD4BF" opacity="0.6" />
                  </g>
                  <circle cx="65" cy="95" r="3.5" fill="url(#sensorGlow)" stroke="#FFFFFF" strokeWidth="1" />

                  {/* Node 2: Patella Strain Gauge */}
                  <g filter="url(#glow)">
                    <circle cx="116" cy="132" r="5" fill="#2DD4BF" opacity="0.6" />
                  </g>
                  <circle cx="116" cy="132" r="3.5" fill="url(#sensorGlow)" stroke="#FFFFFF" strokeWidth="1" />

                  {/* Node 3: Joint Line Sensor */}
                  <g filter="url(#glow)">
                    <circle cx="78" cy="145" r="5" fill="#2DD4BF" opacity="0.6" />
                  </g>
                  <circle cx="78" cy="145" r="3.5" fill="url(#sensorGlow)" stroke="#FFFFFF" strokeWidth="1" />

                  {/* Node 4: Tibial Shank IMU */}
                  <g filter="url(#glow)">
                    <circle cx="120" cy="205" r="5" fill="#2DD4BF" opacity="0.6" />
                  </g>
                  <circle cx="120" cy="205" r="3.5" fill="url(#sensorGlow)" stroke="#FFFFFF" strokeWidth="1" />
                </svg>
              </div>

              <div className="flex items-center justify-between text-[11px] text-slate-500 pt-2 border-t border-slate-100">
                <span className="flex items-center gap-1.5">
                  <span className="h-2 w-2 rounded-full bg-[#2DD4BF]"></span>
                  4 Active Sensing Nodes
                </span>
                <span className="text-[#0F766E] font-semibold group-hover:underline">
                  View Sensor Array →
                </span>
              </div>
            </Link>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
