import { db } from "@/core/db";
import { updateContent } from "../actions";
import { notFound } from "next/navigation";
import Link from "next/link";
import { AdminContent } from "../../_components/AdminContent";
import { AdminPageHeader } from "../../_components/AdminPageHeader";
import { AdminCard } from "../../_components/AdminCard";

export default async function EditContentPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const content = await db.page.findUnique({
    where: { id },
    select: { id: true, title: true, slug: true, body: true, status: true, builderMode: true },
  });

  if (!content) notFound();

  return (
    <AdminContent maxWidth="2xl">
      <AdminPageHeader
        title={`Düzenle: ${content.title}`}
        backHref="/admin"
        backLabel="İçerikler"
        actions={
          <Link
            href={`/admin/content/${content.id}/builder`}
            className="inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-500 transition-colors"
          >
            ✦ Page Builder
            {content.builderMode && (
              <span className="rounded-full bg-indigo-400/30 px-2 py-0.5 text-xs">Aktif</span>
            )}
          </Link>
        }
      />

      {content.builderMode && (
        <div className="mb-4 rounded-lg border border-indigo-200 bg-indigo-50 px-4 py-3 text-sm text-indigo-800">
          Bu sayfa <strong>Page Builder</strong> ile düzenleniyor. Blokları düzenlemek için yukarıdaki butonu kullanın.
        </div>
      )}

      <AdminCard>
        <form
          action={updateContent.bind(null, content.id, content.status as "DRAFT" | "PUBLISHED") as unknown as (formData: FormData) => Promise<void>}
          className="space-y-4 p-6"
        >
          <label className="block">
            <span className="text-sm font-medium">Başlık</span>
            <input
              type="text"
              name="title"
              defaultValue={content.title}
              className="mt-1 w-full rounded border border-zinc-300 px-3 py-2"
              required
            />
          </label>
          <label className="block">
            <span className="text-sm font-medium">Slug</span>
            <input
              type="text"
              name="slug"
              defaultValue={content.slug}
              className="mt-1 w-full rounded border border-zinc-300 px-3 py-2 font-mono text-sm"
              required
            />
          </label>
          {!content.builderMode && (
            <label className="block">
              <span className="text-sm font-medium">İçerik (HTML)</span>
              <textarea
                name="body"
                defaultValue={content.body}
                rows={12}
                className="mt-1 w-full rounded border border-zinc-300 px-3 py-2 font-mono text-sm"
              />
            </label>
          )}
          {content.builderMode && (
            <input type="hidden" name="body" value={content.body} />
          )}

          <div className="flex flex-wrap gap-2 pt-2">
            <button type="submit" name="status" value="DRAFT"
              className="rounded border border-zinc-300 px-4 py-2 text-sm hover:bg-zinc-100">
              Taslak kaydet
            </button>
            <button type="submit" name="status" value="PUBLISHED"
              className="rounded bg-zinc-800 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-700">
              Yayınla
            </button>
            {content.status === "PUBLISHED" && (
              <button type="submit" name="status" value="UNPUBLISH"
                className="rounded border border-amber-300 bg-amber-50 px-4 py-2 text-sm text-amber-800 hover:bg-amber-100">
                Yayından kaldır
              </button>
            )}
          </div>
        </form>
      </AdminCard>
    </AdminContent>
  );
}
