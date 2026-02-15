"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ADMIN_NAV_ITEMS } from "../_config/nav";
import { LogoutButton } from "../LogoutButton";

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="flex w-56 flex-col border-r border-zinc-200 bg-white">
      <div className="border-b border-zinc-200 p-4">
        <Link
          href="/admin"
          className="text-lg font-semibold text-zinc-900 hover:text-zinc-700"
        >
          CMS
        </Link>
      </div>
      <nav className="flex-1 space-y-0.5 p-3">
        {ADMIN_NAV_ITEMS.map(({ href, label }) => {
          const isActive =
            href === "/admin"
              ? pathname === "/admin" || pathname.startsWith("/admin/content")
              : pathname === href || pathname.startsWith(href + "/");
          return (
            <Link
              key={href}
              href={href}
              className={`block rounded-md px-3 py-2 text-sm font-medium transition-colors ${
                isActive
                  ? "bg-zinc-100 text-zinc-900"
                  : "text-zinc-600 hover:bg-zinc-50 hover:text-zinc-900"
              }`}
            >
              {label}
            </Link>
          );
        })}
      </nav>
      <div className="border-t border-zinc-200 p-3">
        <LogoutButton />
      </div>
    </aside>
  );
}
