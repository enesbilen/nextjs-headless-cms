"use client";

import { useBuilderStore } from "@/core/page-builder/store";
import type { BlockInstance, ProgressBarProps } from "@/core/page-builder/types";
import { FieldRow, TextInput, ColorInput, ToggleInput, NumberInput } from "../widgets";

export function ProgressBarEditor({ block }: { block: BlockInstance }) {
    const { updateBlock } = useBuilderStore();
    const p = block.props as ProgressBarProps;
    const upd = (patch: Partial<ProgressBarProps>) => updateBlock(block.id, patch);

    return (
        <>
            <FieldRow label="Etiket"><TextInput value={p.label} onChange={(v) => upd({ label: v })} /></FieldRow>
            <FieldRow label="Değer">
                <NumberInput value={p.value} onChange={(v) => upd({ value: v })} min={0} max={p.maxValue || 100} step={1} showSlider />
            </FieldRow>
            <FieldRow label="Maks. değer">
                <NumberInput value={p.maxValue} onChange={(v) => upd({ maxValue: v })} min={1} max={10000} step={1} />
            </FieldRow>
            <FieldRow label="Renk"><ColorInput value={p.color} onChange={(v) => upd({ color: v })} /></FieldRow>
            <FieldRow label="Etiketi göster"><ToggleInput value={p.showLabel} onChange={(v) => upd({ showLabel: v })} label="Etiketi göster" /></FieldRow>
        </>
    );
}
