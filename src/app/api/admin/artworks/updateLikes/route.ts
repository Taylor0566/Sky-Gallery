import { NextResponse, NextRequest } from "next/server";
import { cookies } from "next/headers";
import { getArtworks, saveArtworks } from "@/lib/storage";

export async function POST(request: NextRequest) {
  try {
    const store = await cookies();
    const isAdmin = store.get("adminAuth")?.value === "1";
    if (!isAdmin) {
      return NextResponse.json({ error: "forbidden" }, { status: 403 });
    }
    const body = await request.json().catch(() => ({} as any));
  const rawId = body?.id;
  const likesCountRaw = body?.likesCount;
  const likesCount = Number(likesCountRaw);
  if (!rawId || typeof rawId !== "string") {
    return NextResponse.json({ error: "Invalid artwork id" }, { status: 400 });
  }
  if (!Number.isFinite(likesCount) || likesCount < 0 || Math.floor(likesCount) !== likesCount) {
    return NextResponse.json({ error: "likesCount 必须为非负整数" }, { status: 400 });
  }
  const id = rawId.trim();
  const decoded = decodeURIComponent(id);
  const artworks = await getArtworks();
  const target = artworks.find(a => a.id === id || a.id === decoded);
  if (!target) {
    // 返回最新列表，让前端静默刷新
    return NextResponse.json({ ok: false, reason: "not_found", artworks }, { status: 404 });
  }
  target.likesCount = likesCount;
  await saveArtworks(artworks);
  return NextResponse.json({ ok: true, likesCount, artworks });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || "Server error" }, { status: 500 });
  }
}
