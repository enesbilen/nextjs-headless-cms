/**
 * Shared query param helpers for media page (server and client).
 */

export const PER_PAGE_OPTIONS = [10, 20, 30, 50, 100] as const;
export const DEFAULT_PER_PAGE = 24;

export type MediaQueryParams = {
  page?: number;
  per_page?: number;
  type?: string;
  order?: string;
  search?: string;
  select?: boolean;
};

export function buildMediaQuery(params: MediaQueryParams): string {
  const q = new URLSearchParams();
  if (params.page != null && params.page > 1) q.set("page", String(params.page));
  if (params.per_page != null && params.per_page !== DEFAULT_PER_PAGE)
    q.set("per_page", String(params.per_page));
  if (params.type) q.set("type", params.type);
  if (params.order && params.order !== "desc") q.set("order", params.order);
  if (params.search && params.search.trim()) q.set("search", params.search.trim());
  if (params.select) q.set("select", "1");
  const s = q.toString();
  return s ? `?${s}` : "";
}
