"use client";

import Link from "next/link";
import { useBuilderStore } from "@/core/page-builder/store";
import type { BuilderDevice } from "@/core/page-builder/types";

interface BuilderToolbarProps {
    pageId: string;
    pageTitle: string;
    onSave: (status: "DRAFT" | "PUBLISHED") => void;
}

const DEVICE_BUTTONS: { key: BuilderDevice; label: string; icon: React.ReactNode }[] = [
    {
        key: "desktop",
        label: "Masaüstü",
        icon: (
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
        ),
    },
    {
        key: "tablet",
        label: "Tablet",
        icon: (
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 18h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
            </svg>
        ),
    },
    {
        key: "mobile",
        label: "Mobil",
        icon: (
            <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
            </svg>
        ),
    },
];

export function BuilderToolbar({ pageId, pageTitle, onSave }: BuilderToolbarProps) {
    const { device, setDevice, undo, redo, past, future, isSaving, isDirty } =
        useBuilderStore();

    return (
        <header className="relative flex items-center justify-between h-14 px-4 bg-builder-panel border-b border-builder-edge shrink-0 gap-4 z-[9999]">
            {/* Left: Back + Title */}
            <div className="flex items-center gap-3 min-w-0 flex-1">
                <Link
                    href={`/admin/content/${pageId}`}
                    className="inline-flex items-center gap-1.5 py-1.5 px-3 rounded-lg border border-builder-line/60 bg-white/[0.04] text-slate-400 text-xs font-medium no-underline whitespace-nowrap transition-all hover:bg-white/[0.08] hover:text-slate-200 hover:border-builder-line"
                >
                    <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                    </svg>
                    Geri
                </Link>
                <div className="h-5 w-px bg-builder-line/50" />
                <span className="text-sm text-slate-200 font-semibold overflow-hidden text-ellipsis whitespace-nowrap">
                    {pageTitle}
                </span>
                {isDirty && (
                    <span className="flex items-center gap-1.5 text-[10px] font-semibold text-amber-400 bg-amber-400/10 px-2 py-0.5 rounded-full">
                        <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
                        Kaydedilmedi
                    </span>
                )}
            </div>

            {/* Center: Device preview */}
            <div className="flex items-center gap-0.5 rounded-lg border border-builder-line/50 bg-white/[0.03] p-0.5">
                {DEVICE_BUTTONS.map(({ key, label, icon }) => (
                    <button
                        key={key}
                        onClick={() => setDevice(key)}
                        className={`flex items-center justify-center w-9 h-8 rounded-md transition-all ${
                            device === key
                                ? "text-blue-400 bg-blue-500/15 shadow-sm"
                                : "text-slate-500 hover:text-slate-300 hover:bg-white/[0.06]"
                        }`}
                        title={label}
                    >
                        {icon}
                    </button>
                ))}
            </div>

            {/* Right: Actions */}
            <div className="flex items-center gap-2 flex-1 justify-end">
                <a
                    href={`/admin/content/${pageId}/preview`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 py-1.5 px-3 rounded-lg text-xs font-medium whitespace-nowrap border border-builder-line/60 bg-white/[0.04] text-slate-400 hover:bg-white/[0.08] hover:text-slate-200 no-underline transition-all"
                >
                    <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                    Önizleme
                </a>

                <div className="h-5 w-px bg-builder-line/50" />

                <div className="flex items-center gap-0.5 rounded-lg border border-builder-line/50 bg-white/[0.03] p-0.5">
                    <button
                        onClick={() => undo()}
                        disabled={past.length === 0}
                        className="w-8 h-7 inline-flex items-center justify-center rounded-md text-slate-400 transition-all hover:bg-white/[0.06] hover:text-slate-200 disabled:opacity-30 disabled:cursor-not-allowed"
                        title="Geri al (Ctrl+Z)"
                    >
                        <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M3 10h10a5 5 0 010 10H9" />
                            <path strokeLinecap="round" strokeLinejoin="round" d="M7 6L3 10l4 4" />
                        </svg>
                    </button>
                    <button
                        onClick={() => redo()}
                        disabled={future.length === 0}
                        className="w-8 h-7 inline-flex items-center justify-center rounded-md text-slate-400 transition-all hover:bg-white/[0.06] hover:text-slate-200 disabled:opacity-30 disabled:cursor-not-allowed"
                        title="Yeniden yap (Ctrl+Y)"
                    >
                        <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M21 10H11a5 5 0 000 10h4" />
                            <path strokeLinecap="round" strokeLinejoin="round" d="M17 6l4 4-4 4" />
                        </svg>
                    </button>
                </div>

                <div className="h-5 w-px bg-builder-line/50" />

                <button
                    onClick={() => onSave("DRAFT")}
                    disabled={isSaving}
                    className="py-1.5 px-4 rounded-lg text-xs font-semibold transition-all whitespace-nowrap bg-white/[0.06] border border-slate-600/50 text-slate-300 hover:bg-white/[0.1] hover:text-white disabled:opacity-40 disabled:cursor-not-allowed"
                >
                    {isSaving ? "Kaydediliyor..." : "Taslak"}
                </button>
                <button
                    onClick={() => onSave("PUBLISHED")}
                    disabled={isSaving}
                    className="py-1.5 px-5 rounded-lg text-xs font-bold transition-all whitespace-nowrap bg-blue-600 text-white border-none shadow-lg shadow-blue-600/25 hover:bg-blue-500 hover:shadow-blue-500/30 disabled:opacity-40 disabled:cursor-not-allowed"
                >
                    Yayınla
                </button>
            </div>
        </header>
    );
}
