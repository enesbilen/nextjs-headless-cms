import "server-only";
import React from "react";
import { getManySettings, CMS_SETTING_KEYS } from "@/core/settings-service";
import { getWidgetsForZone } from "./layout-service";
import { getMenuById } from "@/core/menu/menu-service";
import { db } from "@/core/db";
import { resolvedPageSelect, type ResolvedPageContent } from "@/core/resolve";
import { PageContent } from "@/core/PageContent";
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
  const logoUrl = settings[CMS_SETTING_KEYS.SITE_LOGO_URL] ?? null;

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

function renderHeaderTemplate(
  templateId: string,
  props: TemplateProps
): React.ReactNode {
  switch (templateId) {
    case "centered":
      return <HeaderCentered {...props} />;
    case "split":
      return <HeaderSplit {...props} />;
    case "classic":
    default:
      return <HeaderClassic {...props} />;
  }
}

function renderFooterTemplate(
  templateId: string,
  props: FooterTemplateProps
): React.ReactNode {
  switch (templateId) {
    case "columns-footer":
      return <FooterColumns {...props} />;
    case "simple-footer":
    default:
      return <FooterSimple {...props} />;
  }
}

/**
 * Renders a layout zone (header or footer) as React elements.
 * Reads zone mode from settings and renders accordingly:
 * - template: Pre-built template component
 * - builder: Page builder content from settings page ID
 * - widgets: Raw widget-based rendering (legacy)
 *
 * Returns null if nothing is configured for the zone.
 */
export async function renderZone(
  zone: LayoutZoneKey
): Promise<React.ReactNode> {
  const modeKey = zone === "header" ? CMS_SETTING_KEYS.HEADER_MODE : CMS_SETTING_KEYS.FOOTER_MODE;
  const templateKey = zone === "header" ? CMS_SETTING_KEYS.HEADER_TEMPLATE_ID : CMS_SETTING_KEYS.FOOTER_TEMPLATE_ID;
  const pageKey = zone === "header" ? CMS_SETTING_KEYS.HEADER_PAGE_ID : CMS_SETTING_KEYS.FOOTER_PAGE_ID;

  const settings = await getManySettings([modeKey, templateKey, pageKey]);
  const mode = (settings[modeKey] as ZoneMode | null) ?? "template";
  const templateId = settings[templateKey] ?? (zone === "header" ? "classic" : "simple-footer");
  const pageId = settings[pageKey] ?? null;

  if (mode === "template") {
    const data = await getTemplateData();
    const props: TemplateProps = {
      siteName: data.siteName,
      logoUrl: data.logoUrl,
      menuItems: data.menuItems,
    };

    if (zone === "header") {
      return renderHeaderTemplate(templateId, props);
    }

    const footerProps: FooterTemplateProps = {
      siteName: data.siteName,
      logoUrl: data.logoUrl,
      menuItems: data.menuItems,
    };
    return renderFooterTemplate(templateId, footerProps);
  }

  if (mode === "builder" && pageId) {
    const page = await db.page.findFirst({
      where: { id: pageId, status: "PUBLISHED" },
      select: resolvedPageSelect,
    });
    if (!page) return null;
    const resolved = page as ResolvedPageContent;
    const blocks =
      resolved.builderMode && resolved.blocks && typeof resolved.blocks === "object" && "pageSettings" in resolved.blocks
        ? { ...resolved.blocks, pageSettings: { ...(resolved.blocks as { pageSettings?: Record<string, unknown> }).pageSettings, layoutPreset: "full-width" } }
        : resolved.blocks;
    return (
      <PageContent
        title={resolved.title}
        body={resolved.body}
        coverImage={resolved.coverImage}
        builderMode={resolved.builderMode}
        blocks={blocks}
        compact
      />
    );
  }

  if (mode === "widgets") {
    const data = await getTemplateData();
    if (data.menuItems.length === 0 && !data.logoUrl) return null;

    const fallbackProps: TemplateProps = {
      siteName: data.siteName,
      logoUrl: data.logoUrl,
      menuItems: data.menuItems,
    };
    if (zone === "header") {
      return renderHeaderTemplate("classic", fallbackProps);
    }
    const footerFallback: FooterTemplateProps = {
      siteName: data.siteName,
      logoUrl: data.logoUrl,
      menuItems: data.menuItems,
    };
    return renderFooterTemplate("simple-footer", footerFallback);
  }

  return null;
}
