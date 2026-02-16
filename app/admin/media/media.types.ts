export type MediaStatus = "ready" | "processing" | "failed";

export type MediaItem = {
  id: string;
  filename: string;
  mimeType: string | null;
  url: string;
  width: number | null;
  height: number | null;
  alt: string | null;
  status: MediaStatus;
  version: number;
  createdAt: string;
};

export type MediaDTO = {
  id: string;
  url: string;
  filename: string;
  mimeType: string | null;
  width: number | null;
  height: number | null;
  status: MediaStatus;
  version: number;
  deduplicated?: boolean;
};

export type FailedUpload = {
  filename: string;
  reason: string;
  code?: "validation" | "processing" | "network";
};

export type RejectedFile = {
  filename: string;
  reason: string;
  size: number;
};

export type UploadItem = {
  tempId: string;
  filename: string;
  progress: number;
  status: "uploading" | "processing";
};

export type MediaState = {
  uploads: UploadItem[];
  error: string | null;
  copiedId: string | null;
  editingId: string | null;
  editError: string | null;
  deletingId: string | null;
  detailId: string | null;
  bulkSelectMode: boolean;
  selectedIds: Set<string>;
  bulkDeleting: boolean;
  retryingId: string | null;
  rejectedFiles: RejectedFile[];
};

export type MediaAction =
  | { type: "UPLOAD_START"; payload: { tempId: string; filename: string }[] }
  | { type: "UPLOAD_SUCCESS"; payload: { tempIds: string[] } }
  | { type: "UPLOAD_FAIL"; payload: { tempIds: string[]; failed: FailedUpload[] } }
  | { type: "SET_ERROR"; payload: string | null }
  | { type: "SET_COPIED"; payload: string | null }
  | { type: "SET_EDITING"; payload: string | null }
  | { type: "SET_EDIT_ERROR"; payload: string | null }
  | { type: "SET_DELETING"; payload: string | null }
  | { type: "BULK_SELECT_MODE"; payload: boolean }
  | { type: "TOGGLE_SELECT"; payload: string }
  | { type: "BULK_DELETE_DONE"; payload: undefined }
  | { type: "SET_BULK_DELETING"; payload: boolean }
  | { type: "SET_RETRYING"; payload: string | null }
  | { type: "SET_DETAIL"; payload: string | null }
  | { type: "RESET_SELECTION"; payload: undefined }
  | { type: "SET_REJECTED_FILES"; payload: RejectedFile[] }
  | { type: "CLEAR_REJECTED_FILES"; payload: undefined };

export type ListItem =
  | { type: "upload"; item: UploadItem }
  | { type: "media"; item: MediaItem };

// Type guard functions
export function isUploadItem(listItem: ListItem): listItem is { type: "upload"; item: UploadItem } {
  return listItem.type === "upload";
}

export function isMediaItem(listItem: ListItem): listItem is { type: "media"; item: MediaItem } {
  return listItem.type === "media";
}
