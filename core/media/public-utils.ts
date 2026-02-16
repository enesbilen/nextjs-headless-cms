/**
 * Browser-safe media helpers. No fs, no path.resolve, no storage.
 * Safe to import from client components (MediaImage, url, PageContent).
 */

/** Media with filename (slug) for canonical URL filename. */
export type MediaWithFilename = { filename: string; storagePath: string };

/**
 * Parse filename (basename or full path) into baseName and extension.
 * String-only; supports .jpeg, .jpg, .png, .webp, .avif, .svg.
 */
export function parseMediaFilename(filename: string): { baseName: string; extension: string } {
  const basename = filename.includes("/") ? filename.slice(filename.lastIndexOf("/") + 1) : filename;
  const lastDot = basename.lastIndexOf(".");
  const baseName = lastDot >= 0 ? basename.slice(0, lastDot) : basename;
  const extension = lastDot >= 0 ? basename.slice(lastDot + 1).toLowerCase() : "";
  return { baseName, extension };
}

/** Parse from storagePath (e.g. "2026/02/abc123.webp") to get baseName and extension. */
export function parseMediaFilenameFromStoragePath(storagePath: string): { baseName: string; extension: string } {
  const basename = storagePath.includes("/") ? storagePath.slice(storagePath.lastIndexOf("/") + 1) : storagePath;
  return parseMediaFilename(basename);
}

/**
 * Canonical URL filename: slug from media.filename, extension from disk (media.storagePath).
 * Ensures URL always matches actual file extension (replaceMedia, GC, CDN safe).
 * Example: filename="banner.png", storagePath="2026/02/abc123.webp" → "banner.webp"
 */
export function getCanonicalFilename(media: MediaWithFilename): string {
  const lastDot = media.filename.lastIndexOf(".");
  const name = lastDot >= 0 ? media.filename.slice(0, lastDot) : media.filename;
  const { extension } = parseMediaFilenameFromStoragePath(media.storagePath);
  return extension ? `${name}.${extension}` : name;
}
