"use client";

import { useBuilderStore } from "@/core/page-builder/store";
import { SpacingControl, BorderRadiusControl } from "../CSSValueInput";
import type { BlockInstance, AdvancedStyle } from "@/core/page-builder/types";
import { FieldRow, TextInput, ColorInput, SelectInput, SectionDivider, NumberInput } from "../widgets";

export function AdvancedStyleEditor({ block }: { block: BlockInstance }) {
    const { updateBlockAdvancedStyle } = useBuilderStore();
    const s = block.advancedStyle ?? {};

    const upd = (patch: Partial<AdvancedStyle>) => {
        const next = { ...s, ...patch };
        const isEmpty = !next.marginTop && !next.marginRight && !next.marginBottom && !next.marginLeft &&
            !next.borderWidth && (!next.borderStyle || next.borderStyle === "none") && !next.borderColor &&
            !next.borderRadius && !next.boxShadow && (next.opacity == null || next.opacity === 1) &&
            (!next.overflow || next.overflow === "visible") && !next.customClassName;
        updateBlockAdvancedStyle(block.id, isEmpty ? undefined : next);
    };

    return (
        <>
            <SectionDivider label="Dış Boşluk (Margin)" />
            <SpacingControl
                value={{
                    top: s.marginTop ?? "0px",
                    right: s.marginRight ?? "0px",
                    bottom: s.marginBottom ?? "0px",
                    left: s.marginLeft ?? "0px",
                }}
                onChange={(side, v) => {
                    const key = `margin${side.charAt(0).toUpperCase() + side.slice(1)}` as keyof AdvancedStyle;
                    upd({ [key]: v });
                }}
            />

            <SectionDivider label="Kenarlık (Border)" />
            <FieldRow label="Genişlik">
                <TextInput value={s.borderWidth ?? ""} onChange={(v) => upd({ borderWidth: v })} placeholder="0px" />
            </FieldRow>
            <FieldRow label="Stil">
                <SelectInput
                    value={s.borderStyle ?? "none"}
                    onChange={(v) => upd({ borderStyle: v })}
                    options={[
                        { value: "none", label: "Yok" },
                        { value: "solid", label: "Solid" },
                        { value: "dashed", label: "Dashed" },
                        { value: "dotted", label: "Dotted" },
                        { value: "double", label: "Double" },
                    ]}
                />
            </FieldRow>
            <FieldRow label="Renk">
                <ColorInput value={s.borderColor ?? "#000000"} onChange={(v) => upd({ borderColor: v })} />
            </FieldRow>
            <FieldRow label="Köşe yuvarlama">
                <BorderRadiusControl
                    value={s.borderRadius ?? "0px"}
                    onChange={(v) => upd({ borderRadius: v })}
                />
            </FieldRow>

            <SectionDivider label="Gölge (Box Shadow)" />
            <FieldRow label="CSS Shadow">
                <TextInput value={s.boxShadow ?? ""} onChange={(v) => upd({ boxShadow: v })} placeholder="0 4px 6px rgba(0,0,0,0.1)" />
            </FieldRow>

            <SectionDivider label="Opaklık" />
            <FieldRow label="Opaklık">
                <NumberInput
                    value={s.opacity ?? 1}
                    onChange={(v) => upd({ opacity: v })}
                    min={0}
                    max={1}
                    step={0.05}
                    showSlider
                />
            </FieldRow>

            <SectionDivider label="Taşma (Overflow)" />
            <FieldRow label="Overflow">
                <SelectInput
                    value={s.overflow ?? "visible"}
                    onChange={(v) => upd({ overflow: v })}
                    options={[
                        { value: "visible", label: "Visible" },
                        { value: "hidden", label: "Hidden" },
                        { value: "auto", label: "Auto" },
                        { value: "scroll", label: "Scroll" },
                    ]}
                />
            </FieldRow>

            <SectionDivider label="Özel CSS Sınıfı" />
            <FieldRow label="className">
                <TextInput value={s.customClassName ?? ""} onChange={(v) => upd({ customClassName: v })} placeholder="my-custom-class" />
            </FieldRow>
        </>
    );
}
