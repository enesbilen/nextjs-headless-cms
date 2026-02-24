import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/core/session";
import { db } from "@/core/db";
import { getMediaUrl } from "@/core/media/url";

export async function GET(req: NextRequest) {
    const session = await getSession();
    if (!session.userId) {
        return NextResponse.json({ items: [], total: 0 }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const search = searchParams.get("search") ?? "";
    const page = Math.max(1, Number(searchParams.get("page") ?? 1));
    const perPage = Math.min(100, Math.max(1, Number(searchParams.get("perPage") ?? 48)));
    const skip = (page - 1) * perPage;

    const where = {
        status: "ready" as const,
        deletedAt: null,
        mimeType: { startsWith: "image/" },
        ...(search.trim() ? { filename: { contains: search.trim() } } : {}),
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

    const items = rows.map((m) => {
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

    return NextResponse.json({ items, total });
}
