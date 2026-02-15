import { db } from "@/core/db";
import Link from "next/link";
import { AdminContent } from "./_components/AdminContent";
import { AdminPageHeader } from "./_components/AdminPageHeader";
import { AdminCard } from "./_components/AdminCard";

export default async function AdminDashboardPage() {
  const contents = await db.page.findMany({
    orderBy: { updatedAt: "desc" },
    select: { id: true, title: true, slug: true, status: true, updatedAt: true },
  });

  return (
    <AdminContent maxWidth="4xl">
      <AdminPageHeader
        title="İçerikler"
        actions={
          <Link
            href="/admin/content/new"
            className="rounded bg-zinc-800 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-700"
          >
            Yeni yazı
          </Link>
        }
      />

      <AdminCard className="overflow-hidden">
        <table className="w-full text-left">
          <thead className="border-b border-zinc-200 bg-zinc-50">
            <tr>
              <th className="px-4 py-3 text-sm font-medium">Başlık</th>
              <th className="px-4 py-3 text-sm font-medium">Slug</th>
              <th className="px-4 py-3 text-sm font-medium">Durum</th>
              <th className="px-4 py-3 text-sm font-medium">Güncellenme</th>
              <th className="px-4 py-3 text-sm font-medium"></th>
            </tr>
          </thead>
          <tbody>
            {contents.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-zinc-500">
                  Henüz içerik yok. Yeni yazı ekleyin.
                </td>
              </tr>
            ) : (
              contents.map((c) => (
                <tr key={c.id} className="border-b border-zinc-100 hover:bg-zinc-50">
                  <td className="px-4 py-3 font-medium">{c.title}</td>
                  <td className="px-4 py-3 text-zinc-600">{c.slug}</td>
                  <td className="px-4 py-3">
                    <span
                      className={
                        c.status === "PUBLISHED"
                          ? "rounded bg-green-100 px-2 py-0.5 text-xs text-green-800"
                          : "rounded bg-zinc-200 px-2 py-0.5 text-xs text-zinc-600"
                      }
                    >
                      {c.status === "PUBLISHED" ? "Yayında" : "Taslak"}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm text-zinc-500">
                    {new Date(c.updatedAt).toLocaleDateString("tr-TR")}
                  </td>
                  <td className="px-4 py-3">
                    <Link
                      href={`/admin/content/${c.id}`}
                      className="text-sm font-medium text-zinc-800 hover:underline"
                    >
                      Düzenle
                    </Link>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </AdminCard>
    </AdminContent>
  );
}
