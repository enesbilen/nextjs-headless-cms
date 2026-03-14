import { CLS_INPUT } from "./constants";

export function ColorInput({ value, onChange }: { value: string; onChange: (v: string) => void }) {
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
