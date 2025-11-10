import { NextResponse } from "next/server";
import { getArtworks } from "@/lib/storage";

export async function GET(req: Request) {
  const url = new URL(req.url);
  const q = (url.searchParams.get("q") || "").trim();
  const limitParam = url.searchParams.get("limit");
  const limit = limitParam ? Math.max(1, Number(limitParam)) : undefined;
  if (!q) {
    return NextResponse.json({ error: "缺少查询关键字 q" }, { status: 400 });
  }
  const arts = await getArtworks();
  const qLower = q.toLowerCase();
  let matched = arts.filter(a => a.id === q || (a.title ? a.title.toLowerCase().includes(qLower) : false));
  if (limit) matched = matched.slice(0, limit);
  return NextResponse.json({ artworks: matched });
}

