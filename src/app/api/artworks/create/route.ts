import { NextResponse, NextRequest } from "next/server";
import { getArtworks, saveArtworks, newId, getOrCreateUser } from "@/lib/storage";
import { getUserIdFromCookie, ensureUserCookie } from "@/lib/cookies";

export async function POST(request: NextRequest) {
  try {
    const id = (await getUserIdFromCookie()) ?? (await ensureUserCookie());
    const body = await request.json().catch(() => ({} as any));
    const dataUrl: string | undefined = body?.dataUrl;
    const title: string | undefined = body?.title;
    const authorName: string | undefined = body?.authorName;
    if (!dataUrl || typeof dataUrl !== "string" || !dataUrl.startsWith("data:image/")) {
      return NextResponse.json({ error: "Invalid image data" }, { status: 400 });
    }
    if (!title || typeof title !== "string" || title.trim().length === 0) {
      return NextResponse.json({ error: "作品标题为必填" }, { status: 400 });
    }
    // 写入/更新作者名到用户表
    try {
      const nameToSet = authorName && typeof authorName === "string" ? authorName.trim() : undefined;
      await getOrCreateUser(id, nameToSet);
    } catch {}
    const artworks = await getArtworks();
    const artwork = {
      id: newId(),
      userId: id,
      title: title.trim(),
      dataUrl,
      createdAt: Date.now(),
      likesCount: 0,
    };
    artworks.push(artwork);
    await saveArtworks(artworks);
    return NextResponse.json({ ok: true, artwork });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || "Server error" }, { status: 500 });
  }
}
