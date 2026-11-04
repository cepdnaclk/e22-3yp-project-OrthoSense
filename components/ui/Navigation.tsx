"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { cn } from "@/lib/utils/cn";
import {
  Activity,
  Users,
  Cpu,
  FileText,
  Calendar,
  LogOut,
  Menu,
  X,
  ShieldAlert,
  Dumbbell,
  Radio,
  Sliders,
  ChevronRight,
  TrendingUp,
} from "lucide-react";
import { User, UserRole } from "@/lib/types";
import { authService } from "@/lib/services/auth-service";

interface NavItem {
  name: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
}

const NAV_ITEMS_BY_ROLE: Record<UserRole, NavItem[]> = {
  admin: [
    { name: "User Directory", href: "/admin/users", icon: Users },
    { name: "Device Registry", href: "/admin/devices", icon: Cpu },
    { name: "Security Audit Log", href: "/admin/audit-log", icon: ShieldAlert },
    { name: "System Health", href: "/admin/health", icon: Radio },
  ],
  doctor: [
    { name: "Clinical Dashboard", href: "/doctor/dashboard", icon: Activity },
    { name: "Patient Cohorts", href: "/doctor/patients", icon: Users },
    { name: "Exercise Protocols", href: "/doctor/exercises", icon: Dumbbell },
    { name: "Longitudinal Trends", href: "/doctor/reports", icon: TrendingUp },
  ],
  patient: [
    { name: "My Dashboard", href: "/patient/dashboard", icon: Activity },
    { name: "Assigned Exercises", href: "/patient/exercises", icon: Dumbbell },
    { name: "Record Live Session", href: "/patient/session/record", icon: Radio },
    { name: "Session History", href: "/patient/sessions", icon: Calendar },
    { name: "My Edge Device", href: "/patient/device", icon: Cpu },
  ],
};

export function Navigation({
  currentUser,
  onUserRoleChange,
}: {
  currentUser: User | null;
  onUserRoleChange?: (role: UserRole) => void;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);

  const role: UserRole = currentUser?.role || "doctor";
  const navItems = NAV_ITEMS_BY_ROLE[role] || [];

  const handleRoleSwitch = async (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newRole = e.target.value as UserRole;
    await authService.switchUser(newRole);
    if (onUserRoleChange) {
      onUserRoleChange(newRole);
    }
    // Navigate to role landing page
    if (newRole === "admin") router.push("/admin/users");
    else if (newRole === "doctor") router.push("/doctor/dashboard");
    else router.push("/patient/dashboard");
  };

  const handleLogout = async () => {
    await authService.logout();
    router.push("/login");
  };

  return (
    <>
      {/* Mobile Top Bar */}
      <header className="lg:hidden flex items-center justify-between px-4 py-3 bg-white border-b border-slate-200 sticky top-0 z-40">
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-lg bg-[#0F766E] flex items-center justify-center text-white font-bold">
            OS
          </div>
          <span className="font-semibold text-slate-900 tracking-tight">
            OrthoSense
          </span>
          <span className="text-xs uppercase font-mono px-1.5 py-0.5 rounded bg-teal-50 text-teal-800 border border-teal-200">
            {role}
          </span>
        </div>
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          aria-label="Toggle Navigation Menu"
          className="p-2 rounded-lg text-slate-600 hover:bg-slate-100"
        >
          {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </header>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="lg:hidden fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex flex-col justify-end">
          <div className="bg-white rounded-t-2xl p-6 space-y-4 max-h-[85vh] overflow-y-auto">
            <div className="flex justify-between items-center pb-3 border-b border-slate-100">
              <span className="font-semibold text-slate-800">Workspace Navigation</span>
              <button
                onClick={() => setMobileMenuOpen(false)}
                className="p-1 rounded-md text-slate-400 hover:text-slate-600"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="space-y-1">
              {navItems.map((item) => {
                const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className={cn(
                      "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
                      isActive
                        ? "bg-[#0F766E] text-white"
                        : "text-slate-700 hover:bg-slate-100"
                    )}
                  >
                    <item.icon className="h-4 w-4 shrink-0" />
                    <span>{item.name}</span>
                  </Link>
                );
              })}
            </div>
            <div className="pt-4 border-t border-slate-200 space-y-3">
              <div>
                <label className="text-xs font-semibold uppercase tracking-wider text-slate-500 block mb-1">
                  Switch Role Persona (Dev Demo)
                </label>
                <select
                  value={role}
                  onChange={handleRoleSwitch}
                  className="w-full text-sm border border-slate-300 rounded-lg p-2 bg-slate-50"
                >
                  <option value="doctor">Doctor (Dr. Marcus Vance)</option>
                  <option value="patient">Patient (Sarah Connor)</option>
                  <option value="admin">Administrator (Elena Rostova)</option>
                </select>
              </div>
              <button
                onClick={handleLogout}
                className="w-full flex items-center justify-center gap-2 px-3 py-2 text-sm text-red-600 bg-red-50 rounded-lg font-medium hover:bg-red-100"
              >
                <LogOut className="h-4 w-4" />
                <span>Log Out</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex flex-col w-64 bg-white border-r border-slate-200 shrink-0 sticky top-0 h-screen select-none">
        {/* Brand Header */}
        <div className="p-6 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className="h-9 w-9 rounded-xl bg-[#0F766E] flex items-center justify-center text-white font-bold shadow-xs">
              OS
            </div>
            <div>
              <span className="font-bold text-slate-900 tracking-tight block leading-tight">
                OrthoSense
              </span>
              <span className="text-[11px] font-medium text-slate-500">
                Clinical Telemetry Portal
              </span>
            </div>
          </div>
        </div>

        {/* User Info & Role Switcher */}
        <div className="p-4 mx-3 my-3 bg-slate-50 border border-slate-200/80 rounded-xl space-y-2.5">
          <div className="flex items-start justify-between">
            <div className="space-y-0.5 overflow-hidden">
              <p className="text-xs font-semibold text-slate-900 truncate">
                {currentUser?.fullName || "Authenticated User"}
              </p>
              <p className="text-[11px] text-slate-500 truncate">
                {currentUser?.email || currentUser?.department || "Medical Staff"}
              </p>
            </div>
          </div>

          <div className="pt-2 border-t border-slate-200">
            <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
              Active Role Gateway
            </label>
            <select
              value={role}
              onChange={handleRoleSwitch}
              className="w-full text-xs font-medium border border-slate-300 rounded-md py-1.5 px-2 bg-white text-slate-800 focus:ring-1 focus:ring-[#0F766E] focus:outline-none"
            >
              <option value="doctor">Doctor / Clinician</option>
              <option value="patient">Patient Workspace</option>
              <option value="admin">System Administrator</option>
            </select>
          </div>
        </div>

        {/* Navigation Items */}
        <nav className="flex-1 px-3 py-2 space-y-1 overflow-y-auto">
          <div className="px-3 py-1.5 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
            {role.toUpperCase()} WORKSPACE
          </div>
          {navItems.map((item) => {
            const isActive =
              pathname === item.href || pathname.startsWith(item.href + "/");
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all group",
                  isActive
                    ? "bg-[#0F766E] text-white shadow-xs"
                    : "text-slate-600 hover:bg-slate-100/80 hover:text-slate-900"
                )}
              >
                <item.icon
                  className={cn(
                    "h-4 w-4 shrink-0 transition-colors",
                    isActive ? "text-white" : "text-slate-400 group-hover:text-slate-600"
                  )}
                />
                <span className="flex-1">{item.name}</span>
                {isActive && <ChevronRight className="h-3.5 w-3.5 text-teal-200" />}
              </Link>
            );
          })}
        </nav>

        {/* Design System Link & Footer */}
        <div className="p-3 border-t border-slate-100 space-y-1">
          <Link
            href="/design-system"
            className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium text-slate-500 hover:bg-slate-100 hover:text-slate-900 transition-colors"
          >
            <Sliders className="h-3.5 w-3.5" />
            <span>Design System & Tokens (W0)</span>
          </Link>
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium text-red-600 hover:bg-red-50 transition-colors"
          >
            <LogOut className="h-3.5 w-3.5" />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>
    </>
  );
}

