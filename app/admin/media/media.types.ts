/**
 * Media Manager types. JSON-serializable DTOs from server; UI state types.
 */

/** Server-returned media item (no Date, no undefined). */
export type MediaDTO = {
  id: string;
  url: string;
  filename: string;
  width: number | null;
  height: number | null;
  mimeType: string | null;
  status: "ready" | "processing" | "failed";
  version?: number;
  /** True when upload was deduplicated (same file already in library). */
  deduplicated?: boolean;
};

/** Failed upload entry. */
export type FailedUpload = {
  filename: string;
  reason: string;
  /** Error category for UI. */
  code?: "network" | "validation" | "processing";
};

/** UI list item: either a real media or a temporary upload placeholder. */
export type MediaItem = MediaDTO & {
  thumbnailUrl: string;
  alt?: string | null;
  /** Present when from server (RSC); not used in client state. */
  createdAt?: string;
};

/** Temporary item shown while a file is uploading/processing. */
export type UploadItem = {
  tempId: string;
  filename: string;
  progress: number;
  status: "uploading" | "processing" | "ready" | "failed";
  /** Set when server responds (ready/failed). */
  mediaId?: string;
  error?: string;
};

/** Combined list for grid: real items + temp uploads (temp first). */
export type ListItem = { type: "media"; item: MediaItem } | { type: "upload"; item: UploadItem };

export function isUploadItem(listItem: ListItem): listItem is { type: "upload"; item: UploadItem } {
  return listItem.type === "upload";
}

export function isMediaItem(listItem: ListItem): listItem is { type: "media"; item: MediaItem } {
  return listItem.type === "media";
}

/** Reducer state. */
export type MediaState = {
  items: MediaItem[];
  uploads: UploadItem[];
  error: string | null;
  copiedId: string | null;
  editingId: string | null;
  editError: string | null;
  deletingId: string | null;
  bulkSelectMode: boolean;
  selectedIds: Set<string>;
  bulkDeleting: boolean;
  retryingId: string | null;
};

export type MediaAction =
  | { type: "UPLOAD_START"; payload: { tempId: string; filename: string }[] }
  | { type: "UPLOAD_SUCCESS"; payload: { tempIds: string[]; items: MediaItem[]; deduplicatedCount: number } }
  | { type: "UPLOAD_FAIL"; payload: { tempIds: string[]; failed: FailedUpload[] } }
  | { type: "DELETE"; payload: { id: string } }
  | { type: "UPDATE"; payload: { id: string; filename: string; alt?: string | null } }
  | { type: "RETRY"; payload: { id: string } }
  | { type: "SET_ERROR"; payload: string | null }
  | { type: "SET_COPIED"; payload: string | null }
  | { type: "SET_EDITING"; payload: string | null }
  | { type: "SET_EDIT_ERROR"; payload: string | null }
  | { type: "SET_DELETING"; payload: string | null }
  | { type: "BULK_SELECT_MODE"; payload: boolean }
  | { type: "TOGGLE_SELECT"; payload: string }
  | { type: "BULK_DELETE_DONE"; payload: string[] }
  | { type: "SET_BULK_DELETING"; payload: boolean }
  | { type: "SET_RETRYING"; payload: string | null };
