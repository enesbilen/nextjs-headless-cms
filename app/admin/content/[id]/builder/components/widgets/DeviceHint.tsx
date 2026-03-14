import type { BuilderDevice } from "@/core/page-builder/types";

const labels: Record<BuilderDevice, string> = { desktop: "Masaüstü", tablet: "Tablet", mobile: "Mobil" };

export function DeviceHint({ device }: { device: BuilderDevice }) {
    return (
        <div className="text-[0.65rem] uppercase tracking-wider text-slate-500 mb-1.5">
            Cihaz: <span className="text-slate-400 font-semibold">{labels[device]}</span>
        </div>
    );
}
