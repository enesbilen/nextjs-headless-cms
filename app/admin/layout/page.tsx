import Link from "next/link";
import { getManySettings, CMS_SETTING_KEYS } from "@/core/settings-service";
import { getWidgetsForZone } from "@/core/layout/layout-service";
import { getWidgetTypes, getWidgetDefinition } from "@/core/layout/widget-registry";
import { getMenus } from "@/core/menu/menu-service";
import { LAYOUT_ZONES, type LayoutZoneKey } from "@/core/layout/types";
import { getTemplatesForZone, type ZoneMode } from "@/core/layout/templates/template-registry";
import { AdminContent } from "../_components/AdminContent";
import { AdminPageHeader } from "../_components/AdminPageHeader";
import { AdminCard } from "../_components/AdminCard";
import { LayoutZoneEditor } from "./LayoutZoneEditor";
import { TemplatePicker } from "./TemplatePicker";
import { setZoneMode } from "./actions";

const ZONE_LABELS: Record<LayoutZoneKey, string> = {
  header: "Header",
  footer: "Footer",
};

const ZONE_ICONS: Record<LayoutZoneKey, string> = {
  header: "H",
  footer: "F",
};

const MODE_LABELS: Record<ZoneMode, { label: string; desc: string }> = {
  template: { label: "Şablon", desc: "Hazır tasarımlardan seç" },
  builder: { label: "Builder", desc: "Sayfa editörü ile özelleştir" },
  widgets: { label: "Widget", desc: "Modüler widget bileşenleri" },
};

export default async function LayoutPage({
  searchParams,
}: {
  searchParams: Promise<{ zone?: string; error?: string }>;
}) {
  const { zone: zoneParam } = await searchParams;
  const currentZone =
    zoneParam && LAYOUT_ZONES.includes(zoneParam as LayoutZoneKey)
      ? (zoneParam as LayoutZoneKey)
      : "header";

  const [widgets, menus, settings] = await Promise.all([
    getWidgetsForZone(currentZone),
    getMenus(),
    getManySettings([
      CMS_SETTING_KEYS.HEADER_MODE,
      CMS_SETTING_KEYS.HEADER_TEMPLATE_ID,
      CMS_SETTING_KEYS.HEADER_PAGE_ID,
      CMS_SETTING_KEYS.FOOTER_MODE,
      CMS_SETTING_KEYS.FOOTER_TEMPLATE_ID,
      CMS_SETTING_KEYS.FOOTER_PAGE_ID,
    ]),
  ]);

  const widgetTypes = getWidgetTypes();
  const templates = getTemplatesForZone(currentZone);

  const modeKey = currentZone === "header" ? CMS_SETTING_KEYS.HEADER_MODE : CMS_SETTING_KEYS.FOOTER_MODE;
  const templateKey = currentZone === "header" ? CMS_SETTING_KEYS.HEADER_TEMPLATE_ID : CMS_SETTING_KEYS.FOOTER_TEMPLATE_ID;
  const pageKey = currentZone === "header" ? CMS_SETTING_KEYS.HEADER_PAGE_ID : CMS_SETTING_KEYS.FOOTER_PAGE_ID;

  const currentMode = (settings[modeKey] as ZoneMode | null) ?? "template";
  const currentTemplateId = settings[templateKey] ?? (currentZone === "header" ? "classic" : "simple-footer");
  const currentPageId = settings[pageKey] ?? null;

  return (
    <AdminContent>
      <AdminPageHeader
        title="Düzen Yönetimi"
        backHref="/admin"
        backLabel="Panel"
      />

      {/* Zone tabs */}
      <div className="mb-8 flex gap-2">
        {LAYOUT_ZONES.map((key) => (
          <Link
            key={key}
            href={`/admin/layout?zone=${key}`}
            className={`group flex items-center gap-2.5 rounded-xl border px-5 py-3 text-sm font-medium transition-all ${
              currentZone === key
                ? "border-zinc-900 bg-zinc-900 text-white shadow-lg shadow-zinc-900/20"
                : "border-zinc-200 bg-white text-zinc-600 hover:border-zinc-300 hover:shadow-sm"
            }`}
          >
            <span className={`flex h-7 w-7 items-center justify-center rounded-lg text-xs font-bold ${
              currentZone === key ? "bg-white/20 text-white" : "bg-zinc-100 text-zinc-500 group-hover:bg-zinc-200"
            }`}>
              {ZONE_ICONS[key]}
            </span>
            {ZONE_LABELS[key]}
          </Link>
        ))}
      </div>

      {/* Mode selector */}
      <div className="mb-8">
        <h2 className="mb-3 text-sm font-semibold text-zinc-500 uppercase tracking-wider">Mod</h2>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          {(["template", "builder", "widgets"] as ZoneMode[]).map((mode) => (
            <form key={mode} action={setZoneMode}>
              <input type="hidden" name="zone" value={currentZone} />
              <input type="hidden" name="mode" value={mode} />
              <button
                type="submit"
                className={`w-full rounded-xl border-2 p-4 text-left transition-all ${
                  currentMode === mode
                    ? "border-zinc-900 bg-zinc-50 shadow-sm"
                    : "border-zinc-200 bg-white hover:border-zinc-300 hover:shadow-sm"
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${
                    currentMode === mode ? "bg-zinc-900 text-white" : "bg-zinc-100 text-zinc-400"
                  }`}>
                    {mode === "template" && (
                      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z" />
                      </svg>
                    )}
                    {mode === "builder" && (
                      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" />
                      </svg>
                    )}
                    {mode === "widgets" && (
                      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                      </svg>
                    )}
                  </div>
                  <div>
                    <div className={`text-sm font-semibold ${currentMode === mode ? "text-zinc-900" : "text-zinc-700"}`}>
                      {MODE_LABELS[mode].label}
                    </div>
                    <div className="text-xs text-zinc-500">{MODE_LABELS[mode].desc}</div>
                  </div>
                </div>
                {currentMode === mode && (
                  <div className="mt-2 flex items-center gap-1.5">
                    <div className="h-1.5 w-1.5 rounded-full bg-green-500" />
                    <span className="text-xs font-medium text-green-700">Aktif</span>
                  </div>
                )}
              </button>
            </form>
          ))}
        </div>
      </div>

      {/* Mode-specific content */}
      {currentMode === "template" && (
        <TemplatePicker
          zoneKey={currentZone}
          templates={templates}
          currentTemplateId={currentTemplateId}
        />
      )}

      {currentMode === "builder" && (
        <AdminCard className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-semibold text-zinc-900">Page Builder</h3>
              <p className="mt-1 text-sm text-zinc-500">
                {currentPageId
                  ? "Atanmış sayfa builder ile düzenleniyor."
                  : "Ayarlar sayfasından bir header/footer sayfası atayın."}
              </p>
            </div>
            {currentPageId ? (
              <Link
                href={`/admin/content/${currentPageId}/builder`}
                className="rounded-lg bg-zinc-900 px-4 py-2 text-sm font-semibold text-white shadow-sm transition-all hover:bg-zinc-800 hover:shadow-md"
              >
                Builder'da Aç
              </Link>
            ) : (
              <Link
                href="/admin/settings"
                className="rounded-lg border border-zinc-300 px-4 py-2 text-sm font-medium text-zinc-700 transition-all hover:bg-zinc-50"
              >
                Ayarlar'a Git
              </Link>
            )}
          </div>
        </AdminCard>
      )}

      {currentMode === "widgets" && (
        <LayoutZoneEditor
          zoneKey={currentZone}
          widgets={widgets}
          menus={menus}
          widgetTypes={widgetTypes}
        />
      )}
    </AdminContent>
  );
}
