import { notFound } from "next/navigation";
import Link from "next/link";
import { db } from "@/core/db";
import { updateMenuItemAction } from "../../../actions";
import { AdminContent } from "../../../../_components/AdminContent";
import { AdminPageHeader } from "../../../../_components/AdminPageHeader";
import { AdminCard } from "../../../../_components/AdminCard";

export default async function EditMenuItemPage({
  params,
}: {
  params: Promise<{ id: string; itemId: string }>;
}) {
  const { id: menuId, itemId } = await params;
  const item = await db.menuItem.findFirst({
    where: { id: itemId, menuId },
  });
  if (!item) notFound();

  return (
    <AdminContent maxWidth="2xl">
      <AdminPageHeader
        title={`Öğe: ${item.label}`}
        backHref={`/admin/menus/${menuId}`}
        backLabel="Menüye dön"
      />

      <AdminCard>
        <form
          action={updateMenuItemAction.bind(null, menuId, itemId)}
          className="space-y-4 p-6"
        >
          <label className="block">
            <span className="text-sm font-medium text-zinc-700">Etiket</span>
            <input
              type="text"
              name="label"
              defaultValue={item.label}
              required
              className="mt-1 w-full rounded border border-zinc-300 px-3 py-2"
            />
          </label>
          <label className="block">
            <span className="text-sm font-medium text-zinc-700">Link</span>
            <input
              type="text"
              name="href"
              defaultValue={item.href}
              className="mt-1 w-full rounded border border-zinc-300 px-3 py-2"
            />
          </label>
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              name="openInNewTab"
              defaultChecked={item.openInNewTab}
              className="rounded"
            />
            <span className="text-sm text-zinc-700">Yeni sekmede aç</span>
          </label>
          <div className="flex gap-2 pt-2">
            <button
              type="submit"
              className="rounded bg-zinc-800 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-700"
            >
              Kaydet
            </button>
            <Link
              href={`/admin/menus/${menuId}`}
              className="rounded border border-zinc-300 px-4 py-2 text-sm font-medium text-zinc-700 hover:bg-zinc-50"
            >
              İptal
            </Link>
          </div>
        </form>
      </AdminCard>
    </AdminContent>
  );
}
