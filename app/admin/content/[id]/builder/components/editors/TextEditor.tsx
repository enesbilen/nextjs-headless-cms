"use client";

import { useBuilderStore } from "@/core/page-builder/store";
import { getValueForDevice } from "@/core/page-builder/responsiveStyles";
import type { BlockInstance, TextProps, AlignValue } from "@/core/page-builder/types";
import { FieldRow, TextInput, ColorInput, AlignButtons, DeviceHint } from "../widgets";

export function TextEditor({ block }: { block: BlockInstance }) {
    const { updateBlock, device } = useBuilderStore();
    const p = block.props as TextProps;
    const r = p.responsive;
    const align = getValueForDevice(p.align, r?.tablet?.align, r?.mobile?.align, device);
    const color = getValueForDevice(p.color, r?.tablet?.color, r?.mobile?.color, device);
    const fontSize = getValueForDevice(p.fontSize ?? "1rem", r?.tablet?.fontSize, r?.mobile?.fontSize, device);

    const upd = (patch: Partial<TextProps>) => updateBlock(block.id, patch);
    const updResponsive = (key: "align" | "color" | "fontSize", value: AlignValue | string) => {
        if (device === "desktop") { upd({ [key]: value }); return; }
        upd({ responsive: { ...p.responsive, [device]: { ...p.responsive?.[device], [key]: value } } });
    };

    return (
        <>
            <DeviceHint device={device} />
            <FieldRow label="İçerik"><TextInput value={p.text} onChange={(v) => upd({ text: v })} multiline /></FieldRow>
            <FieldRow label="Hizalama"><AlignButtons value={align} onChange={(v) => updResponsive("align", v)} /></FieldRow>
            <FieldRow label="Renk"><ColorInput value={color} onChange={(v) => updResponsive("color", v)} /></FieldRow>
            <FieldRow label="Font boyutu"><TextInput value={fontSize} onChange={(v) => updResponsive("fontSize", v)} placeholder="1rem" /></FieldRow>
        </>
    );
}
