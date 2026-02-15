import { getCached, setCached } from "@/core/cache";
import { hash } from "@/core/hash";
import { normalizePath, resolve } from "@/core/resolve";
import { renderHTML } from "@/core/renderer";
import { warmupCache } from "@/core/warmup";

let warmed = false;

function htmlResponse(html: string, req: Request) {
  const etag = `"${hash(html)}"`;
  if (req.headers.get("if-none-match") === etag) {
    return new Response(null, { status: 304 });
  }
  return new Response(html, {
    headers: {
      "Content-Type": "text/html; charset=utf-8",
      "Cache-Control": "public, max-age=60, stale-while-revalidate=300",
      ETag: etag,
    },
  });
}

export async function GET(
  req: Request,
  { params }: { params: Promise<{ path?: string[] }> }
) {
  if (!warmed) {
    warmed = true;
    warmupCache(); // await etme — arka planda ısınsın, ilk istek hemen cevaplansın
  }

  const path = normalizePath(new URL(req.url).pathname);

  // 1) CACHE KONTROLÜ
  const cached = getCached(path);
  if (cached) {
    return htmlResponse(cached, req);
  }

  // 2) RESOLVE
  const result = await resolve(path);

  if (result.type === "not_found") {
    return new Response("Not Found", { status: 404 });
  }

  if (result.type === "not_found_page") {
    const html = renderHTML(result.content.title, result.content.body);
    return new Response(html, {
      status: 404,
      headers: {
        "Content-Type": "text/html; charset=utf-8",
        "Cache-Control": "public, max-age=60, stale-while-revalidate=300",
      },
    });
  }

  // 3) RENDER
  const html = renderHTML(result.content.title, result.content.body);

  // 4) CACHE'E KOY — admin güncellemede invalidate("/" + result.content.slug) veya /api/revalidate
  setCached(path, html);

  // 5) RESPONSE (ETag + 304 + Cache-Control)
  return htmlResponse(html, req);
}
