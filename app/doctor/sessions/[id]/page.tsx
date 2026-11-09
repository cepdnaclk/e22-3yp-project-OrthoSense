"use client";
import * as React from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { AppShell } from "@/components/ui/AppShell";
import { Button } from "@/components/ui/Button";
import { SessionFacts } from "@/components/features/SessionFacts";
import { TelemetryChart } from "@/components/features/TelemetryChart";
import { clinicalError,useClinicalResource } from "@/components/features/useClinicalResource";
import { sessionsApi } from "@/lib/services/api";
import { telemetryCSV } from "@/lib/clinical-telemetry";
import type { ExerciseSession,TelemetryPoint } from "@/lib/types";
export default function SessionTelemetryViewer() {
  const {id}=useParams<{id:string}>();
  const [maxPoints,setMaxPoints]=React.useState(500);
  const loader=React.useCallback(async () => {const [session,telemetry]=await Promise.all([sessionsApi.getById(id),sessionsApi.getTelemetry(id,maxPoints)]);return {session,telemetry};},[id,maxPoints]);
  const {data,error,loading,refresh}=useClinicalResource(loader);
  const [saved,setSaved]=React.useState<ExerciseSession|null>(null);
  const session=saved?.id===id ? saved : data?.session;
  return <AppShell><div className="space-y-6"><header className="flex flex-wrap justify-between gap-3"><div><Link className="text-teal-700 underline" href="/doctor/dashboard">Back to dashboard</Link><h1 className="mt-3 text-2xl font-bold">Session inspection</h1></div><div className="flex flex-wrap gap-3"><Button variant="outline" onClick={() => {setSaved(null);refresh();}}>Refresh</Button>{session && <Link className="rounded bg-teal-700 px-4 py-2 text-white" href={`/reports/session/${session.id}`}>Printable session report</Link>}</div></header>
    {loading && <p role="status">Loading saved session and telemetry...</p>}{error && <p role="alert" className="text-red-700">{error}</p>}
    {session && !loading && !error && <><SessionFacts session={session}/>{data && <>
      <div className="flex flex-wrap items-center gap-3"><Button variant="outline" disabled={!data.telemetry.length} onClick={() => download(data.telemetry,session)}>Export downsampled CSV</Button><label>Maximum displayed points <select className="rounded border p-2" value={maxPoints} onChange={e => setMaxPoints(Number(e.target.value))}>{[100,500,1000,5000].map(n => <option key={n} value={n}>{n}</option>)}</select></label></div>
      <p className="text-sm text-slate-600">This view retains global channel extrema and summarizes omitted quality/provenance. It is not a full-data export; local extrema may be omitted.</p>
      <TelemetryChart points={data.telemetry}/></>}
      <ReviewEditor key={`${session.id}-${session.reviewHistory?.[0]?.id ?? "new"}`} session={session} onSaved={setSaved}/>
    </>}
  </div></AppShell>;
}
function download(points:TelemetryPoint[],session:ExerciseSession) {
  const url=URL.createObjectURL(new Blob([telemetryCSV(points,session.id,session.planVersion)],{type:"text/csv;charset=utf-8"}));
  const link=document.createElement("a");link.href=url;link.download=`orthosense_${session.id}_downsampled_telemetry.csv`;document.body.appendChild(link);link.click();link.remove();URL.revokeObjectURL(url);
}
function ReviewEditor({session,onSaved}:{session:ExerciseSession;onSaved:(session:ExerciseSession)=>void}) {
  const [notes,setNotes]=React.useState(session.reviewNotes ?? "");
  const [revision,setRevision]=React.useState(false);
  const [busy,setBusy]=React.useState(false);
  const [error,setError]=React.useState("");
  const gate=React.useRef(false);
  async function save() {
    if(gate.current) return;
    gate.current=true;setBusy(true);setError("");
    try {onSaved(await sessionsApi.review(session.id,notes,session.reviewHistory?.[0]?.id,revision));}
    catch(e) {setError(clinicalError(e));}
    finally {gate.current=false;setBusy(false);}
  }
  if(session.status!=="completed") return <p>Review is available after session completion.</p>;
  return <section className="space-y-3 rounded-xl border bg-white p-5"><h2 className="text-lg font-semibold">{session.doctorReviewed ? "Revise saved clinician review" : "Save clinician review"}</h2>{session.doctorReviewed && <><p>The saved review is shown above. A revision preserves earlier reviews.</p><label className="block"><input type="checkbox" checked={revision} onChange={e => setRevision(e.target.checked)}/> Save a new review revision</label></>}
    <label className="block">Clinical notes<textarea className="mt-2 block min-h-32 w-full rounded border p-3" value={notes} maxLength={20000} onChange={e => setNotes(e.target.value)}/></label>
    {error && <p role="alert" className="text-red-700">{error}</p>}
    <Button disabled={busy || !notes.trim() || notes===session.reviewNotes || (!!session.doctorReviewed && !revision)} onClick={() => void save()}>{busy ? "Saving..." : session.doctorReviewed ? "Save review revision" : "Save review"}</Button>
  </section>;
}
