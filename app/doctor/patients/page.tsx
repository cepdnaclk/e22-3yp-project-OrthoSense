"use client";

import * as React from "react";
import Link from "next/link";
import { AppShell } from "@/components/ui/AppShell";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { DataTable, Column } from "@/components/ui/DataTable";
import { SkeletonTable } from "@/components/ui/Skeleton";
import { patientsApi } from "@/lib/services/api";
import { User } from "@/lib/types";
import { Search, ChevronRight, UserPlus, Filter, RefreshCw } from "lucide-react";

export default function DoctorPatientsPage() {
  const [searchTerm, setSearchTerm] = React.useState("");
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

  const filtered = patients.filter(
    (p) =>
      p.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (p.department && p.department.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const columns: Column<User>[] = [
    { key: "fullName", header: "Patient Full Name", sortable: true },
    { key: "department", header: "Surgical / Clinical Cohort", sortable: true },
    {
      key: "assignedDeviceId",
      header: "Edge Telemetry Device",
      sortable: true,
      render: (p) => (
        <span className="font-mono text-xs text-slate-700 bg-slate-100 px-2 py-0.5 rounded">
          {p.assignedDeviceId || "No device"}
        </span>
      ),
    },
    {
      key: "isActive",
      header: "Protocol Status",
      render: (p) => (
        <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-600"></span> Active Rehabilitation
        </span>
      ),
    },
    {
      key: "id",
      header: "Actions",
      render: (p) => (
        <div className="flex items-center gap-2">
          <Link href={`/doctor/patients/${p.id}`}>
            <Button size="sm" variant="outline" className="h-7 text-xs">
              Overview
            </Button>
          </Link>
          <Link href={`/doctor/patients/${p.id}/plan`}>
            <Button size="sm" variant="ghost" className="h-7 text-xs text-[#0F766E]">
              Edit Plan
            </Button>
          </Link>
        </div>
      ),
    },
  ];

  return (
    <AppShell>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">
              Assigned Patient Cohort
            </h1>
            <p className="text-sm text-slate-500 mt-1">
              Select a patient to inspect biomechanical telemetry, edit prescriptions, or review sessions.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={fetchPatients}
              className="gap-1.5"
              loading={loading}
            >
              <RefreshCw className="h-4 w-4" /> Refresh
            </Button>
            <Button variant="primary" size="sm" className="gap-1.5">
              <UserPlus className="h-4 w-4" /> Enroll New Patient
            </Button>
          </div>
        </div>

        <Card>
          <CardHeader className="pb-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <CardTitle>Clinical Patient Directory</CardTitle>
              <div className="w-full sm:w-72">
                <Input
                  placeholder="Search by patient name or diagnosis..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  icon={<Search className="h-4 w-4 text-slate-400" />}
                />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {loading ? (
              <SkeletonTable rows={5} cols={4} />
            ) : (
              <DataTable
                columns={columns}
                data={filtered}
                emptyMessage="No assigned patients found matching criteria."
              />
            )}
          </CardContent>
        </Card>
      </div>
    </AppShell>
  );
}
