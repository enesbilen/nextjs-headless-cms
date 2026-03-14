import { getCached, setCached } from "@/core/cache";
import { hash } from "@/core/hash";
import { normalizePath, resolve } from "@/core/resolve";
import { renderPageContentToMarkup } from "@/core/renderer";
import { renderZoneToHtml } from "@/core/layout/render-zone";
import { warmupCache } from "@/core/warmup";

let warmed = false;

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

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

function buildFullHtml(
  title: string,
  mainMarkup: string,
  headerHtml: string,
  footerHtml: string,
): string {
  return `<!DOCTYPE html>
<html lang="tr">
  <head>
    <meta charset="utf-8" />
    <title>${escapeHtml(title)}</title>
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <link rel="stylesheet" href="/_next/static/css/app/layout.css" />
  </head>
  <body>${headerHtml}${mainMarkup}${footerHtml}</body>
</html>`;
}

export async function GET(
  req: Request,
  { params }: { params: Promise<{ path?: string[] }> }
) {
  if (!warmed) {
    warmed = true;
    warmupCache();
  }

  const path = normalizePath(new URL(req.url).pathname);

  const cached = getCached(path);
  if (cached) {
    return htmlResponse(cached, req);
  }

  const result = await resolve(path);

  if (result.type === "not_found") {
    return new Response("Not Found", { status: 404 });
  }

  const [headerHtml, footerHtml] = await Promise.all([
    renderZoneToHtml("header"),
    renderZoneToHtml("footer"),
  ]);

  const mainMarkup = await renderPageContentToMarkup(result.content);

  if (result.type === "not_found_page") {
    const html = await buildFullHtml(result.content.title, mainMarkup, headerHtml, footerHtml);
    return new Response(html, {
      status: 404,
      headers: {
        "Content-Type": "text/html; charset=utf-8",
        "Cache-Control": "public, max-age=60, stale-while-revalidate=300",
      },
    });
  }

  const html = await buildFullHtml(result.content.title, mainMarkup, headerHtml, footerHtml);

  setCached(path, html);

  return htmlResponse(html, req);
}
