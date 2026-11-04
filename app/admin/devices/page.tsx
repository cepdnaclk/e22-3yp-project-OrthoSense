"use client";

import * as React from "react";
import { AppShell } from "@/components/ui/AppShell";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Dialog } from "@/components/ui/Dialog";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { DataTable, Column } from "@/components/ui/DataTable";
import { INITIAL_DEVICES } from "@/lib/services/mock-data";
import { Device } from "@/lib/types";
import { Cpu, Plus, Key, Trash2, CheckCircle2, ShieldAlert } from "lucide-react";

export default function AdminDevicesPage() {
  const [devices, setDevices] = React.useState<Device[]>(INITIAL_DEVICES);
  const [provisionOpen, setProvisionOpen] = React.useState(false);
  const [revokeOpen, setRevokeOpen] = React.useState(false);
  const [selectedDevice, setSelectedDevice] = React.useState<Device | null>(null);

  // New Device Form
  const [serial, setSerial] = React.useState("");
  const [mac, setMac] = React.useState("");
  const [generatedToken, setGeneratedToken] = React.useState("");

  const handleRegisterDevice = (e: React.FormEvent) => {
    e.preventDefault();
    if (!serial || !mac) return;

    const token = `ortho_sec_${Math.random().toString(36).substring(2)}${Date.now()}`;
    const newDev: Device = {
      id: `dev_${Date.now()}`,
      serialNumber: serial,
      macAddress: mac,
      firmwareVersion: "v1.4.2",
      status: "unpaired",
      batteryPercent: 100,
      lastSeenAt: new Date().toISOString(),
      token,
      sensorHealth: {
        imuThigh: "healthy",
        imuShank: "healthy",
        fsrFoot: "healthy",
        tempSensor: "healthy",
      },
    };

    setDevices([newDev, ...devices]);
    setGeneratedToken(token);
  };

  const handleConfirmRevoke = () => {
    if (!selectedDevice) return;
    setDevices(devices.filter((d) => d.id !== selectedDevice.id));
    setRevokeOpen(false);
    setSelectedDevice(null);
  };

  const columns: Column<Device>[] = [
    { key: "serialNumber", header: "Serial / ID", sortable: true },
    { key: "macAddress", header: "Hardware MAC Address", sortable: true },
    { key: "firmwareVersion", header: "Firmware", sortable: true },
    {
      key: "status",
      header: "Status",
      sortable: true,
      render: (d) => (
        <StatusBadge
          status={d.status === "online" ? "healthy" : d.status === "maintenance" ? "degraded" : "stale"}
          labelOverride={d.status.toUpperCase()}
          size="sm"
        />
      ),
    },
    {
      key: "batteryPercent",
      header: "Battery",
      render: (d) => <span className="font-semibold text-slate-800">{d.batteryPercent}%</span>,
    },
    {
      key: "assignedPatientName",
      header: "Paired Subject",
      render: (d) => (
        <span className="text-xs text-slate-700">
          {d.assignedPatientName || <span className="text-slate-400 italic">Unassigned Pool</span>}
        </span>
      ),
    },
    {
      key: "id",
      header: "Security Actions",
      render: (d) => (
        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant="outline"
            className="h-7 text-xs gap-1"
            onClick={() => {
              setSelectedDevice(d);
              setGeneratedToken(d.token || `ortho_sec_${Math.random().toString(36).substring(2)}`);
              setProvisionOpen(true);
            }}
          >
            <Key className="h-3 w-3" /> Token
          </Button>
          <Button
            size="sm"
            variant="ghost"
            className="h-7 text-xs text-red-600 hover:bg-red-50"
            onClick={() => {
              setSelectedDevice(d);
              setRevokeOpen(true);
            }}
          >
            <Trash2 className="h-3 w-3" /> Retire
          </Button>
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
              Edge Device Registry & Provisioning (W2.4)
            </h1>
            <p className="text-xs text-slate-500 mt-1">
              ESP32-S3 microcontroller enrollment, token issuance, and device lifecycle retirement.
            </p>
          </div>
          <Button
            size="sm"
            variant="primary"
            onClick={() => {
              setSelectedDevice(null);
              setGeneratedToken("");
              setProvisionOpen(true);
            }}
            className="gap-1.5"
          >
            <Plus className="h-4 w-4" /> Register New ESP32-S3
          </Button>
        </div>

        <Card>
          <CardHeader className="py-3">
            <CardTitle>Enrolled Microcontrollers ({devices.length})</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <DataTable
              data={devices}
              columns={columns}
              keyExtractor={(d) => d.id}
            />
          </CardContent>
        </Card>

        {/* Provisioning Dialog */}
        <Dialog
          open={provisionOpen}
          onClose={() => {
            setProvisionOpen(false);
            setGeneratedToken("");
          }}
          title={selectedDevice ? `Provisioning Credentials: ${selectedDevice.serialNumber}` : "Register New Edge Board"}
          description="Issue cryptographic ingestion tokens for mutual DRF authentication."
        >
          {generatedToken ? (
            <div className="space-y-4">
              <div className="p-3 bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 rounded-lg flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
                Hardware cryptographic key generated successfully.
              </div>
              <div className="space-y-1">
                <label className="text-xs font-semibold uppercase text-slate-500">Board Auth Token</label>
                <div className="p-3 bg-slate-900 text-teal-400 font-mono text-xs rounded-lg select-all break-all">
                  {generatedToken}
                </div>
              </div>
              <p className="text-xs text-slate-500 leading-relaxed">
                Flash this token to non-volatile storage (NVS) on the ESP32-S3 board. The board will present this token in its HTTPS authorization header during telemetry stream ingestion.
              </p>
              <div className="flex justify-end pt-2">
                <Button variant="primary" onClick={() => setProvisionOpen(false)}>
                  Done
                </Button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleRegisterDevice} className="space-y-4">
              <Input
                label="Device Serial Number"
                placeholder="e.g. ESP32-S3-ORTHO-115"
                required
                value={serial}
                onChange={(e) => setSerial(e.target.value)}
              />
              <Input
                label="Hardware MAC Address"
                placeholder="e.g. 40:22:D8:E1:94:11"
                required
                value={mac}
                onChange={(e) => setMac(e.target.value)}
              />
              <div className="flex justify-end gap-2 pt-2">
                <Button type="button" variant="ghost" onClick={() => setProvisionOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" variant="primary">
                  Generate Ingestion Key
                </Button>
              </div>
            </form>
          )}
        </Dialog>

        {/* Revocation Dialog */}
        <Dialog
          open={revokeOpen}
          onClose={() => setRevokeOpen(false)}
          title="Confirm Device Retirement & Key Revocation"
          description={`Permanently revoke authentication tokens for ${selectedDevice?.serialNumber}?`}
        >
          <div className="space-y-4">
            <p className="text-xs text-red-700 bg-red-50 p-3 rounded-lg border border-red-200">
              Warning: Revoking this device will instantly terminate active telemetry sessions and prevent future DRF REST ingestion until re-provisioned.
            </p>
            <div className="flex justify-end gap-2">
              <Button variant="ghost" onClick={() => setRevokeOpen(false)}>
                Cancel
              </Button>
              <Button variant="destructive" onClick={handleConfirmRevoke}>
                Confirm Revocation
              </Button>
            </div>
          </div>
        </Dialog>
      </div>
    </AppShell>
  );
}

