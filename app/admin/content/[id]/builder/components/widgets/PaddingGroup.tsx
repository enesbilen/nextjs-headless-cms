import { SpacingControl } from "../CSSValueInput";
import type { SpacingValue } from "../CSSValueInput";

export function PaddingGroup({ top, right, bottom, left, onChange }: {
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
