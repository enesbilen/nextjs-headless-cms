"use client";

import { useBuilderStore } from "@/core/page-builder/store";
import { getValueForDevice } from "@/core/page-builder/responsiveStyles";
import { CSSValueInput } from "../CSSValueInput";
import type { BlockInstance, SpacerProps } from "@/core/page-builder/types";
import { FieldRow, DeviceHint } from "../widgets";

export function SpacerEditor({ block }: { block: BlockInstance }) {
    const { updateBlock, device } = useBuilderStore();
    const p = block.props as SpacerProps;
    const r = p.responsive;
    const height = getValueForDevice(p.height, r?.tablet?.height, r?.mobile?.height, device);

    const upd = (patch: Partial<SpacerProps>) => updateBlock(block.id, patch);
    const updResponsive = (value: number) => {
        if (device === "desktop") { upd({ height: value }); return; }
        upd({ responsive: { ...p.responsive, [device]: { ...p.responsive?.[device], height: value } } });
    };

    return (
        <>
            <DeviceHint device={device} />
            <FieldRow label="Yükseklik">
                <CSSValueInput value={`${height}px`} onChange={(v) => updResponsive(parseFloat(v) || 0)} units={["px", "rem"]} sliderMax={600} min={0} />
            </FieldRow>
        </>
    );
}
