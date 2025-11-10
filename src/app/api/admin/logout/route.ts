import { NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function POST() {
  const store = await cookies();
  store.set("adminAuth", "", { path: "/", httpOnly: true, sameSite: "lax", maxAge: 0 });
  return NextResponse.json({ ok: true });
}
