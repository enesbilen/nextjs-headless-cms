import React, { Suspense } from "react";
import type {
    BlockInstance,
    PageBuilderDoc,
    AdvancedStyle,
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
    ListProps,
    QuoteProps,
    SocialLinksProps,
    AlertProps,
    TestimonialProps,
    CounterProps,
    GalleryProps,
    MapProps,
    FormProps,
    ProgressBarProps,
    NavigationMenuProps,
    BreadcrumbProps,
} from "./types";
import { getResponsiveStyle, buildScopedCSS, buildNestedCSS, styleToCss } from "./responsiveStyles";
import { TabsBlock } from "./blocks/TabsBlock";
import { NavigationMenuBlock } from "./blocks/NavigationMenuBlock";
import { BreadcrumbBlock } from "./blocks/BreadcrumbBlock";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function ensureCSSUnit(value: string | undefined, defaultUnit = "px"): string | undefined {
    if (!value) return undefined;
    const trimmed = value.trim();
    if (/^-?[\d.]+$/.test(trimmed)) return `${trimmed}${defaultUnit}`;
    return trimmed;
}

/** Render one or more CSS rule strings as a single <style> tag. Returns null when empty. */
function ScopedStyle({ css }: { css: (string | null | undefined)[] }) {
    const merged = css.filter(Boolean).join("");
    if (!merged) return null;
    return <style dangerouslySetInnerHTML={{ __html: merged }} />;
}

// ---------------------------------------------------------------------------
// Tailwind-first: map known values to classes
// ---------------------------------------------------------------------------

const TEXT_ALIGN_CLASS: Record<string, string> = {
    left: "text-left", center: "text-center", right: "text-right",
};
const ALIGN_ITEMS_CLASS: Record<string, string> = {
    start: "items-start", center: "items-center", end: "items-end",
};
const OBJECT_FIT_CLASS: Record<string, string> = {
    cover: "object-cover", contain: "object-contain", fill: "object-fill",
};
const OVERFLOW_CLASS: Record<string, string> = {
    visible: "overflow-visible", hidden: "overflow-hidden", auto: "overflow-auto", scroll: "overflow-scroll",
};
const JUSTIFY_CONTENT_CLASS: Record<string, string> = {
    left: "justify-start", center: "justify-center", right: "justify-end",
    start: "justify-start", end: "justify-end",
    "flex-start": "justify-start", "flex-end": "justify-end",
};
const FONT_WEIGHT_CLASS: Record<string, string> = {
    normal: "font-normal", semibold: "font-semibold", bold: "font-bold", extrabold: "font-extrabold",
};

// ---------------------------------------------------------------------------
// Individual block renderers — Tailwind classes + scoped <style> only, NO inline style
// ---------------------------------------------------------------------------

function renderHeading(p: HeadingProps, blockId: string) {
    const dynamicStyle: React.CSSProperties = { color: p.color, fontSize: p.fontSize };
    const alignClass = TEXT_ALIGN_CLASS[p.align] ?? "text-left";
    const overrides = p.responsive
        ? {
              tablet: p.responsive.tablet
                  ? { fontSize: p.responsive.tablet.fontSize, textAlign: p.responsive.tablet.align, color: p.responsive.tablet.color }
                  : undefined,
              mobile: p.responsive.mobile
                  ? { fontSize: p.responsive.mobile.fontSize, textAlign: p.responsive.mobile.align, color: p.responsive.mobile.color }
                  : undefined,
          }
        : undefined;
    const { styleContent } = getResponsiveStyle(blockId, dynamicStyle, overrides);
    const Tag = `h${p.level}` as unknown as React.ElementType;
    const fwClass = FONT_WEIGHT_CLASS[p.fontWeight ?? "bold"] ?? "font-bold";
    return (
        <>
            <ScopedStyle css={[styleContent]} />
            <Tag data-pb-id={blockId} className={`m-0 leading-[1.2] ${fwClass} ${alignClass}`}>
                {p.text}
            </Tag>
        </>
    );
}

function renderText(p: TextProps, blockId: string) {
    const dynamicStyle: React.CSSProperties = { color: p.color, fontSize: p.fontSize ?? "1rem" };
    const alignClass = TEXT_ALIGN_CLASS[p.align] ?? "text-left";
    const overrides = p.responsive
        ? {
              tablet: p.responsive.tablet
                  ? { fontSize: p.responsive.tablet.fontSize, textAlign: p.responsive.tablet.align, color: p.responsive.tablet.color }
                  : undefined,
              mobile: p.responsive.mobile
                  ? { fontSize: p.responsive.mobile.fontSize, textAlign: p.responsive.mobile.align, color: p.responsive.mobile.color }
                  : undefined,
          }
        : undefined;
    const { styleContent } = getResponsiveStyle(blockId, dynamicStyle, overrides);
    return (
        <>
            <ScopedStyle css={[styleContent]} />
            <p data-pb-id={blockId} className={`m-0 leading-[1.6] whitespace-pre-wrap ${alignClass}`}>
                {p.text}
            </p>
        </>
    );
}

function renderImage(p: ImageProps, blockId: string) {
    const fitClass = OBJECT_FIT_CLASS[p.objectFit] ?? "object-cover";
    const aspectClass = p.aspectRatio === "16/9" ? "aspect-video" : p.aspectRatio === "1/1" ? "aspect-square" : "";

    if (!p.src && !p.mediaId) {
        const placeholderCSS: React.CSSProperties = {};
        if (!aspectClass && p.aspectRatio) placeholderCSS.aspectRatio = p.aspectRatio;
        if (p.borderRadius && p.borderRadius !== "0px" && p.borderRadius !== "0") placeholderCSS.borderRadius = p.borderRadius;
        return (
            <>
                <ScopedStyle css={[buildScopedCSS(blockId, placeholderCSS)]} />
                <div data-pb-id={blockId} className={`flex items-center justify-center bg-gray-100 text-gray-400 text-sm ${aspectClass}`.trim()}>
                    Görsel seçilmedi
                </div>
            </>
        );
    }
    const src = p.src || `/media/${p.mediaId}`;
    const imgCSS: React.CSSProperties = {};
    if (p.borderRadius && p.borderRadius !== "0px" && p.borderRadius !== "0") imgCSS.borderRadius = p.borderRadius;
    if (!aspectClass && p.aspectRatio) imgCSS.aspectRatio = p.aspectRatio;

    return (
        <>
            <ScopedStyle css={[buildNestedCSS(blockId, "img", imgCSS)]} />
            <figure data-pb-id={blockId} className="m-0">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                    src={src}
                    alt={p.alt}
                    width={p.width}
                    height={p.height}
                    className={`block w-full ${fitClass} ${aspectClass}`.trim()}
                />
                {p.caption && (
                    <figcaption className="text-center text-gray-500 text-sm mt-2">{p.caption}</figcaption>
                )}
            </figure>
        </>
    );
}

function renderButton(p: ButtonProps, blockId: string) {
    const sizeClass =
        p.size === "sm" ? "py-1.5 px-3.5 text-sm" :
        p.size === "lg" ? "py-3.5 px-7 text-lg" :
        "py-2.5 px-5 text-base";

    const variantCSS: React.CSSProperties =
        p.variant === "primary"
            ? { background: p.backgroundColor ?? "#2563eb", color: p.textColor ?? "#fff" }
            : p.variant === "secondary"
                ? { background: p.backgroundColor ?? "#e5e7eb", color: p.textColor ?? "#111827" }
                : p.variant === "outline"
                    ? { background: "transparent", color: p.textColor ?? "#2563eb", border: `2px solid ${p.textColor ?? "#2563eb"}` }
                    : { background: "transparent", color: p.textColor ?? "#2563eb" };

    const wrapperBase: React.CSSProperties = { textAlign: p.align };
    const overrides = p.responsive
        ? {
              tablet: p.responsive.tablet ? { textAlign: p.responsive.tablet.align } : undefined,
              mobile: p.responsive.mobile ? { textAlign: p.responsive.mobile.align } : undefined,
          }
        : undefined;
    const { styleContent } = getResponsiveStyle(blockId, wrapperBase, overrides);
    const btnCSS = buildNestedCSS(blockId, "> a", { borderRadius: p.borderRadius ?? "0.5rem", ...variantCSS });

    return (
        <>
            <ScopedStyle css={[styleContent, btnCSS]} />
            <div data-pb-id={blockId}>
                <a
                    href={p.href}
                    target={p.openInNewTab ? "_blank" : undefined}
                    rel={p.openInNewTab ? "noopener noreferrer" : undefined}
                    className={`inline-block no-underline cursor-pointer font-semibold transition-opacity duration-200 ${sizeClass}`}
                >
                    {p.label}
                </a>
            </div>
        </>
    );
}

function renderDivider(p: DividerProps, blockId: string) {
    const baseStyle: React.CSSProperties = {
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
    const { styleContent } = getResponsiveStyle(blockId, baseStyle, overrides);
    return (
        <>
            <ScopedStyle css={[styleContent]} />
            <hr data-pb-id={blockId} className="border-none" />
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
    const { styleContent } = getResponsiveStyle(blockId, baseStyle, overrides);
    return (
        <>
            <ScopedStyle css={[styleContent]} />
            <div data-pb-id={blockId} aria-hidden="true" />
        </>
    );
}

function renderSection(p: SectionProps, children: BlockInstance[][], blockId: string) {
    const outerMaxWidth = p.maxWidth ?? "1200px";
    const isFullWidth = outerMaxWidth === "100%";

    const dynamicStyle: React.CSSProperties = { maxWidth: outerMaxWidth };
    if (p.backgroundColor && p.backgroundColor !== "transparent") dynamicStyle.backgroundColor = p.backgroundColor;
    if (p.backgroundImage) dynamicStyle.backgroundImage = `url(${p.backgroundImage})`;
    if (p.paddingTop) dynamicStyle.paddingTop = p.paddingTop;
    if (p.paddingBottom) dynamicStyle.paddingBottom = p.paddingBottom;
    if (p.paddingLeft) dynamicStyle.paddingLeft = p.paddingLeft;
    if (p.paddingRight) dynamicStyle.paddingRight = p.paddingRight;

    const overrides = p.responsive
        ? {
              tablet:
                  p.responsive.tablet &&
                  (p.responsive.tablet.paddingTop !== undefined || p.responsive.tablet.paddingBottom !== undefined ||
                   p.responsive.tablet.paddingLeft !== undefined || p.responsive.tablet.paddingRight !== undefined)
                      ? {
                          paddingTop: p.responsive.tablet.paddingTop,
                          paddingBottom: p.responsive.tablet.paddingBottom,
                          paddingLeft: p.responsive.tablet.paddingLeft,
                          paddingRight: p.responsive.tablet.paddingRight,
                      }
                      : undefined,
              mobile:
                  p.responsive.mobile &&
                  (p.responsive.mobile.paddingTop !== undefined || p.responsive.mobile.paddingBottom !== undefined ||
                   p.responsive.mobile.paddingLeft !== undefined || p.responsive.mobile.paddingRight !== undefined)
                      ? {
                          paddingTop: p.responsive.mobile.paddingTop,
                          paddingBottom: p.responsive.mobile.paddingBottom,
                          paddingLeft: p.responsive.mobile.paddingLeft,
                          paddingRight: p.responsive.mobile.paddingRight,
                      }
                      : undefined,
          }
        : undefined;
    const { styleContent } = getResponsiveStyle(blockId, dynamicStyle, overrides);

    const sectionClasses = ["bg-cover bg-center w-full", !isFullWidth ? "mx-auto" : ""].filter(Boolean).join(" ");
    const innerMaxWidth = p.innerMaxWidth;
    const hasInnerConstraint = innerMaxWidth && innerMaxWidth !== outerMaxWidth;
    const innerCSS = hasInnerConstraint
        ? buildNestedCSS(blockId, "> .pb-inner", { maxWidth: innerMaxWidth, gap: p.gap })
        : buildNestedCSS(blockId, "> .pb-inner", { gap: p.gap });

    return (
        <>
            <ScopedStyle css={[styleContent, innerCSS]} />
            <section data-pb-id={blockId} className={sectionClasses}>
                <div className={`pb-inner flex flex-col ${hasInnerConstraint ? "mx-auto" : ""}`}>
                    {(children[0] ?? []).map((b) => (
                        <BlockRenderer key={b.id} block={b} />
                    ))}
                </div>
            </section>
        </>
    );
}

function renderColumns(p: ColumnsProps, children: BlockInstance[][], blockId: string) {
    const widths = p.columnWidths ?? Array(p.columns).fill("1fr");
    const alignClass = ALIGN_ITEMS_CLASS[p.verticalAlign] ?? "items-start";

    const containerCSS: React.CSSProperties = {
        gridTemplateColumns: widths.join(" "),
        gap: `${p.gap}px`,
    };
    if (p.backgroundColor && p.backgroundColor !== "transparent") containerCSS.backgroundColor = p.backgroundColor;
    if (p.paddingTop) containerCSS.paddingTop = p.paddingTop;
    if (p.paddingBottom) containerCSS.paddingBottom = p.paddingBottom;
    if (p.paddingLeft) containerCSS.paddingLeft = p.paddingLeft;
    if (p.paddingRight) containerCSS.paddingRight = p.paddingRight;
    if (p.width) containerCSS.width = ensureCSSUnit(p.width);
    if (p.height) containerCSS.height = ensureCSSUnit(p.height);

    const colCSSRules: (string | null)[] = [buildScopedCSS(blockId, containerCSS)];

    const colElements = Array.from({ length: p.columns }).map((_, i) => {
        const cs = p.columnSettings?.[i];
        const colClasses = ["min-w-0 flex flex-col"];
        if (cs?.verticalAlign) {
            const jc = cs.verticalAlign === "center" ? "justify-center" : cs.verticalAlign === "end" ? "justify-end" : "justify-start";
            colClasses.push(jc);
        }

        const colStyle: React.CSSProperties = {};
        if (cs?.backgroundColor && cs.backgroundColor !== "transparent") colStyle.backgroundColor = cs.backgroundColor;
        if (cs?.width) colStyle.width = ensureCSSUnit(cs.width);
        if (cs?.minHeight) colStyle.minHeight = ensureCSSUnit(cs.minHeight);
        if (cs?.borderRadius && cs.borderRadius !== "0" && cs.borderRadius !== "0px") colStyle.borderRadius = cs.borderRadius;
        if (cs?.paddingTop) colStyle.paddingTop = cs.paddingTop;
        if (cs?.paddingBottom) colStyle.paddingBottom = cs.paddingBottom;
        if (cs?.paddingLeft) colStyle.paddingLeft = cs.paddingLeft;
        if (cs?.paddingRight) colStyle.paddingRight = cs.paddingRight;

        if (Object.keys(colStyle).length > 0) {
            colCSSRules.push(buildNestedCSS(blockId, `> [data-pb-col="${i}"]`, colStyle));
        }

        return (
            <div key={i} data-pb-col={i} className={colClasses.join(" ")}>
                {(children[i] ?? []).map((b) => (
                    <BlockRenderer key={b.id} block={b} />
                ))}
            </div>
        );
    });

    return (
        <>
            <ScopedStyle css={colCSSRules} />
            <div data-pb-id={blockId} className={`grid ${alignClass}`}>
                {colElements}
            </div>
        </>
    );
}

function renderHero(p: HeroProps, blockId: string) {
    const justifyClass = JUSTIFY_CONTENT_CLASS[p.align] ?? "justify-center";
    const alignClass = TEXT_ALIGN_CLASS[p.align] ?? "text-center";

    const dynamicStyle: React.CSSProperties = {
        minHeight: p.height ?? "500px",
        padding: "4rem 2rem",
    };
    if (p.backgroundColor) dynamicStyle.backgroundColor = p.backgroundColor;
    if (p.backgroundImage) dynamicStyle.backgroundImage = `url(${p.backgroundImage})`;
    if (p.textColor) dynamicStyle.color = p.textColor;

    const overrides = p.responsive
        ? {
              tablet: p.responsive.tablet?.align ? { justifyContent: p.responsive.tablet.align === "center" ? "center" : p.responsive.tablet.align === "right" ? "flex-end" : "flex-start", textAlign: p.responsive.tablet.align } : undefined,
              mobile: p.responsive.mobile?.align ? { justifyContent: p.responsive.mobile.align === "center" ? "center" : p.responsive.mobile.align === "right" ? "flex-end" : "flex-start", textAlign: p.responsive.mobile.align } : undefined,
          }
        : undefined;
    const { styleContent } = getResponsiveStyle(blockId, dynamicStyle, overrides);

    const overlayCss = p.backgroundImage
        ? buildNestedCSS(blockId, "> .pb-overlay", { backgroundColor: `rgba(0,0,0,${p.overlayOpacity ?? 0.5})` })
        : null;
    const h1Css = buildNestedCSS(blockId, "h1", { margin: "0 0 1rem", fontSize: "clamp(2rem, 5vw, 3.5rem)", color: p.textColor });
    const subCss = buildNestedCSS(blockId, "> .pb-hero-inner > p", { margin: "0 0 2rem", color: p.textColor });
    const btnCss = buildNestedCSS(blockId, "a", { background: "#fff", color: p.backgroundColor });

    return (
        <>
            <ScopedStyle css={[styleContent, overlayCss, h1Css, subCss, btnCss]} />
            <section data-pb-id={blockId} className={`relative flex items-center ${justifyClass} ${alignClass} bg-cover bg-center`}>
                {p.backgroundImage && (
                    <div className="pb-overlay absolute inset-0" aria-hidden="true" />
                )}
                <div className="pb-hero-inner relative z-10 max-w-[800px]">
                    <h1 className="font-extrabold leading-[1.1]">{p.heading}</h1>
                    {p.subheading && (
                        <p className="opacity-85 text-xl">{p.subheading}</p>
                    )}
                    {p.buttonLabel && (
                        <a href={p.buttonHref} className="inline-block py-3.5 px-8 font-bold rounded-lg no-underline text-base">
                            {p.buttonLabel}
                        </a>
                    )}
                </div>
            </section>
        </>
    );
}

function renderCard(p: CardProps, blockId: string) {
    const cardCSS: React.CSSProperties = {};
    if (p.backgroundColor) cardCSS.backgroundColor = p.backgroundColor;
    if (p.borderRadius) cardCSS.borderRadius = p.borderRadius;

    return (
        <>
            <ScopedStyle css={[buildScopedCSS(blockId, cardCSS)]} />
            <div data-pb-id={blockId} className={`overflow-hidden ${p.shadow ? "shadow-[0_4px_24px_rgba(0,0,0,0.08)]" : ""}`}>
                {(p.imageSrc || p.imageMediaId) && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                        src={p.imageSrc || `/media/${p.imageMediaId}`}
                        alt={p.title}
                        className="w-full aspect-video object-cover block"
                    />
                )}
                <div className="p-6">
                    <h3 className="m-0 mb-2 text-xl font-bold">{p.title}</h3>
                    <p className="m-0 mb-4 text-gray-500 leading-[1.6]">{p.description}</p>
                    {p.buttonLabel && (
                        <a href={p.buttonHref ?? "#"} className="inline-block py-2 px-4 bg-blue-600 text-white rounded-md no-underline font-semibold text-sm">
                            {p.buttonLabel}
                        </a>
                    )}
                </div>
            </div>
        </>
    );
}

function renderHtml(p: HtmlProps) {
    return <div dangerouslySetInnerHTML={{ __html: p.html }} />;
}

function renderVideo(p: VideoProps, blockId: string) {
    const wrapperCSS: React.CSSProperties = {};
    if (p.width) wrapperCSS.width = ensureCSSUnit(p.width);
    if (p.height) wrapperCSS.height = ensureCSSUnit(p.height);
    const hasSize = !!p.width || !!p.height;

    const aspectCSS: React.CSSProperties = {};
    if (p.aspectRatio) aspectCSS.aspectRatio = p.aspectRatio;

    const content = !p.url ? (
        <>
            <ScopedStyle css={[buildScopedCSS(blockId, { aspectRatio: p.aspectRatio ?? "16/9" })]} />
            <div data-pb-id={blockId} className="flex items-center justify-center bg-gray-100 text-gray-400 text-sm rounded-lg">
                Video URL&apos;si eklenmedi
            </div>
        </>
    ) : (() => {
        const isYoutube = p.url.includes("youtube.com") || p.url.includes("youtu.be");
        const isVimeo = p.url.includes("vimeo.com");
        if (isYoutube || isVimeo) {
            let embedSrc = p.url;
            if (isYoutube) {
                const id = p.url.match(/(?:v=|youtu\.be\/)([^&?\/]+)/)?.[1];
                if (id) embedSrc = `https://www.youtube.com/embed/${id}?${p.autoplay ? "autoplay=1&" : ""}${p.controls ? "" : "controls=0&"}${p.loop ? `loop=1&playlist=${id}` : ""}`;
            } else if (isVimeo) {
                const id = p.url.match(/vimeo\.com\/([0-9]+)/)?.[1];
                if (id) embedSrc = `https://player.vimeo.com/video/${id}?${p.autoplay ? "autoplay=1&" : ""}${p.loop ? "loop=1&" : ""}`;
            }
            const paddingBottom = p.aspectRatio === "4/3" ? "75%" : p.aspectRatio === "1/1" ? "100%" : "56.25%";
            return (
                <>
                    <ScopedStyle css={[buildScopedCSS(blockId, { paddingBottom })]} />
                    <div data-pb-id={blockId} className="relative h-0 w-full">
                        <iframe
                            src={embedSrc}
                            className="absolute inset-0 w-full h-full border-0"
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                            allowFullScreen
                            title="Video"
                        />
                    </div>
                </>
            );
        }
        return (
            <>
                <ScopedStyle css={[buildScopedCSS(blockId, aspectCSS)]} />
                <video
                    data-pb-id={blockId}
                    src={p.url}
                    autoPlay={p.autoplay}
                    muted={p.muted}
                    loop={p.loop}
                    controls={p.controls}
                    className="w-full block"
                />
            </>
        );
    })();

    if (hasSize) {
        const wrapperId = `${blockId}-wrap`;
        return (
            <>
                <ScopedStyle css={[buildScopedCSS(wrapperId, wrapperCSS)]} />
                <div data-pb-id={wrapperId} className="block">{content}</div>
            </>
        );
    }
    return content;
}

function renderTabs(p: TabsProps, blockId: string) {
    return <TabsBlock blockId={blockId} tabs={p.tabs} defaultTabIndex={p.defaultTabIndex ?? 0} />;
}

function renderAccordion(p: AccordionProps, blockId: string) {
    if (!p.items?.length) {
        return <div data-pb-id={blockId} className="p-4 bg-gray-100 rounded-lg text-gray-500">Öğe yok</div>;
    }
    return (
        <div data-pb-id={blockId} className="border border-gray-200 rounded-lg overflow-hidden">
            {p.items.map((item, i) => (
                <details key={i} open={item.open} className={i < p.items.length - 1 ? "border-b border-gray-200" : undefined}>
                    <summary className="py-3 px-4 cursor-pointer font-semibold list-none bg-gray-50">
                        <span className="mr-2">▾</span>{item.title}
                    </summary>
                    <div className="py-4 pr-4 pl-8 bg-white whitespace-pre-wrap leading-[1.6] text-gray-700">{item.content}</div>
                </details>
            ))}
        </div>
    );
}

function renderIconBox(p: IconBoxProps, blockId: string) {
    const alignClass = TEXT_ALIGN_CLASS[p.align ?? "left"] ?? "text-left";
    const css = buildScopedCSS(blockId, {});
    const iconCSS = buildNestedCSS(blockId, "> .pb-icon", { color: p.iconColor ?? "#2563eb" });
    const titleCSS = buildNestedCSS(blockId, "h3", { color: p.titleColor ?? "#111827" });
    const textCSS = buildNestedCSS(blockId, "> .pb-text", { color: p.textColor ?? "#4b5563" });
    return (
        <>
            <ScopedStyle css={[css, iconCSS, titleCSS, textCSS]} />
            <div data-pb-id={blockId} className={`p-5 max-w-[400px] ${alignClass}`}>
                <div className="pb-icon text-[2rem] leading-none mb-3">{p.icon || "◇"}</div>
                <h3 className="m-0 mb-2 text-xl font-bold">{p.title}</h3>
                <p className="pb-text m-0 text-[0.95rem] leading-[1.6]">{p.text}</p>
            </div>
        </>
    );
}

function renderList(p: ListProps, blockId: string) {
    const Tag = p.ordered ? "ol" : "ul";
    const css = buildScopedCSS(blockId, { color: p.color ?? "#374151", fontSize: p.fontSize ?? "1rem" });
    return (
        <>
            <ScopedStyle css={[css]} />
            <Tag data-pb-id={blockId} className={`m-0 pl-6 leading-[1.8] ${p.ordered ? "list-decimal" : "list-disc"}`}>
                {(p.items ?? []).map((item, i) => (
                    <li key={i} className="mb-1">{item}</li>
                ))}
            </Tag>
        </>
    );
}

function renderQuote(p: QuoteProps, blockId: string) {
    const css = buildScopedCSS(blockId, {
        borderColor: p.borderColor ?? "#3b82f6",
        color: p.textColor ?? "#374151",
        fontSize: p.fontSize ?? "1.1rem",
    });
    return (
        <>
            <ScopedStyle css={[css]} />
            <blockquote data-pb-id={blockId} className="m-0 py-4 px-6 border-l-4">
                <p className="m-0 leading-[1.7] italic">{p.text}</p>
                {p.author && (
                    <footer className="mt-3 text-sm font-semibold not-italic opacity-70">— {p.author}</footer>
                )}
            </blockquote>
        </>
    );
}

const SOCIAL_PLATFORM_LABELS: Record<string, string> = {
    facebook: "Facebook", twitter: "Twitter / X", instagram: "Instagram", linkedin: "LinkedIn",
    youtube: "YouTube", github: "GitHub", tiktok: "TikTok", website: "Web",
};

function renderSocialLinks(p: SocialLinksProps, blockId: string) {
    const sizeClass = p.size === "sm" ? "text-lg" : p.size === "lg" ? "text-3xl" : "text-2xl";
    const gapClass = p.size === "sm" ? "gap-3" : p.size === "lg" ? "gap-6" : "gap-4";
    const justifyClass = JUSTIFY_CONTENT_CLASS[p.align] ?? "justify-start";
    const css = buildScopedCSS(blockId, { color: p.color ?? "#6b7280" });
    return (
        <>
            <ScopedStyle css={[css]} />
            <div data-pb-id={blockId} className={`flex flex-wrap ${gapClass} ${justifyClass} items-center`}>
                {(p.links ?? []).map((link, i) => (
                    <a key={i} href={link.url || "#"} target="_blank" rel="noopener noreferrer"
                        className={`${sizeClass} no-underline transition-opacity hover:opacity-70 text-current`}
                        title={SOCIAL_PLATFORM_LABELS[link.platform] ?? link.platform}
                    >
                        {link.platform === "facebook" ? "f" : link.platform === "twitter" ? "𝕏" :
                         link.platform === "instagram" ? "◎" : link.platform === "linkedin" ? "in" :
                         link.platform === "youtube" ? "▶" : link.platform === "github" ? "⌥" :
                         link.platform === "tiktok" ? "♪" : "🌐"}
                    </a>
                ))}
            </div>
        </>
    );
}

function renderAlert(p: AlertProps, blockId: string) {
    const variants: Record<string, { bg: string; border: string; text: string; icon: string }> = {
        info:    { bg: "bg-blue-50",   border: "border-blue-200",  text: "text-blue-800",   icon: "ℹ" },
        success: { bg: "bg-green-50",  border: "border-green-200", text: "text-green-800",  icon: "✓" },
        warning: { bg: "bg-amber-50",  border: "border-amber-200", text: "text-amber-800",  icon: "⚠" },
        error:   { bg: "bg-red-50",    border: "border-red-200",   text: "text-red-800",    icon: "✕" },
    };
    const v = variants[p.variant] ?? variants.info;
    return (
        <div data-pb-id={blockId} className={`flex gap-3 p-4 rounded-lg border ${v.bg} ${v.border} ${v.text}`}>
            <span className="text-lg leading-none shrink-0 mt-0.5">{v.icon}</span>
            <div className="min-w-0">
                {p.title && <strong className="block mb-1">{p.title}</strong>}
                <p className="m-0 leading-[1.6] text-sm">{p.text}</p>
            </div>
        </div>
    );
}

function renderTestimonial(p: TestimonialProps, blockId: string) {
    return (
        <div data-pb-id={blockId} className="bg-white rounded-xl p-6 shadow-[0_2px_16px_rgba(0,0,0,0.06)]">
            {p.rating != null && p.rating > 0 && (
                <div className="flex gap-0.5 mb-3 text-amber-400 text-lg">
                    {Array.from({ length: Math.min(p.rating, 5) }, (_, i) => <span key={i}>★</span>)}
                </div>
            )}
            <p className="m-0 text-gray-700 leading-[1.7] italic text-[1.05rem]">&ldquo;{p.quote}&rdquo;</p>
            <div className="flex items-center gap-3 mt-4 pt-4 border-t border-gray-100">
                {p.avatarSrc ? <img src={p.avatarSrc} alt={p.name} className="w-10 h-10 rounded-full object-cover" /> : null}
                <div>
                    <strong className="block text-gray-900 text-sm">{p.name}</strong>
                    {p.title && <span className="text-gray-500 text-xs">{p.title}</span>}
                </div>
            </div>
        </div>
    );
}

function renderCounter(p: CounterProps, blockId: string) {
    const css = buildNestedCSS(blockId, "> .pb-val", { color: p.color ?? "#2563eb" });
    return (
        <>
            <ScopedStyle css={[css]} />
            <div data-pb-id={blockId} className="text-center p-4">
                <div className="pb-val text-4xl font-extrabold leading-none mb-2">{p.prefix}{p.value}{p.suffix}</div>
                <div className="text-gray-500 text-sm font-medium uppercase tracking-wide">{p.label}</div>
            </div>
        </>
    );
}

function renderGallery(p: GalleryProps, blockId: string) {
    if (!p.images || p.images.length === 0) {
        return <div data-pb-id={blockId} className="p-6 bg-gray-50 rounded-lg text-center text-gray-400 text-sm">Galeri boş — görseller ekleyin</div>;
    }
    const css = buildScopedCSS(blockId, {
        gridTemplateColumns: `repeat(${p.columns ?? 3}, 1fr)`,
        gap: `${p.gap ?? 8}px`,
    });
    const itemCSS = buildNestedCSS(blockId, "> div", {
        borderRadius: p.borderRadius ?? "0.5rem",
    });
    return (
        <>
            <ScopedStyle css={[css, itemCSS]} />
            <div data-pb-id={blockId} className="grid">
                {p.images.map((img, i) => (
                    <div key={i} className="overflow-hidden">
                        {img.src ? (
                            <img src={img.src} alt={img.alt || ""} className="block w-full aspect-square object-cover" />
                        ) : (
                            <div className="w-full aspect-square bg-gray-100 flex items-center justify-center text-gray-400 text-xs">Görsel</div>
                        )}
                    </div>
                ))}
            </div>
        </>
    );
}

function renderMap(p: MapProps, blockId: string) {
    if (!p.embedUrl) {
        const css = buildScopedCSS(blockId, { height: p.height ?? "400px", borderRadius: p.borderRadius ?? "0.75rem" });
        return (
            <>
                <ScopedStyle css={[css]} />
                <div data-pb-id={blockId} className="flex items-center justify-center bg-gray-100 text-gray-400 text-sm rounded-lg">
                    Harita URL&apos;si ekleyin
                </div>
            </>
        );
    }
    const wrapCSS = buildScopedCSS(blockId, { borderRadius: p.borderRadius ?? "0.75rem" });
    const iframeCSS = buildNestedCSS(blockId, "iframe", { height: p.height ?? "400px" });
    return (
        <>
            <ScopedStyle css={[wrapCSS, iframeCSS]} />
            <div data-pb-id={blockId} className="overflow-hidden">
                <iframe src={p.embedUrl} className="block w-full border-0" allowFullScreen loading="lazy" referrerPolicy="no-referrer-when-downgrade" />
            </div>
        </>
    );
}

function renderForm(p: FormProps, blockId: string) {
    const css = buildScopedCSS(blockId, { backgroundColor: p.backgroundColor ?? "#ffffff" });
    const btnCSS = buildNestedCSS(blockId, "button", { backgroundColor: p.buttonColor ?? "#2563eb" });
    return (
        <>
            <ScopedStyle css={[css, btnCSS]} />
            <div data-pb-id={blockId} className="flex flex-col gap-4 max-w-[600px] mx-auto p-6 rounded-xl">
                {(p.fields ?? []).map((field, i) => (
                    <div key={i} className="flex flex-col gap-1.5">
                        <label className="text-sm font-medium text-gray-700">
                            {field.label}
                            {field.required && <span className="text-red-500 ml-1">*</span>}
                        </label>
                        {field.type === "textarea" ? (
                            <textarea className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 min-h-[100px] resize-y" placeholder={field.label} readOnly />
                        ) : (
                            <input type={field.type} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500" placeholder={field.label} readOnly />
                        )}
                    </div>
                ))}
                <button type="button" className="self-start py-2.5 px-6 rounded-lg text-sm font-semibold text-white border-none cursor-pointer">
                    {p.submitLabel || "Gönder"}
                </button>
            </div>
        </>
    );
}

function renderProgressBar(p: ProgressBarProps, blockId: string) {
    const pct = Math.min(100, Math.max(0, (p.value / (p.maxValue || 100)) * 100));
    const barCSS = buildNestedCSS(blockId, "> .pb-track > .pb-fill", {
        width: `${pct}%`,
        backgroundColor: p.color ?? "#2563eb",
    });
    return (
        <>
            <ScopedStyle css={[barCSS]} />
            <div data-pb-id={blockId} className="w-full">
                {p.showLabel && (
                    <div className="flex justify-between items-center mb-1.5">
                        <span className="text-sm font-medium text-gray-700">{p.label}</span>
                        <span className="text-xs font-semibold text-gray-500">{Math.round(pct)}%</span>
                    </div>
                )}
                <div className="pb-track w-full h-3 bg-gray-200 rounded-full overflow-hidden">
                    <div className="pb-fill h-full rounded-full transition-all duration-500" />
                </div>
            </div>
        </>
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

function advancedStyleToCSS(s: AdvancedStyle): React.CSSProperties {
    const css: React.CSSProperties = {};
    if (s.marginTop) css.marginTop = s.marginTop;
    if (s.marginRight) css.marginRight = s.marginRight;
    if (s.marginBottom) css.marginBottom = s.marginBottom;
    if (s.marginLeft) css.marginLeft = s.marginLeft;
    if (s.borderWidth) css.borderWidth = s.borderWidth;
    if (s.borderStyle && s.borderStyle !== "none") css.borderStyle = s.borderStyle;
    if (s.borderColor) css.borderColor = s.borderColor;
    if (s.borderRadius) css.borderRadius = s.borderRadius;
    if (s.boxShadow) css.boxShadow = s.boxShadow;
    if (s.opacity != null && s.opacity !== 1) css.opacity = s.opacity;
    if (s.overflow && s.overflow !== "visible") css.overflow = s.overflow;
    return css;
}

export function BlockRenderer({ block }: { block: BlockInstance }) {
    const { type, props, children = [], id, visibility } = block;
    const visAttrs = visibilityDataAttrs(visibility);
    const hasVisibility = Object.keys(visAttrs).length > 0;

    let content: React.ReactNode;
    switch (type) {
        case "heading":    content = renderHeading(props as HeadingProps, id); break;
        case "text":       content = renderText(props as TextProps, id); break;
        case "image":      content = renderImage(props as ImageProps, id); break;
        case "button":     content = renderButton(props as ButtonProps, id); break;
        case "divider":    content = renderDivider(props as DividerProps, id); break;
        case "spacer":     content = renderSpacer(props as SpacerProps, id); break;
        case "section":    content = renderSection(props as SectionProps, children, id); break;
        case "columns-2":
        case "columns-3":  content = renderColumns(props as ColumnsProps, children, id); break;
        case "hero":       content = renderHero(props as HeroProps, id); break;
        case "card":       content = renderCard(props as CardProps, id); break;
        case "html":       content = renderHtml(props as HtmlProps); break;
        case "video":      content = renderVideo(props as VideoProps, id); break;
        case "tabs":       content = renderTabs(props as TabsProps, id); break;
        case "accordion":  content = renderAccordion(props as AccordionProps, id); break;
        case "icon-box":   content = renderIconBox(props as IconBoxProps, id); break;
        case "list":       content = renderList(props as ListProps, id); break;
        case "quote":      content = renderQuote(props as QuoteProps, id); break;
        case "social-links": content = renderSocialLinks(props as SocialLinksProps, id); break;
        case "alert":      content = renderAlert(props as AlertProps, id); break;
        case "testimonial": content = renderTestimonial(props as TestimonialProps, id); break;
        case "counter":    content = renderCounter(props as CounterProps, id); break;
        case "gallery":    content = renderGallery(props as GalleryProps, id); break;
        case "map":        content = renderMap(props as MapProps, id); break;
        case "form":       content = renderForm(props as FormProps, id); break;
        case "progress-bar": content = renderProgressBar(props as ProgressBarProps, id); break;
        case "navigation-menu":
            content = (
                <Suspense fallback={<div className="p-2 text-gray-400 text-sm">Menü yükleniyor…</div>}>
                    <NavigationMenuBlock blockId={id} props={props as NavigationMenuProps} />
                </Suspense>
            );
            break;
        case "breadcrumb":
            content = <BreadcrumbBlock blockId={id} props={props as BreadcrumbProps} />;
            break;
        default:
            content = null;
    }

    const adv = block.advancedStyle;
    if (adv) {
        const advCSS = advancedStyleToCSS(adv);
        const advClasses = [
            adv.overflow ? (OVERFLOW_CLASS[adv.overflow] ?? "") : "",
            adv.customClassName ?? "",
        ].filter(Boolean).join(" ");
        const advId = `${id}-adv`;
        const advScopedCSS = Object.keys(advCSS).length > 0
            ? `[data-pb-adv="${advId}"]{${styleToCss(advCSS)}}`
            : null;
        content = (
            <>
                {advScopedCSS && <style dangerouslySetInnerHTML={{ __html: advScopedCSS }} />}
                <div data-pb-adv={advId} className={advClasses || undefined}>
                    {content}
                </div>
            </>
        );
    }

    if (hasVisibility) {
        return (
            <div {...visAttrs} className="contents">
                {content}
            </div>
        );
    }
    return <>{content}</>;
}

// ---------------------------------------------------------------------------
// Page-level renderer
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
