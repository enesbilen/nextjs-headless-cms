"use client";

import { useEffect, useRef, useCallback } from "react";
import { useMediaManager } from "./useMediaManager";
import { UploadDropzone } from "./UploadDropzone";
import { MediaGrid } from "./MediaGrid";
import type { MediaItem } from "./media.types";

export type { MediaItem };

function mimeToLabel(mime: string | null): string {
  if (!mime) return "—";
  if (mime === "image/png") return "PNG";
  if (mime === "image/jpeg" || mime === "image/jpg") return "JPEG";
  if (mime === "image/svg+xml") return "SVG";
  if (mime === "image/gif") return "GIF";
  if (mime === "image/webp") return "WebP";
  if (mime.startsWith("image/")) return mime.replace("image/", "").toUpperCase();
  return mime;
}

const FOCUSABLE =
  'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

function useFocusTrap(active: boolean, containerRef: React.RefObject<HTMLDivElement | null>) {
  useEffect(() => {
    if (!active || !containerRef.current) return;
    const el = containerRef.current;
    const focusable = Array.from<HTMLElement>(el.querySelectorAll(FOCUSABLE)).filter(
      (n) => n.offsetParent != null
    );
    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    if (first) first.focus();
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key !== "Tab") return;
      if (e.shiftKey) {
        if (document.activeElement === first) {
          e.preventDefault();
          last?.focus();
        }
      } else {
        if (document.activeElement === last) {
          e.preventDefault();
          first?.focus();
        }
      }
    };
    el.addEventListener("keydown", onKeyDown);
    return () => el.removeEventListener("keydown", onKeyDown);
  }, [active, containerRef]);
}

type Props = {
  initialItems: MediaItem[];
  totalPages: number;
  currentPage: number;
  selectMode: boolean;
};

export function MediaManager({
  initialItems,
  selectMode,
}: Props) {
  const {
    state,
    listItems,
    inputRef,
    isUploading,
    handleFiles,
    copyUrl,
    selectItem,
    handleDelete,
    handleEditSubmit,
    startBulkSelect,
    toggleBulkSelect,
    handleBulkDelete,
    cancelBulkSelect,
    handleRetry,
    setEditingId,
    setDetailId,
  } = useMediaManager({ items: initialItems, selectMode });

  const editingItem = state.editingId
    ? initialItems.find((i) => i.id === state.editingId)
    : null;

  const detailItem = state.detailId
    ? initialItems.find((i) => i.id === state.detailId)
    : null;

  const mediaItems = initialItems;
  const detailIndex = detailItem ? mediaItems.findIndex((i) => i.id === detailItem.id) : -1;
  const hasPrev = detailIndex > 0;
  const hasNext = detailIndex >= 0 && detailIndex < mediaItems.length - 1;
  const prevItem = hasPrev ? mediaItems[detailIndex - 1] : null;
  const nextItem = hasNext ? mediaItems[detailIndex + 1] : null;

  const detailModalRef = useRef<HTMLDivElement>(null);
  useFocusTrap(!!detailItem, detailModalRef);

  useEffect(() => {
    if (!detailItem) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [detailItem]);

  const handleDetailKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "Escape") setDetailId(null);
      if (e.key === "ArrowLeft" && hasPrev && prevItem) {
        e.preventDefault();
        setDetailId(prevItem.id);
      }
      if (e.key === "ArrowRight" && hasNext && nextItem) {
        e.preventDefault();
        setDetailId(nextItem.id);
      }
    },
    [setDetailId, hasPrev, hasNext, prevItem, nextItem]
  );

  return (
    <div className="space-y-6">
      <UploadDropzone
        inputRef={inputRef}
        onFiles={handleFiles}
        disabled={isUploading}
      />

      {state.error && (
        <p className="rounded bg-red-100 px-3 py-2 text-sm text-red-800">
          {state.error}
        </p>
      )}

      {!selectMode && (
        <div className="flex flex-wrap items-center gap-2">
          {!state.bulkSelectMode ? (
            <button
              type="button"
              onClick={startBulkSelect}
              className="rounded border border-zinc-300 bg-white px-3 py-1.5 text-sm text-zinc-700 hover:bg-zinc-50"
            >
              Seç
            </button>
          ) : (
            <>
              <button
                type="button"
                onClick={cancelBulkSelect}
                className="rounded border border-zinc-300 bg-white px-3 py-1.5 text-sm text-zinc-700 hover:bg-zinc-50"
              >
                Seçimi kaldır
              </button>
              {state.selectedIds.size > 0 && (
                <button
                  type="button"
                  onClick={handleBulkDelete}
                  disabled={state.bulkDeleting}
                  className="rounded border border-red-300 bg-red-50 px-3 py-1.5 text-sm font-medium text-red-700 hover:bg-red-100 disabled:opacity-50"
                >
                  {state.bulkDeleting ? "Siliniyor..." : `Seçilenleri sil (${state.selectedIds.size})`}
                </button>
              )}
            </>
          )}
        </div>
      )}

      <MediaGrid
        listItems={listItems}
        selectMode={selectMode}
        bulkSelectMode={state.bulkSelectMode}
        selectedIds={state.selectedIds}
        copiedId={state.copiedId}
        deletingId={state.deletingId}
        retryingId={state.retryingId}
        onToggleSelect={toggleBulkSelect}
        onSelectItem={selectItem}
        onCopyUrl={copyUrl}
        onDelete={handleDelete}
        onEdit={setEditingId}
        onRetry={handleRetry}
        onOpenDetail={!selectMode ? setDetailId : undefined}
      />

      {detailItem && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4"
          onClick={() => setDetailId(null)}
          role="dialog"
          aria-modal="true"
          aria-labelledby="detail-media-title"
          aria-describedby="detail-media-position"
        >
          <div
            ref={detailModalRef}
            tabIndex={-1}
            className="flex max-h-[90vh] w-full max-w-5xl flex-col overflow-hidden rounded-xl border border-zinc-200 bg-white shadow-2xl outline-none"
            onClick={(e) => e.stopPropagation()}
            onKeyDown={handleDetailKeyDown}
          >
            <div className="flex shrink-0 items-center justify-between border-b border-zinc-200 px-4 py-3">
              <h2 id="detail-media-title" className="truncate text-lg font-semibold text-zinc-900">
                {detailItem.filename}
              </h2>
              <div className="flex items-center gap-2">
                {mediaItems.length > 0 && (
                  <span
                    id="detail-media-position"
                    className="text-sm text-zinc-500"
                    aria-live="polite"
                  >
                    {detailIndex + 1} / {mediaItems.length}
                  </span>
                )}
                <button
                  type="button"
                  onClick={() => setDetailId(null)}
                  className="rounded p-1.5 text-zinc-500 hover:bg-zinc-100 hover:text-zinc-700 focus:outline-none focus:ring-2 focus:ring-zinc-400"
                  aria-label="Modalı kapat"
                >
                  <svg className="size-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>
            <div className="flex min-h-0 flex-1 overflow-hidden sm:flex-row">
              <div className="relative flex flex-1 shrink-0 items-center justify-center overflow-hidden bg-zinc-100 p-4">
                {hasPrev && prevItem && (
                  <button
                    type="button"
                    onClick={() => setDetailId(prevItem.id)}
                    className="absolute left-2 top-1/2 z-10 -translate-y-1/2 rounded-full bg-black/50 p-2 text-white hover:bg-black/70 focus:outline-none focus:ring-2 focus:ring-white"
                    aria-label="Önceki medya"
                  >
                    <svg className="size-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                    </svg>
                  </button>
                )}
                {detailItem.mimeType?.startsWith("image/") ? (
                  <img
                    src={detailItem.url}
                    alt={detailItem.alt ?? detailItem.filename}
                    className="max-h-[80vh] w-auto max-w-full object-contain"
                  />
                ) : (
                  <div className="rounded-lg border border-zinc-200 bg-white px-6 py-4 text-zinc-500">
                    Önizleme yok — {mimeToLabel(detailItem.mimeType)}
                  </div>
                )}
                {hasNext && nextItem && (
                  <button
                    type="button"
                    onClick={() => setDetailId(nextItem.id)}
                    className="absolute right-2 top-1/2 z-10 -translate-y-1/2 rounded-full bg-black/50 p-2 text-white hover:bg-black/70 focus:outline-none focus:ring-2 focus:ring-white"
                    aria-label="Sonraki medya"
                  >
                    <svg className="size-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                    </svg>
                  </button>
                )}
              </div>
              <div className="w-full shrink-0 overflow-y-auto border-t border-zinc-200 bg-zinc-50 p-4 sm:w-72 sm:border-t-0 sm:border-l">
                <dl className="space-y-2 text-sm">
                  <div>
                    <dt className="font-medium text-zinc-500">Dosya adı</dt>
                    <dd className="mt-0.5 truncate text-zinc-900" title={detailItem.filename}>
                      {detailItem.filename}
                    </dd>
                  </div>
                  {(detailItem.width != null || detailItem.height != null) && (
                    <div>
                      <dt className="font-medium text-zinc-500">Boyut</dt>
                      <dd className="mt-0.5 text-zinc-900">
                        {detailItem.width ?? "—"} × {detailItem.height ?? "—"} px
                      </dd>
                    </div>
                  )}
                  <div>
                    <dt className="font-medium text-zinc-500">Tür</dt>
                    <dd className="mt-0.5 text-zinc-900">{mimeToLabel(detailItem.mimeType)}</dd>
                  </div>
                  {detailItem.createdAt && (
                    <div>
                      <dt className="font-medium text-zinc-500">Yüklenme tarihi</dt>
                      <dd className="mt-0.5 text-zinc-900">
                        {new Date(detailItem.createdAt).toLocaleString("tr-TR")}
                      </dd>
                    </div>
                  )}
                </dl>
                <div className="mt-4 flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setEditingId(detailItem.id);
                      setDetailId(null);
                    }}
                    className="rounded border border-zinc-300 bg-white px-3 py-1.5 text-sm font-medium text-zinc-700 hover:bg-zinc-50 focus:outline-none focus:ring-2 focus:ring-zinc-400"
                    aria-label="Medyayı düzenle"
                  >
                    Düzenle
                  </button>
                  <button
                    type="button"
                    onClick={() => copyUrl(detailItem.url, detailItem.id)}
                    className="rounded border border-zinc-300 bg-white px-3 py-1.5 text-sm font-medium text-zinc-700 hover:bg-zinc-50 focus:outline-none focus:ring-2 focus:ring-zinc-400"
                    aria-label="URL adresini kopyala"
                  >
                    {state.copiedId === detailItem.id ? "Kopyalandı" : "URL kopyala"}
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDelete(detailItem)}
                    disabled={state.deletingId === detailItem.id}
                    className="rounded border border-red-300 bg-red-50 px-3 py-1.5 text-sm font-medium text-red-700 hover:bg-red-100 disabled:opacity-50 focus:outline-none focus:ring-2 focus:ring-red-400"
                    aria-label="Medyayı sil"
                  >
                    {state.deletingId === detailItem.id ? "Siliniyor..." : "Sil"}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {editingItem && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
          onClick={() => setEditingId(null)}
          role="dialog"
          aria-modal="true"
          aria-labelledby="edit-media-title"
        >
          <div
            className="w-full max-w-md rounded-lg border border-zinc-200 bg-white p-6 shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 id="edit-media-title" className="mb-4 text-lg font-semibold">
              Medyayı düzenle
            </h2>
            <form
              className="space-y-4"
              onSubmit={async (e) => {
                e.preventDefault();
                await handleEditSubmit(editingItem.id, new FormData(e.currentTarget));
              }}
            >
              <label className="block">
                <span className="text-sm font-medium text-zinc-700">Dosya adı</span>
                <input
                  type="text"
                  name="filename"
                  defaultValue={editingItem.filename}
                  className="mt-1 w-full rounded border border-zinc-300 px-3 py-2 text-sm"
                  required
                />
              </label>
              <label className="block">
                <span className="text-sm font-medium text-zinc-700">Alt metin (isteğe bağlı)</span>
                <input
                  type="text"
                  name="alt"
                  defaultValue={editingItem.alt ?? ""}
                  placeholder="Görsel açıklaması"
                  className="mt-1 w-full rounded border border-zinc-300 px-3 py-2 text-sm"
                />
              </label>
              {state.editError && (
                <p className="rounded bg-red-50 px-2 py-1 text-sm text-red-700">{state.editError}</p>
              )}
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setEditingId(null)}
                  className="rounded border border-zinc-300 px-4 py-2 text-sm hover:bg-zinc-50"
                  aria-label="Düzenlemeyi iptal et"
                >
                  İptal
                </button>
                <button
                  type="submit"
                  className="rounded bg-zinc-800 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-700"
                  aria-label="Değişiklikleri kaydet"
                >
                  Kaydet
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {listItems.length === 0 && (
        <p className="py-8 text-center text-zinc-500">
          Henüz medya yok. Yüklemek için yukarıyı kullanın.
        </p>
      )}
    </div>
  );
}
