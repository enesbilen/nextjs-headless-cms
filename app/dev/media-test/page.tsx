import { db } from "@/core/db";
import { MediaImage } from "@/core/media/MediaImage";

export default async function MediaTestPage() {
  const mediaList = await db.media.findMany({
    where: { deletedAt: null },
    orderBy: { createdAt: "desc" },
    take: 6,
    select: {
      id: true,
      filename: true,
      width: true,
      height: true,
      alt: true,
    },
  });

  const [largeMedia, smallMedia, ...gridMedia] = mediaList;

  return (
    <main className="mx-auto max-w-4xl p-8 font-sans">
      <h1 className="mb-8 text-2xl font-bold">Media + Next/Image test</h1>
      <p className="mb-6 text-zinc-600">
        Verify: lazy loading, responsive resizing, webp/avif in network tab, 304 cache.
      </p>

      {largeMedia && (
        <section className="mb-12">
          <h2 className="mb-4 text-lg font-semibold">Large image</h2>
          <div className="relative h-[400px] w-full overflow-hidden rounded-lg bg-zinc-100">
            <MediaImage
              mediaId={largeMedia.id}
              filename={largeMedia.filename}
              alt={largeMedia.alt ?? ""}
              fill
              sizes="(max-width: 768px) 100vw, 1024px"
              className="object-cover"
            />
          </div>
        </section>
      )}

      {smallMedia && (
        <section className="mb-12">
          <h2 className="mb-4 text-lg font-semibold">Small image (fixed size)</h2>
          <MediaImage
            mediaId={smallMedia.id}
            filename={smallMedia.filename}
            alt={smallMedia.alt ?? ""}
            width={smallMedia.width ?? 300}
            height={smallMedia.height ?? 200}
            sizes="300px"
            className="rounded-lg"
          />
        </section>
      )}

      <section className="mb-12">
        <h2 className="mb-4 text-lg font-semibold">Responsive grid</h2>
        <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
          {gridMedia.map((m) => (
            <div
              key={m.id}
              className="relative aspect-square overflow-hidden rounded-lg bg-zinc-100"
            >
              <MediaImage
                mediaId={m.id}
                filename={m.filename}
                alt={m.alt ?? ""}
                fill
                sizes="(max-width: 768px) 50vw, 33vw"
                className="object-cover"
              />
            </div>
          ))}
        </div>
      </section>

      {mediaList.length === 0 && (
        <p className="text-zinc-500">
          No media in DB. Upload images in /admin/media first.
        </p>
      )}
    </main>
  );
}
