import { db } from "@/core/db";
import { notFound } from "next/navigation";
import { PageBuilderClient } from "./PageBuilderClient";
import type { PageBuilderDoc } from "@/core/page-builder/types";

export const dynamic = "force-dynamic";

/** Builder sayfası her zaman istek anında render edilsin (statik 404 üretilmesin). */
export function generateStaticParams() {
    return [];
}

export default async function BuilderPage({
    params,
}: {
    params: Promise<{ id: string }>;
}) {
    const resolved = await params;
    const id = resolved?.id;
    if (!id || typeof id !== "string") notFound();

    const page = await db.page.findUnique({
        where: { id },
        select: { id: true, title: true, blocks: true, builderMode: true },
    });

    if (!page) notFound();

    const initialDoc =
        page.builderMode && page.blocks
            ? (page.blocks as unknown as PageBuilderDoc)
            : null;

    return (
        <PageBuilderClient
            pageId={page.id}
            pageTitle={page.title}
            initialDoc={initialDoc}
        />
    );
}
