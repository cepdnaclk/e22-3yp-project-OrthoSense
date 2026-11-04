"use client";

import * as React from "react";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter, CardSkeleton } from "@/components/ui/Card";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { DataTable, Column } from "@/components/ui/DataTable";
import { Dialog } from "@/components/ui/Dialog";
import { SensorHealthStatus } from "@/lib/types";
import { ArrowLeft, Check, Sparkles } from "lucide-react";

interface SampleRow {
  id: string;
  name: string;
  role: string;
  status: SensorHealthStatus;
  battery: string;
}

export default function DesignSystemPage() {
  const [dialogOpen, setDialogOpen] = React.useState(false);
  const [inputValue, setInputValue] = React.useState("");
  const [hasError, setHasError] = React.useState(false);

  const sampleData: SampleRow[] = [
    { id: "1", name: "ESP32-S3-ORTHO-092", role: "Sarah Connor (Post-Op ACL)", status: "healthy", battery: "94%" },
    { id: "2", name: "ESP32-S3-ORTHO-104", role: "David Miller (TKR)", status: "degraded", battery: "42%" },
    { id: "3", name: "ESP32-S3-ORTHO-031", role: "Unassigned Buffer", status: "stale", battery: "12%" },
    { id: "4", name: "ESP32-S3-ORTHO-077", role: "James Wilson (Knee Arthroscopy)", status: "rail", battery: "78%" },
    { id: "5", name: "ESP32-S3-ORTHO-019", role: "Emma Watson (Meniscus)", status: "invalid", battery: "0%" },
  ];

  const columns: Column<SampleRow>[] = [
    { key: "name", header: "Hardware Identifier", sortable: true },
    { key: "role", header: "Assigned Subject", sortable: true },
    {
      key: "status",
      header: "Sensor Telemetry Status",
      sortable: true,
      render: (item) => <StatusBadge status={item.status} />,
    },
    { key: "battery", header: "Battery Gauge", sortable: true },
  ];

  const tokens = [
    { name: "--color-background", hex: "#F8FAFC", label: "Page Background", contrast: "Base surface" },
    { name: "--color-card", hex: "#FFFFFF", label: "Card & Modal Surface", contrast: "Base card" },
    { name: "--color-text-primary", hex: "#0F172A", label: "Primary Clinical Text", contrast: "14.8:1 (AAA)" },
    { name: "--color-text-secondary", hex: "#475569", label: "Secondary / Metadata", contrast: "7.3:1 (AAA)" },
    { name: "--color-primary", hex: "#0F766E", label: "Primary Actions / Buttons", contrast: "4.8:1 (AA)" },
    { name: "--color-interactive", hex: "#1D4ED8", label: "Interactive / Links", contrast: "5.2:1 (AA)" },
    { name: "--color-warning", hex: "#92400E", label: "Degradation Warning", contrast: "5.1:1 (AA)" },
    { name: "--color-critical", hex: "#B91C1C", label: "Critical Sensor / Rail Fault", contrast: "5.4:1 (AA)" },
  ];

  return (
    <div className="min-h-screen bg-[#F8FAFC] py-10 px-4 sm:px-8 max-w-6xl mx-auto space-y-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-200">
        <div>
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#0F766E] hover:underline mb-2"
          >
            <ArrowLeft className="h-3.5 w-3.5" /> Back to Application
          </Link>
          <h1 className="text-3xl font-bold tracking-tight text-[#0F172A]">
            Phase W0 — Design System & Clinical Primitives
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Standardized WCAG 2.2 Level AA compliant tokens, atomic UI primitives, and domain telemetry status components.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button onClick={() => setDialogOpen(true)} variant="primary">
            Launch Test Dialog
          </Button>
        </div>
      </div>

      {/* Section 1: Color Tokens */}
      <section className="space-y-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900">1. Evidence-Based Clinical Color Tokens</h2>
          <p className="text-xs text-slate-500">
            Tailwind CSS v4 declared tokens ensuring WCAG 2.2 AA / AAA contrast standards.
          </p>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {tokens.map((token) => (
            <div
              key={token.name}
              className="p-4 rounded-xl border border-slate-200 bg-white shadow-xs space-y-3"
            >
              <div
                className="h-14 rounded-lg border border-slate-200/60 shadow-inner flex items-end p-2"
                style={{ backgroundColor: token.hex }}
              >
                <span
                  className="text-[11px] font-mono px-1.5 py-0.5 rounded shadow-xs"
                  style={{
                    backgroundColor: token.hex === "#FFFFFF" || token.hex === "#F8FAFC" ? "#0F172A" : "#FFFFFF",
                    color: token.hex === "#FFFFFF" || token.hex === "#F8FAFC" ? "#FFFFFF" : "#0F172A",
                  }}
                >
                  {token.hex}
                </span>
              </div>
              <div>
                <p className="text-xs font-semibold text-slate-900">{token.label}</p>
                <p className="text-[11px] font-mono text-slate-500">{token.name}</p>
                <p className="text-[10px] text-teal-700 font-medium mt-1">Contrast: {token.contrast}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Section 2: Status Badges (Domain Essential) */}
      <section className="space-y-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900">2. Telemetry & Sensor Status Badges (W0.7)</h2>
          <p className="text-xs text-slate-500">
            Mandatory clinical rule: Always render high-contrast text and recognizable SVG icons alongside color.
          </p>
        </div>
        <Card>
          <CardContent className="flex flex-wrap gap-3 py-6">
            <StatusBadge status="healthy" />
            <StatusBadge status="degraded" />
            <StatusBadge status="stale" />
            <StatusBadge status="rail" />
            <StatusBadge status="invalid" />
            <StatusBadge status="unverified" />
          </CardContent>
        </Card>
      </section>

      {/* Section 3: Buttons */}
      <section className="space-y-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900">3. Button Variants and Interaction States (W0.4)</h2>
          <p className="text-xs text-slate-500">
            Keyboard focusable with visible focus rings, aria-busy spinners, and disabled protection.
          </p>
        </div>
        <Card>
          <CardContent className="space-y-6">
            <div className="flex flex-wrap items-center gap-3">
              <Button variant="primary">Primary Action</Button>
              <Button variant="secondary">Secondary Action</Button>
              <Button variant="outline">Outline Action</Button>
              <Button variant="ghost">Ghost Button</Button>
              <Button variant="destructive">Destructive Action</Button>
            </div>
            <div className="flex flex-wrap items-center gap-3 pt-4 border-t border-slate-100">
              <Button variant="primary" loading>
                Processing Telemetry...
              </Button>
              <Button variant="primary" disabled>
                Disabled Action
              </Button>
              <Button variant="secondary" size="sm">
                Small (sm)
              </Button>
              <Button variant="secondary" size="md">
                Medium (md)
              </Button>
              <Button variant="secondary" size="lg">
                Large (lg)
              </Button>
            </div>
          </CardContent>
        </Card>
      </section>

      {/* Section 4: Form Controls */}
      <section className="space-y-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900">4. Form Inputs and Selects (W0.5)</h2>
          <p className="text-xs text-slate-500">
            Accessible labels with aria-invalid, error alerts, and helper text integration.
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Input Field States</CardTitle>
              <CardDescription>Normal, helper, and live validation error</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Input
                label="Patient Clinical ID"
                placeholder="e.g. PAT-2026-09"
                helperText="Format: PAT-YYYY-NN"
                value={inputValue}
                onChange={(e) => {
                  setInputValue(e.target.value);
                  setHasError(e.target.value.length > 0 && !e.target.value.startsWith("PAT-"));
                }}
                error={hasError ? "Must begin with PAT- prefix" : undefined}
              />
              <Input
                label="Disabled Field"
                value="ESP32-S3-HARDWARE-LOCKED"
                disabled
                helperText="Hardware identifier cannot be modified manually."
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Select Dropdown</CardTitle>
              <CardDescription>Target rehabilitation exercise protocol</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Select
                label="Exercise Routine"
                defaultValue="knee_flex"
                options={[
                  { value: "knee_flex", label: "Active Knee Flexion / Extension" },
                  { value: "slr", label: "Straight Leg Raise (SLR)" },
                  { value: "quad_sets", label: "Isometric Quadriceps Sets" },
                  { value: "terminal_ext", label: "Terminal Knee Extension (TKE)" },
                ]}
                helperText="Select protocol to assign to subject's daily regimen."
              />
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Section 5: Data Table */}
      <section className="space-y-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900">5. Interactive Data Table (W0.8)</h2>
          <p className="text-xs text-slate-500">
            Click column headers to sort ascending / descending with accessible ARIA sort announcements.
          </p>
        </div>
        <DataTable
          data={sampleData}
          columns={columns}
          keyExtractor={(row) => row.id}
        />
      </section>

      {/* Section 6: Cards and Skeleton */}
      <section className="space-y-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900">6. Card Containers & Loading Skeletons (W0.6)</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Standard Card Container</CardTitle>
              <CardDescription>Structured card with header, body, and action footer</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-slate-600 leading-relaxed">
                Contains clinical telemetry readings, range of motion progressions, and device hardware telemetry.
              </p>
            </CardContent>
            <CardFooter className="flex justify-between">
              <span className="text-xs text-slate-400">Firmware v1.4.2</span>
              <Button size="sm" variant="outline">View History</Button>
            </CardFooter>
          </Card>

          <CardSkeleton />
        </div>
      </section>

      {/* Modal Dialog */}
      <Dialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        title="Hardware Provisioning Confirmation"
        description="Verify edge device cryptographic pairing key."
      >
        <div className="space-y-4">
          <div className="p-4 rounded-lg bg-slate-50 border border-slate-200 text-xs font-mono text-slate-700">
            TOKEN: ortho_live_sec_9941a7c0410ef7
          </div>
          <p className="text-sm text-slate-600">
            This token will be provisioned to the ESP32-S3 microcontroller to establish mutual TLS and secure DRF ingestion sessions.
          </p>
          <div className="flex justify-end gap-3 pt-3">
            <Button variant="ghost" onClick={() => setDialogOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" onClick={() => setDialogOpen(false)}>
              Acknowledge & Confirm
            </Button>
          </div>
        </div>
      </Dialog>
    </div>
  );
}

