"use client";

import { useState, useEffect, useCallback } from "react";
import { Dialog } from "@/core/ui/Dialog";
import { MediaManager, type MediaItem } from "@/app/admin/media/MediaManager";
import { getMediaList } from "@/app/admin/media/actions";
import { DEFAULT_PER_PAGE } from "@/app/admin/media/mediaQuery";

type MediaPickerFieldProps = {
  name: string;
  defaultValue?: string;
  accept?: "image" | "all";
  className?: string;
};

function isImageUrl(url: string): boolean {
  try {
    const path = new URL(url, window.location.origin).pathname;
    return /\.(jpg|jpeg|png|gif|webp|svg)$/i.test(path) || path.startsWith("/media/");
  } catch {
    return false;
  }
}

type PickerContentProps = {
  accept?: "image" | "all";
  onSelect: (url: string) => void;
};

function MediaPickerDialogContent({ accept, onSelect }: PickerContentProps) {
  const [items, setItems] = useState<(MediaItem & { thumbnailUrl?: string })[]>([]);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);
    getMediaList(
      1,
      DEFAULT_PER_PAGE,
      accept === "image" ? "image" : undefined,
      undefined,
      "desc"
    )
      .then((res) => {
        if (!cancelled) {
          setItems(res.items);
          setTotalPages(res.totalPages);
        }
      })
      .catch((err) => {
        if (!cancelled) setError(err instanceof Error ? err.message : "Yüklenemedi");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [accept]);

  if (loading) {
    return (
      <div className="flex min-h-[200px] items-center justify-center p-6 text-zinc-500">
        Yükleniyor…
      </div>
    );
  }
  if (error) {
    return (
      <div className="p-6 text-sm text-red-600">
        {error}
      </div>
    );
  }

  return (
    <div className="p-4">
      <MediaManager
        initialItems={items}
        totalPages={totalPages}
        currentPage={1}
        selectMode
        onSelect={onSelect}
      />
    </div>
  );
}

export function MediaPickerField({
  name,
  defaultValue = "",
  accept,
  className = "",
}: MediaPickerFieldProps) {
  const [url, setUrl] = useState(defaultValue);
  const [dialogOpen, setDialogOpen] = useState(false);

  useEffect(() => {
    setUrl(defaultValue);
  }, [defaultValue]);

  const handleSelect = useCallback((selectedUrl: string) => {
    setUrl(selectedUrl);
    setDialogOpen(false);
  }, []);

  const openPicker = useCallback(() => setDialogOpen(true), []);
  const removeSelection = useCallback(() => setUrl(""), []);

  const showPreview = url.length > 0;
  const showImagePreview = showPreview && (accept !== "image" || isImageUrl(url));

  return (
    <div className={className}>
      <input type="hidden" name={name} value={url} readOnly />

      <Dialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        title="Medya kütüphanesinden seç"
        size="full"
        closeOnBackdropClick
        closeOnEscape
        showCloseButton
        className="max-h-[90vh]"
      >
        {dialogOpen ? (
          <MediaPickerDialogContent accept={accept} onSelect={handleSelect} />
        ) : null}
      </Dialog>

      {!showPreview ? (
        <button
          type="button"
          onClick={openPicker}
          className="rounded border border-zinc-300 bg-white px-4 py-2 text-sm font-medium text-zinc-700 hover:bg-zinc-50 focus:outline-none focus:ring-2 focus:ring-zinc-400 focus:ring-offset-1"
        >
          Medya kütüphanesinden seç
        </button>
      ) : (
        <div className="flex flex-wrap items-start gap-3">
          <div className="flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden rounded-lg border border-zinc-200 bg-zinc-50">
            {showImagePreview ? (
              <img
                src={url}
                alt="Seçili medya önizlemesi"
                className="h-full w-full object-contain"
                onError={(e) => {
                  e.currentTarget.style.display = "none";
                  const fallback = e.currentTarget.nextElementSibling;
                  if (fallback) (fallback as HTMLElement).style.display = "flex";
                }}
              />
            ) : null}
            <div
              className="hidden h-full w-full items-center justify-center text-zinc-400"
              style={{ display: showImagePreview ? "none" : "flex" }}
              aria-hidden
            >
              <svg className="size-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
              </svg>
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={openPicker}
              className="rounded border border-zinc-300 bg-white px-3 py-1.5 text-sm font-medium text-zinc-700 hover:bg-zinc-50 focus:outline-none focus:ring-2 focus:ring-zinc-400 focus:ring-offset-1"
            >
              Değiştir
            </button>
            <button
              type="button"
              onClick={removeSelection}
              className="rounded border border-red-200 bg-red-50 px-3 py-1.5 text-sm font-medium text-red-700 hover:bg-red-100 focus:outline-none focus:ring-2 focus:ring-red-400 focus:ring-offset-1"
            >
              Kaldır
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
