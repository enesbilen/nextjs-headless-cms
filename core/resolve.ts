import { db } from "./db";
import { getManySettings, CMS_SETTING_KEYS } from "./settings-service";

/** Full page shape for render (blocks + builderMode + coverImage). */
export type ResolvedPageContent = {
  id: string;
  slug: string;
  title: string;
  body: string;
  blocks: unknown;
  builderMode: boolean;
  coverImageId: string | null;
  coverImage: {
    id: string;
    filename: string;
    storagePath: string;
    alt: string | null;
    width: number | null;
    height: number | null;
    mimeType: string | null;
  } | null;
};

/** Full page select for resolve and warmup (blocks + builderMode + coverImage). */
export const resolvedPageSelect = {
  id: true,
  slug: true,
  title: true,
  body: true,
  blocks: true,
  builderMode: true,
  coverImageId: true,
  coverImage: {
    select: {
      id: true,
      filename: true,
      storagePath: true,
      alt: true,
      width: true,
      height: true,
      mimeType: true,
    },
  },
} as const;

export type ResolveResult =
  | { type: "content"; content: ResolvedPageContent }
  | { type: "not_found_page"; content: ResolvedPageContent }
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
function findPublishedPageBySlug(slug: string) {
  return db.page.findFirst({
    where: { status: "PUBLISHED", slug: slug.toLowerCase() },
    select: resolvedPageSelect,
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
        select: resolvedPageSelect,
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
      select: resolvedPageSelect,
    });
    if (notfoundContent) return { type: "not_found_page", content: notfoundContent };
  }
  const fallback404 = await findPublishedPageBySlug("404");
  if (fallback404) return { type: "not_found_page", content: fallback404 };

  return { type: "not_found" };
}
