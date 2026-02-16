import { MediaStatus } from "@prisma/client";
import { db } from "@/core/db";
import { getMediaUrl } from "@/core/media/url";
import { AdminContent } from "../_components/AdminContent";
import { AdminPageHeader } from "../_components/AdminPageHeader";
import { MediaManager, type MediaItem } from "./MediaManager";
import { MediaToolbar } from "./MediaToolbar";
import {
  buildMediaQuery,
  DEFAULT_PER_PAGE,
  PER_PAGE_OPTIONS,
} from "./mediaQuery";
import Link from "next/link";

type PageProps = {
  searchParams: Promise<{
    page?: string;
    per_page?: string;
    type?: string;
    order?: string;
    search?: string;
    select?: string;
  }>;
};

function getMimeWhere(type: string | undefined) {
  if (!type) return undefined;
  if (type === "image") return { mimeType: { startsWith: "image/" } };
  if (type === "png") return { mimeType: "image/png" };
  if (type === "jpg" || type === "jpeg") return { mimeType: "image/jpeg" };
  if (type === "svg") return { mimeType: "image/svg+xml" };
  if (type === "gif") return { mimeType: "image/gif" };
  if (type === "webp") return { mimeType: "image/webp" };
  return undefined;
}

export default async function AdminMediaPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const page = Math.max(1, parseInt(params.page ?? "1", 10) || 1);
  const perPageRaw = params.per_page ? parseInt(params.per_page, 10) : DEFAULT_PER_PAGE;
  const perPage = PER_PAGE_OPTIONS.includes(perPageRaw as (typeof PER_PAGE_OPTIONS)[number])
    ? (perPageRaw as (typeof PER_PAGE_OPTIONS)[number])
    : DEFAULT_PER_PAGE;
  const typeFilter = params.type ?? undefined;
  const order = params.order === "asc" ? "asc" : "desc";
  const search = params.search?.trim() ?? undefined;
  const selectMode = params.select === "1";
  const skip = (page - 1) * perPage;

  const baseWhere = { status: { in: [MediaStatus.ready, MediaStatus.failed] }, deletedAt: null };
  const mimeWhere = getMimeWhere(typeFilter);
  const searchWhere = search
    ? { filename: { contains: search } }
    : undefined;
  const where = {
    ...baseWhere,
    ...mimeWhere,
    ...searchWhere,
  };

  const [items, total] = await Promise.all([
    db.media.findMany({
      where,
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
        createdAt: true,
        status: true,
        version: true,
      },
    }),
    db.media.count({ where }),
  ]);

  const totalPages = Math.ceil(total / perPage);
  const mediaWithUrl: MediaItem[] = items.map((m) => ({
    id: m.id,
    filename: m.filename,
    mimeType: m.mimeType,
    width: m.width,
    height: m.height,
    alt: m.alt,
    status: m.status === "ready" || m.status === "failed" ? m.status : "ready",
    version: m.version,
    url: getMediaUrl(m.id, m, m.version ?? undefined),
    thumbnailUrl: getMediaUrl(m.id, m, m.version ?? undefined) + "?variant=thumbnail",
    createdAt: m.createdAt instanceof Date ? m.createdAt.toISOString() : undefined,
  }));

  const baseQuery = {
    type: typeFilter,
    order,
    select: selectMode,
    per_page: perPage,
    search,
  };

  return (
    <AdminContent maxWidth="4xl">
      {!selectMode && (
        <AdminPageHeader
          title="Medya"
          backHref="/admin"
          backLabel="İçerikler"
        />
      )}
      {selectMode && (
        <p className="mb-4 text-sm text-zinc-600">
          Görsel seçin — URL kopyalanacak veya içeriğe eklenebilir.
        </p>
      )}

      {!selectMode && <MediaToolbar />}

      <MediaManager
        initialItems={mediaWithUrl}
        totalPages={totalPages}
        currentPage={page}
        selectMode={selectMode}
      />

      {(totalPages > 1 || total > 0) && (
        <div className="mt-6 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-sm text-zinc-600">
            <span>Göster: {perPage}</span>
            {total > 0 && (
              <span>
                — {total} öğe, sayfa {page} / {totalPages}
              </span>
            )}
          </div>
          {totalPages > 1 && (
            <div className="flex items-center gap-2">
              {page > 1 && (
                <Link
                  href={`/admin/media${buildMediaQuery({ ...baseQuery, page: page - 1 })}`}
                  className="rounded border border-zinc-300 px-3 py-1.5 text-sm hover:bg-zinc-100"
                >
                  Önceki
                </Link>
              )}
              <span className="px-3 py-1.5 text-sm text-zinc-600">
                {page} / {totalPages}
              </span>
              {page < totalPages && (
                <Link
                  href={`/admin/media${buildMediaQuery({ ...baseQuery, page: page + 1 })}`}
                  className="rounded border border-zinc-300 px-3 py-1.5 text-sm hover:bg-zinc-100"
                >
                  Sonraki
                </Link>
              )}
            </div>
          )}
        </div>
      )}
    </AdminContent>
  );
}
