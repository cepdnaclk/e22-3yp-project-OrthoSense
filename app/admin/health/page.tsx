"use client";

import * as React from "react";
import { AppShell } from "@/components/ui/AppShell";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/Card";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { Radio, Server, Activity, Database, Zap, Cpu } from "lucide-react";

export default function AdminHealthPage() {
  return (
    <AppShell>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            Technical System Health
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Telemetry ingestion pipeline metrics, DRF API response latencies, and WebSocket streaming queues.
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4 space-y-1">
              <span className="text-xs uppercase font-semibold text-slate-400">DRF API Latency</span>
              <p className="text-2xl font-extrabold text-[#0F766E] font-mono">34 ms</p>
              <p className="text-[11px] text-emerald-700">p99 = 62ms (Healthy)</p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4 space-y-1">
              <span className="text-xs uppercase font-semibold text-slate-400">Active Board Streams</span>
              <p className="text-2xl font-extrabold text-slate-900 font-mono">3</p>
              <p className="text-[11px] text-slate-500">Live ESP32-S3 connections</p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4 space-y-1">
              <span className="text-xs uppercase font-semibold text-slate-400">Ingestion Pipeline</span>
              <p className="text-2xl font-extrabold text-slate-900 font-mono">0 queued</p>
              <p className="text-[11px] text-emerald-700">Zero packet backlog</p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4 space-y-1">
              <span className="text-xs uppercase font-semibold text-slate-400">Redis Cache Hit</span>
              <p className="text-2xl font-extrabold text-slate-900 font-mono">98.4%</p>
              <p className="text-[11px] text-slate-500">Session cache operational</p>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Microservices Status</CardTitle>
              <CardDescription>Core backend infrastructure health</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between p-3 rounded-lg border border-slate-100 bg-slate-50 text-xs">
                <div className="flex items-center gap-2">
                  <Server className="h-4 w-4 text-teal-700" />
                  <div>
                    <span className="font-semibold text-slate-900">Django REST Framework Service</span>
                    <p className="text-slate-500 text-[11px]">Session auth & session endpoints</p>
                  </div>
                </div>
                <StatusBadge status="healthy" labelOverride="OPERATIONAL" size="sm" />
              </div>

              <div className="flex items-center justify-between p-3 rounded-lg border border-slate-100 bg-slate-50 text-xs">
                <div className="flex items-center gap-2">
                  <Database className="h-4 w-4 text-teal-700" />
                  <div>
                    <span className="font-semibold text-slate-900">PostgreSQL Database</span>
                    <p className="text-slate-500 text-[11px]">Telemetry storage & user accounts</p>
                  </div>
                </div>
                <StatusBadge status="healthy" labelOverride="OPERATIONAL" size="sm" />
              </div>

              <div className="flex items-center justify-between p-3 rounded-lg border border-slate-100 bg-slate-50 text-xs">
                <div className="flex items-center gap-2">
                  <Zap className="h-4 w-4 text-teal-700" />
                  <div>
                    <span className="font-semibold text-slate-900">Edge Ingestion Streamer</span>
                    <p className="text-slate-500 text-[11px]">UDP / HTTPS batch pipeline</p>
                  </div>
                </div>
                <StatusBadge status="healthy" labelOverride="OPERATIONAL" size="sm" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Hardware Edge Firmware Compliance</CardTitle>
              <CardDescription>Firmware versions across enrolled boards</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3 text-xs">
              <div className="p-3 rounded-lg border border-slate-100 bg-slate-50 flex justify-between items-center">
                <span>Firmware v1.4.2 (Latest Production):</span>
                <span className="font-bold text-emerald-700">3 boards (75%)</span>
              </div>
              <div className="p-3 rounded-lg border border-slate-100 bg-slate-50 flex justify-between items-center">
                <span>Firmware v1.4.1 (Stable):</span>
                <span className="font-bold text-slate-700">1 board (25%)</span>
              </div>
              <p className="text-slate-500 leading-relaxed pt-2">
                All connected boards satisfy mutual TLS certificate requirements and support dual IMU inflection angle computation.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </AppShell>
  );
}

