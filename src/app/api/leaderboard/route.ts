import { NextResponse } from "next/server";
import { getArtworks, getUsers } from "@/lib/storage";

export async function GET() {
  const artworks = await getArtworks();
  const users = await getUsers();
  const items = artworks
    .slice()
    .sort((a, b) => (b.likesCount ?? 0) - (a.likesCount ?? 0))
    .map(a => ({ artwork: a, user: users.find(u => u.id === a.userId) }));
  return NextResponse.json({ items });
}
