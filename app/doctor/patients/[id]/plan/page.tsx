"use client";
import * as React from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { AppShell } from "@/components/ui/AppShell";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { plansApi, patientsApi, exercisesApi } from "@/lib/services/api";
import type { ExercisePlan, ExercisePlanItem, ExerciseDefinition, User } from "@/lib/types";
import type { PlanDto } from "@/lib/services/api-contract";

function fromDto(p: PlanDto): ExercisePlan {
  return { id: p.id, patientId: p.patient, patientName: p.patient_name, doctorId: p.authored_by,
    doctorName: p.doctor_name, version: p.version_number, state: ({DRAFT:"Draft",PUBLISHED:"Published",ARCHIVED:"Archived"} as const)[p.status],
    schedule:p.schedule ?? [], createdAt: p.created_at, publishedAt: p.published_at ?? undefined, clinicalNotes: p.clinical_notes,
    items: p.prescriptions.map(rx => ({id:rx.id,exerciseId:rx.exercise.id,exerciseName:rx.exercise.name,targetReps:rx.target_repetitions,
      targetSets:rx.target_sets,targetFlexionDeg:rx.target_flexion_deg,targetExtensionDeg:rx.target_extension_deg,
      restIntervalSeconds:rx.rest_interval_seconds,instructions:rx.notes})) };
}

export default function PlanEditorPage() {
  const patientId = String(useParams().id);
  const [patient,setPatient] = React.useState<User | null>(null);
  const [catalog,setCatalog] = React.useState<ExerciseDefinition[]>([]);
  const [history,setHistory] = React.useState<ExercisePlan[]>([]);
  const [plan,setPlan] = React.useState<ExercisePlan | null>(null);
  const [items,setItems] = React.useState<ExercisePlanItem[]>([]);
  const [schedule,setSchedule] = React.useState<import("@/lib/types").ExerciseReminder[]>([]);
  const [notes,setNotes] = React.useState("");
  const [dirty,setDirty] = React.useState(false);
  const [loading,setLoading] = React.useState(true);
  const [busy,setBusy] = React.useState(false);
  const [error,setError] = React.useState("");
  const [notice,setNotice] = React.useState("");
  const locked = !!plan && plan.state !== "Draft";
  const adopt = (value: ExercisePlan | null) => { setSchedule(value?.schedule ?? []);setPlan(value); setItems(value?.items ?? []); setNotes(value?.clinicalNotes ?? ""); setDirty(false); };
  React.useEffect(() => {
    let active = true;
    Promise.all([patientsApi.getById(patientId),exercisesApi.getAll(),plansApi.getAll(patientId)]).then(([p,c,h]) => {
      if (!active) return;
      setPatient(p); setCatalog(c); setHistory(h);
      const chosen = h.find(x => x.state === "Draft") ?? h.find(x => x.state === "Published") ?? null;
      setSchedule(chosen?.schedule ?? []);setPlan(chosen); setItems(chosen?.items ?? []); setNotes(chosen?.clinicalNotes ?? ""); setLoading(false);
    }).catch(() => { if(active) { setError("Unable to load this patient's plans. Reload to retry."); setLoading(false); } });
    return () => { active = false; };
  },[patientId]);
  React.useEffect(() => {
    const warn = (event: BeforeUnloadEvent) => { if(dirty) { event.preventDefault(); event.returnValue = ""; } };
    window.addEventListener("beforeunload",warn);
    return () => window.removeEventListener("beforeunload",warn);
  },[dirty]);
  const update = (id:string,key:keyof ExercisePlanItem,value:string | number) => { setItems(items.map(x => x.id === id ? {...x,[key]:value} : x)); setDirty(true); setNotice(""); };
  const persist = async () => {
    const body = { schedule:schedule.filter(entry => items.some(item => item.exerciseId===entry.exercise_id)),clinical_notes:notes,items:items.map((x,order) => ({exercise_id:x.exerciseId,target_repetitions:x.targetReps,target_sets:x.targetSets,
      target_flexion_deg:x.targetFlexionDeg,target_extension_deg:x.targetExtensionDeg,rest_interval_seconds:x.restIntervalSeconds,notes:x.instructions,order})) };
    const saved = fromDto(plan ? await plansApi.update(plan.id,body) : await plansApi.create({patient:patientId,...body}));
    adopt(saved); setHistory(h => [saved,...h.filter(x => x.id !== saved.id)]); return saved;
  };
  const save = async (publish:boolean) => {
    setBusy(true);setError("");setNotice("");
    try {
      const saved = await persist();
      if(publish) {
        const published = fromDto(await plansApi.publish(saved.id)); adopt(published);
        setHistory(await plansApi.getAll(patientId)); setNotice(`Plan v${published.version} published.`);
      } else setNotice(`Draft v${saved.version} saved.`);
    } catch(e) { setError(e instanceof Error ? e.message : "Plan was not saved. Retry."); }
    finally { setBusy(false); }
  };
  if(loading) return <AppShell><p role="status">Loading prescription...</p></AppShell>;
  return <AppShell><div className="max-w-5xl space-y-5">
    <Link href={`/doctor/patients/${patientId}`} onClick={e => {if(dirty && !confirm("Leave without saving your edits?")) e.preventDefault();}} className="text-teal-700 underline">Back to patient</Link>
    <h1 className="text-2xl font-bold">Exercise prescription: {patient?.fullName ?? "Unavailable"}</h1>
    {error && <p role="alert" className="rounded-lg bg-red-50 p-4 text-red-800">{error}</p>}
    {notice && <p role="status" className="rounded-lg bg-emerald-50 p-4 text-emerald-800">{notice}</p>}
    {patient && <>
    <p>{plan ? `Version ${plan.version} ? ${plan.state}` : "New draft"}{dirty ? " ? Unsaved changes" : ""}</p>
    <div className="flex flex-wrap gap-3">
      {locked ? <Button disabled={busy} onClick={() => {setPlan(null);setDirty(true);setNotice("Revision started. Save to allocate a new version; the published plan stays active.");}}>Create revised draft</Button> : <>
      <Button disabled={busy} loading={busy} onClick={() => void save(false)}>Save draft</Button>
      <Button disabled={busy || items.length === 0} onClick={() => void save(true)}>Save and publish</Button></>}
    </div>
    <fieldset disabled={locked || busy} className="space-y-5 disabled:opacity-70">
      <label className="block font-semibold">Clinical notes<textarea value={notes} onChange={e => {setNotes(e.target.value);setDirty(true);setNotice("");}} className="mt-2 block w-full rounded-lg border p-3" /></label>
      <label className="block">Add prescribed exercise<select defaultValue="" className="ml-3 rounded border p-2" onChange={e => {
        const ex = catalog.find(x => x.id === e.target.value); if(!ex) return;
        setItems([...items,{id:crypto.randomUUID(),exerciseId:ex.id,exerciseName:ex.name,targetReps:ex.defaultRepetitions,targetSets:ex.defaultSets ?? 1,
          targetFlexionDeg:ex.targetAngleMaxDeg,targetExtensionDeg:ex.targetAngleMinDeg,restIntervalSeconds:ex.restIntervalSeconds,instructions:ex.description}]);setDirty(true);e.target.value="";
      }}><option value="">Select exercise</option>{catalog.map(x => <option key={x.id} value={x.id}>{x.name}</option>)}</select></label>
      {!catalog.length && <p>No exercise definitions available. Add an exercise to the catalog first.</p>}
      {items.map((item,index) => <div key={item.id} className="space-y-3 rounded-xl border bg-white p-4">
        <div className="flex justify-between"><h2 className="font-bold">{index+1}. {item.exerciseName}</h2><button type="button" onClick={() => {setItems(items.filter(x => x.id !== item.id));setDirty(true);}}>Remove</button></div>
        <div className="grid grid-cols-2 gap-3 md:grid-cols-5">{([
          ["targetSets","Sets"],["targetReps","Repetitions"],["targetFlexionDeg","Flexion (degrees)"],["targetExtensionDeg","Extension (degrees)"],["restIntervalSeconds","Rest (seconds)"]
        ] as const).map(([key,label]) => <Input key={key} label={label} type="number" step={key.includes("Deg") ? "any" : "1"} value={item[key]} onChange={e => update(item.id,key,Number(e.target.value))} />)}</div>
        <label className="block">Instructions<textarea className="mt-1 block w-full rounded border p-2" value={item.instructions} onChange={e => update(item.id,"instructions",e.target.value)} /></label>
        <button type="button" disabled={index === 0} onClick={() => {const next=[...items];[next[index-1],next[index]]=[next[index],next[index-1]];setItems(next);setDirty(true);}}>Move up</button>
      </div>)}
      <section className="space-y-3 rounded-xl border bg-white p-4"><h2 className="font-bold">Calendar reminders</h2><p className="text-sm text-slate-600">Choose a date and time in your browser&apos;s local timezone for a prescribed exercise. Reminders appear after publishing.</p>
      {items.map(item => <label key={item.id} className="block">{item.exerciseName}<input className="ml-3 rounded border p-2" type="datetime-local" onChange={event => {
        if(event.target.value) {setSchedule([...schedule,{exercise_id:item.exerciseId,scheduled_at:new Date(event.target.value).toISOString()}]);setDirty(true);event.target.value="";}
      }} /></label>)}
      <ul>{schedule.map((entry,index) => <li key={index}>{items.find(item => item.exerciseId===entry.exercise_id)?.exerciseName || "Removed exercise"} ? {new Date(entry.scheduled_at).toLocaleString()} <button type="button" onClick={() => {setSchedule(schedule.filter((_,i) => i!==index));setDirty(true);}}>Remove reminder</button></li>)}</ul></section>
    </fieldset>
    <section className="space-y-2"><h2 className="text-lg font-bold">Saved versions</h2>{history.map(x => <button key={x.id} className="mr-3 rounded border px-3 py-2" disabled={busy} onClick={() => {if(!dirty || confirm("Discard unsaved edits and open this version?")) adopt(x);}}>v{x.version} ? {x.state}</button>)}</section>
    </>}
  </div></AppShell>;
}
