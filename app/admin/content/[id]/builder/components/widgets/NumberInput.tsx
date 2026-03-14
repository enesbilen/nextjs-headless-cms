import { CLS_INPUT } from "./constants";

export function NumberInput({ value, onChange, min = 0, max = 100, step = 1, placeholder, showSlider = false }: {
    value: number;
    onChange: (v: number) => void;
    min?: number;
    max?: number;
    step?: number;
    placeholder?: string;
    showSlider?: boolean;
}) {
    return (
        <div className="flex gap-2 items-center">
            {showSlider && (
                <input
                    type="range"
                    className="flex-1 accent-blue-500"
                    value={value}
                    onChange={(e) => onChange(Number(e.target.value))}
                    min={min}
                    max={max}
                    step={step}
                />
            )}
            <input
                type="number"
                className={`${CLS_INPUT} ${showSlider ? "!w-20" : ""}`}
                value={value}
                onChange={(e) => {
                    const v = parseFloat(e.target.value);
                    if (!isNaN(v)) onChange(Math.min(max, Math.max(min, v)));
                }}
                min={min}
                max={max}
                step={step}
                placeholder={placeholder}
            />
        </div>
    );
}
