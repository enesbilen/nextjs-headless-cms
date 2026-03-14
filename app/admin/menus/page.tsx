import Link from "next/link";
import { getMenus } from "@/core/menu/menu-service";
import { AdminContent } from "../_components/AdminContent";
import { AdminPageHeader } from "../_components/AdminPageHeader";
import { AdminCard } from "../_components/AdminCard";

export default async function MenusListPage() {
  const menus = await getMenus();

  return (
    <AdminContent maxWidth="3xl">
      <AdminPageHeader
        title="Menüler"
        backHref="/admin"
        backLabel="İçerikler"
        actions={
          <Link
            href="/admin/menus/new"
            className="rounded bg-zinc-800 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-700"
          >
            Yeni menü
          </Link>
        }
      />

      <p className="mb-4 text-sm text-zinc-600">
        Header ve footer da kullanilacak menuleri olusturun. Duzen sayfasindan hangi menunun nerede gorunecegini atayabilirsiniz.
      </p>

      {menus.length === 0 ? (
        <AdminCard className="p-8 text-center text-zinc-500">
          Henuz menu yok. Yeni menu ile ekleyin.
        </AdminCard>
      ) : (
        <div className="space-y-3">
          {menus.map((menu) => (
            <AdminCard key={menu.id} className="p-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <h2 className="font-semibold text-zinc-900">{menu.name}</h2>
                  <p className="text-sm text-zinc-500">slug: {menu.slug}</p>
                </div>
                <Link
                  href={`/admin/menus/${menu.id}`}
                  className="rounded border border-zinc-300 bg-white px-3 py-2 text-sm font-medium text-zinc-700 hover:bg-zinc-50"
                >
                  Duzenle
                </Link>
              </div>
            </AdminCard>
          ))}
        </div>
      )}
    </AdminContent>
  );
}
