"use client";

import { useState, useEffect } from "react";
import { useBuilderStore } from "@/core/page-builder/store";
import type { BlockInstance, NavigationMenuProps } from "@/core/page-builder/types";
import { fetchMenuList } from "../../actions";
import { FieldRow, TextInput, ColorInput, SelectInput, AlignButtons, SectionDivider } from "../widgets";
import { CSSValueInput } from "../CSSValueInput";

export function NavigationMenuEditor({ block }: { block: BlockInstance }) {
    const { updateBlock } = useBuilderStore();
    const p = block.props as NavigationMenuProps;
    const upd = (patch: Partial<NavigationMenuProps>) => updateBlock(block.id, patch);
    const [menus, setMenus] = useState<{ id: string; name: string }[]>([]);

    useEffect(() => {
        fetchMenuList().then(setMenus);
    }, []);

    return (
        <>
            <SectionDivider label="Menü" />
            <FieldRow label="Menü seç">
                <SelectInput
                    value={p.menuId}
                    onChange={(v) => upd({ menuId: v })}
                    options={[
                        { value: "", label: "-- Seçiniz --" },
                        ...menus.map((m) => ({ value: m.id, label: m.name })),
                    ]}
                />
            </FieldRow>
            <SectionDivider label="Düzen" />
            <FieldRow label="Yön">
                <SelectInput value={p.layout} onChange={(v) => upd({ layout: v })}
                    options={[
                        { value: "horizontal", label: "Yatay" },
                        { value: "vertical", label: "Dikey" },
                    ]}
                />
            </FieldRow>
            <FieldRow label="Hizalama"><AlignButtons value={p.align} onChange={(v) => upd({ align: v })} /></FieldRow>
            <FieldRow label="Boşluk (gap)">
                <CSSValueInput value={`${p.gap}px`} onChange={(v) => upd({ gap: parseFloat(v) || 0 })} units={["px"]} sliderMax={60} />
            </FieldRow>
            <SectionDivider label="Stil" />
            <FieldRow label="Metin rengi"><ColorInput value={p.textColor} onChange={(v) => upd({ textColor: v })} /></FieldRow>
            <FieldRow label="Hover rengi"><ColorInput value={p.hoverColor} onChange={(v) => upd({ hoverColor: v })} /></FieldRow>
            <FieldRow label="Font boyutu"><TextInput value={p.fontSize} onChange={(v) => upd({ fontSize: v })} placeholder="1rem" /></FieldRow>
        </>
    );
}
