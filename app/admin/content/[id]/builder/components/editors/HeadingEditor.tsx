"use client";

import { useBuilderStore } from "@/core/page-builder/store";
import { getValueForDevice } from "@/core/page-builder/responsiveStyles";
import type { BlockInstance, HeadingProps, AlignValue } from "@/core/page-builder/types";
import { FieldRow, TextInput, ColorInput, SelectInput, AlignButtons, DeviceHint } from "../widgets";

export function HeadingEditor({ block }: { block: BlockInstance }) {
    const { updateBlock, device } = useBuilderStore();
    const p = block.props as HeadingProps;
    const r = p.responsive;

    const align = getValueForDevice(p.align, r?.tablet?.align, r?.mobile?.align, device);
    const color = getValueForDevice(p.color, r?.tablet?.color, r?.mobile?.color, device);
    const fontSize = getValueForDevice(p.fontSize ?? "", r?.tablet?.fontSize, r?.mobile?.fontSize, device);

    const upd = (patch: Partial<HeadingProps>) => updateBlock(block.id, patch);
    const updResponsive = (key: "align" | "color" | "fontSize", value: AlignValue | string) => {
        if (device === "desktop") {
            upd({ [key]: value });
            return;
        }
        const next = {
            ...p.responsive,
            [device]: { ...p.responsive?.[device], [key]: value },
        };
        upd({ responsive: next });
    };

    return (
        <>
            <DeviceHint device={device} />
            <FieldRow label="Metin"><TextInput value={p.text} onChange={(v) => upd({ text: v })} multiline /></FieldRow>
            <FieldRow label="Seviye">
                <SelectInput value={String(p.level)} onChange={(v) => upd({ level: Number(v) as HeadingProps["level"] })}
                    options={[1, 2, 3, 4, 5, 6].map((n) => ({ value: String(n), label: `H${n}` }))}
                />
            </FieldRow>
            <FieldRow label="Hizalama"><AlignButtons value={align} onChange={(v) => updResponsive("align", v)} /></FieldRow>
            <FieldRow label="Renk"><ColorInput value={color} onChange={(v) => updResponsive("color", v)} /></FieldRow>
            <FieldRow label="Font ağırlığı">
                <SelectInput value={p.fontWeight ?? "bold"} onChange={(v) => upd({ fontWeight: v })}
                    options={[
                        { value: "normal", label: "Normal" },
                        { value: "semibold", label: "Semibold" },
                        { value: "bold", label: "Bold" },
                        { value: "extrabold", label: "Extra Bold" },
                    ]}
                />
            </FieldRow>
            <FieldRow label="Font boyutu"><TextInput value={fontSize} onChange={(v) => updResponsive("fontSize", v)} placeholder="2rem" /></FieldRow>
        </>
    );
}
