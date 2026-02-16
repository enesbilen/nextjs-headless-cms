import { db } from "@/core/db";
import { getMediaUrl } from "@/core/media/url";
import { AdminContent } from "../_components/AdminContent";
import { AdminPageHeader } from "../_components/AdminPageHeader";
import { MediaManager, type MediaItem } from "./MediaManager";
import Link from "next/link";

const PER_PAGE = 24;

type PageProps = {
  searchParams: Promise<{ page?: string; select?: string }>;
};

export default async function AdminMediaPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const page = Math.max(1, parseInt(params.page ?? "1", 10) || 1);
  const selectMode = params.select === "1";
  const skip = (page - 1) * PER_PAGE;

  const [items, total] = await Promise.all([
    db.media.findMany({
      where: { status: { in: ["ready", "failed"] }, deletedAt: null },
      orderBy: { createdAt: "desc" },
      skip,
      take: PER_PAGE,
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
    db.media.count({ where: { status: { in: ["ready", "failed"] }, deletedAt: null } }),
  ]);

  const totalPages = Math.ceil(total / PER_PAGE);
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
  }));

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
      <MediaManager
        initialItems={mediaWithUrl}
        totalPages={totalPages}
        currentPage={page}
        selectMode={selectMode}
      />
      {totalPages > 1 && (
        <div className="mt-6 flex justify-center gap-2">
          {page > 1 && (
            <Link
              href={
                selectMode
                  ? `/admin/media?select=1&page=${page - 1}`
                  : `/admin/media?page=${page - 1}`
              }
              className="rounded border border-zinc-300 px-3 py-1 text-sm hover:bg-zinc-100"
            >
              Önceki
            </Link>
          )}
          <span className="px-3 py-1 text-sm text-zinc-600">
            {page} / {totalPages}
          </span>
          {page < totalPages && (
            <Link
              href={
                selectMode
                  ? `/admin/media?select=1&page=${page + 1}`
                  : `/admin/media?page=${page + 1}`
              }
              className="rounded border border-zinc-300 px-3 py-1 text-sm hover:bg-zinc-100"
            >
              Sonraki
            </Link>
          )}
        </div>
      )}
    </AdminContent>
  );
}
