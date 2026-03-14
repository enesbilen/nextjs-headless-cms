import "server-only";
import { db } from "@/core/db";
import type { Prisma } from "@prisma/client";
import type { LayoutZoneKey } from "./types";
import type { WidgetPlacementData } from "./types";

export async function getWidgetsForZone(
  zoneKey: LayoutZoneKey
): Promise<WidgetPlacementData[]> {
  const rows = await db.widgetPlacement.findMany({
    where: { zoneKey },
    orderBy: [{ order: "asc" }, { id: "asc" }],
  });
  return rows.map((r) => ({
    id: r.id,
    zoneKey: r.zoneKey,
    widgetType: r.widgetType,
    config: (r.config as Record<string, unknown>) ?? null,
    order: r.order,
  }));
}

export async function addWidget(
  zoneKey: LayoutZoneKey,
  widgetType: string,
  config?: Record<string, unknown> | null
) {
  const maxOrder = await db.widgetPlacement.aggregate({
    where: { zoneKey },
    _max: { order: true },
  });
  const order = (maxOrder._max.order ?? -1) + 1;
  return db.widgetPlacement.create({
    data: {
      zoneKey,
      widgetType,
      config: (config ?? undefined) as Prisma.InputJsonValue | undefined,
      order,
    },
  });
}

export async function updateWidget(
  id: string,
  data: { config?: Record<string, unknown> | null }
) {
  return db.widgetPlacement.update({
    where: { id },
    data: { config: (data.config ?? undefined) as Prisma.InputJsonValue | undefined },
  });
}

export async function removeWidget(id: string) {
  return db.widgetPlacement.delete({ where: { id } });
}

export async function reorderWidgets(
  zoneKey: LayoutZoneKey,
  orderedIds: string[]
) {
  await db.$transaction(
    orderedIds.map((id, index) =>
      db.widgetPlacement.update({
        where: { id },
        data: { order: index },
      })
    )
  );
}
