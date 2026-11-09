"use client";
import * as React from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { sessionsApi } from "@/lib/services/api";
import { useClinicalResource } from "@/components/features/useClinicalResource";
import { SessionFacts } from "@/components/features/SessionFacts";
import { Button } from "@/components/ui/Button";
export default function PrintableReportPage() {
  const {id}=useParams<{id:string}>();
  const loader=React.useCallback(() => sessionsApi.getById(id),[id]);
  const {data:session,error,loading,refresh}=useClinicalResource(loader);
  return <main className="min-h-screen bg-slate-100 p-4 text-slate-900 print:bg-white print:p-0"><div className="mx-auto max-w-5xl space-y-6">
    <nav className="flex flex-wrap items-center justify-between gap-3 print:hidden"><Link href="/" className="text-teal-700 underline">Return to portal</Link><div className="flex gap-3"><Button variant="outline" onClick={refresh}>Reload report</Button><Button disabled={!session} onClick={() => window.print()}>Print / save PDF</Button></div></nav>
    {loading && <p role="status">Loading session report...</p>}{error && <div role="alert" className="rounded border bg-white p-6"><h1 className="text-xl font-semibold">Report unavailable</h1><p>{error}</p></div>}
    {session && <article className="space-y-6 rounded-xl border bg-white p-5 sm:p-8 print:border-0 print:p-0"><header className="border-b-2 pb-5"><h1 className="text-2xl font-bold">OrthoSense session report</h1><p className="mt-2">{session.doctorReviewed ? "Reviewed" : "Pending clinician review"} · {session.status} session</p><p className="mt-2 break-all text-sm">Record {session.id}</p></header><SessionFacts session={session}/></article>}
  </div></main>;
}
