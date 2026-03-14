"use client";

import { useState } from "react";
import { useBuilderStore } from "@/core/page-builder/store";
import { MediaPickerModal } from "../MediaPickerModal";
import type { BlockInstance, TestimonialProps } from "@/core/page-builder/types";
import { FieldRow, TextInput, NumberInput, SectionDivider } from "../widgets";

export function TestimonialEditor({ block }: { block: BlockInstance }) {
    const { updateBlock } = useBuilderStore();
    const p = block.props as TestimonialProps;
    const upd = (patch: Partial<TestimonialProps>) => updateBlock(block.id, patch);
    const [pickerOpen, setPickerOpen] = useState(false);

    return (
        <>
            <FieldRow label="Alıntı"><TextInput value={p.quote} onChange={(v) => upd({ quote: v })} multiline /></FieldRow>
            <FieldRow label="Ad"><TextInput value={p.name} onChange={(v) => upd({ name: v })} /></FieldRow>
            <FieldRow label="Unvan"><TextInput value={p.title ?? ""} onChange={(v) => upd({ title: v })} placeholder="CEO, Şirket" /></FieldRow>
            <SectionDivider label="Avatar" />
            <FieldRow label="Avatar URL">
                <div className="flex gap-1">
                    <TextInput value={p.avatarSrc ?? ""} onChange={(v) => upd({ avatarSrc: v })} placeholder="https://..." />
                    <button
                        className="shrink-0 w-8 h-8 flex items-center justify-center border border-slate-700 rounded-md bg-slate-800 text-slate-400 cursor-pointer text-[0.9rem] transition-all hover:border-blue-500 hover:bg-blue-500/15 hover:text-blue-400"
                        onClick={() => setPickerOpen(true)}
                        title="Medya kütüphanesinden seç"
                    >
                        🖼
                    </button>
                </div>
            </FieldRow>
            <SectionDivider label="Değerlendirme" />
            <FieldRow label="Yıldız (1-5)">
                <NumberInput value={p.rating ?? 5} onChange={(v) => upd({ rating: v })} min={0} max={5} step={1} showSlider />
            </FieldRow>
            <MediaPickerModal
                open={pickerOpen}
                onClose={() => setPickerOpen(false)}
                onSelect={(url) => { upd({ avatarSrc: url }); }}
            />
        </>
    );
}
