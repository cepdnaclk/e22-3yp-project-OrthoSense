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
  ChevronRight,
  TrendingUp,
  UserCircle,
} from "lucide-react";
import { User, UserRole } from "@/lib/types";
import { useAuth } from "@/components/auth/AuthProvider";

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
    { name: "My Profile", href: "/patient/profile", icon: UserCircle },
  ],
};

export function Navigation({
  currentUser,
}: {
  currentUser: User;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const { logout } = useAuth();
  const [logoutError, setLogoutError] = React.useState("");
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);

  const role = currentUser.role;
  const navItems = NAV_ITEMS_BY_ROLE[role] || [];

  const handleLogout = async () => {
    setLogoutError("");
    try {
      await logout();
      router.replace("/login");
    } catch {
      setLogoutError("Sign out failed. Check your connection and retry.");
    }
  };

  return (
    <>
      {logoutError && <p role="alert" className="fixed top-2 right-2 z-[60] rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">{logoutError}</p>}
      {/* Mobile Top Bar */}
      <header className="lg:hidden flex items-center justify-between px-4 py-2.5 bg-[#2E3A42] border-b border-slate-700/60 sticky top-0 z-40">
        <Link href="/" className="flex items-center gap-2 focus:outline-hidden">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/images/orthosense-logo.png"
            alt="OrthoSense Logo"
            className="h-7 w-auto object-contain drop-shadow-[0_1px_3px_rgba(0,0,0,0.4)]"
          />
        </Link>
        <div className="flex items-center gap-2">
          <span className="text-xs uppercase font-mono px-2 py-0.5 rounded bg-teal-500/20 text-teal-200 border border-teal-500/30 font-semibold">
            {role}
          </span>
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle Navigation Menu"
            className="p-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-slate-700/50"
          >
            {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </header>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="lg:hidden fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex flex-col justify-end">
          <div className="bg-white rounded-t-2xl p-6 space-y-4 max-h-[85vh] overflow-y-auto">
            <div className="flex justify-between items-center pb-3 border-b border-slate-100">
              <Link href="/" onClick={() => setMobileMenuOpen(false)}>
                <div className="bg-[#2E3A42] rounded-lg px-3 py-1.5 border border-slate-700/50">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src="/images/orthosense-logo.png"
                    alt="OrthoSense Logo"
                    className="h-7 w-auto object-contain"
                  />
                </div>
              </Link>
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
        <div className="p-4 border-b border-slate-100">
          <Link href="/" className="group block focus:outline-hidden">
            <div className="bg-[#2E3A42] rounded-xl px-3.5 py-2.5 border border-slate-700/60 shadow-xs flex items-center justify-center transition-all duration-200 group-hover:border-teal-500/60 group-hover:shadow-md">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/images/orthosense-logo.png"
                alt="OrthoSense Logo"
                className="h-8.5 w-auto object-contain drop-shadow-[0_2px_6px_rgba(0,0,0,0.5)] transition-transform duration-200 group-hover:scale-[1.02]"
              />
            </div>
          </Link>
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

          <p className="pt-2 border-t border-slate-200 text-xs font-semibold text-teal-700">{role === "doctor" ? "Doctor / Clinician" : role === "admin" ? "System Administrator" : "Patient"}</p>
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

        {/* Navigation Footer */}
        <div className="p-3 border-t border-slate-100 space-y-1">
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

