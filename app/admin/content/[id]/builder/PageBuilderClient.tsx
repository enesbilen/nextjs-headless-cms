"use client";

import { useEffect, useCallback, useRef } from "react";
import { useBuilderStore } from "@/core/page-builder/store";
import type { PageBuilderDoc } from "@/core/page-builder/types";
import { BuilderToolbar } from "./components/BuilderToolbar";
import { ElementsPanel } from "./components/ElementsPanel";
import { BuilderCanvas } from "./components/BuilderCanvas";
import { PropertiesPanel } from "./components/PropertiesPanel";
import { saveBuilderBlocks } from "./actions";
import "./builder.css";

interface PageBuilderClientProps {
    pageId: string;
    pageTitle: string;
    initialDoc: PageBuilderDoc | null;
}

export function PageBuilderClient({
    pageId,
    pageTitle,
    initialDoc,
}: PageBuilderClientProps) {
    const { loadBlocks, getDoc, setSaving, setClean, undo, redo, deleteSelectedBlocks, clearSelection, copySelectedToClipboard, pasteFromClipboard } = useBuilderStore();

    const hasLoaded = useRef(false);
    useEffect(() => {
        if (!hasLoaded.current) {
            loadBlocks(initialDoc);
            hasLoaded.current = true;
        }
    }, [loadBlocks, initialDoc]);

    const handleSave = useCallback(
        async (status: "DRAFT" | "PUBLISHED") => {
            setSaving(true);
            try {
                const doc = getDoc();
                await saveBuilderBlocks(pageId, doc, status);
                setClean();
            } catch (err) {
                console.error("Builder save failed", err);
            } finally {
                setSaving(false);
            }
        },
        [pageId, getDoc, setSaving, setClean]
    );

    useEffect(() => {
        function handleKey(e: KeyboardEvent) {
            const target = e.target as Node;
            const isInput = target && (
                (target as HTMLElement).tagName === "INPUT" ||
                (target as HTMLElement).tagName === "TEXTAREA" ||
                (target as HTMLElement).tagName === "SELECT" ||
                (target as HTMLElement).isContentEditable
            );

            if (e.key === "Escape") {
                e.preventDefault();
                clearSelection();
                return;
            }

            if (e.key === "Delete" || e.key === "Backspace") {
                if (!isInput) {
                    e.preventDefault();
                    deleteSelectedBlocks();
                }
                return;
            }

            const ctrl = e.ctrlKey || e.metaKey;
            if (!ctrl) return;

            if (e.key === "c") {
                if (!isInput) {
                    e.preventDefault();
                    copySelectedToClipboard();
                }
                return;
            }
            if (e.key === "v") {
                if (!isInput) {
                    e.preventDefault();
                    pasteFromClipboard();
                }
                return;
            }

            if (e.key === "z" && !e.shiftKey) {
                e.preventDefault();
                undo();
            } else if (e.key === "y" || (e.key === "z" && e.shiftKey)) {
                e.preventDefault();
                redo();
            } else if (e.key === "s") {
                e.preventDefault();
                handleSave("DRAFT");
            }
        }
        window.addEventListener("keydown", handleKey);
        return () => window.removeEventListener("keydown", handleKey);
    }, [undo, redo, deleteSelectedBlocks, clearSelection, copySelectedToClipboard, pasteFromClipboard, handleSave]);

    return (
        <div className="flex flex-col h-screen overflow-hidden font-sans bg-builder-root text-slate-200">
            <BuilderToolbar
                pageId={pageId}
                pageTitle={pageTitle}
                onSave={handleSave}
            />
            <div className="flex flex-1 overflow-hidden">
                <ElementsPanel />
                <BuilderCanvas />
                <PropertiesPanel />
            </div>
        </div>
    );
}
