"use client";

import * as React from "react";
import Link from "next/link";
import { AppShell } from "@/components/ui/AppShell";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/Card";
import { StatusBadge } from "@/components/ui/StatusBadge";
import {
  UserCircle,
  ArrowLeft,
  Save,
  CheckCircle2,
  Calendar,
  Phone,
  Mail,
  MapPin,
  Heart,
  Stethoscope,
  Activity,
  Cpu,
  ShieldCheck,
  Bell,
  Sliders,
  ChevronRight,
  Clock,
  Sparkles,
} from "lucide-react";

export default function PatientProfilePage() {
  // Personal editable state
  const [fullName, setFullName] = React.useState("Sarah Connor");
  const [email, setEmail] = React.useState("sarah.connor@orthosense.health");
  const [phone, setPhone] = React.useState("+1 (555) 234-5678");
  const [emergencyName, setEmergencyName] = React.useState("John Connor");
  const [emergencyPhone, setEmergencyPhone] = React.useState("+1 (555) 987-6543");
  const [emergencyRelation, setEmergencyRelation] = React.useState("Brother / Legal Next of Kin");
  const [address, setAddress] = React.useState("742 Evergreen Terrace, San Francisco, CA");

  // Preferences toggles
  const [hapticAlerts, setHapticAlerts] = React.useState(true);
  const [dailyReminders, setDailyReminders] = React.useState(true);
  const [doctorNotesAlert, setDoctorNotesAlert] = React.useState(true);
  const [autoSyncBle, setAutoSyncBle] = React.useState(true);

  // Form saving state
  const [saving, setSaving] = React.useState(false);
  const [savedMessage, setSavedMessage] = React.useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setTimeout(() => {
      setSaving(false);
      setSavedMessage(true);
      setTimeout(() => setSavedMessage(false), 3500);
    }, 600);
  };

  return (
    <AppShell>
      <div className="space-y-6 max-w-6xl mx-auto pb-12">
        {/* Top Breadcrumb & Action Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200">
          <div className="flex items-center gap-3">
            <Link href="/patient/dashboard">
              <Button size="sm" variant="outline" className="gap-1.5 text-xs">
                <ArrowLeft className="h-4 w-4" /> Back to Dashboard
              </Button>
            </Link>
            <div>
              <h1 className="text-xl font-bold tracking-tight text-slate-900">
                Patient Clinical Profile &amp; Preferences
              </h1>
              <p className="text-xs text-slate-500">
                Subject Identifier: <span className="font-mono font-semibold text-slate-700">PAT-2026-ACL-092</span>
              </p>
            </div>
          </div>

          <Button
            size="sm"
            variant="primary"
            onClick={handleSave}
            loading={saving}
            className="gap-1.5 font-semibold shadow-xs"
          >
            <Save className="h-4 w-4" /> Save Profile Updates
          </Button>
        </div>

        {savedMessage && (
          <div className="p-3.5 bg-emerald-50 border border-emerald-200 text-xs font-semibold text-emerald-800 rounded-xl flex items-center gap-2 animate-in fade-in">
            <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
            Patient profile changes and preference updates saved successfully.
          </div>
        )}

        {/* HERO PROFILE IDENTITY BANNER */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            {/* Avatar Circle with Online Status Indicator */}
            <div className="relative">
              <div className="h-20 w-20 rounded-2xl bg-[#0F766E] text-white flex items-center justify-center text-2xl font-black shadow-md border-2 border-teal-300">
                SC
              </div>
              <span
                className="absolute -bottom-1 -right-1 h-5 w-5 rounded-full bg-emerald-500 border-2 border-white flex items-center justify-center"
                title="Telemetry Link Active"
              >
                <span className="h-2 w-2 rounded-full bg-white animate-pulse"></span>
              </span>
            </div>

            <div className="space-y-1">
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-2xl font-extrabold text-slate-900 leading-tight">
                  {fullName}
                </h2>
                <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-teal-50 text-teal-800 border border-teal-200">
                  Week 4 Post-Op ACL
                </span>
                <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                  92% Compliance
                </span>
              </div>
              <p className="text-xs text-slate-500">
                Age: <strong className="text-slate-700">34</strong> • Sex: <strong className="text-slate-700">Female</strong> • Primary Clinician: <strong className="text-teal-800">Dr. Marcus Vance, MD</strong>
              </p>
              <p className="text-xs text-slate-600 font-mono">
                {email} • {phone}
              </p>
            </div>
          </div>

          {/* Quick Hardware Link Strip */}
          <div className="flex flex-col sm:flex-row md:flex-col gap-2 p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs shrink-0">
            <div className="flex items-center justify-between gap-4">
              <span className="text-slate-500">Paired Brace:</span>
              <span className="font-mono font-bold text-slate-900">ESP32-S3-ORTHO-092</span>
            </div>
            <div className="flex items-center justify-between gap-4">
              <span className="text-slate-500">Hardware Battery:</span>
              <span className="font-bold text-emerald-700 font-mono">94% (Good)</span>
            </div>
            <Link
              href="/patient/device"
              className="text-[11px] font-semibold text-[#0F766E] hover:underline pt-1 text-right flex items-center justify-end gap-1"
            >
              <span>Inspect Hardware Telemetry</span>
              <ChevronRight className="h-3 w-3" />
            </Link>
          </div>
        </div>

        {/* 2-COLUMN MAIN BODY: Clinical Case & Settings */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* ======================================================= */}
          {/* LEFT COLUMN: SURGICAL CASE & REHAB KINEMATICS (7 Cols)  */}
          {/* ======================================================= */}
          <div className="lg:col-span-7 space-y-6">
            {/* CARD 1: Surgical & Clinical Case File */}
            <Card>
              <CardHeader className="pb-3 border-b border-slate-100 flex flex-row items-center justify-between">
                <div>
                  <CardTitle className="text-base flex items-center gap-2">
                    <Stethoscope className="h-4 w-4 text-[#0F766E]" />
                    Surgical &amp; Clinical Case Record
                  </CardTitle>
                  <CardDescription className="text-xs">
                    Official surgical profile logged by Department of Orthopedics
                  </CardDescription>
                </div>
                <span className="text-xs font-mono font-bold text-slate-700 bg-slate-100 px-2 py-0.5 rounded">
                  ICD-10: S83.512A
                </span>
              </CardHeader>

              <CardContent className="space-y-4 pt-4 text-xs">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-3 bg-slate-50/70 rounded-xl border border-slate-100">
                  <div>
                    <span className="text-slate-400 block text-[10px] uppercase font-semibold">
                      Surgical Procedure
                    </span>
                    <span className="font-bold text-slate-900 text-sm leading-snug block mt-0.5">
                      Left Knee ACL Reconstruction
                    </span>
                    <span className="text-slate-500 text-[11px]">Hamstring Tendon Autograft</span>
                  </div>

                  <div>
                    <span className="text-slate-400 block text-[10px] uppercase font-semibold">
                      Surgery Date
                    </span>
                    <span className="font-bold text-slate-900 text-sm block mt-0.5">
                      October 7, 2026
                    </span>
                    <span className="text-teal-700 font-semibold text-[11px]">
                      28 Days Post-Operative
                    </span>
                  </div>

                  <div>
                    <span className="text-slate-400 block text-[10px] uppercase font-semibold">
                      Supervising Orthopedic Surgeon
                    </span>
                    <span className="font-bold text-slate-900 block mt-0.5">
                      Dr. Marcus Vance, MD, FRCS
                    </span>
                    <span className="text-slate-500 text-[11px]">
                      Knee Reconstruction &amp; Sports Medicine
                    </span>
                  </div>

                  <div>
                    <span className="text-slate-400 block text-[10px] uppercase font-semibold">
                      Primary Physical Therapist
                    </span>
                    <span className="font-bold text-slate-900 block mt-0.5">
                      Elena Gomez, DPT, OCS
                    </span>
                    <span className="text-slate-500 text-[11px]">
                      Advanced Biomechanical Rehabilitation
                    </span>
                  </div>
                </div>

                {/* Range of Motion Milestones */}
                <div className="space-y-2 pt-1">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-800 text-xs">
                      Longitudinal ROM Recovery Progression
                    </span>
                    <span className="text-xs text-teal-800 font-semibold font-mono">
                      Current Flexion: 98° / Goal: 105°
                    </span>
                  </div>

                  {/* Visual Stepper / Progress Bar */}
                  <div className="space-y-2">
                    <div className="w-full bg-slate-200 h-2.5 rounded-full overflow-hidden flex">
                      <div className="bg-[#0F766E] h-full" style={{ width: "70%" }}></div>
                      <div className="bg-[#2DD4BF] h-full" style={{ width: "10%" }}></div>
                      <div className="bg-slate-300 h-full" style={{ width: "20%" }}></div>
                    </div>
                    <div className="flex justify-between text-[10px] text-slate-500 font-mono">
                      <span>Baseline Post-Op: 60°</span>
                      <span className="font-bold text-[#0F766E]">Current: 98°</span>
                      <span className="font-bold text-teal-700">Target: 105°</span>
                      <span>Full Recovery: 135°</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
            {/* CARD 2: Active Rehabilitation Protocol Summary */}
            <Card>
              <CardHeader className="pb-3 border-b border-slate-100 flex flex-row items-center justify-between">
                <div>
                  <CardTitle className="text-base flex items-center gap-2">
                    <Activity className="h-4 w-4 text-[#0F766E]" />
                    Current Rehabilitation Protocol
                  </CardTitle>
                  <CardDescription className="text-xs">
                    Prescribed regimen active on your smart knee brace
                  </CardDescription>
                </div>
                <Link href="/patient/exercises">
                  <Button size="sm" variant="outline" className="h-7 text-xs">
                    View Exercises →
                  </Button>
                </Link>
              </CardHeader>
              <CardContent className="space-y-3 pt-4 text-xs">
                <div className="p-3 bg-teal-50/70 border border-teal-200 rounded-xl space-y-1">
                  <div className="flex items-center justify-between text-teal-900 font-bold">
                    <span>Protocol Version 2.0 (Active)</span>
                    <span className="text-[10px] bg-teal-100 px-2 py-0.5 rounded font-mono">
                      Published 10/25/2026
                    </span>
                  </div>
                  <p className="text-teal-800 text-xs leading-relaxed italic">
                    &ldquo;Progressing active flexion from 80° to 105°. Prioritize terminal knee extension lockout (0°) during patella slides. Monitor heel load concordance.&rdquo;
                  </p>
                </div>

                <div className="grid grid-cols-3 gap-3 text-center pt-1">
                  <div className="p-3 bg-slate-50 rounded-lg border border-slate-100">
                    <span className="text-[10px] text-slate-400 block uppercase font-medium">
                      Total Completed
                    </span>
                    <span className="text-lg font-bold text-slate-900 font-mono">24</span>
                    <span className="text-[10px] text-slate-500 block">Sessions</span>
                  </div>
                  <div className="p-3 bg-slate-50 rounded-lg border border-slate-100">
                    <span className="text-[10px] text-slate-400 block uppercase font-medium">
                      Active Streak
                    </span>
                    <span className="text-lg font-bold text-[#0F766E] font-mono">4 Days</span>
                    <span className="text-[10px] text-slate-500 block">Consistent</span>
                  </div>
                  <div className="p-3 bg-slate-50 rounded-lg border border-slate-100">
                    <span className="text-[10px] text-slate-400 block uppercase font-medium">
                      Compliance
                    </span>
                    <span className="text-lg font-bold text-emerald-700 font-mono">92%</span>
                    <span className="text-[10px] text-slate-500 block">Target Achieved</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* ======================================================= */}
          {/* RIGHT COLUMN: CONTACT & SYSTEM PREFERENCES (5 Cols)      */}
          {/* ======================================================= */}
          <div className="lg:col-span-5 space-y-6">
            {/* CARD 3: Contact & Emergency Information */}
            <Card>
              <CardHeader className="pb-3 border-b border-slate-100">
                <CardTitle className="text-base flex items-center gap-2">
                  <UserCircle className="h-4 w-4 text-[#0F766E]" />
                  Contact Information
                </CardTitle>
                <CardDescription className="text-xs">
                  Editable personal details for your clinical record
                </CardDescription>
              </CardHeader>

              <CardContent className="space-y-3.5 pt-4">
                <Input
                  label="Full Legal Name"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="h-9 text-xs"
                />

                <Input
                  label="Patient Clinical Email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="h-9 text-xs"
                />

                <Input
                  label="Mobile Phone"
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="h-9 text-xs"
                />

                <Input
                  label="Residential Address"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className="h-9 text-xs"
                />

                <div className="pt-2 border-t border-slate-100 space-y-3">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-slate-800">
                    <Heart className="h-3.5 w-3.5 text-red-500" />
                    <span>Emergency Contact</span>
                  </div>

                  <Input
                    label="Emergency Contact Name"
                    value={emergencyName}
                    onChange={(e) => setEmergencyName(e.target.value)}
                    className="h-9 text-xs"
                  />

                  <Input
                    label="Relationship to Subject"
                    value={emergencyRelation}
                    onChange={(e) => setEmergencyRelation(e.target.value)}
                    className="h-9 text-xs"
                  />

                  <Input
                    label="Emergency Contact Phone"
                    type="tel"
                    value={emergencyPhone}
                    onChange={(e) => setEmergencyPhone(e.target.value)}
                    className="h-9 text-xs"
                  />
                </div>
              </CardContent>
            </Card>

            {/* CARD 4: Telemetry & Notification Preferences */}
            <Card>
              <CardHeader className="pb-3 border-b border-slate-100">
                <CardTitle className="text-base flex items-center gap-2">
                  <Bell className="h-4 w-4 text-[#0F766E]" />
                  Device &amp; Telemetry Alerts
                </CardTitle>
                <CardDescription className="text-xs">
                  Configure real-time brace feedback and reminders
                </CardDescription>
              </CardHeader>

              <CardContent className="space-y-3 pt-4 text-xs">
                {/* Preference 1: Haptic Vibration on Limit Exceeded */}
                <div className="flex items-center justify-between p-2.5 rounded-lg border border-slate-100 bg-slate-50/70">
                  <div className="space-y-0.5 max-w-[240px]">
                    <span className="font-bold text-slate-900 block">Knee Brace Haptic Vibration</span>
                    <span className="text-slate-500 text-[11px] block">
                      Vibrates if flexion exceeds 105° threshold
                    </span>
                  </div>
                  <input
                    type="checkbox"
                    checked={hapticAlerts}
                    onChange={(e) => setHapticAlerts(e.target.checked)}
                    className="h-4 w-4 rounded border-slate-300 text-[#0F766E] focus:ring-[#0F766E]"
                  />
                </div>

                {/* Preference 2: Daily Reminders */}
                <div className="flex items-center justify-between p-2.5 rounded-lg border border-slate-100 bg-slate-50/70">
                  <div className="space-y-0.5 max-w-[240px]">
                    <span className="font-bold text-slate-900 block">Daily Routine Notifications</span>
                    <span className="text-slate-500 text-[11px] block">
                      Reminders at 9:00 AM and 5:00 PM
                    </span>
                  </div>
                  <input
                    type="checkbox"
                    checked={dailyReminders}
                    onChange={(e) => setDailyReminders(e.target.checked)}
                    className="h-4 w-4 rounded border-slate-300 text-[#0F766E] focus:ring-[#0F766E]"
                  />
                </div>

                {/* Preference 3: Doctor Note Updates */}
                <div className="flex items-center justify-between p-2.5 rounded-lg border border-slate-100 bg-slate-50/70">
                  <div className="space-y-0.5 max-w-[240px]">
                    <span className="font-bold text-slate-900 block">Physician Review Notices</span>
                    <span className="text-slate-500 text-[11px] block">
                      Alert when Dr. Vance reviews completed telemetry
                    </span>
                  </div>
                  <input
                    type="checkbox"
                    checked={doctorNotesAlert}
                    onChange={(e) => setDoctorNotesAlert(e.target.checked)}
                    className="h-4 w-4 rounded border-slate-300 text-[#0F766E] focus:ring-[#0F766E]"
                  />
                </div>

                {/* Preference 4: Auto Sync */}
                <div className="flex items-center justify-between p-2.5 rounded-lg border border-slate-100 bg-slate-50/70">
                  <div className="space-y-0.5 max-w-[240px]">
                    <span className="font-bold text-slate-900 block">Auto-Sync over Wi-Fi / BLE</span>
                    <span className="text-slate-500 text-[11px] block">
                      Immediately transmit session packets on finish
                    </span>
                  </div>
                  <input
                    type="checkbox"
                    checked={autoSyncBle}
                    onChange={(e) => setAutoSyncBle(e.target.checked)}
                    className="h-4 w-4 rounded border-slate-300 text-[#0F766E] focus:ring-[#0F766E]"
                  />
                </div>

                <div className="pt-2">
                  <Button
                    size="sm"
                    variant="primary"
                    onClick={handleSave}
                    loading={saving}
                    className="w-full text-xs font-semibold"
                  >
                    Save Notification Settings
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
