"use client";

import { useBuilderStore } from "@/core/page-builder/store";
import type { BlockInstance, HtmlProps } from "@/core/page-builder/types";
import { FieldRow, CLS_INPUT } from "../widgets";

export function HtmlEditor({ block }: { block: BlockInstance }) {
    const { updateBlock } = useBuilderStore();
    const p = block.props as HtmlProps;

    return (
        <FieldRow label="HTML">
            <textarea
                className={`${CLS_INPUT} font-mono !text-[0.7rem]`}
                value={p.html}
                onChange={(e) => updateBlock(block.id, { html: e.target.value } as Partial<HtmlProps>)}
                rows={10}
                spellCheck={false}
            />
        </FieldRow>
    );
}
