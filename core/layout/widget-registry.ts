import type { WidgetDefinition } from "./types";

export const WIDGET_REGISTRY: WidgetDefinition[] = [
  {
    type: "menu",
    name: "Menü",
    description: "Kayıtlı bir menüyü gösterir",
    defaultConfig: { menuId: "" },
  },
  {
    type: "logo",
    name: "Logo",
    description: "Site logosu (ayarlardan)",
    defaultConfig: {},
  },
  {
    type: "html",
    name: "Özel HTML",
    description: "Serbest HTML içerik",
    defaultConfig: { content: "" },
  },
];

export function getWidgetDefinition(type: string): WidgetDefinition | undefined {
  return WIDGET_REGISTRY.find((w) => w.type === type);
}

export function getWidgetTypes(): WidgetDefinition[] {
  return [...WIDGET_REGISTRY];
}
