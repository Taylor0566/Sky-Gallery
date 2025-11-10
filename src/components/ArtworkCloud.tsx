"use client";
import { useEffect, useState } from "react";
import { tc } from "@/lib/i18nClient";

type Artwork = {
  id: string;
  userId: string;
  title?: string;
  dataUrl: string;
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
                      alert(liked ? '已点赞' : '已取消点赞');
                    }
                  } catch {
                    alert('请求失败');
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
