import { MediaImage } from "@/core/media/MediaImage";
import { ContentBody } from "@/core/ContentBody";

type CoverImage = {
  id: string;
  filename: string;
  alt?: string | null;
  width?: number | null;
  height?: number | null;
  mimeType?: string | null;
};

/**
 * Same structure as renderHTML() in core/renderer.ts — used by app/page.tsx
 * and any React-rendered CMS page. Renders cover with MediaImage and body with
 * ContentBody (parses /media/ img tags into MediaImage).
 */
export function PageContent({
  title,
  body,
  coverImage,
}: {
  title: string;
  body: string;
  coverImage?: CoverImage | null;
}) {
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
            filename={coverImage.filename}
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
