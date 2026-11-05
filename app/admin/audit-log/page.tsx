"use client";

import * as React from "react";
import { AppShell } from "@/components/ui/AppShell";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { DataTable, Column } from "@/components/ui/DataTable";
import { SkeletonTable } from "@/components/ui/Skeleton";
import { auditApi } from "@/lib/services/api";
import { AuditLogEntry } from "@/lib/types";
import { ShieldCheck, ShieldAlert, Info, AlertTriangle, RefreshCw } from "lucide-react";

export default function AdminAuditLogPage() {
  const [logs, setLogs] = React.useState<AuditLogEntry[]>([]);
  const [loading, setLoading] = React.useState(true);

  const fetchAuditLogs = React.useCallback(async () => {
    setLoading(true);
    try {
      const data = await auditApi.getAll();
      setLogs(data);
    } catch {
      // Keep empty if error
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    fetchAuditLogs();
  }, [fetchAuditLogs]);

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
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">
              Security & Compliance Audit Log
            </h1>
            <p className="text-sm text-slate-500 mt-1">
              Immutable historical event log tracking administrative, clinical, and edge hardware operations.
            </p>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={fetchAuditLogs}
            loading={loading}
            className="gap-1.5"
          >
            <RefreshCw className="h-4 w-4" /> Refresh
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>System Audit Events</CardTitle>
            <CardDescription>
              Chronological ledger of authentication and prescription lifecycle operations.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <SkeletonTable rows={5} cols={6} />
            ) : (
              <DataTable columns={columns} data={logs} emptyMessage="No audit log events recorded yet." />
            )}
          </CardContent>
        </Card>
      </div>
    </AppShell>
  );
}
