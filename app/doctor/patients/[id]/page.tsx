"use client";
import { useParams } from "next/navigation";
import { ClinicalOverview } from "@/components/features/ClinicalOverview";
export default function PatientDetailPage() {const {id}=useParams<{id:string}>();return <ClinicalOverview patientId={id}/>;}
