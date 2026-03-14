/** Menü öğesi (flat veya tree için). */
export type MenuItemData = {
  id: string;
  menuId: string;
  label: string;
  href: string;
  openInNewTab: boolean;
  order: number;
  parentId: string | null;
  children?: MenuItemData[];
};

/** Menü + öğeler (tree: root öğeler, her birinin children'ı). */
export type MenuWithItems = {
  id: string;
  name: string;
  slug: string;
  items: MenuItemData[];
};
