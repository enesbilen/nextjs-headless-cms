import { CLS_INPUT } from "./constants";

export function SelectInput<T extends string>({ value, onChange, options }: {
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
