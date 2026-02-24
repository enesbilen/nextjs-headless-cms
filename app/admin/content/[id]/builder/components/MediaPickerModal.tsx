"use client";

/**
 * MediaPickerModal
 * ─────────────────
 * Dark-themed media selection modal for the Page Builder.
 * Includes UploadDropzone for uploading new images without leaving the modal.
 */

import { useState, useEffect, useCallback, useRef } from "react";
import axios from "axios";
import type { MediaPickerItem } from "../actions";
import { UploadDropzone } from "@/app/admin/media/UploadDropzone";

interface MediaPickerModalProps {
    open: boolean;
    onClose: () => void;
    onSelect: (url: string, item: MediaPickerItem) => void;
}

// ---------------------------------------------------------------------------
// Loading skeleton
// ---------------------------------------------------------------------------
function SkeletonGrid() {
    return (
        <div className="grid grid-cols-[repeat(auto-fill,minmax(120px,1fr))] gap-2.5">
            {Array.from({ length: 12 }).map((_, i) => (
                <div key={i} className="bg-slate-800 border-2 border-transparent rounded-[10px] overflow-hidden pointer-events-none">
                    <div className="aspect-square animate-shimmer" />
                </div>
            ))}
        </div>
    );
}

// ---------------------------------------------------------------------------
// Individual media card
// ---------------------------------------------------------------------------
function MediaCard({
    item,
    selected,
    onSelect,
}: {
    item: MediaPickerItem;
    selected: boolean;
    onSelect: () => void;
}) {
    const isImage = item.mimeType?.startsWith("image/");
    return (
        <button
            className={`flex flex-col bg-slate-800 rounded-[10px] overflow-hidden cursor-pointer transition-all text-left p-0 ${
                selected
                    ? "!border-2 !border-blue-500 !bg-[#1a2d52] !shadow-[0_0_0_3px_rgba(59,130,246,0.25)]"
                    : "border-2 border-transparent hover:border-blue-500 hover:bg-[#233252] hover:-translate-y-px hover:shadow-[0_4px_16px_rgba(59,130,246,0.2)]"
            }`}
            onClick={onSelect}
            title={item.filename}
        >
            <div className="relative aspect-square bg-slate-900 overflow-hidden flex items-center justify-center">
                {isImage ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                        src={item.thumbnailUrl}
                        alt={item.filename}
                        className="w-full h-full object-cover block"
                        loading="lazy"
                        onError={(e) => {
                            (e.currentTarget as HTMLImageElement).src = item.url;
                        }}
                    />
                ) : (
                    <div className="text-3xl opacity-50">📄</div>
                )}
                {selected && (
                    <div className="absolute top-1.5 right-1.5 w-[22px] h-[22px] bg-blue-500 rounded-full flex items-center justify-center text-white shadow-[0_2px_6px_rgba(0,0,0,0.4)]">
                        <svg viewBox="0 0 20 20" fill="currentColor" width={14} height={14}>
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414L8 15.414l-4.707-4.707a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                    </div>
                )}
            </div>
            <div className="py-[5px] px-[7px] text-[0.6rem] text-slate-400 whitespace-nowrap overflow-hidden text-ellipsis leading-tight">
                {item.filename}
            </div>
            {item.width && item.height && (
                <div className="px-[7px] pb-[5px] text-[0.55rem] text-slate-600">
                    {item.width}×{item.height}
                </div>
            )}
        </button>
    );
}

// ---------------------------------------------------------------------------
// Main modal
// ---------------------------------------------------------------------------
export function MediaPickerModal({ open, onClose, onSelect }: MediaPickerModalProps) {
    const [items, setItems] = useState<MediaPickerItem[]>([]);
    const [total, setTotal] = useState(0);
    const [page, setPage] = useState(1);
    const [search, setSearch] = useState("");
    const [searchInput, setSearchInput] = useState("");
    const [loading, setLoading] = useState(false);
    const [selected, setSelected] = useState<MediaPickerItem | null>(null);
    const [uploading, setUploading] = useState(false);
    const searchTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const uploadInputRef = useRef<HTMLInputElement | null>(null);
    const perPage = 48;

    const load = useCallback(async (s: string, p: number) => {
        setLoading(true);
        try {
            const { data } = await axios.get<{ items: MediaPickerItem[]; total: number }>(
                "/api/media/list",
                { params: { search: s, page: p, perPage } },
            );
            setItems(data.items);
            setTotal(data.total);
        } catch {
            // silently fail
        } finally {
            setLoading(false);
        }
    }, []);

    const handleFiles = useCallback(
        async (files: File[]) => {
            if (files.length === 0) return;
            const formData = new FormData();
            files.forEach((file) => formData.append("file", file));
            setUploading(true);
            try {
                const { data } = await axios.post<{
                    uploaded: { id: string; url: string; thumbnailUrl: string; filename: string; mimeType: string | null; width: number | null; height: number | null }[];
                    failed: { filename: string; reason: string }[];
                }>("/api/media/upload", formData);
                if (data.uploaded.length > 0) {
                    const newItems: MediaPickerItem[] = data.uploaded.map((u) => ({
                        id: u.id,
                        filename: u.filename,
                        url: u.url,
                        thumbnailUrl: u.thumbnailUrl,
                        mimeType: u.mimeType,
                        width: u.width,
                        height: u.height,
                    }));
                    setItems((prev) => [...newItems, ...prev]);
                    setTotal((t) => t + data.uploaded.length);
                    setSelected(newItems[0] ?? null);
                }
            } finally {
                setUploading(false);
                if (uploadInputRef.current) uploadInputRef.current.value = "";
            }
        },
        []
    );

    useEffect(() => {
        if (!open) return;
        load(search, page);
    }, [open, search, page, load]);

    useEffect(() => {
        if (open) {
            setPage(1);
            setSearch("");
            setSearchInput("");
            setSelected(null);
        }
    }, [open]);

    const handleSearchChange = (val: string) => {
        setSearchInput(val);
        if (searchTimerRef.current) clearTimeout(searchTimerRef.current);
        searchTimerRef.current = setTimeout(() => {
            setSearch(val);
            setPage(1);
        }, 350);
    };

    useEffect(() => {
        if (!open) return;
        const onKey = (e: KeyboardEvent) => {
            if (e.key === "Escape") onClose();
        };
        window.addEventListener("keydown", onKey);
        return () => window.removeEventListener("keydown", onKey);
    }, [open, onClose]);

    const totalPages = Math.ceil(total / perPage);

    const handleConfirm = () => {
        if (selected) {
            onSelect(selected.url, selected);
            onClose();
        }
    };

    if (!open) return null;

    return (
        <div
            className="fixed inset-0 z-[1000] bg-black/[0.72] backdrop-blur-[4px] flex items-center justify-center p-6 animate-fade-in"
            onClick={onClose}
            aria-modal="true"
            role="dialog"
        >
            <div
                className="bg-slate-900 border border-slate-800 rounded-2xl shadow-[0_24px_64px_rgba(0,0,0,0.6),0_0_0_1px_rgba(255,255,255,0.04)] w-full max-w-[900px] max-h-[85vh] flex flex-col overflow-hidden animate-slide-up"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header */}
                <div className="flex items-center justify-between px-5 pt-[18px] pb-3.5 border-b border-slate-800 shrink-0">
                    <div className="flex items-center gap-3">
                        <span className="text-2xl leading-none">🖼</span>
                        <div>
                            <div className="text-base font-bold text-slate-100 leading-tight">Medya Seç</div>
                            <div className="text-[0.7rem] text-slate-500 mt-0.5">
                                {total > 0 ? `${total} görsel mevcut` : "Görseller yükleniyor..."}
                            </div>
                        </div>
                    </div>
                    <button
                        className="flex items-center justify-center w-8 h-8 border border-slate-700 rounded-lg bg-transparent text-slate-500 cursor-pointer transition-all hover:bg-slate-800 hover:text-slate-200 hover:border-slate-600"
                        onClick={onClose}
                        title="Kapat"
                    >
                        <svg viewBox="0 0 20 20" fill="currentColor" width={18} height={18}>
                            <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                        </svg>
                    </button>
                </div>

                {/* Search */}
                <div className="px-5 py-3 border-b border-slate-800 shrink-0">
                    <div className="relative flex items-center">
                        <span className="absolute left-2.5 text-[0.9rem] pointer-events-none">🔍</span>
                        <input
                            className="w-full py-2 pl-[34px] pr-9 bg-slate-800 border border-slate-700 rounded-lg text-slate-200 text-[0.85rem] outline-none transition-colors focus:border-blue-500 placeholder:text-slate-600"
                            type="text"
                            placeholder="Görsellerde ara..."
                            value={searchInput}
                            onChange={(e) => handleSearchChange(e.target.value)}
                            autoFocus
                        />
                        {searchInput && (
                            <button
                                className="absolute right-2 bg-transparent border-none text-slate-500 cursor-pointer text-[0.7rem] py-0.5 px-1 rounded transition-all hover:text-slate-200 hover:bg-slate-700"
                                onClick={() => handleSearchChange("")}
                            >
                                ✕
                            </button>
                        )}
                    </div>
                </div>

                {/* Upload dropzone */}
                <div className="px-5 pt-2 pb-3 border-b border-slate-800 shrink-0">
                    <UploadDropzone
                        inputRef={uploadInputRef}
                        onFiles={handleFiles}
                        disabled={uploading}
                        className="!border-slate-600 !bg-slate-800/50"
                        labelClassName="!text-slate-400 hover:!text-slate-200"
                    />
                </div>

                {/* Grid */}
                <div className="flex-1 overflow-y-auto px-5 py-4" style={{ scrollbarWidth: "thin", scrollbarColor: "#334155 transparent" }}>
                    {loading ? (
                        <SkeletonGrid />
                    ) : items.length === 0 ? (
                        <div className="flex flex-col items-center justify-center min-h-[200px] gap-2">
                            <div className="text-[2.5rem] opacity-40">🌄</div>
                            <div className="text-[0.9rem] font-semibold text-slate-500">Görsel bulunamadı</div>
                            <div className="text-xs text-slate-600">
                                {search ? "Arama kriterlerinizi değiştirin" : "Medya yöneticisinden görsel yükleyin"}
                            </div>
                        </div>
                    ) : (
                        <div className="grid grid-cols-[repeat(auto-fill,minmax(120px,1fr))] gap-2.5">
                            {items.map((item) => (
                                <MediaCard
                                    key={item.id}
                                    item={item}
                                    selected={selected?.id === item.id}
                                    onSelect={() => setSelected(item)}
                                />
                            ))}
                        </div>
                    )}
                </div>

                {/* Preview bar */}
                {selected && (
                    <div className="flex items-center gap-3 px-5 py-2 bg-slate-800 border-t border-slate-700 shrink-0">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={selected.thumbnailUrl} alt={selected.filename} className="w-9 h-9 rounded-md object-cover border border-slate-700 shrink-0" />
                        <div className="flex-1 min-w-0">
                            <div className="text-xs text-slate-200 font-semibold whitespace-nowrap overflow-hidden text-ellipsis">
                                {selected.filename}
                            </div>
                            <div className="text-[0.65rem] text-blue-500 font-mono whitespace-nowrap overflow-hidden text-ellipsis mt-0.5">
                                {selected.url}
                            </div>
                        </div>
                    </div>
                )}

                {/* Footer */}
                <div className="flex items-center justify-between px-5 py-3 border-t border-slate-800 shrink-0 gap-3">
                    <div className="flex items-center gap-2">
                        <button
                            className="py-[5px] px-3 border border-slate-700 rounded-md bg-slate-800 text-slate-400 text-xs cursor-pointer transition-all hover:border-blue-500 hover:text-blue-400 disabled:opacity-35 disabled:cursor-not-allowed"
                            disabled={page <= 1 || loading}
                            onClick={() => setPage((p) => p - 1)}
                        >
                            ← Önceki
                        </button>
                        <span className="text-xs text-slate-600 min-w-[48px] text-center">
                            {total > 0 ? `${page} / ${totalPages}` : "—"}
                        </span>
                        <button
                            className="py-[5px] px-3 border border-slate-700 rounded-md bg-slate-800 text-slate-400 text-xs cursor-pointer transition-all hover:border-blue-500 hover:text-blue-400 disabled:opacity-35 disabled:cursor-not-allowed"
                            disabled={page >= totalPages || loading}
                            onClick={() => setPage((p) => p + 1)}
                        >
                            Sonraki →
                        </button>
                    </div>

                    <div className="flex gap-2">
                        <button
                            className="py-[7px] px-4 border border-slate-700 rounded-lg bg-transparent text-slate-500 text-[0.8rem] font-medium cursor-pointer transition-all hover:bg-slate-800 hover:text-slate-400"
                            onClick={onClose}
                        >
                            Vazgeç
                        </button>
                        <button
                            className="py-[7px] px-5 border-none rounded-lg bg-blue-600 text-white text-[0.8rem] font-semibold cursor-pointer transition-all hover:bg-blue-700 disabled:bg-slate-700 disabled:text-slate-600 disabled:cursor-not-allowed"
                            disabled={!selected}
                            onClick={handleConfirm}
                        >
                            {selected ? "Seç" : "Bir görsel seçin"}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
