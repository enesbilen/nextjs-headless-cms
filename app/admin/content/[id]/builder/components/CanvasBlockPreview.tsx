"use client";

import type { BlockInstance, ColumnsProps, SectionProps } from "@/core/page-builder/types";
import { useBuilderStore } from "@/core/page-builder/store";
import { getBlockDefinition } from "@/core/page-builder/blocks/definitions";

// ---------------------------------------------------------------------------
// Visual preview of a block inside the canvas (simplified, no dnd)
// ---------------------------------------------------------------------------

export function CanvasBlockPreview({ block, depth }: { block: BlockInstance; depth: number }) {
    const { addBlock } = useBuilderStore();

    if (block.type === "section") {
        const p = block.props as SectionProps;
        const col = block.children?.[0] ?? [];
        return (
            <div
                style={{
                    backgroundColor: p.backgroundColor === "transparent" ? "rgba(0,0,0,0.02)" : p.backgroundColor,
                    padding: `${p.paddingTop}px ${p.paddingRight}px ${p.paddingBottom}px ${p.paddingLeft}px`,
                    minHeight: 80,
                    border: "1px dashed #d1d5db",
                    borderRadius: 4,
                    display: "flex",
                    flexDirection: "column",
                    gap: p.gap,
                }}
            >
                {col.length === 0 ? (
                    <button
                        className="w-full border-2 border-dashed border-gray-300 rounded-md p-3 text-center bg-transparent text-gray-400 text-xs cursor-pointer transition-all hover:border-blue-400 hover:text-blue-400 hover:bg-blue-400/[0.05]"
                        onClick={(e) => { e.stopPropagation(); addBlock("heading", block.id, 0); }}
                    >
                        + Eleman ekle
                    </button>
                ) : (
                    col.map((child) => (
                        <CanvasChildBlock key={child.id} block={child} parentId={block.id} colIdx={0} depth={depth + 1} />
                    ))
                )}
            </div>
        );
    }

    if (block.type === "columns-2" || block.type === "columns-3") {
        const p = block.props as ColumnsProps;
        return (
            <div
                style={{
                    display: "grid",
                    gridTemplateColumns: (block.props as ColumnsProps).columnWidths?.join(" ") ?? `repeat(${p.columns}, 1fr)`,
                    gap: p.gap,
                    minHeight: 80,
                    backgroundColor: p.backgroundColor === "transparent" ? "rgba(0,0,0,0.02)" : p.backgroundColor,
                }}
            >
                {Array.from({ length: p.columns }).map((_, i) => {
                    const colBlocks = block.children?.[i] ?? [];
                    return (
                        <div
                            key={i}
                            style={{
                                border: "1px dashed #d1d5db",
                                borderRadius: 4,
                                padding: 8,
                                minHeight: 60,
                                display: "flex",
                                flexDirection: "column",
                                gap: 8,
                            }}
                        >
                            {colBlocks.length === 0 ? (
                                <button
                                    className="w-full border-2 border-dashed border-gray-300 rounded-md p-3 text-center bg-transparent text-gray-400 text-xs cursor-pointer transition-all hover:border-blue-400 hover:text-blue-400 hover:bg-blue-400/[0.05]"
                                    onClick={(e) => { e.stopPropagation(); addBlock("text", block.id, i); }}
                                >
                                    + Sütun {i + 1}
                                </button>
                            ) : (
                                colBlocks.map((child) => (
                                    <CanvasChildBlock key={child.id} block={child} parentId={block.id} colIdx={i} depth={depth + 1} />
                                ))
                            )}
                        </div>
                    );
                })}
            </div>
        );
    }

    return <LeafBlockPreview block={block} />;
}

// ---------------------------------------------------------------------------
// Leaf block visual preview
// ---------------------------------------------------------------------------

function LeafBlockPreview({ block }: { block: BlockInstance }) {
    const def = getBlockDefinition(block.type);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const p = block.props as any;

    switch (block.type) {
        case "heading":
            return (
                <div style={{ textAlign: p.align, color: p.color, fontWeight: p.fontWeight ?? "bold", fontSize: "1.25rem" }}>
                    {p.text || "Başlık"}
                </div>
            );
        case "text":
            return (
                <div style={{ textAlign: p.align, color: p.color, fontSize: "0.875rem", whiteSpace: "pre-wrap" }}>
                    {p.text || "Metin"}
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
                    background: p.src ? undefined : "#f3f4f6",
                    borderRadius: p.borderRadius,
                    overflow: "hidden",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                }}>
                    {p.src ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={p.src} alt={p.alt} style={{ width: "100%", objectFit: p.objectFit, display: "block" }} />
                    ) : (
                        <span style={{ color: "#9ca3af" }}>🖼 Görsel</span>
                    )}
                </div>
            );
        case "divider":
            return <hr style={{ border: "none", borderTop: `${p.thickness}px ${p.style} ${p.color}`, margin: `${p.marginTop}px 0` }} />;
        case "spacer":
            return <div style={{ height: p.height, background: "repeating-linear-gradient(45deg,#f9fafb,#f9fafb 8px,#e5e7eb 8px,#e5e7eb 16px)", opacity: 0.5, borderRadius: 4 }} />;
        case "hero":
            return (
                <div style={{ background: p.backgroundColor, color: p.textColor, padding: "2rem", textAlign: p.align as "left" | "center" | "right", borderRadius: 4, minHeight: 100 }}>
                    <div style={{ fontWeight: 800, fontSize: "1.4rem" }}>{p.heading}</div>
                    {p.subheading && <div style={{ opacity: 0.7, marginTop: 4 }}>{p.subheading}</div>}
                </div>
            );
        case "card":
            return (
                <div style={{ border: "1px solid #e5e7eb", borderRadius: p.borderRadius, padding: "1rem", background: p.backgroundColor }}>
                    <div style={{ fontWeight: 700 }}>{p.title}</div>
                    <div style={{ fontSize: "0.875rem", color: "#6b7280", marginTop: 4 }}>{p.description}</div>
                </div>
            );
        case "video":
            return (
                <div style={{ background: "#000", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", aspectRatio: "16/9", borderRadius: 4, fontSize: "1.5rem" }}>
                    ▶ {p.url ? "Video" : "Video URL giriniz"}
                </div>
            );
        case "html":
            return (
                <div style={{ background: "#f3f4f6", padding: "0.75rem", borderRadius: 4, fontFamily: "monospace", fontSize: "0.75rem", color: "#374151", whiteSpace: "pre-wrap", maxHeight: 80, overflow: "hidden" }}>
                    {p.html}
                </div>
            );
        case "tabs":
            return (
                <div style={{ border: "1px solid #e5e7eb", borderRadius: 8, overflow: "hidden" }}>
                    <div style={{ display: "flex", gap: 4, padding: "8px 8px 0", background: "#f9fafb", borderBottom: "1px solid #e5e7eb" }}>
                        {(p.tabs ?? []).slice(0, 3).map((t: { label: string }, i: number) => (
                            <span key={i} style={{ padding: "6px 10px", fontSize: "0.75rem", fontWeight: 500, color: "#374151" }}>{t.label}</span>
                        ))}
                    </div>
                    <div style={{ padding: 12, fontSize: "0.8rem", color: "#6b7280" }}>{(p.tabs ?? [])[0]?.content || "Sekme içeriği"}</div>
                </div>
            );
        case "accordion":
            return (
                <div style={{ border: "1px solid #e5e7eb", borderRadius: 8, overflow: "hidden" }}>
                    {(p.items ?? []).slice(0, 2).map((item: { title: string }, i: number) => (
                        <div key={i} style={{ padding: "8px 12px", borderBottom: i < 1 ? "1px solid #e5e7eb" : undefined, fontWeight: 600, fontSize: "0.8rem" }}>{item.title}</div>
                    ))}
                </div>
            );
        case "icon-box":
            return (
                <div style={{ padding: 12, textAlign: (p.align ?? "left") as "left" | "center" | "right" }}>
                    <span style={{ fontSize: "1.5rem", color: p.iconColor ?? "#2563eb" }}>{p.icon || "◇"}</span>
                    <div style={{ fontWeight: 700, marginTop: 4, color: p.titleColor }}>{p.title}</div>
                    <div style={{ fontSize: "0.8rem", color: p.textColor ?? "#6b7280", marginTop: 2 }}>{p.text}</div>
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
// Child block inside a container (section / column)
// ---------------------------------------------------------------------------

function CanvasChildBlock({ block, parentId, colIdx, depth }: {
    block: BlockInstance;
    parentId: string;
    colIdx: number;
    depth: number;
}) {
    const { selectedId, selectBlock, deleteBlock, duplicateBlock } = useBuilderStore();
    const isSelected = selectedId === block.id;
    const def = getBlockDefinition(block.type);

    return (
        <div
            className={`relative border-2 transition-colors cursor-pointer m-0 rounded ${
                isSelected ? "!border-blue-600" : "border-transparent hover:border-blue-400"
            }`}
            onClick={(e) => { e.stopPropagation(); selectBlock(block.id); }}
        >
            <div className="relative rounded-t-sm border-b border-white/20 h-[22px] flex items-center gap-1 px-1.5 whitespace-nowrap bg-blue-600 text-[0.65rem]">
                <span className="font-semibold text-white/90">
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
            <CanvasBlockPreview block={block} depth={depth} />
        </div>
    );
}
