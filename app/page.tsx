import { db } from "@/core/db";
import { getManySettings, CMS_SETTING_KEYS } from "@/core/settings-service";
import { PageContent } from "@/core/PageContent";
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
      <main
        style={{
          maxWidth: "800px",
          margin: "40px auto",
          fontFamily: "sans-serif",
        }}
      >
        <p>Homepage is not configured in admin settings.</p>
      </main>
    );
  }

  const page = await db.page.findUnique({
    where: { id: homepageId },
    select: {
      id: true,
      title: true,
      body: true,
      status: true,
      coverImageId: true,
      coverImage: {
        select: { id: true, filename: true, storagePath: true, alt: true, width: true, height: true, mimeType: true },
      },
    },
  });

  if (!page || page.status !== "PUBLISHED") {
    notFound();
  }

  return (
    <PageContent
      title={page.title}
      body={page.body}
      coverImage={page.coverImage}
    />
  );
}
