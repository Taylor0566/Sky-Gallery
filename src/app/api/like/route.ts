import { NextResponse } from "next/server";
import { getLikes, saveLikes, getArtworks, saveArtworks, todayStr, newId } from "@/lib/storage";
import { getUserIdFromCookie, ensureUserCookie } from "@/lib/cookies";

export async function POST(req: Request) {
  const id = (await getUserIdFromCookie()) ?? (await ensureUserCookie());
  const body = await req.json();
  const artworkId: string | undefined = body?.artworkId;
  if (!artworkId || typeof artworkId !== "string") {
    return NextResponse.json({ error: "Invalid artwork id" }, { status: 400 });
  }
  const likes = await getLikes();
  const today = todayStr();
  const todayLikesByUser = likes.filter(l => l.userId === id && l.date === today);
  if (todayLikesByUser.length >= 10) {
    return NextResponse.json({ error: "每日点赞次数已达上限 (10)" }, { status: 403 });
  }
  const already = likes.find(l => l.userId === id && l.artworkId === artworkId);
  if (already) {
    return NextResponse.json({ error: "你已点赞过该作品" }, { status: 409 });
  }
  likes.push({ id: newId(), userId: id, artworkId, createdAt: Date.now(), date: today });
  await saveLikes(likes);
  const artworks = await getArtworks();
  const target = artworks.find(a => a.id === artworkId);
  if (target) {
    target.likesCount = (target.likesCount ?? 0) + 1;
    await saveArtworks(artworks);
  }
  return NextResponse.json({ ok: true });
}
