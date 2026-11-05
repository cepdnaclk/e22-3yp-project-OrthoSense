"use client";

import * as React from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { AppShell } from "@/components/ui/AppShell";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Skeleton, SkeletonCard } from "@/components/ui/Skeleton";
import { plansApi, patientsApi, exercisesApi } from "@/lib/services/api";
import { ExercisePlanItem, PlanState, User, ExerciseDefinition } from "@/lib/types";
import { ArrowLeft, Save, Send, Plus, Trash2, CheckCircle2, History, RefreshCw } from "lucide-react";

export default function PlanEditorPage() {
  const params = useParams();
  const router = useRouter();
  const patientId = params?.id as string;

  const [patient, setPatient] = React.useState<User | null>(null);
  const [exercises, setExercises] = React.useState<ExerciseDefinition[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [planId, setPlanId] = React.useState<string | null>(null);
  const [version, setVersion] = React.useState(1);
  const [state, setState] = React.useState<PlanState>("Draft");
  const [items, setItems] = React.useState<ExercisePlanItem[]>([]);
  const [notes, setNotes] = React.useState("");
  const [successNotice, setSuccessNotice] = React.useState("");
  const [submitting, setSubmitting] = React.useState(false);

  const fetchPlanData = React.useCallback(async () => {
    if (!patientId) return;
    setLoading(true);
    try {
      const [pt, exList, plan] = await Promise.all([
        patientsApi.getById(patientId).catch(() => null),
        exercisesApi.getAll().catch(() => []),
        plansApi.getMyPlan(patientId).catch(() => null),
      ]);
      if (pt) setPatient(pt);
      setExercises(exList);
      if (plan) {
        setPlanId(plan.id);
        setVersion(plan.version);
        setState(plan.state);
        setItems(plan.items || []);
        setNotes(plan.clinicalNotes || "");
      }
    } finally {
      setLoading(false);
    }
  }, [patientId]);

  React.useEffect(() => {
    fetchPlanData();
  }, [fetchPlanData]);

  const handleAddItem = (exerciseId: string) => {
    const ex = exercises.find((e) => e.id === exerciseId);
    if (!ex) return;
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

  const handlePublish = async () => {
    setSubmitting(true);
    try {
      if (planId) {
        await plansApi.publish(planId);
      }
      setSuccessNotice(`Rehabilitation Plan v${version} successfully stamped and published.`);
      setState("Published");
      setTimeout(() => setSuccessNotice(""), 4000);
      fetchPlanData();
    } catch (err: any) {
      alert(err.message || "Failed to publish plan");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <AppShell>
        <div className="space-y-6">
          <Skeleton className="h-10 w-64" />
          <SkeletonCard className="h-64" />
          <SkeletonCard className="h-48" />
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell>
      <div className="space-y-6">
        {/* Navigation & Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Link href={`/doctor/patients/${patientId}`}>
              <Button size="sm" variant="outline" className="gap-1.5">
                <ArrowLeft className="h-4 w-4" /> Back to Patient Overview
              </Button>
            </Link>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-bold tracking-tight text-slate-900">
                  Prescription Protocol Editor
                </h1>
                <span
                  className={`text-xs px-2.5 py-0.5 rounded-full font-semibold border ${
                    state === "Published"
                      ? "bg-emerald-50 text-emerald-800 border-emerald-200"
                      : "bg-amber-50 text-amber-800 border-amber-200"
                  }`}
                >
                  Version {version} • {state}
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Target Patient: <strong className="text-slate-800">{patient?.fullName || "Patient"}</strong> • {patient?.department || "Orthopedic Rehabilitation"}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button
              size="sm"
              variant="outline"
              onClick={fetchPlanData}
              className="gap-1.5"
            >
              <RefreshCw className="h-4 w-4" /> Reset
            </Button>
            <Button
              size="sm"
              variant="primary"
              onClick={handlePublish}
              loading={submitting}
              className="gap-1.5 shadow-sm"
            >
              <Send className="h-4 w-4" /> Publish &amp; Stamp Plan v{version}
            </Button>
          </div>
        </div>

        {/* Success Notice */}
        {successNotice && (
          <div className="p-4 bg-emerald-50 border border-emerald-200 text-xs text-emerald-900 rounded-xl flex items-center gap-2.5 font-medium animate-in fade-in">
            <CheckCircle2 className="h-5 w-5 text-emerald-600 shrink-0" />
            <span>{successNotice}</span>
          </div>
        )}

        {/* Clinical Rationale & Plan Notes */}
        <Card>
          <CardHeader>
            <CardTitle>Clinical Rationale &amp; Recovery Milestones</CardTitle>
            <CardDescription>
              Physician instructions displayed to patient and logged in legal clinical chart.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <textarea
              className="w-full h-24 p-3 text-xs rounded-lg border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-[#0F766E] resize-none"
              placeholder="e.g. Target active flexion increased from 90° to 105°. Maintain 3 sets daily with steady cadence..."
              value={notes}
              onChange={(e) => {
                setNotes(e.target.value);
                setState("Draft");
              }}
            />
          </CardContent>
        </Card>

        {/* Prescribed Movements */}
        <Card>
          <CardHeader>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <CardTitle>Prescribed Movements &amp; Biomechanical Targets</CardTitle>
                <CardDescription>
                  Hardware angle boundaries enforce real-time auditory/visual feedback.
                </CardDescription>
              </div>
              {exercises.length > 0 && (
                <div className="w-56">
                  <Select
                    options={[
                      { value: "", label: "+ Add Exercise Protocol..." },
                      ...exercises.map((e) => ({ value: e.id, label: e.name })),
                    ]}
                    onChange={(e) => {
                      if (e.target.value) {
                        handleAddItem(e.target.value);
                        e.target.value = "";
                      }
                    }}
                  />
                </div>
              )}
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {items.length === 0 ? (
              <p className="text-xs text-slate-500 py-6 text-center">
                No exercises currently prescribed in this protocol. Select an exercise above to begin.
              </p>
            ) : (
              items.map((item, idx) => (
                <div
                  key={item.id}
                  className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 space-y-3"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-sm text-slate-900">
                      {idx + 1}. {item.exerciseName}
                    </span>
                    <button
                      type="button"
                      onClick={() => handleRemoveItem(item.id)}
                      className="text-red-500 hover:text-red-700 p-1 text-xs flex items-center gap-1 cursor-pointer"
                    >
                      <Trash2 className="h-4 w-4" /> Remove
                    </button>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                    <div>
                      <span className="text-slate-500 block mb-1">Target Sets</span>
                      <Input
                        type="number"
                        value={item.targetSets}
                        onChange={(e) => {
                          const val = parseInt(e.target.value) || 1;
                          setItems(items.map((it) => (it.id === item.id ? { ...it, targetSets: val } : it)));
                          setState("Draft");
                        }}
                      />
                    </div>
                    <div>
                      <span className="text-slate-500 block mb-1">Target Reps</span>
                      <Input
                        type="number"
                        value={item.targetReps}
                        onChange={(e) => {
                          const val = parseInt(e.target.value) || 1;
                          setItems(items.map((it) => (it.id === item.id ? { ...it, targetReps: val } : it)));
                          setState("Draft");
                        }}
                      />
                    </div>
                    <div>
                      <span className="text-slate-500 block mb-1">Max Flexion (°)</span>
                      <Input
                        type="number"
                        value={item.targetFlexionDeg}
                        onChange={(e) => {
                          const val = parseFloat(e.target.value) || 0;
                          setItems(items.map((it) => (it.id === item.id ? { ...it, targetFlexionDeg: val } : it)));
                          setState("Draft");
                        }}
                      />
                    </div>
                    <div>
                      <span className="text-slate-500 block mb-1">Terminal Extension (°)</span>
                      <Input
                        type="number"
                        value={item.targetExtensionDeg}
                        onChange={(e) => {
                          const val = parseFloat(e.target.value) || 0;
                          setItems(items.map((it) => (it.id === item.id ? { ...it, targetExtensionDeg: val } : it)));
                          setState("Draft");
                        }}
                      />
                    </div>
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>
    </AppShell>
  );
}
