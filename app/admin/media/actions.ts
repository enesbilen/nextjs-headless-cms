"use server";

import { revalidatePath } from "next/cache";
import { getSession } from "@/core/session";
import { db } from "@/core/db";
import { getMediaUrl } from "@/core/media/url";
import {
  createMediaFromUpload as createMediaFromUploadService,
  deleteMedia as deleteMediaService,
  replaceMedia as replaceMediaService,
  retryProcessing as retryProcessingService,
} from "@/core/media/media-service";
import type { MediaDTO, MediaItem, FailedUpload } from "./media.types";

/** Upload result: JSON-serializable only. No Date, no undefined in required fields. */
export type UploadBatchResult = {
  uploaded: MediaDTO[];
  failed: FailedUpload[];
  /** Global error (e.g. auth); no per-file results. */
  error?: string;
};

export async function uploadMedia(formData: FormData): Promise<UploadBatchResult> {
  const session = await getSession();
  if (!session.userId) {
    return { uploaded: [], failed: [], error: "Yetkisiz" };
  }

  const rawFiles = formData.getAll("file");
  const files = rawFiles.filter((f): f is File => f instanceof File);
  if (files.length === 0) {
    return { uploaded: [], failed: [] };
  }

  const uploaded: MediaDTO[] = [];
  const failed: FailedUpload[] = [];

  for (const file of files) {
    try {
      const result = await createMediaFromUploadService(file, session.userId);
      if (result.ok) {
        const url = getMediaUrl(result.id, result, result.version);
        uploaded.push({
          id: result.id,
          url,
          filename: result.filename,
          mimeType: result.mimeType ?? null,
          width: result.width ?? null,
          height: result.height ?? null,
          status: result.status === "ready" ? "ready" : "processing",
          version: result.version,
          deduplicated: result.deduplicated === true,
        });
      } else {
        const code: FailedUpload["code"] =
          result.error.includes("büyük") || result.error.includes("Dosya") ? "validation"
          : result.error.includes("işlenemedi") || result.error.includes("yazılamadı") ? "processing"
          : undefined;
        failed.push({ filename: file.name, reason: result.error, code });
      }
    } catch (e) {
      failed.push({
        filename: file.name,
        reason: e instanceof Error ? e.message : "Ağ hatası",
        code: "network",
      });
    }
  }

  if (uploaded.length > 0) {
    revalidatePath("/admin/media");
  }

  return { uploaded, failed };
}

export type DeleteMediaResult = { ok: true } | { ok: false; error: string };

export async function deleteMedia(mediaId: string): Promise<DeleteMediaResult> {
  const session = await getSession();
  if (!session.userId) {
    return { ok: false, error: "Yetkisiz" };
  }
  const result = await deleteMediaService(mediaId);
  if (result.ok) {
    revalidatePath("/admin/media");
    revalidatePath("/admin");
  }
  return result;
}

export type RetryMediaResult = { ok: true } | { ok: false; error: string };

export async function retryMedia(mediaId: string): Promise<RetryMediaResult> {
  const session = await getSession();
  if (!session.userId) {
    return { ok: false, error: "Yetkisiz" };
  }
  const result = await retryProcessingService(mediaId);
  if (result.ok) {
    revalidatePath("/admin/media");
    revalidatePath("/admin");
  }
  return result;
}

export type ReplaceMediaResult = { ok: true; version: number } | { ok: false; error: string };

export async function replaceMedia(mediaId: string, formData: FormData): Promise<ReplaceMediaResult> {
  const session = await getSession();
  if (!session.userId) {
    return { ok: false, error: "Yetkisiz" };
  }
  const file = formData.get("file");
  if (!(file instanceof File) || file.size === 0) {
    return { ok: false, error: "Dosya gerekli" };
  }
  const result = await replaceMediaService(mediaId, file);
  if (result.ok) {
    revalidatePath("/admin/media");
    revalidatePath("/admin");
  }
  return result;
}

export type UpdateMediaResult =
  | { ok: true; filename: string }
  | { ok: false; error: string };

export type GetMediaListResult = {
  items: MediaItem[];
  totalPages: number;
};

export async function getMediaList(
  page: number,
  perPage: number,
  typeFilter?: string,
  search?: string,
  order: "asc" | "desc" = "desc",
): Promise<GetMediaListResult> {
  const session = await getSession();
  if (!session.userId) return { items: [], totalPages: 0 };

  const baseWhere: Record<string, unknown> = { status: { in: ["ready", "failed"] }, deletedAt: null };

  if (typeFilter === "image") {
    baseWhere.mimeType = { startsWith: "image/" };
  }
  if (search?.trim()) {
    baseWhere.filename = { contains: search.trim() };
  }

  const skip = (Math.max(1, page) - 1) * perPage;

  const [rows, total] = await Promise.all([
    db.media.findMany({
      where: baseWhere,
      orderBy: { createdAt: order },
      skip,
      take: perPage,
      select: {
        id: true,
        filename: true,
        storagePath: true,
        mimeType: true,
        width: true,
        height: true,
        alt: true,
        status: true,
        version: true,
        createdAt: true,
      },
    }),
    db.media.count({ where: baseWhere }),
  ]);

  const items: MediaItem[] = rows.map((m) => {
    const url = getMediaUrl(m.id, m, m.version ?? undefined);
    return {
      id: m.id,
      filename: m.filename,
      mimeType: m.mimeType,
      width: m.width,
      height: m.height,
      alt: m.alt,
      status: m.status === "ready" || m.status === "failed" ? m.status : "ready",
      version: m.version,
      url,
      thumbnailUrl: url + (url.includes("?") ? "&" : "?") + "variant=thumbnail",
      createdAt: m.createdAt instanceof Date ? m.createdAt.toISOString() : undefined,
    };
  });

  return { items, totalPages: Math.ceil(total / perPage) };
}

export async function updateMedia(
  mediaId: string,
  formData: FormData
): Promise<UpdateMediaResult> {
  const session = await getSession();
  if (!session.userId) {
    return { ok: false, error: "Yetkisiz" };
  }
  const media = await db.media.findUnique({
    where: { id: mediaId },
    select: { id: true, status: true },
  });
  if (!media || media.status !== "ready") {
    return { ok: false, error: "Medya bulunamadı veya düzenlenemez" };
  }
  const filename = (formData.get("filename") as string)?.trim();
  const alt = (formData.get("alt") as string)?.trim() || null;
  if (!filename) {
    return { ok: false, error: "Dosya adı gerekli" };
  }
  await db.media.update({
    where: { id: mediaId },
    data: { filename, alt },
  });
  revalidatePath("/admin/media");
  revalidatePath("/admin");
  return { ok: true, filename };
}
