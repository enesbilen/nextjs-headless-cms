import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/core/session";
import { getMediaUrl } from "@/core/media/url";
import { createMediaFromUpload } from "@/core/media/media-service";

export async function POST(req: NextRequest) {
    const session = await getSession();
    if (!session.userId) {
        return NextResponse.json({ uploaded: [], failed: [], error: "Yetkisiz" }, { status: 401 });
    }

    const formData = await req.formData();
    const rawFiles = formData.getAll("file");
    const files = rawFiles.filter((f): f is File => f instanceof File);

    if (files.length === 0) {
        return NextResponse.json({ uploaded: [], failed: [] });
    }

    const uploaded: {
        id: string;
        url: string;
        thumbnailUrl: string;
        filename: string;
        mimeType: string | null;
        width: number | null;
        height: number | null;
    }[] = [];
    const failed: { filename: string; reason: string }[] = [];

    for (const file of files) {
        try {
            const result = await createMediaFromUpload(file, session.userId);
            if (result.ok) {
                const url = getMediaUrl(result.id, result, result.version);
                const sep = url.includes("?") ? "&" : "?";
                uploaded.push({
                    id: result.id,
                    url,
                    thumbnailUrl: url + sep + "variant=thumbnail",
                    filename: result.filename,
                    mimeType: result.mimeType ?? null,
                    width: result.width ?? null,
                    height: result.height ?? null,
                });
            } else {
                failed.push({ filename: file.name, reason: result.error });
            }
        } catch (e) {
            failed.push({ filename: file.name, reason: e instanceof Error ? e.message : "Ağ hatası" });
        }
    }

    return NextResponse.json({ uploaded, failed });
}
