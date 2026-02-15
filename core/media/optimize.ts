import sharp from "sharp";
import type { VariantType } from "@prisma/client";

const MAX_DIMENSION = 1920;
const QUALITY = 85;

export type OptimizeResult = {
  buffer: Buffer;
  width: number;
  height: number;
  mimeType: string;
};

/**
 * Optimize image: max dimension 1920, quality 85, preserve aspect, auto rotate from EXIF.
 * Returns optimized buffer and dimensions.
 */
export async function optimizeImage(
  buffer: Buffer,
  mimeType: string
): Promise<OptimizeResult> {
  const pipeline = sharp(buffer)
    .rotate()
    .resize(MAX_DIMENSION, MAX_DIMENSION, { fit: "inside", withoutEnlargement: true });

  const format = mimeType.includes("png") ? "png" : "jpeg";
  const outMime = format === "png" ? "image/png" : "image/jpeg";
  const outBuffer =
    format === "png"
      ? await pipeline.png({ quality: QUALITY }).toBuffer()
      : await pipeline.jpeg({ quality: QUALITY }).toBuffer();

  const meta = await sharp(outBuffer).metadata();
  const width = meta.width ?? 0;
  const height = meta.height ?? 0;

  return {
    buffer: outBuffer,
    width,
    height,
    mimeType: outMime,
  };
}

export type VariantResult = {
  type: VariantType;
  storagePath: string;
  buffer: Buffer;
  mimeType: string;
  width: number;
  height: number;
  size: number;
};

/**
 * Generate variant storage path from base path (e.g. "2026/02/abc123.jpg" -> "2026/02/abc123-thumb.jpg")
 */
function variantPath(basePath: string, type: string, ext: string): string {
  const lastDot = basePath.lastIndexOf(".");
  const base = lastDot >= 0 ? basePath.slice(0, lastDot) : basePath;
  const suffix = type.toLowerCase();
  return `${base}-${suffix}.${ext}`;
}

/**
 * Generate all image variants: THUMBNAIL, MEDIUM, LARGE, WEBP, AVIF.
 * baseStoragePath e.g. "2026/02/abc123.jpg"
 */
export async function generateImageVariants(
  buffer: Buffer,
  baseStoragePath: string
): Promise<VariantResult[]> {
  const results: VariantResult[] = [];
  const pipeline = sharp(buffer).rotate();

  const specs = [
    { type: "THUMBNAIL" as const, size: 150 },
    { type: "MEDIUM" as const, size: 300 },
    { type: "LARGE" as const, size: 1024 },
  ];

  for (const { type, size } of specs) {
    const resized = await pipeline
      .clone()
      .resize(size, size, { fit: "inside", withoutEnlargement: true })
      .jpeg({ quality: QUALITY })
      .toBuffer();
    const meta = await sharp(resized).metadata();
    const path = variantPath(baseStoragePath, type, "jpg");
    results.push({
      type,
      storagePath: path,
      buffer: resized,
      mimeType: "image/jpeg",
      width: meta.width ?? 0,
      height: meta.height ?? 0,
      size: resized.length,
    });
  }

  const webpBuffer = await sharp(buffer)
    .rotate()
    .resize(MAX_DIMENSION, MAX_DIMENSION, { fit: "inside", withoutEnlargement: true })
    .webp({ quality: QUALITY })
    .toBuffer();
  const webpMeta = await sharp(webpBuffer).metadata();
  results.push({
    type: "WEBP",
    storagePath: variantPath(baseStoragePath, "webp", "webp"),
    buffer: webpBuffer,
    mimeType: "image/webp",
    width: webpMeta.width ?? 0,
    height: webpMeta.height ?? 0,
    size: webpBuffer.length,
  });

  const avifBuffer = await sharp(buffer)
    .rotate()
    .resize(MAX_DIMENSION, MAX_DIMENSION, { fit: "inside", withoutEnlargement: true })
    .avif({ quality: QUALITY })
    .toBuffer();
  const avifMeta = await sharp(avifBuffer).metadata();
  results.push({
    type: "AVIF",
    storagePath: variantPath(baseStoragePath, "avif", "avif"),
    buffer: avifBuffer,
    mimeType: "image/avif",
    width: avifMeta.width ?? 0,
    height: avifMeta.height ?? 0,
    size: avifBuffer.length,
  });

  return results;
}
