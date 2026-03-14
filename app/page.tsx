import { db } from "@/core/db";
import { getManySettings, CMS_SETTING_KEYS } from "@/core/settings-service";
import { PageContent } from "@/core/PageContent";
import { resolvedPageSelect } from "@/core/resolve";
import { renderZone } from "@/core/layout/render-layout";
import { notFound } from "next/navigation";
import type { Metadata } from "next";

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getManySettings([CMS_SETTING_KEYS.HOMEPAGE_ID]);
  const homepageId = settings[CMS_SETTING_KEYS.HOMEPAGE_ID];
  if (!homepageId) return { title: "Home" };

  const page = await db.page.findUnique({
    where: { id: homepageId },
    select: { title: true, status: true },
  });
  if (!page || page.status !== "PUBLISHED") return { title: "Home" };
  return { title: page.title };
}

export default async function HomePage() {
  const settings = await getManySettings([CMS_SETTING_KEYS.HOMEPAGE_ID]);
  const homepageId = settings[CMS_SETTING_KEYS.HOMEPAGE_ID];

  if (!homepageId) {
    return (
      <main className="max-w-[800px] mx-auto my-10 font-sans">
        <p>Homepage is not configured in admin settings.</p>
      </main>
    );
  }

  const page = await db.page.findFirst({
    where: { id: homepageId, status: "PUBLISHED" },
    select: resolvedPageSelect,
  });

  if (!page) {
    notFound();
  }

  const [header, footer] = await Promise.all([
    renderZone("header"),
    renderZone("footer"),
  ]);

  return (
    <>
      {header}
      <PageContent
        title={page.title}
        body={page.body}
        coverImage={page.coverImage}
        builderMode={page.builderMode}
        blocks={page.blocks}
      />
      {footer}
    </>
  );
}
