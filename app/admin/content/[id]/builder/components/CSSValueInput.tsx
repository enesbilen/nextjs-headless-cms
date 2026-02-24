"use client";
/**
 * CSSValueInput — WordPress-style CSS dimension control
 *
 * SpacingControl (padding / margin / gap)
 * BorderRadiusControl (4-corner)
 */

import { useState, useCallback, useId } from "react";

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────

export type CSSUnit = "px" | "rem" | "%" | "fr" | "auto" | "custom";

export interface ParsedCSSValue {
    value: number;
    unit: CSSUnit;
    raw: string;
}

const NUMERIC_UNITS: CSSUnit[] = ["px", "rem", "%", "fr"];

// ─────────────────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────────────────

export function parseCSSValue(raw: string | number | undefined): ParsedCSSValue {
    if (raw === undefined || raw === "" || raw === null) {
        return { value: 0, unit: "px", raw: "0px" };
    }
    const str = String(raw).trim();
    if (str === "auto") return { value: 0, unit: "auto", raw: "auto" };

    const match = str.match(/^(-?[\d.]+)\s*(px|rem|%|fr|em|vw|vh)?$/);
    if (match) {
        const num = parseFloat(match[1]);
        const u = (match[2] ?? "px") as CSSUnit;
        const unit = NUMERIC_UNITS.includes(u) ? u : "px";
        return { value: num, unit, raw: str };
    }

    return { value: 0, unit: "custom", raw: str };
}

function serializeCSSValue(value: number, unit: CSSUnit, customRaw?: string): string {
    if (unit === "auto") return "auto";
    if (unit === "custom") return customRaw ?? "";
    const v = unit === "px" ? Math.round(value) : Math.round(value * 100) / 100;
    return `${v}${unit}`;
}

function defaultSliderMax(unit: CSSUnit): number {
    if (unit === "px") return 200;
    if (unit === "rem") return 20;
    if (unit === "%") return 100;
    if (unit === "fr") return 10;
    return 100;
}

// Shared Tailwind class for prop-input
const CLS_INPUT = "w-full py-1.5 px-2 rounded-[5px] border border-builder-line bg-slate-900 text-slate-200 text-[0.8rem] outline-none resize-y focus:border-blue-500";

// ─────────────────────────────────────────────────────────────────────────────
// CSSValueInput
// ─────────────────────────────────────────────────────────────────────────────

export interface CSSValueInputProps {
    value: string | number | undefined;
    onChange: (cssString: string) => void;
    units?: CSSUnit[];
    allowAuto?: boolean;
    allowFr?: boolean;
    allowCustom?: boolean;
    sliderMax?: number;
    min?: number;
    step?: number;
    placeholder?: string;
    /** Compact mode: single-line number input with unit suffix, no tabs/slider */
    compact?: boolean;
}

export function CSSValueInput({
    value,
    onChange,
    units,
    allowAuto = false,
    allowFr = false,
    allowCustom = false,
    sliderMax,
    min = 0,
    step = 1,
    placeholder,
    compact = false,
}: CSSValueInputProps) {
    const parsed = parseCSSValue(value);

    const baseTabs: CSSUnit[] = units ?? ["px", "rem", "%"];
    const tabs: CSSUnit[] = [
        ...baseTabs,
        ...(allowFr && !baseTabs.includes("fr") ? ["fr" as CSSUnit] : []),
        ...(allowAuto ? ["auto" as CSSUnit] : []),
        ...(allowCustom ? ["custom" as CSSUnit] : []),
    ];

    const activeUnit = tabs.includes(parsed.unit) ? parsed.unit : tabs[0];
    const numValue = parsed.unit === activeUnit ? parsed.value : 0;
    const maxVal = sliderMax ?? defaultSliderMax(activeUnit);

    const id = useId();

    const emit = useCallback(
        (v: number, u: CSSUnit, customRaw?: string) => {
            onChange(serializeCSSValue(v, u, customRaw));
        },
        [onChange]
    );

    const handleUnitChange = (u: CSSUnit) => {
        if (u === "auto") {
            onChange("auto");
        } else if (u === "custom") {
            onChange(parsed.raw !== "auto" ? parsed.raw : "");
        } else {
            let newVal = numValue;
            if (parsed.unit === "px" && u === "rem") newVal = Math.round((numValue / 16) * 10) / 10;
            if (parsed.unit === "rem" && u === "px") newVal = Math.round(numValue * 16);
            emit(newVal, u);
        }
    };

    const handleNumChange = (raw: string) => {
        const n = parseFloat(raw);
        if (!isNaN(n)) emit(n, activeUnit);
    };

    const isCustom = activeUnit === "custom";
    const isAuto = activeUnit === "auto";

    // ── Compact mode: single-line number+unit, no tabs/slider ──────────
    if (compact) {
        return (
            <div className="flex items-center gap-0 w-full">
                <input
                    type="number"
                    className="w-full py-1 px-1.5 rounded-l-[4px] rounded-r-none border border-r-0 border-builder-line bg-slate-900 text-slate-200 text-[0.75rem] outline-none text-center focus:border-blue-500 [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
                    value={numValue}
                    min={min}
                    step={step}
                    onChange={(e) => handleNumChange(e.target.value)}
                />
                <span className="shrink-0 py-1 px-1.5 rounded-r-[4px] border border-l-0 border-builder-line bg-slate-800 text-slate-500 text-[0.6rem] font-semibold leading-none select-none">
                    {activeUnit}
                </span>
            </div>
        );
    }

    // ── Full mode: unit tabs + slider + number input ───────────────────
    return (
        <div className="flex flex-col gap-1 w-full">
            {/* Unit tabs */}
            <div className="flex gap-0.5 bg-gray-900 rounded-md p-0.5" role="tablist">
                {tabs.map((u) => (
                    <button
                        key={u}
                        role="tab"
                        aria-selected={activeUnit === u}
                        className={`flex-1 py-[3px] rounded text-[0.62rem] font-semibold tracking-tight cursor-pointer text-center leading-none transition-all ${
                            activeUnit === u
                                ? "bg-builder-active border border-blue-600 text-blue-400"
                                : "border border-transparent bg-transparent text-gray-500 hover:bg-slate-800 hover:text-slate-400"
                        }`}
                        onClick={() => handleUnitChange(u)}
                        title={u === "custom" ? "Özel değer" : u}
                    >
                        {u === "custom" ? "—" : u}
                    </button>
                ))}
            </div>

            {/* Body */}
            {isAuto ? (
                <div className="inline-flex items-center justify-center bg-slate-800 border border-dashed border-slate-700 rounded text-blue-400 text-[0.7rem] font-semibold py-1 px-2 tracking-wide">
                    auto
                </div>
            ) : isCustom ? (
                <input
                    className={`${CLS_INPUT} font-mono !text-xs`}
                    type="text"
                    value={parsed.raw}
                    onChange={(e) => onChange(e.target.value)}
                    placeholder={placeholder ?? "1fr, 200px, auto…"}
                />
            ) : (
                <div className="flex items-center gap-1.5">
                    <input
                        id={`${id}-slider`}
                        type="range"
                        className="builder-slider flex-1 h-1"
                        min={min}
                        max={maxVal}
                        step={step}
                        value={Math.min(Math.max(numValue, min), maxVal)}
                        onChange={(e) => emit(parseFloat(e.target.value), activeUnit)}
                    />
                    <input
                        id={`${id}-num`}
                        type="number"
                        className={`${CLS_INPUT} !w-[52px] shrink-0 text-center !text-xs !py-[3px] !px-1`}
                        value={numValue}
                        min={min}
                        step={step}
                        onChange={(e) => handleNumChange(e.target.value)}
                    />
                </div>
            )}
        </div>
    );
}

// ─────────────────────────────────────────────────────────────────────────────
// SpacingControl  (padding / margin)
// ─────────────────────────────────────────────────────────────────────────────

export interface SpacingValue {
    top: string | number;
    right: string | number;
    bottom: string | number;
    left: string | number;
}

export interface SpacingControlProps {
    value: SpacingValue;
    onChange: (side: "top" | "right" | "bottom" | "left", v: string) => void;
    units?: CSSUnit[];
    sliderMax?: number;
    label?: string;
}

const SIDES = [
    { key: "top" as const, icon: "↑", label: "Üst" },
    { key: "right" as const, icon: "→", label: "Sağ" },
    { key: "bottom" as const, icon: "↓", label: "Alt" },
    { key: "left" as const, icon: "←", label: "Sol" },
];

export function SpacingControl({ value, onChange, units = ["px", "rem", "%"], sliderMax, label }: SpacingControlProps) {
    const [linked, setLinked] = useState(false);

    const handleChange = (side: "top" | "right" | "bottom" | "left", v: string) => {
        if (linked) {
            onChange("top", v);
            onChange("right", v);
            onChange("bottom", v);
            onChange("left", v);
        } else {
            onChange(side, v);
        }
    };

    return (
        <div className="flex flex-col gap-1.5 w-full">
            {label && (
                <div className="text-[0.65rem] font-semibold text-slate-500 uppercase tracking-wide">
                    {label}
                </div>
            )}

            <div className="grid grid-cols-2 gap-x-2 gap-y-1.5">
                {SIDES.map(({ key, icon, label: sideLabel }) => (
                    <div key={key} className="flex items-center gap-1.5" title={sideLabel}>
                        <span className="text-[0.65rem] text-slate-500 font-bold w-3 text-center shrink-0">
                            {icon}
                        </span>
                        <CSSValueInput
                            value={linked ? value.top : value[key]}
                            onChange={(v) => handleChange(key, v)}
                            units={units}
                            sliderMax={sliderMax}
                            min={0}
                            compact
                        />
                    </div>
                ))}
            </div>

            <button
                className={`flex items-center justify-center gap-1 py-[3px] px-2 rounded cursor-pointer text-[0.65rem] transition-all ${
                    linked
                        ? "border border-solid border-blue-600 bg-blue-600/10 text-blue-400"
                        : "border border-dashed border-slate-700 bg-transparent text-gray-500 hover:border-blue-500 hover:text-blue-400"
                }`}
                onClick={() => setLinked((l) => !l)}
                title={linked ? "Bağlantıyı kes (ayrı düzenle)" : "Tüm kenarları birleştir"}
            >
                {linked ? "🔗 Birleşik" : "⛓ Birleştir"}
            </button>
        </div>
    );
}

// ─────────────────────────────────────────────────────────────────────────────
// BorderRadiusControl  (4-corner)
// ─────────────────────────────────────────────────────────────────────────────

export interface BorderRadiusValue {
    topLeft: string | number;
    topRight: string | number;
    bottomRight: string | number;
    bottomLeft: string | number;
}

const CORNERS = [
    { key: "topLeft" as const, icon: "⌜", label: "Sol Üst" },
    { key: "topRight" as const, icon: "⌝", label: "Sağ Üst" },
    { key: "bottomRight" as const, icon: "⌟", label: "Sağ Alt" },
    { key: "bottomLeft" as const, icon: "⌞", label: "Sol Alt" },
];

export interface BorderRadiusControlProps {
    value: BorderRadiusValue | string | number;
    onChange: (cssString: string) => void;
}

function parseBorderRadius(raw: string | number | undefined): BorderRadiusValue {
    const str = raw == null ? "0px" : String(raw).trim();
    const parts = str.split(/\s+/);
    if (parts.length === 1) {
        return { topLeft: parts[0], topRight: parts[0], bottomRight: parts[0], bottomLeft: parts[0] };
    }
    if (parts.length === 2) {
        return { topLeft: parts[0], topRight: parts[1], bottomRight: parts[0], bottomLeft: parts[1] };
    }
    if (parts.length >= 4) {
        return { topLeft: parts[0], topRight: parts[1], bottomRight: parts[2], bottomLeft: parts[3] };
    }
    return { topLeft: str, topRight: str, bottomRight: str, bottomLeft: str };
}

export function BorderRadiusControl({ value, onChange }: BorderRadiusControlProps) {
    const [linked, setLinked] = useState(true);

    const parsed = typeof value === "object" && value !== null
        ? (value as BorderRadiusValue)
        : parseBorderRadius(value as string | number);

    const emit = (updated: BorderRadiusValue) => {
        const { topLeft: tl, topRight: tr, bottomRight: br, bottomLeft: bl } = updated;
        if (tl === tr && tr === br && br === bl) {
            onChange(String(tl));
        } else {
            onChange(`${tl} ${tr} ${br} ${bl}`);
        }
    };

    const handleCornerChange = (corner: keyof BorderRadiusValue, v: string) => {
        if (linked) {
            const all = { topLeft: v, topRight: v, bottomRight: v, bottomLeft: v };
            emit(all);
        } else {
            emit({ ...parsed, [corner]: v });
        }
    };

    return (
        <div className="flex flex-col gap-1.5 w-full">
            <div className="grid grid-cols-2 gap-x-2 gap-y-1.5">
                {CORNERS.map(({ key, icon, label }) => (
                    <div key={key} className="flex items-center gap-1.5" title={label}>
                        <span className="text-[0.7rem] text-slate-500 w-3 text-center shrink-0">
                            {icon}
                        </span>
                        <CSSValueInput
                            value={linked ? parsed.topLeft : parsed[key]}
                            onChange={(v) => handleCornerChange(key, v)}
                            units={["px", "rem", "%"]}
                            sliderMax={80}
                            min={0}
                            compact
                        />
                    </div>
                ))}
            </div>
            <button
                className={`flex items-center justify-center gap-1 py-[3px] px-2 rounded cursor-pointer text-[0.65rem] transition-all ${
                    linked
                        ? "border border-solid border-blue-600 bg-blue-600/10 text-blue-400"
                        : "border border-dashed border-slate-700 bg-transparent text-gray-500 hover:border-blue-500 hover:text-blue-400"
                }`}
                onClick={() => setLinked((l) => !l)}
                title={linked ? "Köşeleri ayrı ayrı düzenle" : "Tüm köşeleri birleştir"}
            >
                {linked ? "🔗 Bağlı" : "⛓ Bağla"}
            </button>
        </div>
    );
}
