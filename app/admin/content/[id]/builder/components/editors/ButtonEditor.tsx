"use client";

import { useBuilderStore } from "@/core/page-builder/store";
import { getValueForDevice } from "@/core/page-builder/responsiveStyles";
import type { BlockInstance, ButtonProps, AlignValue } from "@/core/page-builder/types";
import { FieldRow, TextInput, ColorInput, SelectInput, AlignButtons, ToggleInput, DeviceHint } from "../widgets";

export function ButtonEditor({ block }: { block: BlockInstance }) {
    const { updateBlock, device } = useBuilderStore();
    const p = block.props as ButtonProps;
    const r = p.responsive;
    const align = getValueForDevice(p.align, r?.tablet?.align, r?.mobile?.align, device);

    const upd = (patch: Partial<ButtonProps>) => updateBlock(block.id, patch);
    const updResponsive = (key: "align", value: AlignValue) => {
        if (device === "desktop") { upd({ align: value }); return; }
        upd({ responsive: { ...p.responsive, [device]: { ...p.responsive?.[device], [key]: value } } });
    };

    return (
        <>
            <DeviceHint device={device} />
            <FieldRow label="Etiket"><TextInput value={p.label} onChange={(v) => upd({ label: v })} /></FieldRow>
            <FieldRow label="Link (href)"><TextInput value={p.href} onChange={(v) => upd({ href: v })} placeholder="https://..." /></FieldRow>
            <FieldRow label="Varyant">
                <SelectInput value={p.variant} onChange={(v) => upd({ variant: v })}
                    options={[
                        { value: "primary", label: "Primary" },
                        { value: "secondary", label: "Secondary" },
                        { value: "outline", label: "Outline" },
                        { value: "ghost", label: "Ghost" },
                    ]}
                />
            </FieldRow>
            <FieldRow label="Boyut">
                <SelectInput value={p.size} onChange={(v) => upd({ size: v })}
                    options={[{ value: "sm", label: "Küçük" }, { value: "md", label: "Orta" }, { value: "lg", label: "Büyük" }]}
                />
            </FieldRow>
            <FieldRow label="Hizalama"><AlignButtons value={align} onChange={(v) => updResponsive("align", v)} /></FieldRow>
            <FieldRow label="Arkaplan"><ColorInput value={p.backgroundColor ?? "#2563eb"} onChange={(v) => upd({ backgroundColor: v })} /></FieldRow>
            <FieldRow label="Metin rengi"><ColorInput value={p.textColor ?? "#ffffff"} onChange={(v) => upd({ textColor: v })} /></FieldRow>
            <FieldRow label="Border radius"><TextInput value={p.borderRadius ?? "0.5rem"} onChange={(v) => upd({ borderRadius: v })} /></FieldRow>
            <FieldRow label="Yeni sekmede aç"><ToggleInput value={p.openInNewTab} onChange={(v) => upd({ openInNewTab: v })} /></FieldRow>
        </>
    );
}
