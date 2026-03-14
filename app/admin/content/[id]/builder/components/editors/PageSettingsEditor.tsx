"use client";

import { useState, useEffect } from "react";
import { useBuilderStore } from "@/core/page-builder/store";
import { getPageRevisions, loadRevision, type PageRevisionItem } from "../../actions";
import { CSSValueInput } from "../CSSValueInput";
import type { PageSettings, PageLayoutPreset, AlignValue } from "@/core/page-builder/types";
import { FieldRow, TextInput, ColorInput, SelectInput, ToggleInput, SectionDivider, BackgroundImageField, AlignButtons } from "../widgets";

export function PageSettingsEditor({ pageId }: { pageId: string }) {
    const { pageSettings, updatePageSettings, loadBlocks } = useBuilderStore();
    const upd = (patch: Partial<PageSettings>) => updatePageSettings(patch);
    const [tab, setTab] = useState<"layout" | "style" | "revizyonlar">("layout");
    const [revisions, setRevisions] = useState<PageRevisionItem[]>([]);
    const [revisionsLoading, setRevisionsLoading] = useState(false);
    const [restoringId, setRestoringId] = useState<string | null>(null);

    useEffect(() => {
        if (tab === "revizyonlar" && pageId) {
            setRevisionsLoading(true);
            getPageRevisions(pageId)
                .then(setRevisions)
                .finally(() => setRevisionsLoading(false));
        }
    }, [tab, pageId]);

    const handleRestoreRevision = async (revisionId: string) => {
        setRestoringId(revisionId);
        try {
            const doc = await loadRevision(pageId, revisionId);
            if (doc) loadBlocks(doc);
        } finally {
            setRestoringId(null);
        }
    };

    return (
        <div className="flex-1 overflow-y-auto p-3 flex flex-col gap-2.5 builder-scrollbar">
            <div className="flex gap-0.5 p-1 bg-slate-900 rounded-lg mb-1">
                <button
                    className={`flex-1 py-[5px] px-2 rounded-md border-none cursor-pointer text-[0.72rem] font-semibold transition-all whitespace-nowrap ${
                        tab === "layout" ? "bg-builder-active text-blue-400" : "bg-transparent text-slate-500 hover:text-slate-200"
                    }`}
                    onClick={() => setTab("layout")}
                >
                    Düzen
                </button>
                <button
                    className={`flex-1 py-[5px] px-2 rounded-md border-none cursor-pointer text-[0.72rem] font-semibold transition-all whitespace-nowrap ${
                        tab === "style" ? "bg-builder-active text-blue-400" : "bg-transparent text-slate-500 hover:text-slate-200"
                    }`}
                    onClick={() => setTab("style")}
                >
                    Stil
                </button>
                <button
                    className={`flex-1 py-[5px] px-2 rounded-md border-none cursor-pointer text-[0.72rem] font-semibold transition-all whitespace-nowrap ${
                        tab === "revizyonlar" ? "bg-builder-active text-blue-400" : "bg-transparent text-slate-500 hover:text-slate-200"
                    }`}
                    onClick={() => setTab("revizyonlar")}
                >
                    Revizyonlar
                </button>
            </div>

            {tab === "layout" && (
                <>
                    <SectionDivider label="Sayfa Düzeni" />
                    <FieldRow label="Düzen modu">
                        <SelectInput<PageLayoutPreset>
                            value={pageSettings.layoutPreset}
                            onChange={(v) => upd({ layoutPreset: v })}
                            options={[
                                { value: "boxed", label: "📦 Boxed (max-width)" },
                                { value: "full-width", label: "↔ Full Width" },
                                { value: "narrow", label: "📃 Narrow (dar sütun)" },
                            ]}
                        />
                    </FieldRow>
                    <FieldRow label="İçerik genişliği">
                        <SelectInput
                            value={
                                ["1400px", "1200px", "1024px", "900px", "760px", "100%"].includes(pageSettings.contentWidth)
                                    ? pageSettings.contentWidth
                                    : "custom"
                            }
                            onChange={(v) => { if (v !== "custom") upd({ contentWidth: v }); }}
                            options={[
                                { value: "1400px", label: "1400px (Geniş)" },
                                { value: "1200px", label: "1200px (Standart)" },
                                { value: "1024px", label: "1024px (Tablet)" },
                                { value: "900px", label: "900px" },
                                { value: "760px", label: "760px (Dar)" },
                                { value: "100%", label: "100% (Tam genişlik)" },
                                { value: "custom", label: "Özel değer" },
                            ]}
                        />
                    </FieldRow>
                    <FieldRow label="Özel genişlik">
                        <CSSValueInput
                            value={pageSettings.contentWidth}
                            onChange={(v) => upd({ contentWidth: v })}
                            units={["px", "%", "rem"]}
                            sliderMax={2000}
                            min={0}
                        />
                    </FieldRow>
                    <FieldRow label="İçerik hizalama">
                        <AlignButtons
                            value={pageSettings.contentAlign ?? "center"}
                            onChange={(v: AlignValue) => upd({ contentAlign: v })}
                        />
                    </FieldRow>
                    <SectionDivider label="Sayfa Boşlukları" />
                    <FieldRow label="Üst padding">
                        <CSSValueInput value={pageSettings.paddingTop ?? 0} onChange={(v) => upd({ paddingTop: parseFloat(v) || 0 })} units={["px", "rem"]} sliderMax={200} />
                    </FieldRow>
                    <FieldRow label="Alt padding">
                        <CSSValueInput value={pageSettings.paddingBottom ?? 0} onChange={(v) => upd({ paddingBottom: parseFloat(v) || 0 })} units={["px", "rem"]} sliderMax={200} />
                    </FieldRow>
                </>
            )}

            {tab === "style" && (
                <>
                    <SectionDivider label="Arkaplan" />
                    <FieldRow label="Arkaplan rengi">
                        <ColorInput value={pageSettings.backgroundColor} onChange={(v) => upd({ backgroundColor: v })} />
                    </FieldRow>
                    <BackgroundImageField value={pageSettings.backgroundImage ?? ""} onChange={(v) => upd({ backgroundImage: v })} />
                    <SectionDivider label="Tipografi" />
                    <FieldRow label="Font ailesi">
                        <SelectInput
                            value={pageSettings.fontFamily ?? "inherit"}
                            onChange={(v) => upd({ fontFamily: v })}
                            options={[
                                { value: "inherit", label: "Sistem fontu" },
                                { value: "Inter, sans-serif", label: "Inter" },
                                { value: "Roboto, sans-serif", label: "Roboto" },
                                { value: "Outfit, sans-serif", label: "Outfit" },
                                { value: "Playfair Display, serif", label: "Playfair Display" },
                                { value: "Merriweather, serif", label: "Merriweather" },
                                { value: "Georgia, serif", label: "Georgia" },
                                { value: "monospace", label: "Monospace" },
                            ]}
                        />
                    </FieldRow>
                    <FieldRow label="Metin rengi">
                        <ColorInput value={pageSettings.textColor ?? "#111827"} onChange={(v) => upd({ textColor: v })} />
                    </FieldRow>
                    <SectionDivider label="Diğer" />
                    <FieldRow label="Scrollbar gizle">
                        <ToggleInput value={pageSettings.hideScrollbar ?? false} onChange={(v) => upd({ hideScrollbar: v })} label="Scrollbar'ı gizle" />
                    </FieldRow>
                </>
            )}

            {tab === "revizyonlar" && (
                <>
                    <SectionDivider label="Revizyonlar" />
                    <p className="text-[0.7rem] text-slate-500 mb-2">
                        Son kayıtlar. Bu sürüme döndükten sonra Taslak olarak kaydet veya Yayınla ile uygulayın.
                    </p>
                    {revisionsLoading ? (
                        <p className="text-[0.8rem] text-slate-400">Yükleniyor…</p>
                    ) : revisions.length === 0 ? (
                        <p className="text-[0.8rem] text-slate-500">Henüz revizyon yok.</p>
                    ) : (
                        <ul className="flex flex-col gap-2">
                            {revisions.map((r) => (
                                <li
                                    key={r.id}
                                    className="flex flex-col gap-1.5 p-2 rounded-lg border border-builder-line bg-slate-900/50"
                                >
                                    <div className="flex items-center justify-between gap-2">
                                        <span className="text-[0.75rem] text-slate-300 truncate">
                                            {r.label ?? "Revizyon"}
                                        </span>
                                        <span className="text-[0.65rem] text-slate-500 shrink-0">
                                            {typeof r.createdAt === "string"
                                                ? new Date(r.createdAt).toLocaleString("tr-TR")
                                                : r.createdAt.toLocaleString("tr-TR")}
                                        </span>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={() => handleRestoreRevision(r.id)}
                                        disabled={restoringId === r.id}
                                        className="w-full py-1.5 px-2 rounded border border-builder-line bg-slate-800 text-slate-300 text-[0.72rem] font-medium cursor-pointer transition-all hover:bg-blue-500/20 hover:border-blue-500 hover:text-blue-400 disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        {restoringId === r.id ? "Yükleniyor…" : "Bu sürüme dön"}
                                    </button>
                                </li>
                            ))}
                        </ul>
                    )}
                </>
            )}
        </div>
    );
}
