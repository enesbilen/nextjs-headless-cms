"use client";

import { useMemo } from "react";
import { MediaImage } from "@/core/media/MediaImage";

type Part =
  | { type: "html"; content: string }
  | { type: "media"; id: string; filename: string; alt: string };

const MEDIA_IMG_REGEX =
  /<img[^>]*src="\/media\/([^"/]+)\/([^"?]+)(?:\?[^"]*)?"[^>]*>/gi;

function parseBody(body: string): Part[] {
  const parts: Part[] = [];
  let lastIndex = 0;
  let match: RegExpExecArray | null;
  MEDIA_IMG_REGEX.lastIndex = 0;
  while ((match = MEDIA_IMG_REGEX.exec(body)) !== null) {
    const [full, id, filename] = match;
    const altMatch = full.match(/alt="([^"]*)"/i);
    const alt = altMatch ? altMatch[1] ?? "" : "";
    if (match.index > lastIndex) {
      parts.push({ type: "html", content: body.slice(lastIndex, match.index) });
    }
    parts.push({ type: "media", id, filename, alt });
    lastIndex = match.index + full.length;
  }
  if (lastIndex < body.length) {
    parts.push({ type: "html", content: body.slice(lastIndex) });
  }
  if (parts.length === 0) {
    parts.push({ type: "html", content: body });
  }
  return parts;
}

export function ContentBody({ html }: { html: string }) {
  const parts = useMemo(() => parseBody(html), [html]);
  return (
    <>
      {parts.map((part, i) => {
        if (part.type === "html") {
          return (
            <span
              key={i}
              dangerouslySetInnerHTML={{ __html: part.content }}
            />
          );
        }
        return (
          <span key={i} className="block relative w-full min-h-[120px] my-4">
            <MediaImage
              mediaId={part.id}
              filename={part.filename}
              alt={part.alt}
              fill
              sizes="(max-width: 768px) 100vw, 768px"
              className="object-contain"
            />
          </span>
        );
      })}
    </>
  );
}
