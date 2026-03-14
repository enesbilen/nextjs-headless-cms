"use server";

import { db } from "@/core/db";
import {
  setSetting,
  CMS_SETTING_KEYS,
} from "@/core/settings-service";
import { revalidateTag } from "next/cache";
import { redirect } from "next/navigation";

export async function updateSettings(formData: FormData) {
  const siteTitle = (formData.get("site_title") as string)?.trim() ?? "";
  const siteDescription =
    (formData.get("site_description") as string)?.trim() ?? "";
  const siteLogoUrl = (formData.get("site_logo_url") as string)?.trim() ?? "";
  const homepageId = (formData.get("homepage_id") as string)?.trim() ?? "";
  const notfoundPageId =
    (formData.get("notfound_page_id") as string)?.trim() ?? "";
  const headerPageId =
    (formData.get("header_page_id") as string)?.trim() ?? "";
  const footerPageId =
    (formData.get("footer_page_id") as string)?.trim() ?? "";

  if (homepageId && notfoundPageId && homepageId === notfoundPageId) {
    redirect("/admin/settings?error=same_page");
  }

  if (headerPageId && footerPageId && headerPageId === footerPageId) {
    redirect("/admin/settings?error=same_header_footer");
  }

  if (homepageId) {
    const page = await db.page.findFirst({
      where: { id: homepageId, status: "PUBLISHED" },
    });
    if (!page) redirect("/admin/settings?error=invalid_homepage");
  }

  if (notfoundPageId) {
    const page = await db.page.findFirst({
      where: { id: notfoundPageId, status: "PUBLISHED" },
    });
    if (!page) redirect("/admin/settings?error=invalid_notfound");
  }

  if (headerPageId) {
    const page = await db.page.findFirst({
      where: { id: headerPageId, status: "PUBLISHED" },
    });
    if (!page) redirect("/admin/settings?error=invalid_header");
  }

  if (footerPageId) {
    const page = await db.page.findFirst({
      where: { id: footerPageId, status: "PUBLISHED" },
    });
    if (!page) redirect("/admin/settings?error=invalid_footer");
  }

  await setSetting(CMS_SETTING_KEYS.SITE_TITLE, siteTitle || null);
  await setSetting(CMS_SETTING_KEYS.SITE_DESCRIPTION, siteDescription || null);
  await setSetting(CMS_SETTING_KEYS.SITE_LOGO_URL, siteLogoUrl || null);
  await setSetting(
    CMS_SETTING_KEYS.HOMEPAGE_ID,
    homepageId || null
  );
  await setSetting(
    CMS_SETTING_KEYS.NOTFOUND_PAGE_ID,
    notfoundPageId || null
  );
  await setSetting(
    CMS_SETTING_KEYS.HEADER_PAGE_ID,
    headerPageId || null
  );
  await setSetting(
    CMS_SETTING_KEYS.FOOTER_PAGE_ID,
    footerPageId || null
  );

  revalidateTag("settings", "max");
  revalidateTag("homepage", "max");
  revalidateTag("page", "max");

  redirect("/admin/settings?saved=1");
}
