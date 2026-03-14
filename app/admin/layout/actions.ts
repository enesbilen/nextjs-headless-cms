"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import type { LayoutZoneKey } from "@/core/layout/types";
import * as layoutService from "@/core/layout/layout-service";
import { setSetting, CMS_SETTING_KEYS } from "@/core/settings-service";

export async function addWidgetAction(
  zoneKey: LayoutZoneKey,
  formData: FormData
) {
  const widgetType = (formData.get("widgetType") as string)?.trim();
  if (!widgetType) redirect(`/admin/layout?zone=${zoneKey}&error=type`);
  const config: Record<string, unknown> = {};
  if (widgetType === "menu") config.menuId = (formData.get("menuId") as string)?.trim() ?? "";
  if (widgetType === "html") config.content = (formData.get("content") as string)?.trim() ?? "";
  await layoutService.addWidget(zoneKey, widgetType, config);
  revalidatePath("/admin/layout");
  redirect(`/admin/layout?zone=${zoneKey}`);
}

export async function updateWidgetAction(formData: FormData) {
  const widgetId = formData.get("widgetId") as string;
  const zoneKey = formData.get("zoneKey") as LayoutZoneKey;
  if (!widgetId || !zoneKey) return;
  const widgetType = (formData.get("widgetType") as string)?.trim();
  const config: Record<string, unknown> = {};
  if (widgetType === "menu") config.menuId = (formData.get("menuId") as string)?.trim() ?? "";
  if (widgetType === "html") config.content = (formData.get("content") as string)?.trim() ?? "";
  await layoutService.updateWidget(widgetId, config);
  revalidatePath("/admin/layout");
  redirect(`/admin/layout?zone=${zoneKey}`);
}

export async function removeWidgetAction(formData: FormData) {
  const widgetId = formData.get("widgetId") as string;
  const zoneKey = formData.get("zoneKey") as LayoutZoneKey;
  if (!widgetId || !zoneKey) return;
  await layoutService.removeWidget(widgetId);
  revalidatePath("/admin/layout");
  redirect(`/admin/layout?zone=${zoneKey}`);
}

export async function reorderWidgetsAction(
  zoneKey: LayoutZoneKey,
  orderedIds: string[]
) {
  await layoutService.reorderWidgets(zoneKey, orderedIds);
  revalidatePath("/admin/layout");
}

export async function setZoneMode(formData: FormData) {
  const zone = formData.get("zone") as LayoutZoneKey;
  const mode = formData.get("mode") as string;
  if (!zone || !mode) return;

  const modeKey = zone === "header" ? CMS_SETTING_KEYS.HEADER_MODE : CMS_SETTING_KEYS.FOOTER_MODE;
  await setSetting(modeKey, mode);
  revalidatePath("/admin/layout");
  redirect(`/admin/layout?zone=${zone}`);
}

export async function setZoneTemplate(formData: FormData) {
  const zone = formData.get("zone") as LayoutZoneKey;
  const templateId = formData.get("templateId") as string;
  if (!zone || !templateId) return;

  const templateKey = zone === "header" ? CMS_SETTING_KEYS.HEADER_TEMPLATE_ID : CMS_SETTING_KEYS.FOOTER_TEMPLATE_ID;
  const modeKey = zone === "header" ? CMS_SETTING_KEYS.HEADER_MODE : CMS_SETTING_KEYS.FOOTER_MODE;
  await setSetting(templateKey, templateId);
  await setSetting(modeKey, "template");
  revalidatePath("/admin/layout");
  redirect(`/admin/layout?zone=${zone}`);
}
