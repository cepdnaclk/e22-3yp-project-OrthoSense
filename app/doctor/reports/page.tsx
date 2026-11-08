"use client";

import * as React from "react";
import Link from "next/link";
import { AppShell } from "@/components/ui/AppShell";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { SkeletonCard } from "@/components/ui/Skeleton";
import { patientsApi } from "@/lib/services/api";
import { User } from "@/lib/types";
import { TrendingUp, FileText, Printer, ArrowRight, RefreshCw } from "lucide-react";

export default function DoctorReportsIndexPage() {
  const [patients, setPatients] = React.useState<User[]>([]);
  const [loading, setLoading] = React.useState(true);

  const fetchPatients = React.useCallback(async () => {
    setLoading(true);
    try {
      const data = await patientsApi.getAll();
      setPatients(data);
    } catch {
      // Keep empty if error
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    fetchPatients();
  }, [fetchPatients]);

  return (
    <AppShell>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">
              Longitudinal Rehabilitation Trends &amp; Clinical Reports
            </h1>
            <p className="text-xs text-slate-500 mt-1">
              Track patient Range-of-Motion (ROM) progress over weeks, compliance rates, and generate printable clinic records.
            </p>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={fetchPatients}
            loading={loading}
            className="gap-1.5"
          >
            <RefreshCw className="h-4 w-4" /> Refresh
          </Button>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <SkeletonCard />
            <SkeletonCard />
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {patients.map((pat) => (
              <Card key={pat.id}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-base">{pat.fullName}</CardTitle>
                    <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                      Active Cohort
                    </span>
                  </div>
                  <CardDescription>{pat.department || "Orthopedic Patient"}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-3 p-3 bg-slate-50 rounded-lg border border-slate-100 text-xs">
                    <div>
                      <span className="text-slate-400 block text-[10px] uppercase font-semibold">Max Flexion Progression</span>
                      <span className="text-base font-bold text-teal-800">75° → 105°</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[10px] uppercase font-semibold">Longitudinal Compliance</span>
                      <span className="text-base font-bold text-slate-900">92%</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-2">
                    <Link href={`/reports/session/${pat.id}`}>
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
        )}
      </div>
    </AppShell>
  );
}
