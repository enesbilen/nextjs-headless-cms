"use server";

import { createId } from "@paralleldrive/cuid2";
import { createHash } from "crypto";
import { Readable } from "stream";
import { getSession } from "@/core/session";
import { db } from "@/core/db";
import { localStorage } from "@/core/media/storage";
import { getMediaUrl } from "@/core/media/url";
import { optimizeImage, generateImageVariants } from "@/core/media/optimize";
import {
  checkMimeAndExtension,
  MAX_UPLOAD_BYTES,
  MAX_SVG_BYTES,
  isImageMime,
} from "@/core/media/mime";
import { sanitizeSvg } from "@/core/media/svg-sanitize";

export type UploadMediaResult =
  | { ok: true; media: { id: string; url: string; filename: string; width: number | null; height: number | null } }
  | { ok: false; error: string };

export async function uploadMedia(
  formData: FormData
): Promise<UploadMediaResult> {
  const session = await getSession();
  if (!session.userId) {
    return { ok: false, error: "Unauthorized" };
  }

  const file = formData.get("file");
  if (!file || !(file instanceof File)) {
    return { ok: false, error: "No file provided" };
  }

  if (file.size > MAX_UPLOAD_BYTES) {
    return { ok: false, error: "File too large (max 5MB)" };
  }

  const arrayBuffer = await file.arrayBuffer();
  const buffer = Buffer.from(new Uint8Array(arrayBuffer)) as Buffer;

  const mimeCheck = await checkMimeAndExtension(buffer);
  if (!mimeCheck.ok) {
    return { ok: false, error: mimeCheck.reason };
  }

  const ext = mimeCheck.ext;
  const mimeType = mimeCheck.mime;
  const isSvg = mimeType === "image/svg+xml";

  if (isSvg && buffer.length > MAX_SVG_BYTES) {
    return { ok: false, error: "SVG file too large (max 1MB)" };
  }

  let width: number | null = null;
  let height: number | null = null;
  let finalBuffer: Buffer;
  let finalMime: string;
  let checksum: string;

  if (isSvg) {
    const text = buffer.toString("utf-8");
    try {
      const sanitized = sanitizeSvg(text);
      finalBuffer = Buffer.from(sanitized, "utf-8");
    } catch {
      return { ok: false, error: "SVG rejected: invalid or unsafe content" };
    }
    finalMime = "image/svg+xml";
    checksum = createHash("sha256").update(finalBuffer).digest("hex");
  } else {
    checksum = createHash("sha256").update(buffer).digest("hex");
    finalMime = mimeType;
    if (isImageMime(mimeType)) {
      const optimized = await optimizeImage(buffer, mimeType);
      finalBuffer = optimized.buffer;
      finalMime = optimized.mimeType;
      width = optimized.width;
      height = optimized.height;
    } else {
      finalBuffer = buffer;
    }
  }

  const id = createId();
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const baseStoragePath = `${year}/${month}/${id}.${ext}`;

  const stream = Readable.from(finalBuffer);
  await localStorage.write(baseStoragePath, stream);

  await db.media.create({
    data: {
      id,
      filename: file.name,
      mimeType: finalMime,
      storagePath: baseStoragePath,
      width,
      height,
      checksum,
      userId: session.userId,
    },
  });

  if (isImageMime(mimeType) && !isSvg) {
    const variants = await generateImageVariants(finalBuffer, baseStoragePath);
    for (const v of variants) {
      await localStorage.write(
        v.storagePath,
        Readable.from(v.buffer)
      );
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

  const url = getMediaUrl(id, file.name);
  return {
    ok: true,
    media: {
      id,
      url,
      filename: file.name,
      width,
      height,
    },
  };
}
