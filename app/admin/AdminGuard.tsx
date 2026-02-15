"use client";

import { usePathname, useRouter } from "next/navigation";
import { useEffect } from "react";

export function AdminGuard({
  hasUser,
  children,
}: {
  hasUser: boolean;
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    if (pathname === "/admin/login") return;
    if (!hasUser) {
      router.replace("/admin/login");
    }
  }, [hasUser, pathname, router]);

  if (pathname === "/admin/login") return <>{children}</>;
  if (!hasUser) return null;
  return <>{children}</>;
}
