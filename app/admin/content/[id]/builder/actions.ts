"use server";

import { db } from "@/core/db";
import { invalidate } from "@/core/cache";
import { normalizePath } from "@/core/resolve";
import type { PageBuilderDoc } from "@/core/page-builder/types";
import { revalidatePath } from "next/cache";
import { getMediaUrl } from "@/core/media/url";
import { REVISIONS_MAX_SIZE } from "@/core/page-builder/constants";

export async function saveBuilderBlocks(
    pageId: string,
    doc: PageBuilderDoc,
    status: "DRAFT" | "PUBLISHED"
) {
    const prev = await db.page.findUnique({
        where: { id: pageId },
        select: { slug: true, status: true },
    });

    if (!prev) throw new Error("Page not found");

    await db.page.update({
        where: { id: pageId },
        data: {
            blocks: doc as any, // eslint-disable-line @typescript-eslint/no-explicit-any
            builderMode: true,
            status,
        },
    });

    // Create revision (snapshot of this save)
    const label = status === "DRAFT" ? "Taslak kaydet" : "Yayınla";
    await db.pageRevision.create({
        data: {
            pageId,
            doc: doc as unknown as object,
            label,
        },
    });

    // Keep only last N revisions for this page
    const revisions = await db.pageRevision.findMany({
        where: { pageId },
        orderBy: { createdAt: "desc" },
        select: { id: true },
    });
    if (revisions.length > REVISIONS_MAX_SIZE) {
        const toDelete = revisions.slice(REVISIONS_MAX_SIZE).map((r) => r.id);
        await db.pageRevision.deleteMany({ where: { id: { in: toDelete } } });
    }

    // Invalidate cache if published or was previously published
    if (status === "PUBLISHED" || prev.status === "PUBLISHED") {
        invalidate(normalizePath("/" + prev.slug));
    }

    revalidatePath("/admin");
    revalidatePath(`/admin/content/${pageId}`);
}

// ---------------------------------------------------------------------------
// Revisions
// ---------------------------------------------------------------------------

export type PageRevisionItem = {
    id: string;
    label: string | null;
    createdAt: Date;
};

export async function getPageRevisions(pageId: string): Promise<PageRevisionItem[]> {
    const rows = await db.pageRevision.findMany({
        where: { pageId },
        orderBy: { createdAt: "desc" },
        take: REVISIONS_MAX_SIZE,
        select: { id: true, label: true, createdAt: true },
    });
    return rows;
}

export async function loadRevision(
    pageId: string,
    revisionId: string
): Promise<PageBuilderDoc | null> {
    const rev = await db.pageRevision.findFirst({
        where: { id: revisionId, pageId },
        select: { doc: true },
    });
    if (!rev || !rev.doc) return null;
    return rev.doc as unknown as PageBuilderDoc;
}

// ---------------------------------------------------------------------------
// Media picker
// ---------------------------------------------------------------------------

export type MediaPickerItem = {
    id: string;
    filename: string;
    url: string;
    thumbnailUrl: string;
    mimeType: string | null;
    width: number | null;
    height: number | null;
};

export async function getMediaList(opts: {
    search?: string;
    page?: number;
    perPage?: number;
}): Promise<{ items: MediaPickerItem[]; total: number }> {
    const { search = "", page = 1, perPage = 48 } = opts;
    const skip = (page - 1) * perPage;

    const where = {
        status: "ready" as const,
        deletedAt: null,
        mimeType: { startsWith: "image/" },
        ...(search.trim()
            ? { filename: { contains: search.trim() } }
            : {}),
    };

    const [rows, total] = await Promise.all([
        db.media.findMany({
            where,
            orderBy: { createdAt: "desc" },
            skip,
            take: perPage,
            select: {
                id: true,
                filename: true,
                storagePath: true,
                mimeType: true,
                width: true,
                height: true,
                version: true,
            },
        }),
        db.media.count({ where }),
    ]);

    const items: MediaPickerItem[] = rows.map((m) => {
        const url = getMediaUrl(m.id, m, m.version ?? undefined);
        const sep = url.includes("?") ? "&" : "?";
        return {
            id: m.id,
            filename: m.filename,
            url,
            thumbnailUrl: url + sep + "variant=thumbnail",
            mimeType: m.mimeType,
            width: m.width,
            height: m.height,
        };
    });

    return { items, total };
}
