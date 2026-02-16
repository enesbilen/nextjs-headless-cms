"use client";

import { useCallback, useEffect, useMemo, useRef, useReducer } from "react";
import { useFeedback } from "@/core/ui/FeedbackContext";
import { uploadMedia, deleteMedia, updateMedia, retryMedia } from "./actions";
import type { MediaItem, MediaState, MediaAction, ListItem, FailedUpload } from "./media.types";
import { useScheduledRefresh } from "./useScheduledRefresh";

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
      const { tempIds } = action.payload;
      const uploads = state.uploads.filter((u) => !tempIds.includes(u.tempId));
      return { ...state, uploads, error: null };
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
        selectedIds: new Set(),
        bulkSelectMode: false,
        bulkDeleting: false,
      };
    case "SET_BULK_DELETING":
      return { ...state, bulkDeleting: action.payload };
    case "SET_RETRYING":
      return { ...state, retryingId: action.payload };
    case "SET_DETAIL":
      return { ...state, detailId: action.payload };
    case "RESET_SELECTION":
      return {
        ...state,
        selectedIds: new Set(),
        detailId: null,
        bulkSelectMode: false,
      };
    default:
      return state;
  }
}

export type UseMediaManagerProps = {
  items: MediaItem[];
  selectMode: boolean;
};

export function useMediaManager({ items, selectMode }: UseMediaManagerProps) {
  const feedback = useFeedback();
  const { requestRefresh } = useScheduledRefresh();
  const inputRef = useRef<HTMLInputElement | null>(null);

  const [state, dispatch] = useReducer(mediaReducer, {
    uploads: [],
    error: null,
    copiedId: null,
    editingId: null,
    editError: null,
    deletingId: null,
    detailId: null,
    bulkSelectMode: false,
    selectedIds: new Set<string>(),
    bulkDeleting: false,
    retryingId: null,
  });

  // When server data changes (new search/filter/page), reset selection so UI stays in sync
  useEffect(() => {
    dispatch({ type: "RESET_SELECTION", payload: undefined });
  }, [items]);

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
        const deduplicatedCount = result.uploaded.filter((u) => u.deduplicated).length;
        dispatch({ type: "UPLOAD_SUCCESS", payload: { tempIds } });
        requestRefresh();
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
    [feedback, resetFileInput, requestRefresh]
  );

  const isUploading = state.uploads.some(
    (u) => u.status === "uploading" || u.status === "processing"
  );

  const copyUrl = useCallback(
    (url: string, id: string) => {
      navigator.clipboard.writeText(url);
      dispatch({ type: "SET_COPIED", payload: id });
      setTimeout(() => dispatch({ type: "SET_COPIED", payload: null }), 2000);
      feedback.showSuccess("URL kopyalandı");
    },
    [feedback]
  );

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
        message:
          "Bu dosyayı kalıcı olarak silmek istediğinize emin misiniz? Bu işlem geri alınamaz.",
        confirmLabel: "Sil",
        cancelLabel: "İptal",
        variant: "danger",
      });
      if (!confirmed) return;
      dispatch({ type: "SET_DELETING", payload: item.id });
      const result = await deleteMedia(item.id);
      if (result.ok) {
        dispatch({ type: "SET_DELETING", payload: null });
        dispatch({ type: "SET_DETAIL", payload: null });
        requestRefresh();
        feedback.showSuccess("Medya silindi.");
      } else {
        dispatch({ type: "SET_DELETING", payload: null });
        dispatch({ type: "SET_ERROR", payload: result.error });
        feedback.showError(result.error);
      }
    },
    [feedback, requestRefresh]
  );

  const handleEditSubmit = useCallback(
    async (mediaId: string, formData: FormData) => {
      dispatch({ type: "SET_EDIT_ERROR", payload: null });
      const result = await updateMedia(mediaId, formData);
      if (result.ok) {
        dispatch({ type: "SET_EDITING", payload: null });
        requestRefresh();
        feedback.showSuccess("Değişiklikler kaydedildi.");
      } else {
        dispatch({ type: "SET_EDIT_ERROR", payload: result.error });
        feedback.showError(result.error);
      }
    },
    [feedback, requestRefresh]
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
    dispatch({ type: "BULK_DELETE_DONE", payload: undefined });
    requestRefresh();
    feedback.showSuccess(
      deleted === count ? `${deleted} öğe silindi.` : `${deleted}/${count} öğe silindi.`
    );
  }, [state.selectedIds, feedback, requestRefresh]);

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
        dispatch({ type: "SET_RETRYING", payload: null });
        requestRefresh();
        feedback.showSuccess("Yeniden işlendi.");
      } else {
        dispatch({ type: "SET_RETRYING", payload: null });
        feedback.showError(result.error);
      }
    },
    [feedback, requestRefresh]
  );

  const listItems: ListItem[] = useMemo(
    () => [
      ...state.uploads.map((item) => ({ type: "upload" as const, item })),
      ...items.map((item) => ({ type: "media" as const, item })),
    ],
    [state.uploads, items]
  );

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
    setDetailId: (id: string | null) => dispatch({ type: "SET_DETAIL", payload: id }),
    setError: (err: string | null) => dispatch({ type: "SET_ERROR", payload: err }),
  };
}
