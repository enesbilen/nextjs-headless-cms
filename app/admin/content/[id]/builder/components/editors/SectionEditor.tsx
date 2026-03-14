"use client";

import { useState } from "react";
import { useBuilderStore } from "@/core/page-builder/store";
import { getValueForDevice } from "@/core/page-builder/responsiveStyles";
import { CSSValueInput, SpacingControl } from "../CSSValueInput";
import type { BlockInstance, SectionProps } from "@/core/page-builder/types";
import { FieldRow, TextInput, ColorInput, SelectInput, SectionDivider, BackgroundImageField, DeviceHint } from "../widgets";

export function SectionEditor({ block }: { block: BlockInstance }) {
    const { updateBlock, device } = useBuilderStore();
    const p = block.props as SectionProps;
    const r = p.responsive;
    const paddingTop = getValueForDevice(p.paddingTop, r?.tablet?.paddingTop, r?.mobile?.paddingTop, device);
    const paddingBottom = getValueForDevice(p.paddingBottom, r?.tablet?.paddingBottom, r?.mobile?.paddingBottom, device);
    const paddingLeft = getValueForDevice(p.paddingLeft, r?.tablet?.paddingLeft, r?.mobile?.paddingLeft, device);
    const paddingRight = getValueForDevice(p.paddingRight, r?.tablet?.paddingRight, r?.mobile?.paddingRight, device);

    const upd = (patch: Partial<SectionProps>) => updateBlock(block.id, patch);
    const updResponsive = (key: "paddingTop" | "paddingBottom" | "paddingLeft" | "paddingRight", value: number) => {
        if (device === "desktop") { upd({ [key]: value }); return; }
        upd({ responsive: { ...p.responsive, [device]: { ...p.responsive?.[device], [key]: value } } });
    };

    const [tab, setTab] = useState<"layout" | "style">("layout");

    return (
        <>
            <DeviceHint device={device} />
            <div className="flex gap-0.5 p-1 bg-slate-900 rounded-lg mb-1">
                <button className={`flex-1 py-[5px] px-2 rounded-md border-none cursor-pointer text-[0.72rem] font-semibold transition-all whitespace-nowrap ${tab === "layout" ? "bg-builder-active text-blue-400" : "bg-transparent text-slate-500 hover:text-slate-200"}`} onClick={() => setTab("layout")}>Düzen</button>
                <button className={`flex-1 py-[5px] px-2 rounded-md border-none cursor-pointer text-[0.72rem] font-semibold transition-all whitespace-nowrap ${tab === "style" ? "bg-builder-active text-blue-400" : "bg-transparent text-slate-500 hover:text-slate-200"}`} onClick={() => setTab("style")}>Stil</button>
            </div>

            {tab === "layout" && (
                <>
                    <SectionDivider label="Bölüm genişliği" />
                    <FieldRow label="Genişlik">
                        <SelectInput
                            value={
                                p.maxWidth === "100%" && !p.innerMaxWidth
                                    ? "full"
                                    : p.maxWidth === "1200px" && !p.innerMaxWidth
                                        ? "boxed"
                                        : p.maxWidth === "760px" && p.innerMaxWidth === "760px"
                                            ? "narrow"
                                            : "custom"
                            }
                            onChange={(v) => {
                                if (v === "full") upd({ maxWidth: "100%", innerMaxWidth: undefined });
                                else if (v === "boxed") upd({ maxWidth: "1200px", innerMaxWidth: undefined });
                                else if (v === "narrow") upd({ maxWidth: "760px", innerMaxWidth: "760px" });
                            }}
                            options={[
                                { value: "full", label: "Tam genişlik" },
                                { value: "boxed", label: "Kutu (1200px)" },
                                { value: "narrow", label: "Dar (760px)" },
                                { value: "custom", label: "Özel" },
                            ]}
                        />
                    </FieldRow>
                    <FieldRow label="Dış max genişlik">
                        <CSSValueInput
                            value={p.maxWidth ?? "1200px"}
                            onChange={(v) => upd({ maxWidth: v })}
                            units={["px", "%", "rem"]}
                            sliderMax={2000}
                            min={0}
                        />
                    </FieldRow>
                    <FieldRow label="İç içerik max genişlik">
                        <CSSValueInput
                            value={p.innerMaxWidth ?? ""}
                            onChange={(v) => upd({ innerMaxWidth: v || undefined })}
                            units={["px", "%", "rem"]}
                            sliderMax={2000}
                            min={0}
                            allowAuto
                        />
                    </FieldRow>
                    <SectionDivider label="Boşluklar" />
                    <FieldRow label="Padding">
                        <SpacingControl
                            value={{
                                top: `${paddingTop}px`,
                                right: `${paddingRight}px`,
                                bottom: `${paddingBottom}px`,
                                left: `${paddingLeft}px`,
                            }}
                            onChange={(side, v) => {
                                const key = `padding${side.charAt(0).toUpperCase() + side.slice(1)}` as "paddingTop" | "paddingRight" | "paddingBottom" | "paddingLeft";
                                updResponsive(key, parseFloat(v) || 0);
                            }}
                        />
                    </FieldRow>
                    <FieldRow label="Gap (sütun arası)">
                        <CSSValueInput value={`${p.gap}px`} onChange={(v) => upd({ gap: parseFloat(v) || 0 })} units={["px", "rem"]} sliderMax={80} />
                    </FieldRow>
                </>
            )}

            {tab === "style" && (
                <>
                    <SectionDivider label="Arkaplan" />
                    <FieldRow label="Arkaplan rengi"><ColorInput value={p.backgroundColor} onChange={(v) => upd({ backgroundColor: v })} /></FieldRow>
                    <BackgroundImageField value={p.backgroundImage ?? ""} onChange={(v) => upd({ backgroundImage: v })} />
                </>
            )}
        </>
    );
}
