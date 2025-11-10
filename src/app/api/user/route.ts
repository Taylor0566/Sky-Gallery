import { NextResponse } from "next/server";
import { getOrCreateUser } from "@/lib/storage";
import { getUserIdFromCookie, ensureUserCookie } from "@/lib/cookies";

export async function GET() {
  const id = (await getUserIdFromCookie()) ?? (await ensureUserCookie());
  const user = await getOrCreateUser(id);
  return NextResponse.json({ user });
}

export async function POST(req: Request) {
  const id = (await getUserIdFromCookie()) ?? (await ensureUserCookie());
  const body = await req.json().catch(() => ({}));
  const name = typeof body?.name === "string" ? body.name : undefined;
  const user = await getOrCreateUser(id, name);
  return NextResponse.json({ user });
}
