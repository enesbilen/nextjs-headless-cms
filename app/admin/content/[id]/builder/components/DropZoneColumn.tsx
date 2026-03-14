"use client";

import { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";
import { useDroppable } from "@dnd-kit/core";
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";
import type { BlockInstance, BlockType, ColumnSettings } from "@/core/page-builder/types";
import { useBuilderStore } from "@/core/page-builder/store";
import { BLOCK_DEFINITIONS } from "@/core/page-builder/blocks/definitions";

interface DropZoneColumnProps {
    parentId: string;
    colIdx: number;
    children: BlockInstance[];
    renderBlock: (block: BlockInstance, parentId: string, colIdx: number) => React.ReactNode;
    addLabel?: string;
    columnStyle?: ColumnSettings;
}

// ---------------------------------------------------------------------------
// Leaf block types that can be placed inside a column
// ---------------------------------------------------------------------------

const LEAF_TYPES: BlockType[] = [
    "heading", "text", "image", "button", "divider", "spacer",
    "hero", "card", "html", "video", "list", "quote",
    "social-links", "alert", "testimonial", "counter",
    "gallery", "map", "form", "progress-bar",
];

const PICKER_CATEGORIES = [
    { key: "basic", label: "Temel" },
    { key: "media", label: "Medya" },
    { key: "advanced", label: "Gelişmiş" },
] as const;

// ---------------------------------------------------------------------------
// SVG icon component for picker items
// ---------------------------------------------------------------------------

function PickerIcon({ type }: { type: string }) {
    const s = { fill: "none", viewBox: "0 0 24 24", stroke: "currentColor", strokeWidth: 1.6, className: "w-5 h-5" };
    switch (type) {
        case "heading":
            return <svg {...s}><path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h10" /></svg>;
        case "text":
            return <svg {...s}><path strokeLinecap="round" d="M4 6h16M4 10h16M4 14h12M4 18h8" /></svg>;
        case "image":
            return <svg {...s}><rect x="3" y="3" width="18" height="18" rx="2" /><circle cx="8.5" cy="8.5" r="1.5" /><path d="M21 15l-5-5L5 21" /></svg>;
        case "button":
            return <svg {...s}><rect x="4" y="8" width="16" height="8" rx="4" /><path strokeLinecap="round" d="M9 12h6" /></svg>;
        case "divider":
            return <svg {...s}><path strokeLinecap="round" d="M3 12h18" /></svg>;
        case "spacer":
            return <svg {...s}><path strokeLinecap="round" d="M12 5v14M8 8l4-3 4 3M8 16l4 3 4-3" /></svg>;
        case "hero":
            return <svg {...s}><rect x="2" y="4" width="20" height="16" rx="2" /><path strokeLinecap="round" d="M7 10h10M9 14h6" /></svg>;
        case "card":
            return <svg {...s}><rect x="3" y="3" width="18" height="18" rx="2" /><path d="M3 10h18" /><path strokeLinecap="round" d="M7 14h6M7 17h4" /></svg>;
        case "html":
            return <svg {...s}><path strokeLinecap="round" strokeLinejoin="round" d="M10 20l4-16M18 8l4 4-4 4M6 8l-4 4 4 4" /></svg>;
        case "video":
            return <svg {...s}><rect x="2" y="4" width="20" height="16" rx="2" /><path d="M10 9l5 3-5 3V9z" fill="currentColor" /></svg>;
        case "list":
            return <svg {...s}><path strokeLinecap="round" d="M9 6h11M9 12h11M9 18h11" /><circle cx="4" cy="6" r="1" fill="currentColor" /><circle cx="4" cy="12" r="1" fill="currentColor" /><circle cx="4" cy="18" r="1" fill="currentColor" /></svg>;
        case "quote":
            return <svg {...s}><path d="M3 21c3-7 3-12 0-18h4c6 7 6 12 0 18zm10 0c3-7 3-12 0-18h4c6 7 6 12 0 18z" /></svg>;
        case "social-links":
            return <svg {...s}><circle cx="18" cy="5" r="3" /><circle cx="6" cy="12" r="3" /><circle cx="18" cy="19" r="3" /><path d="M8.59 13.51l6.83 3.98M15.41 6.51l-6.82 3.98" /></svg>;
        case "alert":
            return <svg {...s}><path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" /><path strokeLinecap="round" d="M12 9v4M12 17h.01" /></svg>;
        case "testimonial":
            return <svg {...s}><path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" /></svg>;
        case "counter":
            return <svg {...s}><path strokeLinecap="round" strokeLinejoin="round" d="M7 20V4m0 0l3 3M7 4L4 7M17 4v16m0 0l3-3m-3 3l-3-3" /></svg>;
        case "gallery":
            return <svg {...s}><rect x="2" y="2" width="8" height="8" rx="1" /><rect x="14" y="2" width="8" height="8" rx="1" /><rect x="2" y="14" width="8" height="8" rx="1" /><rect x="14" y="14" width="8" height="8" rx="1" /></svg>;
        case "map":
            return <svg {...s}><path d="M1 6v16l7-4 8 4 7-4V2l-7 4-8-4-7 4z" /></svg>;
        case "form":
            return <svg {...s}><rect x="3" y="3" width="18" height="18" rx="2" /><path strokeLinecap="round" d="M7 8h10M7 12h10M7 16h6" /></svg>;
        case "progress-bar":
            return <svg {...s}><rect x="2" y="10" width="20" height="4" rx="2" /><rect x="2" y="10" width="14" height="4" rx="2" fill="currentColor" opacity={0.3} /></svg>;
        default:
            return <svg {...s}><rect x="3" y="3" width="18" height="18" rx="2" /></svg>;
    }
}

// ---------------------------------------------------------------------------
// Element picker popup — rendered via portal for proper z-index
// ---------------------------------------------------------------------------

function ElementPicker({
    onPick,
    onClose,
    anchorRef,
}: {
    onPick: (type: BlockType) => void;
    onClose: () => void;
    anchorRef: React.RefObject<HTMLElement | null>;
}) {
    const [activeCat, setActiveCat] = useState<string>("all");
    const [search, setSearch] = useState("");
    const popupRef = useRef<HTMLDivElement>(null);
    const [pos, setPos] = useState({ top: 0, left: 0 });

    useEffect(() => {
        if (!anchorRef.current) return;
        const rect = anchorRef.current.getBoundingClientRect();
        const popupH = 420;
        const spaceAbove = rect.top;
        const spaceBelow = window.innerHeight - rect.bottom;

        let top: number;
        if (spaceAbove > popupH + 8) {
            top = rect.top - popupH - 8;
        } else if (spaceBelow > popupH + 8) {
            top = rect.bottom + 8;
        } else {
            top = Math.max(8, (window.innerHeight - popupH) / 2);
        }

        setPos({
            top,
            left: Math.max(8, rect.left + rect.width / 2 - 170),
        });
    }, [anchorRef]);

    const defs = BLOCK_DEFINITIONS.filter((d) => {
        if (!LEAF_TYPES.includes(d.type as BlockType)) return false;
        if (activeCat !== "all" && d.category !== activeCat) return false;
        if (search && !d.label.toLowerCase().includes(search.toLowerCase())) return false;
        return true;
    });

    return createPortal(
        <>
            <div className="fixed inset-0 z-[9998] bg-black/20" onClick={onClose} />
            <div
                ref={popupRef}
                className="fixed z-[9999] w-[340px] max-h-[420px] bg-slate-800/95 backdrop-blur-xl border border-slate-600/50 rounded-xl shadow-2xl shadow-black/40 flex flex-col overflow-hidden animate-fade-in"
                style={{ top: pos.top, left: pos.left }}
            >
                {/* Header */}
                <div className="flex items-center justify-between px-4 pt-3.5 pb-2.5">
                    <span className="text-xs font-bold text-slate-200">Eleman Ekle</span>
                    <button
                        onClick={onClose}
                        className="w-6 h-6 flex items-center justify-center rounded-md text-slate-500 hover:text-slate-200 hover:bg-white/10 transition-colors bg-transparent border-none cursor-pointer"
                    >
                        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" d="M18 6L6 18M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                {/* Search */}
                <div className="px-3 pb-2">
                    <div className="relative">
                        <svg className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3 h-3 text-slate-500 pointer-events-none" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <circle cx="11" cy="11" r="8" />
                            <path strokeLinecap="round" d="M21 21l-4.35-4.35" />
                        </svg>
                        <input
                            type="search"
                            placeholder="Ara..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="w-full py-1.5 pl-7 pr-2.5 rounded-md border border-slate-600/60 bg-white/[0.05] text-slate-200 text-[11px] outline-none focus:border-blue-500/50 placeholder:text-slate-600"
                            autoFocus
                        />
                    </div>
                </div>

                {/* Category filter */}
                <div className="flex gap-1 px-3 pb-2">
                    <button
                        className={`py-0.5 px-2 rounded text-[10px] font-medium border transition-all ${activeCat === "all" ? "bg-blue-600/20 text-blue-400 border-blue-500/30" : "bg-transparent text-slate-500 border-transparent hover:text-slate-300"}`}
                        onClick={() => setActiveCat("all")}
                    >
                        Tümü
                    </button>
                    {PICKER_CATEGORIES.map((c) => (
                        <button
                            key={c.key}
                            className={`py-0.5 px-2 rounded text-[10px] font-medium border transition-all ${activeCat === c.key ? "bg-blue-600/20 text-blue-400 border-blue-500/30" : "bg-transparent text-slate-500 border-transparent hover:text-slate-300"}`}
                            onClick={() => setActiveCat(c.key)}
                        >
                            {c.label}
                        </button>
                    ))}
                </div>

                {/* Grid */}
                <div className="flex-1 overflow-y-auto px-3 pb-3 builder-scrollbar">
                    {defs.length === 0 ? (
                        <div className="py-6 text-center text-slate-500 text-xs">Sonuç bulunamadı</div>
                    ) : (
                        <div className="grid grid-cols-3 gap-1.5">
                            {defs.map((d) => (
                                <button
                                    key={d.type}
                                    className="group flex flex-col items-center gap-1.5 py-3 px-1 border border-transparent rounded-lg bg-transparent text-slate-400 cursor-pointer transition-all hover:bg-blue-500/10 hover:border-blue-500/40 hover:text-blue-400"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        onPick(d.type as BlockType);
                                        onClose();
                                    }}
                                    title={d.description}
                                >
                                    <span className="flex items-center justify-center w-9 h-9 rounded-lg bg-white/[0.06] group-hover:bg-blue-500/15 transition-colors">
                                        <PickerIcon type={d.type} />
                                    </span>
                                    <span className="text-[10px] font-medium text-center leading-tight">
                                        {d.label}
                                    </span>
                                </button>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </>,
        document.body,
    );
}

// ---------------------------------------------------------------------------
// DropZoneColumn
// ---------------------------------------------------------------------------

export function DropZoneColumn({
    parentId,
    colIdx,
    children,
    renderBlock,
    addLabel,
    columnStyle,
}: DropZoneColumnProps) {
    const droppableId = `col:${parentId}:${colIdx}`;
    const { addBlock } = useBuilderStore();
    const [pickerOpen, setPickerOpen] = useState(false);
    const addBtnRef = useRef<HTMLButtonElement>(null);
    const emptyBtnRef = useRef<HTMLButtonElement>(null);

    const { setNodeRef, isOver } = useDroppable({
        id: droppableId,
        data: {
            droppableId,
            parentId,
            colIdx,
            isContainer: true,
        },
    });

    const handlePick = (type: BlockType) => {
        addBlock(type, parentId, colIdx);
    };

    const colInlineStyle: React.CSSProperties = {
        backgroundColor: columnStyle?.backgroundColor ?? undefined,
        paddingTop: columnStyle?.paddingTop !== undefined ? `${columnStyle.paddingTop}px` : undefined,
        paddingRight: columnStyle?.paddingRight !== undefined ? `${columnStyle.paddingRight}px` : undefined,
        paddingBottom: columnStyle?.paddingBottom !== undefined ? `${columnStyle.paddingBottom}px` : undefined,
        paddingLeft: columnStyle?.paddingLeft !== undefined ? `${columnStyle.paddingLeft}px` : undefined,
        borderRadius: columnStyle?.borderRadius ?? undefined,
        alignSelf: columnStyle?.verticalAlign === "center" ? "center"
            : columnStyle?.verticalAlign === "end" ? "flex-end"
                : undefined,
    };

    return (
        <div
            ref={setNodeRef}
            className={`min-h-[56px] p-1 rounded-lg transition-all flex flex-col ${isOver ? "bg-blue-500/[0.08] ring-2 ring-blue-500 ring-inset" : ""}`}
            data-droppable-id={droppableId}
            style={{ position: "relative", ...colInlineStyle }}
        >
            <SortableContext
                items={children.map((b) => b.id)}
                strategy={verticalListSortingStrategy}
            >
                {children.length === 0 ? (
                    <div className={`w-full flex-1 min-h-[56px] border-2 border-dashed rounded-lg p-3 text-center text-xs transition-all flex items-center justify-center ${
                        isOver
                            ? "border-blue-500 bg-blue-500/[0.12] text-blue-400 border-solid animate-pulse-drop"
                            : "border-slate-600/50 bg-white/[0.02] hover:border-blue-400/60 hover:text-blue-400 hover:bg-blue-400/[0.04] text-slate-500"
                    }`}>
                        {isOver ? (
                            <span className="text-sm font-semibold text-blue-400 pointer-events-none flex items-center gap-2">
                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                                </svg>
                                Buraya bırak
                            </span>
                        ) : (
                            <button
                                ref={emptyBtnRef}
                                className="flex flex-col items-center gap-1.5 w-full p-3 border-none bg-transparent text-inherit cursor-pointer transition-all hover:text-blue-400"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    setPickerOpen(true);
                                }}
                                title={`Eleman ekle — ${addLabel ?? `Sütun ${colIdx + 1}`}`}
                            >
                                <span className="flex items-center justify-center w-8 h-8 rounded-lg border border-dashed border-current">
                                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                        <path strokeLinecap="round" d="M12 5v14M5 12h14" />
                                    </svg>
                                </span>
                                <span className="text-[11px] font-medium">
                                    {addLabel ?? "Eleman Ekle"}
                                </span>
                            </button>
                        )}
                    </div>
                ) : (
                    <div className="flex flex-col gap-1">
                        {children.map((block) => renderBlock(block, parentId, colIdx))}

                        <button
                            ref={addBtnRef}
                            className="group flex items-center justify-center gap-1.5 w-full py-2 mt-1 border border-dashed border-slate-700/60 rounded-lg bg-transparent text-slate-600 text-[11px] font-medium cursor-pointer text-center transition-all hover:border-blue-500/50 hover:text-blue-400 hover:bg-blue-500/[0.04]"
                            onClick={(e) => {
                                e.stopPropagation();
                                setPickerOpen(true);
                            }}
                            title="Eleman ekle"
                        >
                            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                <path strokeLinecap="round" d="M12 5v14M5 12h14" />
                            </svg>
                            Eleman Ekle
                        </button>
                    </div>
                )}
            </SortableContext>

            {pickerOpen && (
                <ElementPicker
                    onPick={handlePick}
                    onClose={() => setPickerOpen(false)}
                    anchorRef={children.length === 0 ? emptyBtnRef : addBtnRef}
                />
            )}
        </div>
    );
}
