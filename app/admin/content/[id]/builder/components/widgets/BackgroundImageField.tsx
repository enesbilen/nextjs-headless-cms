"use client";

import { useState } from "react";
import { MediaPickerModal } from "../MediaPickerModal";
import { FieldRow } from "./FieldRow";
import { TextInput } from "./TextInput";

export function BackgroundImageField({ value, onChange }: { value: string; onChange: (v: string) => void }) {
    const [pickerOpen, setPickerOpen] = useState(false);
    return (
        <>
            <FieldRow label="Arkaplan g\u00F6rseli">
                <div className="flex gap-1">
                    <TextInput
                        value={value ?? ""}
                        onChange={onChange}
                        placeholder="https://... veya mediadan se\u00E7"
                    />
                    <button
                        className="shrink-0 w-8 h-8 flex items-center justify-center border border-slate-700 rounded-md bg-slate-800 text-slate-400 cursor-pointer text-[0.9rem] transition-all hover:border-blue-500 hover:bg-blue-500/15 hover:text-blue-400"
                        onClick={() => setPickerOpen(true)}
                        title="Medya k\u00FCt\u00FCphanesinden se\u00E7"
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
                        title="G\u00F6rseli kald\u0131r"
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
