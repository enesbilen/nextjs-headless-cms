"use client";

import { useState } from "react";
import { useBuilderStore } from "@/core/page-builder/store";
import { CSSValueInput, SpacingControl } from "../CSSValueInput";
import type { BlockInstance, ColumnsProps, ColumnSettings } from "@/core/page-builder/types";
import { FieldRow, TextInput, ColorInput, SelectInput, SectionDivider, PaddingGroup } from "../widgets";

export function ColumnsEditor({ block }: { block: BlockInstance }) {
    const { updateBlock, setColumnsCount } = useBuilderStore();
    const p = block.props as ColumnsProps;
    const upd = (patch: Partial<ColumnsProps>) => updateBlock(block.id, patch);
    const [tab, setTab] = useState<"layout" | "columns" | "style">("layout");
    const colCount = block.type === "columns-3" ? 3 : 2;

    const updColumn = (colIdx: number, patch: Partial<ColumnSettings>) => {
        const current = p.columnSettings ? [...p.columnSettings] : Array.from({ length: p.columns }, () => ({}));
        current[colIdx] = { ...current[colIdx], ...patch };
        upd({ columnSettings: current });
    };

    return (
        <>
            <div className="flex gap-0.5 p-1 bg-slate-900 rounded-lg mb-1">
                <button className={`flex-1 py-[5px] px-2 rounded-md border-none cursor-pointer text-[0.72rem] font-semibold transition-all whitespace-nowrap ${tab === "layout" ? "bg-builder-active text-blue-400" : "bg-transparent text-slate-500 hover:text-slate-200"}`} onClick={() => setTab("layout")}>Düzen</button>
                <button className={`flex-1 py-[5px] px-2 rounded-md border-none cursor-pointer text-[0.72rem] font-semibold transition-all whitespace-nowrap ${tab === "columns" ? "bg-builder-active text-blue-400" : "bg-transparent text-slate-500 hover:text-slate-200"}`} onClick={() => setTab("columns")}>Sütunlar</button>
                <button className={`flex-1 py-[5px] px-2 rounded-md border-none cursor-pointer text-[0.72rem] font-semibold transition-all whitespace-nowrap ${tab === "style" ? "bg-builder-active text-blue-400" : "bg-transparent text-slate-500 hover:text-slate-200"}`} onClick={() => setTab("style")}>Stil</button>
            </div>

            {tab === "layout" && (
                <>
                    <SectionDivider label="Genişlik ve yükseklik" />
                    <FieldRow label="Genişlik">
                        <TextInput value={p.width ?? ""} onChange={(v) => upd({ width: v || undefined })} placeholder="örn. 100%, 1200px" />
                    </FieldRow>
                    <FieldRow label="Yükseklik">
                        <TextInput value={p.height ?? ""} onChange={(v) => upd({ height: v || undefined })} placeholder="örn. auto, 400px" />
                    </FieldRow>
                    <SectionDivider label="Sütun sayısı" />
                    <FieldRow label="Sütunlar">
                        <SelectInput
                            value={String(colCount)}
                            onChange={(v) => setColumnsCount(block.id, v === "3" ? 3 : 2)}
                            options={[
                                { value: "2", label: "2 sütun" },
                                { value: "3", label: "3 sütun" },
                            ]}
                        />
                    </FieldRow>
                    <SectionDivider label="Izgara Ayarları" />
                    <FieldRow label="Sütun aralığı (gap)">
                        <CSSValueInput value={`${p.gap}px`} onChange={(v) => upd({ gap: parseFloat(v) || 0 })} units={["px", "rem"]} sliderMax={80} />
                    </FieldRow>
                    <FieldRow label="Dikey hizalama">
                        <SelectInput value={p.verticalAlign} onChange={(v) => upd({ verticalAlign: v })}
                            options={[{ value: "start", label: "↑ Üst" }, { value: "center", label: "↕ Orta" }, { value: "end", label: "↓ Alt" }]}
                        />
                    </FieldRow>
                    <SectionDivider label="Sütun Genişlikleri" />
                    {Array.from({ length: p.columns }).map((_, i) => {
                        const widths = p.columnWidths ?? Array.from({ length: p.columns }, () => "1fr");
                        return (
                            <FieldRow key={i} label={`Sütun ${i + 1}`}>
                                <TextInput
                                    value={widths[i] ?? "1fr"}
                                    onChange={(v) => {
                                        const updated = [...widths];
                                        updated[i] = v;
                                        upd({ columnWidths: updated });
                                    }}
                                    placeholder="1fr"
                                />
                            </FieldRow>
                        );
                    })}
                    <p className="text-[0.7rem] text-gray-500 my-1">
                        CSS grid değerleri: 1fr, 2fr, 200px, 30%, vb.
                    </p>
                    <SectionDivider label="Padding (Tüm sütunlar)" />
                    <SpacingControl
                        value={{
                            top: `${p.paddingTop}px`,
                            right: `${p.paddingRight ?? 0}px`,
                            bottom: `${p.paddingBottom}px`,
                            left: `${p.paddingLeft ?? 0}px`,
                        }}
                        onChange={(side, v) => upd({ [`padding${side.charAt(0).toUpperCase() + side.slice(1)}`]: parseFloat(v) || 0 })}
                    />
                </>
            )}

            {tab === "columns" && (
                <>
                    {Array.from({ length: p.columns }).map((_, i) => {
                        const cs: ColumnSettings = p.columnSettings?.[i] ?? {};
                        return (
                            <div key={i}>
                                <SectionDivider label={`Sütun ${i + 1}`} />
                                <FieldRow label="Arkaplan">
                                    <ColorInput value={cs.backgroundColor ?? "transparent"} onChange={(v) => updColumn(i, { backgroundColor: v })} />
                                </FieldRow>
                                <FieldRow label="Dikey hizalama">
                                    <SelectInput value={cs.verticalAlign ?? "start"} onChange={(v) => updColumn(i, { verticalAlign: v })}
                                        options={[{ value: "start", label: "↑ Üst" }, { value: "center", label: "↕ Orta" }, { value: "end", label: "↓ Alt" }]}
                                    />
                                </FieldRow>
                                <FieldRow label="Padding">
                                    <PaddingGroup
                                        top={cs.paddingTop ?? 0}
                                        right={cs.paddingRight ?? 0}
                                        bottom={cs.paddingBottom ?? 0}
                                        left={cs.paddingLeft ?? 0}
                                        onChange={(side, v) => updColumn(i, { [`padding${side.charAt(0).toUpperCase() + side.slice(1)}`]: v })}
                                    />
                                </FieldRow>
                                <FieldRow label="Genişlik">
                                    <TextInput value={cs.width ?? ""} onChange={(v) => updColumn(i, { width: v || undefined })} placeholder="örn. 200px, 1fr" />
                                </FieldRow>
                                <FieldRow label="Min. yükseklik">
                                    <TextInput value={cs.minHeight ?? ""} onChange={(v) => updColumn(i, { minHeight: v || undefined })} placeholder="örn. 100px" />
                                </FieldRow>
                                <FieldRow label="Border radius">
                                    <TextInput value={cs.borderRadius ?? "0"} onChange={(v) => updColumn(i, { borderRadius: v })} placeholder="0px" />
                                </FieldRow>
                            </div>
                        );
                    })}
                </>
            )}

            {tab === "style" && (
                <>
                    <SectionDivider label="Arkaplan (tümü)" />
                    <FieldRow label="Arkaplan rengi"><ColorInput value={p.backgroundColor} onChange={(v) => upd({ backgroundColor: v })} /></FieldRow>
                </>
            )}
        </>
    );
}
