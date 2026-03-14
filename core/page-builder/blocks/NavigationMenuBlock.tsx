import React from "react";
import { getMenuById } from "@/core/menu/menu-service";
import type { NavigationMenuProps } from "../types";

export async function NavigationMenuBlock({
    blockId,
    props,
}: {
    blockId: string;
    props: NavigationMenuProps;
}) {
    if (!props.menuId) {
        return (
            <nav data-pb-id={blockId} className="p-4 text-gray-400 text-sm">
                Men\u00FC se\u00E7ilmedi
            </nav>
        );
    }

    const menu = await getMenuById(props.menuId);
    if (!menu) {
        return (
            <nav data-pb-id={blockId} className="p-4 text-gray-400 text-sm">
                Men\u00FC bulunamad\u0131
            </nav>
        );
    }

    const isVertical = props.layout === "vertical";
    const justifyMap = { left: "flex-start", center: "center", right: "flex-end" } as const;

    return (
        <>
            <style dangerouslySetInnerHTML={{ __html: `
                [data-pb-id="${blockId}"] a:hover { color: ${props.hoverColor} !important; }
            `}} />
            <nav
                data-pb-id={blockId}
                className={`flex ${isVertical ? "flex-col" : "flex-row flex-wrap"} items-${isVertical ? "start" : "center"}`}
                style={{
                    gap: `${props.gap}px`,
                    justifyContent: justifyMap[props.align] ?? "flex-start",
                    fontSize: props.fontSize,
                }}
            >
                {menu.items.map((item) => (
                    <a
                        key={item.id}
                        href={item.href}
                        target={item.openInNewTab ? "_blank" : undefined}
                        rel={item.openInNewTab ? "noopener noreferrer" : undefined}
                        className="no-underline transition-colors duration-200"
                        style={{ color: props.textColor }}
                    >
                        {item.label}
                    </a>
                ))}
            </nav>
        </>
    );
}
