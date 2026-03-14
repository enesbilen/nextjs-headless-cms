"use client";

import { useState } from "react";
import { useDraggable } from "@dnd-kit/core";
import { BLOCK_DEFINITIONS, BLOCK_CATEGORIES } from "@/core/page-builder/blocks/definitions";
import { SECTION_TEMPLATES, type SectionTemplateMeta } from "@/core/page-builder/templates/sectionTemplates";
import type { BlockType } from "@/core/page-builder/types";
import { useBuilderStore } from "@/core/page-builder/store";

// ---------------------------------------------------------------------------
// SVG icons per block type
// ---------------------------------------------------------------------------

function BlockIcon({ type, className = "w-5 h-5" }: { type: string; className?: string }) {
    const s = { fill: "none", viewBox: "0 0 24 24", stroke: "currentColor", strokeWidth: 1.6, className };
    switch (type) {
        case "section":
            return <svg {...s}><rect x="3" y="3" width="18" height="18" rx="2" /><path d="M3 9h18M3 15h18" /></svg>;
        case "columns-2":
            return <svg {...s}><rect x="3" y="3" width="18" height="18" rx="2" /><path d="M12 3v18" /></svg>;
        case "columns-3":
            return <svg {...s}><rect x="3" y="3" width="18" height="18" rx="2" /><path d="M9 3v18M15 3v18" /></svg>;
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
        case "tabs":
            return <svg {...s}><path d="M3 7h18M3 7v12a2 2 0 002 2h14a2 2 0 002-2V7M3 7l3-4h4l2 4" /></svg>;
        case "accordion":
            return <svg {...s}><rect x="3" y="4" width="18" height="5" rx="1" /><rect x="3" y="11" width="18" height="4" rx="1" /><rect x="3" y="17" width="18" height="4" rx="1" /><path strokeLinecap="round" d="M16 6.5l-2 1" /></svg>;
        case "icon-box":
            return <svg {...s}><circle cx="12" cy="8" r="4" /><path strokeLinecap="round" d="M7 17h10M9 20h6" /></svg>;
        case "list":
            return <svg {...s}><path strokeLinecap="round" d="M9 6h11M9 12h11M9 18h11" /><circle cx="4" cy="6" r="1" fill="currentColor" /><circle cx="4" cy="12" r="1" fill="currentColor" /><circle cx="4" cy="18" r="1" fill="currentColor" /></svg>;
        case "quote":
            return <svg {...s}><path d="M3 21c3-7 3-12 0-18h4c6 7 6 12 0 18zm10 0c3-7 3-12 0-18h4c6 7 6 12 0 18z" /></svg>;
        case "social-links":
            return <svg {...s}><circle cx="18" cy="5" r="3" /><circle cx="6" cy="12" r="3" /><circle cx="18" cy="19" r="3" /><path d="M8.59 13.51l6.83 3.98M15.41 6.51l-6.82 3.98" /></svg>;
        case "alert":
            return <svg {...s}><path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" /><path strokeLinecap="round" d="M12 9v4M12 17h.01" /></svg>;
        case "testimonial":
            return <svg {...s}><path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" /><path strokeLinecap="round" d="M8 9h8M8 13h5" /></svg>;
        case "counter":
            return <svg {...s}><path strokeLinecap="round" strokeLinejoin="round" d="M7 20V4m0 0l3 3M7 4L4 7M17 4v16m0 0l3-3m-3 3l-3-3" /></svg>;
        case "gallery":
            return <svg {...s}><rect x="2" y="2" width="8" height="8" rx="1" /><rect x="14" y="2" width="8" height="8" rx="1" /><rect x="2" y="14" width="8" height="8" rx="1" /><rect x="14" y="14" width="8" height="8" rx="1" /></svg>;
        case "map":
            return <svg {...s}><path d="M1 6v16l7-4 8 4 7-4V2l-7 4-8-4-7 4z" /><path d="M8 2v16M16 6v16" /></svg>;
        case "form":
            return <svg {...s}><rect x="3" y="3" width="18" height="18" rx="2" /><path strokeLinecap="round" d="M7 8h10M7 12h10M7 16h6" /></svg>;
        case "progress-bar":
            return <svg {...s}><rect x="2" y="10" width="20" height="4" rx="2" /><rect x="2" y="10" width="14" height="4" rx="2" fill="currentColor" opacity={0.3} /></svg>;
        case "navigation-menu":
            return <svg {...s}><path strokeLinecap="round" d="M4 6h16M4 12h16M4 18h16" /></svg>;
        case "breadcrumb":
            return <svg {...s}><path strokeLinecap="round" d="M3 12h4l3-3h4l3 3h4" /><circle cx="12" cy="12" r="1.5" fill="currentColor" /></svg>;
        default:
            return <svg {...s}><rect x="3" y="3" width="18" height="18" rx="2" /></svg>;
    }
}

// ---------------------------------------------------------------------------
// Draggable element card (palette → canvas)
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
            className={`group flex items-center gap-2.5 w-full py-2.5 px-3 rounded-lg border border-builder-line/60 bg-white/[0.03] cursor-grab transition-all text-left text-slate-300 hover:border-blue-500/50 hover:bg-blue-500/[0.06] hover:shadow-sm ${isDragging ? "opacity-40 scale-95" : ""}`}
            title={description}
            onClick={() => addBlock(type)}
        >
            <span className="flex items-center justify-center w-8 h-8 rounded-md bg-white/[0.06] text-slate-400 group-hover:text-blue-400 group-hover:bg-blue-500/10 transition-colors shrink-0">
                <BlockIcon type={type} className="w-4 h-4" />
            </span>
            <span className="text-xs font-medium text-slate-400 group-hover:text-slate-200 transition-colors truncate">
                {label}
            </span>
        </button>
    );
}

// ---------------------------------------------------------------------------
// Template card
// ---------------------------------------------------------------------------

function TemplateCard({ template }: { template: SectionTemplateMeta }) {
    const { insertBlocksAtRoot } = useBuilderStore();
    return (
        <button
            type="button"
            onClick={() => insertBlocksAtRoot(template.blocks)}
            className="group flex items-center gap-2.5 w-full py-2.5 px-3 rounded-lg border border-builder-line/60 bg-gradient-to-r from-blue-500/[0.04] to-purple-500/[0.04] text-left cursor-pointer transition-all hover:border-blue-500/50 hover:from-blue-500/[0.08] hover:to-purple-500/[0.08] text-slate-200"
            title={template.description}
        >
            <span className="flex items-center justify-center w-8 h-8 rounded-md bg-blue-500/10 text-blue-400 shrink-0">
                <BlockIcon type={template.id === "hero" ? "hero" : template.id === "features-3col" ? "columns-3" : template.id === "cta" ? "button" : template.id === "two-col-text" ? "columns-2" : "section"} className="w-4 h-4" />
            </span>
            <div className="min-w-0 flex-1">
                <span className="text-xs font-semibold text-slate-200 block truncate">
                    {template.label}
                </span>
                <span className="text-[11px] text-slate-500 block truncate leading-tight">
                    {template.description}
                </span>
            </div>
        </button>
    );
}

// ---------------------------------------------------------------------------
// Collapsible section
// ---------------------------------------------------------------------------

function PanelSection({ title, defaultOpen = true, children, count }: {
    title: string;
    defaultOpen?: boolean;
    children: React.ReactNode;
    count?: number;
}) {
    const [open, setOpen] = useState(defaultOpen);
    return (
        <div className="border-b border-builder-edge/60">
            <button
                onClick={() => setOpen(!open)}
                className="flex items-center justify-between w-full py-2.5 px-4 text-left text-[11px] font-bold uppercase tracking-wider text-slate-500 hover:text-slate-400 transition-colors bg-transparent border-none cursor-pointer"
            >
                <span className="flex items-center gap-2">
                    {title}
                    {count != null && (
                        <span className="text-[10px] font-semibold text-slate-600 bg-white/[0.06] px-1.5 py-px rounded-full">
                            {count}
                        </span>
                    )}
                </span>
                <svg
                    className={`w-3.5 h-3.5 transition-transform ${open ? "rotate-0" : "-rotate-90"}`}
                    fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}
                >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                </svg>
            </button>
            {open && <div className="px-3 pb-3">{children}</div>}
        </div>
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

    const allCategories = [{ key: "all" as const, label: "Tümü" }, ...BLOCK_CATEGORIES];

    return (
        <aside className="w-[280px] shrink-0 bg-builder-panel border-r border-builder-edge flex flex-col overflow-hidden">
            {/* Header */}
            <div className="flex items-center gap-2 px-4 pt-3.5 pb-3 border-b border-builder-edge">
                <svg className="w-4 h-4 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                </svg>
                <span className="text-sm font-bold text-slate-200">Elemanlar</span>
            </div>

            {/* Search */}
            <div className="px-3 py-2.5">
                <div className="relative">
                    <svg className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-500 pointer-events-none" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <circle cx="11" cy="11" r="8" />
                        <path strokeLinecap="round" d="M21 21l-4.35-4.35" />
                    </svg>
                    <input
                        type="search"
                        placeholder="Eleman ara..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="w-full py-2 pl-8 pr-3 rounded-lg border border-builder-line/60 bg-white/[0.04] text-slate-200 text-xs outline-none focus:border-blue-500/60 focus:bg-white/[0.06] placeholder:text-slate-600 transition-all"
                    />
                </div>
            </div>

            {/* Category tabs */}
            <div className="flex flex-wrap gap-1 px-3 pb-2.5">
                {allCategories.map((cat) => (
                    <button
                        key={cat.key}
                        className={`py-1 px-2.5 rounded-md text-[11px] font-medium border transition-all ${
                            activeCategory === cat.key
                                ? "bg-blue-600/20 text-blue-400 border-blue-500/30"
                                : "bg-transparent text-slate-500 border-transparent hover:text-slate-300 hover:bg-white/[0.05]"
                        }`}
                        onClick={() => setActiveCategory(cat.key)}
                    >
                        {cat.label}
                    </button>
                ))}
            </div>

            {/* Scrollable content */}
            <div className="flex-1 overflow-y-auto builder-scrollbar">
                {/* Section Templates */}
                <PanelSection title="Hazır Şablonlar" defaultOpen={search === ""} count={SECTION_TEMPLATES.length}>
                    <div className="flex flex-col gap-1.5">
                        {SECTION_TEMPLATES.map((tpl) => (
                            <TemplateCard key={tpl.id} template={tpl} />
                        ))}
                    </div>
                </PanelSection>

                {/* Block elements */}
                <PanelSection title="Bloklar" count={filtered.length}>
                    {filtered.length === 0 ? (
                        <div className="flex flex-col items-center gap-2 py-8 text-center">
                            <svg className="w-8 h-8 text-slate-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                            </svg>
                            <p className="text-slate-500 text-xs">Eleman bulunamadı</p>
                        </div>
                    ) : (
                        <div className="flex flex-col gap-1">
                            {filtered.map((def) => (
                                <DraggableElCard
                                    key={def.type}
                                    type={def.type}
                                    label={def.label}
                                    icon={def.icon}
                                    description={def.description}
                                />
                            ))}
                        </div>
                    )}
                </PanelSection>
            </div>
        </aside>
    );
}
