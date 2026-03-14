"use client";

import { useBuilderStore } from "@/core/page-builder/store";
import type { BlockInstance, CardProps } from "@/core/page-builder/types";
import { FieldRow, TextInput, ColorInput, ToggleInput } from "../widgets";

export function CardEditor({ block }: { block: BlockInstance }) {
    const { updateBlock } = useBuilderStore();
    const p = block.props as CardProps;
    const upd = (patch: Partial<CardProps>) => updateBlock(block.id, patch);

    return (
        <>
            <FieldRow label="Başlık"><TextInput value={p.title} onChange={(v) => upd({ title: v })} /></FieldRow>
            <FieldRow label="Açıklama"><TextInput value={p.description} onChange={(v) => upd({ description: v })} multiline /></FieldRow>
            <FieldRow label="Görsel URL"><TextInput value={p.imageSrc ?? ""} onChange={(v) => upd({ imageSrc: v })} /></FieldRow>
            <FieldRow label="Buton etiketi"><TextInput value={p.buttonLabel ?? ""} onChange={(v) => upd({ buttonLabel: v })} /></FieldRow>
            <FieldRow label="Buton linki"><TextInput value={p.buttonHref ?? ""} onChange={(v) => upd({ buttonHref: v })} /></FieldRow>
            <FieldRow label="Arkaplan"><ColorInput value={p.backgroundColor} onChange={(v) => upd({ backgroundColor: v })} /></FieldRow>
            <FieldRow label="Border radius"><TextInput value={p.borderRadius} onChange={(v) => upd({ borderRadius: v })} /></FieldRow>
            <FieldRow label="Gölge"><ToggleInput value={p.shadow} onChange={(v) => upd({ shadow: v })} label="Gölge göster" /></FieldRow>
        </>
    );
}
