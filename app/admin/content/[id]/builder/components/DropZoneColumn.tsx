"use client";

import { useState } from "react";
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
// Element picker popup  (shown when clicking "+ Eleman Ekle")
// ---------------------------------------------------------------------------

const LEAF_TYPES: BlockType[] = [
    "heading", "text", "image", "button", "divider", "spacer",
    "hero", "card", "html", "video",
];

function ElementPicker({
    onPick,
    onClose,
}: {
    onPick: (type: BlockType) => void;
    onClose: () => void;
}) {
    const defs = BLOCK_DEFINITIONS.filter((d) => LEAF_TYPES.includes(d.type as BlockType));
    return (
        <>
            <div
                className="fixed inset-0 z-[998]"
                onClick={(e) => { e.stopPropagation(); onClose(); }}
            />
            <div className="absolute bottom-[calc(100%+6px)] left-1/2 -translate-x-1/2 z-[999] bg-slate-800 border border-slate-700 rounded-[10px] p-2.5 shadow-[0_8px_32px_rgba(0,0,0,0.4)] min-w-[220px] max-w-[280px]">
                <div className="text-[0.65rem] font-bold text-slate-500 uppercase tracking-wider mb-2 text-center">
                    Eleman Seç
                </div>
                <div className="grid grid-cols-4 gap-1">
                    {defs.map((d) => (
                        <button
                            key={d.type}
                            className="flex flex-col items-center gap-[3px] py-1.5 px-1 border border-transparent rounded-md bg-transparent text-slate-400 cursor-pointer transition-all text-[0.6rem] hover:bg-blue-500/10 hover:border-blue-500 hover:text-blue-400"
                            onClick={(e) => {
                                e.stopPropagation();
                                onPick(d.type as BlockType);
                                onClose();
                            }}
                        >
                            <span className="text-base leading-none">{d.icon}</span>
                            <span className="text-[0.6rem] font-medium whitespace-nowrap overflow-hidden text-ellipsis max-w-[48px] text-center">
                                {d.label}
                            </span>
                        </button>
                    ))}
                </div>
            </div>
        </>
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
            className={`min-h-[56px] p-1 rounded-md transition-all flex flex-col ${isOver ? "bg-blue-500/[0.08] shadow-[inset_0_0_0_2px_#3b82f6]" : ""}`}
            data-droppable-id={droppableId}
            style={{ position: "relative", ...colInlineStyle }}
        >
            <SortableContext
                items={children.map((b) => b.id)}
                strategy={verticalListSortingStrategy}
            >
                {children.length === 0 ? (
                    <div className={`w-full flex-1 min-h-[48px] border-2 border-dashed rounded-md p-2.5 text-center text-gray-400 text-xs cursor-pointer transition-all flex items-center justify-center ${
                        isOver
                            ? "border-blue-500 bg-blue-500/[0.12] text-blue-500 border-solid font-semibold animate-pulse-drop"
                            : "border-gray-300 bg-transparent hover:border-blue-400 hover:text-blue-400 hover:bg-blue-400/[0.06]"
                    }`}>
                        {isOver ? (
                            <span className="text-[0.8rem] font-semibold text-blue-500 pointer-events-none">
                                ✦ Buraya bırak
                            </span>
                        ) : (
                            <button
                                className="flex flex-col items-center gap-1 w-full p-3 border-none bg-transparent text-gray-400 cursor-pointer transition-all hover:text-blue-400"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    setPickerOpen(true);
                                }}
                                title={`Eleman ekle — ${addLabel ?? `Sütun ${colIdx + 1}`}`}
                            >
                                <span className="text-xl leading-none">+</span>
                                <span className="text-[0.7rem] font-medium">
                                    {addLabel ?? `Sütun ${colIdx + 1}`}
                                </span>
                            </button>
                        )}

                        {pickerOpen && (
                            <ElementPicker
                                onPick={handlePick}
                                onClose={() => setPickerOpen(false)}
                            />
                        )}
                    </div>
                ) : (
                    <div className="flex flex-col gap-1">
                        {children.map((block) => renderBlock(block, parentId, colIdx))}

                        <div className="relative">
                            <button
                                className="block w-full py-[5px] mt-1 border border-dashed border-gray-700 rounded bg-transparent text-gray-500 text-[0.7rem] cursor-pointer text-center transition-all hover:border-blue-500 hover:text-blue-400 hover:bg-blue-500/[0.06]"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    setPickerOpen(true);
                                }}
                                title="Eleman ekle"
                            >
                                + Eleman ekle
                            </button>
                            {pickerOpen && (
                                <ElementPicker
                                    onPick={handlePick}
                                    onClose={() => setPickerOpen(false)}
                                />
                            )}
                        </div>
                    </div>
                )}
            </SortableContext>
        </div>
    );
}
