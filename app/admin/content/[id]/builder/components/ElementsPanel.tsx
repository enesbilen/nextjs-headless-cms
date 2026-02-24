"use client";

import { useState } from "react";
import { useDraggable } from "@dnd-kit/core";
import { BLOCK_DEFINITIONS, BLOCK_CATEGORIES } from "@/core/page-builder/blocks/definitions";
import type { BlockType } from "@/core/page-builder/types";
import { useBuilderStore } from "@/core/page-builder/store";

// ---------------------------------------------------------------------------
// Draggable element card (from panel → canvas)
// ---------------------------------------------------------------------------

function DraggableElCard({ type, label, icon, description }: {
    type: BlockType;
    label: string;
    icon: string;
    description: string;
}) {
    const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
        id: `palette:${type}`,
        data: { fromPalette: true, type },
    });

    const { addBlock } = useBuilderStore();

    return (
        <button
            ref={setNodeRef}
            {...listeners}
            {...attributes}
            className={`flex flex-col items-center justify-center gap-1 py-2.5 px-1 rounded-lg border border-builder-line bg-slate-900 cursor-grab transition-all text-center text-slate-200 hover:border-blue-500 hover:bg-builder-line ${isDragging ? "opacity-40" : ""}`}
            title={description}
            onClick={() => addBlock(type)}
        >
            <span className="text-xl leading-none">{icon}</span>
            <span className="text-[0.68rem] font-semibold text-slate-400 whitespace-nowrap overflow-hidden text-ellipsis max-w-full">
                {label}
            </span>
        </button>
    );
}

// ---------------------------------------------------------------------------
// Elements Panel
// ---------------------------------------------------------------------------

export function ElementsPanel() {
    const [search, setSearch] = useState("");
    const [activeCategory, setActiveCategory] = useState<string>("all");

    const filtered = BLOCK_DEFINITIONS.filter((def) => {
        const matchSearch = def.label.toLowerCase().includes(search.toLowerCase()) ||
            def.description.toLowerCase().includes(search.toLowerCase());
        const matchCategory = activeCategory === "all" || def.category === activeCategory;
        return matchSearch && matchCategory;
    });

    return (
        <aside className="w-60 shrink-0 bg-builder-panel border-r border-builder-edge flex flex-col overflow-hidden">
            <div className="px-3.5 pt-3 pb-2 border-b border-builder-edge">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                    Elemanlar
                </span>
            </div>

            {/* Search */}
            <div className="px-3 py-2">
                <input
                    type="search"
                    placeholder="Eleman ara…"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="w-full py-1.5 px-2.5 rounded-md border border-builder-line bg-slate-900 text-slate-200 text-[0.8rem] outline-none focus:border-blue-500 placeholder:text-slate-600"
                />
            </div>

            {/* Category tabs */}
            <div className="flex flex-wrap gap-1 px-3 pb-2">
                <button
                    className={`py-[3px] px-2.5 rounded-full text-[0.7rem] border border-transparent cursor-pointer transition-all ${
                        activeCategory === "all"
                            ? "bg-blue-600 text-white"
                            : "bg-transparent text-slate-500 hover:text-slate-200 hover:bg-builder-line"
                    }`}
                    onClick={() => setActiveCategory("all")}
                >
                    Tümü
                </button>
                {BLOCK_CATEGORIES.map((cat) => (
                    <button
                        key={cat.key}
                        className={`py-[3px] px-2.5 rounded-full text-[0.7rem] border border-transparent cursor-pointer transition-all ${
                            activeCategory === cat.key
                                ? "bg-blue-600 text-white"
                                : "bg-transparent text-slate-500 hover:text-slate-200 hover:bg-builder-line"
                        }`}
                        onClick={() => setActiveCategory(cat.key)}
                    >
                        {cat.label}
                    </button>
                ))}
            </div>

            {/* Grid of blocks */}
            <div className="flex-1 overflow-y-auto py-2 px-2.5 grid grid-cols-2 gap-1.5 content-start builder-scrollbar">
                {filtered.length === 0 ? (
                    <p className="col-span-full text-center text-slate-600 text-[0.8rem] py-6">
                        Eleman bulunamadı
                    </p>
                ) : (
                    filtered.map((def) => (
                        <DraggableElCard
                            key={def.type}
                            type={def.type}
                            label={def.label}
                            icon={def.icon}
                            description={def.description}
                        />
                    ))
                )}
            </div>
        </aside>
    );
}
