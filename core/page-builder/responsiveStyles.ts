/**
 * Responsive style helpers for Page Builder.
 * Produces base (desktop) inline style + optional CSS string for @media overrides (tablet/mobile).
 */

import type { CSSProperties } from "react";
import { BREAKPOINTS } from "./constants";

const TABLET_MAX = BREAKPOINTS.desktop - 1; // 1023
const MOBILE_MAX = BREAKPOINTS.tablet - 1;  // 767

function camelToKebab(s: string): string {
    return s.replace(/([A-Z])/g, "-$1").toLowerCase();
}

/** Convert React.CSSProperties-like object to CSS string (only primitives; px for numbers where appropriate). */
function styleToCss(style: CSSProperties): string {
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
    /** Base (desktop) inline style. */
    style: CSSProperties;
    /** CSS string for @media overrides, or null. Caller should render <style dangerouslySetInnerHTML={{ __html: styleContent }} /> when non-null. */
    styleContent: string | null;
}

/**
 * Returns base style for desktop and a CSS string that applies tablet/mobile overrides via
 * [data-pb-id="blockId"] selector inside media queries.
 * Mobile inherits from tablet (tablet values applied first, then mobile overrides).
 */
export function getResponsiveStyle(
    blockId: string,
    desktopStyle: React.CSSProperties,
    overrides: ResponsiveStyleOverrides | undefined
): GetResponsiveStyleResult {
    if (!overrides?.tablet && !overrides?.mobile) {
        return { style: desktopStyle, styleContent: null };
    }

    const selector = `[data-pb-id="${blockId}"]`;
    const parts: string[] = [];

    if (overrides.tablet && Object.keys(overrides.tablet).length > 0) {
        parts.push(`@media (max-width:${TABLET_MAX}px){${selector}{${styleToCss(overrides.tablet)}}}`);
    }
    if (overrides.mobile && Object.keys(overrides.mobile).length > 0) {
        parts.push(`@media (max-width:${MOBILE_MAX}px){${selector}{${styleToCss(overrides.mobile)}}}`);
    }

    if (parts.length === 0) {
        return { style: desktopStyle, styleContent: null };
    }

    return { style: desktopStyle, styleContent: parts.join("") };
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
