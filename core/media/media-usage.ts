import type { PrismaClient } from "@prisma/client";
import { db } from "@/core/db";

/** Match /media/{id}/{filename} in HTML. Captures media id. */
const MEDIA_URL_REGEX = /\/media\/([^/"']+)\/[^"?'\s]+/g;

export const ENTITY_TYPE_PAGE = "page";
export const FIELD_CONTENT = "content";

/**
 * Extract unique media IDs from HTML content (e.g. page body).
 * Looks for URLs like /media/{id}/{filename}.
 */
export function extractMediaIdsFromContent(html: string): string[] {
  const ids = new Set<string>();
  let m: RegExpExecArray | null;
  MEDIA_URL_REGEX.lastIndex = 0;
  while ((m = MEDIA_URL_REGEX.exec(html)) !== null) {
    if (m[1]) ids.add(m[1]);
  }
  return Array.from(ids);
}

type Tx = Omit<PrismaClient, "$connect" | "$disconnect" | "$on" | "$transaction" | "$use" | "$extends">;

/**
 * Sync media usage for a page: delete old usage rows, insert new ones from body.
 * Use this inside db.$transaction so it runs atomically with page create/update.
 */
export async function syncPageMediaUsageInTx(
  tx: Tx,
  pageId: string,
  body: string
): Promise<void> {
  await tx.mediaUsage.deleteMany({
    where: { entityType: ENTITY_TYPE_PAGE, entityId: pageId, field: FIELD_CONTENT },
  });
  const mediaIds = extractMediaIdsFromContent(body);
  if (mediaIds.length === 0) return;
  await tx.mediaUsage.createMany({
    data: mediaIds.map((mediaId) => ({
      mediaId,
      entityType: ENTITY_TYPE_PAGE,
      entityId: pageId,
      field: FIELD_CONTENT,
    })),
    skipDuplicates: true,
  });
}
