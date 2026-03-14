import { PageContent } from "@/core/PageContent";
import type { ResolvedPageContent } from "@/core/resolve";

export function renderHTML(title: string, body: string) {
  return `
  <!DOCTYPE html>
  <html lang="tr">
    <head>
      <meta charset="utf-8" />
      <title>${escapeHtml(title)}</title>
      <meta name="viewport" content="width=device-width, initial-scale=1" />
    </head>
    <body>
      <main class="max-w-[800px] mx-auto my-10 font-sans">
        <h1>${escapeHtml(title)}</h1>
        <article>${body}</article>
      </main>
    </body>
  </html>
  `;
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

/** Renders only the page content (main/body) as HTML string, no document wrapper. */
export async function renderPageContentToMarkup(
  page: ResolvedPageContent,
  options?: { forceFullWidth?: boolean }
): Promise<string> {
  if (page.builderMode && page.blocks) {
    const { createElement } = await import("react");
    const { renderToStaticMarkup } = await import("react-dom/server");
    let blocks = page.blocks;
    if (options?.forceFullWidth && typeof blocks === "object" && blocks !== null && "pageSettings" in blocks) {
      const doc = blocks as { pageSettings?: Record<string, unknown> };
      blocks = {
        ...doc,
        pageSettings: { ...doc.pageSettings, layoutPreset: "full-width" },
      };
    }
    return renderToStaticMarkup(
      createElement(PageContent, {
        title: page.title,
        body: page.body,
        coverImage: page.coverImage,
        builderMode: page.builderMode,
        blocks,
        compact: options?.forceFullWidth,
      })
    );
  }
  return `<main class="max-w-[800px] mx-auto my-10 font-sans">
        <h1>${escapeHtml(page.title)}</h1>
        <article>${page.body}</article>
      </main>`;
}

/**
 * Renders a resolved page to full HTML. Uses blocks + builderMode when set;
 * otherwise falls back to title + body (renderHTML).
 */
export async function renderPageToHTML(
  page: ResolvedPageContent
): Promise<string> {
  if (page.builderMode && page.blocks) {
    const bodyMarkup = await renderPageContentToMarkup(page);
    return `<!DOCTYPE html>
<html lang="tr">
  <head>
    <meta charset="utf-8" />
    <title>${escapeHtml(page.title)}</title>
    <meta name="viewport" content="width=device-width, initial-scale=1" />
  </head>
  <body>${bodyMarkup}</body>
</html>`;
  }
  return renderHTML(page.title, page.body);
}

