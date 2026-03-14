import "server-only";
import { db } from "@/core/db";
import type { MenuItemData, MenuWithItems } from "./types";

export async function getMenus() {
  return db.menu.findMany({
    orderBy: { name: "asc" },
    select: { id: true, name: true, slug: true },
  });
}

export async function getMenuBySlug(slug: string) {
  return db.menu.findUnique({
    where: { slug },
    include: {
      items: {
        orderBy: [{ order: "asc" }, { id: "asc" }],
        where: { parentId: null },
      },
    },
  });
}

/** Public render için: ID ile menü + root öğeler. */
export async function getMenuById(menuId: string) {
  return db.menu.findUnique({
    where: { id: menuId },
    include: {
      items: {
        orderBy: [{ order: "asc" }, { id: "asc" }],
        where: { parentId: null },
      },
    },
  });
}

/** Menü + öğeler (düz liste, admin için). */
export async function getMenuWithItemsFlat(menuId: string) {
  const menu = await db.menu.findUnique({
    where: { id: menuId },
    include: {
      items: {
        orderBy: [{ order: "asc" }, { id: "asc" }],
      },
    },
  });
  return menu;
}

export async function getMenuWithItems(menuId: string) {
  const menu = await db.menu.findUnique({
    where: { id: menuId },
    include: {
      items: {
        orderBy: [{ order: "asc" }, { id: "asc" }],
      },
    },
  });
  if (!menu) return null;
  const byParent = new Map<string | null, typeof menu.items>();
  for (const item of menu.items) {
    const key = item.parentId ?? null;
    if (!byParent.has(key)) byParent.set(key, []);
    byParent.get(key)!.push(item);
  }
  const toTree = (parentId: string | null): MenuItemData[] => {
    const list = byParent.get(parentId) ?? [];
    return list.map((item) => ({
      id: item.id,
      menuId: item.menuId,
      label: item.label,
      href: item.href,
      openInNewTab: item.openInNewTab,
      order: item.order,
      parentId: item.parentId,
      children: toTree(item.id),
    }));
  };
  return {
    id: menu.id,
    name: menu.name,
    slug: menu.slug,
    items: toTree(null),
  } as MenuWithItems;
}

export async function createMenu(data: { name: string; slug: string }) {
  return db.menu.create({
    data: { name: data.name, slug: data.slug.toLowerCase().trim() },
  });
}

export async function updateMenu(
  menuId: string,
  data: { name?: string; slug?: string }
) {
  return db.menu.update({
    where: { id: menuId },
    data: data.slug ? { ...data, slug: data.slug.toLowerCase().trim() } : data,
  });
}

export async function deleteMenu(menuId: string) {
  return db.menu.delete({ where: { id: menuId } });
}

export async function addMenuItem(
  menuId: string,
  data: {
    label: string;
    href: string;
    openInNewTab?: boolean;
    order?: number;
    parentId?: string | null;
  }
) {
  const maxOrder = await db.menuItem.aggregate({
    where: { menuId, parentId: data.parentId ?? null },
    _max: { order: true },
  });
  const order = data.order ?? (maxOrder._max.order ?? -1) + 1;
  return db.menuItem.create({
    data: {
      menuId,
      label: data.label,
      href: data.href,
      openInNewTab: data.openInNewTab ?? false,
      order,
      parentId: data.parentId ?? null,
    },
  });
}

export async function updateMenuItem(
  itemId: string,
  data: {
    label?: string;
    href?: string;
    openInNewTab?: boolean;
    order?: number;
    parentId?: string | null;
  }
) {
  return db.menuItem.update({
    where: { id: itemId },
    data: data as Parameters<typeof db.menuItem.update>[0]["data"],
  });
}

export async function deleteMenuItem(itemId: string) {
  return db.menuItem.delete({ where: { id: itemId } });
}

export async function reorderMenuItems(
  menuId: string,
  orderedIds: string[]
) {
  await db.$transaction(
    orderedIds.map((id, index) =>
      db.menuItem.update({
        where: { id },
        data: { order: index },
      })
    )
  );
}
