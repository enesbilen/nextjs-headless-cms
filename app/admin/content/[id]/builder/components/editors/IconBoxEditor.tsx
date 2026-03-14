"use client";

import { useBuilderStore } from "@/core/page-builder/store";
import type { BlockInstance, IconBoxProps } from "@/core/page-builder/types";
import { FieldRow, TextInput, ColorInput, AlignButtons } from "../widgets";

export function IconBoxEditor({ block }: { block: BlockInstance }) {
    const { updateBlock } = useBuilderStore();
    const p = block.props as IconBoxProps;
    const upd = (patch: Partial<IconBoxProps>) => updateBlock(block.id, patch);

    return (
        <>
            <FieldRow label="İkon"><TextInput value={p.icon} onChange={(v) => upd({ icon: v })} placeholder="★ veya emoji" /></FieldRow>
            <FieldRow label="Başlık"><TextInput value={p.title} onChange={(v) => upd({ title: v })} /></FieldRow>
            <FieldRow label="Metin"><TextInput value={p.text} onChange={(v) => upd({ text: v })} multiline /></FieldRow>
            <FieldRow label="Hizalama"><AlignButtons value={p.align} onChange={(v) => upd({ align: v })} /></FieldRow>
            <FieldRow label="İkon rengi"><ColorInput value={p.iconColor ?? "#2563eb"} onChange={(v) => upd({ iconColor: v })} /></FieldRow>
            <FieldRow label="Başlık rengi"><ColorInput value={p.titleColor ?? "#111827"} onChange={(v) => upd({ titleColor: v })} /></FieldRow>
            <FieldRow label="Metin rengi"><ColorInput value={p.textColor ?? "#4b5563"} onChange={(v) => upd({ textColor: v })} /></FieldRow>
        </>
    );
}
