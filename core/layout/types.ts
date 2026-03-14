/** Bölge anahtarları: header ve footer (genişletilebilir). */
export const LAYOUT_ZONES = ["header", "footer"] as const;
export type LayoutZoneKey = (typeof LAYOUT_ZONES)[number];

/** Widget yerleşimi (DB'den). */
export type WidgetPlacementData = {
  id: string;
  zoneKey: string;
  widgetType: string;
  config: Record<string, unknown> | null;
  order: number;
};

/** Widget tipi tanımı (kayıt). */
export type WidgetDefinition = {
  type: string;
  name: string;
  description?: string;
  defaultConfig?: Record<string, unknown>;
};
