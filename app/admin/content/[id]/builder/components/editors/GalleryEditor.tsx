"use client";

import { useState } from "react";
import { useBuilderStore } from "@/core/page-builder/store";
import { MediaPickerModal } from "../MediaPickerModal";
import type { BlockInstance, GalleryProps, GalleryImage } from "@/core/page-builder/types";
import { FieldRow, TextInput, SelectInput, SectionDivider } from "../widgets";
import { CSSValueInput } from "../CSSValueInput";

export function GalleryEditor({ block }: { block: BlockInstance }) {
    const { updateBlock } = useBuilderStore();
    const p = block.props as GalleryProps;
    const upd = (patch: Partial<GalleryProps>) => updateBlock(block.id, patch);
    const images = p.images ?? [];
    const [pickerIdx, setPickerIdx] = useState<number | null>(null);

    const setImage = (i: number, patch: Partial<GalleryImage>) => {
        const next = [...images];
        next[i] = { ...next[i], ...patch };
        upd({ images: next });
    };
    const addImage = () => upd({ images: [...images, { src: "", alt: "" }] });
    const removeImage = (i: number) => upd({ images: images.filter((_, idx) => idx !== i) });

    return (
        <>
            <SectionDivider label="Görseller" />
            {images.map((img, i) => (
                <div key={i} className="rounded-lg border border-builder-line bg-slate-900/50 p-2 mb-2">
                    <div className="flex items-center justify-between gap-1 mb-1">
                        <span className="text-[0.7rem] text-slate-500">Görsel {i + 1}</span>
                        <button type="button" onClick={() => removeImage(i)} className="text-red-400 hover:text-red-300 text-[0.7rem]">Sil</button>
                    </div>
                    <FieldRow label="URL">
                        <div className="flex gap-1">
                            <TextInput value={img.src ?? ""} onChange={(v) => setImage(i, { src: v })} placeholder="https://..." />
                            <button
                                className="shrink-0 w-8 h-8 flex items-center justify-center border border-slate-700 rounded-md bg-slate-800 text-slate-400 cursor-pointer text-[0.9rem] transition-all hover:border-blue-500 hover:bg-blue-500/15 hover:text-blue-400"
                                onClick={() => setPickerIdx(i)}
                            >
                                🖼
                            </button>
                        </div>
                    </FieldRow>
                    <FieldRow label="Alt"><TextInput value={img.alt} onChange={(v) => setImage(i, { alt: v })} /></FieldRow>
                </div>
            ))}
            <button type="button" onClick={addImage} className="py-1.5 px-2 rounded border border-builder-line bg-slate-800 text-slate-300 text-[0.72rem] cursor-pointer hover:bg-builder-line">+ Görsel ekle</button>
            <SectionDivider label="Düzen" />
            <FieldRow label="Sütun">
                <SelectInput value={String(p.columns)} onChange={(v) => upd({ columns: Number(v) as 2 | 3 | 4 })}
                    options={[{ value: "2", label: "2" }, { value: "3", label: "3" }, { value: "4", label: "4" }]}
                />
            </FieldRow>
            <FieldRow label="Gap">
                <CSSValueInput value={`${p.gap}px`} onChange={(v) => upd({ gap: parseFloat(v) || 8 })} units={["px"]} sliderMax={40} />
            </FieldRow>
            <FieldRow label="Border radius"><TextInput value={p.borderRadius} onChange={(v) => upd({ borderRadius: v })} placeholder="0.5rem" /></FieldRow>
            {pickerIdx !== null && (
                <MediaPickerModal
                    open
                    onClose={() => setPickerIdx(null)}
                    onSelect={(url) => { setImage(pickerIdx, { src: url }); setPickerIdx(null); }}
                />
            )}
        </>
    );
}
