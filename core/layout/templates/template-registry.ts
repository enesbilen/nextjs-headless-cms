import type { LayoutZoneKey } from "../types";

export type TemplateId = string;

export interface LayoutTemplate {
  id: TemplateId;
  name: string;
  description: string;
  zone: LayoutZoneKey;
  preview: "classic" | "centered" | "split" | "simple-footer" | "columns-footer";
}

export const HEADER_TEMPLATES: LayoutTemplate[] = [
  {
    id: "classic",
    name: "Klasik",
    description: "Logo sol, navigasyon sağ, CTA butonu",
    zone: "header",
    preview: "classic",
  },
  {
    id: "centered",
    name: "Ortalanmış",
    description: "Logo ortada, navigasyon altında",
    zone: "header",
    preview: "centered",
  },
  {
    id: "split",
    name: "Üçlü Bölünmüş",
    description: "Logo sol, navigasyon orta, aksiyonlar sağ",
    zone: "header",
    preview: "split",
  },
];

export const FOOTER_TEMPLATES: LayoutTemplate[] = [
  {
    id: "simple-footer",
    name: "Basit",
    description: "Logo, linkler ve telif hakkı",
    zone: "footer",
    preview: "simple-footer",
  },
  {
    id: "columns-footer",
    name: "Çok Sütunlu",
    description: "3 sütun link grupları + alt bar",
    zone: "footer",
    preview: "columns-footer",
  },
];

export function getTemplatesForZone(zone: LayoutZoneKey): LayoutTemplate[] {
  return zone === "header" ? HEADER_TEMPLATES : FOOTER_TEMPLATES;
}

export function getTemplate(id: string): LayoutTemplate | undefined {
  return [...HEADER_TEMPLATES, ...FOOTER_TEMPLATES].find((t) => t.id === id);
}

export type ZoneMode = "template" | "builder" | "widgets";
