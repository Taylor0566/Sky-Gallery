import { NextResponse, NextRequest } from "next/server";
import { getComments } from "@/lib/storage";

export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url);
    const artworkId = url.searchParams.get("artworkId") || undefined;
    if (!artworkId) {
      return NextResponse.json({ error: "Missing artworkId" }, { status: 400 });
    }
    const comments = await getComments();
    const rows = comments
      .filter(c => c.artworkId === artworkId)
      .sort((a, b) => b.createdAt - a.createdAt);
    return NextResponse.json({ ok: true, comments: rows });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || "Server error" }, { status: 500 });
  }
}
