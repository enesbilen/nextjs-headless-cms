export function ToggleInput({ value, onChange, label }: { value: boolean; onChange: (v: boolean) => void; label?: string }) {
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
