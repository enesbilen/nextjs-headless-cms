/**
 * Page Builder — shared constants.
 * Single source of truth for breakpoints, history size, and default device.
 */

import type { BuilderDevice } from "./types";

/** Breakpoint widths (min-width) for responsive behavior. */
export const BREAKPOINTS = {
    desktop: 1024,
    tablet: 768,
    mobile: 0,
} as const;

/** Max number of undo steps kept in history. */
export const HISTORY_MAX_SIZE = 50;

/** Default device when opening the builder. */
export const DEFAULT_DEVICE: BuilderDevice = "desktop";

/** Canvas width per device (for builder preview only). */
export const DEVICE_CANVAS_WIDTH: Record<BuilderDevice, string> = {
    desktop: "100%",
    tablet: "768px",
    mobile: "390px",
} as const;
