"use client";
import * as React from "react";
import Link from "next/link";
import { AppShell } from "@/components/ui/AppShell";
import { devicesApi,patientProfileApi } from "@/lib/services/api";
import { apiClient } from "@/lib/services/api-client";
import type { DeviceDto,AlertDto } from "@/lib/services/api-contract";
export default function PatientDevice() {
  const [device,setDevice]=React.useState<DeviceDto | null>(null);
  const [alerts,setAlerts]=React.useState<AlertDto[]>([]);
  const [loading,setLoading]=React.useState(true);
  const [error,setError]=React.useState("");
  const [checked,setChecked]=React.useState<string | null>(null);
  React.useEffect(() => {
    let active=true;
    const load=async () => {
      try {
        const profile=await patientProfileApi.get();
        const id=profile.assigned_device?.id;
        const [record,events]=await Promise.all([id ? apiClient.get<DeviceDto>(`/devices/${id}/`) : Promise.resolve(null),devicesApi.getAlerts()]);
        if(active) {setDevice(record);setAlerts(events.filter(x => x.device_id===id));setError("");setChecked(new Date().toLocaleTimeString());}
      } catch {if(active) {setError("Device status unavailable. Existing readings may be outdated.");setDevice(null);}}
      finally {if(active) setLoading(false);}
    };
    void load(); const timer=setInterval(() => void load(),15000);
    return () => {active=false;clearInterval(timer);};
  },[]);
  return <AppShell><div className="max-w-4xl space-y-5"><Link href="/patient/dashboard" className="text-teal-700 underline">Back to dashboard</Link><h1 className="text-2xl font-bold">Your knee brace</h1>
    {error && <p role="alert" className="rounded bg-red-50 p-4">{error}</p>}{loading ? <p role="status">Checking assigned device...</p> : !device ? <p>{error ? "Reconnect and retry." : "No device is assigned. Contact your care team."}</p> : <>
    <section className="space-y-2 rounded-xl border bg-white p-6"><h2 className="text-xl font-bold">{device.device_identifier}</h2><p>Connection: {device.connectivity ?? "unknown"}</p><p>Enrollment: {device.status}</p><p>Last authenticated contact: {device.last_seen_at ? new Date(device.last_seen_at).toLocaleString() : "Never reported"}</p><p>Last reported battery: {device.battery_percent === null ? "Unavailable" : `${device.battery_percent}%`}</p><p>Firmware: {device.firmware_version}</p><p className="text-sm text-slate-600">Page checks every 15 seconds. Last check: {checked}. Refreshing this page does not test or contact the hardware.</p></section>
    <section className="space-y-3 rounded-xl border bg-white p-6"><h2 className="text-xl font-bold">Reported sensor health</h2>{device.sensor_channels.length ? device.sensor_channels.map((channel,index) => <div key={index} className="flex justify-between border-b py-2"><span>{channel.sensor_type}</span><strong>{device.connectivity === "online" ? channel.health_status : "UNVERIFIED (device not online)"}</strong></div>) : <p>No sensor health has been reported by this device.</p>}<p className="text-sm text-slate-600">Device reports do not establish calibration or clinical measurement accuracy.</p></section>
    <section className="space-y-3 rounded-xl border bg-white p-6"><h2 className="text-xl font-bold">Device alerts</h2>{alerts.length ? alerts.map(alert => <p key={alert.id}>{alert.severity}: {alert.message} ? {alert.resolved_at ? "Resolved" : "Open"}</p>) : <p>No recorded alerts. This does not confirm that all hardware checks passed.</p>}</section>
    </>}
  </div></AppShell>;
}
