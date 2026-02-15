/**
 * Generate URL-safe slug from title.
 * "Hello World Post!" → "hello-world-post"
 */
export function generateSlug(title: string): string {
  return title
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9-]/g, "")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "")
    || "untitled";
}

export const RESERVED_SLUGS = ["/", ""];

export function isValidSlug(slug: string): boolean {
  const s = slug.trim().toLowerCase();
  if (s === "" || s === "/") return false;
  if (/\s/.test(slug)) return false;
  if (slug !== slug.toLowerCase()) return false;
  return true;
}

export function normalizeSlugInput(slug: string): string {
  return slug.trim().toLowerCase().replace(/\s+/g, "-");
}
