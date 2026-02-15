import { db } from "@/core/db";
import { getMediaUrl } from "@/core/media/url";
import { AdminContent } from "../_components/AdminContent";
import { AdminPageHeader } from "../_components/AdminPageHeader";
import { MediaManager } from "./MediaManager";
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
      where: { deletedAt: null },
      orderBy: { createdAt: "desc" },
      skip,
      take: PER_PAGE,
      select: {
        id: true,
        filename: true,
        mimeType: true,
        width: true,
        height: true,
        createdAt: true,
      },
    }),
    db.media.count({ where: { deletedAt: null } }),
  ]);

  const totalPages = Math.ceil(total / PER_PAGE);
  const mediaWithUrl = items.map((m) => ({
    ...m,
    url: getMediaUrl(m.id, m.filename),
    thumbnailUrl: getMediaUrl(m.id, m.filename) + "?variant=thumbnail",
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
