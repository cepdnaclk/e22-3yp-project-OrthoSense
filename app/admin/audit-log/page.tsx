"use client";

import * as React from "react";
import { AppShell } from "@/components/ui/AppShell";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/Card";
import { DataTable, Column } from "@/components/ui/DataTable";
import { INITIAL_AUDIT_LOGS } from "@/lib/services/mock-data";
import { AuditLogEntry } from "@/lib/types";
import { ShieldCheck, ShieldAlert, Info, AlertTriangle } from "lucide-react";

export default function AdminAuditLogPage() {
  const columns: Column<AuditLogEntry>[] = [
    {
      key: "timestamp",
      header: "Event Timestamp",
      sortable: true,
      render: (log) => new Date(log.timestamp).toLocaleString(),
    },
    { key: "actorName", header: "Actor / Device ID", sortable: true },
    {
      key: "actorRole",
      header: "Actor Role",
      render: (log) => <span className="uppercase text-xs font-mono font-semibold">{log.actorRole}</span>,
    },
    {
      key: "action",
      header: "Security Action",
      sortable: true,
      render: (log) => (
        <span className="font-mono text-xs font-bold text-slate-800 bg-slate-100 px-2 py-0.5 rounded">
          {log.action}
        </span>
      ),
    },
    { key: "details", header: "Audit Trail Description" },
    {
      key: "severity",
      header: "Severity",
      render: (log) => (
        <span
          className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
            log.severity === "critical"
              ? "bg-red-50 text-red-700 border border-red-200"
              : log.severity === "warning"
              ? "bg-amber-50 text-amber-800 border border-amber-200"
              : "bg-emerald-50 text-emerald-800 border border-emerald-200"
          }`}
        >
          {log.severity}
        </span>
      ),
    },
  ];

  return (
    <AppShell>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            Security & Compliance Audit Log (W2.7)
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Immutable technical audit trail recording access delegations, authentication events, and board telemetry fault triggers.
          </p>
        </div>

        <Card>
          <CardHeader className="py-3">
            <CardTitle>System Audit Stream ({INITIAL_AUDIT_LOGS.length} records)</CardTitle>
            <CardDescription>
              Retained in compliance with medical device governance standards.
            </CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            <DataTable
              data={INITIAL_AUDIT_LOGS}
              columns={columns}
              keyExtractor={(l) => l.id}
            />
          </CardContent>
        </Card>
      </div>
    </AppShell>
  );
}

