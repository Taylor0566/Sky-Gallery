import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { getArtworks, saveArtworks, getOrCreateUser } from "@/lib/storage";

type Body = {
  id: string;
  title?: string;
  userId?: string;
  likesCount?: number;
  dataUrl?: string;
  authorName?: string;
};

export async function POST(req: Request) {
  const store = await cookies();
  const isAdmin = store.get("adminAuth")?.value === "1";
  if (!isAdmin) {
    return NextResponse.json({ error: "forbidden" }, { status: 403 });
  }
  const body = (await req.json().catch(() => ({}))) as Partial<Body>;
  const rawId = body?.id;
  if (!rawId || typeof rawId !== "string") {
    return NextResponse.json({ error: "Invalid artwork id" }, { status: 400 });
  }
  const id = rawId.trim();
  const decoded = decodeURIComponent(id);

  const artworks = await getArtworks();
  const target = artworks.find(a => a.id === id || a.id === decoded);
  if (!target) {
    return NextResponse.json({ ok: false, reason: "not_found", artworks }, { status: 404 });
  }

  // Validate and apply fields
  if (typeof body.title === "string") {
    const t = body.title.trim();
    target.title = t;
  }
  if (typeof body.userId === "string" && body.userId.trim().length > 0) {
    target.userId = body.userId.trim();
  }
  if (typeof body.likesCount !== "undefined") {
    const n = Number(body.likesCount);
    if (!Number.isFinite(n) || n < 0 || Math.floor(n) !== n) {
      return NextResponse.json({ error: "likesCount 必须为非负整数" }, { status: 400 });
    }
    target.likesCount = n;
  }
  if (typeof body.dataUrl === "string") {
    const d = body.dataUrl;
    if (!d.startsWith("data:image/")) {
      return NextResponse.json({ error: "Invalid image data" }, { status: 400 });
    }
    target.dataUrl = d;
  }
  if (typeof body.authorName === "string") {
    const an = body.authorName.trim();
    try {
      await getOrCreateUser(target.userId, an);
    } catch {}
  }

  await saveArtworks(artworks);
  return NextResponse.json({ ok: true, artwork: target, artworks });
}

