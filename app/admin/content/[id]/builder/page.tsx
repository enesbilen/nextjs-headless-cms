import { db } from "@/core/db";
import { notFound } from "next/navigation";
import { PageBuilderClient } from "./PageBuilderClient";
import type { PageBuilderDoc } from "@/core/page-builder/types";

export const dynamic = "force-dynamic";

export default async function BuilderPage({
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
