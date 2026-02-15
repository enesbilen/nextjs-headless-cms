import { createContent } from "../actions";
import Link from "next/link";

export default function NewContentPage() {
  return (
    <div className="mx-auto max-w-2xl p-6">
      <header className="mb-6 flex items-center gap-4">
        <Link
          href="/admin"
          className="text-zinc-600 hover:text-zinc-900"
        >
          ← İçerikler
        </Link>
        <h1 className="text-xl font-semibold">Yeni yazı</h1>
      </header>

      <ContentForm action={createContent as unknown as (formData: FormData) => Promise<void>} />
    </div>
  );
}

function ContentForm({
  action,
  initial,
}: {
  action: (formData: FormData) => Promise<{ error?: string } | void>;
  initial?: { title: string; slug: string; body: string; status: "DRAFT" | "PUBLISHED" };
}) {
  return (
    <form action={action as (formData: FormData) => Promise<void>} className="space-y-4 p-6">
      <label className="block">
        <span className="text-sm font-medium">Başlık</span>
        <input
          type="text"
          name="title"
          defaultValue={initial?.title}
          className="mt-1 w-full rounded border border-zinc-300 px-3 py-2"
          required
        />
      </label>
      <label className="block">
        <span className="text-sm font-medium">Slug</span>
        <input
          type="text"
          name="slug"
          defaultValue={initial?.slug}
          className="mt-1 w-full rounded border border-zinc-300 px-3 py-2 font-mono text-sm"
          required
        />
      </label>
      <label className="block">
        <span className="text-sm font-medium">İçerik</span>
        <textarea
          name="body"
          defaultValue={initial?.body}
          rows={12}
          className="mt-1 w-full rounded border border-zinc-300 px-3 py-2 font-mono text-sm"
        />
      </label>
      <div className="flex flex-wrap gap-2 pt-2">
        <button
          type="submit"
          name="status"
          value="DRAFT"
          className="rounded border border-zinc-300 px-4 py-2 text-sm hover:bg-zinc-100"
        >
          Taslak kaydet
        </button>
        <button
          type="submit"
          name="status"
          value="PUBLISHED"
          className="rounded bg-zinc-800 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-700"
        >
          Yayınla
        </button>
      </div>
    </form>
  );
}
