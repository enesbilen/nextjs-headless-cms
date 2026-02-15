/**
 * Public URL for a media file. Always derived; never stored as final URL in DB.
 * CDN base can be applied at edge or via env later.
 */
export function getMediaUrl(id: string, filename: string): string {
  return `/media/${id}/${encodeURIComponent(filename)}`;
}
