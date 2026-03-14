"use client";

import { useBuilderStore } from "@/core/page-builder/store";
import type { BlockInstance, SocialLinksProps, SocialLink } from "@/core/page-builder/types";
import { FieldRow, TextInput, ColorInput, SelectInput, AlignButtons, SectionDivider } from "../widgets";

const PLATFORMS: { value: SocialLink["platform"]; label: string }[] = [
    { value: "facebook", label: "Facebook" },
    { value: "twitter", label: "Twitter / X" },
    { value: "instagram", label: "Instagram" },
    { value: "linkedin", label: "LinkedIn" },
    { value: "youtube", label: "YouTube" },
    { value: "github", label: "GitHub" },
    { value: "tiktok", label: "TikTok" },
    { value: "website", label: "Website" },
];

export function SocialLinksEditor({ block }: { block: BlockInstance }) {
    const { updateBlock } = useBuilderStore();
    const p = block.props as SocialLinksProps;
    const upd = (patch: Partial<SocialLinksProps>) => updateBlock(block.id, patch);
    const links = p.links ?? [];

    const setLink = (i: number, patch: Partial<SocialLink>) => {
        const next = [...links];
        next[i] = { ...next[i], ...patch };
        upd({ links: next });
    };
    const addLink = () => upd({ links: [...links, { platform: "website", url: "#" }] });
    const removeLink = (i: number) => upd({ links: links.filter((_, idx) => idx !== i) });

    return (
        <>
            <SectionDivider label="Linkler" />
            {links.map((link, i) => (
                <div key={i} className="rounded-lg border border-builder-line bg-slate-900/50 p-2 mb-2">
                    <div className="flex items-center justify-between gap-1 mb-1">
                        <span className="text-[0.7rem] text-slate-500">Link {i + 1}</span>
                        <button type="button" onClick={() => removeLink(i)} className="text-red-400 hover:text-red-300 text-[0.7rem]">Sil</button>
                    </div>
                    <FieldRow label="Platform">
                        <SelectInput value={link.platform} onChange={(v) => setLink(i, { platform: v as SocialLink["platform"] })} options={PLATFORMS} />
                    </FieldRow>
                    <FieldRow label="URL"><TextInput value={link.url} onChange={(v) => setLink(i, { url: v })} placeholder="https://..." /></FieldRow>
                </div>
            ))}
            <button type="button" onClick={addLink} className="py-1.5 px-2 rounded border border-builder-line bg-slate-800 text-slate-300 text-[0.72rem] cursor-pointer hover:bg-builder-line">+ Link ekle</button>
            <SectionDivider label="Stil" />
            <FieldRow label="Boyut">
                <SelectInput value={p.size} onChange={(v) => upd({ size: v })}
                    options={[{ value: "sm", label: "Küçük" }, { value: "md", label: "Orta" }, { value: "lg", label: "Büyük" }]}
                />
            </FieldRow>
            <FieldRow label="Hizalama"><AlignButtons value={p.align} onChange={(v) => upd({ align: v })} /></FieldRow>
            <FieldRow label="Renk"><ColorInput value={p.color ?? "#6b7280"} onChange={(v) => upd({ color: v })} /></FieldRow>
        </>
    );
}
