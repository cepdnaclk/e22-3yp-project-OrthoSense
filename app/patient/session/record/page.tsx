"use client";
import * as React from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { AppShell } from "@/components/ui/AppShell";
import { Button } from "@/components/ui/Button";
import { usePatientData } from "@/components/features/usePatientData";
import { sessionsApi } from "@/lib/services/api";
import type { SessionDto } from "@/lib/services/api-contract";
import type { TelemetryPoint } from "@/lib/types";

export default function RecordSessionPage() {
  return <React.Suspense fallback={<p>Loading recorder?</p>}><Recorder /></React.Suspense>;
}
function Recorder() {
  const params=useSearchParams();
  const {data,error:loadError} = usePatientData();
  const [prescription,setPrescription] = React.useState("");
  const [session,setSession] = React.useState<SessionDto | null>(null);
  const [points,setPoints] = React.useState<TelemetryPoint[]>([]);
  const [error,setError] = React.useState("");
  const [busy,setBusy] = React.useState(false);
  const [reps,setReps] = React.useState("");
  const [connected,setConnected] = React.useState(false);
  const [sampleAt,setSampleAt] = React.useState(0);
  const [now,setNow] = React.useState(0);
  const gate = React.useRef(false);
  const requestId = React.useRef("");
  const lastSample = React.useRef<number | null>(null);
  React.useEffect(() => {
    const saved = sessionStorage.getItem("orthosense-recording");
    if (saved) {requestId.current=saved; void sessionsApi.current(saved).then(setSession).catch(() => setError("Could not restore your recording. Retry before starting another session."));}
  },[]);
  const sessionId=session?.id;
  const sessionStatus=session?.status;
  React.useEffect(() => {
    if (!sessionId || sessionStatus !== "in_progress") return;
    let active=true;
    const refresh=async () => {
      try {
        const [saved,samples] = await Promise.all([sessionsApi.current(sessionId),sessionsApi.getTelemetry(sessionId)]);
        if (!active || gate.current) return;
        setSession(saved);setPoints(samples);setConnected(true);
        const timestamp=samples.at(-1)?.timestampMs ?? null;
        if (timestamp !== null && timestamp !== lastSample.current) {lastSample.current=timestamp;setSampleAt(Date.parse(samples.at(-1)?.serverReceivedAt ?? "") || 0);}
        setNow(Date.now());
      } catch {if(active) {setConnected(false);setNow(Date.now());}}
    };
    void refresh();const timer=setInterval(() => void refresh(),2000);
    return () => {active=false;clearInterval(timer);};
  },[sessionId,sessionStatus]);
  const item=data?.plan?.items.find(value => value.id===(prescription || params.get("prescription")));
  const ready=!!item && data?.device?.status==="online" && data.device.sensorHealth.imuThigh==="healthy" && data.device.sensorHealth.imuShank==="healthy";
  async function act(operation: "start" | "pause" | "resume" | "finish" | "abandon") {
    if (gate.current) return;
    gate.current=true;setBusy(true);setError("");
    try {
      if(operation === "start") {
        if(!item) throw new Error("Select a published prescription first.");
        requestId.current ||= crypto.randomUUID();
        sessionStorage.setItem("orthosense-recording",requestId.current);
        setSession(await sessionsApi.start(item.id,requestId.current));
      } else if(session) {
        if(operation === "finish" && (!/^\d+$/.test(reps) || Number(reps)>10000)) throw new Error("Enter your completed repetitions (0?10000).");
        const saved=await sessionsApi.transition(session.id,operation,operation==="finish" ? Number(reps) : undefined);
        setSession(saved);
        if(saved.status!=="in_progress") sessionStorage.removeItem("orthosense-recording");
      }
    } catch(e) {setError(e instanceof Error ? e.message : "The request failed. Your session is retained; retry.");}
    finally {gate.current=false;setBusy(false);}
  }
  const latest=points.at(-1);
  const fresh=connected && sampleAt>0 && now-sampleAt<10000;
  const angle=fresh && latest?.source==="hardware" && latest?.channelHealth.angle==="READ_OK" ? latest.kneeAngleDeg : null;
  return <AppShell><main className="mx-auto max-w-3xl space-y-5 rounded-xl border bg-white p-6">
    <Link href="/patient/exercises" className="text-teal-700 underline">Back to prescribed exercises</Link>
    <h1 className="text-2xl font-bold">Session recorder</h1>
    {(error || loadError) && <p role="alert" className="text-red-700">{error || loadError}</p>}
    {!data && !loadError && <p>Loading prescription and assigned device?</p>}
    {!session ? <>
      <label className="block">Published exercise <select className="block w-full rounded border p-2" value={prescription || params.get("prescription") || ""} onChange={e => setPrescription(e.target.value)}>
        <option value="">Select an exercise</option>{data?.plan?.items.map(i => <option key={i.id} value={i.id}>{i.exerciseName}</option>)}
      </select></label>
      {item && <p>{item.targetSets} sets ? {item.targetReps} repetitions. Extension {item.targetExtensionDeg}?; flexion {item.targetFlexionDeg}?. {item.instructions}</p>}
      <p>Assigned device: {data?.device?.serialNumber ?? "None"}. Status: {data?.device?.status ?? "unknown"}.</p>
      {!ready && <p>A published prescription and fresh, healthy dual IMUs are required to start.</p>}
      <Button disabled={!ready || busy} onClick={() => void act("start")}>Start recording</Button>
    </> : <>
      <h2 className="text-xl font-semibold">{session.exercise_name}</h2>
      <p className="break-all">Session: {session.id} ? plan version {session.plan_version_number ?? "unavailable"}</p>
      <p>Status: {session.status}{session.paused_at ? " (paused)" : ""}. Target: {session.target_reps} repetitions.</p>
      {session.status==="in_progress" ? <>
        <p role="status">{!connected ? "Backend connection unavailable" : fresh ? "Receiving samples" : "No fresh samples ? check the device and gateway"}</p>
        <p>Latest knee angle: {angle === null || angle === undefined ? "Unavailable" : `${angle}?`}</p>
        <p>Sensor repetitions are calculated on completion from valid hardware angles. Unsupported or simulated angles remain unavailable.</p>
        <label className="block">Your completed repetitions <input className="ml-2 rounded border p-2" type="number" min="0" max="10000" value={reps} onChange={e => setReps(e.target.value)} /></label>
        <div className="flex flex-wrap gap-3">
          <Button disabled={busy} onClick={() => void act(session.paused_at ? "resume" : "pause")}>{session.paused_at ? "Resume" : "Pause"}</Button>
          <Button disabled={busy} onClick={() => void act("finish")}>Save and finish</Button>
          <Button disabled={busy} variant="outline" onClick={() => {if(confirm("Abandon this session? Partial samples will be retained.")) void act("abandon");}}>Abandon</Button>
        </div><p>Before finishing, stop acquisition and confirm the gateway has acknowledged all queued samples. Paused or closed sessions reject new batches.</p>
      </> : <div role="status">
        <p>Session {session.status} and saved by the server.</p>
        <p>Manual reps: {session.patient_reported_reps ?? "Unavailable"}. Sensor estimate: {session.sensor_estimated_reps ?? "Unavailable"}.</p>
        <p>Measured duration: {session.duration_seconds}s. Maximum flexion: {session.max_flexion_deg ?? "Unavailable"}. Quality: {session.quality_flag}.</p>
        <Link href="/patient/sessions" className="underline">View saved history</Link>
      </div>}
    </>}
  </main></AppShell>;
}
