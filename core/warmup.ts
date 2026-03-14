import { setCached } from "./cache";
import { db } from "./db";
import { getManySettings, CMS_SETTING_KEYS } from "./settings-service";
import { normalizePath, resolvedPageSelect } from "./resolve";
import type { ResolvedPageContent } from "./resolve";
import { renderPageContentToMarkup } from "./renderer";
import { renderZoneToHtml } from "./layout/render-zone";

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

export async function warmupCache() {
  console.log("🔥 Warming CMS cache...");

  const settings = await getManySettings([CMS_SETTING_KEYS.HOMEPAGE_ID]);
  const homepageId = settings[CMS_SETTING_KEYS.HOMEPAGE_ID];

  const [headerHtml, footerHtml] = await Promise.all([
    renderZoneToHtml("header"),
    renderZoneToHtml("footer"),
  ]);

  const pages = await db.page.findMany({
    where: { status: "PUBLISHED" },
    select: resolvedPageSelect,
  });

  for (const page of pages) {
    const rp = page as ResolvedPageContent;
    const path =
      homepageId != null && rp.id === homepageId
        ? "/"
        : normalizePath("/" + rp.slug);

    const mainMarkup = await renderPageContentToMarkup(rp);
    const html = `<!DOCTYPE html>
<html lang="tr">
  <head>
    <meta charset="utf-8" />
    <title>${escapeHtml(rp.title)}</title>
    <meta name="viewport" content="width=device-width, initial-scale=1" />
  </head>
  <body>${headerHtml}${mainMarkup}${footerHtml}</body>
</html>`;

    setCached(path, html);
    console.log("  cached:", path);
  }

  console.log(`✅ Cache warmed (${pages.length} pages)`);
}
