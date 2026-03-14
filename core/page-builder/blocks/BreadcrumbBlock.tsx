import React from "react";
import type { BreadcrumbProps } from "../types";

export function BreadcrumbBlock({
    blockId,
    props,
    pagePath,
}: {
    blockId: string;
    props: BreadcrumbProps;
    pagePath?: string;
}) {
    const separator = props.separator || "/";
    const segments = (pagePath || "")
        .split("/")
        .filter(Boolean);

    const crumbs = [
        { label: "Ana Sayfa", href: "/" },
        ...segments.map((seg, i) => ({
            label: decodeURIComponent(seg).replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase()),
            href: "/" + segments.slice(0, i + 1).join("/"),
        })),
    ];

    return (
        <nav
            data-pb-id={blockId}
            className="flex flex-wrap items-center gap-1.5"
            style={{ fontSize: props.fontSize, color: props.textColor }}
            aria-label="Breadcrumb"
        >
            {crumbs.map((crumb, i) => {
                const isLast = i === crumbs.length - 1;
                return (
                    <React.Fragment key={i}>
                        {i > 0 && (
                            <span className="opacity-50" aria-hidden="true">
                                {separator}
                            </span>
                        )}
                        {isLast ? (
                            <span className="font-medium">{crumb.label}</span>
                        ) : (
                            <a
                                href={crumb.href}
                                className="no-underline hover:underline transition-colors"
                                style={{ color: props.linkColor }}
                            >
                                {crumb.label}
                            </a>
                        )}
                    </React.Fragment>
                );
            })}
        </nav>
    );
}
