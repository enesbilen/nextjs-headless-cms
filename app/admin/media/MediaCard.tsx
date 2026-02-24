"use client";

import type { MediaItem, UploadItem, ListItem } from "./media.types";
import { isUploadItem, isMediaItem } from "./media.types";

type MediaCardProps = {
  listItem: ListItem;
  selectMode: boolean;
  bulkSelectMode: boolean;
  selectedIds: Set<string>;
  copiedId: string | null;
  deletingId: string | null;
  retryingId: string | null;
  onToggleSelect: (id: string) => void;
  onSelectItem: (url: string) => void;
  onCopyUrl: (url: string, id: string) => void;
  onDelete: (item: MediaItem) => void;
  onEdit: (id: string) => void;
  onRetry: (id: string) => void;
  onOpenDetail?: (id: string) => void;
};

export function MediaCard({
  listItem,
  selectMode,
  bulkSelectMode,
  selectedIds,
  copiedId,
  deletingId,
  retryingId,
  onToggleSelect,
  onSelectItem,
  onCopyUrl,
  onDelete,
  onEdit,
  onRetry,
  onOpenDetail,
}: MediaCardProps) {
  if (isUploadItem(listItem)) {
    const u = listItem.item;
    return (
      <div className="relative overflow-hidden rounded-lg border border-zinc-200 bg-white shadow-sm">
        <div className="aspect-square flex flex-col items-center justify-center gap-2 bg-zinc-100 p-4 text-center text-zinc-500">
          <span className="text-xs font-medium truncate w-full">{u.filename}</span>
          <span className="text-xs">
            {u.status === "uploading" ? "Yükleniyor..." : u.status === "processing" ? "İşleniyor..." : u.status === "failed" ? "Hata" : "Hazır"}
          </span>
        </div>
        <p className="truncate px-2 py-1.5 text-xs text-zinc-600" title={u.filename}>
          {u.filename}
        </p>
      </div>
    );
  }

  const m = listItem.item;
  const isSelected = bulkSelectMode && selectedIds.has(m.id);

  if (bulkSelectMode) {
    return (
      <div
        className={`group relative overflow-hidden rounded-lg border bg-white shadow-sm transition-shadow hover:shadow-md ${
          isSelected ? "border-zinc-800 ring-2 ring-zinc-800 ring-offset-2" : "border-zinc-200"
        }`}
      >
        <button
          type="button"
          className="flex w-full cursor-pointer flex-col text-left"
          onClick={() => onToggleSelect(m.id)}
          aria-pressed={isSelected}
          aria-label={isSelected ? `${m.filename} seçili` : `${m.filename} seç`}
        >
          <div className="relative aspect-square bg-zinc-100">
            {m.status === "failed" ? (
              <div className="flex h-full flex-col items-center justify-center gap-2 p-2 text-center text-zinc-500">
                <span className="text-xs font-medium">Başarısız</span>
              </div>
            ) : m.mimeType?.startsWith("image/") ? (
              <img
                src={m.thumbnailUrl ?? m.url}
                alt={m.alt ?? m.filename}
                className="h-full w-full object-cover"
              />
            ) : (
              <div className="flex h-full items-center justify-center text-zinc-400">Dosya</div>
            )}
            {isSelected && (
              <div className="absolute inset-0 bg-black/40" aria-hidden="true" />
            )}
            <div className="absolute left-2 top-2">
              <span
                className={`flex size-6 items-center justify-center rounded-full border-2 bg-white shadow-sm ${
                  isSelected ? "border-white bg-zinc-800 text-white" : "border-zinc-400 bg-white/90"
                }`}
              >
                {isSelected && (
                  <svg className="size-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                )}
              </span>
            </div>
          </div>
          <p className="truncate px-2 py-1.5 text-xs text-zinc-600" title={m.filename}>
            {m.filename}
          </p>
        </button>
      </div>
    );
  }

  const handleImageClick = () => {
    if (selectMode && m.status === "ready") {
      onSelectItem(m.url);
    } else if (!selectMode && m.status === "ready" && onOpenDetail) {
      onOpenDetail(m.id);
    }
  };

  return (
    <div className="group relative overflow-hidden rounded-lg border border-zinc-200 bg-white shadow-sm transition-shadow hover:shadow-md">
      <button
        type="button"
        className="block w-full text-left"
        onClick={handleImageClick}
      >
        <div className="aspect-square bg-zinc-100">
          {m.status === "failed" ? (
            <div className="flex h-full flex-col items-center justify-center gap-2 p-2 text-center text-zinc-500">
              <span className="text-xs font-medium">Başarısız</span>
            </div>
          ) : m.mimeType?.startsWith("image/") ? (
            <img
              src={m.thumbnailUrl ?? m.url}
              alt={m.alt ?? m.filename}
              className="h-full w-full object-cover"
            />
          ) : (
            <div className="flex h-full items-center justify-center text-zinc-400">Dosya</div>
          )}
        </div>
        <p className="truncate px-2 py-1.5 text-xs text-zinc-600" title={m.filename}>
          {m.filename}
        </p>
      </button>
      {!selectMode && (
        <div className="flex flex-wrap items-center gap-1 border-t border-zinc-100 p-2">
          {m.status === "failed" && (
            <>
              <button
                type="button"
                onClick={(e) => { e.stopPropagation(); onRetry(m.id); }}
                disabled={retryingId === m.id}
                className="rounded px-2 py-1 text-xs font-medium text-amber-700 hover:bg-amber-50 disabled:opacity-50"
              >
                {retryingId === m.id ? "..." : "Yeniden dene"}
              </button>
              <span className="text-zinc-300">|</span>
            </>
          )}
          {m.status === "ready" && (
            <>
              <button
                type="button"
                onClick={(e) => { e.stopPropagation(); onEdit(m.id); }}
                className="rounded px-2 py-1 text-xs text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900"
              >
                Düzenle
              </button>
              <span className="text-zinc-300">|</span>
            </>
          )}
          <button
            type="button"
            onClick={(e) => { e.stopPropagation(); onDelete(m); }}
            disabled={deletingId === m.id}
            className="rounded px-2 py-1 text-xs text-red-600 hover:bg-red-50 disabled:opacity-50"
          >
            {deletingId === m.id ? "..." : "Sil"}
          </button>
          {m.status === "ready" && (
            <>
              <span className="text-zinc-300">|</span>
              <button
                type="button"
                onClick={(e) => { e.stopPropagation(); onCopyUrl(m.url, m.id); }}
                className="rounded px-2 py-1 text-xs text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900"
              >
                {copiedId === m.id ? "Kopyalandı" : "URL"}
              </button>
            </>
          )}
        </div>
      )}
    </div>
  );
}
