import { db } from "@/core/db";
import { notFound } from "next/navigation";
import Link from "next/link";
import { PageContent } from "@/core/PageContent";
import type { PageBuilderDoc } from "@/core/page-builder/types";

export const dynamic = "force-dynamic";

export default async function BuilderPreviewPage({
    params,
}: {
    params: Promise<{ id: string }>;
}) {
    const { id } = await params;

    const page = await db.page.findUnique({
        where: { id },
        select: { id: true, title: true, blocks: true, builderMode: true },
    });

    if (!page) notFound();

    if (!page.builderMode || !page.blocks) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center gap-4 p-6 bg-slate-100 text-slate-800">
                <p className="text-lg">Bu sayfa builder ile düzenlenmemiş veya henüz içerik yok.</p>
                <Link
                    href={`/admin/content/${page.id}/builder`}
                    className="rounded-md bg-blue-600 text-white px-4 py-2 text-sm font-medium hover:bg-blue-700"
                >
                    Builder&apos;a git
                </Link>
            </div>
        );
    }

    const doc = page.blocks as unknown as PageBuilderDoc;

    return (
        <div className="min-h-screen flex flex-col">
            <div className="shrink-0 flex items-center justify-between gap-4 px-4 py-2 bg-slate-100 border-b border-slate-200 text-sm">
                <span className="font-medium text-slate-600">
                    Önizleme — {page.title}
                </span>
                <Link
                    href={`/admin/content/${page.id}/builder`}
                    className="text-blue-600 hover:text-blue-800 font-medium"
                >
                    ← Builder&apos;a dön
                </Link>
            </div>
            <div className="flex-1">
                <PageContent
                    title={page.title}
                    body=""
                    builderMode
                    blocks={doc}
                />
            </div>
        </div>
    );
}
