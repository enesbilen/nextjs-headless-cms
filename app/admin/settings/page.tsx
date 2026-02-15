import { db } from "@/core/db";
import {
  getManySettings,
  CMS_SETTING_KEYS,
} from "@/core/settings-service";
import { updateSettings } from "./actions";
import { AdminContent } from "../_components/AdminContent";
import { AdminPageHeader } from "../_components/AdminPageHeader";
import { AdminCard } from "../_components/AdminCard";

type PageProps = {
  searchParams: Promise<{ saved?: string; error?: string }>;
};

const ERROR_MESSAGES: Record<string, string> = {
  same_page: "Anasayfa ve 404 sayfası aynı olamaz.",
  invalid_homepage: "Seçilen anasayfa bulunamadı veya yayında değil.",
  invalid_notfound: "Seçilen 404 sayfası bulunamadı veya yayında değil.",
};

export default async function AdminSettingsPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const settings = await getManySettings([
    CMS_SETTING_KEYS.SITE_TITLE,
    CMS_SETTING_KEYS.SITE_DESCRIPTION,
    CMS_SETTING_KEYS.SITE_LOGO_URL,
    CMS_SETTING_KEYS.HOMEPAGE_ID,
    CMS_SETTING_KEYS.NOTFOUND_PAGE_ID,
  ]);

  const pages = await db.page.findMany({
    where: { status: "PUBLISHED" },
    select: { id: true, title: true },
    orderBy: { title: "asc" },
  }) as { id: string; title: string }[];

  return (
    <AdminContent maxWidth="3xl">
      <AdminPageHeader title="Ayarlar" backHref="/admin" backLabel="İçerikler" />

      {params.saved === "1" && (
        <p className="mb-4 rounded-lg border border-green-200 bg-green-50 px-4 py-2 text-sm text-green-800">
          Ayarlar kaydedildi
        </p>
      )}

      {params.error && ERROR_MESSAGES[params.error] && (
        <p className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-2 text-sm text-red-800">
          {ERROR_MESSAGES[params.error]}
        </p>
      )}

      <AdminCard>
        <form action={updateSettings} className="space-y-4 p-6">
        <label className="block">
          <span className="text-sm font-medium">Site başlığı</span>
          <input
            type="text"
            name="site_title"
            defaultValue={settings[CMS_SETTING_KEYS.SITE_TITLE] ?? ""}
            className="mt-1 w-full rounded border border-zinc-300 px-3 py-2"
          />
        </label>

        <label className="block">
          <span className="text-sm font-medium">Site açıklaması</span>
          <textarea
            name="site_description"
            rows={3}
            defaultValue={settings[CMS_SETTING_KEYS.SITE_DESCRIPTION] ?? ""}
            className="mt-1 w-full rounded border border-zinc-300 px-3 py-2"
          />
        </label>

        <label className="block">
          <span className="text-sm font-medium">Logo URL</span>
          <input
            type="text"
            name="site_logo_url"
            defaultValue={settings[CMS_SETTING_KEYS.SITE_LOGO_URL] ?? ""}
            className="mt-1 w-full rounded border border-zinc-300 px-3 py-2"
          />
        </label>

        <label className="block">
          <span className="text-sm font-medium">Anasayfa</span>
          <select
            name="homepage_id"
            defaultValue={settings[CMS_SETTING_KEYS.HOMEPAGE_ID] ?? ""}
            className="mt-1 w-full rounded border border-zinc-300 px-3 py-2"
          >
            <option value="">-- None --</option>
            {pages.map((p) => (
              <option key={p.id} value={p.id}>
                {p.title}
              </option>
            ))}
          </select>
        </label>

        <label className="block">
          <span className="text-sm font-medium">404 sayfası</span>
          <select
            name="notfound_page_id"
            defaultValue={settings[CMS_SETTING_KEYS.NOTFOUND_PAGE_ID] ?? ""}
            className="mt-1 w-full rounded border border-zinc-300 px-3 py-2"
          >
            <option value="">-- None --</option>
            {pages.map((p) => (
              <option key={p.id} value={p.id}>
                {p.title}
              </option>
            ))}
          </select>
        </label>

        <div className="pt-2">
          <button
            type="submit"
            className="rounded bg-zinc-800 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-700"
          >
            Save Settings
          </button>
        </div>
        </form>
      </AdminCard>
    </AdminContent>
  );
}
