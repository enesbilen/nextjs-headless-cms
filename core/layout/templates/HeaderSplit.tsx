import type { TemplateProps } from "./shared";

export function HeaderSplit({ siteName, logoUrl, menuItems, ctaLabel, ctaHref }: TemplateProps) {
  return (
    <header className="w-full bg-gray-900">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <a href="/" className="flex shrink-0 items-center gap-3 no-underline">
          {logoUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={logoUrl} alt={siteName} className="h-8 w-auto object-contain brightness-0 invert" />
          ) : (
            <span className="text-xl font-bold tracking-tight text-white">{siteName}</span>
          )}
        </a>

        <nav className="hidden items-center gap-1 lg:flex">
          {menuItems.map((item, i) => (
            <a
              key={i}
              href={item.href}
              target={item.openInNewTab ? "_blank" : undefined}
              rel={item.openInNewTab ? "noopener noreferrer" : undefined}
              className="rounded-lg px-3 py-2 text-sm font-medium text-gray-300 transition-colors hover:bg-white/10 hover:text-white"
            >
              {item.label}
            </a>
          ))}
        </nav>

        <div className="flex items-center gap-3">
          {ctaLabel && (
            <a
              href={ctaHref ?? "#"}
              className="rounded-lg bg-white px-4 py-2 text-sm font-semibold text-gray-900 shadow-sm transition-all hover:bg-gray-100"
            >
              {ctaLabel}
            </a>
          )}
        </div>
      </div>
    </header>
  );
}
