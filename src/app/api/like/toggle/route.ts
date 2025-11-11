import { NextResponse, NextRequest } from "next/server";
import { getLikes, saveLikes, getArtworks, saveArtworks, todayStr, newId } from "@/lib/storage";
import { getUserIdFromCookie, ensureUserCookie } from "@/lib/cookies";

export async function POST(request: NextRequest) {
  try {
    const id = (await getUserIdFromCookie()) ?? (await ensureUserCookie());
    const body = await request.json().catch(() => ({}));
    const artworkId: string | undefined = body?.artworkId;
    if (!artworkId || typeof artworkId !== "string") {
      return NextResponse.json({ error: "Invalid artwork id" }, { status: 400 });
    }

    const likes = await getLikes();
    const artworks = await getArtworks();
    const target = artworks.find(a => a.id === artworkId);
    if (!target) {
      return NextResponse.json({ error: "Artwork not found" }, { status: 404 });
    }

    const existingIndex = likes.findIndex(l => l.userId === id && l.artworkId === artworkId);
    if (existingIndex >= 0) {
      // Cancel like
      likes.splice(existingIndex, 1);
      target.likesCount = Math.max(0, (target.likesCount ?? 0) - 1);
      await saveLikes(likes);
      await saveArtworks(artworks);
      return NextResponse.json({ ok: true, liked: false, likesCount: target.likesCount });
    }

    // Add like (respect daily limit)
    const today = todayStr();
    const todayLikesByUser = likes.filter(l => l.userId === id && l.date === today);
    if (todayLikesByUser.length >= 10) {
      return NextResponse.json({ error: "每日点赞次数已达上限 (10)" }, { status: 403 });
    }
    likes.push({ id: newId(), userId: id, artworkId, createdAt: Date.now(), date: today });
    await saveLikes(likes);
    target.likesCount = (target.likesCount ?? 0) + 1;
    await saveArtworks(artworks);
    return NextResponse.json({ ok: true, liked: true, likesCount: target.likesCount });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || "Server error" }, { status: 500 });
  }
}
