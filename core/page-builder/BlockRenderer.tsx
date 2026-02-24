import React from "react";
import type {
    BlockInstance,
    PageBuilderDoc,
    HeadingProps,
    TextProps,
    ImageProps,
    ButtonProps,
    DividerProps,
    SpacerProps,
    SectionProps,
    ColumnsProps,
    HeroProps,
    CardProps,
    HtmlProps,
    VideoProps,
    TabsProps,
    AccordionProps,
    IconBoxProps,
} from "./types";
import { getResponsiveStyle } from "./responsiveStyles";
import { TabsBlock } from "./blocks/TabsBlock";

// ---------------------------------------------------------------------------
// Individual block renderers (pure, no client JS)
// ---------------------------------------------------------------------------

function renderHeading(p: HeadingProps, blockId: string) {
    const baseStyle: React.CSSProperties = {
        textAlign: p.align,
        color: p.color,
        fontWeight: p.fontWeight ?? "bold",
        fontSize: p.fontSize,
        margin: 0,
        lineHeight: 1.2,
    };
    const overrides = p.responsive
        ? {
              tablet: p.responsive.tablet
                  ? {
                      fontSize: p.responsive.tablet.fontSize,
                      textAlign: p.responsive.tablet.align,
                      color: p.responsive.tablet.color,
                    }
                  : undefined,
              mobile: p.responsive.mobile
                  ? {
                      fontSize: p.responsive.mobile.fontSize,
                      textAlign: p.responsive.mobile.align,
                      color: p.responsive.mobile.color,
                    }
                  : undefined,
          }
        : undefined;
    const { style, styleContent } = getResponsiveStyle(blockId, baseStyle, overrides);
    const Tag = `h${p.level}` as unknown as React.ElementType;
    return (
        <>
            {styleContent && <style dangerouslySetInnerHTML={{ __html: styleContent }} />}
            <Tag data-pb-id={blockId} style={style}>
                {p.text}
            </Tag>
        </>
    );
}

function renderText(p: TextProps, blockId: string) {
    const baseStyle: React.CSSProperties = {
        textAlign: p.align,
        color: p.color,
        fontSize: p.fontSize ?? "1rem",
        margin: 0,
        lineHeight: 1.6,
        whiteSpace: "pre-wrap",
    };
    const overrides = p.responsive
        ? {
              tablet: p.responsive.tablet
                  ? {
                      fontSize: p.responsive.tablet.fontSize,
                      textAlign: p.responsive.tablet.align,
                      color: p.responsive.tablet.color,
                    }
                  : undefined,
              mobile: p.responsive.mobile
                  ? {
                      fontSize: p.responsive.mobile.fontSize,
                      textAlign: p.responsive.mobile.align,
                      color: p.responsive.mobile.color,
                    }
                  : undefined,
          }
        : undefined;
    const { style, styleContent } = getResponsiveStyle(blockId, baseStyle, overrides);
    return (
        <>
            {styleContent && <style dangerouslySetInnerHTML={{ __html: styleContent }} />}
            <p data-pb-id={blockId} style={style}>
                {p.text}
            </p>
        </>
    );
}

function renderImage(p: ImageProps) {
    if (!p.src && !p.mediaId) {
        return (
            <div
                style={{
                    aspectRatio: p.aspectRatio ?? "16/9",
                    background: "#f3f4f6",
                    borderRadius: p.borderRadius,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "#9ca3af",
                    fontSize: "0.875rem",
                }}
            >
                Görsel seçilmedi
            </div>
        );
    }
    const src = p.src || `/media/${p.mediaId}`;
    return (
        <figure style={{ margin: 0 }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
                src={src}
                alt={p.alt}
                width={p.width}
                height={p.height}
                style={{
                    display: "block",
                    width: "100%",
                    objectFit: p.objectFit,
                    borderRadius: p.borderRadius,
                    aspectRatio: p.aspectRatio,
                }}
            />
            {p.caption && (
                <figcaption style={{ textAlign: "center", color: "#6b7280", fontSize: "0.875rem", marginTop: "0.5rem" }}>
                    {p.caption}
                </figcaption>
            )}
        </figure>
    );
}

function renderButton(p: ButtonProps, blockId: string) {
    const baseStyle: React.CSSProperties = {
        display: "inline-block",
        textDecoration: "none",
        cursor: "pointer",
        fontWeight: 600,
        borderRadius: p.borderRadius ?? "0.5rem",
        transition: "opacity 0.2s",
    };

    const sizeMap = {
        sm: { padding: "0.375rem 0.875rem", fontSize: "0.875rem" },
        md: { padding: "0.625rem 1.25rem", fontSize: "1rem" },
        lg: { padding: "0.875rem 1.75rem", fontSize: "1.125rem" },
    };

    const variantStyle: React.CSSProperties =
        p.variant === "primary"
            ? { background: p.backgroundColor ?? "#2563eb", color: p.textColor ?? "#fff", border: "none" }
            : p.variant === "secondary"
                ? { background: p.backgroundColor ?? "#e5e7eb", color: p.textColor ?? "#111827", border: "none" }
                : p.variant === "outline"
                    ? { background: "transparent", color: p.textColor ?? "#2563eb", border: `2px solid ${p.textColor ?? "#2563eb"}` }
                    : { background: "transparent", color: p.textColor ?? "#2563eb", border: "none" };

    const wrapperBaseStyle: React.CSSProperties = { textAlign: p.align };
    const overrides = p.responsive
        ? {
              tablet: p.responsive.tablet ? { textAlign: p.responsive.tablet.align } : undefined,
              mobile: p.responsive.mobile ? { textAlign: p.responsive.mobile.align } : undefined,
          }
        : undefined;
    const { style: wrapperStyle, styleContent } = getResponsiveStyle(blockId, wrapperBaseStyle, overrides);

    return (
        <>
            {styleContent && <style dangerouslySetInnerHTML={{ __html: styleContent }} />}
            <div data-pb-id={blockId} style={wrapperStyle}>
                <a
                    href={p.href}
                    target={p.openInNewTab ? "_blank" : undefined}
                    rel={p.openInNewTab ? "noopener noreferrer" : undefined}
                    style={{ ...baseStyle, ...variantStyle, ...sizeMap[p.size] }}
                >
                    {p.label}
                </a>
            </div>
        </>
    );
}

function renderDivider(p: DividerProps, blockId: string) {
    const baseStyle: React.CSSProperties = {
        border: "none",
        borderTop: `${p.thickness}px ${p.style} ${p.color}`,
        marginTop: `${p.marginTop}px`,
        marginBottom: `${p.marginBottom}px`,
    };
    const overrides = p.responsive
        ? {
              tablet:
                  p.responsive.tablet && (p.responsive.tablet.marginTop !== undefined || p.responsive.tablet.marginBottom !== undefined)
                      ? {
                          marginTop: p.responsive.tablet.marginTop != null ? `${p.responsive.tablet.marginTop}px` : undefined,
                          marginBottom: p.responsive.tablet.marginBottom != null ? `${p.responsive.tablet.marginBottom}px` : undefined,
                      }
                      : undefined,
              mobile:
                  p.responsive.mobile && (p.responsive.mobile.marginTop !== undefined || p.responsive.mobile.marginBottom !== undefined)
                      ? {
                          marginTop: p.responsive.mobile.marginTop != null ? `${p.responsive.mobile.marginTop}px` : undefined,
                          marginBottom: p.responsive.mobile.marginBottom != null ? `${p.responsive.mobile.marginBottom}px` : undefined,
                      }
                      : undefined,
          }
        : undefined;
    const { style, styleContent } = getResponsiveStyle(blockId, baseStyle, overrides);
    return (
        <>
            {styleContent && <style dangerouslySetInnerHTML={{ __html: styleContent }} />}
            <hr data-pb-id={blockId} style={style} />
        </>
    );
}

function renderSpacer(p: SpacerProps, blockId: string) {
    const baseStyle: React.CSSProperties = { height: `${p.height}px` };
    const overrides = p.responsive
        ? {
              tablet: p.responsive.tablet?.height != null ? { height: `${p.responsive.tablet.height}px` } : undefined,
              mobile: p.responsive.mobile?.height != null ? { height: `${p.responsive.mobile.height}px` } : undefined,
          }
        : undefined;
    const { style, styleContent } = getResponsiveStyle(blockId, baseStyle, overrides);
    return (
        <>
            {styleContent && <style dangerouslySetInnerHTML={{ __html: styleContent }} />}
            <div data-pb-id={blockId} style={style} aria-hidden="true" />
        </>
    );
}

function renderSection(p: SectionProps, children: BlockInstance[][], blockId: string) {
    const baseStyle: React.CSSProperties = {
        backgroundColor: p.backgroundColor,
        backgroundImage: p.backgroundImage ? `url(${p.backgroundImage})` : undefined,
        backgroundSize: "cover",
        backgroundPosition: "center",
        paddingTop: p.paddingTop,
        paddingBottom: p.paddingBottom,
        paddingLeft: p.paddingLeft,
        paddingRight: p.paddingRight,
    };
    const overrides = p.responsive
        ? {
              tablet:
                  p.responsive.tablet &&
                  (p.responsive.tablet.paddingTop !== undefined ||
                      p.responsive.tablet.paddingBottom !== undefined ||
                      p.responsive.tablet.paddingLeft !== undefined ||
                      p.responsive.tablet.paddingRight !== undefined)
                      ? {
                          paddingTop: p.responsive.tablet.paddingTop,
                          paddingBottom: p.responsive.tablet.paddingBottom,
                          paddingLeft: p.responsive.tablet.paddingLeft,
                          paddingRight: p.responsive.tablet.paddingRight,
                      }
                      : undefined,
              mobile:
                  p.responsive.mobile &&
                  (p.responsive.mobile.paddingTop !== undefined ||
                      p.responsive.mobile.paddingBottom !== undefined ||
                      p.responsive.mobile.paddingLeft !== undefined ||
                      p.responsive.mobile.paddingRight !== undefined)
                      ? {
                          paddingTop: p.responsive.mobile.paddingTop,
                          paddingBottom: p.responsive.mobile.paddingBottom,
                          paddingLeft: p.responsive.mobile.paddingLeft,
                          paddingRight: p.responsive.mobile.paddingRight,
                      }
                      : undefined,
          }
        : undefined;
    const { style, styleContent } = getResponsiveStyle(blockId, baseStyle, overrides);
    return (
        <>
            {styleContent && <style dangerouslySetInnerHTML={{ __html: styleContent }} />}
            <section data-pb-id={blockId} style={style}>
                <div
                    style={{
                        maxWidth: p.maxWidth ?? "1200px",
                        margin: "0 auto",
                        display: "flex",
                        flexDirection: "column",
                        gap: p.gap,
                    }}
                >
                    {(children[0] ?? []).map((b) => (
                        <BlockRenderer key={b.id} block={b} />
                    ))}
                </div>
            </section>
        </>
    );
}

function renderColumns(p: ColumnsProps, children: BlockInstance[][]) {
    const gap = `${p.gap}px`;
    const widths = p.columnWidths ?? Array(p.columns).fill("1fr");
    return (
        <div
            style={{
                backgroundColor: p.backgroundColor,
                paddingTop: p.paddingTop,
                paddingBottom: p.paddingBottom,
                display: "grid",
                gridTemplateColumns: widths.join(" "),
                gap,
                alignItems: p.verticalAlign,
            }}
        >
            {Array.from({ length: p.columns }).map((_, i) => (
                <div key={i} style={{ minWidth: 0 }}>
                    {(children[i] ?? []).map((b) => (
                        <BlockRenderer key={b.id} block={b} />
                    ))}
                </div>
            ))}
        </div>
    );
}

function renderHero(p: HeroProps, blockId: string) {
    const baseStyle: React.CSSProperties = {
        position: "relative",
        minHeight: p.height ?? "500px",
        display: "flex",
        alignItems: "center",
        justifyContent: p.align === "center" ? "center" : p.align === "right" ? "flex-end" : "flex-start",
        backgroundColor: p.backgroundColor,
        backgroundImage: p.backgroundImage ? `url(${p.backgroundImage})` : undefined,
        backgroundSize: "cover",
        backgroundPosition: "center",
        textAlign: p.align,
        color: p.textColor,
        padding: "4rem 2rem",
    };
    const overrides = p.responsive
        ? {
              tablet: p.responsive.tablet?.align ? { justifyContent: p.responsive.tablet.align === "center" ? "center" : p.responsive.tablet.align === "right" ? "flex-end" : "flex-start", textAlign: p.responsive.tablet.align } : undefined,
              mobile: p.responsive.mobile?.align ? { justifyContent: p.responsive.mobile.align === "center" ? "center" : p.responsive.mobile.align === "right" ? "flex-end" : "flex-start", textAlign: p.responsive.mobile.align } : undefined,
          }
        : undefined;
    const { style, styleContent } = getResponsiveStyle(blockId, baseStyle, overrides);
    return (
        <>
            {styleContent && <style dangerouslySetInnerHTML={{ __html: styleContent }} />}
            <section data-pb-id={blockId} style={style}>
            {p.backgroundImage && (
                <div
                    style={{
                        position: "absolute",
                        inset: 0,
                        backgroundColor: `rgba(0,0,0,${p.overlayOpacity ?? 0.5})`,
                    }}
                    aria-hidden="true"
                />
            )}
            <div style={{ position: "relative", zIndex: 1, maxWidth: "800px" }}>
                <h1 style={{ margin: "0 0 1rem", fontSize: "clamp(2rem, 5vw, 3.5rem)", fontWeight: 800, lineHeight: 1.1, color: p.textColor }}>
                    {p.heading}
                </h1>
                {p.subheading && (
                    <p style={{ margin: "0 0 2rem", fontSize: "1.25rem", opacity: 0.85, color: p.textColor }}>
                        {p.subheading}
                    </p>
                )}
                {p.buttonLabel && (
                    <a
                        href={p.buttonHref}
                        style={{
                            display: "inline-block",
                            padding: "0.875rem 2rem",
                            background: "#fff",
                            color: p.backgroundColor,
                            fontWeight: 700,
                            borderRadius: "0.5rem",
                            textDecoration: "none",
                            fontSize: "1rem",
                        }}
                    >
                        {p.buttonLabel}
                    </a>
                )}
            </div>
        </section>
        </>
    );
}

function renderCard(p: CardProps) {
    return (
        <div
            style={{
                backgroundColor: p.backgroundColor,
                borderRadius: p.borderRadius,
                overflow: "hidden",
                boxShadow: p.shadow ? "0 4px 24px rgba(0,0,0,0.08)" : undefined,
            }}
        >
            {(p.imageSrc || p.imageMediaId) && (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                    src={p.imageSrc || `/media/${p.imageMediaId}`}
                    alt={p.title}
                    style={{ width: "100%", aspectRatio: "16/9", objectFit: "cover", display: "block" }}
                />
            )}
            <div style={{ padding: "1.5rem" }}>
                <h3 style={{ margin: "0 0 0.5rem", fontSize: "1.25rem", fontWeight: 700 }}>{p.title}</h3>
                <p style={{ margin: "0 0 1rem", color: "#6b7280", lineHeight: 1.6 }}>{p.description}</p>
                {p.buttonLabel && (
                    <a
                        href={p.buttonHref ?? "#"}
                        style={{
                            display: "inline-block",
                            padding: "0.5rem 1rem",
                            background: "#2563eb",
                            color: "#fff",
                            borderRadius: "0.375rem",
                            textDecoration: "none",
                            fontWeight: 600,
                            fontSize: "0.875rem",
                        }}
                    >
                        {p.buttonLabel}
                    </a>
                )}
            </div>
        </div>
    );
}

function renderHtml(p: HtmlProps) {
    // Raw HTML — SSR only
    return <div dangerouslySetInnerHTML={{ __html: p.html }} />;
}

function renderVideo(p: VideoProps) {
    // YouTube/Vimeo embed detection
    const isYoutube = p.url.includes("youtube.com") || p.url.includes("youtu.be");
    const isVimeo = p.url.includes("vimeo.com");

    if (isYoutube || isVimeo) {
        let embedSrc = p.url;
        if (isYoutube) {
            const id = p.url.match(/(?:v=|youtu\.be\/)([^&?\/]+)/)?.[1];
            if (id) {
                embedSrc = `https://www.youtube.com/embed/${id}?${p.autoplay ? "autoplay=1&" : ""}${p.controls ? "" : "controls=0&"}${p.loop ? `loop=1&playlist=${id}` : ""}`;
            }
        } else if (isVimeo) {
            const id = p.url.match(/vimeo\.com\/([0-9]+)/)?.[1];
            if (id) embedSrc = `https://player.vimeo.com/video/${id}?${p.autoplay ? "autoplay=1&" : ""}${p.loop ? "loop=1&" : ""}`;
        }
        return (
            <div style={{ position: "relative", paddingBottom: p.aspectRatio === "4/3" ? "75%" : p.aspectRatio === "1/1" ? "100%" : "56.25%", height: 0 }}>
                <iframe
                    src={embedSrc}
                    style={{ position: "absolute", inset: 0, width: "100%", height: "100%", border: 0 }}
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                    title="Video"
                />
            </div>
        );
    }

    return (
        <video
            src={p.url}
            autoPlay={p.autoplay}
            muted={p.muted}
            loop={p.loop}
            controls={p.controls}
            style={{ width: "100%", display: "block", aspectRatio: p.aspectRatio }}
        />
    );
}

function renderTabs(p: TabsProps, blockId: string) {
    return (
        <TabsBlock
            blockId={blockId}
            tabs={p.tabs}
            defaultTabIndex={p.defaultTabIndex ?? 0}
        />
    );
}

function renderAccordion(p: AccordionProps, blockId: string) {
    if (!p.items?.length) {
        return <div data-pb-id={blockId} style={{ padding: "1rem", background: "#f3f4f6", borderRadius: "8px", color: "#6b7280" }}>Öğe yok</div>;
    }
    return (
        <div data-pb-id={blockId} style={{ border: "1px solid #e5e7eb", borderRadius: "8px", overflow: "hidden" }}>
            {p.items.map((item, i) => (
                <details
                    key={i}
                    open={item.open}
                    style={{ borderBottom: i < p.items.length - 1 ? "1px solid #e5e7eb" : undefined }}
                >
                    <summary style={{ padding: "0.75rem 1rem", cursor: "pointer", fontWeight: 600, listStyle: "none", background: "#f9fafb" }}>
                        <span style={{ marginRight: "0.5rem" }}>▾</span>
                        {item.title}
                    </summary>
                    <div style={{ padding: "1rem 1rem 1rem 2rem", background: "#fff", whiteSpace: "pre-wrap", lineHeight: 1.6, color: "#374151" }}>
                        {item.content}
                    </div>
                </details>
            ))}
        </div>
    );
}

function renderIconBox(p: IconBoxProps, blockId: string) {
    const align = p.align ?? "left";
    const textAlign = align === "center" ? "center" : align === "right" ? "right" : "left";
    return (
        <div
            data-pb-id={blockId}
            style={{
                padding: "1.25rem",
                textAlign: textAlign as React.CSSProperties["textAlign"],
                maxWidth: "400px",
            }}
        >
            <div style={{ fontSize: "2rem", lineHeight: 1, marginBottom: "0.75rem", color: p.iconColor ?? "#2563eb" }}>
                {p.icon || "◇"}
            </div>
            <h3 style={{ margin: "0 0 0.5rem", fontSize: "1.25rem", fontWeight: 700, color: p.titleColor ?? "#111827" }}>
                {p.title}
            </h3>
            <p style={{ margin: 0, fontSize: "0.95rem", lineHeight: 1.6, color: p.textColor ?? "#4b5563" }}>
                {p.text}
            </p>
        </div>
    );
}

// ---------------------------------------------------------------------------
// Main recursive renderer
// ---------------------------------------------------------------------------

function visibilityDataAttrs(visibility: BlockInstance["visibility"]): Record<string, string> {
    const attrs: Record<string, string> = {};
    if (visibility?.hideOnDesktop) attrs["data-pb-hide-desktop"] = "true";
    if (visibility?.hideOnTablet) attrs["data-pb-hide-tablet"] = "true";
    if (visibility?.hideOnMobile) attrs["data-pb-hide-mobile"] = "true";
    return attrs;
}

export function BlockRenderer({ block }: { block: BlockInstance }) {
    const { type, props, children = [], id, visibility } = block;
    const visAttrs = visibilityDataAttrs(visibility);
    const hasVisibility = Object.keys(visAttrs).length > 0;

    let content: React.ReactNode;
    switch (type) {
        case "heading":
            content = renderHeading(props as HeadingProps, id);
            break;
        case "text":
            content = renderText(props as TextProps, id);
            break;
        case "image":
            content = renderImage(props as ImageProps);
            break;
        case "button":
            content = renderButton(props as ButtonProps, id);
            break;
        case "divider":
            content = renderDivider(props as DividerProps, id);
            break;
        case "spacer":
            content = renderSpacer(props as SpacerProps, id);
            break;
        case "section":
            content = renderSection(props as SectionProps, children, id);
            break;
        case "columns-2":
        case "columns-3":
            content = renderColumns(props as ColumnsProps, children);
            break;
        case "hero":
            content = renderHero(props as HeroProps, id);
            break;
        case "card":
            content = renderCard(props as CardProps);
            break;
        case "html":
            content = renderHtml(props as HtmlProps);
            break;
        case "video":
            content = renderVideo(props as VideoProps);
            break;
        case "tabs":
            content = renderTabs(props as TabsProps, id);
            break;
        case "accordion":
            content = renderAccordion(props as AccordionProps, id);
            break;
        case "icon-box":
            content = renderIconBox(props as IconBoxProps, id);
            break;
        default:
            content = null;
    }

    if (hasVisibility) {
        return (
            <div {...visAttrs} style={{ display: "contents" }}>
                {content}
            </div>
        );
    }
    return <>{content}</>;
}

// ---------------------------------------------------------------------------
// Page-level renderer – iterates root blocks
// ---------------------------------------------------------------------------

const VISIBILITY_STYLES = `
@media (min-width: 1024px){ [data-pb-hide-desktop]{ display: none !important; } }
@media (min-width: 768px) and (max-width: 1023px){ [data-pb-hide-tablet]{ display: none !important; } }
@media (max-width: 767px){ [data-pb-hide-mobile]{ display: none !important; } }
`;

export function PageBlockRenderer({ doc }: { doc: PageBuilderDoc }) {
    return (
        <>
            <style dangerouslySetInnerHTML={{ __html: VISIBILITY_STYLES }} />
            {doc.blocks.map((block) => (
                <BlockRenderer key={block.id} block={block} />
            ))}
        </>
    );
}
