export function AdminCard({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`rounded-xl border border-zinc-200/80 bg-white shadow-sm hover:shadow transition-shadow ${className}`}
    >
      {children}
    </div>
  );
}
