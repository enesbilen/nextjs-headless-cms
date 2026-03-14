import { createMenuAction } from "../actions";
import { AdminContent } from "../../_components/AdminContent";
import { AdminPageHeader } from "../../_components/AdminPageHeader";
import { AdminCard } from "../../_components/AdminCard";

type Props = { searchParams: Promise<{ error?: string }> };

export default async function NewMenuPage({ searchParams }: Props) {
  const params = await searchParams;

  return (
    <AdminContent maxWidth="2xl">
      <AdminPageHeader
        title="Yeni menü"
        backHref="/admin/menus"
        backLabel="Menüler"
      />

      {params.error === "missing" && (
        <p className="mb-4 rounded-lg border border-amber-200 bg-amber-50 px-4 py-2 text-sm text-amber-800">
          Ad ve slug zorunludur.
        </p>
      )}

      <AdminCard>
        <form action={createMenuAction} className="space-y-4 p-6">
          <label className="block">
            <span className="text-sm font-medium text-zinc-700">Ad</span>
            <input
              type="text"
              name="name"
              required
              placeholder="Örn. Ana menü"
              className="mt-1 w-full rounded border border-zinc-300 px-3 py-2"
            />
          </label>
          <label className="block">
            <span className="text-sm font-medium text-zinc-700">Slug</span>
            <input
              type="text"
              name="slug"
              required
              placeholder="ana-menu"
              className="mt-1 w-full rounded border border-zinc-300 px-3 py-2 font-mono text-sm"
            />
            <span className="mt-1 block text-xs text-zinc-500">
              URL’de ve widget ayarlarında kullanılır (küçük harf, tire).
            </span>
          </label>
          <div className="flex gap-2 pt-2">
            <button
              type="submit"
              className="rounded bg-zinc-800 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-700"
            >
              Oluştur
            </button>
            <a
              href="/admin/menus"
              className="rounded border border-zinc-300 px-4 py-2 text-sm font-medium text-zinc-700 hover:bg-zinc-50"
            >
              İptal
            </a>
          </div>
        </form>
      </AdminCard>
    </AdminContent>
  );
}
