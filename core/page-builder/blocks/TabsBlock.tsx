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
        return <div data-pb-id={blockId} className="p-4 bg-gray-100 rounded-lg text-gray-500">Sekme yok</div>;
    }
    const idx = Math.min(activeIndex, tabs.length - 1);
    const active = tabs[idx];

    return (
        <div data-pb-id={blockId} className="border border-gray-200 rounded-lg overflow-hidden">
            <div role="tablist" className="flex flex-wrap border-b border-gray-200 bg-gray-50">
                {tabs.map((tab, i) => (
                    <button
                        key={i}
                        role="tab"
                        type="button"
                        aria-selected={i === idx}
                        onClick={() => setActiveIndex(i)}
                        className={`py-3 px-5 border-none cursor-pointer -mb-px ${
                            i === idx ? "bg-white font-semibold border-b-2 border-blue-600" : "bg-transparent font-normal border-b-2 border-transparent"
                        }`}
                    >
                        {tab.label}
                    </button>
                ))}
            </div>
            <div role="tabpanel" className="p-5 bg-white min-h-[60px]">
                <div className="whitespace-pre-wrap leading-[1.6] text-gray-700">{active.content}</div>
            </div>
        </div>
    );
}
