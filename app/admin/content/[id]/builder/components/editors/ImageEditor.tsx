"use client";

import { useState } from "react";
import { useBuilderStore } from "@/core/page-builder/store";
import type { BlockInstance, ImageProps } from "@/core/page-builder/types";
import { MediaPickerModal } from "../MediaPickerModal";
import { CSSValueInput } from "../CSSValueInput";
import { FieldRow, TextInput, SelectInput, SectionDivider, CLS_INPUT } from "../widgets";

export function ImageEditor({ block }: { block: BlockInstance }) {
    const { updateBlock } = useBuilderStore();
    const p = block.props as ImageProps;
    const upd = (patch: Partial<ImageProps>) => updateBlock(block.id, patch);
    const [pickerOpen, setPickerOpen] = useState(false);

    return (
        <>
            <FieldRow label="Görsel URL">
                <div className="flex gap-1">
                    <TextInput
                        value={p.src ?? ""}
                        onChange={(v) => upd({ src: v })}
                        placeholder="https://... veya mediadan seç"
                    />
                    <button
                        className="shrink-0 w-8 h-8 flex items-center justify-center border border-slate-700 rounded-md bg-slate-800 text-slate-400 cursor-pointer text-[0.9rem] transition-all hover:border-blue-500 hover:bg-blue-500/15 hover:text-blue-400"
                        onClick={() => setPickerOpen(true)}
                        title="Medya kütüphanesinden seç"
                    >
                        🖼
                    </button>
                </div>
            </FieldRow>

            {p.src && (
                <div className="relative my-1 mb-2 rounded-md overflow-hidden border border-slate-700 bg-slate-900 max-h-[120px] flex items-center justify-center">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={p.src} alt={p.alt} className="max-h-[120px] max-w-full object-contain block" />
                    <button
                        className="absolute top-1 right-1 w-5 h-5 flex items-center justify-center bg-black/60 border-none rounded-full text-slate-200 text-[0.6rem] cursor-pointer transition-colors hover:bg-red-500/80"
                        onClick={() => upd({ src: "" })}
                        title="Görseli kaldır"
                    >✕</button>
                </div>
            )}

            <FieldRow label="Alt metin"><TextInput value={p.alt} onChange={(v) => upd({ alt: v })} /></FieldRow>
            <SectionDivider label="Boyut" />
            <FieldRow label="Genişlik (px)">
                <input
                    type="number"
                    className={CLS_INPUT}
                    value={p.width ?? ""}
                    onChange={(e) => {
                        const v = e.target.value.trim();
                        upd({ width: v === "" ? undefined : Math.max(0, parseInt(v, 10) || 0) });
                    }}
                    placeholder="Otomatik"
                    min={0}
                />
            </FieldRow>
            <FieldRow label="Yükseklik (px)">
                <input
                    type="number"
                    className={CLS_INPUT}
                    value={p.height ?? ""}
                    onChange={(e) => {
                        const v = e.target.value.trim();
                        upd({ height: v === "" ? undefined : Math.max(0, parseInt(v, 10) || 0) });
                    }}
                    placeholder="Otomatik"
                    min={0}
                />
            </FieldRow>
            <FieldRow label="Aspect Ratio"><TextInput value={p.aspectRatio ?? "16/9"} onChange={(v) => upd({ aspectRatio: v })} placeholder="16/9" /></FieldRow>
            <FieldRow label="Object Fit">
                <SelectInput value={p.objectFit} onChange={(v) => upd({ objectFit: v })}
                    options={[
                        { value: "cover", label: "Cover" },
                        { value: "contain", label: "Contain" },
                        { value: "fill", label: "Fill" },
                    ]}
                />
            </FieldRow>
            <FieldRow label="Border Radius"><TextInput value={p.borderRadius} onChange={(v) => upd({ borderRadius: v })} placeholder="0px" /></FieldRow>
            <FieldRow label="Altyazı"><TextInput value={p.caption ?? ""} onChange={(v) => upd({ caption: v })} /></FieldRow>

            <MediaPickerModal
                open={pickerOpen}
                onClose={() => setPickerOpen(false)}
                onSelect={(url) => { upd({ src: url }); }}
            />
        </>
    );
}
