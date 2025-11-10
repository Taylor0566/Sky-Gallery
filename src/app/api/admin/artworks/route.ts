import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { getArtworks } from "@/lib/storage";

export async function GET() {
  const store = await cookies();
  const isAdmin = store.get("adminAuth")?.value === "1";
  if (!isAdmin) {
    return NextResponse.json({ error: "forbidden" }, { status: 403 });
  }
  const artworks = await getArtworks();
  return NextResponse.json({ artworks });
}

