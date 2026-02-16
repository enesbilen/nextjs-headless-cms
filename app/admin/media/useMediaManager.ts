"use client";

import { useCallback, useRef, useReducer } from "react";
import { useFeedback } from "@/core/ui/FeedbackContext";
import { uploadMedia, deleteMedia, updateMedia, retryMedia } from "./actions";
import type { MediaItem, MediaState, MediaAction, ListItem, FailedUpload, MediaDTO } from "./media.types";

function mediaReducer(state: MediaState, action: MediaAction): MediaState {
  switch (action.type) {
    case "UPLOAD_START": {
      const uploads = action.payload.map(({ tempId, filename }) => ({
        tempId,
        filename,
        progress: 0,
        status: "uploading" as const,
      }));
      return {
        ...state,
        uploads: [...state.uploads, ...uploads],
        error: null,
      };
    }
    case "UPLOAD_SUCCESS": {
      const { tempIds, items, deduplicatedCount } = action.payload;
      const uploads = state.uploads.filter((u) => !tempIds.includes(u.tempId));
      const itemsPrep = items.map((dto) => ({
        ...dto,
        thumbnailUrl: dto.url + "?variant=thumbnail",
        alt: null as string | null,
      }));
      return {
        ...state,
        uploads,
        items: [...itemsPrep, ...state.items],
        error: null,
      };
    }
    case "UPLOAD_FAIL": {
      const { tempIds, failed } = action.payload;
      const uploads = state.uploads.filter((u) => !tempIds.includes(u.tempId));
      return {
        ...state,
        uploads,
        error: failed.length === 1 ? failed[0].reason : `${failed.length} dosya yüklenemedi`,
      };
    }
    case "DELETE":
      return {
        ...state,
        items: state.items.filter((i) => i.id !== action.payload.id),
        deletingId: null,
      };
    case "UPDATE": {
      const { id, filename, alt } = action.payload;
      return {
        ...state,
        items: state.items.map((i) =>
          i.id === id ? { ...i, filename, alt: alt ?? i.alt ?? null } : i
        ),
        editingId: null,
        editError: null,
      };
    }
    case "RETRY":
      return {
        ...state,
        items: state.items.map((i) =>
          i.id === action.payload.id ? { ...i, status: "ready" as const } : i
        ),
        retryingId: null,
      };
    case "SET_ERROR":
      return { ...state, error: action.payload };
    case "SET_COPIED":
      return { ...state, copiedId: action.payload };
    case "SET_EDITING":
      return { ...state, editingId: action.payload, editError: null };
    case "SET_EDIT_ERROR":
      return { ...state, editError: action.payload };
    case "SET_DELETING":
      return { ...state, deletingId: action.payload };
    case "BULK_SELECT_MODE":
      return {
        ...state,
        bulkSelectMode: action.payload,
        selectedIds: action.payload ? state.selectedIds : new Set(),
      };
    case "TOGGLE_SELECT": {
      const next = new Set(state.selectedIds);
      if (next.has(action.payload)) next.delete(action.payload);
      else next.add(action.payload);
      return { ...state, selectedIds: next };
    }
    case "BULK_DELETE_DONE":
      return {
        ...state,
        items: state.items.filter((i) => !action.payload.includes(i.id)),
        selectedIds: new Set(),
        bulkSelectMode: false,
        bulkDeleting: false,
      };
    case "SET_BULK_DELETING":
      return { ...state, bulkDeleting: action.payload };
    case "SET_RETRYING":
      return { ...state, retryingId: action.payload };
    default:
      return state;
  }
}

function dtoToItem(dto: MediaDTO): MediaItem {
  return {
    ...dto,
    thumbnailUrl: dto.url + "?variant=thumbnail",
    alt: null,
  };
}

export type UseMediaManagerProps = {
  initialItems: MediaItem[];
  selectMode: boolean;
};

export function useMediaManager({ initialItems, selectMode }: UseMediaManagerProps) {
  const feedback = useFeedback();
  const inputRef = useRef<HTMLInputElement | null>(null);

  const [state, dispatch] = useReducer(mediaReducer, {
    items: initialItems,
    uploads: [],
    error: null,
    copiedId: null,
    editingId: null,
    editError: null,
    deletingId: null,
    bulkSelectMode: false,
    selectedIds: new Set<string>(),
    bulkDeleting: false,
    retryingId: null,
  });

  const resetFileInput = useCallback(() => {
    if (inputRef.current) inputRef.current.value = "";
  }, []);

  const handleFiles = useCallback(
    async (files: FileList | File[] | null) => {
      if (!files?.length) return;
      const fileArray = Array.from(files);
      const tempIds = fileArray.map(() => `upload-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`);
      dispatch({
        type: "UPLOAD_START",
        payload: fileArray.map((f, i) => ({ tempId: tempIds[i], filename: f.name })),
      });

      const formData = new FormData();
      fileArray.forEach((f) => formData.append("file", f));
      const result = await uploadMedia(formData);

      resetFileInput();

      if (result.error) {
        dispatch({
          type: "UPLOAD_FAIL",
          payload: {
            tempIds,
            failed: [{ filename: fileArray[0].name, reason: result.error, code: "network" }],
          },
        });
        feedback.showError(result.error);
        return;
      }

      if (result.uploaded.length > 0) {
        const items = result.uploaded.map(dtoToItem);
        const deduplicatedCount = result.uploaded.filter((u) => u.deduplicated).length;
        dispatch({ type: "UPLOAD_SUCCESS", payload: { tempIds, items, deduplicatedCount } });
        if (deduplicatedCount > 0) {
          feedback.showInfo(
            deduplicatedCount === 1
              ? "Bu dosya zaten yüklenmiş."
              : `${deduplicatedCount} dosya zaten kütüphanede.`
          );
        } else {
          feedback.showSuccess(
            result.uploaded.length === 1
              ? "Dosya yüklendi."
              : `${result.uploaded.length} dosya yüklendi.`
          );
        }
      }

      if (result.failed.length > 0) {
        dispatch({ type: "UPLOAD_FAIL", payload: { tempIds, failed: result.failed } });
        const msg =
          result.failed.length === 1
            ? result.failed[0].reason
            : result.failed.map((f) => `${f.filename}: ${f.reason}`).join("; ");
        feedback.showError(msg);
      }
    },
    [feedback, resetFileInput]
  );

  const isUploading = state.uploads.some(
    (u) => u.status === "uploading" || u.status === "processing"
  );

  const copyUrl = useCallback((url: string, id: string) => {
    navigator.clipboard.writeText(url);
    dispatch({ type: "SET_COPIED", payload: id });
    setTimeout(() => dispatch({ type: "SET_COPIED", payload: null }), 2000);
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

  const handleDelete = useCallback(
    async (item: MediaItem) => {
      const confirmed = await feedback.confirm({
        title: "Medyayı sil",
        message: `"${item.filename}" öğesini kalıcı olarak silmek istediğinize emin misiniz?`,
        confirmLabel: "Sil",
        cancelLabel: "İptal",
        variant: "danger",
      });
      if (!confirmed) return;
      dispatch({ type: "SET_DELETING", payload: item.id });
      const result = await deleteMedia(item.id);
      if (result.ok) {
        dispatch({ type: "DELETE", payload: { id: item.id } });
        feedback.showSuccess("Medya silindi.");
      } else {
        dispatch({ type: "SET_DELETING", payload: null });
        dispatch({ type: "SET_ERROR", payload: result.error });
        feedback.showError(result.error);
      }
    },
    [feedback]
  );

  const handleEditSubmit = useCallback(
    async (mediaId: string, formData: FormData) => {
      dispatch({ type: "SET_EDIT_ERROR", payload: null });
      const result = await updateMedia(mediaId, formData);
      if (result.ok) {
        const filename = (formData.get("filename") as string)?.trim() ?? "";
        const alt = (formData.get("alt") as string)?.trim() || null;
        dispatch({ type: "UPDATE", payload: { id: mediaId, filename, alt } });
        dispatch({ type: "SET_EDITING", payload: null });
        feedback.showSuccess("Değişiklikler kaydedildi.");
      } else {
        dispatch({ type: "SET_EDIT_ERROR", payload: result.error });
        feedback.showError(result.error);
      }
    },
    [feedback]
  );

  const toggleBulkSelect = useCallback((id: string) => {
    dispatch({ type: "TOGGLE_SELECT", payload: id });
  }, []);

  const handleBulkDelete = useCallback(async () => {
    const count = state.selectedIds.size;
    if (count === 0) return;
    const confirmed = await feedback.confirm({
      title: "Seçilenleri sil",
      message: `${count} öğeyi kalıcı olarak silmek istediğinize emin misiniz?`,
      confirmLabel: "Sil",
      cancelLabel: "İptal",
      variant: "danger",
    });
    if (!confirmed) return;
    dispatch({ type: "SET_BULK_DELETING", payload: true });
    const ids = Array.from(state.selectedIds);
    let deleted = 0;
    for (const id of ids) {
      const result = await deleteMedia(id);
      if (result.ok) deleted++;
    }
    dispatch({ type: "BULK_DELETE_DONE", payload: ids });
    feedback.showSuccess(
      deleted === count ? `${deleted} öğe silindi.` : `${deleted}/${count} öğe silindi.`
    );
  }, [state.selectedIds, feedback]);

  const startBulkSelect = useCallback(() => {
    dispatch({ type: "BULK_SELECT_MODE", payload: true });
  }, []);

  const cancelBulkSelect = useCallback(() => {
    dispatch({ type: "BULK_SELECT_MODE", payload: false });
  }, []);

  const handleRetry = useCallback(
    async (mediaId: string) => {
      dispatch({ type: "SET_RETRYING", payload: mediaId });
      const result = await retryMedia(mediaId);
      if (result.ok) {
        dispatch({ type: "RETRY", payload: { id: mediaId } });
        feedback.showSuccess("Yeniden işlendi.");
      } else {
        dispatch({ type: "SET_RETRYING", payload: null });
        feedback.showError(result.error);
      }
    },
    [feedback]
  );

  const listItems: ListItem[] = [
    ...state.uploads.map((item) => ({ type: "upload" as const, item })),
    ...state.items.map((item) => ({ type: "media" as const, item })),
  ];

  return {
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
    setEditingId: (id: string | null) => dispatch({ type: "SET_EDITING", payload: id }),
    setError: (err: string | null) => dispatch({ type: "SET_ERROR", payload: err }),
  };
}
