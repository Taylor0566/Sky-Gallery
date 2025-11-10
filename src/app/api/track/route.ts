import { NextResponse } from "next/server";
import { getVisits, saveVisits, todayStr } from "@/lib/storage";
import { ensureUserCookie, getUserIdFromCookie } from "@/lib/cookies";
import { newId } from "@/lib/storage";

export async function POST() {
  const id = (await getUserIdFromCookie()) ?? (await ensureUserCookie());
  const visits = await getVisits();
  const today = todayStr();
  const exists = visits.find(v => v.userId === id && v.date === today);
  if (!exists) {
    visits.push({ id: newId(), userId: id, date: today });
    await saveVisits(visits);
  }
  const todayCount = visits.filter(v => v.date === today).length;
  return NextResponse.json({ ok: true, todayCount });
}
