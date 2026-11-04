"use client";

import * as React from "react";
import Link from "next/link";
import { AppShell } from "@/components/ui/AppShell";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { INITIAL_EXERCISES } from "@/lib/services/mock-data";
import { Dumbbell, Plus, ArrowLeft } from "lucide-react";

export default function DoctorExercisesPage() {
  return (
    <AppShell>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Link href="/doctor/dashboard">
              <Button size="sm" variant="outline" className="gap-1.5">
                <ArrowLeft className="h-4 w-4" /> Back to Dashboard
              </Button>
            </Link>
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-slate-900">
                Exercise Definition Library (W3.6)
              </h1>
              <p className="text-xs text-slate-500 mt-1">
                Standardized knee rehabilitation movement definitions, ROM parameters, and repetition baselines.
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {INITIAL_EXERCISES.map((ex) => (
            <Card key={ex.id}>
              <CardHeader className="flex flex-row items-start justify-between">
                <div>
                  <CardTitle className="text-base font-bold text-slate-900">{ex.name}</CardTitle>
                  <CardDescription className="text-xs text-teal-700 font-semibold mt-1">
                    Target: {ex.targetJoint}
                  </CardDescription>
                </div>
                <div className="h-9 w-9 rounded-lg bg-teal-50 border border-teal-200 flex items-center justify-center text-[#0F766E]">
                  <Dumbbell className="h-4 w-4" />
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-xs text-slate-600 leading-relaxed">{ex.description}</p>
                <div className="grid grid-cols-3 gap-2 bg-slate-50 p-3 rounded-lg border border-slate-100 text-xs">
                  <div>
                    <span className="text-[10px] text-slate-400 block uppercase font-medium">ROM Flexion</span>
                    <span className="font-bold text-slate-800">{ex.targetAngleMaxDeg}°</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block uppercase font-medium">Extension</span>
                    <span className="font-bold text-slate-800">{ex.targetAngleMinDeg}°</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block uppercase font-medium">Rest Interval</span>
                    <span className="font-bold text-slate-800">{ex.restIntervalSeconds}s</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </AppShell>
  );
}

