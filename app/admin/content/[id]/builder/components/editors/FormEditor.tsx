"use client";

import { useBuilderStore } from "@/core/page-builder/store";
import type { BlockInstance, FormProps, FormField } from "@/core/page-builder/types";
import { FieldRow, TextInput, ColorInput, SelectInput, ToggleInput, SectionDivider } from "../widgets";

export function FormEditor({ block }: { block: BlockInstance }) {
    const { updateBlock } = useBuilderStore();
    const p = block.props as FormProps;
    const upd = (patch: Partial<FormProps>) => updateBlock(block.id, patch);
    const fields = p.fields ?? [];

    const setField = (i: number, patch: Partial<FormField>) => {
        const next = [...fields];
        next[i] = { ...next[i], ...patch };
        upd({ fields: next });
    };
    const addField = () => upd({ fields: [...fields, { label: "Yeni alan", type: "text", required: false }] });
    const removeField = (i: number) => upd({ fields: fields.filter((_, idx) => idx !== i) });

    return (
        <>
            <SectionDivider label="Form Alanları" />
            {fields.map((field, i) => (
                <div key={i} className="rounded-lg border border-builder-line bg-slate-900/50 p-2 mb-2">
                    <div className="flex items-center justify-between gap-1 mb-1">
                        <span className="text-[0.7rem] text-slate-500">Alan {i + 1}</span>
                        <button type="button" onClick={() => removeField(i)} className="text-red-400 hover:text-red-300 text-[0.7rem]">Sil</button>
                    </div>
                    <FieldRow label="Etiket"><TextInput value={field.label} onChange={(v) => setField(i, { label: v })} /></FieldRow>
                    <FieldRow label="Tip">
                        <SelectInput value={field.type} onChange={(v) => setField(i, { type: v as FormField["type"] })}
                            options={[
                                { value: "text", label: "Metin" },
                                { value: "email", label: "E-posta" },
                                { value: "textarea", label: "Metin alanı" },
                            ]}
                        />
                    </FieldRow>
                    <FieldRow label="Zorunlu"><ToggleInput value={field.required} onChange={(v) => setField(i, { required: v })} /></FieldRow>
                </div>
            ))}
            <button type="button" onClick={addField} className="py-1.5 px-2 rounded border border-builder-line bg-slate-800 text-slate-300 text-[0.72rem] cursor-pointer hover:bg-builder-line">+ Alan ekle</button>
            <SectionDivider label="Stil" />
            <FieldRow label="Gönder butonu"><TextInput value={p.submitLabel} onChange={(v) => upd({ submitLabel: v })} /></FieldRow>
            <FieldRow label="Arkaplan"><ColorInput value={p.backgroundColor ?? "#ffffff"} onChange={(v) => upd({ backgroundColor: v })} /></FieldRow>
            <FieldRow label="Buton rengi"><ColorInput value={p.buttonColor ?? "#2563eb"} onChange={(v) => upd({ buttonColor: v })} /></FieldRow>
        </>
    );
}
