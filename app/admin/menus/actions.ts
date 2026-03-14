"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import * as menuService from "@/core/menu/menu-service";

export async function createMenuAction(formData: FormData) {
  const name = (formData.get("name") as string)?.trim();
  const slug = (formData.get("slug") as string)?.trim()?.toLowerCase();
  if (!name || !slug) redirect("/admin/menus/new?error=missing");
  await menuService.createMenu({ name, slug });
  revalidatePath("/admin/menus");
  redirect("/admin/menus");
}

export async function updateMenuAction(menuId: string, formData: FormData) {
  const name = (formData.get("name") as string)?.trim();
  const slug = (formData.get("slug") as string)?.trim()?.toLowerCase();
  if (!name || !slug) redirect(`/admin/menus/${menuId}?error=missing`);
  await menuService.updateMenu(menuId, { name, slug });
  revalidatePath("/admin/menus");
  revalidatePath(`/admin/menus/${menuId}`);
  redirect(`/admin/menus/${menuId}`);
}

export async function deleteMenuAction(menuId: string) {
  await menuService.deleteMenu(menuId);
  revalidatePath("/admin/menus");
  redirect("/admin/menus");
}

export async function addMenuItemAction(menuId: string, formData: FormData) {
  const label = (formData.get("label") as string)?.trim();
  const href = (formData.get("href") as string)?.trim() || "#";
  const openInNewTab = formData.get("openInNewTab") === "on";
  if (!label) redirect(`/admin/menus/${menuId}?error=label`);
  await menuService.addMenuItem(menuId, { label, href, openInNewTab });
  revalidatePath(`/admin/menus/${menuId}`);
  redirect(`/admin/menus/${menuId}`);
}

export async function updateMenuItemAction(
  menuId: string,
  itemId: string,
  formData: FormData
) {
  const label = (formData.get("label") as string)?.trim();
  const href = (formData.get("href") as string)?.trim() || "#";
  const openInNewTab = formData.get("openInNewTab") === "on";
  if (!label) redirect(`/admin/menus/${menuId}?error=label`);
  await menuService.updateMenuItem(itemId, { label, href, openInNewTab });
  revalidatePath(`/admin/menus/${menuId}`);
  redirect(`/admin/menus/${menuId}`);
}

export async function deleteMenuItemAction(formData: FormData) {
  const menuId = formData.get("menuId") as string;
  const itemId = formData.get("itemId") as string;
  if (!menuId || !itemId) return;
  await menuService.deleteMenuItem(itemId);
  revalidatePath(`/admin/menus/${menuId}`);
  redirect(`/admin/menus/${menuId}`);
}

export async function reorderMenuItemsAction(
  menuId: string,
  orderedIds: string[]
) {
  await menuService.reorderMenuItems(menuId, orderedIds);
  revalidatePath(`/admin/menus/${menuId}`);
}
