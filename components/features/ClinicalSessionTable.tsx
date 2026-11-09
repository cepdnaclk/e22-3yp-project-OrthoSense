"use client";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import type { PaginatedResponse } from "@/lib/services/api";
import type { ExerciseSession } from "@/lib/types";
export function ClinicalSessionTable({page,number,onPage}:{page:PaginatedResponse<ExerciseSession>;number:number;onPage:(page:number)=>void}) {
  return <section className="space-y-3"><div className="overflow-x-auto rounded-xl border bg-white"><table className="w-full text-left text-sm"><caption className="p-4 text-left font-semibold">Saved sessions · {page.count} matching records</caption>
    <thead className="bg-slate-50"><tr>{["Started","Patient / exercise","Status / quality","Reported / sensor reps","Maximum flexion","Review","Open"].map(label => <th key={label} className="p-3">{label}</th>)}</tr></thead>
    <tbody>{page.results.map(s => <tr key={s.id} className="border-t"><td className="p-3">{new Date(s.startedAt).toLocaleString()}</td><td className="p-3">{s.patientName}<br/>{s.exerciseName}</td><td className="p-3">{s.status}<br/>{s.qualityFlag}</td><td className="p-3">{s.patientReportedReps ?? "Unavailable"} / {s.sensorEstimatedReps ?? "Unavailable"}</td><td className="p-3">{s.maxFlexionDeg === null ? "Unavailable" : `${s.maxFlexionDeg}°`}</td><td className="p-3">{s.doctorReviewed ? "Reviewed" : s.status==="completed" ? "Pending" : "Not completed"}</td><td className="space-y-2 p-3"><Link className="block text-teal-700 underline" href={`/doctor/sessions/${s.id}`}>Inspect session</Link><Link className="block text-teal-700 underline" href={`/reports/session/${s.id}`}>Print report</Link></td></tr>)}</tbody>
  </table>{!page.results.length && <p className="p-4">No sessions match this filter.</p>}</div>
  <div className="flex items-center gap-3"><Button variant="outline" disabled={!page.previous} onClick={() => onPage(number-1)}>Previous</Button><span>Page {number}</span><Button variant="outline" disabled={!page.next} onClick={() => onPage(number+1)}>Next</Button></div></section>;
}
