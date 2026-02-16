/**
 * Standalone storage helpers for scripts (e.g. media-gc). No server-only.
 * Do not use from Next app; use core/media/storage there.
 */
import { join, resolve as pathResolve } from "path";
import { unlink, stat, access } from "fs/promises";

export function getStorageRoot(): string {
  return (
    process.env.MEDIA_STORAGE_PATH ||
    join(process.cwd(), "data", "uploads")
  );
}

function resolvePath(storagePath: string): string {
  return pathResolve(getStorageRoot(), storagePath);
}

export const localStorage = {
  async delete(storagePath: string): Promise<void> {
    await unlink(resolvePath(storagePath));
  },
  async size(storagePath: string): Promise<number> {
    const s = await stat(resolvePath(storagePath));
    return s.size;
  },
  async exists(storagePath: string): Promise<boolean> {
    try {
      await access(resolvePath(storagePath));
      return true;
    } catch {
      return false;
    }
  },
};

export function getStoragePathFromAbsolute(absolutePath: string): string {
  const root = getStorageRoot();
  const normalized = absolutePath.replace(/\\/g, "/");
  const rootNorm = root.replace(/\\/g, "/");
  return normalized.startsWith(rootNorm)
    ? normalized.slice(rootNorm.length).replace(/^\//, "")
    : absolutePath;
}

export function getUploadDirFromPath(storagePath: string): string {
  const idx = storagePath.lastIndexOf("/");
  return idx >= 0 ? storagePath.slice(0, idx) : "";
}

export function getUploadDir(media: { storagePath: string }): string {
  const root = getStorageRoot();
  const dir = getUploadDirFromPath(media.storagePath);
  return dir ? pathResolve(root, dir) : root;
}

export function getStoragePathForFileInDir(storagePath: string, basename: string): string {
  const dir = getUploadDirFromPath(storagePath);
  return dir ? `${dir}/${basename}` : basename;
}

export function extractMediaIdFromFilename(filename: string): string {
  const basename = filename.includes("/") ? filename.slice(filename.lastIndexOf("/") + 1) : filename;
  const doubleUnderscore = basename.indexOf("__");
  if (doubleUnderscore >= 0) return basename.slice(0, doubleUnderscore);
  const hyphen = basename.indexOf("-");
  if (hyphen >= 0) return basename.slice(0, hyphen);
  const lastDot = basename.lastIndexOf(".");
  return lastDot >= 0 ? basename.slice(0, lastDot) : basename;
}

export function isChecksumStoragePath(storagePath: string): boolean {
  return storagePath.startsWith("sha256/");
}
