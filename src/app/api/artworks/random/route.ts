import { NextResponse, NextRequest } from "next/server";
import { getArtworks } from "@/lib/storage";

export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url);
    const countParam = url.searchParams.get("count");
    const artworks = await getArtworks();
    // shuffle and take first N
    const shuffled = artworks
      .map(a => ({ a, r: Math.random() }))
      .sort((x, y) => x.r - y.r)
      .slice(0, Math.max(0, countParam ? Number(countParam) : artworks.length))
      .map(x => x.a);
    return NextResponse.json({ artworks: shuffled });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || "Server error" }, { status: 500 });
  }
}
