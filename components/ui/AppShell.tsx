"use client";

import * as React from "react";
import { usePathname } from "next/navigation";
import { Navigation } from "@/components/ui/Navigation";
import { User, UserRole } from "@/lib/types";
import { authService } from "@/lib/services/auth-service";

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [currentUser, setCurrentUser] = React.useState<User | null>(null);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    let targetRole: UserRole = "doctor";
    if (pathname.startsWith("/patient")) {
      targetRole = "patient";
    } else if (pathname.startsWith("/admin")) {
      targetRole = "admin";
    }

    authService.switchUser(targetRole).then((user) => {
      setCurrentUser(user);
      setLoading(false);
    });
  }, [pathname]);

  const handleRoleChange = async (newRole: UserRole) => {
    const updated = await authService.switchUser(newRole);
    setCurrentUser(updated);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F8FAFC]">
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 rounded-full border-2 border-[#0F766E] border-t-transparent animate-spin"></div>
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
            Loading OrthoSense Portal...
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col lg:flex-row bg-[#F8FAFC]">
      <Navigation currentUser={currentUser} onUserRoleChange={handleRoleChange} />
      <main className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        <div className="flex-1 p-3 sm:p-5 lg:p-6 max-w-[1550px] mx-auto w-full">
          {children}
        </div>
      </main>
    </div>
  );
}
