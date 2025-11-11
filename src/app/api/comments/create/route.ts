import { NextResponse } from "next/server";
import { getComments, saveComments, newId, getOrCreateUser } from "@/lib/storage";
import { getUserIdFromCookie, ensureUserCookie } from "@/lib/cookies";

export async function POST(req: Request) {
  const userId = (await getUserIdFromCookie()) ?? (await ensureUserCookie());
  let body: any = {};
  try { body = await req.json(); } catch {}
  const artworkId: string | undefined = body?.artworkId;
  const rawContent: string | undefined = body?.content;
  const authorName: string | undefined = body?.authorName;
  if (!artworkId || typeof artworkId !== "string") {
    return NextResponse.json({ error: "Invalid artwork id" }, { status: 400 });
  }
  const content = String(rawContent ?? "").trim();
  if (!content) {
    return NextResponse.json({ error: "评论内容不能为空" }, { status: 400 });
  }
  if (content.length > 500) {
    return NextResponse.json({ error: "评论内容过长 (≤500)" }, { status: 400 });
  }

  if (authorName && typeof authorName === "string") {
    await getOrCreateUser(userId, authorName.trim());
  }
  const comments = await getComments();
  const comment = {
    id: newId(),
    artworkId,
    userId,
    content,
    createdAt: Date.now(),
    likesCount: 0,
  };
  comments.push(comment);
  await saveComments(comments);
  return NextResponse.json({ ok: true, comment });
}

