import { NextResponse } from "next/server";
import { getComments } from "@/lib/storage";

export async function GET(req: Request) {
  const url = new URL(req.url);
  const artworkId = url.searchParams.get("artworkId") || undefined;
  if (!artworkId) {
    return NextResponse.json({ error: "Missing artworkId" }, { status: 400 });
  }
  const comments = await getComments();
  const rows = comments
    .filter(c => c.artworkId === artworkId)
    .sort((a, b) => b.createdAt - a.createdAt);
  return NextResponse.json({ ok: true, comments: rows });
}

