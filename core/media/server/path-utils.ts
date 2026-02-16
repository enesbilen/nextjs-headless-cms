/**
 * Server-only path resolution for media. Single source of truth for file locations.
 * Uses storage and path; must not be imported from client components.
 */
import "server-only";
import { resolve, dirname } from "path";
import { getStorageRoot } from "@/core/media/storage";
import { parseMediaFilenameFromStoragePath } from "@/core/media/public-utils";

/** Minimal shape for media; full Media has storagePath. */
export type MediaLike = { storagePath: string };

/**
 * Absolute disk path of the original file.
 */
export function getMediaDiskPath(media: MediaLike): string {
  const root = getStorageRoot();
  return resolve(root, media.storagePath);
}

/**
 * Directory (absolute path) containing the original file.
 */
export function getUploadDir(media: MediaLike): string {
  const root = getStorageRoot();
  return resolve(root, dirname(media.storagePath));
}

/**
 * Relative storage path from storage root (e.g. "2026/02/abc123.jpg").
 */
export function getUploadDirFromPath(storagePath: string): string {
  return dirname(storagePath);
}

/**
 * Storage path for a file in the same directory as the media original.
 */
export function getStoragePathForFileInDir(storagePath: string, basename: string): string {
  const dir = getUploadDirFromPath(storagePath);
  return dir ? `${dir}/${basename}` : basename;
}

/**
 * Variant naming: same folder as original, pattern <baseName>__<variant>.<ext>.
 * Returns absolute disk path.
 */
export function getVariantDiskPath(media: MediaLike, variant: string): string {
  const root = getStorageRoot();
  const { baseName, extension } = parseMediaFilenameFromStoragePath(media.storagePath);
  const dir = getUploadDirFromPath(media.storagePath);
  const variantBasename = `${baseName}__${variant}.${extension}`;
  const relativePath = dir ? `${dir}/${variantBasename}` : variantBasename;
  return resolve(root, relativePath);
}

/**
 * Relative storage path for a variant (for localStorage and DB MediaVariant.storagePath).
 */
export function getVariantStoragePath(media: MediaLike, variant: string, ext?: string): string {
  const parsed = parseMediaFilenameFromStoragePath(media.storagePath);
  const extension = ext ?? parsed.extension;
  const dir = getUploadDirFromPath(media.storagePath);
  const variantBasename = `${parsed.baseName}__${variant}.${extension}`;
  return dir ? `${dir}/${variantBasename}` : variantBasename;
}

/**
 * Variant storage path from base storage path (e.g. when generating variants without Media instance).
 */
export function getVariantStoragePathFromBase(baseStoragePath: string, variant: string, ext?: string): string {
  const parsed = parseMediaFilenameFromStoragePath(baseStoragePath);
  const extension = ext ?? parsed.extension;
  const dir = getUploadDirFromPath(baseStoragePath);
  const variantBasename = `${parsed.baseName}__${variant}.${extension}`;
  return dir ? `${dir}/${variantBasename}` : variantBasename;
}

/** Variant path specs: variant name and extension (matches generateImageVariants). */
const VARIANT_PATH_SPECS: { variant: string; ext: string }[] = [
  { variant: "thumbnail", ext: "jpg" },
  { variant: "medium", ext: "jpg" },
  { variant: "large", ext: "jpg" },
  { variant: "webp", ext: "webp" },
  { variant: "avif", ext: "avif" },
];

/**
 * All variant storage paths for a base path (for existence check / skip re-optimization).
 */
export function getVariantStoragePathsFromBase(baseStoragePath: string): string[] {
  return VARIANT_PATH_SPECS.map(({ variant, ext }) =>
    getVariantStoragePathFromBase(baseStoragePath, variant, ext)
  );
}

/**
 * Detect variant files: pattern baseName__variant.ext.
 */
export function isVariantFile(filename: string): boolean {
  const basename = filename.includes("/") ? filename.slice(filename.lastIndexOf("/") + 1) : filename;
  return basename.includes("__");
}

/**
 * Extract media id from filename (basename). Supports __variant, -variant, and original.
 */
export function extractMediaIdFromFilename(filename: string): string {
  const basename = filename.includes("/") ? filename.slice(filename.lastIndexOf("/") + 1) : filename;
  const doubleUnderscore = basename.indexOf("__");
  if (doubleUnderscore >= 0) return basename.slice(0, doubleUnderscore);
  const hyphen = basename.indexOf("-");
  if (hyphen >= 0) return basename.slice(0, hyphen);
  const lastDot = basename.lastIndexOf(".");
  return lastDot >= 0 ? basename.slice(0, lastDot) : basename;
}

/** @deprecated Use extractMediaIdFromFilename. */
export function extractMediaId(filename: string): string {
  return extractMediaIdFromFilename(filename);
}

/**
 * Content-addressed storage path: sha256/ab/cd/<full-checksum>.<ext>
 * First 2 hex chars = dir, next 2 = subdir; filename = full checksum.
 */
export function getStoragePathForNewMedia(checksum: string, ext: string): string {
  const hex = checksum.toLowerCase().replace(/[^a-f0-9]/g, "");
  if (hex.length < 4) {
    return `sha256/xx/xx/${checksum}.${ext}`;
  }
  const dir1 = hex.slice(0, 2);
  const dir2 = hex.slice(2, 4);
  return `sha256/${dir1}/${dir2}/${hex}.${ext}`;
}

/**
 * Whether the storage path is checksum-based (sha256/ab/cd/...) rather than date-based (YYYY/MM/...).
 */
export function isChecksumStoragePath(storagePath: string): boolean {
  return storagePath.startsWith("sha256/");
}

/**
 * From absolute file path under storage root, return relative storage path.
 */
export function getStoragePathFromAbsolute(absolutePath: string): string {
  const root = getStorageRoot();
  const normalized = absolutePath.replace(/\\/g, "/");
  const rootNorm = root.replace(/\\/g, "/");
  const relative = normalized.startsWith(rootNorm)
    ? normalized.slice(rootNorm.length).replace(/^\//, "")
    : absolutePath;
  return relative;
}
