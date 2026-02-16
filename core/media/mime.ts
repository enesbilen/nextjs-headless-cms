import { fileTypeFromBuffer } from "file-type";

export const MAX_UPLOAD_BYTES = 5 * 1024 * 1024; // 5MB
export const MAX_SVG_BYTES = 1 * 1024 * 1024; // 1MB

const ALLOWED_MIMES = new Set([
  "image/jpeg",
  "image/png",
  "image/gif",
  "image/webp",
  "image/svg+xml",
]);

const DANGEROUS_EXTENSIONS = new Set([
  "exe",
  "bat",
  "cmd",
  "sh",
  "php",
  "phtml",
  "php3",
  "php4",
  "php5",
  "js",
  "jar",
  "vbs",
  "ws",
  "wsf",
  "ps1",
  "psm1",
]);

function isSvgCandidate(text: string): boolean {
  let trimmed = text.trimStart();
  // Skip optional XML declaration (e.g. <?xml version="1.0" encoding="UTF-8"?>)
  if (trimmed.startsWith("<?xml")) {
    const close = trimmed.indexOf("?>");
    if (close !== -1) trimmed = trimmed.slice(close + 2).trimStart();
  }
  if (!trimmed.toLowerCase().startsWith("<svg")) return false;
  if (!trimmed.toLowerCase().includes("<svg")) return false;
  if (!trimmed.includes('xmlns="http://www.w3.org/2000/svg"') && !trimmed.includes("xmlns='http://www.w3.org/2000/svg'")) return false;
  return true;
}

export type MimeCheckResult =
  | { ok: true; mime: string; ext: string }
  | { ok: false; reason: string };

/**
 * Detect real file type from buffer. Reject executables and unsupported types.
 * When file-type fails (e.g. text-based SVG), try UTF-8 decode and SVG signature check.
 */
export async function checkMimeAndExtension(
  buffer: Buffer
): Promise<MimeCheckResult> {
  let detected = await fileTypeFromBuffer(buffer);
  if (!detected) {
    const text = buffer.toString("utf-8");
    if (isSvgCandidate(text)) {
      return { ok: true, mime: "image/svg+xml", ext: "svg" };
    }
    return { ok: false, reason: "Could not detect file type" };
  }
  const ext = detected.ext.toLowerCase();
  if (DANGEROUS_EXTENSIONS.has(ext)) {
    return { ok: false, reason: "File type not allowed" };
  }
  if (!ALLOWED_MIMES.has(detected.mime)) {
    // SVG is often detected as application/xml when it starts with <?xml; allow by content
    const text = buffer.toString("utf-8");
    if (isSvgCandidate(text)) {
      return { ok: true, mime: "image/svg+xml", ext: "svg" };
    }
    return { ok: false, reason: "Unsupported file type" };
  }
  return { ok: true, mime: detected.mime, ext };
}

export function isImageMime(mime: string): boolean {
  return mime.startsWith("image/");
}
