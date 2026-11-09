"use client";

import * as React from "react";
import { AppShell } from "@/components/ui/AppShell";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Dialog } from "@/components/ui/Dialog";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { DataTable, Column } from "@/components/ui/DataTable";
import { SkeletonTable } from "@/components/ui/Skeleton";
import { devicesApi, patientsApi } from "@/lib/services/api";
import { Device, User } from "@/lib/types";
import { Cpu, Plus, Key, Trash2, CheckCircle2, ShieldAlert, RefreshCw } from "lucide-react";

export default function AdminDevicesPage() {
  const [patients,setPatients] = React.useState<User[]>([]);
  const [devices, setDevices] = React.useState<Device[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [provisionOpen, setProvisionOpen] = React.useState(false);
  const [revokeOpen, setRevokeOpen] = React.useState(false);
  const [selectedDevice, setSelectedDevice] = React.useState<Device | null>(null);

  // New Device Form
  const [serial, setSerial] = React.useState("");
  const [mac, setMac] = React.useState("");
  const [generatedToken, setGeneratedToken] = React.useState("");
  const [submitting, setSubmitting] = React.useState(false);

  const fetchDevices = React.useCallback(() => {
    return Promise.all([devicesApi.getAll(),patientsApi.getAll()]).then(([data,patientList]) => {
      setDevices(data);setPatients(patientList);
    }).catch(() => {setDevices([]);}).finally(() => setLoading(false));
  }, []);

  React.useEffect(() => {
    fetchDevices();
  }, [fetchDevices]);

  const handleRegisterDevice = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!serial || !mac) return;

    setSubmitting(true);
    try {
      const resp = await devicesApi.create({
        device_identifier: serial,
        mac_address: mac,
      });
      if (resp && resp.hardwareBearerToken) {
        setGeneratedToken(resp.hardwareBearerToken);
      }
      fetchDevices();
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : "Failed to provision device");
    } finally {
      setSubmitting(false);
    }
  };

  const handleRevokeDevice = async () => {
    if (!selectedDevice) return;
    try {
      await devicesApi.revoke(selectedDevice.id);
      setRevokeOpen(false);
      setSelectedDevice(null);
      fetchDevices();
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : "Failed to revoke device");
    }
  };

  const columns: Column<Device>[] = [
    { key: "serialNumber", header: "Hardware Identifier", sortable: true },
    { key: "macAddress", header: "MAC Address", sortable: true },
    { key: "firmwareVersion", header: "Firmware", sortable: true },
    {
      key: "status",
      header: "Status",
      sortable: true,
      render: (d) => (
        <StatusBadge
          status={d.status === "online" ? "healthy" : "degraded"}
          labelOverride={d.status.toUpperCase()}
          size="sm"
        />
      ),
    },
    {
      key: "batteryPercent",
      header: "Battery",
      sortable: true,
      render: (d) => (
        <span className="font-mono text-xs">
          {d.batteryPercent}%
        </span>
      ),
    },
    {
      key: "assignedPatientName",
      header: "Assigned Patient",
      render: (d) => <div className="space-y-2"><p>{d.assignedPatientName || "Unassigned"}</p><select aria-label={`Assign patient for ${d.serialNumber}`} value={d.assignedPatientId || ""} onChange={async event => {
        const id=event.target.value;
        if(!confirm(id ? "Assign this device to the selected patient?" : "Unassign this device?")) return;
        try {await devicesApi.assign(d.id,id || null);await fetchDevices();} catch(error) {alert(error instanceof Error ? error.message : "Assignment failed");}
      }}><option value="">Unassigned</option>{patients.map(p => <option key={p.id} value={p.id} disabled={!!d.assignedPatientId && d.assignedPatientId!==p.id}>{p.fullName}</option>)}</select></div>,
    },
    {
      key: "id",
      header: "Actions",
      render: (d) => (
        <div className="flex items-center gap-2">
          <Button size="sm" variant="outline" onClick={async () => {
            if(!confirm("Rotate credentials? The old hardware token will immediately stop working.")) return;
            try {const response=await devicesApi.rotate(d.id);setGeneratedToken(response.hardwareBearerToken);setProvisionOpen(true);await fetchDevices();} catch(error) {alert(error instanceof Error ? error.message : "Rotation failed");}
          }}>Rotate token</Button>
          <Button
            size="sm"
            variant="ghost"
            onClick={() => {
              setSelectedDevice(d);
              setRevokeOpen(true);
            }}
            className="h-7 text-xs text-red-600 hover:text-red-700 hover:bg-red-50"
          >
            Revoke
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
              Edge Hardware & Device Fleet
            </h1>
            <p className="text-sm text-slate-500 mt-1">
              ESP32-S3 microcontroller registration, cryptographic token management, and fleet status.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={fetchDevices}
              loading={loading}
              className="gap-1.5"
            >
              <RefreshCw className="h-4 w-4" /> Refresh
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={() => {
                setGeneratedToken("");
                setProvisionOpen(true);
              }}
              className="gap-1.5"
            >
              <Plus className="h-4 w-4" /> Register New ESP32 Device
            </Button>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Physical Device Registry</CardTitle>
            <CardDescription>
              Hardware devices active in clinical field deployment.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <SkeletonTable rows={4} cols={6} />
            ) : (
              <DataTable columns={columns} data={devices} />
            )}
          </CardContent>
        </Card>

        {/* Provisioning Dialog */}
        <Dialog
          isOpen={provisionOpen}
          onClose={() => setProvisionOpen(false)}
          title="Register ESP32-S3 Edge Device"
          description="Enter hardware serial number and MAC address to issue a cryptographic bearer token."
        >
          {generatedToken ? (
            <div className="space-y-4">
              <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl space-y-2">
                <div className="flex items-center gap-2 text-emerald-800 font-bold text-sm">
                  <CheckCircle2 className="h-4 w-4" /> Device Provisioned Successfully
                </div>
                <p className="text-xs text-emerald-700">
                  Save this hardware authentication token now. For security, this secret token cannot be shown again:
                </p>
                <div className="p-2.5 bg-white border border-emerald-300 rounded-lg font-mono text-xs text-emerald-950 break-all select-all">
                  {generatedToken}
                </div>
              </div>
              <div className="flex justify-end">
                <Button variant="primary" onClick={() => setProvisionOpen(false)}>
                  Done
                </Button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleRegisterDevice} className="space-y-4">
              <Input
                label="Device Serial Number"
                required
                placeholder="e.g. ESP32-S3-ORTHO-099"
                value={serial}
                onChange={(e) => setSerial(e.target.value)}
              />
              <Input
                label="MAC Address"
                required
                placeholder="e.g. 7C:DF:A1:88:9B:42"
                value={mac}
                onChange={(e) => setMac(e.target.value)}
              />
              <div className="flex justify-end gap-2 pt-2">
                <Button type="button" variant="outline" onClick={() => setProvisionOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" variant="primary" loading={submitting}>
                  Generate Device Credentials
                </Button>
              </div>
            </form>
          )}
        </Dialog>

        {/* Revoke Dialog */}
        <Dialog
          isOpen={revokeOpen}
          onClose={() => setRevokeOpen(false)}
          title="Revoke Device Credentials"
          description="Are you sure you want to permanently revoke this device? It will immediately stop accepting telemetry packets."
        >
          <div className="space-y-4">
            <div className="p-3 bg-red-50 border border-red-200 text-xs text-red-800 rounded-lg">
              <span className="font-bold">Target Device:</span> {selectedDevice?.serialNumber} ({selectedDevice?.macAddress})
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setRevokeOpen(false)}>
                Cancel
              </Button>
              <Button variant="danger" onClick={handleRevokeDevice}>
                Confirm Revocation
              </Button>
            </div>
          </div>
        </Dialog>
      </div>
    </AppShell>
  );
}
