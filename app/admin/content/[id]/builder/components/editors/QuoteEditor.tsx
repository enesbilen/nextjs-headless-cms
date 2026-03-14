"use client";

import { useBuilderStore } from "@/core/page-builder/store";
import type { BlockInstance, QuoteProps } from "@/core/page-builder/types";
import { FieldRow, TextInput, ColorInput } from "../widgets";

export function QuoteEditor({ block }: { block: BlockInstance }) {
    const { updateBlock } = useBuilderStore();
    const p = block.props as QuoteProps;
    const upd = (patch: Partial<QuoteProps>) => updateBlock(block.id, patch);

    return (
        <>
            <FieldRow label="Alıntı metni"><TextInput value={p.text} onChange={(v) => upd({ text: v })} multiline /></FieldRow>
            <FieldRow label="Yazar"><TextInput value={p.author ?? ""} onChange={(v) => upd({ author: v })} /></FieldRow>
            <FieldRow label="Kenarlık rengi"><ColorInput value={p.borderColor} onChange={(v) => upd({ borderColor: v })} /></FieldRow>
            <FieldRow label="Metin rengi"><ColorInput value={p.textColor} onChange={(v) => upd({ textColor: v })} /></FieldRow>
            <FieldRow label="Font boyutu"><TextInput value={p.fontSize ?? "1.1rem"} onChange={(v) => upd({ fontSize: v })} placeholder="1.1rem" /></FieldRow>
        </>
    );
}
