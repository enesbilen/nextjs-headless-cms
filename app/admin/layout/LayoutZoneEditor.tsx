import { addWidgetAction, removeWidgetAction, updateWidgetAction } from "./actions";
import { AdminCard } from "../_components/AdminCard";
import type { LayoutZoneKey } from "@/core/layout/types";
import type { WidgetPlacementData } from "@/core/layout/types";
import type { WidgetDefinition } from "@/core/layout/types";
import { getWidgetDefinition } from "@/core/layout/widget-registry";

type Menu = { id: string; name: string; slug: string };

type Props = {
  zoneKey: LayoutZoneKey;
  widgets: WidgetPlacementData[];
  menus: Menu[];
  widgetTypes: WidgetDefinition[];
};

const WIDGET_ICONS: Record<string, React.ReactNode> = {
  menu: (
    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
    </svg>
  ),
  logo: (
    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
    </svg>
  ),
  html: (
    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
    </svg>
  ),
};

export function LayoutZoneEditor({
  zoneKey,
  widgets,
  menus,
  widgetTypes,
}: Props) {
  return (
    <div className="space-y-6">
      {/* Widget ekleme */}
      <AdminCard className="p-5">
        <form action={addWidgetAction.bind(null, zoneKey)} className="flex flex-wrap items-end gap-3">
          <label className="flex-1 min-w-[200px]">
            <span className="mb-1 block text-xs font-semibold text-zinc-500 uppercase tracking-wider">Widget Ekle</span>
            <select
              name="widgetType"
              required
              className="w-full rounded-lg border border-zinc-300 bg-white px-3 py-2.5 text-sm shadow-sm transition-colors focus:border-zinc-500 focus:outline-none focus:ring-1 focus:ring-zinc-500"
            >
              {widgetTypes.map((w) => (
                <option key={w.type} value={w.type}>
                  {w.name} — {w.description}
                </option>
              ))}
            </select>
          </label>
          <button
            type="submit"
            className="rounded-lg bg-zinc-900 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition-all hover:bg-zinc-800 hover:shadow-md"
          >
            Ekle
          </button>
        </form>
      </AdminCard>

      {/* Widget listesi */}
      <div>
        <h3 className="mb-3 text-sm font-semibold text-zinc-500 uppercase tracking-wider">
          Yerleşim ({widgets.length})
        </h3>
        {widgets.length === 0 ? (
          <AdminCard className="p-8">
            <div className="flex flex-col items-center text-center">
              <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-zinc-100">
                <svg className="h-6 w-6 text-zinc-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                </svg>
              </div>
              <p className="text-sm font-medium text-zinc-600">Henüz widget eklenmemiş</p>
              <p className="mt-1 text-xs text-zinc-400">Yukarıdaki formdan widget ekleyerek başlayın</p>
            </div>
          </AdminCard>
        ) : (
          <div className="space-y-3">
            {widgets.map((w, index) => (
              <AdminCard key={w.id} className="overflow-hidden">
                <div className="flex items-center gap-4 p-4">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-zinc-100 text-zinc-500">
                    {WIDGET_ICONS[w.widgetType] ?? (
                      <span className="text-xs font-bold">{index + 1}</span>
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <span className="text-sm font-semibold text-zinc-800">
                      {getWidgetDefinition(w.widgetType)?.name ?? w.widgetType}
                    </span>
                    {w.widgetType === "menu" && (
                      <p className="truncate text-xs text-zinc-500">
                        {menus.find((m) => m.id === (w.config?.menuId as string))?.name ?? "Menü seçilmedi"}
                      </p>
                    )}
                    {w.widgetType === "html" && (
                      <p className="truncate text-xs text-zinc-500">
                        {(w.config?.content as string)?.slice(0, 80) || "Boş"}
                      </p>
                    )}
                    {w.widgetType === "logo" && (
                      <p className="text-xs text-zinc-500">Ayarlardan logo gösterilir</p>
                    )}
                  </div>
                  <form action={removeWidgetAction}>
                    <input type="hidden" name="widgetId" value={w.id} />
                    <input type="hidden" name="zoneKey" value={zoneKey} />
                    <button
                      type="submit"
                      className="rounded-lg p-2 text-zinc-400 transition-colors hover:bg-red-50 hover:text-red-500"
                      title="Kaldır"
                    >
                      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </form>
                </div>

                {/* Config area */}
                {(w.widgetType === "menu" || w.widgetType === "html") && (
                  <div className="border-t border-zinc-100 bg-zinc-50/50 p-4">
                    <form action={updateWidgetAction} className="flex flex-wrap items-end gap-3">
                      <input type="hidden" name="widgetId" value={w.id} />
                      <input type="hidden" name="zoneKey" value={zoneKey} />
                      <input type="hidden" name="widgetType" value={w.widgetType} />

                      {w.widgetType === "menu" && (
                        <label className="flex-1 min-w-[200px]">
                          <span className="mb-1 block text-xs font-medium text-zinc-500">Menü</span>
                          <select
                            name="menuId"
                            defaultValue={(w.config?.menuId as string) ?? ""}
                            className="w-full rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm"
                          >
                            <option value="">-- Seçin --</option>
                            {menus.map((m) => (
                              <option key={m.id} value={m.id}>{m.name}</option>
                            ))}
                          </select>
                        </label>
                      )}

                      {w.widgetType === "html" && (
                        <label className="w-full">
                          <span className="mb-1 block text-xs font-medium text-zinc-500">HTML</span>
                          <textarea
                            name="content"
                            defaultValue={(w.config?.content as string) ?? ""}
                            rows={3}
                            className="w-full rounded-lg border border-zinc-200 bg-white px-3 py-2 font-mono text-sm"
                          />
                        </label>
                      )}

                      <button
                        type="submit"
                        className="rounded-lg border border-zinc-300 bg-white px-4 py-2 text-sm font-medium text-zinc-700 shadow-sm transition-all hover:bg-zinc-50 hover:shadow"
                      >
                        Kaydet
                      </button>
                    </form>
                  </div>
                )}
              </AdminCard>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
