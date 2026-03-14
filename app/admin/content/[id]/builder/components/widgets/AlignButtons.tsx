import type { AlignValue } from "@/core/page-builder/types";

export function AlignButtons({ value, onChange }: { value: AlignValue; onChange: (v: AlignValue) => void }) {
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
