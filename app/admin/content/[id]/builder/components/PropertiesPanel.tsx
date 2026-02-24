"use client";

import { useState } from "react";
import { MediaPickerModal } from "./MediaPickerModal";
import { CSSValueInput, SpacingControl, BorderRadiusControl } from "./CSSValueInput";
import type { SpacingValue } from "./CSSValueInput";
import { useBuilderStore } from "@/core/page-builder/store";
import type {
    BlockInstance,
    HeadingProps,
    TextProps,
    ImageProps,
    ButtonProps,
    DividerProps,
    SpacerProps,
    SectionProps,
    ColumnsProps,
    ColumnSettings,
    HeroProps,
    CardProps,
    HtmlProps,
    VideoProps,
    AlignValue,
    PageSettings,
    PageLayoutPreset,
} from "@/core/page-builder/types";
import { getBlockDefinition } from "@/core/page-builder/blocks/definitions";

// ---------------------------------------------------------------------------
// Shared Tailwind class constants
// ---------------------------------------------------------------------------
const CLS_INPUT = "w-full py-1.5 px-2 rounded-[5px] border border-builder-line bg-slate-900 text-slate-200 text-[0.8rem] outline-none resize-y focus:border-blue-500";

// ---------------------------------------------------------------------------
// Shared field components
// ---------------------------------------------------------------------------

function FieldRow({ label, children }: { label: string; children: React.ReactNode }) {
    return (
        <div className="flex flex-col gap-1">
            <label className="text-[0.7rem] font-semibold uppercase tracking-wide text-slate-500">
                {label}
            </label>
            <div>{children}</div>
        </div>
    );
}

function SectionDivider({ label }: { label: string }) {
    return (
        <div className="flex items-center gap-2 mt-2 mb-1 text-[0.65rem] font-bold uppercase tracking-wider text-slate-700">
            <div className="flex-1 h-px bg-builder-edge" />
            <span className="text-slate-600 whitespace-nowrap">{label}</span>
            <div className="flex-1 h-px bg-builder-edge" />
        </div>
    );
}

function TextInput({ value, onChange, placeholder, multiline }: {
    value: string;
    onChange: (v: string) => void;
    placeholder?: string;
    multiline?: boolean;
}) {
    if (multiline) {
        return (
            <textarea
                className={CLS_INPUT}
                value={value}
                onChange={(e) => onChange(e.target.value)}
                placeholder={placeholder}
                rows={4}
            />
        );
    }
    return (
        <input
            type="text"
            className={CLS_INPUT}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder={placeholder}
        />
    );
}


function ColorInput({ value, onChange }: { value: string; onChange: (v: string) => void }) {
    return (
        <div className="flex gap-1.5 items-center">
            <input
                type="color"
                className="w-8 h-7 rounded border border-builder-line bg-transparent cursor-pointer p-0.5"
                value={value.startsWith("#") ? value : "#000000"}
                onChange={(e) => onChange(e.target.value)}
            />
            <input
                type="text"
                className={CLS_INPUT}
                value={value}
                onChange={(e) => onChange(e.target.value)}
                placeholder="#000000 veya transparent"
            />
        </div>
    );
}

function SelectInput<T extends string>({ value, onChange, options }: {
    value: T;
    onChange: (v: T) => void;
    options: { value: T; label: string }[];
}) {
    return (
        <select className={CLS_INPUT} value={value} onChange={(e) => onChange(e.target.value as T)}>
            {options.map((o) => (
                <option key={o.value} value={o.value}>{o.label}</option>
            ))}
        </select>
    );
}

function ToggleInput({ value, onChange, label }: { value: boolean; onChange: (v: boolean) => void; label?: string }) {
    return (
        <label className="flex items-center gap-2 cursor-pointer">
            <input
                type="checkbox"
                checked={value}
                onChange={(e) => onChange(e.target.checked)}
                className="w-4 h-4"
            />
            {label && <span className="text-sm">{label}</span>}
        </label>
    );
}

function AlignButtons({ value, onChange }: { value: AlignValue; onChange: (v: AlignValue) => void }) {
    const options: AlignValue[] = ["left", "center", "right"];
    const labels: Record<AlignValue, string> = { left: "◀", center: "↔", right: "▶" };
    return (
        <div className="flex gap-1">
            {options.map((a) => (
                <button
                    key={a}
                    onClick={() => onChange(a)}
                    className={`flex-1 py-[5px] rounded border cursor-pointer text-[0.85rem] transition-all ${
                        value === a
                            ? "bg-blue-600 border-blue-600 text-white"
                            : "border-builder-line bg-transparent text-slate-500 hover:bg-builder-line hover:text-slate-200"
                    }`}
                >
                    {labels[a]}
                </button>
            ))}
        </div>
    );
}

/** Arkaplan görseli alanı: URL input + medya seçici butonu + önizleme + kaldır. */
function BackgroundImageField({ value, onChange }: { value: string; onChange: (v: string) => void }) {
    const [pickerOpen, setPickerOpen] = useState(false);
    return (
        <>
            <FieldRow label="Arkaplan görseli">
                <div className="flex gap-1">
                    <TextInput
                        value={value ?? ""}
                        onChange={onChange}
                        placeholder="https://... veya mediadan seç"
                    />
                    <button
                        className="shrink-0 w-8 h-8 flex items-center justify-center border border-slate-700 rounded-md bg-slate-800 text-slate-400 cursor-pointer text-[0.9rem] transition-all hover:border-blue-500 hover:bg-blue-500/15 hover:text-blue-400"
                        onClick={() => setPickerOpen(true)}
                        title="Medya kütüphanesinden seç"
                    >
                        🖼
                    </button>
                </div>
            </FieldRow>
            {value && (
                <div className="relative my-1 mb-2 rounded-md overflow-hidden border border-slate-700 bg-slate-900 max-h-[120px] flex items-center justify-center">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={value} alt="" className="max-h-[120px] max-w-full object-contain block" />
                    <button
                        className="absolute top-1 right-1 w-5 h-5 flex items-center justify-center bg-black/60 border-none rounded-full text-slate-200 text-[0.6rem] cursor-pointer transition-colors hover:bg-red-500/80"
                        onClick={() => onChange("")}
                        title="Görseli kaldır"
                    >
                        ✕
                    </button>
                </div>
            )}
            <MediaPickerModal
                open={pickerOpen}
                onClose={() => setPickerOpen(false)}
                onSelect={(url) => { onChange(url); }}
            />
        </>
    );
}

function PaddingGroup({ top, right, bottom, left, onChange }: {
    top: number; right: number; bottom: number; left: number;
    onChange: (side: "top" | "right" | "bottom" | "left", v: number) => void;
}) {
    const sv: SpacingValue = {
        top: `${top}px`, right: `${right}px`,
        bottom: `${bottom}px`, left: `${left}px`,
    };
    return (
        <SpacingControl
            value={sv}
            onChange={(side, v) => {
                const n = parseFloat(v) || 0;
                onChange(side, n);
            }}
        />
    );
}

// ---------------------------------------------------------------------------
// PAGE SETTINGS EDITOR
// ---------------------------------------------------------------------------

export function PageSettingsEditor() {
    const { pageSettings, updatePageSettings } = useBuilderStore();
    const upd = (patch: Partial<PageSettings>) => updatePageSettings(patch);
    const [tab, setTab] = useState<"layout" | "style">("layout");

    return (
        <div className="flex-1 overflow-y-auto p-3 flex flex-col gap-2.5 builder-scrollbar">
            <div className="flex gap-0.5 p-1 bg-slate-900 rounded-lg mb-1">
                <button
                    className={`flex-1 py-[5px] px-2 rounded-md border-none cursor-pointer text-[0.72rem] font-semibold transition-all whitespace-nowrap ${
                        tab === "layout" ? "bg-builder-active text-blue-400" : "bg-transparent text-slate-500 hover:text-slate-200"
                    }`}
                    onClick={() => setTab("layout")}
                >
                    Düzen
                </button>
                <button
                    className={`flex-1 py-[5px] px-2 rounded-md border-none cursor-pointer text-[0.72rem] font-semibold transition-all whitespace-nowrap ${
                        tab === "style" ? "bg-builder-active text-blue-400" : "bg-transparent text-slate-500 hover:text-slate-200"
                    }`}
                    onClick={() => setTab("style")}
                >
                    Stil
                </button>
            </div>

            {tab === "layout" && (
                <>
                    <SectionDivider label="Sayfa Düzeni" />
                    <FieldRow label="Düzen modu">
                        <SelectInput<PageLayoutPreset>
                            value={pageSettings.layoutPreset}
                            onChange={(v) => upd({ layoutPreset: v })}
                            options={[
                                { value: "boxed", label: "📦 Boxed (max-width)" },
                                { value: "full-width", label: "↔ Full Width" },
                                { value: "narrow", label: "📃 Narrow (dar sütun)" },
                            ]}
                        />
                    </FieldRow>
                    <FieldRow label="İçerik genişliği">
                        <SelectInput
                            value={pageSettings.contentWidth}
                            onChange={(v) => upd({ contentWidth: v })}
                            options={[
                                { value: "1400px", label: "1400px (Geniş)" },
                                { value: "1200px", label: "1200px (Standart)" },
                                { value: "1024px", label: "1024px (Tablet)" },
                                { value: "900px", label: "900px" },
                                { value: "760px", label: "760px (Dar)" },
                                { value: "100%", label: "100% (Tam genişlik)" },
                            ]}
                        />
                    </FieldRow>
                    <FieldRow label="Veya özel genişlik">
                        <TextInput
                            value={pageSettings.contentWidth}
                            onChange={(v) => upd({ contentWidth: v })}
                            placeholder="1200px"
                        />
                    </FieldRow>
                    <SectionDivider label="Sayfa Boşlukları" />
                    <FieldRow label="Üst padding">
                        <CSSValueInput value={pageSettings.paddingTop ?? 0} onChange={(v) => upd({ paddingTop: parseFloat(v) || 0 })} units={["px", "rem"]} sliderMax={200} />
                    </FieldRow>
                    <FieldRow label="Alt padding">
                        <CSSValueInput value={pageSettings.paddingBottom ?? 0} onChange={(v) => upd({ paddingBottom: parseFloat(v) || 0 })} units={["px", "rem"]} sliderMax={200} />
                    </FieldRow>
                </>
            )}

            {tab === "style" && (
                <>
                    <SectionDivider label="Arkaplan" />
                    <FieldRow label="Arkaplan rengi">
                        <ColorInput value={pageSettings.backgroundColor} onChange={(v) => upd({ backgroundColor: v })} />
                    </FieldRow>
                    <BackgroundImageField value={pageSettings.backgroundImage ?? ""} onChange={(v) => upd({ backgroundImage: v })} />
                    <SectionDivider label="Tipografi" />
                    <FieldRow label="Font ailesi">
                        <SelectInput
                            value={pageSettings.fontFamily ?? "inherit"}
                            onChange={(v) => upd({ fontFamily: v })}
                            options={[
                                { value: "inherit", label: "Sistem fontu" },
                                { value: "Inter, sans-serif", label: "Inter" },
                                { value: "Roboto, sans-serif", label: "Roboto" },
                                { value: "Outfit, sans-serif", label: "Outfit" },
                                { value: "Playfair Display, serif", label: "Playfair Display" },
                                { value: "Merriweather, serif", label: "Merriweather" },
                                { value: "Georgia, serif", label: "Georgia" },
                                { value: "monospace", label: "Monospace" },
                            ]}
                        />
                    </FieldRow>
                    <FieldRow label="Metin rengi">
                        <ColorInput value={pageSettings.textColor ?? "#111827"} onChange={(v) => upd({ textColor: v })} />
                    </FieldRow>
                    <SectionDivider label="Diğer" />
                    <FieldRow label="Scrollbar gizle">
                        <ToggleInput value={pageSettings.hideScrollbar ?? false} onChange={(v) => upd({ hideScrollbar: v })} label="Scrollbar'ı gizle" />
                    </FieldRow>
                </>
            )}
        </div>
    );
}

// ---------------------------------------------------------------------------
// Per-block property editors
// ---------------------------------------------------------------------------

function HeadingEditor({ block }: { block: BlockInstance }) {
    const { updateBlock } = useBuilderStore();
    const p = block.props as HeadingProps;
    const upd = (patch: Partial<HeadingProps>) => updateBlock(block.id, patch);

    return (
        <>
            <FieldRow label="Metin"><TextInput value={p.text} onChange={(v) => upd({ text: v })} multiline /></FieldRow>
            <FieldRow label="Seviye">
                <SelectInput value={String(p.level)} onChange={(v) => upd({ level: Number(v) as HeadingProps["level"] })}
                    options={[1, 2, 3, 4, 5, 6].map((n) => ({ value: String(n), label: `H${n}` }))}
                />
            </FieldRow>
            <FieldRow label="Hizalama"><AlignButtons value={p.align} onChange={(v) => upd({ align: v })} /></FieldRow>
            <FieldRow label="Renk"><ColorInput value={p.color} onChange={(v) => upd({ color: v })} /></FieldRow>
            <FieldRow label="Font ağırlığı">
                <SelectInput value={p.fontWeight ?? "bold"} onChange={(v) => upd({ fontWeight: v })}
                    options={[
                        { value: "normal", label: "Normal" },
                        { value: "semibold", label: "Semibold" },
                        { value: "bold", label: "Bold" },
                        { value: "extrabold", label: "Extra Bold" },
                    ]}
                />
            </FieldRow>
            <FieldRow label="Font boyutu"><TextInput value={p.fontSize ?? ""} onChange={(v) => upd({ fontSize: v })} placeholder="2rem" /></FieldRow>
        </>
    );
}

function TextEditor({ block }: { block: BlockInstance }) {
    const { updateBlock } = useBuilderStore();
    const p = block.props as TextProps;
    const upd = (patch: Partial<TextProps>) => updateBlock(block.id, patch);

    return (
        <>
            <FieldRow label="İçerik"><TextInput value={p.text} onChange={(v) => upd({ text: v })} multiline /></FieldRow>
            <FieldRow label="Hizalama"><AlignButtons value={p.align} onChange={(v) => upd({ align: v })} /></FieldRow>
            <FieldRow label="Renk"><ColorInput value={p.color} onChange={(v) => upd({ color: v })} /></FieldRow>
            <FieldRow label="Font boyutu"><TextInput value={p.fontSize ?? "1rem"} onChange={(v) => upd({ fontSize: v })} placeholder="1rem" /></FieldRow>
        </>
    );
}

function ImageEditor({ block }: { block: BlockInstance }) {
    const { updateBlock } = useBuilderStore();
    const p = block.props as ImageProps;
    const upd = (patch: Partial<ImageProps>) => updateBlock(block.id, patch);
    const [pickerOpen, setPickerOpen] = useState(false);

    return (
        <>
            <FieldRow label="Görsel URL">
                <div className="flex gap-1">
                    <TextInput
                        value={p.src ?? ""}
                        onChange={(v) => upd({ src: v })}
                        placeholder="https://... veya mediadan seç"
                    />
                    <button
                        className="shrink-0 w-8 h-8 flex items-center justify-center border border-slate-700 rounded-md bg-slate-800 text-slate-400 cursor-pointer text-[0.9rem] transition-all hover:border-blue-500 hover:bg-blue-500/15 hover:text-blue-400"
                        onClick={() => setPickerOpen(true)}
                        title="Medya kütüphanesinden seç"
                    >
                        🖼
                    </button>
                </div>
            </FieldRow>

            {p.src && (
                <div className="relative my-1 mb-2 rounded-md overflow-hidden border border-slate-700 bg-slate-900 max-h-[120px] flex items-center justify-center">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={p.src} alt={p.alt} className="max-h-[120px] max-w-full object-contain block" />
                    <button
                        className="absolute top-1 right-1 w-5 h-5 flex items-center justify-center bg-black/60 border-none rounded-full text-slate-200 text-[0.6rem] cursor-pointer transition-colors hover:bg-red-500/80"
                        onClick={() => upd({ src: "" })}
                        title="Görseli kaldır"
                    >✕</button>
                </div>
            )}

            <FieldRow label="Alt metin"><TextInput value={p.alt} onChange={(v) => upd({ alt: v })} /></FieldRow>
            <FieldRow label="Aspect Ratio"><TextInput value={p.aspectRatio ?? "16/9"} onChange={(v) => upd({ aspectRatio: v })} placeholder="16/9" /></FieldRow>
            <FieldRow label="Object Fit">
                <SelectInput value={p.objectFit} onChange={(v) => upd({ objectFit: v })}
                    options={[
                        { value: "cover", label: "Cover" },
                        { value: "contain", label: "Contain" },
                        { value: "fill", label: "Fill" },
                    ]}
                />
            </FieldRow>
            <FieldRow label="Border Radius"><TextInput value={p.borderRadius} onChange={(v) => upd({ borderRadius: v })} placeholder="0px" /></FieldRow>
            <FieldRow label="Altyazı"><TextInput value={p.caption ?? ""} onChange={(v) => upd({ caption: v })} /></FieldRow>

            <MediaPickerModal
                open={pickerOpen}
                onClose={() => setPickerOpen(false)}
                onSelect={(url) => { upd({ src: url }); }}
            />
        </>
    );
}

function ButtonEditor({ block }: { block: BlockInstance }) {
    const { updateBlock } = useBuilderStore();
    const p = block.props as ButtonProps;
    const upd = (patch: Partial<ButtonProps>) => updateBlock(block.id, patch);

    return (
        <>
            <FieldRow label="Etiket"><TextInput value={p.label} onChange={(v) => upd({ label: v })} /></FieldRow>
            <FieldRow label="Link (href)"><TextInput value={p.href} onChange={(v) => upd({ href: v })} placeholder="https://..." /></FieldRow>
            <FieldRow label="Varyant">
                <SelectInput value={p.variant} onChange={(v) => upd({ variant: v })}
                    options={[
                        { value: "primary", label: "Primary" },
                        { value: "secondary", label: "Secondary" },
                        { value: "outline", label: "Outline" },
                        { value: "ghost", label: "Ghost" },
                    ]}
                />
            </FieldRow>
            <FieldRow label="Boyut">
                <SelectInput value={p.size} onChange={(v) => upd({ size: v })}
                    options={[{ value: "sm", label: "Küçük" }, { value: "md", label: "Orta" }, { value: "lg", label: "Büyük" }]}
                />
            </FieldRow>
            <FieldRow label="Hizalama"><AlignButtons value={p.align} onChange={(v) => upd({ align: v })} /></FieldRow>
            <FieldRow label="Arkaplan"><ColorInput value={p.backgroundColor ?? "#2563eb"} onChange={(v) => upd({ backgroundColor: v })} /></FieldRow>
            <FieldRow label="Metin rengi"><ColorInput value={p.textColor ?? "#ffffff"} onChange={(v) => upd({ textColor: v })} /></FieldRow>
            <FieldRow label="Border radius"><TextInput value={p.borderRadius ?? "0.5rem"} onChange={(v) => upd({ borderRadius: v })} /></FieldRow>
            <FieldRow label="Yeni sekmede aç"><ToggleInput value={p.openInNewTab} onChange={(v) => upd({ openInNewTab: v })} /></FieldRow>
        </>
    );
}

function DividerEditor({ block }: { block: BlockInstance }) {
    const { updateBlock } = useBuilderStore();
    const p = block.props as DividerProps;
    const upd = (patch: Partial<DividerProps>) => updateBlock(block.id, patch);

    return (
        <>
            <FieldRow label="Renk"><ColorInput value={p.color} onChange={(v) => upd({ color: v })} /></FieldRow>
            <FieldRow label="Kalınlık">
                <CSSValueInput value={`${p.thickness}px`} onChange={(v) => upd({ thickness: parseFloat(v) || 1 })} units={["px"]} sliderMax={20} min={1} />
            </FieldRow>
            <FieldRow label="Stil">
                <SelectInput value={p.style} onChange={(v) => upd({ style: v })}
                    options={[{ value: "solid", label: "Solid" }, { value: "dashed", label: "Dashed" }, { value: "dotted", label: "Dotted" }]}
                />
            </FieldRow>
            <FieldRow label="Üst boşluk">
                <CSSValueInput value={`${p.marginTop}px`} onChange={(v) => upd({ marginTop: parseFloat(v) || 0 })} units={["px", "rem"]} sliderMax={120} />
            </FieldRow>
            <FieldRow label="Alt boşluk">
                <CSSValueInput value={`${p.marginBottom}px`} onChange={(v) => upd({ marginBottom: parseFloat(v) || 0 })} units={["px", "rem"]} sliderMax={120} />
            </FieldRow>
        </>
    );
}

function SpacerEditor({ block }: { block: BlockInstance }) {
    const { updateBlock } = useBuilderStore();
    const p = block.props as SpacerProps;
    return (
        <FieldRow label="Yükseklik">
            <CSSValueInput value={`${p.height}px`} onChange={(v) => updateBlock(block.id, { height: parseFloat(v) || 0 } as Partial<SpacerProps>)} units={["px", "rem"]} sliderMax={600} min={0} />
        </FieldRow>
    );
}

// ---------------------------------------------------------------------------
// SECTION EDITOR
// ---------------------------------------------------------------------------
function SectionEditor({ block }: { block: BlockInstance }) {
    const { updateBlock } = useBuilderStore();
    const p = block.props as SectionProps;
    const upd = (patch: Partial<SectionProps>) => updateBlock(block.id, patch);
    const [tab, setTab] = useState<"layout" | "style">("layout");

    return (
        <>
            <div className="flex gap-0.5 p-1 bg-slate-900 rounded-lg mb-1">
                <button className={`flex-1 py-[5px] px-2 rounded-md border-none cursor-pointer text-[0.72rem] font-semibold transition-all whitespace-nowrap ${tab === "layout" ? "bg-builder-active text-blue-400" : "bg-transparent text-slate-500 hover:text-slate-200"}`} onClick={() => setTab("layout")}>Düzen</button>
                <button className={`flex-1 py-[5px] px-2 rounded-md border-none cursor-pointer text-[0.72rem] font-semibold transition-all whitespace-nowrap ${tab === "style" ? "bg-builder-active text-blue-400" : "bg-transparent text-slate-500 hover:text-slate-200"}`} onClick={() => setTab("style")}>Stil</button>
            </div>

            {tab === "layout" && (
                <>
                    <SectionDivider label="Genişlik" />
                    <FieldRow label="Max genişlik (dış)">
                        <SelectInput
                            value={p.maxWidth ?? "100%"}
                            onChange={(v) => upd({ maxWidth: v })}
                            options={[
                                { value: "100%", label: "Tam genişlik" },
                                { value: "1400px", label: "1400px" },
                                { value: "1200px", label: "1200px" },
                                { value: "1024px", label: "1024px" },
                                { value: "900px", label: "900px" },
                            ]}
                        />
                    </FieldRow>
                    <FieldRow label="Özel dış genişlik">
                        <TextInput value={p.maxWidth ?? "100%"} onChange={(v) => upd({ maxWidth: v })} placeholder="100%" />
                    </FieldRow>
                    <FieldRow label="İç içerik genişliği">
                        <SelectInput
                            value={p.innerMaxWidth ?? "none"}
                            onChange={(v) => upd({ innerMaxWidth: v === "none" ? undefined : v })}
                            options={[
                                { value: "none", label: "Yok" },
                                { value: "1200px", label: "1200px" },
                                { value: "1024px", label: "1024px" },
                                { value: "900px", label: "900px" },
                                { value: "760px", label: "760px" },
                            ]}
                        />
                    </FieldRow>
                    <SectionDivider label="Boşluklar" />
                    <FieldRow label="Padding">
                        <SpacingControl
                            value={{
                                top: `${p.paddingTop}px`,
                                right: `${p.paddingRight}px`,
                                bottom: `${p.paddingBottom}px`,
                                left: `${p.paddingLeft}px`,
                            }}
                            onChange={(side, v) => upd({ [`padding${side.charAt(0).toUpperCase() + side.slice(1)}`]: parseFloat(v) || 0 })}
                        />
                    </FieldRow>
                    <FieldRow label="Gap (sütun arası)">
                        <CSSValueInput value={`${p.gap}px`} onChange={(v) => upd({ gap: parseFloat(v) || 0 })} units={["px", "rem"]} sliderMax={80} />
                    </FieldRow>
                </>
            )}

            {tab === "style" && (
                <>
                    <SectionDivider label="Arkaplan" />
                    <FieldRow label="Arkaplan rengi"><ColorInput value={p.backgroundColor} onChange={(v) => upd({ backgroundColor: v })} /></FieldRow>
                    <BackgroundImageField value={p.backgroundImage ?? ""} onChange={(v) => upd({ backgroundImage: v })} />
                </>
            )}
        </>
    );
}

// ---------------------------------------------------------------------------
// COLUMNS EDITOR
// ---------------------------------------------------------------------------
function ColumnsEditor({ block }: { block: BlockInstance }) {
    const { updateBlock } = useBuilderStore();
    const p = block.props as ColumnsProps;
    const upd = (patch: Partial<ColumnsProps>) => updateBlock(block.id, patch);
    const [tab, setTab] = useState<"layout" | "columns" | "style">("layout");

    const updColumn = (colIdx: number, patch: Partial<ColumnSettings>) => {
        const current = p.columnSettings ? [...p.columnSettings] : Array.from({ length: p.columns }, () => ({}));
        current[colIdx] = { ...current[colIdx], ...patch };
        upd({ columnSettings: current });
    };

    return (
        <>
            <div className="flex gap-0.5 p-1 bg-slate-900 rounded-lg mb-1">
                <button className={`flex-1 py-[5px] px-2 rounded-md border-none cursor-pointer text-[0.72rem] font-semibold transition-all whitespace-nowrap ${tab === "layout" ? "bg-builder-active text-blue-400" : "bg-transparent text-slate-500 hover:text-slate-200"}`} onClick={() => setTab("layout")}>Düzen</button>
                <button className={`flex-1 py-[5px] px-2 rounded-md border-none cursor-pointer text-[0.72rem] font-semibold transition-all whitespace-nowrap ${tab === "columns" ? "bg-builder-active text-blue-400" : "bg-transparent text-slate-500 hover:text-slate-200"}`} onClick={() => setTab("columns")}>Sütunlar</button>
                <button className={`flex-1 py-[5px] px-2 rounded-md border-none cursor-pointer text-[0.72rem] font-semibold transition-all whitespace-nowrap ${tab === "style" ? "bg-builder-active text-blue-400" : "bg-transparent text-slate-500 hover:text-slate-200"}`} onClick={() => setTab("style")}>Stil</button>
            </div>

            {tab === "layout" && (
                <>
                    <SectionDivider label="Izgara Ayarları" />
                    <FieldRow label="Sütun aralığı (gap)">
                        <CSSValueInput value={`${p.gap}px`} onChange={(v) => upd({ gap: parseFloat(v) || 0 })} units={["px", "rem"]} sliderMax={80} />
                    </FieldRow>
                    <FieldRow label="Dikey hizalama">
                        <SelectInput value={p.verticalAlign} onChange={(v) => upd({ verticalAlign: v })}
                            options={[{ value: "start", label: "↑ Üst" }, { value: "center", label: "↕ Orta" }, { value: "end", label: "↓ Alt" }]}
                        />
                    </FieldRow>
                    <SectionDivider label="Sütun Genişlikleri" />
                    {Array.from({ length: p.columns }).map((_, i) => {
                        const widths = p.columnWidths ?? Array.from({ length: p.columns }, () => "1fr");
                        return (
                            <FieldRow key={i} label={`Sütun ${i + 1}`}>
                                <TextInput
                                    value={widths[i] ?? "1fr"}
                                    onChange={(v) => {
                                        const updated = [...widths];
                                        updated[i] = v;
                                        upd({ columnWidths: updated });
                                    }}
                                    placeholder="1fr"
                                />
                            </FieldRow>
                        );
                    })}
                    <p className="text-[0.7rem] text-gray-500 my-1">
                        CSS grid değerleri: 1fr, 2fr, 200px, 30%, vb.
                    </p>
                    <SectionDivider label="Padding (Tüm sütunlar)" />
                    <SpacingControl
                        value={{
                            top: `${p.paddingTop}px`,
                            right: `${p.paddingRight ?? 0}px`,
                            bottom: `${p.paddingBottom}px`,
                            left: `${p.paddingLeft ?? 0}px`,
                        }}
                        onChange={(side, v) => upd({ [`padding${side.charAt(0).toUpperCase() + side.slice(1)}`]: parseFloat(v) || 0 })}
                    />
                </>
            )}

            {tab === "columns" && (
                <>
                    {Array.from({ length: p.columns }).map((_, i) => {
                        const cs: ColumnSettings = p.columnSettings?.[i] ?? {};
                        return (
                            <div key={i}>
                                <SectionDivider label={`Sütun ${i + 1}`} />
                                <FieldRow label="Arkaplan">
                                    <ColorInput value={cs.backgroundColor ?? "transparent"} onChange={(v) => updColumn(i, { backgroundColor: v })} />
                                </FieldRow>
                                <FieldRow label="Dikey hizalama">
                                    <SelectInput value={cs.verticalAlign ?? "start"} onChange={(v) => updColumn(i, { verticalAlign: v })}
                                        options={[{ value: "start", label: "↑ Üst" }, { value: "center", label: "↕ Orta" }, { value: "end", label: "↓ Alt" }]}
                                    />
                                </FieldRow>
                                <FieldRow label="Padding">
                                    <PaddingGroup
                                        top={cs.paddingTop ?? 0}
                                        right={cs.paddingRight ?? 0}
                                        bottom={cs.paddingBottom ?? 0}
                                        left={cs.paddingLeft ?? 0}
                                        onChange={(side, v) => updColumn(i, { [`padding${side.charAt(0).toUpperCase() + side.slice(1)}`]: v })}
                                    />
                                </FieldRow>
                                <FieldRow label="Border radius">
                                    <TextInput value={cs.borderRadius ?? "0"} onChange={(v) => updColumn(i, { borderRadius: v })} placeholder="0px" />
                                </FieldRow>
                            </div>
                        );
                    })}
                </>
            )}

            {tab === "style" && (
                <>
                    <SectionDivider label="Arkaplan (tümü)" />
                    <FieldRow label="Arkaplan rengi"><ColorInput value={p.backgroundColor} onChange={(v) => upd({ backgroundColor: v })} /></FieldRow>
                </>
            )}
        </>
    );
}

function HeroEditor({ block }: { block: BlockInstance }) {
    const { updateBlock } = useBuilderStore();
    const p = block.props as HeroProps;
    const upd = (patch: Partial<HeroProps>) => updateBlock(block.id, patch);

    return (
        <>
            <FieldRow label="Başlık"><TextInput value={p.heading} onChange={(v) => upd({ heading: v })} multiline /></FieldRow>
            <FieldRow label="Alt başlık"><TextInput value={p.subheading} onChange={(v) => upd({ subheading: v })} multiline /></FieldRow>
            <FieldRow label="Buton etiketi"><TextInput value={p.buttonLabel} onChange={(v) => upd({ buttonLabel: v })} /></FieldRow>
            <FieldRow label="Buton linki"><TextInput value={p.buttonHref} onChange={(v) => upd({ buttonHref: v })} /></FieldRow>
            <FieldRow label="Arkaplan rengi"><ColorInput value={p.backgroundColor} onChange={(v) => upd({ backgroundColor: v })} /></FieldRow>
            <FieldRow label="Metin rengi"><ColorInput value={p.textColor} onChange={(v) => upd({ textColor: v })} /></FieldRow>
            <FieldRow label="Hizalama"><AlignButtons value={p.align} onChange={(v) => upd({ align: v })} /></FieldRow>
            <FieldRow label="Yükseklik"><TextInput value={p.height ?? "500px"} onChange={(v) => upd({ height: v })} placeholder="500px" /></FieldRow>
            <BackgroundImageField value={p.backgroundImage ?? ""} onChange={(v) => upd({ backgroundImage: v })} />
            <FieldRow label="Overlay opaklık"><CSSValueInput value={`${Math.round((p.overlayOpacity ?? 0.5) * 100)}%`} onChange={(v) => upd({ overlayOpacity: (parseFloat(v) || 0) / 100 })} units={["%"]} sliderMax={100} min={0} /></FieldRow>
        </>
    );
}

function CardEditor({ block }: { block: BlockInstance }) {
    const { updateBlock } = useBuilderStore();
    const p = block.props as CardProps;
    const upd = (patch: Partial<CardProps>) => updateBlock(block.id, patch);

    return (
        <>
            <FieldRow label="Başlık"><TextInput value={p.title} onChange={(v) => upd({ title: v })} /></FieldRow>
            <FieldRow label="Açıklama"><TextInput value={p.description} onChange={(v) => upd({ description: v })} multiline /></FieldRow>
            <FieldRow label="Görsel URL"><TextInput value={p.imageSrc ?? ""} onChange={(v) => upd({ imageSrc: v })} /></FieldRow>
            <FieldRow label="Buton etiketi"><TextInput value={p.buttonLabel ?? ""} onChange={(v) => upd({ buttonLabel: v })} /></FieldRow>
            <FieldRow label="Buton linki"><TextInput value={p.buttonHref ?? ""} onChange={(v) => upd({ buttonHref: v })} /></FieldRow>
            <FieldRow label="Arkaplan"><ColorInput value={p.backgroundColor} onChange={(v) => upd({ backgroundColor: v })} /></FieldRow>
            <FieldRow label="Border radius"><TextInput value={p.borderRadius} onChange={(v) => upd({ borderRadius: v })} /></FieldRow>
            <FieldRow label="Gölge"><ToggleInput value={p.shadow} onChange={(v) => upd({ shadow: v })} label="Gölge göster" /></FieldRow>
        </>
    );
}

function HtmlEditor({ block }: { block: BlockInstance }) {
    const { updateBlock } = useBuilderStore();
    const p = block.props as HtmlProps;

    return (
        <FieldRow label="HTML">
            <textarea
                className={`${CLS_INPUT} font-mono !text-[0.7rem]`}
                value={p.html}
                onChange={(e) => updateBlock(block.id, { html: e.target.value } as Partial<HtmlProps>)}
                rows={10}
                spellCheck={false}
            />
        </FieldRow>
    );
}

function VideoEditor({ block }: { block: BlockInstance }) {
    const { updateBlock } = useBuilderStore();
    const p = block.props as VideoProps;
    const upd = (patch: Partial<VideoProps>) => updateBlock(block.id, patch);

    return (
        <>
            <FieldRow label="URL"><TextInput value={p.url} onChange={(v) => upd({ url: v })} placeholder="YouTube / Vimeo / MP4 URL" /></FieldRow>
            <FieldRow label="Aspect Ratio">
                <SelectInput value={p.aspectRatio} onChange={(v) => upd({ aspectRatio: v })}
                    options={[{ value: "16/9", label: "16:9" }, { value: "4/3", label: "4:3" }, { value: "1/1", label: "1:1" }]}
                />
            </FieldRow>
            <FieldRow label="Otomatik oynat"><ToggleInput value={p.autoplay} onChange={(v) => upd({ autoplay: v })} /></FieldRow>
            <FieldRow label="Sessiz"><ToggleInput value={p.muted} onChange={(v) => upd({ muted: v })} /></FieldRow>
            <FieldRow label="Döngü"><ToggleInput value={p.loop} onChange={(v) => upd({ loop: v })} /></FieldRow>
            <FieldRow label="Kontroller"><ToggleInput value={p.controls} onChange={(v) => upd({ controls: v })} /></FieldRow>
        </>
    );
}

// ---------------------------------------------------------------------------
// Block router
// ---------------------------------------------------------------------------

function findBlockLocal(blocks: BlockInstance[], id: string): BlockInstance | null {
    for (const b of blocks) {
        if (b.id === id) return b;
        if (b.children) {
            for (const col of b.children) {
                const found = findBlockLocal(col, id);
                if (found) return found;
            }
        }
    }
    return null;
}

function BlockEditor({ block }: { block: BlockInstance }) {
    switch (block.type) {
        case "heading": return <HeadingEditor block={block} />;
        case "text": return <TextEditor block={block} />;
        case "image": return <ImageEditor block={block} />;
        case "button": return <ButtonEditor block={block} />;
        case "divider": return <DividerEditor block={block} />;
        case "spacer": return <SpacerEditor block={block} />;
        case "section": return <SectionEditor block={block} />;
        case "columns-2":
        case "columns-3": return <ColumnsEditor block={block} />;
        case "hero": return <HeroEditor block={block} />;
        case "card": return <CardEditor block={block} />;
        case "html": return <HtmlEditor block={block} />;
        case "video": return <VideoEditor block={block} />;
        default: return <p>Bu blok için ayarlar yok.</p>;
    }
}

// ---------------------------------------------------------------------------
// Properties Panel — main export
// ---------------------------------------------------------------------------

export function PropertiesPanel() {
    const { blocks, selectedId, deleteBlock, duplicateBlock } = useBuilderStore();

    if (!selectedId) {
        return (
            <aside className="w-[280px] shrink-0 bg-builder-panel border-l border-builder-edge flex flex-col overflow-hidden">
                <div className="flex items-center justify-between py-2.5 px-3.5 border-b border-builder-edge gap-2">
                    <div className="flex items-center gap-1.5 text-[0.8rem] font-semibold text-slate-200 overflow-hidden">
                        <span className="text-base">⚙</span>
                        <span>Sayfa Ayarları</span>
                    </div>
                </div>
                <PageSettingsEditor />
            </aside>
        );
    }

    const block = findBlockLocal(blocks, selectedId);
    if (!block) return null;
    const def = getBlockDefinition(block.type);

    return (
        <aside className="w-[280px] shrink-0 bg-builder-panel border-l border-builder-edge flex flex-col overflow-hidden">
            <div className="flex items-center justify-between py-2.5 px-3.5 border-b border-builder-edge gap-2">
                <div className="flex items-center gap-1.5 text-[0.8rem] font-semibold text-slate-200 overflow-hidden">
                    <span className="text-base">{def.icon}</span>
                    <span>{def.label} Ayarları</span>
                </div>
                <div className="flex gap-1">
                    <button
                        onClick={() => duplicateBlock(block.id)}
                        className="w-6 h-6 inline-flex items-center justify-center rounded border border-builder-line bg-transparent text-slate-500 cursor-pointer text-xs transition-all hover:bg-builder-line hover:text-slate-200"
                        title="Kopyala"
                    >⧉</button>
                    <button
                        onClick={() => deleteBlock(block.id)}
                        className="w-6 h-6 inline-flex items-center justify-center rounded border border-builder-line bg-transparent text-slate-500 cursor-pointer text-xs transition-all hover:bg-red-900 hover:border-red-500 hover:text-red-500"
                        title="Sil"
                    >✕</button>
                </div>
            </div>
            <div className="flex-1 overflow-y-auto p-3 flex flex-col gap-2.5 builder-scrollbar">
                <BlockEditor block={block} />
            </div>
        </aside>
    );
}
