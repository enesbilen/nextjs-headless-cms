"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
} from "react";
import { ConfirmDialog, type ConfirmOptions } from "./ConfirmDialog";
import { ToastContainer, type ToastItem, type ToastType } from "./Toast";

type ConfirmResolve = (value: boolean) => void;

type FeedbackContextValue = {
  showToast: (message: string, type?: ToastType, duration?: number) => void;
  showSuccess: (message: string, duration?: number) => void;
  showError: (message: string, duration?: number) => void;
  showInfo: (message: string, duration?: number) => void;
  showWarning: (message: string, duration?: number) => void;
  confirm: (options: ConfirmOptions) => Promise<boolean>;
};

const FeedbackContext = createContext<FeedbackContextValue | null>(null);

function generateId() {
  return `toast-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

export function FeedbackProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const [confirmState, setConfirmState] = useState<{
    open: boolean;
    options: ConfirmOptions;
    resolve: ConfirmResolve;
  } | null>(null);

  const dismissToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const showToast = useCallback(
    (message: string, type: ToastType = "info", duration?: number) => {
      const id = generateId();
      setToasts((prev) => [
        ...prev,
        { id, message, type, duration, createdAt: Date.now() },
      ]);
    },
    []
  );

  const showSuccess = useCallback(
    (message: string, duration?: number) => showToast(message, "success", duration),
    [showToast]
  );
  const showError = useCallback(
    (message: string, duration?: number) => showToast(message, "error", duration),
    [showToast]
  );
  const showInfo = useCallback(
    (message: string, duration?: number) => showToast(message, "info", duration),
    [showToast]
  );
  const showWarning = useCallback(
    (message: string, duration?: number) => showToast(message, "warning", duration),
    [showToast]
  );

  const confirm = useCallback((options: ConfirmOptions): Promise<boolean> => {
    return new Promise((resolve) => {
      setConfirmState({
        open: true,
        options,
        resolve,
      });
    });
  }, []);

  const handleConfirmClose = useCallback((confirmed: boolean) => {
    setConfirmState((prev) => {
      if (prev) prev.resolve(confirmed);
      return null;
    });
  }, []);

  const handleConfirm = useCallback(() => handleConfirmClose(true), [handleConfirmClose]);
  const handleCancel = useCallback(() => handleConfirmClose(false), [handleConfirmClose]);

  const value = useMemo<FeedbackContextValue>(
    () => ({
      showToast,
      showSuccess,
      showError,
      showInfo,
      showWarning,
      confirm,
    }),
    [showToast, showSuccess, showError, showInfo, showWarning, confirm]
  );

  return (
    <FeedbackContext.Provider value={value}>
      {children}
      <ToastContainer toasts={toasts} onDismiss={dismissToast} />
      {confirmState && (
        <ConfirmDialog
          open={confirmState.open}
          title={confirmState.options.title}
          message={confirmState.options.message}
          confirmLabel={confirmState.options.confirmLabel}
          cancelLabel={confirmState.options.cancelLabel}
          variant={confirmState.options.variant}
          onConfirm={handleConfirm}
          onCancel={handleCancel}
        />
      )}
    </FeedbackContext.Provider>
  );
}

export function useFeedback(): FeedbackContextValue {
  const ctx = useContext(FeedbackContext);
  if (!ctx) {
    throw new Error("useFeedback must be used within FeedbackProvider");
  }
  return ctx;
}
