"use client";
import * as React from "react";
import type { TelemetryPoint } from "@/lib/types";
import { clinicalChannels,channelGeometry } from "@/lib/clinical-telemetry";
export interface TelemetryChartProps {data?:TelemetryPoint[];points?:TelemetryPoint[];title?:string;className?:string;}
export function TelemetryChart({data,points,title="Stored sensor telemetry (downsampled view)",className=""}:TelemetryChartProps) {
  const rows=data ?? points ?? [];
  const [tab,setTab]=React.useState<"chart"|"table">("chart");
  const [channel,setChannel]=React.useState("all");
  if(!rows.length) return <p className="rounded-xl border bg-white p-6">No telemetry packets recorded for this session.</p>;
  return <section className={`space-y-4 rounded-xl border bg-white p-4 ${className}`}><h2 className="text-lg font-semibold">{title}</h2>
    <p className="text-sm text-slate-600">Original monotonic timestamps in seconds. Gaps indicate missing or non-READ_OK channels, acquisition restarts, or transport discontinuity. Each channel has its own scale. Provenance and quality are available in the table.</p>
    <div className="flex flex-wrap gap-3"><button className="rounded border px-3 py-2" aria-pressed={tab==="chart"} onClick={() => setTab("chart")}>Charts</button><button className="rounded border px-3 py-2" aria-pressed={tab==="table"} onClick={() => setTab("table")}>Data and quality</button>
    <label>Channel <select className="rounded border p-2" value={channel} onChange={e => setChannel(e.target.value)}><option value="all">All</option>{clinicalChannels.map(c => <option key={c.key} value={c.key}>{c.label}</option>)}</select></label></div>
    {tab==="chart" ? clinicalChannels.filter(c => channel==="all" || channel===c.key).map(c => {
      const g=channelGeometry(rows,c);
      return <figure key={c.key}><figcaption className="text-sm font-medium">{c.label} ({c.unit})</figcaption>{!g.dots.length ? <p className="p-4 text-slate-500">No valid {c.label.toLowerCase()} readings.</p> : <svg viewBox="0 0 800 155" role="img" aria-label={`${c.label} over time in seconds`} className="w-full">
        <line x1="65" y1="120" x2="775" y2="120" stroke="#94A3B8"/><text x="4" y="22" fontSize="11">{g.max.toFixed(1)}</text><text x="4" y="120" fontSize="11">{g.min.toFixed(1)}</text>
        <text x="65" y="148" fontSize="11">{(g.start/1000).toFixed(2)}s</text><text x="775" y="148" textAnchor="end" fontSize="11">{(g.end/1000).toFixed(2)}s</text>
        <path d={g.path} fill="none" stroke={c.color} strokeWidth="2"/>{g.dots.map((p,i) => <circle key={i} cx={p.x} cy={p.y} r="2" fill={c.color}/>)}
      </svg>}</figure>;
    }) : <div className="max-h-[32rem] overflow-auto"><table className="w-full text-left text-xs"><caption className="p-2 text-left">Downsampled observations; counts summarize quality and source between retained points.</caption><thead><tr>{["Time (s)","Angle (°)","Heel / toe (ADC)","Temperature (°C)","Channel quality","Provenance","Retained span quality / sources"].map(s => <th className="p-2" key={s}>{s}</th>)}</tr></thead><tbody>{rows.map((p,i) => <tr key={i} className="border-t"><td className="p-2">{(p.timestampMs/1000).toFixed(3)}</td><td className="p-2">{p.kneeAngleDeg ?? "Unavailable"}</td><td className="p-2">{p.fsrHeelRaw ?? "Unavailable"} / {p.fsrToeRaw ?? "Unavailable"}</td><td className="p-2">{p.skinTemperatureC ?? "Unavailable"}</td><td className="p-2">Angle: {p.channelHealth.angle}<br/>FSR: {p.channelHealth.fsr}<br/>Temperature: {p.channelHealth.temp}</td><td className="max-w-64 break-all p-2">{p.source ?? "unknown"}<br/>Boot {p.bootId ?? "unknown"} · #{p.sequenceNumber ?? "unknown"}<br/>{p.serverReceivedAt ?? "Receipt time unavailable"}</td><td className="max-w-64 break-all p-2">{JSON.stringify(p.qualitySummary ?? {})}<br/>{JSON.stringify(p.sourceSummary ?? {})}<br/>{JSON.stringify(p.bootSummary ?? {})}</td></tr>)}</tbody></table></div>}
  </section>;
}
