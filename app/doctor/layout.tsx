import { RequireAuth } from "@/components/auth/RequireAuth";

export default function DoctorLayout({ children }: { children: React.ReactNode }) {
  return <RequireAuth roles={["doctor"]}>{children}</RequireAuth>;
}
