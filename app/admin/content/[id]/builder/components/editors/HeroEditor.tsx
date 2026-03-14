"use client";

import { useBuilderStore } from "@/core/page-builder/store";
import { getValueForDevice } from "@/core/page-builder/responsiveStyles";
import { CSSValueInput } from "../CSSValueInput";
import type { BlockInstance, HeroProps, AlignValue } from "@/core/page-builder/types";
import { FieldRow, TextInput, ColorInput, AlignButtons, BackgroundImageField, DeviceHint } from "../widgets";

export function HeroEditor({ block }: { block: BlockInstance }) {
    const { updateBlock, device } = useBuilderStore();
    const p = block.props as HeroProps;
    const r = p.responsive;
    const align = getValueForDevice(p.align, r?.tablet?.align, r?.mobile?.align, device);

    const upd = (patch: Partial<HeroProps>) => updateBlock(block.id, patch);
    const updResponsive = (value: AlignValue) => {
        if (device === "desktop") { upd({ align: value }); return; }
        upd({ responsive: { ...p.responsive, [device]: { ...p.responsive?.[device], align: value } } });
    };

    return (
        <>
            <DeviceHint device={device} />
            <FieldRow label="Başlık"><TextInput value={p.heading} onChange={(v) => upd({ heading: v })} multiline /></FieldRow>
            <FieldRow label="Alt başlık"><TextInput value={p.subheading} onChange={(v) => upd({ subheading: v })} multiline /></FieldRow>
            <FieldRow label="Buton etiketi"><TextInput value={p.buttonLabel} onChange={(v) => upd({ buttonLabel: v })} /></FieldRow>
            <FieldRow label="Buton linki"><TextInput value={p.buttonHref} onChange={(v) => upd({ buttonHref: v })} /></FieldRow>
            <FieldRow label="Arkaplan rengi"><ColorInput value={p.backgroundColor} onChange={(v) => upd({ backgroundColor: v })} /></FieldRow>
            <FieldRow label="Metin rengi"><ColorInput value={p.textColor} onChange={(v) => upd({ textColor: v })} /></FieldRow>
            <FieldRow label="Hizalama"><AlignButtons value={align} onChange={(v) => updResponsive(v)} /></FieldRow>
            <FieldRow label="Yükseklik"><TextInput value={p.height ?? "500px"} onChange={(v) => upd({ height: v })} placeholder="500px" /></FieldRow>
            <BackgroundImageField value={p.backgroundImage ?? ""} onChange={(v) => upd({ backgroundImage: v })} />
            <FieldRow label="Overlay opaklık"><CSSValueInput value={`${Math.round((p.overlayOpacity ?? 0.5) * 100)}%`} onChange={(v) => upd({ overlayOpacity: (parseFloat(v) || 0) / 100 })} units={["%"]} sliderMax={100} min={0} /></FieldRow>
        </>
    );
}
