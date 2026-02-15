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
    <header className="mb-6 flex flex-wrap items-center justify-between gap-4">
      <div className="flex items-center gap-4">
        {backHref && (
          <Link
            href={backHref}
            className="text-zinc-600 hover:text-zinc-900"
          >
            ← {backLabel}
          </Link>
        )}
        <h1 className="text-xl font-semibold">{title}</h1>
      </div>
      {actions && <div className="flex items-center gap-2">{actions}</div>}
    </header>
  );
}
