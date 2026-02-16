import { Readable } from "stream";
import { NextRequest } from "next/server";
import { db } from "@/core/db";
import { localStorage } from "@/core/media/storage";
import { getCanonicalFilename } from "@/core/media/public-utils";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string; filename: string }> }
) {
  const { id, filename: requestedFilename } = await params;
  const { searchParams } = new URL(req.url);
  const variant = searchParams.get("variant"); // e.g. "thumbnail" for admin grid
  const versionParam = searchParams.get("v");
  const isVersioned = versionParam != null && versionParam !== "";

  const media = await db.media.findUnique({
    where: { id },
    select: {
      storagePath: true,
      mimeType: true,
      checksum: true,
      updatedAt: true,
      status: true,
      filename: true,
    },
  });

  const decodedFilename = requestedFilename ? decodeURIComponent(requestedFilename) : "";
  if (!media || media.status !== "ready" || decodedFilename !== getCanonicalFilename(media)) {
    return new Response("Not Found", { status: 404 });
  }

  const isSvg = media.mimeType === "image/svg+xml";

  // SVG: ignore variant completely, always serve original (no MediaVariant, no resize, no thumbnails)
  if (isSvg) {
    const exists = await localStorage.exists(media.storagePath);
    if (!exists) {
      await db.media.update({
        where: { id },
        data: { status: "failed", processingAt: null },
      }).catch(() => {});
      return new Response("Not Found", { status: 404 });
    }
    if (!isVersioned) {
      const etag = `"${media.checksum}"`;
      if (req.headers.get("if-none-match") === etag) {
        return new Response(null, { status: 304, headers: { ETag: etag } });
      }
      const stream = await localStorage.readStream(media.storagePath);
      const size = await localStorage.size(media.storagePath);
      const webStream = Readable.toWeb(stream) as ReadableStream<Uint8Array>;
      return new Response(webStream, {
        status: 200,
        headers: {
          "Content-Type": media.mimeType ?? "image/svg+xml",
          "Content-Length": String(size),
          "Cache-Control": "public, max-age=0, must-revalidate",
          ETag: etag,
          "Last-Modified": media.updatedAt.toUTCString(),
          "X-Content-Type-Options": "nosniff",
          "Content-Security-Policy":
            "default-src 'none'; img-src 'self' data:; style-src 'unsafe-inline'; sandbox",
        },
      });
    }
    const stream = await localStorage.readStream(media.storagePath);
    const size = await localStorage.size(media.storagePath);
    const webStream = Readable.toWeb(stream) as ReadableStream<Uint8Array>;
    return new Response(webStream, {
      status: 200,
      headers: {
        "Content-Type": media.mimeType ?? "image/svg+xml",
        "Content-Length": String(size),
        "Cache-Control": "public, max-age=31536000, immutable",
        "Last-Modified": media.updatedAt.toUTCString(),
        "X-Content-Type-Options": "nosniff",
        "Content-Security-Policy":
          "default-src 'none'; img-src 'self' data:; style-src 'unsafe-inline'; sandbox",
      },
    });
  }

  // Non-SVG: optional thumbnail variant
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
        if (isVersioned) {
          return new Response(webStream, {
            status: 200,
            headers: {
              "Content-Type": v.mimeType ?? "image/jpeg",
              "Content-Length": String(v.size),
              "Cache-Control": "public, max-age=31536000, immutable",
              "Last-Modified": media.updatedAt.toUTCString(),
            },
          });
        }
        const etag = `"${media.checksum}-thumb"`;
        if (req.headers.get("if-none-match") === etag) {
          return new Response(null, { status: 304, headers: { ETag: etag } });
        }
        return new Response(webStream, {
          status: 200,
          headers: {
            "Content-Type": v.mimeType ?? "image/jpeg",
            "Content-Length": String(v.size),
            "Cache-Control": "public, max-age=0, must-revalidate",
            ETag: etag,
            "Last-Modified": media.updatedAt.toUTCString(),
          },
        });
      }
    }
  }

  const exists = await localStorage.exists(media.storagePath);
  if (!exists) {
    await db.media.update({
      where: { id },
      data: { status: "failed", processingAt: null },
    }).catch(() => {});
    return new Response("Not Found", { status: 404 });
  }

  const lastModified = media.updatedAt.toUTCString();

  if (!isVersioned) {
    const etag = `"${media.checksum}"`;
    if (req.headers.get("if-none-match") === etag) {
      return new Response(null, { status: 304, headers: { ETag: etag } });
    }
    const stream = await localStorage.readStream(media.storagePath);
    const size = await localStorage.size(media.storagePath);
    const webStream = Readable.toWeb(stream) as ReadableStream<Uint8Array>;
    return new Response(webStream, {
      status: 200,
      headers: {
        "Content-Type": media.mimeType ?? "application/octet-stream",
        "Content-Length": String(size),
        "Cache-Control": "public, max-age=0, must-revalidate",
        ETag: etag,
        "Last-Modified": lastModified,
        "X-Content-Type-Options": "nosniff",
      },
    });
  }

  const stream = await localStorage.readStream(media.storagePath);
  const size = await localStorage.size(media.storagePath);
  const webStream = Readable.toWeb(stream) as ReadableStream<Uint8Array>;
  return new Response(webStream, {
    status: 200,
    headers: {
      "Content-Type": media.mimeType ?? "application/octet-stream",
      "Content-Length": String(size),
      "Cache-Control": "public, max-age=31536000, immutable",
      "Last-Modified": lastModified,
      "X-Content-Type-Options": "nosniff",
    },
  });
}
