/**
 * Sanitize SVG to prevent stored XSS. Removes script, foreignObject, iframe,
 * event handlers, javascript: links, and external URLs.
 * Throws if sanitization fails or dangerous content remains.
 */
const SCRIPT_REGEX = /<script\b[^>]*>[\s\S]*?<\/script\s*>/gi;
const FOREIGN_OBJECT_REGEX = /<foreignObject\b[^>]*>[\s\S]*?<\/foreignObject\s*>/gi;
const IFRAME_REGEX = /<iframe\b[^>]*>[\s\S]*?<\/iframe\s*>/gi;
const ON_EVENT_REGEX = /\s+on\w+\s*=\s*["'][^"']*["']/gi;
const HREF_JAVASCRIPT_REGEX = /\s+href\s*=\s*["']\s*javascript:[^"']*["']/gi;
const XLINK_HREF_JAVASCRIPT_REGEX = /\s+xlink:href\s*=\s*["']\s*javascript:[^"']*["']/gi;
const HREF_EXTERNAL_REGEX = /\s+href\s*=\s*["']https?:\/\/[^"']*["']/gi;
const XLINK_HREF_EXTERNAL_REGEX = /\s+xlink:href\s*=\s*["']https?:\/\/[^"']*["']/gi;

const SCRIPT_OPEN_REGEX = /<script\b/i;
const JAVASCRIPT_URL_REGEX = /javascript\s*:/i;
const EXTERNAL_HREF_REGEX = /(?:href|xlink:href)\s*=\s*["']https?:\/\//i;

export function sanitizeSvg(input: string): string {
  let out = input;
  out = out.replace(SCRIPT_REGEX, "");
  out = out.replace(FOREIGN_OBJECT_REGEX, "");
  out = out.replace(IFRAME_REGEX, "");
  out = out.replace(ON_EVENT_REGEX, "");
  out = out.replace(HREF_JAVASCRIPT_REGEX, "");
  out = out.replace(XLINK_HREF_JAVASCRIPT_REGEX, "");
  out = out.replace(HREF_EXTERNAL_REGEX, "");
  out = out.replace(XLINK_HREF_EXTERNAL_REGEX, "");

  if (SCRIPT_OPEN_REGEX.test(out)) {
    throw new Error("SVG rejected: script tag still present after sanitization");
  }
  if (JAVASCRIPT_URL_REGEX.test(out)) {
    throw new Error("SVG rejected: javascript: URL still present after sanitization");
  }
  if (EXTERNAL_HREF_REGEX.test(out)) {
    throw new Error("SVG rejected: external URL still present after sanitization");
  }

  return out;
}
