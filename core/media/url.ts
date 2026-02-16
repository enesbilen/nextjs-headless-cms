import { getCanonicalFilename } from "./public-utils";

/** Media-like shape for URL building (filename + storagePath). */
export type MediaForUrl = { filename: string; storagePath: string };

/**
 * Build media URL from id and canonical filename (e.g. when filename already canonical from HTML).
 */
export function getMediaUrlFromFilename(id: string, canonicalFilename: string, version?: number): string {
  const path = `/media/${id}/${encodeURIComponent(canonicalFilename)}`;
  if (version != null) {
    return `${path}?v=${version}`;
  }
  return path;
}

/**
 * Public URL for a media file. Always derived; never stored as final URL in DB.
 * Uses canonical filename (slug + real disk extension) so URLs survive replaceMedia and CDN.
 * version: cache busting; when provided, appends ?v=version.
 * CDN base can be applied at edge or via env later.
 */
export function getMediaUrl(id: string, media: MediaForUrl, version?: number): string {
  return getMediaUrlFromFilename(id, getCanonicalFilename(media), version);
}
