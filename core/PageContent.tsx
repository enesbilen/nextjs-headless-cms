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
 */
export function PageContent({
  title,
  body,
  coverImage,
  builderMode,
  blocks,
}: {
  title: string;
  body: string;
  coverImage?: CoverImage | null;
  builderMode?: boolean;
  blocks?: unknown;
}) {
  // Builder-mode: apply pageSettings to wrapper, then render blocks
  if (builderMode && blocks) {
    const doc = blocks as PageBuilderDoc;
    const settings: PageSettings = { ...DEFAULT_PAGE_SETTINGS, ...doc.pageSettings };
    const isConstrained = settings.layoutPreset === "boxed" || settings.layoutPreset === "narrow";

    return (
      <main
        style={{
          backgroundColor: settings.backgroundColor,
          backgroundImage: settings.backgroundImage ? `url(${settings.backgroundImage})` : undefined,
          backgroundSize: "cover",
          backgroundPosition: "center",
          fontFamily: settings.fontFamily ?? "inherit",
          color: settings.textColor,
          paddingTop: settings.paddingTop != null ? `${settings.paddingTop}px` : 0,
          paddingBottom: settings.paddingBottom != null ? `${settings.paddingBottom}px` : 0,
          minHeight: "100vh",
        }}
      >
        {isConstrained ? (
          <div style={{ maxWidth: settings.contentWidth, margin: "0 auto", width: "100%" }}>
            <PageBlockRenderer doc={doc} />
          </div>
        ) : (
          <PageBlockRenderer doc={doc} />
        )}
      </main>
    );
  }

  // Legacy HTML mode
  return (
    <main
      style={{
        maxWidth: "800px",
        margin: "40px auto",
        fontFamily: "sans-serif",
      }}
    >
      <h1>{title}</h1>
      {coverImage && (
        <div className="relative w-full overflow-hidden rounded-lg my-4" style={{ aspectRatio: "16/9" }}>
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
