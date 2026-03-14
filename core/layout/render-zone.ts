import "server-only";
import { createElement } from "react";
import { getWidgetsForZone } from "./layout-service";
import { getMenuById } from "@/core/menu/menu-service";
import { getManySettings, CMS_SETTING_KEYS } from "@/core/settings-service";
import { db } from "@/core/db";
import { resolvedPageSelect, type ResolvedPageContent } from "@/core/resolve";
import { renderPageContentToMarkup } from "@/core/renderer";
import { HeaderClassic } from "./templates/HeaderClassic";
import { HeaderCentered } from "./templates/HeaderCentered";
import { HeaderSplit } from "./templates/HeaderSplit";
import { FooterSimple } from "./templates/FooterSimple";
import { FooterColumns } from "./templates/FooterColumns";
import type { LayoutZoneKey } from "./types";
import type { MenuItem, TemplateProps, FooterTemplateProps } from "./templates/shared";
import type { ZoneMode } from "./templates/template-registry";

async function getTemplateData(): Promise<{
  siteName: string;
  logoUrl: string | null;
  menuItems: MenuItem[];
}> {
  const settings = await getManySettings([
    CMS_SETTING_KEYS.SITE_TITLE,
    CMS_SETTING_KEYS.SITE_LOGO_URL,
  ]);

  const siteName = settings[CMS_SETTING_KEYS.SITE_TITLE] ?? "Site";
  const logoUrl = settings[CMS_SETTING_KEYS.SITE_LOGO_URL] || null;

  const widgets = await getWidgetsForZone("header");
  const menuWidget = widgets.find((w) => w.widgetType === "menu");
  let menuItems: MenuItem[] = [];
  if (menuWidget?.config?.menuId) {
    const menu = await getMenuById(menuWidget.config.menuId as string);
    if (menu) {
      menuItems = menu.items.map((item) => ({
        label: item.label,
        href: item.href,
        openInNewTab: item.openInNewTab,
      }));
    }
  }

  return { siteName, logoUrl, menuItems };
}

async function renderHeaderTemplateToHtml(templateId: string, props: TemplateProps): Promise<string> {
  const { renderToStaticMarkup } = await import("react-dom/server");
  switch (templateId) {
    case "centered":
      return renderToStaticMarkup(createElement(HeaderCentered, props));
    case "split":
      return renderToStaticMarkup(createElement(HeaderSplit, props));
    case "classic":
    default:
      return renderToStaticMarkup(createElement(HeaderClassic, props));
  }
}

async function renderFooterTemplateToHtml(templateId: string, props: FooterTemplateProps): Promise<string> {
  const { renderToStaticMarkup } = await import("react-dom/server");
  switch (templateId) {
    case "columns-footer":
      return renderToStaticMarkup(createElement(FooterColumns, props));
    case "simple-footer":
    default:
      return renderToStaticMarkup(createElement(FooterSimple, props));
  }
}

/**
 * Renders a layout zone to HTML string.
 * Respects the mode setting: template, builder, or widgets.
 * Used by route.ts and warmup.ts for non-React rendering paths.
 */
export async function renderZoneToHtml(zoneKey: LayoutZoneKey): Promise<string> {
  const modeKey = zoneKey === "header" ? CMS_SETTING_KEYS.HEADER_MODE : CMS_SETTING_KEYS.FOOTER_MODE;
  const templateKey = zoneKey === "header" ? CMS_SETTING_KEYS.HEADER_TEMPLATE_ID : CMS_SETTING_KEYS.FOOTER_TEMPLATE_ID;
  const pageKey = zoneKey === "header" ? CMS_SETTING_KEYS.HEADER_PAGE_ID : CMS_SETTING_KEYS.FOOTER_PAGE_ID;

  const settings = await getManySettings([modeKey, templateKey, pageKey]);
  const mode = (settings[modeKey] as ZoneMode | null) ?? "template";
  const templateId = settings[templateKey] ?? (zoneKey === "header" ? "classic" : "simple-footer");
  const pageId = settings[pageKey] ?? null;

  if (mode === "template") {
    const data = await getTemplateData();
    const props: TemplateProps = {
      siteName: data.siteName,
      logoUrl: data.logoUrl,
      menuItems: data.menuItems,
    };

    if (zoneKey === "header") {
      return await renderHeaderTemplateToHtml(templateId, props);
    }

    const footerProps: FooterTemplateProps = {
      siteName: data.siteName,
      logoUrl: data.logoUrl,
      menuItems: data.menuItems,
    };
    return await renderFooterTemplateToHtml(templateId, footerProps);
  }

  if (mode === "builder" && pageId) {
    const page = await db.page.findFirst({
      where: { id: pageId, status: "PUBLISHED" },
      select: resolvedPageSelect,
    });
    if (!page) return "";
    return renderPageContentToMarkup(page as ResolvedPageContent, { forceFullWidth: true });
  }

  // "widgets" mode fallback: use templates with widget data
  const data = await getTemplateData();
  if (data.menuItems.length === 0 && !data.logoUrl) return "";

  const props: TemplateProps = {
    siteName: data.siteName,
    logoUrl: data.logoUrl,
    menuItems: data.menuItems,
  };

  if (zoneKey === "header") {
    return await renderHeaderTemplateToHtml("classic", props);
  }
  const footerProps: FooterTemplateProps = {
    siteName: data.siteName,
    logoUrl: data.logoUrl,
    menuItems: data.menuItems,
  };
  return await renderFooterTemplateToHtml("simple-footer", footerProps);
}
