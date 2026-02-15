import { invalidate } from "@/core/cache";
import { normalizePath } from "@/core/resolve";
import { NextResponse } from "next/server";

/**
 * Event-driven cache invalidation.
 * Admin (veya içerik güncelleyen her yer) publish/update sonrası bu API'yi çağırır.
 * RAM cache + yeni ETag → CDN/browser bir sonraki istekte güncel içeriği alır.
 */
export async function POST(req: Request) {
  const secret = process.env.REVALIDATE_SECRET;
  if (secret && req.headers.get("x-revalidate-secret") !== secret) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let path: string;
  try {
    const body = await req.json();
    if (body.slug != null) {
      path = normalizePath("/" + String(body.slug).trim());
    } else if (body.path != null) {
      path = normalizePath(String(body.path));
    } else {
      return NextResponse.json(
        { error: "Body must include slug or path" },
        { status: 400 }
      );
    }
  } catch {
    return NextResponse.json(
      { error: "Invalid JSON body" },
      { status: 400 }
    );
  }

  invalidate(path);
  return NextResponse.json({ revalidated: path });
}
