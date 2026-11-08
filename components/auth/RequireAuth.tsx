"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import type { UserRole } from "@/lib/types";
import { ROLE_HOME } from "@/lib/services/auth-contract";
import { useAuth } from "./AuthProvider";

export function RequireAuth({ roles, children }: { roles: UserRole[]; children: React.ReactNode }) {
  const { user, status, error, refresh } = useAuth();
  const router = useRouter();

  React.useEffect(() => {
    if (status === "unauthenticated") router.replace("/login");
  }, [status, router]);

  if (status === "error") {
    return <div role="alert" className="p-8 space-y-4 text-center"><p>{error}</p><button onClick={() => void refresh()} className="text-teal-700 underline">Retry session check</button></div>;
  }
  if (status !== "authenticated" || !user) {
    return <div role="status" className="p-8 text-center">Checking your session...</div>;
  }
  if (!roles.includes(user.role)) {
    return <div role="alert" className="p-8 space-y-4 text-center"><h1 className="text-xl font-bold">Access denied</h1><p>Your account cannot open this workspace.</p><Link href={ROLE_HOME[user.role]} className="text-teal-700 underline">Return to your workspace</Link></div>;
  }
  return children;
}
