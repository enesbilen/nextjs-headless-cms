import type { TemplateProps } from "./shared";

export function HeaderClassic({ siteName, logoUrl, menuItems, ctaLabel, ctaHref }: TemplateProps) {
  return (
    <header className="w-full border-b border-gray-100 bg-white">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <a href="/" className="flex items-center gap-3 no-underline">
          {logoUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={logoUrl} alt={siteName} className="h-8 w-auto object-contain" />
          ) : (
            <span className="text-xl font-bold tracking-tight text-gray-900">{siteName}</span>
          )}
        </a>

        <nav className="hidden items-center gap-1 md:flex">
          {menuItems.map((item, i) => (
            <a
              key={i}
              href={item.href}
              target={item.openInNewTab ? "_blank" : undefined}
              rel={item.openInNewTab ? "noopener noreferrer" : undefined}
              className="rounded-lg px-3 py-2 text-sm font-medium text-gray-600 transition-colors hover:bg-gray-50 hover:text-gray-900"
            >
              {item.label}
            </a>
          ))}
        </nav>

        <div className="flex items-center gap-3">
          {ctaLabel && (
            <a
              href={ctaHref ?? "#"}
              className="rounded-lg bg-gray-900 px-4 py-2 text-sm font-semibold text-white shadow-sm transition-all hover:bg-gray-800 hover:shadow-md"
            >
              {ctaLabel}
            </a>
          )}
        </div>
      </div>
    </header>
  );
}
