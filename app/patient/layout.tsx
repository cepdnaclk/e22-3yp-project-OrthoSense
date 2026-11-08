import { RequireAuth } from "@/components/auth/RequireAuth";

export default function PatientLayout({ children }: { children: React.ReactNode }) {
  return <RequireAuth roles={["patient"]}>{children}</RequireAuth>;
}
