import type { TemplateProps } from "./shared";

export function HeaderCentered({ siteName, logoUrl, menuItems, ctaLabel, ctaHref }: TemplateProps) {
  return (
    <header className="w-full border-b border-gray-100 bg-white">
      <div className="mx-auto flex max-w-7xl flex-col items-center px-4 py-4 sm:px-6 lg:px-8">
        <a href="/" className="mb-3 flex items-center gap-3 no-underline">
          {logoUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={logoUrl} alt={siteName} className="h-10 w-auto object-contain" />
          ) : (
            <span className="text-2xl font-bold tracking-tight text-gray-900">{siteName}</span>
          )}
        </a>

        <nav className="flex flex-wrap items-center justify-center gap-1">
          {menuItems.map((item, i) => (
            <a
              key={i}
              href={item.href}
              target={item.openInNewTab ? "_blank" : undefined}
              rel={item.openInNewTab ? "noopener noreferrer" : undefined}
              className="rounded-full px-4 py-1.5 text-sm font-medium text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-900"
            >
              {item.label}
            </a>
          ))}
          {ctaLabel && (
            <a
              href={ctaHref ?? "#"}
              className="ml-2 rounded-full bg-gray-900 px-5 py-1.5 text-sm font-semibold text-white transition-all hover:bg-gray-800"
            >
              {ctaLabel}
            </a>
          )}
        </nav>
      </div>
    </header>
  );
}
