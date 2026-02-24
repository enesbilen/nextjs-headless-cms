import "server-only";

import { createId } from "@paralleldrive/cuid2";
import { createHash } from "crypto";
import { Readable } from "stream";
import { readdir } from "fs/promises";
import { db } from "@/core/db";
import { localStorage } from "@/core/media/storage";
import {
  getUploadDir,
  getUploadDirFromPath,
  getStoragePathForNewMedia,
  getStoragePathForFileInDir,
  extractMediaIdFromFilename,
  getVariantStoragePathsFromBase,
  isChecksumStoragePath,
} from "@/core/media/server/path-utils";
import {
  checkMimeAndExtension,
  MAX_UPLOAD_BYTES,
  MAX_SVG_BYTES,
  isImageMime,
} from "@/core/media/mime";
import { sanitizeSvg } from "@/core/media/svg-sanitize";
import { optimizeImage, generateImageVariants } from "@/core/media/optimize";
import type { MediaStatus, VariantType } from "@prisma/client";

const PROCESSING_STUCK_MINUTES = 10;

/** Variant types in same order as getVariantStoragePathsFromBase. */
const VARIANT_TYPES: VariantType[] = ["THUMBNAIL", "MEDIUM", "LARGE", "WEBP", "AVIF"];

function mimeToExt(mime: string): string {
  if (mime === "image/jpeg") return "jpg";
  if (mime === "image/png") return "png";
  if (mime === "image/webp") return "webp";
  if (mime === "image/svg+xml") return "svg";
  if (mime === "image/avif") return "avif";
  return "bin";
}

/**
 * Compute SHA-256 via stream (chunk-by-chunk, no single full buffer for hash).
 */
async function streamHash(stream: Readable): Promise<string> {
  const hash = createHash("sha256");
  for await (const chunk of stream) {
    hash.update(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk as ArrayBuffer));
  }
  return hash.digest("hex");
}

export type CreateMediaResult =
  | { ok: true; id: string; filename: string; mimeType: string; storagePath: string; width: number | null; height: number | null; version: number; status: MediaStatus; deduplicated?: true }
  | { ok: false; error: string };

export type DeleteMediaResult =
  | { ok: true }
  | { ok: false; error: string };

export type ReplaceMediaResult =
  | { ok: true; version: number }
  | { ok: false; error: string };

export type RetryProcessingResult =
  | { ok: true }
  | { ok: false; error: string };

async function deleteWrittenFiles(paths: string[]): Promise<void> {
  for (const p of paths) {
    try {
      await localStorage.delete(p);
    } catch {
      // idempotent: ignore missing
    }
  }
}

async function getFilePathsToDelete(media: { id: string; storagePath: string }): Promise<string[]> {
  const fullDir = getUploadDir(media);
  const entries = await readdir(fullDir, { withFileTypes: true });
  const paths: string[] = [];
  for (const e of entries) {
    if (!e.isFile()) continue;
    if (isChecksumStoragePath(media.storagePath)) {
      paths.push(getStoragePathForFileInDir(media.storagePath, e.name));
    } else {
      const id = extractMediaIdFromFilename(e.name);
      if (id !== media.id) continue;
      paths.push(getStoragePathForFileInDir(media.storagePath, e.name));
    }
  }
  return paths;
}

/**
 * Create media from upload. Checksum-first: stream → checksum → dedup or write.
 * Same content reuses existing storagePath and skips optimization.
 */
export async function createMediaFromUpload(file: File, userId: string): Promise<CreateMediaResult> {
  const filename = file.name;
  if (file.size > MAX_UPLOAD_BYTES) {
    return { ok: false, error: "Dosya çok büyük (maks. 5MB)" };
  }

  let buffer: Buffer;
  try {
    const stream = Readable.fromWeb(file.stream() as Parameters<typeof Readable.fromWeb>[0]);
    const chunks: Buffer[] = [];
    const hash = createHash("sha256");
    for await (const chunk of stream) {
      const b = Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk as ArrayBuffer);
      hash.update(b);
      chunks.push(b);
    }
    buffer = Buffer.concat(chunks);
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "Dosya okunamadı" };
  }

  const mimeCheck = await checkMimeAndExtension(buffer);
  if (!mimeCheck.ok) {
    return { ok: false, error: mimeCheck.reason };
  }
  const mimeType = mimeCheck.mime;
  const isSvg = mimeType === "image/svg+xml";

  if (isSvg && buffer.length > MAX_SVG_BYTES) {
    return { ok: false, error: "SVG çok büyük (maks. 1MB)" };
  }

  let finalBuffer: Buffer;
  let finalMime: string;
  let width: number | null = null;
  let height: number | null = null;

  if (isSvg) {
    try {
      const text = buffer.toString("utf-8");
      const sanitized = sanitizeSvg(text);
      finalBuffer = Buffer.from(sanitized, "utf-8");
    } catch {
      return { ok: false, error: "SVG reddedildi: geçersiz veya güvensiz içerik" };
    }
    finalMime = "image/svg+xml";
  } else {
    finalMime = mimeType;
    if (isImageMime(mimeType)) {
      try {
        const optimized = await optimizeImage(buffer, mimeType);
        finalBuffer = optimized.buffer;
        finalMime = optimized.mimeType;
        width = optimized.width;
        height = optimized.height;
      } catch (e) {
        return { ok: false, error: e instanceof Error ? e.message : "Görsel işlenemedi" };
      }
    } else {
      finalBuffer = buffer;
    }
  }

  const checksum = await streamHash(Readable.from(finalBuffer));
  const ext = mimeToExt(finalMime);

  const existing = await db.media.findFirst({
    where: { checksum },
    include: { variants: true },
  });

  if (existing) {
    const id = createId();
    try {
      await db.media.create({
        data: {
          id,
          filename: file.name,
          mimeType: finalMime,
          storagePath: existing.storagePath,
          width: existing.width,
          height: existing.height,
          checksum,
          userId,
          status: "ready",
          version: 1,
          fileSize: existing.fileSize,
        },
      });
      if (existing.variants.length > 0) {
        await db.mediaVariant.createMany({
          data: existing.variants.map((v) => ({
            mediaId: id,
            type: v.type,
            storagePath: v.storagePath,
            mimeType: v.mimeType,
            width: v.width,
            height: v.height,
            size: v.size,
          })),
        });
      }
      return {
        ok: true,
        id,
        filename: file.name,
        mimeType: finalMime,
        storagePath: existing.storagePath,
        width: existing.width,
        height: existing.height,
        version: 1,
        status: "ready",
        deduplicated: true,
      };
    } catch (e) {
      return { ok: false, error: e instanceof Error ? e.message : "Veritabanı hatası" };
    }
  }

  const id = createId();
  const now = new Date();
  const baseStoragePath = getStoragePathForNewMedia(checksum, ext);

  try {
    await db.media.create({
      data: {
        id,
        filename: file.name,
        mimeType: finalMime,
        storagePath: baseStoragePath,
        width,
        height,
        checksum,
        userId,
        status: "processing",
        version: 1,
        processingAt: now,
      },
    });
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "Veritabanı hatası" };
  }

  const writtenPaths: string[] = [];

  try {
    const media = await db.media.findUnique({
      where: { id },
      select: { version: true, status: true },
    });
    if (!media || media.status !== "processing") {
      return { ok: false, error: "Medya kaydı işlenemiyor" };
    }
    const updated = await db.media.updateMany({
      where: { id, status: "processing", version: media.version },
      data: { processingAt: new Date() },
    });
    if (updated.count === 0) {
      return { ok: false, error: "Başka bir işlem bu medyayı işliyor" };
    }

    const stream = Readable.from(finalBuffer);
    await localStorage.write(baseStoragePath, stream);
    writtenPaths.push(baseStoragePath);

    const exists = await localStorage.exists(baseStoragePath);
    if (!exists) {
      await db.media.update({
        where: { id },
        data: { status: "failed", processingAt: null },
      });
      await deleteWrittenFiles(writtenPaths);
      return { ok: false, error: "Dosya diske yazılamadı" };
    }

    const fileSize = await localStorage.size(baseStoragePath);
    await db.media.update({
      where: { id },
      data: { fileSize: BigInt(fileSize), width, height, checksum },
    });

    if (isImageMime(mimeType) && !isSvg) {
      const variantPaths = getVariantStoragePathsFromBase(baseStoragePath);
      const allExist = (await Promise.all(variantPaths.map((p) => localStorage.exists(p)))).every(Boolean);
      if (allExist) {
        const sharp = (await import("sharp")).default;
        const variantData: { mediaId: string; type: VariantType; storagePath: string; mimeType: string; width: number; height: number; size: number }[] = [];
        for (let i = 0; i < variantPaths.length; i++) {
          const path = variantPaths[i];
          const s = await localStorage.size(path);
          const stream = await localStorage.readStream(path);
          const chunks: Buffer[] = [];
          for await (const chunk of stream) {
            chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk as ArrayBuffer));
          }
          const buf = Buffer.concat(chunks);
          const meta = await sharp(buf).metadata();
          const mime = VARIANT_TYPES[i] === "WEBP" ? "image/webp" : VARIANT_TYPES[i] === "AVIF" ? "image/avif" : "image/jpeg";
          variantData.push({
            mediaId: id,
            type: VARIANT_TYPES[i],
            storagePath: path,
            mimeType: mime,
            width: meta.width ?? 0,
            height: meta.height ?? 0,
            size: s,
          });
        }
        await db.mediaVariant.createMany({ data: variantData });
      } else {
        // Generate variants; catch AVIF/WEBP errors separately to allow graceful degradation
        const variants = await generateImageVariants(finalBuffer, baseStoragePath).catch((variantErr) => {
          console.error("[media] generateImageVariants failed:", variantErr);
          throw variantErr;
        });
        for (const v of variants) {
          await localStorage.write(v.storagePath, Readable.from(v.buffer));
          writtenPaths.push(v.storagePath);
        }
        await db.mediaVariant.createMany({
          data: variants.map((v) => ({
            mediaId: id,
            type: v.type,
            storagePath: v.storagePath,
            mimeType: v.mimeType,
            width: v.width,
            height: v.height,
            size: v.size,
          })),
        });
      }
    }

    await db.media.update({
      where: { id },
      data: { status: "ready", processingAt: null },
    });

    return {
      ok: true,
      id,
      filename: file.name,
      mimeType: finalMime,
      storagePath: baseStoragePath,
      width,
      height,
      version: 1,
      status: "ready",
    };
  } catch (e) {
    console.error("[media] createMediaFromUpload FAILED:", {
      filename: file.name,
      error: e instanceof Error ? e.message : String(e),
      stack: e instanceof Error ? e.stack : undefined,
    });
    await deleteWrittenFiles(writtenPaths);
    await db.media.update({
      where: { id },
      data: { status: "failed", processingAt: null },
    }).catch(() => {});
    return {
      ok: false,
      error: e instanceof Error ? e.message : "Yükleme hatası",
    };
  }
}

const SOFT_DELETE_DELAY_HOURS = 48;

/**
 * Soft-delete media: hide from UI, schedule for GC. No files removed; GC deletes after delete_after when unused.
 */
export async function deleteMedia(mediaId: string): Promise<DeleteMediaResult> {
  const media = await db.media.findUnique({
    where: { id: mediaId },
    select: { id: true, status: true },
  });
  if (!media) {
    return { ok: true }; // idempotent
  }
  if (media.status === "processing") {
    return { ok: false, error: "Medya şu an işleniyor" };
  }

  const now = new Date();
  const deleteAfter = new Date(now.getTime() + SOFT_DELETE_DELAY_HOURS * 60 * 60 * 1000);
  await db.media.update({
    where: { id: mediaId },
    data: { deletedAt: now, deleteAfter },
  });
  return { ok: true };
}

/**
 * Replace media file keeping same ID. Uses checksum dedup; old path refcount: delete files only if last ref.
 */
export async function replaceMedia(mediaId: string, file: File): Promise<ReplaceMediaResult> {
  const media = await db.media.findUnique({
    where: { id: mediaId },
    select: { id: true, status: true, version: true, storagePath: true, mimeType: true },
  });
  if (!media) {
    return { ok: false, error: "Medya bulunamadı" };
  }
  if (media.status !== "ready") {
    return { ok: false, error: "Sadece hazır medya değiştirilebilir" };
  }

  if (file.size > MAX_UPLOAD_BYTES) {
    return { ok: false, error: "Dosya çok büyük (maks. 5MB)" };
  }

  let buffer: Buffer;
  try {
    const stream = Readable.fromWeb(file.stream() as Parameters<typeof Readable.fromWeb>[0]);
    const chunks: Buffer[] = [];
    for await (const chunk of stream) {
      chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk as ArrayBuffer));
    }
    buffer = Buffer.concat(chunks);
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "Dosya okunamadı" };
  }

  const mimeCheck = await checkMimeAndExtension(buffer);
  if (!mimeCheck.ok) {
    return { ok: false, error: mimeCheck.reason };
  }
  const ext = mimeCheck.ext;
  const mimeType = mimeCheck.mime;
  const isSvg = mimeType === "image/svg+xml";

  if (isSvg && buffer.length > MAX_SVG_BYTES) {
    return { ok: false, error: "SVG çok büyük (maks. 1MB)" };
  }

  let finalBuffer: Buffer;
  let finalMime: string;
  let checksum: string;
  let width: number | null = null;
  let height: number | null = null;

  if (isSvg) {
    try {
      const text = buffer.toString("utf-8");
      const sanitized = sanitizeSvg(text);
      finalBuffer = Buffer.from(sanitized, "utf-8");
    } catch {
      return { ok: false, error: "SVG reddedildi" };
    }
    finalMime = "image/svg+xml";
    checksum = await streamHash(Readable.from(finalBuffer));
  } else {
    finalMime = mimeType;
    if (isImageMime(mimeType)) {
      try {
        const optimized = await optimizeImage(buffer, mimeType);
        finalBuffer = optimized.buffer;
        finalMime = optimized.mimeType;
        width = optimized.width;
        height = optimized.height;
      } catch (e) {
        return { ok: false, error: e instanceof Error ? e.message : "Görsel işlenemedi" };
      }
    } else {
      finalBuffer = buffer;
    }
    checksum = await streamHash(Readable.from(finalBuffer));
  }

  const storageExt = mimeToExt(finalMime);
  const oldStoragePath = media.storagePath;
  const refCountOld = await db.media.count({ where: { storagePath: oldStoragePath } });

  const existing = await db.media.findFirst({
    where: { checksum },
    include: { variants: true },
  });

  if (existing && existing.id !== mediaId) {
    const newStoragePath = existing.storagePath;
    await db.mediaVariant.deleteMany({ where: { mediaId } });
    if (refCountOld === 1) {
      const pathsToDelete = await getFilePathsToDelete(media);
      for (const p of pathsToDelete) {
        try {
          await localStorage.delete(p);
        } catch {
          // idempotent
        }
      }
    }
    const newVersion = media.version + 1;
    await db.media.update({
      where: { id: mediaId },
      data: {
        status: "ready",
        processingAt: null,
        version: newVersion,
        storagePath: newStoragePath,
        filename: file.name,
        mimeType: finalMime,
        checksum,
        width: existing.width,
        height: existing.height,
        fileSize: existing.fileSize,
      },
    });
    if (existing.variants.length > 0) {
      await db.mediaVariant.createMany({
        data: existing.variants.map((v) => ({
          mediaId,
          type: v.type,
          storagePath: v.storagePath,
          mimeType: v.mimeType,
          width: v.width,
          height: v.height,
          size: v.size,
        })),
      });
    }
    return { ok: true, version: newVersion };
  }

  const now = new Date();
  const newVersion = media.version + 1;
  const baseStoragePath = getStoragePathForNewMedia(checksum, storageExt);

  await db.media.update({
    where: { id: mediaId },
    data: {
      status: "processing",
      processingAt: now,
      version: newVersion,
      storagePath: baseStoragePath,
      filename: file.name,
      mimeType: finalMime,
      checksum,
      width,
      height,
      fileSize: null,
    },
  });

  const lock = await db.media.updateMany({
    where: { id: mediaId, status: "processing", version: newVersion },
    data: { processingAt: new Date() },
  });
  if (lock.count === 0) {
    return { ok: false, error: "Başka bir işlem bu medyayı işliyor" };
  }

  const writtenPaths: string[] = [];

  try {
    if (refCountOld === 1) {
      const pathsToDelete = await getFilePathsToDelete(media);
      for (const p of pathsToDelete) {
        try {
          await localStorage.delete(p);
        } catch {
          // idempotent
        }
      }
    }
    await db.mediaVariant.deleteMany({ where: { mediaId } });

    const stream = Readable.from(finalBuffer);
    await localStorage.write(baseStoragePath, stream);
    writtenPaths.push(baseStoragePath);

    if (!(await localStorage.exists(baseStoragePath))) {
      await db.media.update({
        where: { id: mediaId },
        data: { status: "failed", processingAt: null },
      });
      await deleteWrittenFiles(writtenPaths);
      return { ok: false, error: "Dosya diske yazılamadı" };
    }

    const fileSize = await localStorage.size(baseStoragePath);
    await db.media.update({
      where: { id: mediaId },
      data: { fileSize: BigInt(fileSize) },
    });

    if (isImageMime(mimeType) && !isSvg) {
      const variantPaths = getVariantStoragePathsFromBase(baseStoragePath);
      const allExist = (await Promise.all(variantPaths.map((p) => localStorage.exists(p)))).every(Boolean);
      if (allExist) {
        const sharp = (await import("sharp")).default;
        const variantData: { mediaId: string; type: VariantType; storagePath: string; mimeType: string; width: number; height: number; size: number }[] = [];
        for (let i = 0; i < variantPaths.length; i++) {
          const path = variantPaths[i];
          const s = await localStorage.size(path);
          const str = await localStorage.readStream(path);
          const chunks: Buffer[] = [];
          for await (const chunk of str) {
            chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk as ArrayBuffer));
          }
          const buf = Buffer.concat(chunks);
          const meta = await sharp(buf).metadata();
          const mime = VARIANT_TYPES[i] === "WEBP" ? "image/webp" : VARIANT_TYPES[i] === "AVIF" ? "image/avif" : "image/jpeg";
          variantData.push({
            mediaId,
            type: VARIANT_TYPES[i],
            storagePath: path,
            mimeType: mime,
            width: meta.width ?? 0,
            height: meta.height ?? 0,
            size: s,
          });
        }
        await db.mediaVariant.createMany({ data: variantData });
      } else {
        const variants = await generateImageVariants(finalBuffer, baseStoragePath);
        for (const v of variants) {
          await localStorage.write(v.storagePath, Readable.from(v.buffer));
          writtenPaths.push(v.storagePath);
        }
        await db.mediaVariant.createMany({
          data: variants.map((v) => ({
            mediaId,
            type: v.type,
            storagePath: v.storagePath,
            mimeType: v.mimeType,
            width: v.width,
            height: v.height,
            size: v.size,
          })),
        });
      }
    }

    await db.media.update({
      where: { id: mediaId },
      data: { status: "ready", processingAt: null },
    });

    return { ok: true, version: newVersion };
  } catch (e) {
    await deleteWrittenFiles(writtenPaths);
    await db.media.update({
      where: { id: mediaId },
      data: { status: "failed", processingAt: null },
    }).catch(() => {});
    return {
      ok: false,
      error: e instanceof Error ? e.message : "Değiştirme hatası",
    };
  }
}

/**
 * Retry processing for failed media: read original from disk, regenerate variants.
 */
export async function retryProcessing(mediaId: string): Promise<RetryProcessingResult> {
  const media = await db.media.findUnique({
    where: { id: mediaId },
    select: { id: true, status: true, storagePath: true, mimeType: true, version: true },
  });
  if (!media) {
    return { ok: false, error: "Medya bulunamadı" };
  }
  if (media.status !== "failed") {
    return { ok: false, error: "Sadece başarısız medya yeniden işlenebilir" };
  }

  const exists = await localStorage.exists(media.storagePath);
  if (!exists) {
    return { ok: false, error: "Orijinal dosya bulunamadı" };
  }

  const isSvg = media.mimeType === "image/svg+xml";
  if (isSvg) {
    await db.media.update({
      where: { id: mediaId },
      data: { status: "ready", processingAt: null },
    });
    return { ok: true };
  }

  const lock = await db.media.updateMany({
    where: { id: mediaId, status: "failed" },
    data: { status: "processing", processingAt: new Date() },
  });
  if (lock.count === 0) {
    return { ok: false, error: "Medya durumu değişti" };
  }

  const writtenPaths: string[] = [];
  try {
    const stream = await localStorage.readStream(media.storagePath);
    const chunks: Buffer[] = [];
    for await (const chunk of stream) {
      chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
    }
    const buffer = Buffer.concat(chunks);

    const variants = await generateImageVariants(buffer, media.storagePath);
    for (const v of variants) {
      await localStorage.write(v.storagePath, Readable.from(v.buffer));
      writtenPaths.push(v.storagePath);
    }

    await db.mediaVariant.deleteMany({ where: { mediaId } });
    await db.mediaVariant.createMany({
      data: variants.map((v) => ({
        mediaId,
        type: v.type,
        storagePath: v.storagePath,
        mimeType: v.mimeType,
        width: v.width,
        height: v.height,
        size: v.size,
      })),
    });

    await db.media.update({
      where: { id: mediaId },
      data: { status: "ready", processingAt: null },
    });

    return { ok: true };
  } catch (e) {
    await deleteWrittenFiles(writtenPaths);
    await db.media.update({
      where: { id: mediaId },
      data: { status: "failed", processingAt: null },
    }).catch(() => {});
    return {
      ok: false,
      error: e instanceof Error ? e.message : "Yeniden işleme hatası",
    };
  }
}
