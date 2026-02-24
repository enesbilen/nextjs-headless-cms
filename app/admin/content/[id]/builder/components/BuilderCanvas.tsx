"use client";

/**
 * BuilderCanvas — Elementor-quality drag & drop canvas
 *
 * Architecture:
 *  ┌─ DndContext (single, top-level) ─────────────────────────────────────┐
 *  │   onDragStart  → records what is being dragged                       │
 *  │   onDragOver   → resolves WHERE it's hovering (droppable context)    │
 *  │   onDragEnd    → commits the move via moveBlockToContainer            │
 *  │                                                                       │
 *  │   Root SortableContext (IDs of root-level blocks)                    │
 *  │     └─ SortableBlockItem per root block                              │
 *  │           └─ ContainerPreview (for section/columns)                  │
 *  │                 └─ DropZoneColumn → SortableContext (column IDs)     │
 *  │                       └─ SortableBlockItem per child block           │
 *  └────────────────────────────────────────────────────────────────────── ┘
 */

import { useCallback, useRef, useState } from "react";
import {
    DndContext,
    PointerSensor,
    useSensor,
    useSensors,
    DragOverlay,
    type DragEndEvent,
    type DragStartEvent,
    type DragOverEvent,
    pointerWithin,
    rectIntersection,
    closestCenter,
    type UniqueIdentifier,
} from "@dnd-kit/core";
import {
    SortableContext,
    verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { useBuilderStore, findBlock } from "@/core/page-builder/store";
import type { BlockInstance, BuilderDevice, BlockType } from "@/core/page-builder/types";
import { DEVICE_CANVAS_WIDTH } from "@/core/page-builder/constants";
import { getBlockDefinition } from "@/core/page-builder/blocks/definitions";
import { SortableBlockItem } from "./SortableBlockItem";

// ---------------------------------------------------------------------------
// Overlay ghost shown while dragging
// ---------------------------------------------------------------------------

function DragGhost({ label, icon, fromPalette }: { label: string; icon: string; fromPalette: boolean }) {
    return (
        <div className={`py-1.5 px-3.5 rounded-md text-[0.8rem] font-semibold pointer-events-none ${
            fromPalette
                ? "bg-slate-900 border border-blue-600 text-white shadow-[0_4px_16px_rgba(37,99,235,0.4)]"
                : "bg-blue-600 text-white shadow-[0_4px_16px_rgba(37,99,235,0.4)]"
        }`}>
            <span style={{ marginRight: 6 }}>{icon}</span>{label}
        </div>
    );
}

// ---------------------------------------------------------------------------
// Empty canvas state
// ---------------------------------------------------------------------------

function EmptyCanvasHint() {
    const { addBlock } = useBuilderStore();
    return (
        <div className="flex flex-col items-center justify-center min-h-[400px] text-gray-400 text-center p-10 gap-3">
            <div className="w-16 h-16 flex items-center justify-center border-2 border-dashed border-gray-300 rounded-full text-2xl text-gray-300">
                ✦
            </div>
            <p className="text-lg font-semibold text-gray-700 m-0">Sayfa henüz boş</p>
            <p className="text-sm text-gray-400 m-0 max-w-[280px]">
                Sol panelden bir eleman sürükleyin ya da tıklayarak ekleyin.
            </p>
            <div className="flex gap-2 flex-wrap justify-center">
                <button
                    className="py-2 px-5 rounded-lg border-none bg-blue-600 text-white text-sm font-semibold cursor-pointer transition-colors hover:bg-blue-700"
                    onClick={() => addBlock("hero")}
                >
                    Hero ekle
                </button>
                <button
                    className="py-2 px-5 rounded-lg border-none bg-indigo-600 text-white text-sm font-semibold cursor-pointer transition-colors hover:bg-indigo-700"
                    onClick={() => addBlock("section")}
                >
                    Section ekle
                </button>
                <button
                    className="py-2 px-5 rounded-lg border-none bg-cyan-600 text-white text-sm font-semibold cursor-pointer transition-colors hover:bg-cyan-700"
                    onClick={() => addBlock("columns-2")}
                >
                    2 Sütun ekle
                </button>
            </div>
        </div>
    );
}

// ---------------------------------------------------------------------------
// Parse a droppable/sortable id to get container context
// ---------------------------------------------------------------------------

function parseDropTarget(
    overId: UniqueIdentifier,
    overData: Record<string, unknown> | undefined,
    blocks: BlockInstance[]
): { toParentId: string | null; toColIdx: number | null; overBlockId: string | null } {
    const id = String(overId);

    if (id.startsWith("col:")) {
        const parts = id.split(":");
        return {
            toParentId: parts[1],
            toColIdx: Number(parts[2]),
            overBlockId: null,
        };
    }

    const findBlockFlat = (blist: BlockInstance[], bid: string): BlockInstance | null => {
        for (const b of blist) {
            if (b.id === bid) return b;
            if (b.children) {
                for (const col of b.children) {
                    const found = findBlockFlat(col, bid);
                    if (found) return found;
                }
            }
        }
        return null;
    };

    const overBlock = findBlockFlat(blocks, id);
    if (overBlock && (overBlock.type === "section" || overBlock.type === "columns-2" || overBlock.type === "columns-3")) {
        return {
            toParentId: id,
            toColIdx: 0,
            overBlockId: null,
        };
    }

    const dragData = overData as { parentId?: string | null; colIdx?: number | null } | undefined;
    if (dragData?.parentId !== undefined) {
        return {
            toParentId: dragData.parentId ?? null,
            toColIdx: dragData.colIdx ?? null,
            overBlockId: id,
        };
    }

    const isRoot = blocks.some((b) => b.id === id);
    return {
        toParentId: null,
        toColIdx: null,
        overBlockId: isRoot ? id : null,
    };
}


// ---------------------------------------------------------------------------
// Main Canvas component
// ---------------------------------------------------------------------------

export function BuilderCanvas() {
    const { blocks, device, addBlock, moveBlockToContainer, selectBlock } = useBuilderStore();

    const [activeDrag, setActiveDrag] = useState<{
        blockId: string | null;
        fromPalette: boolean;
        type: BlockType | null;
        label: string;
        icon: string;
    } | null>(null);

    const lastOverRef = useRef<{ overId: UniqueIdentifier; rect: DOMRect | null } | null>(null);

    const sensors = useSensors(
        useSensor(PointerSensor, {
            activationConstraint: { distance: 4 },
        })
    );

    const collisionDetection = useCallback(
        (args: Parameters<typeof closestCenter>[0]) => {
            const pointerCollisions = pointerWithin(args);
            if (pointerCollisions.length > 0) return pointerCollisions;
            return rectIntersection(args);
        },
        []
    );

    const handleDragStart = useCallback((event: DragStartEvent) => {
        const { active } = event;
        const data = active.data.current as {
            fromPalette?: boolean;
            type?: BlockType;
            blockId?: string;
            parentId?: string | null;
            colIdx?: number | null;
        } | undefined;

        if (data?.fromPalette && data.type) {
            const def = getBlockDefinition(data.type);
            setActiveDrag({ blockId: null, fromPalette: true, type: data.type, label: def.label, icon: def.icon });
        } else {
            const blockId = data?.blockId ?? (active.id as string);
            const block = findBlock(blocks, blockId);
            const def = block ? getBlockDefinition(block.type) : null;
            setActiveDrag({
                blockId,
                fromPalette: false,
                type: block?.type ?? null,
                label: def?.label ?? "",
                icon: def?.icon ?? "□",
            });
        }
    }, [blocks]);

    const handleDragOver = useCallback((event: DragOverEvent) => {
        if (event.over) {
            lastOverRef.current = { overId: event.over.id, rect: null };
        }
    }, []);

    const handleDragEnd = useCallback(
        (event: DragEndEvent) => {
            const { active, over } = event;
            setActiveDrag(null);
            lastOverRef.current = null;

            const activeData = active.data.current as {
                fromPalette?: boolean;
                type?: BlockType;
                blockId?: string;
                parentId?: string | null;
                colIdx?: number | null;
            } | undefined;

            if (!over) return;

            const overData = over.data.current as Record<string, unknown> | undefined;
            const { toParentId, toColIdx, overBlockId } = parseDropTarget(over.id, overData, blocks);

            if (activeData?.fromPalette && activeData.type) {
                addBlock(activeData.type, toParentId ?? undefined, toColIdx ?? undefined, overBlockId ?? undefined);
                return;
            }

            const blockId = activeData?.blockId ?? (active.id as string);

            let insertAfter = false;
            if (overBlockId && event.activatorEvent instanceof PointerEvent) {
                const overEl = document.querySelector(`[data-block-id="${overBlockId}"]`);
                if (overEl) {
                    const rect = overEl.getBoundingClientRect();
                    const pointerY = (event.activatorEvent as PointerEvent).clientY;
                    const finalY = pointerY + (event.delta?.y ?? 0);
                    insertAfter = finalY > rect.top + rect.height / 2;
                }
            }

            moveBlockToContainer(blockId, overBlockId, toParentId, toColIdx, insertAfter);
        },
        [addBlock, moveBlockToContainer, blocks]
    );

    const canvasWidth = DEVICE_CANVAS_WIDTH[device];

    return (
        <DndContext
            sensors={sensors}
            collisionDetection={collisionDetection}
            onDragStart={handleDragStart}
            onDragOver={handleDragOver}
            onDragEnd={handleDragEnd}
        >
            <div
                className="flex-1 overflow-auto builder-canvas-scroll"
                onClick={() => selectBlock(null)}
            >
                <div
                    className="bg-white min-h-[calc(100vh-100px)] shadow-[0_0_0_1px_rgba(255,255,255,0.05),0_8px_32px_rgba(0,0,0,0.4)] rounded-md overflow-hidden transition-[width] duration-300"
                    style={{ width: canvasWidth, maxWidth: "100%" }}
                >
                    {blocks.length === 0 ? (
                        <EmptyCanvasHint />
                    ) : (
                        <SortableContext
                            items={blocks.map((b) => b.id)}
                            strategy={verticalListSortingStrategy}
                        >
                            <div className="flex flex-col min-h-full">
                                {blocks.map((block) => (
                                    <SortableBlockItem
                                        key={block.id}
                                        block={block}
                                        parentId={null}
                                        colIdx={null}
                                        depth={0}
                                    />
                                ))}
                            </div>
                        </SortableContext>
                    )}
                </div>
            </div>

            <DragOverlay dropAnimation={{ duration: 180, easing: "cubic-bezier(0.18, 0.67, 0.6, 1.22)" }}>
                {activeDrag && (
                    <DragGhost
                        label={activeDrag.label}
                        icon={activeDrag.icon}
                        fromPalette={activeDrag.fromPalette}
                    />
                )}
            </DragOverlay>
        </DndContext>
    );
}
