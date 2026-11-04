"use client";

import * as React from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { AppShell } from "@/components/ui/AppShell";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { INITIAL_PLANS, INITIAL_USERS, INITIAL_EXERCISES } from "@/lib/services/mock-data";
import { ExercisePlanItem, PlanState } from "@/lib/types";
import { ArrowLeft, Save, Send, Plus, Trash2, CheckCircle2, History } from "lucide-react";

export default function PlanEditorPage() {
  const params = useParams();
  const router = useRouter();
  const patientId = (params?.id as string) || "usr_pat_108";

  const patient = INITIAL_USERS.find((u) => u.id === patientId) || INITIAL_USERS[3];
  const initialPlan = INITIAL_PLANS.find((p) => p.patientId === patientId) || INITIAL_PLANS[0];

  const [version, setVersion] = React.useState(initialPlan.version);
  const [state, setState] = React.useState<PlanState>(initialPlan.state);
  const [items, setItems] = React.useState<ExercisePlanItem[]>(initialPlan.items);
  const [notes, setNotes] = React.useState(initialPlan.clinicalNotes || "");
  const [successNotice, setSuccessNotice] = React.useState("");

  const handleAddItem = (exerciseId: string) => {
    const ex = INITIAL_EXERCISES.find((e) => e.id === exerciseId) || INITIAL_EXERCISES[0];
    const newItem: ExercisePlanItem = {
      id: `item_${Date.now()}`,
      exerciseId: ex.id,
      exerciseName: ex.name,
      targetReps: ex.defaultRepetitions,
      targetSets: 3,
      targetFlexionDeg: ex.targetAngleMaxDeg,
      targetExtensionDeg: ex.targetAngleMinDeg,
      restIntervalSeconds: ex.restIntervalSeconds,
      instructions: "Perform slowly with proper form. Stop if sharp discomfort occurs.",
    };
    setItems([...items, newItem]);
    setState("Draft");
  };

  const handleRemoveItem = (id: string) => {
    setItems(items.filter((item) => item.id !== id));
    setState("Draft");
  };

  const handlePublish = () => {
    const nextVer = version + 1;
    setVersion(nextVer);
    setState("Published");
    setSuccessNotice(`Rehabilitation Plan v${nextVer} successfully stamped and published.`);
    setTimeout(() => setSuccessNotice(""), 4000);
  };

  return (
    <AppShell>
      <div className="space-y-6">
        {/* Navigation & Status Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Link href={`/doctor/patients/${patientId}`}>
              <Button size="sm" variant="outline" className="gap-1.5">
                <ArrowLeft className="h-4 w-4" /> Back to Patient
              </Button>
            </Link>
            <div>
              <h1 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                <span>Exercise Plan Editor: {patient.fullName}</span>
                <span className="px-2.5 py-0.5 text-xs font-semibold rounded-full bg-teal-50 text-teal-800 border border-teal-200">
                  Version {version} ({state})
                </span>
              </h1>
              <p className="text-xs text-slate-500">
                Author: Dr. Marcus Vance, MD • Subject Condition: {patient.department}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button
              size="sm"
              variant="outline"
              onClick={() => {
                setState("Draft");
                setSuccessNotice("Saved as working draft.");
                setTimeout(() => setSuccessNotice(""), 3000);
              }}
              className="gap-1.5"
            >
              <Save className="h-4 w-4" /> Save Draft
            </Button>
            <Button size="sm" variant="primary" onClick={handlePublish} className="gap-1.5">
              <Send className="h-4 w-4" /> Stamp & Publish Plan (W3.7)
            </Button>
          </div>
        </div>

        {successNotice && (
          <div className="p-3 bg-emerald-50 border border-emerald-200 text-xs font-semibold text-emerald-800 rounded-lg flex items-center gap-2 animate-in fade-in">
            <CheckCircle2 className="h-4 w-4 text-emerald-600" />
            {successNotice}
          </div>
        )}

        {/* Clinical Rationale & Plan Notes */}
        <Card>
          <CardHeader>
            <CardTitle>Clinical Rationale & Instructions</CardTitle>
            <CardDescription>
              Physician clinical guidelines for this specific plan version.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <textarea
              value={notes}
              onChange={(e) => {
                setNotes(e.target.value);
                setState("Draft");
              }}
              rows={3}
              className="w-full text-sm p-3 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#0F766E] text-slate-800"
              placeholder="e.g. Advancing flexion ROM post-week 4. Target ≥105° flexion while observing patient pain threshold."
            />
          </CardContent>
        </Card>

        {/* Protocol Items List */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-slate-900">
              Prescribed Exercise Protocols ({items.length})
            </h3>
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-500">Add from Library:</span>
              <Button
                size="sm"
                variant="outline"
                onClick={() => handleAddItem("ex_quad_sets")}
                className="text-xs gap-1"
              >
                <Plus className="h-3 w-3" /> Quad Sets
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => handleAddItem("ex_tke")}
                className="text-xs gap-1"
              >
                <Plus className="h-3 w-3" /> Terminal Knee Ext
              </Button>
            </div>
          </div>

          <div className="space-y-4">
            {items.map((item, idx) => (
              <Card key={item.id} className="border-l-4 border-l-[#0F766E]">
                <CardHeader className="flex flex-row items-center justify-between py-3">
                  <div className="flex items-center gap-2">
                    <span className="h-6 w-6 rounded-full bg-slate-100 flex items-center justify-center text-xs font-bold text-slate-700">
                      {idx + 1}
                    </span>
                    <h4 className="text-sm font-bold text-slate-900">{item.exerciseName}</h4>
                  </div>
                  <button
                    onClick={() => handleRemoveItem(item.id)}
                    className="p-1 rounded-md text-red-500 hover:bg-red-50 text-xs flex items-center gap-1"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                    <span>Remove</span>
                  </button>
                </CardHeader>
                <CardContent className="pt-2 grid grid-cols-2 sm:grid-cols-4 gap-4">
                  <Input
                    label="Target Repetitions"
                    type="number"
                    value={item.targetReps}
                    onChange={(e) => {
                      const val = parseInt(e.target.value) || 0;
                      setItems(items.map((it) => (it.id === item.id ? { ...it, targetReps: val } : it)));
                      setState("Draft");
                    }}
                  />
                  <Input
                    label="Target Sets"
                    type="number"
                    value={item.targetSets}
                    onChange={(e) => {
                      const val = parseInt(e.target.value) || 0;
                      setItems(items.map((it) => (it.id === item.id ? { ...it, targetSets: val } : it)));
                      setState("Draft");
                    }}
                  />
                  <Input
                    label="Target Flexion (°)"
                    type="number"
                    value={item.targetFlexionDeg}
                    onChange={(e) => {
                      const val = parseInt(e.target.value) || 0;
                      setItems(items.map((it) => (it.id === item.id ? { ...it, targetFlexionDeg: val } : it)));
                      setState("Draft");
                    }}
                  />
                  <Input
                    label="Rest Interval (s)"
                    type="number"
                    value={item.restIntervalSeconds}
                    onChange={(e) => {
                      const val = parseInt(e.target.value) || 0;
                      setItems(items.map((it) => (it.id === item.id ? { ...it, restIntervalSeconds: val } : it)));
                      setState("Draft");
                    }}
                  />
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </AppShell>
  );
}

