export function AdminCard({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`rounded-lg border border-zinc-200 bg-white shadow-sm ${className}`}
    >
      {children}
    </div>
  );
}
