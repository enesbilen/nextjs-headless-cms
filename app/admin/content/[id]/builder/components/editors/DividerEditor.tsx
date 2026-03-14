"use client";

import { useBuilderStore } from "@/core/page-builder/store";
import { getValueForDevice } from "@/core/page-builder/responsiveStyles";
import { CSSValueInput } from "../CSSValueInput";
import type { BlockInstance, DividerProps } from "@/core/page-builder/types";
import { FieldRow, ColorInput, SelectInput, DeviceHint } from "../widgets";

export function DividerEditor({ block }: { block: BlockInstance }) {
    const { updateBlock, device } = useBuilderStore();
    const p = block.props as DividerProps;
    const r = p.responsive;
    const marginTop = getValueForDevice(p.marginTop, r?.tablet?.marginTop, r?.mobile?.marginTop, device);
    const marginBottom = getValueForDevice(p.marginBottom, r?.tablet?.marginBottom, r?.mobile?.marginBottom, device);

    const upd = (patch: Partial<DividerProps>) => updateBlock(block.id, patch);
    const updResponsive = (key: "marginTop" | "marginBottom", value: number) => {
        if (device === "desktop") { upd({ [key]: value }); return; }
        upd({ responsive: { ...p.responsive, [device]: { ...p.responsive?.[device], [key]: value } } });
    };

    return (
        <>
            <DeviceHint device={device} />
            <FieldRow label="Renk"><ColorInput value={p.color} onChange={(v) => upd({ color: v })} /></FieldRow>
            <FieldRow label="Kalınlık">
                <CSSValueInput value={`${p.thickness}px`} onChange={(v) => upd({ thickness: parseFloat(v) || 1 })} units={["px"]} sliderMax={20} min={1} />
            </FieldRow>
            <FieldRow label="Stil">
                <SelectInput value={p.style} onChange={(v) => upd({ style: v })}
                    options={[{ value: "solid", label: "Solid" }, { value: "dashed", label: "Dashed" }, { value: "dotted", label: "Dotted" }]}
                />
            </FieldRow>
            <FieldRow label="Üst boşluk">
                <CSSValueInput value={`${marginTop}px`} onChange={(v) => updResponsive("marginTop", parseFloat(v) || 0)} units={["px", "rem"]} sliderMax={120} />
            </FieldRow>
            <FieldRow label="Alt boşluk">
                <CSSValueInput value={`${marginBottom}px`} onChange={(v) => updResponsive("marginBottom", parseFloat(v) || 0)} units={["px", "rem"]} sliderMax={120} />
            </FieldRow>
        </>
    );
}
