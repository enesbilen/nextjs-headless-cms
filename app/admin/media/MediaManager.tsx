"use client";

import { useRouter } from "next/navigation";
import { useCallback, useState } from "react";
import { uploadMedia } from "./actions";

type MediaItem = {
  id: string;
  filename: string;
  mimeType: string | null;
  width: number | null;
  height: number | null;
  createdAt: Date;
  url: string;
  thumbnailUrl: string;
};

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
  const router = useRouter();
  const [items, setItems] = useState(initialItems);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const handleFiles = useCallback(
    async (files: FileList | null) => {
      if (!files?.length) return;
      setError(null);
      setUploading(true);
      for (let i = 0; i < files.length; i++) {
        const formData = new FormData();
        formData.set("file", files[i]);
        const result = await uploadMedia(formData);
        if (result.ok) {
          setItems((prev) => [
            {
              id: result.media.id,
              filename: result.media.filename,
              mimeType: null,
              width: result.media.width,
              height: result.media.height,
              createdAt: new Date(),
              url: result.media.url,
              thumbnailUrl: result.media.url + "?variant=thumbnail",
            },
            ...prev,
          ]);
        } else {
          setError(result.error);
        }
      }
      setUploading(false);
      router.refresh();
    },
    [router]
  );

  const onDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      handleFiles(e.dataTransfer.files);
    },
    [handleFiles]
  );
  const onDragOver = useCallback((e: React.DragEvent) => e.preventDefault(), []);

  const copyUrl = useCallback((url: string, id: string) => {
    navigator.clipboard.writeText(url);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  }, []);

  const selectItem = useCallback(
    (url: string) => {
      if (!selectMode) return;
      if (typeof window !== "undefined" && window.opener) {
        window.opener.postMessage({ type: "media-selected", url }, "*");
        window.close();
      } else {
        copyUrl(url, "");
      }
    },
    [selectMode, copyUrl]
  );

  return (
    <div className="space-y-6">
      <div
        onDrop={onDrop}
        onDragOver={onDragOver}
        className="rounded-lg border-2 border-dashed border-zinc-300 bg-zinc-50 p-8 text-center"
      >
        <input
          type="file"
          accept="image/jpeg,image/png,image/gif,image/webp,image/svg+xml"
          multiple
          className="hidden"
          id="media-upload"
          onChange={(e) => handleFiles(e.target.files)}
        />
        <label
          htmlFor="media-upload"
          className="cursor-pointer text-zinc-600 hover:text-zinc-900"
        >
          {uploading ? "Yükleniyor..." : "Dosya seçin veya sürükleyip bırakın (max 5MB)"}
        </label>
      </div>

      {error && (
        <p className="rounded bg-red-100 px-3 py-2 text-sm text-red-800">
          {error}
        </p>
      )}

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
        {items.map((m) => (
          <div
            key={m.id}
            className="overflow-hidden rounded-lg border border-zinc-200 bg-white shadow-sm"
          >
            <button
              type="button"
              className="block w-full text-left"
              onClick={() => selectMode && selectItem(m.url)}
            >
              <div className="aspect-square bg-zinc-100">
                {m.mimeType?.startsWith("image/") ? (
                  <img
                    src={m.thumbnailUrl}
                    alt={m.filename}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="flex h-full items-center justify-center text-zinc-400">
                    Dosya
                  </div>
                )}
              </div>
              <p className="truncate px-2 py-1 text-xs text-zinc-600">
                {m.filename}
              </p>
            </button>
            {!selectMode && (
              <div className="border-t border-zinc-100 p-2">
                <button
                  type="button"
                  onClick={() => copyUrl(m.url, m.id)}
                  className="w-full rounded bg-zinc-100 px-2 py-1 text-xs hover:bg-zinc-200"
                >
                  {copiedId === m.id ? "Kopyalandı" : "URL kopyala"}
                </button>
              </div>
            )}
          </div>
        ))}
      </div>

      {items.length === 0 && (
        <p className="py-8 text-center text-zinc-500">
          Henüz medya yok. Yüklemek için yukarıyı kullanın.
        </p>
      )}
    </div>
  );
}
