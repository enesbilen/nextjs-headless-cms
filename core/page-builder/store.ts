"use client";

import { create } from "zustand";
import { immer } from "zustand/middleware/immer";
import { v4 as uuidv4 } from "uuid";
import type {
    BlockInstance,
    BlockType,
    BlockProps,
    BlockVisibility,
    BuilderDevice,
    PageBuilderDoc,
    PageSettings,
} from "./types";
import { DEFAULT_PAGE_SETTINGS } from "./types";
import { getDefaultProps } from "./blocks/definitions";
import { HISTORY_MAX_SIZE, DEFAULT_DEVICE } from "./constants";

// ---------------------------------------------------------------------------
// State shape
// ---------------------------------------------------------------------------

export interface BuilderState {
    blocks: BlockInstance[];
    pageSettings: PageSettings;
    selectedId: string | null;
    /** Multi-selection: when non-empty, selectedId should equal selectedIds[0] (primary). */
    selectedIds: string[];
    device: BuilderDevice;
    isPanelOpen: boolean;
    isSaving: boolean;
    isDirty: boolean;
    past: BlockInstance[][];
    future: BlockInstance[][];
    /** Copied blocks (with original IDs); paste clones and reassigns IDs. */
    clipboard: BlockInstance[] | null;
}

export interface BuilderActions {
    addBlock: (type: BlockType, parentId?: string, columnIndex?: number, afterId?: string) => void;
    updateBlock: (id: string, props: Partial<BlockProps>) => void;
    deleteBlock: (id: string) => void;
    /** Delete all currently selected blocks (uses selectedIds, else selectedId). */
    deleteSelectedBlocks: () => void;
    updatePageSettings: (patch: Partial<PageSettings>) => void;
    /**
     * Universal move — handles all 4 drag scenarios:
     *   root→root, root→column, column→root, column A→column B
     * @param activeId     - block being dragged
     * @param overBlockId  - block it was dropped on (null = end of list)
     * @param toParentId   - target container (null = root)
     * @param toColIdx     - target column index (null = root)
     * @param insertAfter  - insert after overBlock vs before (default: false = before)
     */
    moveBlockToContainer: (
        activeId: string,
        overBlockId: string | null,
        toParentId: string | null,
        toColIdx: number | null,
        insertAfter?: boolean,
    ) => void;
    /** @deprecated use moveBlockToContainer */
    moveBlock: (activeId: string, overId: string, overParentId?: string, overColumnIndex?: number) => void;
    duplicateBlock: (id: string) => void;
    selectBlock: (id: string | null) => void;
    /** Toggle block in multi-selection; does not clear others. */
    toggleBlockSelection: (id: string) => void;
    /** Clear all selection. */
    clearSelection: () => void;
    setDevice: (device: BuilderDevice) => void;
    togglePanel: () => void;
    setSaving: (v: boolean) => void;
    setClean: () => void;
    undo: () => void;
    redo: () => void;
    loadBlocks: (doc: PageBuilderDoc | null) => void;
    getDoc: () => PageBuilderDoc;
    /** Copy currently selected block(s) to clipboard. */
    copySelectedToClipboard: () => void;
    /** Paste clipboard into canvas (after selected block or into selected container). */
    pasteFromClipboard: () => void;
    /** Insert template/section blocks at root (IDs are reassigned). */
    insertBlocksAtRoot: (blocks: BlockInstance[]) => void;
    /** Set block visibility (hide on desktop/tablet/mobile). */
    updateBlockVisibility: (blockId: string, visibility: BlockVisibility | undefined) => void;
    /** Columns blokunda sütun sayısını 2 veya 3 yap (tip, props, children güncellenir). */
    setColumnsCount: (blockId: string, count: 2 | 3) => void;
}

export type BuilderStore = BuilderState & BuilderActions;

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function cloneBlocks(blocks: BlockInstance[]): BlockInstance[] {
    return JSON.parse(JSON.stringify(blocks));
}

/** Clone blocks and assign new UUIDs to every block (and nested children). */
function cloneBlocksWithNewIds(blocks: BlockInstance[]): BlockInstance[] {
    const clone = cloneBlocks(blocks);
    const reassignIds = (b: BlockInstance) => {
        b.id = uuidv4();
        b.children?.forEach((col) => col.forEach(reassignIds));
    };
    clone.forEach(reassignIds);
    return clone;
}

export function findBlock(blocks: BlockInstance[], id: string): BlockInstance | null {
    for (const b of blocks) {
        if (b.id === id) return b;
        if (b.children) {
            for (const col of b.children) {
                const found = findBlock(col, id);
                if (found) return found;
            }
        }
    }
    return null;
}

/** Collect blocks with given ids in document order (root, then depth-first). */
function getBlocksInDocumentOrder(blocks: BlockInstance[], ids: Set<string>): BlockInstance[] {
    const result: BlockInstance[] = [];
    const walk = (list: BlockInstance[]) => {
        for (const b of list) {
            if (ids.has(b.id)) result.push(b);
            b.children?.forEach((col) => walk(col));
        }
    };
    walk(blocks);
    return result;
}

function removeBlock(blocks: BlockInstance[], id: string): BlockInstance | null {
    const idx = blocks.findIndex((b) => b.id === id);
    if (idx !== -1) {
        const [removed] = blocks.splice(idx, 1);
        return removed;
    }
    for (const b of blocks) {
        if (b.children) {
            for (const col of b.children) {
                const removed = removeBlock(col, id);
                if (removed) return removed;
            }
        }
    }
    return null;
}

function findParentArray(blocks: BlockInstance[], id: string): BlockInstance[] | null {
    if (blocks.some((b) => b.id === id)) return blocks;
    for (const b of blocks) {
        if (b.children) {
            for (const col of b.children) {
                const found = findParentArray(col, id);
                if (found) return found;
            }
        }
    }
    return null;
}

function buildNewBlock(type: BlockType): BlockInstance {
    const props = getDefaultProps(type);
    const numCols = type === "columns-2" ? 2 : type === "columns-3" ? 3 : undefined;
    return {
        id: uuidv4(),
        type,
        props,
        ...(numCols !== undefined || type === "section"
            ? { children: Array.from({ length: numCols ?? 1 }, () => []) }
            : {}),
    };
}

function pushHistory(state: BuilderState) {
    state.past.push(cloneBlocks(state.blocks));
    if (state.past.length > HISTORY_MAX_SIZE) state.past.shift();
    state.future = [];
}

/** Returns the correct array to insert into */
function getTargetArray(
    blocks: BlockInstance[],
    parentId: string | null,
    colIdx: number | null,
): BlockInstance[] {
    if (!parentId) return blocks;
    const parent = findBlock(blocks, parentId);
    if (!parent?.children) return blocks; // fallback
    return parent.children[colIdx ?? 0] ?? blocks;
}

// ---------------------------------------------------------------------------
// Store
// ---------------------------------------------------------------------------

export const useBuilderStore = create<BuilderStore>()(
    immer((set, get) => ({
        blocks: [],
        pageSettings: { ...DEFAULT_PAGE_SETTINGS },
        selectedId: null,
        device: DEFAULT_DEVICE,
        isPanelOpen: true,
        isSaving: false,
        isDirty: false,
        past: [],
        future: [],
        clipboard: null,
        selectedIds: [],

        loadBlocks(doc) {
            set((s) => {
                s.blocks = doc ? cloneBlocks(doc.blocks) : [];
                s.pageSettings = doc?.pageSettings
                    ? { ...DEFAULT_PAGE_SETTINGS, ...doc.pageSettings }
                    : { ...DEFAULT_PAGE_SETTINGS };
                s.past = [];
                s.future = [];
                s.isDirty = false;
                s.selectedId = null;
                s.selectedIds = [];
                s.clipboard = null;
            });
        },

        getDoc() {
            return { version: 1, blocks: cloneBlocks(get().blocks), pageSettings: { ...get().pageSettings } };
        },

        addBlock(type, parentId, columnIndex, afterId) {
            set((s) => {
                pushHistory(s);
                const block = buildNewBlock(type);
                const colIdx = columnIndex ?? 0;

                if (parentId) {
                    const parent = findBlock(s.blocks, parentId);
                    if (parent) {
                        // Defensively init children array if missing
                        if (!parent.children) {
                            const numCols =
                                parent.type === "columns-2" ? 2 :
                                    parent.type === "columns-3" ? 3 : 1;
                            parent.children = Array.from({ length: numCols }, () => []);
                        }
                        // Ensure the target column slot exists
                        while (parent.children.length <= colIdx) {
                            parent.children.push([]);
                        }
                        const col = parent.children[colIdx];
                        if (afterId) {
                            const idx = col.findIndex((b) => b.id === afterId);
                            col.splice(idx >= 0 ? idx + 1 : col.length, 0, block);
                        } else {
                            col.push(block);
                        }
                    }
                } else {
                    if (afterId) {
                        const idx = s.blocks.findIndex((b) => b.id === afterId);
                        s.blocks.splice(idx >= 0 ? idx + 1 : s.blocks.length, 0, block);
                    } else {
                        s.blocks.push(block);
                    }
                }
                s.selectedId = block.id;
                s.isDirty = true;
            });
        },


        updatePageSettings(patch) {
            set((s) => {
                s.pageSettings = { ...s.pageSettings, ...patch };
                s.isDirty = true;
            });
        },

        updateBlock(id, props) {
            set((s) => {
                pushHistory(s);
                const block = findBlock(s.blocks, id);
                if (block) {
                    block.props = { ...block.props, ...props } as BlockProps;
                }
                s.isDirty = true;
            });
        },

        updateBlockVisibility(blockId, visibility) {
            set((s) => {
                pushHistory(s);
                const block = findBlock(s.blocks, blockId);
                if (block) {
                    block.visibility = visibility && (visibility.hideOnDesktop || visibility.hideOnTablet || visibility.hideOnMobile)
                        ? visibility
                        : undefined;
                }
                s.isDirty = true;
            });
        },

        setColumnsCount(blockId, count) {
            set((s) => {
                const block = findBlock(s.blocks, blockId);
                if (!block || (block.type !== "columns-2" && block.type !== "columns-3")) return;
                const currentCols = block.type === "columns-2" ? 2 : 3;
                if (currentCols === count) return;
                pushHistory(s);
                const newType = count === 2 ? "columns-2" : "columns-3";
                block.type = newType;
                const p = block.props as import("./types").ColumnsProps;
                p.columns = count;
                const widths = p.columnWidths ?? Array.from({ length: currentCols }, () => "1fr");
                if (count === 3) {
                    p.columnWidths = [...widths.slice(0, 2), widths[2] ?? "1fr"];
                    if (!block.children) block.children = [[], [], []];
                    else while (block.children.length < 3) block.children.push([]);
                } else {
                    p.columnWidths = widths.slice(0, 2);
                    if (block.children && block.children.length > 2) block.children = block.children.slice(0, 2);
                }
                if (p.columnSettings && p.columnSettings.length > count) p.columnSettings = p.columnSettings.slice(0, count);
                s.isDirty = true;
            });
        },

        deleteBlock(id) {
            set((s) => {
                pushHistory(s);
                removeBlock(s.blocks, id);
                if (s.selectedId === id) s.selectedId = null;
                s.selectedIds = s.selectedIds.filter((x) => x !== id);
                s.isDirty = true;
            });
        },

        deleteSelectedBlocks() {
            set((s) => {
                const ids = s.selectedIds.length > 0 ? s.selectedIds : s.selectedId ? [s.selectedId] : [];
                if (ids.length === 0) return;
                pushHistory(s);
                const idsSet = new Set(ids);
                const ordered = getBlocksInDocumentOrder(s.blocks, idsSet);
                ordered.reverse();
                ordered.forEach((b) => removeBlock(s.blocks, b.id));
                s.selectedId = null;
                s.selectedIds = [];
                s.isDirty = true;
            });
        },

        duplicateBlock(id) {
            set((s) => {
                pushHistory(s);
                const source = findBlock(s.blocks, id);
                if (!source) return;
                const clone: BlockInstance = JSON.parse(JSON.stringify(source));
                const reassignIds = (b: BlockInstance) => {
                    b.id = uuidv4();
                    b.children?.forEach((col) => col.forEach(reassignIds));
                };
                reassignIds(clone);
                const parentArr = findParentArray(s.blocks, id);
                if (parentArr) {
                    const idx = parentArr.findIndex((b) => b.id === id);
                    parentArr.splice(idx + 1, 0, clone);
                }
                s.selectedId = clone.id;
                s.isDirty = true;
            });
        },

        moveBlockToContainer(activeId, overBlockId, toParentId, toColIdx, insertAfter = false) {
            set((s) => {
                // Can't drop onto itself
                if (activeId === overBlockId) return;
                // Can't drop a container into itself
                if (toParentId === activeId) return;

                pushHistory(s);

                // Remove from source
                const block = removeBlock(s.blocks, activeId);
                if (!block) return;

                // Get target array
                const targetArr = getTargetArray(s.blocks, toParentId, toColIdx);

                if (overBlockId) {
                    const overIdx = targetArr.findIndex((b) => b.id === overBlockId);
                    if (overIdx >= 0) {
                        targetArr.splice(insertAfter ? overIdx + 1 : overIdx, 0, block);
                    } else {
                        targetArr.push(block);
                    }
                } else {
                    targetArr.push(block);
                }

                s.isDirty = true;
            });
        },

        // Legacy — kept for compatibility
        moveBlock(activeId, overId, overParentId, overColumnIndex) {
            set((s) => {
                pushHistory(s);
                const sourceBlock = findBlock(s.blocks, activeId);
                if (!sourceBlock) return;
                const clone = JSON.parse(JSON.stringify(sourceBlock)) as BlockInstance;
                removeBlock(s.blocks, activeId);

                if (overParentId) {
                    const parent = findBlock(s.blocks, overParentId);
                    if (parent?.children) {
                        const col = parent.children[overColumnIndex ?? 0] ?? [];
                        const overIdx = col.findIndex((b) => b.id === overId);
                        if (overIdx >= 0) col.splice(overIdx, 0, clone);
                        else col.push(clone);
                    }
                } else {
                    const overIdx = s.blocks.findIndex((b) => b.id === overId);
                    if (overIdx >= 0) s.blocks.splice(overIdx, 0, clone);
                    else s.blocks.push(clone);
                }
                s.isDirty = true;
            });
        },

        selectBlock(id) {
            set((s) => {
                s.selectedId = id;
                s.selectedIds = id ? [id] : [];
            });
        },

        toggleBlockSelection(id) {
            set((s) => {
                const idx = s.selectedIds.indexOf(id);
                if (idx >= 0) {
                    s.selectedIds.splice(idx, 1);
                    s.selectedId = s.selectedIds[0] ?? null;
                } else {
                    s.selectedIds.push(id);
                    s.selectedId = id;
                }
            });
        },

        clearSelection() {
            set((s) => {
                s.selectedId = null;
                s.selectedIds = [];
            });
        },

        setDevice(device) {
            set((s) => { s.device = device; });
        },

        togglePanel() {
            set((s) => { s.isPanelOpen = !s.isPanelOpen; });
        },

        setSaving(v) {
            set((s) => { s.isSaving = v; });
        },

        setClean() {
            set((s) => { s.isDirty = false; });
        },

        undo() {
            set((s) => {
                const prev = s.past.pop();
                if (!prev) return;
                s.future.push(cloneBlocks(s.blocks));
                s.blocks = prev;
                s.selectedId = null;
                s.isDirty = true;
            });
        },

        redo() {
            set((s) => {
                const next = s.future.pop();
                if (!next) return;
                s.past.push(cloneBlocks(s.blocks));
                s.blocks = next;
                s.selectedId = null;
                s.isDirty = true;
            });
        },

        copySelectedToClipboard() {
            const { blocks, selectedId, selectedIds } = get();
            if (selectedIds.length > 0) {
                const idsSet = new Set(selectedIds);
                const toCopy = getBlocksInDocumentOrder(blocks, idsSet);
                if (toCopy.length === 0) return;
                set((s) => { s.clipboard = cloneBlocks(toCopy); });
                return;
            }
            if (!selectedId) return;
            const block = findBlock(blocks, selectedId);
            if (!block) return;
            set((s) => { s.clipboard = cloneBlocks([block]); });
        },

        pasteFromClipboard() {
            const { blocks, clipboard, selectedId } = get();
            if (!clipboard || clipboard.length === 0) return;
            const toPaste = cloneBlocksWithNewIds(clipboard);
            set((s) => {
                pushHistory(s);
                const targetArr = getTargetArray(s.blocks, null, null);
                const containerTypes = ["section", "columns-2", "columns-3"] as const;
                const selectedBlock = selectedId ? findBlock(s.blocks, selectedId) : null;
                const isContainer = selectedBlock && containerTypes.includes(selectedBlock.type as typeof containerTypes[number]);
                const parentArr = selectedId ? findParentArray(s.blocks, selectedId) : null;

                if (isContainer && selectedBlock?.children) {
                    const col = selectedBlock.children[0] ?? [];
                    toPaste.forEach((b) => col.push(b));
                } else if (selectedId && parentArr) {
                    const idx = parentArr.findIndex((b) => b.id === selectedId);
                    const insertIdx = idx >= 0 ? idx + 1 : parentArr.length;
                    toPaste.forEach((b, i) => parentArr.splice(insertIdx + i, 0, b));
                } else {
                    toPaste.forEach((b) => targetArr.push(b));
                }
                s.selectedId = toPaste[0]?.id ?? null;
                s.isDirty = true;
            });
        },

        insertBlocksAtRoot(blocks) {
            if (!blocks || blocks.length === 0) return;
            const toInsert = cloneBlocksWithNewIds(blocks);
            set((s) => {
                pushHistory(s);
                toInsert.forEach((b) => s.blocks.push(b));
                s.selectedId = toInsert[0]?.id ?? null;
                s.isDirty = true;
            });
        },
    }))
);
