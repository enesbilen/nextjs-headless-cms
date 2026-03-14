import type { LayoutZoneKey } from "@/core/layout/types";
import type { LayoutTemplate } from "@/core/layout/templates/template-registry";
import { setZoneTemplate } from "./actions";

type Props = {
  zoneKey: LayoutZoneKey;
  templates: LayoutTemplate[];
  currentTemplateId: string;
};

function TemplatePreview({ preview }: { preview: LayoutTemplate["preview"] }) {
  if (preview === "classic") {
    return (
      <div className="flex h-full flex-col">
        <div className="flex items-center justify-between border-b border-zinc-200 bg-white px-4 py-3">
          <div className="flex items-center gap-2">
            <div className="h-5 w-5 rounded bg-zinc-800" />
            <div className="h-2.5 w-16 rounded bg-zinc-700" />
          </div>
          <div className="flex items-center gap-3">
            <div className="h-2 w-10 rounded bg-zinc-300" />
            <div className="h-2 w-10 rounded bg-zinc-300" />
            <div className="h-2 w-10 rounded bg-zinc-300" />
            <div className="h-5 w-14 rounded bg-zinc-800" />
          </div>
        </div>
        <div className="flex-1 bg-zinc-50" />
      </div>
    );
  }
  if (preview === "centered") {
    return (
      <div className="flex h-full flex-col">
        <div className="flex flex-col items-center border-b border-zinc-200 bg-white px-4 py-3">
          <div className="mb-2 flex items-center gap-2">
            <div className="h-6 w-6 rounded bg-zinc-800" />
            <div className="h-3 w-20 rounded bg-zinc-700" />
          </div>
          <div className="flex items-center gap-3">
            <div className="h-2 w-8 rounded-full bg-zinc-300" />
            <div className="h-2 w-8 rounded-full bg-zinc-300" />
            <div className="h-2 w-8 rounded-full bg-zinc-300" />
            <div className="h-4 w-12 rounded-full bg-zinc-800" />
          </div>
        </div>
        <div className="flex-1 bg-zinc-50" />
      </div>
    );
  }
  if (preview === "split") {
    return (
      <div className="flex h-full flex-col">
        <div className="flex items-center justify-between bg-zinc-900 px-4 py-3">
          <div className="flex items-center gap-2">
            <div className="h-5 w-5 rounded bg-white/30" />
            <div className="h-2.5 w-14 rounded bg-white/50" />
          </div>
          <div className="flex items-center gap-3">
            <div className="h-2 w-8 rounded bg-white/30" />
            <div className="h-2 w-8 rounded bg-white/30" />
            <div className="h-2 w-8 rounded bg-white/30" />
          </div>
          <div className="h-5 w-14 rounded bg-white" />
        </div>
        <div className="flex-1 bg-zinc-50" />
      </div>
    );
  }
  if (preview === "simple-footer") {
    return (
      <div className="flex h-full flex-col">
        <div className="flex-1 bg-zinc-50" />
        <div className="flex flex-col items-center border-t border-zinc-200 bg-white px-4 py-3">
          <div className="mb-2 h-4 w-4 rounded bg-zinc-800" />
          <div className="mb-1 flex gap-3">
            <div className="h-1.5 w-8 rounded bg-zinc-300" />
            <div className="h-1.5 w-8 rounded bg-zinc-300" />
            <div className="h-1.5 w-8 rounded bg-zinc-300" />
          </div>
          <div className="h-1.5 w-24 rounded bg-zinc-200" />
        </div>
      </div>
    );
  }
  if (preview === "columns-footer") {
    return (
      <div className="flex h-full flex-col">
        <div className="flex-1 bg-zinc-50" />
        <div className="bg-zinc-900 px-4 py-3">
          <div className="grid grid-cols-4 gap-2">
            <div>
              <div className="mb-1 h-3 w-8 rounded bg-white/30" />
              <div className="h-1.5 w-full rounded bg-white/10" />
            </div>
            <div className="space-y-1">
              <div className="h-1.5 w-8 rounded bg-white/20" />
              <div className="h-1.5 w-6 rounded bg-white/20" />
            </div>
            <div className="space-y-1">
              <div className="h-1.5 w-8 rounded bg-white/20" />
              <div className="h-1.5 w-6 rounded bg-white/20" />
            </div>
            <div className="space-y-1">
              <div className="h-1.5 w-8 rounded bg-white/20" />
              <div className="h-1.5 w-6 rounded bg-white/20" />
            </div>
          </div>
          <div className="mt-2 border-t border-white/10 pt-1.5">
            <div className="mx-auto h-1.5 w-20 rounded bg-white/10" />
          </div>
        </div>
      </div>
    );
  }
  return null;
}

export function TemplatePicker({ zoneKey, templates, currentTemplateId }: Props) {
  return (
    <div>
      <h2 className="mb-4 text-sm font-semibold text-zinc-500 uppercase tracking-wider">
        Şablon Seç
      </h2>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {templates.map((tpl) => {
          const isActive = tpl.id === currentTemplateId;
          return (
            <form key={tpl.id} action={setZoneTemplate}>
              <input type="hidden" name="zone" value={zoneKey} />
              <input type="hidden" name="templateId" value={tpl.id} />
              <button
                type="submit"
                className={`group w-full overflow-hidden rounded-xl border-2 text-left transition-all ${
                  isActive
                    ? "border-zinc-900 shadow-lg shadow-zinc-900/10 ring-1 ring-zinc-900"
                    : "border-zinc-200 hover:border-zinc-400 hover:shadow-md"
                }`}
              >
                <div className="relative h-32 overflow-hidden bg-zinc-100">
                  <TemplatePreview preview={tpl.preview} />
                  {isActive && (
                    <div className="absolute right-2 top-2 flex h-6 w-6 items-center justify-center rounded-full bg-zinc-900 text-white shadow-lg">
                      <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                  )}
                </div>
                <div className="p-3">
                  <div className="flex items-center justify-between">
                    <span className={`text-sm font-semibold ${isActive ? "text-zinc-900" : "text-zinc-700"}`}>
                      {tpl.name}
                    </span>
                    {isActive && (
                      <span className="rounded-full bg-green-100 px-2 py-0.5 text-[10px] font-semibold text-green-700">
                        Aktif
                      </span>
                    )}
                  </div>
                  <p className="mt-0.5 text-xs text-zinc-500">{tpl.description}</p>
                </div>
              </button>
            </form>
          );
        })}
      </div>
    </div>
  );
}
