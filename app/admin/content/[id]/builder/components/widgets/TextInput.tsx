import { CLS_INPUT } from "./constants";

export function TextInput({ value, onChange, placeholder, multiline }: {
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
