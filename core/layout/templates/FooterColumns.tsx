import type { FooterTemplateProps } from "./shared";

export function FooterColumns({ siteName, logoUrl, menuItems, copyright }: FooterTemplateProps) {
  const year = new Date().getFullYear();
  const third = Math.ceil(menuItems.length / 3);
  const col1 = menuItems.slice(0, third);
  const col2 = menuItems.slice(third, third * 2);
  const col3 = menuItems.slice(third * 2);

  return (
    <footer className="w-full bg-gray-900">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-4">
          <div className="md:col-span-1">
            <a href="/" className="mb-4 inline-block no-underline">
              {logoUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={logoUrl} alt={siteName} className="h-8 w-auto object-contain brightness-0 invert" />
              ) : (
                <span className="text-lg font-bold text-white">{siteName}</span>
              )}
            </a>
            <p className="mt-2 text-sm leading-relaxed text-gray-400">
              Modern, hızlı ve esnek web deneyimi.
            </p>
          </div>

          {[col1, col2, col3].map((col, ci) =>
            col.length > 0 ? (
              <nav key={ci} className="flex flex-col gap-2">
                {col.map((item, i) => (
                  <a
                    key={i}
                    href={item.href}
                    target={item.openInNewTab ? "_blank" : undefined}
                    rel={item.openInNewTab ? "noopener noreferrer" : undefined}
                    className="text-sm text-gray-400 transition-colors hover:text-white"
                  >
                    {item.label}
                  </a>
                ))}
              </nav>
            ) : null
          )}
        </div>

        <div className="mt-10 border-t border-gray-800 pt-6">
          <p className="text-center text-xs text-gray-500">
            {copyright ?? `\u00A9 ${year} ${siteName}. T\u00FCm haklar\u0131 sakl\u0131d\u0131r.`}
          </p>
        </div>
      </div>
    </footer>
  );
}
