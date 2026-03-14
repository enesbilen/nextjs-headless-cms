"use client";

import { useBuilderStore } from "@/core/page-builder/store";
import type { BlockInstance, ListProps } from "@/core/page-builder/types";
import { FieldRow, TextInput, ColorInput, ToggleInput, SectionDivider } from "../widgets";

export function ListEditor({ block }: { block: BlockInstance }) {
    const { updateBlock } = useBuilderStore();
    const p = block.props as ListProps;
    const upd = (patch: Partial<ListProps>) => updateBlock(block.id, patch);
    const items = p.items ?? [];

    const setItem = (index: number, value: string) => {
        const next = [...items];
        next[index] = value;
        upd({ items: next });
    };
    const addItem = () => upd({ items: [...items, "Yeni madde"] });
    const removeItem = (index: number) => upd({ items: items.filter((_, i) => i !== index) });
    const moveItem = (from: number, to: number) => {
        if (to < 0 || to >= items.length) return;
        const next = [...items];
        const [moved] = next.splice(from, 1);
        next.splice(to, 0, moved);
        upd({ items: next });
    };

    return (
        <>
            <SectionDivider label="Liste Öğeleri" />
            {items.map((item, i) => (
                <div key={i} className="flex gap-1 items-start mb-1.5">
                    <div className="flex flex-col gap-0.5 shrink-0">
                        <button type="button" onClick={() => moveItem(i, i - 1)} disabled={i === 0} className="text-[0.6rem] text-slate-500 hover:text-slate-200 disabled:opacity-30">▲</button>
                        <button type="button" onClick={() => moveItem(i, i + 1)} disabled={i === items.length - 1} className="text-[0.6rem] text-slate-500 hover:text-slate-200 disabled:opacity-30">▼</button>
                    </div>
                    <TextInput value={item} onChange={(v) => setItem(i, v)} />
                    <button type="button" onClick={() => removeItem(i)} className="text-red-400 hover:text-red-300 text-[0.7rem] shrink-0">✕</button>
                </div>
            ))}
            <button type="button" onClick={addItem} className="py-1.5 px-2 rounded border border-builder-line bg-slate-800 text-slate-300 text-[0.72rem] cursor-pointer hover:bg-builder-line">+ Madde ekle</button>
            <SectionDivider label="Stil" />
            <FieldRow label="Sıralı liste"><ToggleInput value={p.ordered} onChange={(v) => upd({ ordered: v })} label="Numaralı liste" /></FieldRow>
            <FieldRow label="Renk"><ColorInput value={p.color} onChange={(v) => upd({ color: v })} /></FieldRow>
            <FieldRow label="Font boyutu"><TextInput value={p.fontSize ?? "1rem"} onChange={(v) => upd({ fontSize: v })} placeholder="1rem" /></FieldRow>
        </>
    );
}
