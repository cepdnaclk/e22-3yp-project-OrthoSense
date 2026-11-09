import type { ExerciseSession } from "@/lib/types";
import { sessionComparisons } from "@/lib/clinical-telemetry";
export function SessionFacts({session:s}:{session:ExerciseSession}) {
  const latest=s.reviewHistory?.[0];
  return <div className="space-y-6">
    <dl className="grid gap-4 rounded-xl border bg-white p-5 text-sm sm:grid-cols-2 lg:grid-cols-3">{[
      ["Patient",`${s.patientName} (${s.patientId})`],["Exercise",s.exerciseName],["Session",s.id],
      ["Status / quality",`${s.status} / ${s.qualityFlag}`],["Started",new Date(s.startedAt).toLocaleString()],
      ["Ended",s.endedAt ? new Date(s.endedAt).toLocaleString() : "Not ended"],["Measured duration",`${s.durationSeconds} seconds`],
      ["Referenced prescription",s.planId ? `Version ${s.planVersion ?? "unavailable"} (${s.planId})` : "Unavailable"],
      ["Prescription author",s.planAuthorName ?? "Unavailable"],["Review status",s.doctorReviewed ? "Reviewed" : "Pending review"],
      ["Review author",s.doctorReviewed && latest ? latest.doctor_name : "Unavailable"],["Review timestamp",s.doctorReviewed && latest ? new Date(latest.reviewed_at).toLocaleString() : "Unavailable"],
    ].map(([label,value]) => <div key={label} className="break-words"><dt className="font-medium text-slate-500">{label}</dt><dd className="mt-1">{value}</dd></div>)}</dl>
    <div className="overflow-x-auto"><table className="w-full border bg-white text-left text-sm"><caption className="p-3 text-left font-semibold">Saved outcomes against the session’s referenced prescription</caption><thead className="bg-slate-50"><tr>{["Metric","Stored target","Saved value","Comparison"].map(s => <th key={s} className="p-3">{s}</th>)}</tr></thead><tbody>{sessionComparisons(s).map(row => <tr key={row.label} className="border-t"><th scope="row" className="p-3">{row.label}</th><td className="p-3">{row.target}</td><td className="p-3">{row.value}</td><td className="p-3">{row.comparison}</td></tr>)}</tbody></table></div>
    <section className="space-y-2 rounded-xl border bg-white p-5"><h2 className="font-semibold">Prescription instructions</h2>{s.prescribedItem ? <><p>{s.prescribedItem.target_sets} sets × {s.prescribedItem.target_repetitions} repetitions · rest {s.prescribedItem.rest_interval_seconds} seconds</p><p className="whitespace-pre-wrap">{s.prescribedItem.notes || "No additional instructions stored."}</p></> : <p>Referenced prescription details unavailable.</p>}</section>
    <section className="space-y-3 rounded-xl border bg-white p-5"><h2 className="font-semibold">Clinician review history</h2>{s.reviewHistory?.length ? s.reviewHistory.map(review => <article key={review.id} className="break-inside-avoid border-t pt-3"><p className="text-sm font-medium">{review.doctor_name} · {new Date(review.reviewed_at).toLocaleString()}</p><p className="mt-2 whitespace-pre-wrap">{review.content}</p></article>) : <p>{s.doctorReviewed ? "Review metadata unavailable for this record." : "Pending clinician review. No review has been saved."}</p>}</section>
    <p className="text-xs text-slate-500">Missing sensor estimates are unavailable. Reported repetitions are separate from sensor estimates. Numerical target comparisons do not imply clinical approval.</p>
  </div>;
}
