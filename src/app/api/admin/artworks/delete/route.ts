import { NextResponse, NextRequest } from "next/server";
import { cookies } from "next/headers";
import { getArtworks, saveArtworks, getLikes, saveLikes } from "@/lib/storage";

export async function POST(request: NextRequest) {
  try {
    const store = await cookies();
    const isAdmin = store.get("adminAuth")?.value === "1";
    if (!isAdmin) {
      return NextResponse.json({ error: "forbidden" }, { status: 403 });
    }
    const body = await request.json().catch(() => ({} as any));
    const rawId = body?.id;
    if (!rawId || typeof rawId !== "string") {
      return NextResponse.json({ error: "Invalid artwork id" }, { status: 400 });
    }
    const id = rawId.trim();
    const decoded = decodeURIComponent(id);
    const artworks = await getArtworks();
    const idx = artworks.findIndex(a => a.id === id || a.id === decoded);
    if (idx < 0) {
      // 返回最新列表，让前端静默刷新
      return NextResponse.json({ ok: false, reason: "not_found", artworks }, { status: 404 });
    }
    const removed = artworks.splice(idx, 1)[0];
    await saveArtworks(artworks);
    // 清理关联点赞
    const likes = await getLikes();
    const filtered = likes.filter(l => l.artworkId !== removed.id);
    await saveLikes(filtered);
    return NextResponse.json({ ok: true, artworks });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || "Server error" }, { status: 500 });
  }
}
