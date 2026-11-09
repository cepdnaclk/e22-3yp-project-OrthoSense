import { test } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import vm from "node:vm";
import ts from "typescript";
import * as React from "react";
import { renderToStaticMarkup } from "react-dom/server";
const root=process.cwd();
function runtime(overrides={}) {
  const cache=new Map();
  function load(file) {
    const absolute=path.resolve(root,file);
    if(cache.has(absolute)) return cache.get(absolute);
    const module={exports:{}};cache.set(absolute,module.exports);
    const code=ts.transpileModule(fs.readFileSync(absolute,"utf8"),{fileName:absolute,compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022,jsx:ts.JsxEmit.React,esModuleInterop:true}}).outputText;
    function requireLocal(id) {
      if(Object.hasOwn(overrides,id)) return overrides[id];
      if(id==="react") return React;
      const target=id.startsWith("@/") ? path.resolve(root,id.slice(2)) : path.resolve(path.dirname(absolute),id);
      return load(fs.existsSync(target+".ts") ? target+".ts" : target+".tsx");
    }
    vm.runInNewContext(`(function(require,module,exports){${code}\n})`,{console,URLSearchParams,React})(requireLocal,module,module.exports);
    return module.exports;
  }
  return {load};
}
const raw={id:"session-a",patient_id:"patient-a",patient_name:"Patient A",plan_version:"plan-original",plan_version_number:1,exercise_name:"Saved exercise",started_at:"2026-11-09T00:00:00Z",ended_at:null,duration_seconds:0,target_reps:10,patient_reported_reps:3,sensor_estimated_reps:null,max_flexion_deg:null,max_extension_deg:null,status:"completed",quality_flag:"incomplete",doctor_reviewed:false,doctor_reviewed_at:null,doctor_review_notes:"",prescribed_item:null,plan_author_name:null,review_notes:[]};
const point=(time,angle=20)=>({timestampMs:time,kneeAngleDeg:angle,fsrHeelRaw:null,fsrToeRaw:null,skinTemperatureC:null,channelHealth:{angle:"READ_OK",fsr:"UNVERIFIED",temp:"UNVERIFIED"},source:"hardware",bootId:"boot",sequenceNumber:0});

test("one point has finite coordinates; timestamps determine spacing",()=>{
  const {channelGeometry,clinicalChannels}=runtime().load("lib/clinical-telemetry.ts");
  const single=channelGeometry([point(10)],clinicalChannels[0]);
  assert.equal(single.dots.length,1);assert.equal(single.dots[0].x,400);assert.ok(!/NaN|Infinity/.test(single.path));
  const geometry=channelGeometry([point(0),point(100),point(1000)],clinicalChannels[0]);
  assert.equal(geometry.dots[1].x,136);assert.equal(geometry.dots[2].x,775);
});

test("null, stale, boot and explicit decimation gaps break paths",()=>{
  const {channelGeometry,clinicalChannels}=runtime().load("lib/clinical-telemetry.ts");
  for(const middle of [point(100,null),{...point(100),channelHealth:{angle:"STALE"}}]) {
    const g=channelGeometry([point(0),middle,point(200)],clinicalChannels[0]);
    assert.equal((g.path.match(/M /g)||[]).length,2);assert.ok(!g.path.includes("L "));
  }
  const g=channelGeometry([point(0),{...point(100),bootId:"restart"},{...point(200),gapBefore:{kneeAngleDeg:true}}],clinicalChannels[0]);
  assert.equal((g.path.match(/M /g)||[]).length,3);
});

test("decimated valid spans can connect while missing toe remains a gap",()=>{
  const {channelGeometry,clinicalChannels}=runtime().load("lib/clinical-telemetry.ts");
  const points=[{...point(0),fsrHeelRaw:10,fsrToeRaw:10,channelHealth:{angle:"READ_OK",fsr:"READ_OK",temp:"UNVERIFIED"}},{...point(5000),fsrHeelRaw:20,fsrToeRaw:20,channelHealth:{angle:"READ_OK",fsr:"READ_OK",temp:"UNVERIFIED"},gapBefore:{fsrHeelRaw:false,fsrToeRaw:true}}];
  assert.ok(channelGeometry(points,clinicalChannels[1]).path.includes("L "));
  assert.ok(!channelGeometry(points,clinicalChannels[2]).path.includes("L "));
});

test("downsampled CSV labels units, quality, source and identity, escaping input",()=>{
  const {telemetryCSV}=runtime().load("lib/clinical-telemetry.ts");
  const csv=telemetryCSV([{...point(0),bootId:'=HYPERLINK("bad")',sourceSummary:{hardware:1}}],"session-a",1);
  assert.ok(csv.includes("fsr_heel_adc_counts"));assert.ok(csv.includes("angle_quality"));assert.ok(csv.includes("source_summary"));
  assert.ok(csv.includes('"session-a","1"'));assert.ok(csv.includes("'"+"=HYPERLINK"));assert.ok(csv.includes('""bad""'));
});

test("session adapters send scoped filters and return canonical review metadata",async()=>{
  const calls=[];
  const apiClient={get:async url=>{calls.push(url);return url.startsWith("/sessions/?") ? {count:23,next:"page-2",previous:null,results:[raw]} : raw;},post:async (url,payload)=>{calls.push({url,payload});return {...raw,doctor_reviewed:true,review_notes:[{id:"review-a",doctor_name:"Actual clinician",content:payload.notes}]};}};
  const {sessionsApi}=runtime({"./api-client":{apiClient},"./auth-contract":{normalizeRole:role=>role}}).load("lib/services/api.ts");
  const page=await sessionsApi.listPage({patient_id:"patient-a",reviewed:false,date_from:"2026-11-01",page:2});
  assert.ok(calls[0].includes("patient_id=patient-a"));assert.ok(calls[0].includes("reviewed=false"));assert.ok(calls[0].includes("page=2"));
  assert.equal(page.count,23);assert.equal(page.results[0].sensorEstimatedReps,null);
  const saved=await sessionsApi.review("session-a","Changed","review-original",true);
  assert.equal(saved.reviewHistory[0].doctor_name,"Actual clinician");assert.equal(saved.doctorReviewed,true);
  assert.equal(calls[1].payload.expected_review_id,"review-original");assert.equal(calls[1].payload.replace_review,true);
});

test("failed clinical reads propagate instead of becoming empty success",async()=>{
  const {sessionsApi}=runtime({"./api-client":{apiClient:{get:async()=>{throw new Error("network unavailable");}}},"./auth-contract":{}}).load("lib/services/api.ts");
  await assert.rejects(()=>sessionsApi.listPage({patient_id:"patient-a"}),/network unavailable/);
});

test("session facts show pending and unavailable data and use referenced targets",()=>{
  const {SessionFacts}=runtime().load("components/features/SessionFacts.tsx");
  const session={id:"session-a",patientId:"patient-a",patientName:"Patient A",exerciseName:"Saved exercise",planId:"old-plan",planVersion:1,startedAt:"2026-11-09T00:00:00Z",durationSeconds:0,status:"completed",qualityFlag:"incomplete",patientReportedReps:3,sensorEstimatedReps:null,maxFlexionDeg:null,maxExtensionDeg:null,doctorReviewed:false,reviewHistory:[],prescribedItem:{target_flexion_deg:93,target_extension_deg:4,target_sets:2,target_repetitions:8,rest_interval_seconds:15,notes:"Saved version instructions"}};
  const html=renderToStaticMarkup(React.createElement(SessionFacts,{session}));
  assert.ok(html.includes("Pending review"));assert.ok(html.includes("Unavailable"));assert.ok(html.includes("93°"));assert.ok(html.includes("Saved version instructions"));
  assert.ok(!html.includes("100%"));assert.ok(!html.includes("Marcus Vance"));
  const {sessionComparisons}=runtime().load("lib/clinical-telemetry.ts");
  const rows=sessionComparisons({...session,maxFlexionDeg:90,maxExtensionDeg:7,sensorEstimatedReps:2});
  assert.equal(rows[0].comparison,"Below target");assert.equal(rows[1].comparison,"Above target");assert.equal(rows[2].comparison,"Difference: 1 reported minus sensor");
});

test("session table prints session UUID links rather than patient UUID links",()=>{
  const {ClinicalSessionTable}=runtime({
    "next/link":{__esModule:true,default:({children,...props})=>React.createElement("a",props,children)},
    "@/components/ui/Button":{Button:({children,...props})=>React.createElement("button",props,children)},
  }).load("components/features/ClinicalSessionTable.tsx");
  const html=renderToStaticMarkup(React.createElement(ClinicalSessionTable,{page:{count:1,next:null,previous:null,results:[{id:"session-uuid",patientId:"patient-uuid",patientName:"Patient A",exerciseName:"Saved",startedAt:"2026-11-09T00:00:00Z",status:"completed",qualityFlag:"incomplete",patientReportedReps:3,sensorEstimatedReps:null,maxFlexionDeg:null}]},number:1,onPage:()=>{}}));
  assert.ok(html.includes('href="/reports/session/session-uuid"'));assert.ok(!html.includes('/reports/session/patient-uuid'));
});

test("failed report shows the authorized error state without a fabricated record",()=>{
  const {default:PrintableReport}=runtime({
    "next/link":{__esModule:true,default:({children,...props})=>React.createElement("a",props,children)},
    "next/navigation":{useParams:()=>({id:"forbidden-session"})},
    "@/lib/services/api":{sessionsApi:{}},
    "@/components/ui/Button":{Button:({children,...props})=>React.createElement("button",props,children)},
    "@/components/features/useClinicalResource":{useClinicalResource:()=>({data:null,error:"You do not have permission to view this information.",loading:false,refresh:()=>{}})},
  }).load("app/reports/session/[id]/page.tsx");
  const html=renderToStaticMarkup(React.createElement(PrintableReport));
  assert.ok(html.includes("Report unavailable"));assert.ok(html.includes("do not have permission"));assert.ok(!html.includes("<article"));
});
