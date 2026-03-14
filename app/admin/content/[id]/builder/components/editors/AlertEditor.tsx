"use client";

import { useBuilderStore } from "@/core/page-builder/store";
import type { BlockInstance, AlertProps } from "@/core/page-builder/types";
import { FieldRow, TextInput, SelectInput } from "../widgets";

export function AlertEditor({ block }: { block: BlockInstance }) {
    const { updateBlock } = useBuilderStore();
    const p = block.props as AlertProps;
    const upd = (patch: Partial<AlertProps>) => updateBlock(block.id, patch);

    return (
        <>
            <FieldRow label="Başlık"><TextInput value={p.title ?? ""} onChange={(v) => upd({ title: v })} /></FieldRow>
            <FieldRow label="Metin"><TextInput value={p.text} onChange={(v) => upd({ text: v })} multiline /></FieldRow>
            <FieldRow label="Varyant">
                <SelectInput value={p.variant} onChange={(v) => upd({ variant: v })}
                    options={[
                        { value: "info", label: "Bilgi" },
                        { value: "success", label: "Başarı" },
                        { value: "warning", label: "Uyarı" },
                        { value: "error", label: "Hata" },
                    ]}
                />
            </FieldRow>
        </>
    );
}
