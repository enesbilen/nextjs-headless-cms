"use client";

import { useBuilderStore } from "@/core/page-builder/store";
import type { BlockInstance, TabsProps, TabItem } from "@/core/page-builder/types";
import { FieldRow, TextInput, SectionDivider } from "../widgets";

export function TabsEditor({ block }: { block: BlockInstance }) {
    const { updateBlock } = useBuilderStore();
    const p = block.props as TabsProps;
    const tabs = p.tabs ?? [];
    const upd = (patch: Partial<TabsProps>) => updateBlock(block.id, patch);
    const setTab = (index: number, item: Partial<TabItem>) => {
        const next = [...tabs];
        next[index] = { ...next[index], ...item };
        upd({ tabs: next });
    };
    const addTab = () => upd({ tabs: [...tabs, { label: "Yeni sekme", content: "" }] });
    const removeTab = (index: number) => upd({ tabs: tabs.filter((_, i) => i !== index) });

    return (
        <>
            <SectionDivider label="Sekmeler" />
            {tabs.map((tab, i) => (
                <div key={i} className="rounded-lg border border-builder-line bg-slate-900/50 p-2 mb-2">
                    <div className="flex items-center justify-between gap-1 mb-1">
                        <span className="text-[0.7rem] text-slate-500">Sekme {i + 1}</span>
                        <button type="button" onClick={() => removeTab(i)} className="text-red-400 hover:text-red-300 text-[0.7rem]">Sil</button>
                    </div>
                    <FieldRow label="Etiket"><TextInput value={tab.label} onChange={(v) => setTab(i, { label: v })} /></FieldRow>
                    <FieldRow label="İçerik"><TextInput value={tab.content} onChange={(v) => setTab(i, { content: v })} multiline /></FieldRow>
                </div>
            ))}
            <button type="button" onClick={addTab} className="py-1.5 px-2 rounded border border-builder-line bg-slate-800 text-slate-300 text-[0.72rem] cursor-pointer hover:bg-builder-line">+ Sekme ekle</button>
            <FieldRow label="Varsayılan sekme"><TextInput value={String(p.defaultTabIndex ?? 0)} onChange={(v) => upd({ defaultTabIndex: Math.max(0, parseInt(v, 10) || 0) })} placeholder="0" /></FieldRow>
        </>
    );
}
