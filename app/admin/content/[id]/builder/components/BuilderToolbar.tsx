"use client";

import Link from "next/link";
import { useBuilderStore } from "@/core/page-builder/store";
import type { BuilderDevice } from "@/core/page-builder/types";

interface BuilderToolbarProps {
    pageId: string;
    pageTitle: string;
    onSave: (status: "DRAFT" | "PUBLISHED") => void;
}

const DEVICE_BUTTONS: { key: BuilderDevice; label: string; icon: string }[] = [
    { key: "desktop", label: "Masaüstü", icon: "🖥" },
    { key: "tablet", label: "Tablet", icon: "▭" },
    { key: "mobile", label: "Mobil", icon: "📱" },
];

export function BuilderToolbar({ pageId, pageTitle, onSave }: BuilderToolbarProps) {
    const { device, setDevice, undo, redo, past, future, isSaving, isDirty } =
        useBuilderStore();

    return (
        <header className="flex items-center justify-between h-[52px] px-3 bg-builder-panel border-b border-builder-edge shrink-0 gap-3 z-[100]">
            {/* Left: Back + Title */}
            <div className="flex items-center gap-2.5 min-w-0 flex-1">
                <Link
                    href={`/admin/content/${pageId}`}
                    className="inline-flex items-center gap-1 py-[5px] px-2.5 rounded-md border border-builder-line bg-transparent text-slate-400 text-[0.8rem] no-underline whitespace-nowrap transition-all hover:bg-builder-line hover:text-slate-200"
                    title="Geri"
                >
                    ← Geri
                </Link>
                <span className="text-sm text-slate-200 font-medium overflow-hidden text-ellipsis whitespace-nowrap">
                    {pageTitle}
                </span>
                {isDirty && (
                    <span
                        className="w-2 h-2 rounded-full bg-amber-500 shrink-0"
                        title="Kaydedilmemiş değişiklikler var"
                    />
                )}
            </div>

            {/* Center: Device preview */}
            <div className="flex gap-1 items-center">
                {DEVICE_BUTTONS.map(({ key, label, icon }) => (
                    <button
                        key={key}
                        onClick={() => setDevice(key)}
                        className={`flex items-center justify-center w-9 h-8 rounded-md bg-transparent cursor-pointer text-lg transition-all ${
                            device === key
                                ? "text-blue-400 border border-blue-400 bg-blue-400/10"
                                : "border border-transparent text-slate-500 hover:text-slate-200 hover:bg-builder-line"
                        }`}
                        title={label}
                    >
                        <span>{icon}</span>
                    </button>
                ))}
            </div>

            {/* Right: Undo/Redo + Save */}
            <div className="flex items-center gap-1.5 flex-1 justify-end">
                <a
                    href={`/admin/content/${pageId}/preview`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="py-[5px] px-3 rounded-md text-[0.8rem] font-semibold whitespace-nowrap border border-builder-line bg-transparent text-slate-400 hover:bg-builder-line hover:text-slate-200 no-underline transition-all"
                    title="Yeni sekmede önizleme"
                >
                    👁 Önizleme
                </a>
                <div className="w-px h-6 bg-builder-line mx-0.5" />
                <button
                    onClick={() => undo()}
                    disabled={past.length === 0}
                    className="w-8 h-8 inline-flex items-center justify-center rounded-md border border-transparent bg-transparent text-slate-400 cursor-pointer text-base transition-all hover:bg-builder-line hover:text-slate-200 disabled:opacity-35 disabled:cursor-not-allowed"
                    title="Geri al (Ctrl+Z)"
                >
                    ↩
                </button>
                <button
                    onClick={() => redo()}
                    disabled={future.length === 0}
                    className="w-8 h-8 inline-flex items-center justify-center rounded-md border border-transparent bg-transparent text-slate-400 cursor-pointer text-base transition-all hover:bg-builder-line hover:text-slate-200 disabled:opacity-35 disabled:cursor-not-allowed"
                    title="Yeniden yap (Ctrl+Y)"
                >
                    ↪
                </button>
                <div className="w-px h-6 bg-builder-line mx-1" />
                <button
                    onClick={() => onSave("DRAFT")}
                    disabled={isSaving}
                    className="py-[5px] px-3.5 rounded-md text-[0.8rem] font-semibold cursor-pointer transition-all whitespace-nowrap bg-transparent border border-slate-600 text-slate-400 hover:border-slate-500 hover:text-slate-200 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {isSaving ? "Kaydediliyor…" : "Taslak Kaydet"}
                </button>
                <button
                    onClick={() => onSave("PUBLISHED")}
                    disabled={isSaving}
                    className="py-[5px] px-3.5 rounded-md text-[0.8rem] font-semibold cursor-pointer transition-all whitespace-nowrap bg-blue-600 text-white border-none hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    Yayınla
                </button>
            </div>
        </header>
    );
}
