import { NextResponse } from "next/server";
import { getVisits } from "@/lib/storage";
import { cookies } from "next/headers";

export async function GET() {
  const store = await cookies();
  const isAdmin = store.get("adminAuth")?.value === "1";
  if (!isAdmin) {
    return NextResponse.json({ error: "forbidden" }, { status: 403 });
  }
  const visits = await getVisits();
  const byDate: Record<string, number> = {};
  for (const v of visits) {
    byDate[v.date] = (byDate[v.date] ?? 0) + 1;
  }
  const rows = Object.entries(byDate)
    .map(([date, count]) => ({ date, count }))
    .sort((a, b) => (a.date < b.date ? 1 : -1));
  return NextResponse.json({ rows });
}
