"use client";

import { useBuilderStore } from "@/core/page-builder/store";
import type { BlockInstance, AccordionProps, AccordionItem } from "@/core/page-builder/types";
import { FieldRow, TextInput, ToggleInput, SectionDivider } from "../widgets";

export function AccordionEditor({ block }: { block: BlockInstance }) {
    const { updateBlock } = useBuilderStore();
    const p = block.props as AccordionProps;
    const items = p.items ?? [];
    const upd = (patch: Partial<AccordionProps>) => updateBlock(block.id, patch);
    const setItem = (index: number, item: Partial<AccordionItem>) => {
        const next = [...items];
        next[index] = { ...next[index], ...item };
        upd({ items: next });
    };
    const addItem = () => upd({ items: [...items, { title: "Başlık", content: "" }] });
    const removeItem = (index: number) => upd({ items: items.filter((_, i) => i !== index) });

    return (
        <>
            <SectionDivider label="Öğeler" />
            {items.map((item, i) => (
                <div key={i} className="rounded-lg border border-builder-line bg-slate-900/50 p-2 mb-2">
                    <div className="flex justify-between gap-1 mb-1">
                        <span className="text-[0.7rem] text-slate-500">Öğe {i + 1}</span>
                        <button type="button" onClick={() => removeItem(i)} className="text-red-400 hover:text-red-300 text-[0.7rem]">Sil</button>
                    </div>
                    <FieldRow label="Başlık"><TextInput value={item.title} onChange={(v) => setItem(i, { title: v })} /></FieldRow>
                    <FieldRow label="İçerik"><TextInput value={item.content} onChange={(v) => setItem(i, { content: v })} multiline /></FieldRow>
                    <FieldRow label="Varsayılan açık"><ToggleInput value={!!item.open} onChange={(v) => setItem(i, { open: v })} /></FieldRow>
                </div>
            ))}
            <button type="button" onClick={addItem} className="py-1.5 px-2 rounded border border-builder-line bg-slate-800 text-slate-300 text-[0.72rem] cursor-pointer hover:bg-builder-line">+ Öğe ekle</button>
        </>
    );
}
