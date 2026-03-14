"use client";

import { useBuilderStore } from "@/core/page-builder/store";
import type { BlockInstance, MapProps } from "@/core/page-builder/types";
import { FieldRow, TextInput } from "../widgets";

export function MapEditor({ block }: { block: BlockInstance }) {
    const { updateBlock } = useBuilderStore();
    const p = block.props as MapProps;
    const upd = (patch: Partial<MapProps>) => updateBlock(block.id, patch);

    return (
        <>
            <FieldRow label="Embed URL"><TextInput value={p.embedUrl} onChange={(v) => upd({ embedUrl: v })} placeholder="Google Maps embed URL" /></FieldRow>
            <FieldRow label="Yükseklik"><TextInput value={p.height} onChange={(v) => upd({ height: v })} placeholder="400px" /></FieldRow>
            <FieldRow label="Border radius"><TextInput value={p.borderRadius} onChange={(v) => upd({ borderRadius: v })} placeholder="0.75rem" /></FieldRow>
        </>
    );
}
