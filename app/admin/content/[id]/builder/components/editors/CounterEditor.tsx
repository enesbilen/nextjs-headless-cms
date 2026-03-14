"use client";

import { useBuilderStore } from "@/core/page-builder/store";
import type { BlockInstance, CounterProps } from "@/core/page-builder/types";
import { FieldRow, TextInput, ColorInput } from "../widgets";

export function CounterEditor({ block }: { block: BlockInstance }) {
    const { updateBlock } = useBuilderStore();
    const p = block.props as CounterProps;
    const upd = (patch: Partial<CounterProps>) => updateBlock(block.id, patch);

    return (
        <>
            <FieldRow label="Değer"><TextInput value={p.value} onChange={(v) => upd({ value: v })} placeholder="150" /></FieldRow>
            <FieldRow label="Etiket"><TextInput value={p.label} onChange={(v) => upd({ label: v })} placeholder="Mutlu Müşteri" /></FieldRow>
            <FieldRow label="Önek"><TextInput value={p.prefix ?? ""} onChange={(v) => upd({ prefix: v })} placeholder="$" /></FieldRow>
            <FieldRow label="Sonek"><TextInput value={p.suffix ?? ""} onChange={(v) => upd({ suffix: v })} placeholder="+" /></FieldRow>
            <FieldRow label="Renk"><ColorInput value={p.color ?? "#2563eb"} onChange={(v) => upd({ color: v })} /></FieldRow>
        </>
    );
}
