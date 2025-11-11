import { NextResponse } from "next/server";
import { getCommentLikes, saveCommentLikes, getComments, saveComments, newId } from "@/lib/storage";
import { getUserIdFromCookie, ensureUserCookie } from "@/lib/cookies";

export async function POST(req: Request) {
  const userId = (await getUserIdFromCookie()) ?? (await ensureUserCookie());
  let body: any = {};
  try { body = await req.json(); } catch {}
  const commentId: string | undefined = body?.commentId;
  if (!commentId || typeof commentId !== "string") {
    return NextResponse.json({ error: "Invalid comment id" }, { status: 400 });
  }

  const commentLikes = await getCommentLikes();
  const comments = await getComments();
  const target = comments.find(c => c.id === commentId);
  if (!target) {
    return NextResponse.json({ error: "Comment not found" }, { status: 404 });
  }

  const idx = commentLikes.findIndex(l => l.userId === userId && l.commentId === commentId);
  if (idx >= 0) {
    // cancel like
    commentLikes.splice(idx, 1);
    target.likesCount = Math.max(0, (target.likesCount ?? 0) - 1);
    await saveCommentLikes(commentLikes);
    await saveComments(comments);
    return NextResponse.json({ ok: true, liked: false, likesCount: target.likesCount });
  }

  // add like (no daily limit for comment likes)
  commentLikes.push({ id: newId(), userId, commentId, createdAt: Date.now() });
  await saveCommentLikes(commentLikes);
  target.likesCount = (target.likesCount ?? 0) + 1;
  await saveComments(comments);
  return NextResponse.json({ ok: true, liked: true, likesCount: target.likesCount });
}

