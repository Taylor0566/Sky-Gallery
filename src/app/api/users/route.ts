import { NextResponse } from "next/server";
import { getUsers } from "@/lib/storage";

export async function GET() {
  try {
    const users = await getUsers();
    return NextResponse.json({ users });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || "Failed to load users" }, { status: 500 });
  }
}

