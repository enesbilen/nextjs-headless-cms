import Link from "next/link";

type AdminPageHeaderProps = {
  title: string;
  backHref?: string;
  backLabel?: string;
  actions?: React.ReactNode;
};

export function AdminPageHeader({
  title,
  backHref,
  backLabel = "Geri",
  actions,
}: AdminPageHeaderProps) {
  return (
    <header className="mb-8 flex flex-wrap items-center justify-between gap-4 border-b border-zinc-200 pb-6">
      <div className="flex items-center gap-4">
        {backHref && (
          <Link
            href={backHref}
            className="text-sm text-zinc-500 hover:text-zinc-900 transition-colors"
          >
            ← {backLabel}
          </Link>
        )}
        <h1 className="text-xl font-semibold text-zinc-900 tracking-tight sm:text-2xl">{title}</h1>
      </div>
      {actions && <div className="flex items-center gap-2 flex-shrink-0">{actions}</div>}
    </header>
  );
}
