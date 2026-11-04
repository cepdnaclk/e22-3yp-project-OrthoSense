"use client";

import * as React from "react";
import Link from "next/link";
import { AppShell } from "@/components/ui/AppShell";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { INITIAL_USERS } from "@/lib/services/mock-data";
import { TrendingUp, FileText, Printer, ArrowRight } from "lucide-react";

export default function DoctorReportsIndexPage() {
  const patients = INITIAL_USERS.filter((u) => u.role === "patient");

  return (
    <AppShell>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            Longitudinal Rehabilitation Trends & Clinical Reports (Phase W5)
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Track patient Range-of-Motion (ROM) progress over weeks, compliance rates, and generate printable clinic records.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {patients.map((pat) => (
            <Card key={pat.id}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base">{pat.fullName}</CardTitle>
                  <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                    Week 4 Post-Op
                  </span>
                </div>
                <CardDescription>{pat.department}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-3 p-3 bg-slate-50 rounded-lg border border-slate-100 text-xs">
                  <div>
                    <span className="text-slate-400 block text-[10px] uppercase font-semibold">Max Flexion Progression</span>
                    <span className="text-base font-bold text-teal-800">75° → 102°</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px] uppercase font-semibold">Longitudinal Compliance</span>
                    <span className="text-base font-bold text-slate-900">92%</span>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2">
                  <Link href={`/reports/session/ses_2026_1104_01`}>
                    <Button size="sm" variant="outline" className="text-xs gap-1">
                      <Printer className="h-3 w-3" /> Printable Report
                    </Button>
                  </Link>
                  <Link href={`/doctor/patients/${pat.id}`}>
                    <Button size="sm" variant="primary" className="text-xs gap-1">
                      <span>Full Telemetry</span> <ArrowRight className="h-3 w-3" />
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </AppShell>
  );
}

