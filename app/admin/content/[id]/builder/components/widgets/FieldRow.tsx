export function FieldRow({ label, children }: { label: string; children: React.ReactNode }) {
    return (
        <div className="flex flex-col gap-1">
            <label className="text-[0.7rem] font-semibold uppercase tracking-wide text-slate-500">
                {label}
            </label>
            <div>{children}</div>
        </div>
    );
}
