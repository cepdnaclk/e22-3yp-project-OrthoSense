"use client";
import Link from "next/link";
import { AppShell } from "@/components/ui/AppShell";
import { usePatientData } from "@/components/features/usePatientData";
export default function PatientDashboard() {
  const {data,error}=usePatientData();
  if(!data) return <AppShell><p role={error ? "alert" : "status"}>{error || "Loading your dashboard..."}</p>{error && <button onClick={() => location.reload()}>Retry</button>}</AppShell>;
  const {profile,plan,sessions,device}=data;
  const completed=sessions.filter(x => x.status === "completed");
  const recent=completed.filter(x => Date.parse(x.startedAt) >= data.loadedAt-7*86400000);
  const reviewed=completed.filter(x => x.doctorReviewed).sort((a,b) => Date.parse(b.doctorReviewedAt || b.startedAt)-Date.parse(a.doctorReviewedAt || a.startedAt))[0];
  return <AppShell><div className="space-y-6">
    <header className="relative overflow-hidden rounded-2xl bg-slate-900 p-8 text-white">
      <img src="/images/smart-knee-brace.jpg" alt="Knee brace" className="absolute inset-0 h-full w-full object-cover" />
      <div className="absolute inset-0 bg-black/50" />
      <div className="relative space-y-2"><h1 className="text-3xl font-bold">Welcome, {profile.full_name || profile.email}</h1><p>Your exercises, progress and care team in one place.</p>{profile.patient_profile && <p>Recovery week {profile.patient_profile.recovery_week}</p>}</div>
    </header>
    <div className="grid gap-5 md:grid-cols-2">
      <section className="space-y-4 rounded-xl border bg-white p-6"><h2 className="text-xl font-bold">Your prescribed exercises</h2>
        {plan ? <><p>Plan v{plan.version} ? {plan.items.length} exercises</p><ul className="space-y-2">{plan.items.map(item => <li key={item.id}>{item.exerciseName}: {item.targetSets} sets of {item.targetReps}</li>)}</ul><Link href="/patient/exercises" className="inline-block rounded-lg bg-teal-700 px-5 py-3 font-semibold text-white">View exercises and start</Link></> : <p>No published plan yet. Your clinician will add your exercises.</p>}
      </section>
      <section className="space-y-4 rounded-xl border bg-white p-6"><h2 className="text-xl font-bold">Your progress</h2><p className="text-3xl font-bold">{recent.length} sessions</p><p>Completed in the last 7 days ? {completed.length} completed overall.</p>{completed.length ? <ul>{completed.slice(0,3).map(x => <li key={x.id}>{new Date(x.startedAt).toLocaleDateString()}: {x.exerciseName} ? {x.patientReportedReps} reported repetitions</li>)}</ul> : <p>No completed sessions yet.</p>}<Link href="/patient/sessions" className="text-teal-700 underline">View session history</Link></section>
      <section className="space-y-4 rounded-xl border bg-white p-6"><h2 className="text-xl font-bold">Your knee brace</h2>{device ? <><p>{device.serialNumber}</p><p>Connection: {device.status}</p><p>Last contact: {device.lastSeenAt ? new Date(device.lastSeenAt).toLocaleString() : "Not recorded"}</p><p>Last reported battery: {device.batteryPercent === null ? "Unavailable" : `${device.batteryPercent}%`}</p></> : <p>No knee brace assigned yet.</p>}<Link href="/patient/device" className="text-teal-700 underline">Check device details</Link></section>
      <section className="space-y-4 rounded-xl border bg-white p-6"><h2 className="text-xl font-bold">Your care team</h2><p>{profile.assigned_doctor?.fullName || "No clinician assigned yet."}</p><p>{plan?.clinicalNotes || "No published instructions yet."}</p>{reviewed?.reviewNotes && <p>Latest review: {reviewed.reviewNotes}</p>}<Link href="/patient/profile" className="text-teal-700 underline">View your profile</Link></section>
    </div>
  </div></AppShell>;
}
