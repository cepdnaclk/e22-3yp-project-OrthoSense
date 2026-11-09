import type { TelemetryPoint, ExerciseSession } from "@/lib/types";
export type ChannelKey="kneeAngleDeg"|"fsrHeelRaw"|"fsrToeRaw"|"skinTemperatureC";
export const clinicalChannels: {key:ChannelKey;health:"angle"|"fsr"|"temp";label:string;unit:string;color:string}[]=[
  {key:"kneeAngleDeg",health:"angle",label:"Knee angle",unit:"°",color:"#0F766E"},
  {key:"fsrHeelRaw",health:"fsr",label:"FSR heel",unit:"ADC counts",color:"#1D4ED8"},
  {key:"fsrToeRaw",health:"fsr",label:"FSR toe",unit:"ADC counts",color:"#6D28D9"},
  {key:"skinTemperatureC",health:"temp",label:"Skin temperature",unit:"°C",color:"#BE123C"},
];
export function channelGeometry(points:TelemetryPoint[],channel:typeof clinicalChannels[number]) {
  const valid=(p:TelemetryPoint) => p.channelHealth[channel.health]==="READ_OK" && p[channel.key]!==null && Number.isFinite(p[channel.key]);
  const values=points.filter(valid).map(p => p[channel.key] as number);
  const low=values.length ? Math.min(...values) : 0;
  const high=values.length ? Math.max(...values) : 1;
  const min=low===high ? low-1 : low;
  const max=low===high ? high+1 : high;
  const start=points[0]?.timestampMs ?? 0;
  const end=points.at(-1)?.timestampMs ?? start;
  const x=(p:TelemetryPoint) => end===start ? 400 : 65+((p.timestampMs-start)/(end-start))*710;
  const y=(p:TelemetryPoint) => 120-((p[channel.key] as number)-min)/(max-min)*100;
  let pen=false;
  const dots:{x:number;y:number}[]=[];
  const path=points.map((p,i) => {
    if(!valid(p)) {pen=false;return "";}
    const prior=points[i-1];
    const discontinuous=p.gapBefore?.[channel.key] ?? p.gapBefore?.[channel.health] ?? (!!prior && (p.timestampMs-prior.timestampMs>1000 || p.bootId!==prior.bootId || p.source!==prior.source));
    if(discontinuous) pen=false;
    const command=`${pen ? "L" : "M"} ${x(p).toFixed(2)} ${y(p).toFixed(2)}`;
    dots.push({x:x(p),y:y(p)});pen=true;return command;
  }).filter(Boolean).join(" ");
  return {path,dots,min,max,start,end};
}
function csvCell(value:unknown):string {
  let text=value===null || value===undefined ? "" : typeof value==="object" ? JSON.stringify(value) : String(value);
  if(typeof value==="string" && /^[=+@\-\t\r]/.test(text)) text="'"+text;
  return `"${text.replaceAll('"','""')}"`;
}
export function telemetryCSV(points:TelemetryPoint[],sessionId:string,planVersion:number|null):string {
  const headers=["session_id","plan_version","timestamp_ms","knee_angle_deg","fsr_heel_adc_counts","fsr_toe_adc_counts","skin_temperature_c","angle_quality","fsr_quality","temperature_quality","source","boot_id","sequence_number","server_received_at","gap_before","quality_summary","source_summary","boot_summary"];
  const rows=points.map(p => [sessionId,planVersion,p.timestampMs,p.kneeAngleDeg,p.fsrHeelRaw,p.fsrToeRaw,p.skinTemperatureC,p.channelHealth.angle,p.channelHealth.fsr,p.channelHealth.temp,p.source,p.bootId,p.sequenceNumber,p.serverReceivedAt,p.gapBefore,p.qualitySummary,p.sourceSummary,p.bootSummary].map(csvCell).join(","));
  return [headers.join(","),...rows].join("\r\n");
}
export function sessionComparisons(s:ExerciseSession) {
  const item=s.prescribedItem;
  return [
    {label:"Maximum flexion",target:item ? `≥ ${item.target_flexion_deg}°` : "Unavailable",value:s.maxFlexionDeg===null ? "Unavailable" : `${s.maxFlexionDeg}°`,comparison:!item || s.maxFlexionDeg===null ? "Unavailable" : s.maxFlexionDeg>=item.target_flexion_deg ? "Target reached" : "Below target"},
    {label:"Minimum extension",target:item ? `≤ ${item.target_extension_deg}°` : "Unavailable",value:s.maxExtensionDeg===null ? "Unavailable" : `${s.maxExtensionDeg}°`,comparison:!item || s.maxExtensionDeg===null ? "Unavailable" : s.maxExtensionDeg<=item.target_extension_deg ? "Target reached" : "Above target"},
    {label:"Repetitions",target:item ? String(item.target_sets*item.target_repetitions) : "Unavailable",value:`${s.patientReportedReps ?? "Unavailable"} reported / ${s.sensorEstimatedReps ?? "Unavailable"} sensor`,comparison:s.patientReportedReps===null || s.sensorEstimatedReps===null ? "Comparison unavailable" : `Difference: ${s.patientReportedReps-s.sensorEstimatedReps} reported minus sensor`},
  ];
}
