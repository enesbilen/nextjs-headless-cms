"use client";

import React, { useState } from "react";
import type { TabItem } from "../types";

export function TabsBlock({
    blockId,
    tabs,
    defaultTabIndex = 0,
}: {
    blockId: string;
    tabs: TabItem[];
    defaultTabIndex?: number;
}) {
    const [activeIndex, setActiveIndex] = useState(defaultTabIndex);
    if (!tabs?.length) {
        return <div data-pb-id={blockId} style={{ padding: "1rem", background: "#f3f4f6", borderRadius: "8px", color: "#6b7280" }}>Sekme yok</div>;
    }
    const idx = Math.min(activeIndex, tabs.length - 1);
    const active = tabs[idx];

    return (
        <div data-pb-id={blockId} style={{ border: "1px solid #e5e7eb", borderRadius: "8px", overflow: "hidden" }}>
            <div role="tablist" style={{ display: "flex", flexWrap: "wrap", borderBottom: "1px solid #e5e7eb", background: "#f9fafb" }}>
                {tabs.map((tab, i) => (
                    <button
                        key={i}
                        role="tab"
                        type="button"
                        aria-selected={i === idx}
                        onClick={() => setActiveIndex(i)}
                        style={{
                            padding: "0.75rem 1.25rem",
                            border: "none",
                            background: i === idx ? "#fff" : "transparent",
                            fontWeight: i === idx ? 600 : 400,
                            cursor: "pointer",
                            borderBottom: i === idx ? "2px solid #2563eb" : "2px solid transparent",
                            marginBottom: "-1px",
                        }}
                    >
                        {tab.label}
                    </button>
                ))}
            </div>
            <div role="tabpanel" style={{ padding: "1.25rem", background: "#fff", minHeight: "60px" }}>
                <div style={{ whiteSpace: "pre-wrap", lineHeight: 1.6, color: "#374151" }}>{active.content}</div>
            </div>
        </div>
    );
}
