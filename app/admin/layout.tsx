import { AdminGuard } from "./AdminGuard";
import { AdminShell } from "./_components/AdminShell";
import { getSession } from "@/core/session";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getSession();
  return (
    <AdminGuard hasUser={!!session.userId}>
      <AdminShell>{children}</AdminShell>
    </AdminGuard>
  );
}
