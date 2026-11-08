"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "./AuthProvider";
import { ROLE_HOME } from "@/lib/services/auth-contract";

export function DashboardRedirect() {
  const { user, status, error, refresh } = useAuth();
  const router = useRouter();
  React.useEffect(() => {
    if (status === "authenticated" && user) router.replace(ROLE_HOME[user.role]);
    if (status === "unauthenticated") router.replace("/login");
  }, [user, status, router]);
  return status === "error"
    ? <div role="alert" className="p-8 text-center"><p>{error}</p><button onClick={() => void refresh()}>Retry</button></div>
    : <p role="status" className="p-8 text-center">Opening your dashboard...</p>;
}
