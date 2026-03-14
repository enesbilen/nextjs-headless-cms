"use client";

import { useBuilderStore } from "@/core/page-builder/store";
import type { BlockInstance, BreadcrumbProps } from "@/core/page-builder/types";
import { FieldRow, TextInput, ColorInput } from "../widgets";

export function BreadcrumbEditor({ block }: { block: BlockInstance }) {
    const { updateBlock } = useBuilderStore();
    const p = block.props as BreadcrumbProps;
    const upd = (patch: Partial<BreadcrumbProps>) => updateBlock(block.id, patch);

    return (
        <>
            <FieldRow label="Ayırıcı"><TextInput value={p.separator} onChange={(v) => upd({ separator: v })} placeholder="/" /></FieldRow>
            <FieldRow label="Metin rengi"><ColorInput value={p.textColor} onChange={(v) => upd({ textColor: v })} /></FieldRow>
            <FieldRow label="Link rengi"><ColorInput value={p.linkColor} onChange={(v) => upd({ linkColor: v })} /></FieldRow>
            <FieldRow label="Font boyutu"><TextInput value={p.fontSize} onChange={(v) => upd({ fontSize: v })} placeholder="0.875rem" /></FieldRow>
        </>
    );
}
