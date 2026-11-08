"use client";

import * as React from "react";
import Link from "next/link";
import { Navigation } from "@/components/ui/Navigation";
import { useAuth } from "@/components/auth/AuthProvider";

export function AppShell({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  return (
    <div className="flex min-h-screen flex-col lg:flex-row bg-[#F8FAFC]">
      {user ? <Navigation currentUser={user} /> : <header className="p-4 border-b border-slate-200"><Link href="/login" className="font-semibold text-teal-700">Sign in to OrthoSense</Link></header>}
      <main className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        <div className="flex-1 p-3 sm:p-5 lg:p-6 max-w-[1550px] mx-auto w-full">{children}</div>
      </main>
    </div>
  );
}
