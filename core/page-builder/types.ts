// =============================================================================
// PAGE BUILDER — Core Type System
// =============================================================================

export type BuilderDevice = "desktop" | "tablet" | "mobile";

/**
 * Responsive overrides: optional per-breakpoint values.
 * When a value is omitted for tablet/mobile, inherit from the next larger breakpoint (desktop as base).
 */
export type ResponsiveOverrides<T> = {
    tablet?: Partial<T>;
    mobile?: Partial<T>;
};

/** All available block types in the builder */
export type BlockType =
    | "section"
    | "columns-2"
    | "columns-3"
    | "heading"
    | "text"
    | "image"
    | "button"
    | "divider"
    | "spacer"
    | "hero"
    | "card"
    | "html"
    | "video";

// ---------------------------------------------------------------------------
// Per-block prop shapes
// ---------------------------------------------------------------------------

export type AlignValue = "left" | "center" | "right";

/** Base heading props (desktop). Responsive overrides applied in Faz 2. */
export interface HeadingProps {
    text: string;
    level: 1 | 2 | 3 | 4 | 5 | 6;
    align: AlignValue;
    color: string;
    fontSize?: string;
    fontWeight?: "normal" | "semibold" | "bold" | "extrabold";
    /** Optional per-breakpoint overrides (tablet, mobile). Keys: fontSize, align, color. */
    responsive?: ResponsiveOverrides<{ fontSize?: string; align?: AlignValue; color?: string }>;
}

export interface TextProps {
    text: string;
    align: AlignValue;
    color: string;
    fontSize?: string;
}

export interface ImageProps {
    mediaId?: string;
    src?: string;
    alt: string;
    width?: number;
    height?: number;
    objectFit: "cover" | "contain" | "fill";
    borderRadius: string;
    aspectRatio?: string;
    caption?: string;
}

export interface ButtonProps {
    label: string;
    href: string;
    variant: "primary" | "secondary" | "outline" | "ghost";
    size: "sm" | "md" | "lg";
    align: AlignValue;
    openInNewTab: boolean;
    backgroundColor?: string;
    textColor?: string;
    borderRadius?: string;
}

export interface DividerProps {
    color: string;
    thickness: number;
    style: "solid" | "dashed" | "dotted";
    marginTop: number;
    marginBottom: number;
}

export interface SpacerProps {
    height: number;
}

export interface SectionProps {
    backgroundColor: string;
    backgroundImage?: string;
    paddingTop: number;
    paddingBottom: number;
    paddingLeft: number;
    paddingRight: number;
    /** Max-width of the section's outer wrapper */
    maxWidth?: string;
    /** Max-width of the inner content container (for full-bleed bg + constrained content) */
    innerMaxWidth?: string;
    gap: number;
}

/** Per-column individual style overrides */
export interface ColumnSettings {
    backgroundColor?: string;
    paddingTop?: number;
    paddingBottom?: number;
    paddingLeft?: number;
    paddingRight?: number;
    verticalAlign?: "start" | "center" | "end";
    borderRadius?: string;
}

export interface ColumnsProps {
    columns: number; // 2 or 3
    gap: number;
    verticalAlign: "start" | "center" | "end";
    columnWidths?: string[]; // e.g. ["1fr", "2fr"] for 2-col
    backgroundColor: string;
    paddingTop: number;
    paddingBottom: number;
    paddingLeft?: number;
    paddingRight?: number;
    /** Per-column individual overrides */
    columnSettings?: ColumnSettings[];
}

export interface HeroProps {
    heading: string;
    subheading: string;
    buttonLabel: string;
    buttonHref: string;
    backgroundImage?: string;
    backgroundColor: string;
    textColor: string;
    align: AlignValue;
    height?: string;
    overlayOpacity?: number;
}

export interface CardProps {
    title: string;
    description: string;
    imageMediaId?: string;
    imageSrc?: string;
    buttonLabel?: string;
    buttonHref?: string;
    backgroundColor: string;
    borderRadius: string;
    shadow: boolean;
}

export interface HtmlProps {
    html: string;
}

export interface VideoProps {
    url: string;
    autoplay: boolean;
    muted: boolean;
    loop: boolean;
    controls: boolean;
    aspectRatio: "16/9" | "4/3" | "1/1";
}

// ---------------------------------------------------------------------------
// Union type for all block props
// ---------------------------------------------------------------------------

export type BlockProps =
    | HeadingProps
    | TextProps
    | ImageProps
    | ButtonProps
    | DividerProps
    | SpacerProps
    | SectionProps
    | ColumnsProps
    | HeroProps
    | CardProps
    | HtmlProps
    | VideoProps;

// ---------------------------------------------------------------------------
// Block Instance (the node in the tree)
// ---------------------------------------------------------------------------

export interface BlockInstance {
    id: string;
    type: BlockType;
    props: BlockProps;
    /** Child blocks for layout containers (section, columns-2, columns-3) */
    children?: BlockInstance[][];
}

// ---------------------------------------------------------------------------
// Page-level global settings
// ---------------------------------------------------------------------------

/** Layout preset — controls how the page canvas renders */
export type PageLayoutPreset =
    | "full-width"   // Each section spans 100% viewport width
    | "boxed"        // Entire page constrained to contentWidth
    | "narrow";      // Narrow centered column

export interface PageSettings {
    layoutPreset: PageLayoutPreset;
    /** Outer content max-width (e.g. "1200px", "100%") */
    contentWidth: string;
    backgroundColor: string;
    backgroundImage?: string;
    fontFamily?: string;
    textColor?: string;
    paddingTop?: number;
    paddingBottom?: number;
    hideScrollbar?: boolean;
}

export const DEFAULT_PAGE_SETTINGS: PageSettings = {
    layoutPreset: "boxed",
    contentWidth: "1200px",
    backgroundColor: "#ffffff",
    fontFamily: "inherit",
    textColor: "#111827",
    paddingTop: 0,
    paddingBottom: 0,
};

// ---------------------------------------------------------------------------
// Root document stored as JSON in Page.blocks
// ---------------------------------------------------------------------------

export interface PageBuilderDoc {
    version: 1;
    blocks: BlockInstance[];
    pageSettings?: PageSettings;
}

// ---------------------------------------------------------------------------
// Builder history entry for undo/redo
// ---------------------------------------------------------------------------

export interface BuilderHistoryEntry {
    blocks: BlockInstance[];
}
