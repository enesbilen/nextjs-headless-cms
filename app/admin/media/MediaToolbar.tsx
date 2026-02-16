"use client";

import { useCallback, useEffect, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import {
  buildMediaQuery,
  DEFAULT_PER_PAGE,
  PER_PAGE_OPTIONS,
  type MediaQueryParams,
} from "./mediaQuery";

const TYPE_OPTIONS: { value: string; label: string }[] = [
  { value: "", label: "Tümü" },
  { value: "image", label: "Görseller" },
  { value: "png", label: "PNG" },
  { value: "jpg", label: "JPEG" },
  { value: "svg", label: "SVG" },
  { value: "gif", label: "GIF" },
  { value: "webp", label: "WebP" },
];

const DEBOUNCE_MS = 400;

export function MediaToolbar() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const urlSearch = searchParams.get("search") ?? "";
  const typeFilter = searchParams.get("type") ?? "";
  const order = searchParams.get("order") === "asc" ? "asc" : "desc";
  const perPageParam = searchParams.get("per_page");
  const perPage = perPageParam
    ? (PER_PAGE_OPTIONS.includes(Number(perPageParam) as (typeof PER_PAGE_OPTIONS)[number])
        ? Number(perPageParam)
        : DEFAULT_PER_PAGE)
    : DEFAULT_PER_PAGE;

  const [searchInput, setSearchInput] = useState(urlSearch);

  useEffect(() => {
    setSearchInput(urlSearch);
  }, [urlSearch]);

  useEffect(() => {
    const t = setTimeout(() => {
      const next = searchInput.trim();
      if (next === urlSearch) return;
      const params: MediaQueryParams = {
        search: next || undefined,
        type: typeFilter || undefined,
        order: order !== "desc" ? order : undefined,
        per_page: perPage !== DEFAULT_PER_PAGE ? perPage : undefined,
        page: 1,
      };
      router.replace(pathname + buildMediaQuery(params));
    }, DEBOUNCE_MS);
    return () => clearTimeout(t);
  }, [searchInput, urlSearch, typeFilter, order, perPage, pathname, router]);

  const getBaseParams = useCallback(
    (overrides: Partial<MediaQueryParams> = {}) => ({
      search: searchInput.trim() || undefined,
      type: typeFilter || undefined,
      order: order !== "desc" ? order : undefined,
      per_page: perPage !== DEFAULT_PER_PAGE ? perPage : undefined,
      ...overrides,
    }),
    [searchInput, typeFilter, order, perPage]
  );

  const handleTypeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    router.replace(pathname + buildMediaQuery({ ...getBaseParams(), type: value || undefined, page: 1 }));
  };

  return (
    <div className="mb-4 rounded-xl border border-zinc-200 bg-white px-4 py-3 shadow-sm">
      <div className="flex flex-wrap items-center gap-4">
        <div className="min-w-0 flex-1 sm:max-w-xs">
          <label htmlFor="media-search" className="sr-only">
            Dosya adına göre ara
          </label>
          <input
            id="media-search"
            type="search"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder="Search by filename..."
            className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm placeholder:text-zinc-400 focus:border-zinc-500 focus:outline-none focus:ring-1 focus:ring-zinc-500"
            aria-label="Dosya adına göre ara"
          />
        </div>
        <div className="flex items-center gap-2">
          <label htmlFor="media-type-filter" className="text-sm font-medium text-zinc-500">
            Tür:
          </label>
          <select
            id="media-type-filter"
            value={typeFilter}
            onChange={handleTypeChange}
            className="rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-800 focus:border-zinc-500 focus:outline-none focus:ring-1 focus:ring-zinc-500"
            aria-label="Medya türü filtresi"
          >
            {TYPE_OPTIONS.map((opt) => (
              <option key={opt.value || "all"} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-zinc-500">Sırala:</span>
          <a
            href={pathname + buildMediaQuery(getBaseParams({ order: "desc", page: 1 }))}
            className={`rounded-lg px-3 py-2 text-sm ${order === "desc" ? "bg-zinc-200 font-medium text-zinc-900" : "text-zinc-600 hover:bg-zinc-100"}`}
          >
            En yeni
          </a>
          <a
            href={pathname + buildMediaQuery(getBaseParams({ order: "asc", page: 1 }))}
            className={`rounded-lg px-3 py-2 text-sm ${order === "asc" ? "bg-zinc-200 font-medium text-zinc-900" : "text-zinc-600 hover:bg-zinc-100"}`}
          >
            En eski
          </a>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-zinc-500">Göster:</span>
          {PER_PAGE_OPTIONS.map((n) => (
            <a
              key={n}
              href={pathname + buildMediaQuery(getBaseParams({ per_page: n, page: 1 }))}
              className={`rounded-lg px-3 py-2 text-sm ${perPage === n ? "bg-zinc-200 font-medium text-zinc-900" : "text-zinc-600 hover:bg-zinc-100"}`}
            >
              {n}
            </a>
          ))}
          {perPage === DEFAULT_PER_PAGE && !(PER_PAGE_OPTIONS as readonly number[]).includes(DEFAULT_PER_PAGE) && (
            <span className="rounded-lg bg-zinc-200 px-3 py-2 text-sm font-medium text-zinc-900">
              {DEFAULT_PER_PAGE}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
