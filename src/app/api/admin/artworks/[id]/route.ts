import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { getArtworks, saveArtworks, getLikes, saveLikes } from "@/lib/storage";

export async function DELETE(req: Request, { params }: { params: { id: string } }) {
  const store = await cookies();
  const isAdmin = store.get("adminAuth")?.value === "1";
  if (!isAdmin) {
    return NextResponse.json({ error: "forbidden" }, { status: 403 });
  }
  const raw = params.id;
  const id = typeof raw === "string" ? raw.trim() : String(raw ?? "");
  const decoded = decodeURIComponent(id);
  const artworks = await getArtworks();
  const idx = artworks.findIndex(a => a.id === id || a.id === decoded);
  if (idx < 0) {
    return NextResponse.json({ error: "Artwork not found" }, { status: 404 });
  }
  artworks.splice(idx, 1);
  await saveArtworks(artworks);
  // remove likes of this artwork
  const likes = await getLikes();
  const filtered = likes.filter(l => l.artworkId !== id);
  await saveLikes(filtered);
  return NextResponse.json({ ok: true });
}

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  const store = await cookies();
  const isAdmin = store.get("adminAuth")?.value === "1";
  if (!isAdmin) {
    return NextResponse.json({ error: "forbidden" }, { status: 403 });
  }
  const raw = params.id;
  const id = typeof raw === "string" ? raw.trim() : String(raw ?? "");
  const decoded = decodeURIComponent(id);
  const body = await req.json().catch(() => ({}));
  const likesCountRaw = body?.likesCount;
  const likesCount = Number(likesCountRaw);
  if (!Number.isFinite(likesCount) || likesCount < 0 || Math.floor(likesCount) !== likesCount) {
    return NextResponse.json({ error: "likesCount 必须为非负整数" }, { status: 400 });
  }
  const artworks = await getArtworks();
  const target = artworks.find(a => a.id === id || a.id === decoded);
  if (!target) {
    return NextResponse.json({ error: "Artwork not found" }, { status: 404 });
  }
  target.likesCount = likesCount;
  await saveArtworks(artworks);
  return NextResponse.json({ ok: true, likesCount });
}
