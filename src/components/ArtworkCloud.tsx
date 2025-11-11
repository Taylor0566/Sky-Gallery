"use client";
import { useEffect, useState } from "react";
import { tc, getLangClient } from "@/lib/i18nClient";

type Artwork = {
  id: string;
  userId: string;
  title?: string;
  dataUrl: string;
  likesCount: number;
};
type Comment = {
  id: string;
  artworkId: string;
  userId: string;
  content: string;
  createdAt: number;
  likesCount: number;
};

type ItemPos = { x: number; y: number; size: number; duration: number; dx: number; dy: number; scaleDuration: number };

function randomPos(): ItemPos {
  const x = Math.random() * 80 + 10; // percent
  const y = Math.random() * 70 + 10;
  const size = (Math.random() * 80 + 60) * 2; // px, doubled
  const duration = Math.random() * 20 + 15; // seconds
  const dx = (Math.random() * 50 - 25); // horizontal drift amplitude in px
  const dy = (Math.random() * 60 - 30); // vertical drift amplitude in px (larger)
  const scaleDuration = Math.random() * 16 + 12; // seconds, independent from drift
  return { x, y, size, duration, dx, dy, scaleDuration };
}

export default function ArtworkCloud({ limit }: { limit?: number }) {
  const [items, setItems] = useState<Artwork[]>([]);
  const [positions, setPositions] = useState<Record<string, ItemPos>>({});
  const [selected, setSelected] = useState<Artwork | null>(null);
  const [likedMap, setLikedMap] = useState<Record<string, boolean>>({});
  const [likeLoading, setLikeLoading] = useState(false);
  const [usersMap, setUsersMap] = useState<Record<string, string>>({});
  const [comments, setComments] = useState<Comment[]>([]);
  const [commentsLoading, setCommentsLoading] = useState(false);
  const [commentsError, setCommentsError] = useState<string | null>(null);
  const [commentText, setCommentText] = useState("");
  const [posting, setPosting] = useState(false);
  const [commentLikedMap, setCommentLikedMap] = useState<Record<string, boolean>>({});
  const [commentLikeLoadingId, setCommentLikeLoadingId] = useState<string | null>(null);
  const refreshItems = async () => {
    try {
      const url = limit ? `/api/artworks/random?count=${limit}` : "/api/artworks/random";
      const r = await fetch(url);
      const d = await r.json();
      const arts: Artwork[] = d.artworks ?? [];
      setItems(arts);
      const pos: Record<string, ItemPos> = {};
      for (const a of arts) pos[a.id] = randomPos();
      setPositions(pos);
    } catch {}
  };
  useEffect(() => {
    refreshItems();
  }, [limit]);

  // 拉取用户映射以显示作者名
  useEffect(() => {
    fetch("/api/users")
      .then(r => r.json())
      .then(d => {
        const users = (d?.users || []) as Array<{ id: string; name?: string }>;
        const map: Record<string, string> = {};
        for (const u of users) map[u.id] = u.name ?? u.id;
        setUsersMap(map);
      })
      .catch(() => {});
  }, []);

  // 选中作品时拉取评论
  useEffect(() => {
    const run = async () => {
      if (!selected) return;
      setCommentsLoading(true);
      setCommentsError(null);
      try {
        const r = await fetch(`/api/comments/list?artworkId=${encodeURIComponent(selected.id)}`);
        const d = await r.json();
        if (!r.ok) throw new Error(d?.error || tc('error.loadCommentsFailed'));
        setComments(d.comments || []);
      } catch (e: any) {
        setCommentsError(e?.message || tc('error.loadCommentsFailed'));
      } finally {
        setCommentsLoading(false);
      }
    };
    run();
  }, [selected]);

  // 定时随机更新每个作品的位置，结合 CSS 过渡实现平滑换位
  useEffect(() => {
    const timer = setInterval(() => {
      setPositions(prev => {
        const next: Record<string, ItemPos> = {};
        for (const id of Object.keys(prev)) {
          const old = prev[id];
          const x = Math.random() * 80 + 10;
          const y = Math.random() * 70 + 10;
          const dx = (Math.random() * 50 - 25);
          const dy = (Math.random() * 60 - 30);
          next[id] = { ...old, x, y, dx, dy };
        }
        return next;
      });
    }, 12000);
    return () => clearInterval(timer);
  }, []);

  // 点击作品后显示信息浮窗，主页不直接显示点赞数量

  return (
    <div className="relative w-full h-[calc(100vh-80px)] overflow-hidden">
      {items.map(a => {
        const p = positions[a.id] ?? randomPos();
        return (
          <div
            key={a.id}
            className="absolute cursor-pointer"
            style={{ left: `${p.x}%`, top: `${p.y}%`, width: p.size, animation: `floatXY ${p.duration}s ease-in-out infinite`, ['--dx' as any]: `${p.dx}px`, ['--dy' as any]: `${p.dy}px`, transition: 'left 8s ease-in-out, top 8s ease-in-out' }}
            onClick={() => setSelected(a)}
          >
            <div style={{ animation: `sizePulse ${p.scaleDuration}s ease-in-out infinite alternate`, transformOrigin: 'center' }}>
              <img src={a.dataUrl} alt={a.title ?? tc("artwork.untitled")} className="rounded-xl" />
            </div>
          </div>
        );
      })}
      {selected && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center" onClick={() => setSelected(null)}>
          <div className="bg-white rounded-xl p-4 w-[90%] max-w-lg" onClick={e => e.stopPropagation()}>
            <img src={selected.dataUrl} alt={selected.title ?? tc("artwork.untitled")} className="rounded mb-3" />
            <div className="text-zinc-800 text-lg font-semibold">{selected.title ?? tc("artwork.untitled")}</div>
            <div className="text-zinc-500 text-sm">{tc("common.author")}{usersMap[selected.userId] ?? selected.userId ?? "未知"}</div>
            <div className="text-zinc-500 text-sm">{tc("common.id")}{selected.id}</div>
            <div className="mt-3 flex gap-2">
              <button
                onClick={async () => {
                  if (!selected) return;
                  setLikeLoading(true);
                  try {
                    const res = await fetch('/api/like/toggle', {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({ artworkId: selected.id }),
                    });
                    const ct = res.headers.get('content-type') || '';
                    let data: any = null;
                    try {
                      if (ct.includes('application/json')) {
                        data = await res.json();
                      } else {
                        const text = await res.text();
                        data = { error: text || '服务器未返回JSON' };
                      }
                    } catch {
                      data = { error: '解析服务器响应失败' };
                    }
                    if (!res.ok) {
                      if (res.status === 404) {
                        alert((data?.error ?? '作品不存在或已删除') + '，已刷新列表');
                        await refreshItems();
                        setSelected(null);
                      } else {
                        alert(data?.error ?? '点赞失败');
                      }
                    } else {
                      const liked = Boolean(data?.liked);
                      setLikedMap(prev => ({ ...prev, [selected.id]: liked }));
                      alert(liked ? tc('notify.liked') : tc('notify.unliked'));
                    }
                  } catch {
                    alert(tc('error.network'));
                  } finally {
                    setLikeLoading(false);
                  }
                }}
                disabled={likeLoading}
                className={`px-3 py-1 rounded ${likeLoading ? 'opacity-60 cursor-not-allowed' : 'bg-zinc-800 text-white hover:bg-zinc-700'}`}
              >
                {likedMap[selected.id] ? tc("actions.unlike") : tc("actions.like")}
              </button>
              <button onClick={() => setSelected(null)} className="px-3 py-1 rounded bg-zinc-500 text-white hover:bg-zinc-600">{tc("actions.close")}</button>
            </div>
            {/* 评论区域（多语言） */}
            <div className="mt-4">
              <h3 className="text-zinc-800 font-semibold mb-2">{tc('comments.title')}</h3>
              <div className="flex gap-2 mb-3">
                <input
                  value={commentText}
                  onChange={e => setCommentText(e.target.value)}
                  placeholder={tc('comments.placeholder')}
                  className="flex-1 rounded px-3 py-2 border"
                />
                <button
                  onClick={async () => {
                    if (!selected) return;
                    const text = commentText.trim();
                    if (!text) return;
                    setPosting(true);
                    setCommentsError(null);
                    try {
                      const res = await fetch('/api/comments/create', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ artworkId: selected.id, content: text })
                      });
                      const ct = res.headers.get('content-type') || '';
                      let data: any = null;
                      try {
                        data = ct.includes('application/json') ? await res.json() : { error: await res.text() };
                      } catch { data = { error: tc('error.network') }; }
                      if (!res.ok) {
                        setCommentsError(data?.error || tc('error.commentPostFailed'));
                      } else {
                        setCommentText('');
                        try {
                          const r = await fetch(`/api/comments/list?artworkId=${encodeURIComponent(selected.id)}`);
                          const d = await r.json();
                          if (r.ok) setComments(d.comments || []);
                        } catch {}
                      }
                    } finally {
                      setPosting(false);
                    }
                  }}
                  disabled={posting || !commentText.trim()}
                  className="px-4 py-2 rounded bg-zinc-800 text-white hover:bg-zinc-700 disabled:opacity-60"
                >{tc('comments.submit')}</button>
              </div>
              {commentsError && <div className="text-red-600 mb-2">{commentsError}</div>}
              <div className="max-h-56 overflow-y-auto space-y-2">
                {commentsLoading ? (
                  <div className="text-zinc-500">{tc('comments.loading')}</div>
                ) : comments.length === 0 ? (
                  <div className="text-zinc-500">{tc('comments.empty')}</div>
                ) : (
                  comments.map(c => (
                    <div key={c.id} className="border rounded p-2 bg-white/90">
                      <div className="text-xs text-zinc-500">{new Intl.DateTimeFormat(getLangClient(), { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(c.createdAt))}</div>
                      <div className="text-sm text-zinc-800 mt-1 whitespace-pre-wrap break-words">{c.content}</div>
                      <div className="mt-2 flex items-center gap-2 text-sm">
                        <span className="text-red-600">❤ {c.likesCount ?? 0}</span>
                        <button
                          onClick={async () => {
                            setCommentLikeLoadingId(c.id);
                            try {
                              const r = await fetch('/api/comments/like/toggle', {
                                method: 'POST',
                                headers: { 'Content-Type': 'application/json' },
                                body: JSON.stringify({ commentId: c.id })
                              });
                              const d = await r.json().catch(() => ({}));
                              if (!r.ok) {
                                alert(d?.error || tc('error.network'));
                              } else {
                                const liked = Boolean(d?.liked);
                                setCommentLikedMap(prev => ({ ...prev, [c.id]: liked }));
                                setComments(prev => prev.map(x => x.id === c.id ? { ...x, likesCount: Number(d?.likesCount ?? x.likesCount) } : x));
                              }
                            } catch {
                              alert(tc('error.network'));
                            } finally {
                              setCommentLikeLoadingId(null);
                            }
                          }}
                          disabled={commentLikeLoadingId === c.id}
                          className={`px-2 py-1 rounded ${commentLikedMap[c.id] ? 'bg-white/40 text-zinc-800' : 'bg-white/20 text-zinc-800 hover:bg-white/30'}`}
                        >{commentLikedMap[c.id] ? tc('actions.unlike') : tc('actions.like')}</button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      )}
      <style>{`
        @keyframes floatXY {
          0%, 100% { transform: translate(0px, 0px); }
          50% { transform: translate(var(--dx), var(--dy)); }
        }
        @keyframes sizePulse {
          from { transform: scale(0.5); }
          to { transform: scale(2); }
        }
      `}</style>
    </div>
  );
}
