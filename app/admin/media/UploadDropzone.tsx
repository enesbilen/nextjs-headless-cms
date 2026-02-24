"use client";

import { useCallback } from "react";

const ACCEPT = "image/jpeg,image/png,image/gif,image/webp,image/svg+xml";

type ChangeEvent = React.ChangeEvent<HTMLInputElement>;
type DragEvent = React.DragEvent<HTMLDivElement>;

/** Normalize files from either input change or drop. Shared pipeline for both. */
export function extractFiles(e: DragEvent | ChangeEvent): File[] {
  if ("dataTransfer" in e && e.dataTransfer?.files) {
    return Array.from(e.dataTransfer.files);
  }
  if ("target" in e && e.target instanceof HTMLInputElement && e.target.files) {
    return Array.from(e.target.files);
  }
  return [];
}

type Props = {
  inputRef: React.RefObject<HTMLInputElement | null>;
  onFiles: (files: File[]) => void;
  disabled: boolean;
  /** Optional class for the dropzone container (e.g. dark theme). */
  className?: string;
  /** Optional class for the label (e.g. dark theme). */
  labelClassName?: string;
};

export function UploadDropzone({ inputRef, onFiles, disabled, className = "", labelClassName = "" }: Props) {
  const handleChange = useCallback(
    (e: ChangeEvent) => {
      const files = extractFiles(e);
      if (files.length) onFiles(files);
    },
    [onFiles]
  );

  const handleDrop = useCallback(
    (e: DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      const files = extractFiles(e);
      if (files.length) onFiles(files);
    },
    [onFiles]
  );

  const handleDragOver = useCallback((e: DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  return (
    <div
      onDrop={handleDrop}
      onDragOver={handleDragOver}
      className={`rounded-lg border-2 border-dashed border-zinc-300 bg-zinc-50 p-8 text-center transition-colors ${className}`.trim()}
      style={{
        opacity: disabled ? 0.7 : 1,
        pointerEvents: disabled ? "none" : "auto",
      }}
    >
      <input
        ref={inputRef}
        type="file"
        accept={ACCEPT}
        multiple
        className="hidden"
        id="media-upload"
        onChange={handleChange}
        disabled={disabled}
      />
      <label
        htmlFor="media-upload"
        className={`cursor-pointer text-zinc-600 hover:text-zinc-900 ${labelClassName}`.trim()}
        onClick={(e) => disabled && e.preventDefault()}
      >
        {disabled
          ? "Yükleniyor..."
          : "Dosya seçin veya sürükleyip bırakın (maks. 5MB/dosya, 10MB toplam)"}
      </label>
    </div>
  );
}
