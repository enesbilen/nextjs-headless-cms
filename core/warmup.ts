import { setCached } from "./cache";
import { db } from "./db";
import { getManySettings, CMS_SETTING_KEYS } from "./settings-service";
import { normalizePath } from "./resolve";
import { renderHTML } from "./renderer";

export async function warmupCache() {
  console.log("🔥 Warming CMS cache...");

  const settings = await getManySettings([CMS_SETTING_KEYS.HOMEPAGE_ID]);
  const homepageId = settings[CMS_SETTING_KEYS.HOMEPAGE_ID];

  const contents = await db.page.findMany({
    where: { status: "PUBLISHED" },
    select: { id: true, slug: true, title: true, body: true },
  });

  for (const c of contents) {
    const path =
      homepageId != null && c.id === homepageId
        ? "/"
        : normalizePath("/" + c.slug);
    const html = renderHTML(c.title, c.body);
    setCached(path, html);
    console.log("  cached:", path);
  }

  console.log(`✅ Cache warmed (${contents.length} pages)`);
}
