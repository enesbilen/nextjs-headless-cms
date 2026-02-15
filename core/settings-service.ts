import "server-only";
import { db } from "./db";

export const CMS_SETTING_KEYS = {
  SITE_TITLE: "site_title",
  SITE_DESCRIPTION: "site_description",
  SITE_LOGO_URL: "site_logo_url",
  HOMEPAGE_ID: "homepage_id",
  NOTFOUND_PAGE_ID: "notfound_page_id",
} as const;

const cache = new Map<string, string | null>();
const pending = new Map<string, Promise<string | null>>();
/** Per-key version. Incremented on every write. Used to discard stale DB responses that would overwrite a newer value (race condition protection). */
const versions = new Map<string, number>();

export async function getSetting(key: string): Promise<string | null> {
  const cached = cache.get(key);
  if (cached !== undefined) return cached;

  let p = pending.get(key);
  if (p) return p;

  const requestVersion = versions.get(key) ?? 0;

  p = (async () => {
    try {
      const row = await db.setting.findUnique({
        where: { key },
        select: { value: true },
      });
      const value = row?.value ?? null;
      // Only write to cache if no write happened for this key in the meantime (stale DB response must not overwrite newer value).
      if ((versions.get(key) ?? 0) === requestVersion) {
        cache.set(key, value);
      }
      return value;
    } finally {
      pending.delete(key);
    }
  })();
  pending.set(key, p);
  return p;
}

export async function setSetting(
  key: string,
  value: string | null
): Promise<void> {
  // Bump version before write so any in-flight getSetting(key) will see a different version and discard its result instead of overwriting cache.
  versions.set(key, (versions.get(key) ?? 0) + 1);
  await db.setting.upsert({
    where: { key },
    create: { key, value },
    update: { value },
  });
  cache.delete(key);
  pending.delete(key);
}

export async function getManySettings(
  keys: string[]
): Promise<Record<string, string | null>> {
  const uniqueKeys = [...new Set(keys)];
  const result: Record<string, string | null> = {};
  const missingKeys: string[] = [];

  for (const k of uniqueKeys) {
    const cached = cache.get(k);
    if (cached !== undefined) {
      result[k] = cached;
    } else {
      missingKeys.push(k);
    }
  }

  if (missingKeys.length > 0) {
    const requestVersions = new Map<string, number>();
    for (const k of missingKeys) {
      requestVersions.set(k, versions.get(k) ?? 0);
    }
    const rows = await db.setting.findMany({
      where: { key: { in: missingKeys } },
      select: { key: true, value: true },
    });
    const rowMap = new Map(rows.map((r) => [r.key, r.value]));
    for (const k of missingKeys) {
      const val = rowMap.get(k) ?? null;
      if ((versions.get(k) ?? 0) === requestVersions.get(k)) {
        // Only cache if version unchanged (same race protection as getSetting).
        cache.set(k, val);
      }
      result[k] = val;
    }
  }

  for (const k of uniqueKeys) {
    if (!(k in result)) {
      result[k] = null;
      cache.set(k, null);
    }
  }

  return result;
}
