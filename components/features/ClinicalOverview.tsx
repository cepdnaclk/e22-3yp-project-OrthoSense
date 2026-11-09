"use client";
import * as React from "react";
import Link from "next/link";
import { AppShell } from "@/components/ui/AppShell";
import { Button } from "@/components/ui/Button";
import { ClinicalSessionTable } from "./ClinicalSessionTable";
import { useClinicalResource } from "./useClinicalResource";
import { devicesApi,patientsApi,plansApi,sessionsApi } from "@/lib/services/api";
import { ApiError } from "@/lib/services/api-client";
import type { ClinicalFilters } from "@/lib/services/api-contract";
export function ClinicalOverview({patientId,reports=false}:{patientId?:string;reports?:boolean}) {
  const [from,setFrom]=React.useState(() => new Date(Date.now()-29*86400000).toISOString().slice(0,10));
  const [to,setTo]=React.useState(() => new Date().toISOString().slice(0,10));
  const [selectedPatient,setSelectedPatient]=React.useState("");
  const [status,setStatus]=React.useState("");
  const [reviewed,setReviewed]=React.useState("");
  const [page,setPage]=React.useState(1);
  const [ordering,setOrdering]=React.useState<"started_at"|"-started_at">("-started_at");
  const filters=React.useMemo<ClinicalFilters>(() => ({patient_id:patientId || selectedPatient || undefined,date_from:from || undefined,date_to:to || undefined,status:status ? status as ClinicalFilters["status"] : undefined,reviewed:reviewed ? reviewed==="true" : undefined,ordering}),[patientId,selectedPatient,from,to,status,reviewed,ordering]);
  const loader=React.useCallback(async () => {
    const [summary,sessions,patients,plan,devices]=await Promise.all([
      sessionsApi.summary(filters),sessionsApi.listPage({...filters,page}),
      patientId ? patientsApi.getById(patientId).then(p => [p]) : patientsApi.getAll(),
      patientId ? plansApi.getMyPlan(patientId).catch(e => {if(e instanceof ApiError && e.status===404) return null;throw e;}) : Promise.resolve(null),
      patientId ? devicesApi.getAll() : Promise.resolve([]),
    ]);
    return {summary,sessions,patients,plan,devices};
  },[filters,page,patientId]);
  const {data,error,loading,refresh}=useClinicalResource(loader);
  const patient=patientId ? data?.patients[0] : undefined;
  const device=data?.devices.find(d => d.id===patient?.assignedDeviceId);
  function change(update:()=>void) {update();setPage(1);}
  return <AppShell><div className="space-y-6">
    <header className="flex flex-wrap items-center justify-between gap-4"><div><h1 className="text-2xl font-bold">{patientId ? patient?.fullName ?? "Patient clinical history" : reports ? "Clinical reports and trends" : "Clinical telemetry dashboard"}</h1><p className="mt-1 text-sm text-slate-500">Scoped records and UTC calendar reporting periods.</p></div><div className="flex gap-3"><Button variant="outline" onClick={refresh}>Refresh</Button>{patientId ? <Link href={`/doctor/patients/${patientId}/plan`} className="rounded bg-teal-700 px-4 py-2 text-white">Manage prescription</Link> : <Link href="/doctor/patients" className="rounded bg-teal-700 px-4 py-2 text-white">Patient cohort</Link>}</div></header>
    <section className="flex flex-wrap items-end gap-4 rounded-xl border bg-white p-4" aria-label="Clinical filters">
      <label>From (UTC)<input className="block rounded border p-2" type="date" value={from} onChange={e => change(() => setFrom(e.target.value || from))}/></label>
      <label>Through (UTC)<input className="block rounded border p-2" type="date" value={to} onChange={e => change(() => setTo(e.target.value || to))}/></label>
      {!patientId && <label>Patient<select className="block rounded border p-2" value={selectedPatient} onChange={e => change(() => setSelectedPatient(e.target.value))}><option value="">All assigned patients</option>{data?.patients.map(p => <option key={p.id} value={p.id}>{p.fullName}</option>)}</select></label>}
      <label>Status<select className="block rounded border p-2" value={status} onChange={e => change(() => setStatus(e.target.value))}><option value="">All statuses</option><option value="completed">Completed</option><option value="in_progress">In progress</option><option value="abandoned">Abandoned</option></select></label>
      <label>Review<select className="block rounded border p-2" value={reviewed} onChange={e => change(() => setReviewed(e.target.value))}><option value="">All</option><option value="false">Pending</option><option value="true">Reviewed</option></select></label>
      <label>Order<select className="block rounded border p-2" value={ordering} onChange={e => change(() => setOrdering(e.target.value as typeof ordering))}><option value="-started_at">Newest first</option><option value="started_at">Oldest first</option></select></label>
    </section>
    {loading && <p role="status">Loading clinical information...</p>}{error && <p role="alert" className="rounded border border-red-200 bg-red-50 p-4 text-red-800">{error}</p>}
    {data && <>
      <p className="text-sm text-slate-600">{data.summary.period.date_from} through {data.summary.period.date_to} ({data.summary.period.timezone}), with the selected patient/status/review filters. Totals include every matching page.</p>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">{[
        ["Assigned patients",data.summary.patients],["Completed sessions",data.summary.completed],["Completed, pending review",data.summary.pending_review],["Online / assigned devices",`${data.summary.online_devices} / ${data.summary.assigned_devices}`],
      ].map(([label,value]) => <section key={label} className="rounded-xl border bg-white p-5"><h2 className="text-sm text-slate-500">{label}</h2><p className="mt-3 text-3xl font-bold text-teal-800">{value}</p></section>)}</div>
      {patient && <section className="grid gap-4 rounded-xl border bg-white p-5 md:grid-cols-3"><div><h2 className="font-semibold">Patient profile</h2><p>{patient.department || "Diagnosis unavailable"}</p><p>{patient.assignedDoctorName || "No assigned clinician"}</p></div><div><h2 className="font-semibold">Active published prescription</h2>{data.plan ? <><p>Version {data.plan.version} · {data.plan.items.length} exercises</p><p>{data.plan.doctorName} · {data.plan.publishedAt ? new Date(data.plan.publishedAt).toLocaleString() : "Publication time unavailable"}</p><p>{data.plan.clinicalNotes || "No additional clinical notes"}</p></> : <p>No published plan.</p>}</div><div><h2 className="font-semibold">Assigned device</h2>{device ? <><p>{device.serialNumber} · {device.status}</p><p>Battery: {device.batteryPercent===null ? "Unavailable" : `${device.batteryPercent}%`}</p><p>Last seen: {device.lastSeenAt ? new Date(device.lastSeenAt).toLocaleString() : "Never seen"}</p></> : <p>No assigned device.</p>}</div></section>}
      <ClinicalSessionTable page={data.sessions} number={page} onPage={setPage}/>
      <section className="space-y-4"><h2 className="text-xl font-semibold">Measured longitudinal trends</h2><p className="text-sm text-slate-600">Daily mean of saved maximum flexion for completed sessions with a referenced prescription, hardware telemetry, and usable quality. Change compares the first and last measured UTC dates for the same patient and exercise. Adherence: unavailable. {data.summary.adherence_reason}</p>
        {!data.summary.trends.length && <p>No completed sessions in this period.</p>}
        <div className="grid gap-4 lg:grid-cols-2">{data.summary.trends.map(group => <article key={`${group.patient_id}-${group.exercise_id}-${group.exercise_name}`} className="space-y-3 rounded-xl border bg-white p-5"><h3 className="font-semibold">{group.patient_name} · {group.exercise_name}</h3><p>{group.completed_sessions} completed sessions · flexion change: {group.flexion_change_deg===null ? "Insufficient measured dates" : `${group.flexion_change_deg>0 ? "+" : ""}${group.flexion_change_deg}°`}</p>{group.daily.length ? <table className="w-full text-left text-sm"><thead><tr><th>UTC date</th><th>Mean max flexion</th><th>Measured sessions</th></tr></thead><tbody>{group.daily.map(day => <tr key={day.date}><td>{day.date}</td><td>{day.mean_max_flexion_deg}°</td><td>{day.measured_sessions}</td></tr>)}</tbody></table> : <p>No usable measured flexion data.</p>}<Link href={`/reports/session/${group.latest_session_id}`} className="inline-block text-teal-700 underline">Print latest saved session</Link></article>)}</div>
      </section>
    </>}
  </div></AppShell>;
}
