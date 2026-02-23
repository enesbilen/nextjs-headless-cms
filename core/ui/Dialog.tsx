"use client";

import {
  useEffect,
  useRef,
  useCallback,
  useState,
  type ReactNode,
} from "react";

const FOCUSABLE_SELECTOR =
  'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

export type DialogSize = "sm" | "md" | "lg" | "xl" | "full";

const sizeClasses: Record<DialogSize, string> = {
  sm: "max-w-sm",
  md: "max-w-md",
  lg: "max-w-lg",
  xl: "max-w-2xl",
  full: "max-w-[90vw] max-h-[90vh]",
};

export type DialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Başlık; verilirse üstte başlık + kapatma butonu gösterilir. */
  title?: string;
  /** Dialog içeriği. */
  children: ReactNode;
  /** Boyut: sm, md, lg, xl, full. */
  size?: DialogSize;
  /** Backdrop tıklanınca kapatılsın mı? */
  closeOnBackdropClick?: boolean;
  /** Escape ile kapatılsın mı? */
  closeOnEscape?: boolean;
  /** Sağ üstte X butonu (başlık yoksa yine gösterilebilir). */
  showCloseButton?: boolean;
  /** Alt kısımda sabit footer (butonlar vb.). */
  footer?: ReactNode;
  /** Ek sınıf (panel wrapper için). */
  className?: string;
  /** Başlık için id (aria-labelledby). */
  ariaLabelledby?: string;
  /** Açıklama için id (aria-describedby). */
  ariaDescribedby?: string;
};

function useFocusTrap(
  active: boolean,
  containerRef: React.RefObject<HTMLDivElement | null>
) {
  useEffect(() => {
    if (!active || !containerRef.current) return;
    const el = containerRef.current;
    const focusable = Array.from<HTMLElement>(
      el.querySelectorAll(FOCUSABLE_SELECTOR)
    ).filter((n) => n.offsetParent != null);
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

export function Dialog({
  open,
  onOpenChange,
  title,
  children,
  size = "md",
  closeOnBackdropClick = true,
  closeOnEscape = true,
  showCloseButton = true,
  footer,
  className = "",
  ariaLabelledby,
  ariaDescribedby,
}: DialogProps) {
  const panelRef = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  const close = useCallback(() => onOpenChange(false), [onOpenChange]);

  useFocusTrap(open, panelRef);

  useEffect(() => {
    if (!open) {
      setVisible(false);
      return;
    }
    setVisible(false);
    const id = requestAnimationFrame(() => {
      requestAnimationFrame(() => setVisible(true));
    });
    return () => cancelAnimationFrame(id);
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  useEffect(() => {
    if (!open || !closeOnEscape) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [open, closeOnEscape, close]);

  if (!open) return null;

  const titleId = ariaLabelledby ?? (title ? "dialog-title" : undefined);

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby={titleId}
      aria-describedby={ariaDescribedby}
    >
      {/* Backdrop */}
      <div
        className={`absolute inset-0 bg-black/50 transition-opacity duration-200 ease-out ${
          visible ? "opacity-100" : "opacity-0"
        }`}
        onClick={closeOnBackdropClick ? close : undefined}
        aria-hidden="true"
      />

      {/* Panel */}
      <div
        ref={panelRef}
        tabIndex={-1}
        className={`relative flex max-h-[85vh] w-full flex-col overflow-hidden rounded-xl border border-zinc-200 bg-white shadow-2xl transition-all duration-200 ease-out ${sizeClasses[size]} ${
          visible ? "translate-y-0 scale-100 opacity-100" : "translate-y-2 scale-[0.98] opacity-0"
        } ${className}`}
        onClick={(e) => e.stopPropagation()}
      >
        {(title || showCloseButton) && (
          <div className="flex shrink-0 items-center justify-between gap-4 border-b border-zinc-200 px-4 py-3">
            {title && (
              <h2
                id="dialog-title"
                className="text-lg font-semibold text-zinc-900"
              >
                {title}
              </h2>
            )}
            <div className={title ? "" : "ml-auto"}>
              {showCloseButton && (
                <button
                  type="button"
                  onClick={close}
                  className="rounded p-1.5 text-zinc-500 hover:bg-zinc-100 hover:text-zinc-700 focus:outline-none focus:ring-2 focus:ring-zinc-400 focus:ring-offset-2 focus:ring-offset-white"
                  aria-label="Kapat"
                >
                  <svg
                    className="size-5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              )}
            </div>
          </div>
        )}

        <div className="min-h-0 flex-1 overflow-y-auto">
          {children}
        </div>

        {footer && (
          <div className="shrink-0 border-t border-zinc-200 bg-zinc-50/80 px-4 py-3">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
}
