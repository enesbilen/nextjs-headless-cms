import Link from "next/link";
import { db } from "@/core/db";
import {
  getManySettings,
  CMS_SETTING_KEYS,
} from "@/core/settings-service";
import { AdminContent } from "../_components/AdminContent";
import { AdminPageHeader } from "../_components/AdminPageHeader";
import { AdminCard } from "../_components/AdminCard";

export default async function AdminSystemPagesPage() {
  const settings = await getManySettings([
    CMS_SETTING_KEYS.HEADER_PAGE_ID,
    CMS_SETTING_KEYS.FOOTER_PAGE_ID,
    CMS_SETTING_KEYS.NOTFOUND_PAGE_ID,
  ]);

  const headerId = settings[CMS_SETTING_KEYS.HEADER_PAGE_ID] ?? null;
  const footerId = settings[CMS_SETTING_KEYS.FOOTER_PAGE_ID] ?? null;
  const notfoundId = settings[CMS_SETTING_KEYS.NOTFOUND_PAGE_ID] ?? null;

  const ids = [headerId, footerId, notfoundId].filter(
    (id): id is string => !!id
  );
  const pages =
    ids.length > 0
      ? await db.page.findMany({
          where: { id: { in: ids } },
          select: { id: true, title: true },
        })
      : [];

  const pageById = Object.fromEntries(pages.map((p) => [p.id, p]));

  const headerPage = headerId ? pageById[headerId] : null;
  const footerPage = footerId ? pageById[footerId] : null;
  const notfoundPage = notfoundId ? pageById[notfoundId] : null;

  const rows: { key: string; label: string; page: { id: string; title: string } | null }[] = [
    { key: "header", label: "Header", page: headerPage ?? null },
    { key: "footer", label: "Footer", page: footerPage ?? null },
    { key: "404", label: "404 sayfası", page: notfoundPage ?? null },
  ];

  return (
    <AdminContent maxWidth="3xl">
      <AdminPageHeader
        title="Sistem sayfaları"
        backHref="/admin"
        backLabel="İçerikler"
      />

      <p className="mb-4 text-sm text-zinc-600">
        Header, Footer ve 404 sayfalarını page builder ile tasarlayabilirsiniz.
        Sayfa ataması <Link href="/admin/settings" className="text-zinc-800 underline hover:no-underline">Ayarlar</Link> üzerinden yapılır.
      </p>

      <div className="space-y-4">
        {rows.map(({ key, label, page }) => (
          <AdminCard key={key} className="p-6">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h2 className="text-base font-semibold text-zinc-900">{label}</h2>
                <p className="mt-1 text-sm text-zinc-600">
                  {page ? (
                    <>Atanmış sayfa: <span className="font-medium text-zinc-800">{page.title}</span></>
                  ) : (
                    <>Henüz atanmadı</>
                  )}
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                {page ? (
                  <>
                    <Link
                      href={`/admin/content/${page.id}/builder`}
                      className="rounded bg-zinc-800 px-3 py-2 text-sm font-medium text-white hover:bg-zinc-700"
                    >
                      Düzenle
                    </Link>
                    <Link
                      href={`/admin/content/${page.id}/preview`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="rounded border border-zinc-300 bg-white px-3 py-2 text-sm font-medium text-zinc-700 hover:bg-zinc-50"
                    >
                      Önizle
                    </Link>
                  </>
                ) : null}
                <Link
                  href="/admin/settings"
                  className="rounded border border-zinc-300 bg-white px-3 py-2 text-sm font-medium text-zinc-700 hover:bg-zinc-50"
                >
                  {page ? "Sayfa değiştir" : "Ayarlardan seç"}
                </Link>
              </div>
            </div>
          </AdminCard>
        ))}
      </div>
    </AdminContent>
  );
}
