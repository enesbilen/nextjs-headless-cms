export interface MenuItem {
  label: string;
  href: string;
  openInNewTab?: boolean;
}

export interface TemplateProps {
  siteName: string;
  logoUrl: string | null;
  menuItems: MenuItem[];
  ctaLabel?: string | null;
  ctaHref?: string | null;
}

export interface FooterTemplateProps {
  siteName: string;
  logoUrl: string | null;
  menuItems: MenuItem[];
  copyright?: string | null;
}
