/**
 * Media garbage collector: self-healing maintenance.
 * 1) Repair stuck processing (status=processing, processingAt > 10 min ago)
 * 2) Remove files for status=deleted, then remove DB records
 * 3) Remove orphan files (no DB media record)
 * 4) Mark ready-but-missing-file as failed
 *
 * Run: npm run media:gc
 */
import "dotenv/config";
import { resolve } from "path";
import { readdir } from "fs/promises";
import { db } from "../core/db";
import {
  localStorage,
  getStorageRoot,
  getUploadDir,
  getStoragePathForFileInDir,
  getStoragePathFromAbsolute,
  extractMediaIdFromFilename,
  isChecksumStoragePath,
} from "./lib/storage";

const PROCESSING_STUCK_MINUTES = 10;
const STUCK_MS = PROCESSING_STUCK_MINUTES * 60 * 1000;

async function scanFilesRecursive(
  dir: string,
  files: { storagePath: string; basename: string }[] = []
): Promise<{ storagePath: string; basename: string }[]> {
  const entries = await readdir(dir, { withFileTypes: true });
  for (const e of entries) {
    const full = resolve(dir, e.name);
    const storagePath = getStoragePathFromAbsolute(full);
    if (e.isDirectory()) {
      await scanFilesRecursive(full, files);
    } else if (e.isFile()) {
      files.push({ storagePath, basename: e.name });
    }
  }
  return files;
}

async function main() {
  const root = getStorageRoot();
  const report = {
    scannedFiles: 0,
    orphanGroups: 0,
    orphanFilesDeleted: 0,
    orphanBytesReclaimed: 0,
    stuckMarkedFailed: 0,
    readyMarkedFailed: 0,
    deletedFilesRemoved: 0,
    deletedRecordsRemoved: 0,
  };

  console.log("Media GC started. Root:", root);

  // 1) Stuck processing
  const stuckCutoff = new Date(Date.now() - STUCK_MS);
  const stuck = await db.media.updateMany({
    where: {
      status: "processing",
      processingAt: { lt: stuckCutoff },
    },
    data: { status: "failed", processingAt: null },
  });
  report.stuckMarkedFailed = stuck.count;
  if (stuck.count > 0) {
    console.log("Stuck processing -> failed:", stuck.count);
  }

  // 2) Reference-counted cleanup: delete_after passed; if no usage → delete record (and files only if last ref to storagePath)
  const dueForCleanup = await db.media.findMany({
    where: { deleteAfter: { lt: new Date() }, deletedAt: { not: null } },
    select: { id: true, storagePath: true },
  });
  for (const m of dueForCleanup) {
    const usageCount = await db.mediaUsage.count({ where: { mediaId: m.id } });
    const asCover =
      (await db.page.count({ where: { coverImageId: m.id } })) +
      (await db.post.count({ where: { coverImageId: m.id } }));
    if (usageCount > 0 || asCover > 0) {
      await db.media.update({
        where: { id: m.id },
        data: { deletedAt: null, deleteAfter: null },
      });
      continue;
    }
    const refCount = await db.media.count({ where: { storagePath: m.storagePath } });
    if (refCount > 1) {
      // Only remove this Media row; do not delete physical files (shared with other Media)
      try {
        await db.mediaVariant.deleteMany({ where: { mediaId: m.id } });
        await db.media.delete({ where: { id: m.id } });
        report.deletedRecordsRemoved++;
        console.log("[GC] Removed DB record (shared path):", m.id);
      } catch (err) {
        console.warn("[GC] Failed to remove record", m.id, err);
      }
      continue;
    }
    const fullDir = getUploadDir({ storagePath: m.storagePath });
    let entries: { name: string; isFile: () => boolean }[];
    try {
      entries = await readdir(fullDir, { withFileTypes: true });
    } catch {
      entries = [];
    }
    for (const e of entries) {
      if (!e.isFile()) continue;
      if (!isChecksumStoragePath(m.storagePath) && extractMediaIdFromFilename(e.name) !== m.id) continue;
      const storagePath = getStoragePathForFileInDir(m.storagePath, e.name);
      try {
        const size = await localStorage.size(storagePath);
        await localStorage.delete(storagePath);
        report.deletedFilesRemoved++;
        report.orphanBytesReclaimed += size;
        console.log("[GC] Deleted file:", storagePath, "bytes:", size);
      } catch (err) {
        // idempotent: file may already be missing
      }
    }
    try {
      await db.mediaVariant.deleteMany({ where: { mediaId: m.id } });
      await db.media.delete({ where: { id: m.id } });
      report.deletedRecordsRemoved++;
      console.log("[GC] Removed DB record:", m.id);
    } catch (err) {
      console.warn("[GC] Failed to remove record", m.id, err);
    }
  }
  if (dueForCleanup.length > 0) {
    console.log("Reference-counted cleanup: processed", dueForCleanup.length, "; files removed:", report.deletedFilesRemoved, "; records removed:", report.deletedRecordsRemoved);
  }

  // 3) Orphan files: any file whose storagePath is not referenced by Media or MediaVariant
  const allFiles = await scanFilesRecursive(root);
  report.scannedFiles = allFiles.length;

  const mediaPaths = await db.media.findMany({ select: { storagePath: true } });
  const variantPaths = await db.mediaVariant.findMany({ select: { storagePath: true } });
  const referencedPaths = new Set<string>([
    ...mediaPaths.map((x) => x.storagePath),
    ...variantPaths.map((x) => x.storagePath),
  ]);

  for (const f of allFiles) {
    if (!referencedPaths.has(f.storagePath)) {
      report.orphanGroups++;
      try {
        const size = await localStorage.size(f.storagePath);
        await localStorage.delete(f.storagePath);
        report.orphanFilesDeleted++;
        report.orphanBytesReclaimed += size;
      } catch {
        // idempotent
      }
    }
  }

  // 4) Ready but missing file: mark as failed
  const readyMedia = await db.media.findMany({
    where: { status: "ready" },
    select: { id: true, storagePath: true },
  });
  for (const media of readyMedia) {
    const exists = await localStorage.exists(media.storagePath);
    if (!exists) {
      await db.media.update({
        where: { id: media.id },
        data: { status: "failed", processingAt: null },
      });
      report.readyMarkedFailed++;
    }
  }

  if (report.orphanGroups > 0 || report.orphanFilesDeleted > 0) {
    console.log("Orphan files: groups", report.orphanGroups, ", deleted", report.orphanFilesDeleted, ", reclaimed", report.orphanBytesReclaimed, "bytes");
  }
  if (report.readyMarkedFailed > 0) {
    console.log("Ready but file missing -> failed:", report.readyMarkedFailed);
  }

  console.log("\n--- Report ---");
  console.log("Scanned files:", report.scannedFiles);
  console.log("Orphan groups found:", report.orphanGroups);
  console.log("Orphan files deleted:", report.orphanFilesDeleted);
  console.log("Reclaimed bytes:", report.orphanBytesReclaimed);
  console.log("Stuck processing -> failed:", report.stuckMarkedFailed);
  console.log("Ready but missing -> failed:", report.readyMarkedFailed);
  console.log("Deleted media files removed:", report.deletedFilesRemoved);
  console.log("Deleted DB records removed:", report.deletedRecordsRemoved);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
