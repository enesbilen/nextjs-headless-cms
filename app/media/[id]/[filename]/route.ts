import { Readable } from "stream";
import { NextRequest } from "next/server";
import { db } from "@/core/db";
import { localStorage } from "@/core/media/storage";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string; filename: string }> }
) {
  const { id } = await params;
  const { searchParams } = new URL(req.url);
  const variant = searchParams.get("variant"); // e.g. "thumbnail" for admin grid

  if (variant === "thumbnail") {
    const v = await db.mediaVariant.findFirst({
      where: { mediaId: id, type: "THUMBNAIL" },
      select: { storagePath: true, mimeType: true, size: true },
    });
    if (v) {
      const exists = await localStorage.exists(v.storagePath);
      if (exists) {
        const stream = await localStorage.readStream(v.storagePath);
        const webStream = Readable.toWeb(stream) as ReadableStream<Uint8Array>;
        return new Response(webStream, {
          headers: {
            "Content-Type": v.mimeType ?? "image/jpeg",
            "Content-Length": String(v.size),
            "Cache-Control": "public, max-age=31536000, immutable",
          },
        });
      }
    }
  }

  const media = await db.media.findUnique({
    where: { id },
    select: {
      storagePath: true,
      mimeType: true,
      checksum: true,
      updatedAt: true,
      deletedAt: true,
    },
  });

  if (!media || media.deletedAt != null) {
    return new Response("Not Found", { status: 404 });
  }

  const exists = await localStorage.exists(media.storagePath);
  if (!exists) {
    return new Response("Not Found", { status: 404 });
  }

  const etag = `"${media.checksum}"`;
  const ifNoneMatch = req.headers.get("if-none-match");
  if (ifNoneMatch === etag) {
    return new Response(null, { status: 304 });
  }

  const stream = await localStorage.readStream(media.storagePath);
  const size = await localStorage.size(media.storagePath);
  const lastModified = media.updatedAt.toUTCString();

  const webStream = Readable.toWeb(stream) as ReadableStream<Uint8Array>;
  const isSvg = media.mimeType === "image/svg+xml";
  const headers: Record<string, string> = {
    "Content-Type": media.mimeType ?? "application/octet-stream",
    "Content-Length": String(size),
    "Cache-Control": "public, max-age=31536000, immutable",
    ETag: etag,
    "Last-Modified": lastModified,
    "X-Content-Type-Options": "nosniff",
  };
  if (isSvg) {
    headers["Content-Security-Policy"] =
      "default-src 'none'; img-src 'self' data:; style-src 'unsafe-inline'; sandbox";
  }
  return new Response(webStream, {
    status: 200,
    headers,
  });
}
