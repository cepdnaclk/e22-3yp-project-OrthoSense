"use client";
import * as React from "react";
import { patientProfileApi, plansApi, sessionsApi, devicesApi, exercisesApi } from "@/lib/services/api";
import { ApiError } from "@/lib/services/api-client";
export function usePatientData() {
  const [data,setData] = React.useState<Awaited<ReturnType<typeof load>> | null>(null);
  const [error,setError] = React.useState("");
  React.useEffect(() => {
    let active = true;
    const refresh=() => load().then(value => {if(active) {setData(value);setError("");}}).catch(() => {if(active) setError("Unable to load your information. Check your connection and reload.");});
    void refresh();
    const timer=setInterval(() => void refresh(),30000);
    window.addEventListener("focus",refresh);
    return () => {active=false;clearInterval(timer);window.removeEventListener("focus",refresh);};
  },[]);
  return {data,error};
}
async function load() {
  const [profile,plan,sessions,devices,catalog] = await Promise.all([
    patientProfileApi.get(), plansApi.getMyPlan().catch(error => {if(error instanceof ApiError && error.status === 404) return null; throw error;}),
    sessionsApi.getAll(),devicesApi.getAll(),exercisesApi.getAll(),
  ]);
  const device = devices.find(value => value.id === profile.assigned_device?.id) ?? null;
  return {profile,plan,sessions,device,catalog,loadedAt:Date.now()};
}
