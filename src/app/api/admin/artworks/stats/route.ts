import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { getArtworks } from "@/lib/storage";

function dateStrFromMillis(ms: number): string {
  const d = new Date(ms);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export async function GET() {
  const store = await cookies();
  const isAdmin = store.get("adminAuth")?.value === "1";
  if (!isAdmin) {
    return NextResponse.json({ error: "forbidden" }, { status: 403 });
  }
  const artworks = await getArtworks();
  const byDate: Record<string, number> = {};
  for (const a of artworks) {
    const date = dateStrFromMillis(a.createdAt ?? Date.now());
    byDate[date] = (byDate[date] ?? 0) + 1;
  }
  const rows = Object.entries(byDate)
    .map(([date, count]) => ({ date, count }))
    .sort((a, b) => (a.date < b.date ? 1 : -1));
  return NextResponse.json({ rows });
}

