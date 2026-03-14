"use client";

import { useBuilderStore } from "@/core/page-builder/store";
import type { BlockInstance, VideoProps } from "@/core/page-builder/types";
import { FieldRow, TextInput, SelectInput, ToggleInput, SectionDivider } from "../widgets";

export function VideoEditor({ block }: { block: BlockInstance }) {
    const { updateBlock } = useBuilderStore();
    const p = block.props as VideoProps;
    const upd = (patch: Partial<VideoProps>) => updateBlock(block.id, patch);

    return (
        <>
            <FieldRow label="URL"><TextInput value={p.url} onChange={(v) => upd({ url: v })} placeholder="YouTube / Vimeo / MP4 URL" /></FieldRow>
            <SectionDivider label="Boyut" />
            <FieldRow label="Genişlik">
                <TextInput value={p.width ?? ""} onChange={(v) => upd({ width: v || undefined })} placeholder="örn. 100%, 800px" />
            </FieldRow>
            <FieldRow label="Yükseklik">
                <TextInput value={p.height ?? ""} onChange={(v) => upd({ height: v || undefined })} placeholder="örn. auto, 450px" />
            </FieldRow>
            <FieldRow label="Aspect Ratio">
                <SelectInput value={p.aspectRatio} onChange={(v) => upd({ aspectRatio: v })}
                    options={[{ value: "16/9", label: "16:9" }, { value: "4/3", label: "4:3" }, { value: "1/1", label: "1:1" }]}
                />
            </FieldRow>
            <FieldRow label="Otomatik oynat"><ToggleInput value={p.autoplay} onChange={(v) => upd({ autoplay: v })} /></FieldRow>
            <FieldRow label="Sessiz"><ToggleInput value={p.muted} onChange={(v) => upd({ muted: v })} /></FieldRow>
            <FieldRow label="Döngü"><ToggleInput value={p.loop} onChange={(v) => upd({ loop: v })} /></FieldRow>
            <FieldRow label="Kontroller"><ToggleInput value={p.controls} onChange={(v) => upd({ controls: v })} /></FieldRow>
        </>
    );
}
