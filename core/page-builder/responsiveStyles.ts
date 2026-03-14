/**
 * Responsive style helpers for Page Builder.
 * ALL dynamic styles are output as scoped CSS via <style> tags — NO inline style attributes.
 * Uses [data-pb-id="blockId"] selector for scoping.
 */

import type { CSSProperties } from "react";
import { BREAKPOINTS } from "./constants";

const TABLET_MAX = BREAKPOINTS.desktop - 1; // 1023
const MOBILE_MAX = BREAKPOINTS.tablet - 1;  // 767

function camelToKebab(s: string): string {
    return s.replace(/([A-Z])/g, "-$1").toLowerCase();
}

/** Convert React.CSSProperties-like object to CSS string (only primitives; px for numbers where appropriate). */
export function styleToCss(style: CSSProperties): string {
    const lines: string[] = [];
    for (const [key, value] of Object.entries(style)) {
        if (value == null || value === "") continue;
        const kebab = camelToKebab(key);
        const v = typeof value === "number" && /width|height|padding|margin|top|bottom|left|right|gap|flexBasis|fontSize/.test(key)
            ? `${value}px`
            : String(value);
        lines.push(`${kebab}:${v}`);
    }
    return lines.join(";");
}

export type ResponsiveStyleOverrides = {
    tablet?: CSSProperties;
    mobile?: CSSProperties;
};

export interface GetResponsiveStyleResult {
    /** CSS string containing base + responsive rules. Render via <style dangerouslySetInnerHTML={{ __html: styleContent }} /> */
    styleContent: string | null;
}

/**
 * Returns scoped CSS string that includes:
 *  1. Base (desktop) styles as [data-pb-id] rule
 *  2. Tablet/mobile overrides inside @media queries
 * No inline styles are returned — everything goes through <style> tags.
 */
export function getResponsiveStyle(
    blockId: string,
    desktopStyle: React.CSSProperties,
    overrides: ResponsiveStyleOverrides | undefined
): GetResponsiveStyleResult {
    const selector = `[data-pb-id="${blockId}"]`;
    const parts: string[] = [];

    const baseCss = styleToCss(desktopStyle);
    if (baseCss) {
        parts.push(`${selector}{${baseCss}}`);
    }

    if (overrides?.tablet && Object.keys(overrides.tablet).length > 0) {
        parts.push(`@media (max-width:${TABLET_MAX}px){${selector}{${styleToCss(overrides.tablet)}}}`);
    }
    if (overrides?.mobile && Object.keys(overrides.mobile).length > 0) {
        parts.push(`@media (max-width:${MOBILE_MAX}px){${selector}{${styleToCss(overrides.mobile)}}}`);
    }

    return { styleContent: parts.length > 0 ? parts.join("") : null };
}

/** Build a single scoped CSS rule for [data-pb-id="blockId"]. Returns null if no styles. */
export function buildScopedCSS(blockId: string, styles: CSSProperties): string | null {
    const css = styleToCss(styles);
    if (!css) return null;
    return `[data-pb-id="${blockId}"]{${css}}`;
}

/** Build a scoped CSS rule with a nested/descendant selector. */
export function buildNestedCSS(blockId: string, childSelector: string, styles: CSSProperties): string | null {
    const css = styleToCss(styles);
    if (!css) return null;
    return `[data-pb-id="${blockId}"] ${childSelector}{${css}}`;
}

/**
 * Resolve effective value for a given device.
 * desktop → base; tablet → tabletOverride ?? base; mobile → mobileOverride ?? tabletOverride ?? base.
 */
export function getValueForDevice<T>(
    base: T,
    tabletOverride: T | undefined,
    mobileOverride: T | undefined,
    device: "desktop" | "tablet" | "mobile"
): T {
    if (device === "desktop") return base;
    if (device === "tablet") return tabletOverride !== undefined ? tabletOverride : base;
    return mobileOverride !== undefined ? mobileOverride : tabletOverride !== undefined ? tabletOverride : base;
}
