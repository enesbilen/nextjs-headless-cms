import { db } from "./db";
import { getManySettings, CMS_SETTING_KEYS } from "./settings-service";

const pageSelect = {
  slug: true,
  title: true,
  body: true,
} as const;

export type ResolveResult =
  | { type: "content"; content: { title: string; body: string; slug: string } }
  | { type: "not_found_page"; content: { title: string; body: string; slug: string } }
  | { type: "not_found" };

/** Canonical path: lowercase, no trailing slash, no query. */
export function normalizePath(path: string) {
  const url = new URL("http://x" + path);
  let p = url.pathname.toLowerCase();
  if (p !== "/" && p.endsWith("/")) {
    p = p.slice(0, -1);
  }
  return p || "/";
}

function pathToSlug(path: string): string | null {
  if (!path || path === "/") return null;
  return path.replace(/^\/|\/$/g, "").toLowerCase();
}

/** Case-insensitive slug lookup (slug stored lowercase). */
async function findPublishedPageBySlug(slug: string) {
  return db.page.findFirst({
    where: { status: "PUBLISHED", slug: slug.toLowerCase() },
    select: pageSelect,
  });
}

export async function resolve(path: string): Promise<ResolveResult> {
  const canonical = normalizePath(path);

  const settings = await getManySettings([
    CMS_SETTING_KEYS.HOMEPAGE_ID,
    CMS_SETTING_KEYS.NOTFOUND_PAGE_ID,
  ]);
  const homepageId = settings[CMS_SETTING_KEYS.HOMEPAGE_ID];
  const notFoundId = settings[CMS_SETTING_KEYS.NOTFOUND_PAGE_ID];

  // Homepage: settings.homepage_id, then fallback to slug "home"
  if (canonical === "/") {
    if (homepageId) {
      const content = await db.page.findFirst({
        where: { id: homepageId, status: "PUBLISHED" },
        select: pageSelect,
      });
      if (content) return { type: "content", content };
    }
    const homeContent = await findPublishedPageBySlug("home");
    if (homeContent) return { type: "content", content: homeContent };
    return { type: "not_found" };
  }

  const slug = pathToSlug(canonical);
  if (!slug) return { type: "not_found" };

  const content = await findPublishedPageBySlug(slug);
  if (content) return { type: "content", content };

  // 404 page: settings.notfound_page_id, then fallback to slug "404"
  if (notFoundId) {
    const notfoundContent = await db.page.findFirst({
      where: { id: notFoundId, status: "PUBLISHED" },
      select: pageSelect,
    });
    if (notfoundContent) return { type: "not_found_page", content: notfoundContent };
  }
  const fallback404 = await findPublishedPageBySlug("404");
  if (fallback404) return { type: "not_found_page", content: fallback404 };

  return { type: "not_found" };
}
