import { MediaImage } from "@/core/media/MediaImage";
import { ContentBody } from "@/core/ContentBody";
import { getCanonicalFilename } from "@/core/media/public-utils";
import { PageBlockRenderer } from "@/core/page-builder/BlockRenderer";
import type { PageBuilderDoc, PageSettings } from "@/core/page-builder/types";
import { DEFAULT_PAGE_SETTINGS } from "@/core/page-builder/types";

type CoverImage = {
  id: string;
  filename: string;
  storagePath: string;
  alt?: string | null;
  width?: number | null;
  height?: number | null;
  mimeType?: string | null;
};

/**
 * Renders a CMS page. When builderMode is true and blocks JSON is provided,
 * the page builder's SSR BlockRenderer is used with pageSettings (contentWidth, layout, background, etc.).
 * Otherwise falls back to HTML body.
 * @param compact When true (header/footer), main wrapper does not use min-height: 100vh — only content height.
 */
export function PageContent({
  title,
  body,
  coverImage,
  builderMode,
  blocks,
  compact,
}: {
  title: string;
  body: string;
  coverImage?: CoverImage | null;
  builderMode?: boolean;
  blocks?: unknown;
  compact?: boolean;
}) {
  if (builderMode && blocks) {
    const doc = blocks as PageBuilderDoc;
    const settings: PageSettings = { ...DEFAULT_PAGE_SETTINGS, ...doc.pageSettings };
    const isConstrained = settings.layoutPreset === "boxed" || settings.layoutPreset === "narrow";
    const align = settings.contentAlign ?? "center";
    const alignClass = align === "center" ? "mx-auto" : align === "right" ? "ml-auto" : "";

    return (
      <main
        className={`bg-cover bg-center ${compact ? "" : "min-h-screen"}`}
        style={{
          backgroundColor: settings.backgroundColor,
          backgroundImage: settings.backgroundImage ? `url(${settings.backgroundImage})` : undefined,
          fontFamily: settings.fontFamily ?? "inherit",
          color: settings.textColor,
          paddingTop: settings.paddingTop != null ? `${settings.paddingTop}px` : 0,
          paddingBottom: settings.paddingBottom != null ? `${settings.paddingBottom}px` : 0,
        }}
      >
        {isConstrained ? (
          <div className={`${alignClass} w-full`} style={{ maxWidth: settings.contentWidth }}>
            <PageBlockRenderer doc={doc} />
          </div>
        ) : (
          <PageBlockRenderer doc={doc} />
        )}
      </main>
    );
  }

  return (
    <main className="max-w-[800px] mx-auto my-10 font-sans">
      <h1>{title}</h1>
      {coverImage && (
        <div className="relative w-full overflow-hidden rounded-lg my-4 aspect-video">
          <MediaImage
            mediaId={coverImage.id}
            filename={getCanonicalFilename(coverImage)}
            alt={coverImage.alt ?? ""}
            fill
            sizes="(max-width: 768px) 100vw, 800px"
            className="object-cover"
            mimeType={coverImage.mimeType}
          />
        </div>
      )}
      <article>
        <ContentBody html={body} />
      </article>
    </main>
  );
}
