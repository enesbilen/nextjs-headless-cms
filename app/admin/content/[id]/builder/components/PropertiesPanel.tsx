"use client";

import { useState } from "react";
import { useBuilderStore } from "@/core/page-builder/store";
import type { BlockInstance, BlockVisibility } from "@/core/page-builder/types";
import { getBlockDefinition } from "@/core/page-builder/blocks/definitions";
import { findBlock } from "@/core/page-builder/store";
import { SectionDivider, ToggleInput, FieldRow } from "./widgets";
import {
    HeadingEditor, TextEditor, ImageEditor, ButtonEditor, DividerEditor,
    SpacerEditor, SectionEditor, ColumnsEditor, HeroEditor, CardEditor,
    HtmlEditor, VideoEditor, TabsEditor, AccordionEditor, IconBoxEditor,
    ListEditor, QuoteEditor, SocialLinksEditor, AlertEditor, TestimonialEditor,
    CounterEditor, GalleryEditor, MapEditor, FormEditor, ProgressBarEditor,
    NavigationMenuEditor, BreadcrumbEditor, PageSettingsEditor, AdvancedStyleEditor,
} from "./editors";

// ---------------------------------------------------------------------------
// Visibility fields
// ---------------------------------------------------------------------------

function VisibilityFields({ block }: { block: BlockInstance }) {
    const { updateBlockVisibility } = useBuilderStore();
    const v = block.visibility;
    const showOnDesktop = !v?.hideOnDesktop;
    const showOnTablet = !v?.hideOnTablet;
    const showOnMobile = !v?.hideOnMobile;

    const set = (patch: Partial<BlockVisibility>) => {
        const next: BlockVisibility = {
            hideOnDesktop: patch.hideOnDesktop ?? v?.hideOnDesktop,
            hideOnTablet: patch.hideOnTablet ?? v?.hideOnTablet,
            hideOnMobile: patch.hideOnMobile ?? v?.hideOnMobile,
        };
        updateBlockVisibility(block.id, next);
    };

    return (
        <>
            <SectionDivider label="Görünürlük" />
            <FieldRow label="Masaüstünde göster">
                <ToggleInput value={showOnDesktop} onChange={(checked) => set({ hideOnDesktop: !checked })} label="Masaüstünde göster" />
            </FieldRow>
            <FieldRow label="Tablet'te göster">
                <ToggleInput value={showOnTablet} onChange={(checked) => set({ hideOnTablet: !checked })} label="Tablet'te göster" />
            </FieldRow>
            <FieldRow label="Mobilde göster">
                <ToggleInput value={showOnMobile} onChange={(checked) => set({ hideOnMobile: !checked })} label="Mobilde göster" />
            </FieldRow>
        </>
    );
}

// ---------------------------------------------------------------------------
// Block editor router
// ---------------------------------------------------------------------------

function BlockEditor({ block }: { block: BlockInstance }) {
    switch (block.type) {
        case "heading": return <HeadingEditor block={block} />;
        case "text": return <TextEditor block={block} />;
        case "image": return <ImageEditor block={block} />;
        case "button": return <ButtonEditor block={block} />;
        case "divider": return <DividerEditor block={block} />;
        case "spacer": return <SpacerEditor block={block} />;
        case "section": return <SectionEditor block={block} />;
        case "columns-2":
        case "columns-3": return <ColumnsEditor block={block} />;
        case "hero": return <HeroEditor block={block} />;
        case "card": return <CardEditor block={block} />;
        case "html": return <HtmlEditor block={block} />;
        case "video": return <VideoEditor block={block} />;
        case "tabs": return <TabsEditor block={block} />;
        case "accordion": return <AccordionEditor block={block} />;
        case "icon-box": return <IconBoxEditor block={block} />;
        case "list": return <ListEditor block={block} />;
        case "quote": return <QuoteEditor block={block} />;
        case "social-links": return <SocialLinksEditor block={block} />;
        case "alert": return <AlertEditor block={block} />;
        case "testimonial": return <TestimonialEditor block={block} />;
        case "counter": return <CounterEditor block={block} />;
        case "gallery": return <GalleryEditor block={block} />;
        case "map": return <MapEditor block={block} />;
        case "form": return <FormEditor block={block} />;
        case "progress-bar": return <ProgressBarEditor block={block} />;
        case "navigation-menu": return <NavigationMenuEditor block={block} />;
        case "breadcrumb": return <BreadcrumbEditor block={block} />;
        default: return <p className="text-slate-500 text-sm">Bu blok için ayarlar yok.</p>;
    }
}

// ---------------------------------------------------------------------------
// Properties Panel — main export
// ---------------------------------------------------------------------------

export { PageSettingsEditor };

export function PropertiesPanel({ pageId }: { pageId: string }) {
    const { blocks, selectedId, deleteBlock, duplicateBlock } = useBuilderStore();
    const [activeTab, setActiveTab] = useState<"content" | "advanced">("content");

    if (!selectedId) {
        return (
            <aside className="w-[280px] shrink-0 bg-builder-panel border-l border-builder-edge flex flex-col overflow-hidden">
                <div className="flex items-center justify-between py-2.5 px-3.5 border-b border-builder-edge gap-2">
                    <div className="flex items-center gap-1.5 text-[0.8rem] font-semibold text-slate-200 overflow-hidden">
                        <span className="text-base">⚙</span>
                        <span>Sayfa Ayarları</span>
                    </div>
                </div>
                <PageSettingsEditor pageId={pageId} />
            </aside>
        );
    }

    const block = findBlock(blocks, selectedId);
    if (!block) return null;
    const def = getBlockDefinition(block.type);

    return (
        <aside className="w-[280px] shrink-0 bg-builder-panel border-l border-builder-edge flex flex-col overflow-hidden">
            <div className="flex items-center justify-between py-2.5 px-3.5 border-b border-builder-edge gap-2">
                <div className="flex items-center gap-1.5 text-[0.8rem] font-semibold text-slate-200 overflow-hidden">
                    <span className="text-base">{def.icon}</span>
                    <span>{def.label} Ayarları</span>
                </div>
                <div className="flex gap-1">
                    <button
                        onClick={() => duplicateBlock(block.id)}
                        className="w-6 h-6 inline-flex items-center justify-center rounded border border-builder-line bg-transparent text-slate-500 cursor-pointer text-xs transition-all hover:bg-builder-line hover:text-slate-200"
                        title="Kopyala"
                    >⧉</button>
                    <button
                        onClick={() => deleteBlock(block.id)}
                        className="w-6 h-6 inline-flex items-center justify-center rounded border border-builder-line bg-transparent text-slate-500 cursor-pointer text-xs transition-all hover:bg-red-900 hover:border-red-500 hover:text-red-500"
                        title="Sil"
                    >✕</button>
                </div>
            </div>

            {/* Content / Advanced tab switcher */}
            <div className="flex gap-0.5 p-1 mx-3 mt-2 bg-slate-900 rounded-lg">
                <button
                    className={`flex-1 py-[5px] px-2 rounded-md border-none cursor-pointer text-[0.72rem] font-semibold transition-all whitespace-nowrap ${
                        activeTab === "content" ? "bg-builder-active text-blue-400" : "bg-transparent text-slate-500 hover:text-slate-200"
                    }`}
                    onClick={() => setActiveTab("content")}
                >
                    İçerik
                </button>
                <button
                    className={`flex-1 py-[5px] px-2 rounded-md border-none cursor-pointer text-[0.72rem] font-semibold transition-all whitespace-nowrap ${
                        activeTab === "advanced" ? "bg-builder-active text-blue-400" : "bg-transparent text-slate-500 hover:text-slate-200"
                    }`}
                    onClick={() => setActiveTab("advanced")}
                >
                    Gelişmiş
                </button>
            </div>

            <div className="flex-1 overflow-y-auto p-3 flex flex-col gap-2.5 builder-scrollbar">
                {activeTab === "content" && (
                    <>
                        <VisibilityFields block={block} />
                        <BlockEditor block={block} />
                    </>
                )}
                {activeTab === "advanced" && (
                    <AdvancedStyleEditor block={block} />
                )}
            </div>
        </aside>
    );
}
