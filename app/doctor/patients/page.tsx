"use client";

import * as React from "react";
import Link from "next/link";
import { AppShell } from "@/components/ui/AppShell";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { DataTable, Column } from "@/components/ui/DataTable";
import { INITIAL_USERS } from "@/lib/services/mock-data";
import { User } from "@/lib/types";
import { Search, ChevronRight, UserPlus, Filter } from "lucide-react";

export default function DoctorPatientsPage() {
  const [searchTerm, setSearchTerm] = React.useState("");

  const patients = INITIAL_USERS.filter((u) => u.role === "patient");
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
              Patient Cohort Directory (W3.2)
            </h1>
            <p className="text-xs text-slate-500 mt-1">
              Longitudinal tracking and rehabilitation protocol assignments across clinical cohorts.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <div className="relative w-64">
              <Input
                placeholder="Search by name or surgery..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="h-9 text-xs"
              />
            </div>
          </div>
        </div>

        <Card>
          <CardHeader className="py-4">
            <CardTitle>Assigned Patients ({filtered.length})</CardTitle>
            <CardDescription>
              Select a patient record to view range-of-motion progression, recent session graphs, and prescribed exercise plans.
            </CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            <DataTable
              data={filtered}
              columns={columns}
              keyExtractor={(p) => p.id}
            />
          </CardContent>
        </Card>
      </div>
    </AppShell>
  );
}

