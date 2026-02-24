"use client";

/**
 * SortableBlockItem
 * -----------------
 * Unified sortable block wrapper for BOTH root-level blocks
 * and child blocks inside columns.
 *
 * For Section blocks, renders a column-layout picker so the user
 * can choose a column structure (WordPress-style).
 */

import { useState } from "react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { useBuilderStore } from "@/core/page-builder/store";
import type {
    BlockInstance,
    BlockType,
    ColumnsProps,
    SectionProps,
    ColumnSettings,
} from "@/core/page-builder/types";
import { getBlockDefinition } from "@/core/page-builder/blocks/definitions";
import { DropZoneColumn } from "./DropZoneColumn";

// ---------------------------------------------------------------------------
// Column layout presets  (WordPress-style picker)
// ---------------------------------------------------------------------------

interface ColLayout {
    id: string;
    label: string;
    icon: React.ReactNode;
    type: BlockType;
    columnWidths?: string[];
}

const COL_LAYOUTS: ColLayout[] = [
    {
        id: "1",
        label: "1 Sütun",
        type: "section",
        icon: (
            <svg viewBox="0 0 40 28" fill="currentColor" width={40} height={28}>
                <rect x="2" y="2" width="36" height="24" rx="2" />
            </svg>
        ),
    },
    {
        id: "1-1",
        label: "1 : 1",
        type: "columns-2",
        columnWidths: ["1fr", "1fr"],
        icon: (
            <svg viewBox="0 0 40 28" fill="currentColor" width={40} height={28}>
                <rect x="2" y="2" width="16" height="24" rx="2" />
                <rect x="22" y="2" width="16" height="24" rx="2" />
            </svg>
        ),
    },
    {
        id: "1-2",
        label: "1 : 2",
        type: "columns-2",
        columnWidths: ["1fr", "2fr"],
        icon: (
            <svg viewBox="0 0 40 28" fill="currentColor" width={40} height={28}>
                <rect x="2" y="2" width="10" height="24" rx="2" />
                <rect x="16" y="2" width="22" height="24" rx="2" />
            </svg>
        ),
    },
    {
        id: "2-1",
        label: "2 : 1",
        type: "columns-2",
        columnWidths: ["2fr", "1fr"],
        icon: (
            <svg viewBox="0 0 40 28" fill="currentColor" width={40} height={28}>
                <rect x="2" y="2" width="22" height="24" rx="2" />
                <rect x="28" y="2" width="10" height="24" rx="2" />
            </svg>
        ),
    },
    {
        id: "1-1-1",
        label: "1 : 1 : 1",
        type: "columns-3",
        columnWidths: ["1fr", "1fr", "1fr"],
        icon: (
            <svg viewBox="0 0 40 28" fill="currentColor" width={40} height={28}>
                <rect x="2" y="2" width="10" height="24" rx="2" />
                <rect x="15" y="2" width="10" height="24" rx="2" />
                <rect x="28" y="2" width="10" height="24" rx="2" />
            </svg>
        ),
    },
    {
        id: "1-2-1",
        label: "1 : 2 : 1",
        type: "columns-3",
        columnWidths: ["1fr", "2fr", "1fr"],
        icon: (
            <svg viewBox="0 0 40 28" fill="currentColor" width={40} height={28}>
                <rect x="2" y="2" width="8" height="24" rx="2" />
                <rect x="13" y="2" width="14" height="24" rx="2" />
                <rect x="30" y="2" width="8" height="24" rx="2" />
            </svg>
        ),
    },
];

// ---------------------------------------------------------------------------
// Section layout picker  (shown inside empty section)
// ---------------------------------------------------------------------------

function SectionLayoutPicker({ sectionId }: { sectionId: string }) {
    const { addBlock } = useBuilderStore();
    const [selected, setSelected] = useState<string | null>(null);

    const handleSelect = (layout: ColLayout) => {
        setSelected(layout.id);
        if (layout.type === "section") return;
        addBlock(layout.type, sectionId, 0);
    };

    return (
        <div className="flex flex-col items-center gap-3 py-6 px-4 min-h-[120px]">
            <div className="text-xs font-semibold text-gray-400 uppercase tracking-wide">
                Sütun düzeni seç
            </div>
            <div className="flex gap-2 flex-wrap justify-center">
                {COL_LAYOUTS.map((layout) => (
                    <button
                        key={layout.id}
                        className={`flex flex-col items-center gap-[5px] py-2 px-2.5 rounded-lg cursor-pointer transition-all text-[0.65rem] ${
                            selected === layout.id
                                ? "border-2 border-blue-500 bg-blue-500/15 text-blue-400"
                                : "border-2 border-transparent bg-white/[0.04] text-slate-400 hover:border-blue-500 hover:bg-blue-500/[0.08] hover:text-blue-400"
                        }`}
                        onClick={(e) => {
                            e.stopPropagation();
                            handleSelect(layout);
                        }}
                        title={layout.label}
                    >
                        <span className="[&_svg]:opacity-70 hover:[&_svg]:opacity-100">{layout.icon}</span>
                        <span className="whitespace-nowrap font-medium">{layout.label}</span>
                    </button>
                ))}
            </div>
        </div>
    );
}

// ---------------------------------------------------------------------------
// Leaf block visual preview
// ---------------------------------------------------------------------------

function LeafPreview({ block }: { block: BlockInstance }) {
    const def = getBlockDefinition(block.type);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const p = block.props as any;

    switch (block.type) {
        case "heading":
            return (
                <div style={{ textAlign: p.align, color: p.color, fontWeight: p.fontWeight ?? "bold", fontSize: "1.1rem", lineHeight: 1.3 }}>
                    {p.text || "Başlık"}
                </div>
            );
        case "text":
            return (
                <div style={{ textAlign: p.align, color: p.color, fontSize: "0.875rem", lineHeight: 1.5, whiteSpace: "pre-wrap" }}>
                    {p.text || "Metin içeriği"}
                </div>
            );
        case "button":
            return (
                <div style={{ textAlign: p.align }}>
                    <span style={{
                        display: "inline-block",
                        background: p.backgroundColor ?? "#2563eb",
                        color: p.textColor ?? "#fff",
                        padding: "0.4rem 1rem",
                        borderRadius: p.borderRadius ?? "0.375rem",
                        fontSize: "0.875rem",
                        fontWeight: 600,
                    }}>
                        {p.label || "Buton"}
                    </span>
                </div>
            );
        case "image":
            return (
                <div style={{
                    aspectRatio: p.aspectRatio ?? "16/9",
                    background: p.src ? undefined : "#e5e7eb",
                    borderRadius: p.borderRadius,
                    overflow: "hidden",
                    display: "flex", alignItems: "center", justifyContent: "center",
                }}>
                    {p.src
                        // eslint-disable-next-line @next/next/no-img-element
                        ? <img src={p.src} alt={p.alt} style={{ width: "100%", objectFit: p.objectFit, display: "block" }} />
                        : <span style={{ color: "#9ca3af", fontSize: "1.5rem" }}>🖼</span>
                    }
                </div>
            );
        case "divider":
            return <hr style={{ border: "none", borderTop: `${p.thickness}px ${p.style} ${p.color}`, margin: `${p.marginTop}px 0 ${p.marginBottom}px` }} />;
        case "spacer":
            return <div style={{ height: Math.min(p.height, 80), background: "repeating-linear-gradient(45deg,#f9fafb,#f9fafb 6px,#e5e7eb 6px,#e5e7eb 12px)", opacity: 0.5, borderRadius: 4 }} />;
        case "hero":
            return (
                <div style={{ background: p.backgroundColor, color: p.textColor, padding: "2rem 1.5rem", textAlign: p.align, borderRadius: 4, minHeight: 80 }}>
                    <div style={{ fontWeight: 800, fontSize: "1.3rem" }}>{p.heading}</div>
                    {p.subheading && <div style={{ opacity: 0.7, marginTop: 4, fontSize: "0.875rem" }}>{p.subheading}</div>}
                </div>
            );
        case "card":
            return (
                <div style={{ border: "1px solid #e5e7eb", borderRadius: p.borderRadius, padding: "0.75rem", background: p.backgroundColor, fontSize: "0.875rem" }}>
                    <div style={{ fontWeight: 700 }}>{p.title}</div>
                    <div style={{ color: "#6b7280", marginTop: 2 }}>{p.description}</div>
                </div>
            );
        case "video":
            return (
                <div style={{ background: "#111", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", aspectRatio: "16/9", borderRadius: 4, fontSize: "1.25rem" }}>
                    ▶ {p.url ? "Video" : "Video URL giriniz"}
                </div>
            );
        case "html":
            return (
                <div style={{ background: "#f3f4f6", padding: "0.5rem 0.75rem", borderRadius: 4, fontFamily: "monospace", fontSize: "0.7rem", color: "#374151", maxHeight: 60, overflow: "hidden" }}>
                    {p.html || "<html>"}
                </div>
            );
        default:
            return (
                <div style={{ background: "#f9fafb", padding: "0.75rem", borderRadius: 4, textAlign: "center", color: "#6b7280" }}>
                    {def.icon} {def.label}
                </div>
            );
    }
}

// ---------------------------------------------------------------------------
// Container block preview (Section / Columns)
// ---------------------------------------------------------------------------

function ContainerPreview({
    block,
    renderBlock,
}: {
    block: BlockInstance;
    renderBlock: (b: BlockInstance, parentId: string, colIdx: number) => React.ReactNode;
}) {
    if (block.type === "section") {
        const p = block.props as SectionProps;
        const col = block.children?.[0] ?? [];
        const isEmpty = col.length === 0;

        return (
            <div
                style={{
                    backgroundColor: p.backgroundColor === "transparent" ? "rgba(0,0,0,0.02)" : p.backgroundColor,
                    padding: `${p.paddingTop ?? 0}px ${p.paddingRight ?? 0}px ${p.paddingBottom ?? 0}px ${p.paddingLeft ?? 0}px`,
                    minHeight: isEmpty ? 120 : undefined,
                }}
            >
                {isEmpty ? (
                    <SectionLayoutPicker sectionId={block.id} />
                ) : (
                    <DropZoneColumn
                        parentId={block.id}
                        colIdx={0}
                        addLabel="Bölüme eleman ekle"
                        renderBlock={renderBlock}
                    >
                        {col}
                    </DropZoneColumn>
                )}
            </div>
        );
    }

    const p = block.props as ColumnsProps;
    const widths = p.columnWidths ?? Array(p.columns).fill("1fr");
    const colSettings: ColumnSettings[] = p.columnSettings ?? [];

    return (
        <div
            style={{
                display: "grid",
                gridTemplateColumns: widths.join(" "),
                gap: p.gap ?? 16,
                minHeight: 60,
                backgroundColor: p.backgroundColor === "transparent" ? "rgba(0,0,0,0.02)" : p.backgroundColor,
            }}
        >
            {Array.from({ length: p.columns }).map((_, i) => {
                const colBlocks = block.children?.[i] ?? [];
                const cs = colSettings[i] ?? {};
                return (
                    <DropZoneColumn
                        key={i}
                        parentId={block.id}
                        colIdx={i}
                        addLabel={`Sütun ${i + 1}`}
                        renderBlock={renderBlock}
                        columnStyle={cs}
                    >
                        {colBlocks}
                    </DropZoneColumn>
                );
            })}
        </div>
    );
}

// ---------------------------------------------------------------------------
// Sortable block item — unified for root + nested
// ---------------------------------------------------------------------------

interface SortableBlockItemProps {
    block: BlockInstance;
    parentId: string | null;
    colIdx: number | null;
    depth?: number;
}

export function SortableBlockItem({
    block,
    parentId,
    colIdx,
    depth = 0,
}: SortableBlockItemProps) {
    const { selectedId, selectBlock, deleteBlock, duplicateBlock } = useBuilderStore();
    const isSelected = selectedId === block.id;
    const def = getBlockDefinition(block.type);
    const isContainer = block.type === "section" || block.type === "columns-2" || block.type === "columns-3";

    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging,
    } = useSortable({
        id: block.id,
        data: {
            blockId: block.id,
            fromPalette: false,
            parentId,
            colIdx,
            sortable: { containerId: parentId ? `col:${parentId}:${colIdx}` : "root" },
        },
    });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.3 : 1,
    };

    const renderBlock = (b: BlockInstance, pId: string, cIdx: number) => (
        <SortableBlockItem key={b.id} block={b} parentId={pId} colIdx={cIdx} depth={depth + 1} />
    );

    const isNested = depth > 0;
    const barBg = depth === 1 ? "bg-violet-600" : depth >= 2 ? "bg-cyan-600" : "bg-blue-600";
    const borderHover = depth === 1
        ? "hover:border-violet-600"
        : depth >= 2
            ? "hover:border-cyan-600"
            : "hover:border-blue-400";
    const borderSelected = depth === 1
        ? "!border-violet-600"
        : depth >= 2
            ? "!border-cyan-600"
            : "!border-blue-600";

    return (
        <div
            ref={setNodeRef}
            style={style}
            data-block-id={block.id}
            className={`group/block relative border-2 border-transparent transition-colors cursor-pointer ${borderHover} ${isSelected ? borderSelected : ""} ${isDragging ? "opacity-25 outline-2 outline-dashed outline-blue-500 rounded" : ""} ${isNested ? "m-0 rounded" : ""}`}
            onClick={(e) => { e.stopPropagation(); selectBlock(block.id); }}
        >
            {/* Action bar */}
            <div className={`${isNested ? `relative rounded-t-sm border-b border-white/20 h-[22px] flex text-[0.65rem]` : `${isSelected ? "flex" : "hidden group-hover/block:flex"} absolute -top-7 -left-0.5 h-7 rounded-t z-20`} ${barBg} items-center gap-1 px-1.5 whitespace-nowrap`}>
                <span
                    className="cursor-grab text-white text-[0.9rem] opacity-70 leading-none p-0.5"
                    {...attributes}
                    {...listeners}
                    title="Sürükle"
                    onClick={(e) => e.stopPropagation()}
                >
                    ⠿
                </span>
                <span className="text-[0.7rem] font-semibold text-white/90">
                    {def.icon} {def.label}
                </span>
                <div className="flex gap-0.5 ml-auto">
                    <button
                        className="w-5 h-5 inline-flex items-center justify-center rounded-[3px] border-none bg-white/15 text-white cursor-pointer text-[0.7rem] transition-colors hover:bg-white/30"
                        onClick={(e) => { e.stopPropagation(); duplicateBlock(block.id); }}
                        title="Kopyala"
                    >⧉</button>
                    <button
                        className="w-5 h-5 inline-flex items-center justify-center rounded-[3px] border-none bg-white/15 text-white cursor-pointer text-[0.7rem] transition-colors hover:bg-red-500"
                        onClick={(e) => { e.stopPropagation(); deleteBlock(block.id); }}
                        title="Sil"
                    >✕</button>
                </div>
            </div>

            {/* Block content */}
            <div className="p-1">
                {isContainer
                    ? <ContainerPreview block={block} renderBlock={renderBlock} />
                    : <LeafPreview block={block} />
                }
            </div>
        </div>
    );
}
