"use client";

import { usePathname } from "next/navigation";
import { Sidebar } from "./Sidebar";

export function AdminShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isLogin = pathname === "/admin/login";
  // Builder gets a full-screen layout (no sidebar)
  const isBuilder = pathname.includes("/builder");

  if (isLogin || isBuilder) {
    return <>{children}</>;
  }

  return (
    <div className="flex min-h-screen bg-zinc-100/90">
      <Sidebar />
      <main className="min-w-0 flex-1 overflow-auto">{children}</main>
    </div>
  );
}
