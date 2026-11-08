"use client";
import * as React from "react";
import Link from "next/link";
import { AppShell } from "@/components/ui/AppShell";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { patientProfileApi } from "@/lib/services/api";
import type { ApiUser } from "@/lib/services/auth-contract";
import { useAuth } from "@/components/auth/AuthProvider";
export default function PatientProfilePage() {
  const {refresh}=useAuth();
  const [profile,setProfile]=React.useState<ApiUser | null>(null);
  const [name,setName]=React.useState("");
  const [contact,setContact]=React.useState("");
  const [phone,setPhone]=React.useState("");
  const [haptic,setHaptic]=React.useState(false);
  const [busy,setBusy]=React.useState(false);
  const [error,setError]=React.useState("");
  const [notice,setNotice]=React.useState("");
  React.useEffect(() => {
    let active=true;
    patientProfileApi.get().then(p => {if(!active) return;setProfile(p);setName(p.full_name);setContact(p.patient_profile?.emergency_contact_name ?? "");setPhone(p.patient_profile?.emergency_contact_phone ?? "");setHaptic(p.patient_profile?.haptic_alerts_enabled ?? false);}).catch(() => {if(active) setError("Unable to load your profile. Reload to retry.");});
    return () => {active=false;};
  },[]);
  const save=async (event:React.FormEvent) => {
    event.preventDefault();setBusy(true);setError("");setNotice("");
    try {
      const saved=await patientProfileApi.update({full_name:name,...(profile?.patient_profile ? {emergency_contact_name:contact,emergency_contact_phone:phone,haptic_alerts_enabled:haptic} : {})});
      setProfile(saved);setName(saved.full_name);setNotice("Your profile has been saved.");await refresh();
    } catch(e) {setError(e instanceof Error ? e.message : "Changes were not saved. Retry.");}
    finally {setBusy(false);}
  };
  return <AppShell><div className="max-w-3xl space-y-5"><Link href="/patient/dashboard" className="text-teal-700 underline">Back to dashboard</Link><h1 className="text-2xl font-bold">Your profile</h1>
    {error && <p role="alert" className="rounded bg-red-50 p-4 text-red-800">{error}</p>}{notice && <p role="status" className="rounded bg-emerald-50 p-4 text-emerald-800">{notice}</p>}
    {!profile ? <p>Loading profile...</p> : <><p>Account: {profile.email}</p><p>Clinician: {profile.assigned_doctor?.fullName || "Not assigned"}</p><form onSubmit={save} className="space-y-4 rounded-xl border bg-white p-6"><Input label="Full name" required value={name} onChange={e => setName(e.target.value)} />
      {profile.patient_profile ? <><Input label="Emergency contact name" value={contact} onChange={e => setContact(e.target.value)} /><Input label="Emergency contact phone" type="tel" value={phone} onChange={e => setPhone(e.target.value)} /><label className="flex gap-3"><input type="checkbox" checked={haptic} onChange={e => setHaptic(e.target.checked)} />Prefer vibration alerts</label><p className="text-sm text-slate-600">This saves your preference. Device activation is not confirmed here.</p></> : <p>Your clinician has not created a clinical profile yet. You can still update your name.</p>}
      <Button type="submit" disabled={busy} loading={busy}>Save profile</Button>
    </form><section className="space-y-2 rounded-xl border bg-white p-6"><h2 className="text-xl font-bold">Clinical information</h2>{profile.patient_profile ? <><p>Diagnosis: {profile.patient_profile.diagnosis || "Not recorded"}</p><p>Protocol: {profile.patient_profile.surgical_protocol || "Not recorded"}</p><p>Surgery date: {profile.patient_profile.surgery_date || "Not recorded"}</p><p>Recovery week: {profile.patient_profile.recovery_week}</p><p>Your clinician manages your diagnosis and prescribed limits.</p></> : <p>No clinical information recorded.</p>}</section></>}
  </div></AppShell>;
}
