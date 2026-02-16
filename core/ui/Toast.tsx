"use client";

import { useEffect } from "react";

export type ToastType = "success" | "error" | "info" | "warning";

export type ToastItem = {
  id: string;
  message: string;
  type: ToastType;
  duration?: number;
  createdAt: number;
};

const typeStyles: Record<
  ToastType,
  { bg: string; border: string; icon: string; iconBg: string }
> = {
  success: {
    bg: "bg-emerald-50",
    border: "border-emerald-200",
    icon: "text-emerald-600",
    iconBg: "bg-emerald-100",
  },
  error: {
    bg: "bg-red-50",
    border: "border-red-200",
    icon: "text-red-600",
    iconBg: "bg-red-100",
  },
  info: {
    bg: "bg-sky-50",
    border: "border-sky-200",
    icon: "text-sky-600",
    iconBg: "bg-sky-100",
  },
  warning: {
    bg: "bg-amber-50",
    border: "border-amber-200",
    icon: "text-amber-600",
    iconBg: "bg-amber-100",
  },
};

const typeIcons: Record<ToastType, React.ReactNode> = {
  success: (
    <svg className="size-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
    </svg>
  ),
  error: (
    <svg className="size-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
    </svg>
  ),
  info: (
    <svg className="size-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  ),
  warning: (
    <svg className="size-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
    </svg>
  ),
};

const DEFAULT_DURATION = 5000;

type ToastProps = {
  item: ToastItem;
  onDismiss: (id: string) => void;
};

export function Toast({ item, onDismiss }: ToastProps) {
  const style = typeStyles[item.type];
  const duration = item.duration ?? DEFAULT_DURATION;

  useEffect(() => {
    if (duration <= 0) return;
    const t = setTimeout(() => onDismiss(item.id), duration);
    return () => clearTimeout(t);
  }, [item.id, duration, onDismiss]);

  return (
    <div
      role="alert"
      className={`flex items-start gap-3 rounded-lg border px-4 py-3 shadow-sm ${style.bg} ${style.border}`}
    >
      <span className={`flex size-8 shrink-0 items-center justify-center rounded-full ${style.iconBg} ${style.icon}`}>
        {typeIcons[item.type]}
      </span>
      <p className="min-w-0 flex-1 text-sm text-zinc-800">{item.message}</p>
      <button
        type="button"
        onClick={() => onDismiss(item.id)}
        className="shrink-0 rounded p-1 text-zinc-400 hover:bg-zinc-200/50 hover:text-zinc-600"
        aria-label="Kapat"
      >
        <svg className="size-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    </div>
  );
}

type ToastContainerProps = {
  toasts: ToastItem[];
  onDismiss: (id: string) => void;
};

export function ToastContainer({ toasts, onDismiss }: ToastContainerProps) {
  if (toasts.length === 0) return null;
  return (
    <div
      className="fixed right-4 top-4 z-[100] flex max-h-[80vh] w-full max-w-sm flex-col gap-2 overflow-auto"
      aria-live="polite"
    >
      {toasts.map((t) => (
        <Toast key={t.id} item={t} onDismiss={onDismiss} />
      ))}
    </div>
  );
}
