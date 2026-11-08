"use client";
import Link from "next/link";
import { AppShell } from "@/components/ui/AppShell";
import { usePatientData } from "@/components/features/usePatientData";
export default function PatientExercises() {
  const {data,error}=usePatientData();
  if(!data) return <AppShell><p role={error ? "alert" : "status"}>{error || "Loading prescribed exercises..."}</p></AppShell>;
  const {plan,catalog}=data;
  return <AppShell><div className="max-w-4xl space-y-5"><Link href="/patient/dashboard" className="text-teal-700 underline">Back to dashboard</Link><h1 className="text-2xl font-bold">Your prescribed exercises</h1>
    {!plan ? <p>No published exercise plan yet. Contact your assigned clinician.</p> : <><p>Plan v{plan.version} ? {plan.doctorName} ? {plan.publishedAt ? new Date(plan.publishedAt).toLocaleDateString() : "Publication date unavailable"}</p><p>{plan.clinicalNotes}</p>
    {plan.items.map(item => {
      const media=catalog.find(x => x.id === item.exerciseId)?.videoUrl;
      const safeMedia=media && /^https?:\/\//i.test(media) ? media : null;
      return <section key={item.id} className="space-y-3 rounded-xl border bg-white p-6"><h2 className="text-xl font-bold">{item.exerciseName}</h2><p>{item.targetSets} sets ? {item.targetReps} repetitions ? rest {item.restIntervalSeconds} seconds</p><p>Prescribed extension: {item.targetExtensionDeg}? ? flexion: {item.targetFlexionDeg}?</p><p>{item.instructions || "No additional instructions."}</p>{safeMedia ? <video controls preload="none" src={safeMedia} className="w-full max-w-lg" /> : <p>No demonstration video available.</p>}<Link className="inline-block rounded bg-teal-700 px-4 py-3 text-white" href={`/patient/session/record?prescription=${encodeURIComponent(item.id)}&plan=${encodeURIComponent(plan.id)}`}>Open session recorder</Link></section>;
    })}</>}
  </div></AppShell>;
}
