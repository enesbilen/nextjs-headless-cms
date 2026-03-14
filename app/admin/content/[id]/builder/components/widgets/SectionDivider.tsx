export function SectionDivider({ label }: { label: string }) {
    return (
        <div className="flex items-center gap-2 mt-2 mb-1 text-[0.65rem] font-bold uppercase tracking-wider text-slate-700">
            <div className="flex-1 h-px bg-builder-edge" />
            <span className="text-slate-600 whitespace-nowrap">{label}</span>
            <div className="flex-1 h-px bg-builder-edge" />
        </div>
    );
}
