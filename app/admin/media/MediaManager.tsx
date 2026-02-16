"use client";

import { useMediaManager } from "./useMediaManager";
import { UploadDropzone } from "./UploadDropzone";
import { MediaGrid } from "./MediaGrid";
import type { MediaItem } from "./media.types";

export type { MediaItem };

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
  } = useMediaManager({ initialItems, selectMode });

  const editingItem = state.editingId
    ? state.items.find((i) => i.id === state.editingId)
    : null;

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
      />

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
                >
                  İptal
                </button>
                <button
                  type="submit"
                  className="rounded bg-zinc-800 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-700"
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
