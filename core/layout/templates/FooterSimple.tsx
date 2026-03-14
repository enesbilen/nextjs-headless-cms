import type { FooterTemplateProps } from "./shared";

export function FooterSimple({ siteName, logoUrl, menuItems, copyright }: FooterTemplateProps) {
  const year = new Date().getFullYear();
  return (
    <footer className="w-full border-t border-gray-200 bg-white">
      <div className="mx-auto flex max-w-7xl flex-col items-center gap-6 px-4 py-10 sm:px-6 lg:px-8">
        <a href="/" className="flex items-center gap-3 no-underline">
          {logoUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={logoUrl} alt={siteName} className="h-7 w-auto object-contain" />
          ) : (
            <span className="text-lg font-bold text-gray-900">{siteName}</span>
          )}
        </a>

        {menuItems.length > 0 && (
          <nav className="flex flex-wrap justify-center gap-x-6 gap-y-2">
            {menuItems.map((item, i) => (
              <a
                key={i}
                href={item.href}
                target={item.openInNewTab ? "_blank" : undefined}
                rel={item.openInNewTab ? "noopener noreferrer" : undefined}
                className="text-sm text-gray-500 transition-colors hover:text-gray-900"
              >
                {item.label}
              </a>
            ))}
          </nav>
        )}

        <p className="text-center text-xs text-gray-400">
          {copyright ?? `\u00A9 ${year} ${siteName}. T\u00FCm haklar\u0131 sakl\u0131d\u0131r.`}
        </p>
      </div>
    </footer>
  );
}
