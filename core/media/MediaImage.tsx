"use client";

import Image from "next/image";
import { getMediaUrl } from "./url";

export type MediaImageProps = {
  mediaId: string;
  filename: string;
  alt?: string;
  width?: number;
  height?: number;
  fill?: boolean;
  sizes?: string;
  priority?: boolean;
  className?: string;
  /** When "image/svg+xml", Next.js image optimizer is skipped (unoptimized). */
  mimeType?: string | null;
};

/**
 * Wraps next/image for CMS media. Uses getMediaUrl(mediaId, filename).
 * If width/height missing and not fill → falls back to fill mode with object-cover.
 * Safe for server and client (uses "use client" for Image; can be imported from RSC and passed to client).
 */
export function MediaImage({
  mediaId,
  filename,
  alt = "",
  width,
  height,
  fill,
  sizes,
  priority = false,
  className,
  mimeType,
}: MediaImageProps) {
  const src = getMediaUrl(mediaId, filename);
  const unoptimized =
    mimeType === "image/svg+xml" || filename.toLowerCase().endsWith(".svg");
  const useFill = fill ?? (width == null && height == null);

  if (useFill) {
    return (
      <Image
        src={src}
        alt={alt}
        fill
        sizes={sizes ?? "100vw"}
        priority={priority}
        className={className}
        unoptimized={unoptimized}
      />
    );
  }

  return (
    <Image
      src={src}
      alt={alt}
      width={width ?? 0}
      height={height ?? 0}
      sizes={sizes ?? "(max-width: 768px) 100vw, 768px"}
      priority={priority}
      className={className}
      unoptimized={unoptimized}
    />
  );
}
