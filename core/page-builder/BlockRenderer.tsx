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
} from "./types";

// ---------------------------------------------------------------------------
// Individual block renderers (pure, no client JS)
// ---------------------------------------------------------------------------

function renderHeading(p: HeadingProps) {
    const Tag = `h${p.level}` as unknown as React.ElementType;
    return (
        <Tag
            style={{
                textAlign: p.align,
                color: p.color,
                fontWeight: p.fontWeight ?? "bold",
                fontSize: p.fontSize,
                margin: 0,
                lineHeight: 1.2,
            }}
        >
            {p.text}
        </Tag>
    );
}

function renderText(p: TextProps) {
    return (
        <p
            style={{
                textAlign: p.align,
                color: p.color,
                fontSize: p.fontSize ?? "1rem",
                margin: 0,
                lineHeight: 1.6,
                whiteSpace: "pre-wrap",
            }}
        >
            {p.text}
        </p>
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

function renderButton(p: ButtonProps) {
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

    return (
        <div style={{ textAlign: p.align }}>
            <a
                href={p.href}
                target={p.openInNewTab ? "_blank" : undefined}
                rel={p.openInNewTab ? "noopener noreferrer" : undefined}
                style={{ ...baseStyle, ...variantStyle, ...sizeMap[p.size] }}
            >
                {p.label}
            </a>
        </div>
    );
}

function renderDivider(p: DividerProps) {
    return (
        <hr
            style={{
                border: "none",
                borderTop: `${p.thickness}px ${p.style} ${p.color}`,
                marginTop: `${p.marginTop}px`,
                marginBottom: `${p.marginBottom}px`,
            }}
        />
    );
}

function renderSpacer(p: SpacerProps) {
    return <div style={{ height: `${p.height}px` }} aria-hidden="true" />;
}

function renderSection(p: SectionProps, children: BlockInstance[][]) {
    return (
        <section
            style={{
                backgroundColor: p.backgroundColor,
                backgroundImage: p.backgroundImage ? `url(${p.backgroundImage})` : undefined,
                backgroundSize: "cover",
                backgroundPosition: "center",
                paddingTop: p.paddingTop,
                paddingBottom: p.paddingBottom,
                paddingLeft: p.paddingLeft,
                paddingRight: p.paddingRight,
            }}
        >
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

function renderHero(p: HeroProps) {
    return (
        <section
            style={{
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
            }}
        >
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

// ---------------------------------------------------------------------------
// Main recursive renderer
// ---------------------------------------------------------------------------

export function BlockRenderer({ block }: { block: BlockInstance }) {
    const { type, props, children = [] } = block;

    switch (type) {
        case "heading":
            return renderHeading(props as HeadingProps);
        case "text":
            return renderText(props as TextProps);
        case "image":
            return renderImage(props as ImageProps);
        case "button":
            return renderButton(props as ButtonProps);
        case "divider":
            return renderDivider(props as DividerProps);
        case "spacer":
            return renderSpacer(props as SpacerProps);
        case "section":
            return renderSection(props as SectionProps, children);
        case "columns-2":
        case "columns-3":
            return renderColumns(props as ColumnsProps, children);
        case "hero":
            return renderHero(props as HeroProps);
        case "card":
            return renderCard(props as CardProps);
        case "html":
            return renderHtml(props as HtmlProps);
        case "video":
            return renderVideo(props as VideoProps);
        default:
            return null;
    }
}

// ---------------------------------------------------------------------------
// Page-level renderer – iterates root blocks
// ---------------------------------------------------------------------------

export function PageBlockRenderer({ doc }: { doc: PageBuilderDoc }) {
    return (
        <>
            {doc.blocks.map((block) => (
                <BlockRenderer key={block.id} block={block} />
            ))}
        </>
    );
}
