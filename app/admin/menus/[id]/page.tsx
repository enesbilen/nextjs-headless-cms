import { notFound } from "next/navigation";
import Link from "next/link";
import { getMenuWithItemsFlat } from "@/core/menu/menu-service";
import {
  updateMenuAction,
  deleteMenuAction,
  addMenuItemAction,
  updateMenuItemAction,
  deleteMenuItemAction,
} from "../actions";
import { AdminContent } from "../../_components/AdminContent";
import { AdminPageHeader } from "../../_components/AdminPageHeader";
import { AdminCard } from "../../_components/AdminCard";
import { ConfirmSubmitButton } from "../../_components/ConfirmSubmitButton";

export default async function EditMenuPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ error?: string }>;
}) {
  const { id } = await params;
  const { error } = await searchParams;
  const menu = await getMenuWithItemsFlat(id);
  if (!menu) notFound();

  return (
    <AdminContent maxWidth="3xl">
      <AdminPageHeader
        title={`Menü: ${menu.name}`}
        backHref="/admin/menus"
        backLabel="Menüler"
      />

      {error === "label" && (
        <p className="mb-4 rounded-lg border border-amber-200 bg-amber-50 px-4 py-2 text-sm text-amber-800">
          Öğe etiketi zorunludur.
        </p>
      )}

      <AdminCard className="mb-6 p-6">
        <div className="flex flex-wrap gap-4 items-end">
          <form
            action={updateMenuAction.bind(null, id)}
            className="space-y-4 flex-1 min-w-0"
          >
            <label className="block">
              <span className="text-sm font-medium text-zinc-700">Ad</span>
              <input
                type="text"
                name="name"
                defaultValue={menu.name}
                required
                className="mt-1 w-full rounded border border-zinc-300 px-3 py-2"
              />
            </label>
            <label className="block">
              <span className="text-sm font-medium text-zinc-700">Slug</span>
              <input
                type="text"
                name="slug"
                defaultValue={menu.slug}
                required
                className="mt-1 w-full rounded border border-zinc-300 px-3 py-2 font-mono text-sm"
              />
            </label>
            <button
              type="submit"
              className="rounded bg-zinc-800 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-700"
            >
              Kaydet
            </button>
          </form>
          <form action={deleteMenuAction.bind(null, id)} className="inline">
            <ConfirmSubmitButton
              confirmMessage="Bu menüyü silmek istediğinize emin misiniz?"
              className="rounded border border-red-200 bg-white px-4 py-2 text-sm font-medium text-red-700 hover:bg-red-50"
            >
              Menüyü sil
            </ConfirmSubmitButton>
          </form>
        </div>
      </AdminCard>

      <AdminCard className="mb-6 p-6">
        <h3 className="mb-4 text-sm font-semibold text-zinc-800">
          Yeni öğe ekle
        </h3>
        <form action={addMenuItemAction.bind(null, id)} className="space-y-4">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <label className="block">
              <span className="text-sm font-medium text-zinc-700">Etiket</span>
              <input
                type="text"
                name="label"
                required
                placeholder="Anasayfa"
                className="mt-1 w-full rounded border border-zinc-300 px-3 py-2"
              />
            </label>
            <label className="block">
              <span className="text-sm font-medium text-zinc-700">Link</span>
              <input
                type="text"
                name="href"
                placeholder="/"
                className="mt-1 w-full rounded border border-zinc-300 px-3 py-2"
              />
            </label>
          </div>
          <label className="flex items-center gap-2">
            <input type="checkbox" name="openInNewTab" className="rounded" />
            <span className="text-sm text-zinc-700">Yeni sekmede aç</span>
          </label>
          <button
            type="submit"
            className="rounded bg-zinc-800 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-700"
          >
            Öğe ekle
          </button>
        </form>
      </AdminCard>

      <AdminCard className="p-6">
        <h3 className="mb-4 text-sm font-semibold text-zinc-800">
          Menü öğeleri ({menu.items.length})
        </h3>
        {menu.items.length === 0 ? (
          <p className="text-sm text-zinc-500">
            Henüz öğe yok. Yukarıdan ekleyin.
          </p>
        ) : (
          <ul className="space-y-3">
            {menu.items.map((item, index) => (
              <li
                key={item.id}
                className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-zinc-200 bg-zinc-50/50 p-3"
              >
                <span className="text-sm font-medium text-zinc-500 w-6">
                  {index + 1}.
                </span>
                <span className="min-w-0 flex-1 font-medium text-zinc-900">
                  {item.label}
                </span>
                <span className="truncate text-sm text-zinc-500">
                  {item.href}
                </span>
                {item.openInNewTab && (
                  <span className="text-xs text-zinc-400">Yeni sekme</span>
                )}
                <div className="flex gap-2">
                  <Link
                    href={`/admin/menus/${id}/items/${item.id}`}
                    className="rounded border border-zinc-300 bg-white px-2 py-1 text-xs font-medium text-zinc-700 hover:bg-zinc-50"
                  >
                    Düzenle
                  </Link>
                  <form
                    action={deleteMenuItemAction}
                    className="inline"
                  >
                    <input type="hidden" name="menuId" value={id} />
                    <input type="hidden" name="itemId" value={item.id} />
                    <button
                      type="submit"
                      className="rounded border border-red-200 bg-white px-2 py-1 text-xs font-medium text-red-600 hover:bg-red-50"
                    >
                      Sil
                    </button>
                  </form>
                </div>
              </li>
            ))}
          </ul>
        )}
      </AdminCard>
    </AdminContent>
  );
}
