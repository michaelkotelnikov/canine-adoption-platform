import { AdminGate } from "@/features/admin/admin-gate";

export default function AdminPortalLayout({ children }: { children: React.ReactNode }) {
  return <AdminGate>{children}</AdminGate>;
}
