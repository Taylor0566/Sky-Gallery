"use client";
import NavBar from "@/components/NavBar";
import TrackVisits from "@/components/TrackVisits";
import { useEffect, useState } from "react";

type Row = { date: string; count: number };
type Artwork = { id: string; userId: string; title?: string; dataUrl: string; likesCount?: number };

export default function AdminPage() {
  const [rows, setRows] = useState<Row[]>([]);
  const [forbidden, setForbidden] = useState(false);
  const [loading, setLoading] = useState(true);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loginError, setLoginError] = useState<string | null>(null);
  const [artworks, setArtworks] = useState<Artwork[]>([]);
  const [authorNames, setAuthorNames] = useState<Record<string, string>>({});
  const [artworkRows, setArtworkRows] = useState<Row[]>([]);
  useEffect(() => {
    fetch("/api/admin/visits")
      .then(async res => {
        setLoading(false);
        if (res.status === 403) {
          setForbidden(true);
          return;
        }
        const data = await res.json();
        setRows(data.rows || []);
        // 拉取作品列表
        fetch("/api/admin/artworks")
          .then(r => r.json())
          .then(d => setArtworks(d.artworks || []))
          .catch(() => {});
        // 拉取每日新增作品数
        fetch("/api/admin/artworks/stats")
          .then(r => r.json())
          .then(d => setArtworkRows(d.rows || []))
          .catch(() => {});
      })
      .catch(() => setLoading(false));
  }, []);

  async function login() {
    setLoginError(null);
    const res = await fetch("/api/admin/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password }),
    });
    const data = await res.json();
    if (!res.ok) {
      setLoginError(data?.error || "登录失败");
      return;
    }
    // 登录成功后重新拉取数据
    setForbidden(false);
    setLoading(true);
    fetch("/api/admin/visits")
      .then(async r => {
        setLoading(false);
        if (r.status === 403) { setForbidden(true); return; }
        const d = await r.json();
        setRows(d.rows || []);
        // 重新拉取作品列表
        fetch("/api/admin/artworks")
          .then(x => x.json())
          .then(y => setArtworks(y.artworks || []))
          .catch(() => {});
        // 重新拉取每日新增作品数
        fetch("/api/admin/artworks/stats")
          .then(x => x.json())
          .then(y => setArtworkRows(y.rows || []))
          .catch(() => {});
      })
      .catch(() => setLoading(false));
  }
  async function deleteArtwork(id: string) {
    if (!confirm("确认删除该作品？此操作不可撤销")) return;
    const res = await fetch("/api/admin/artworks/delete", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });
    const ct = res.headers.get("content-type") || "";
    let data: any = null;
    try { data = ct.includes("application/json") ? await res.json() : { error: await res.text() }; } catch { data = { error: "解析响应失败" }; }
    if (!res.ok) {
      if (res.status === 404) {
        // 静默刷新列表，不再提示 not found
        await refreshArtworks();
      } else {
        alert(data?.error || "删除失败");
      }
      return;
    }
    if (data?.artworks) {
      setArtworks(data.artworks || []);
    } else {
      setArtworks(prev => prev.filter(a => a.id !== id));
    }
  }
  async function refreshArtworks() {
    try {
      const r = await fetch("/api/admin/artworks");
      const d = await r.json();
      if (r.ok) setArtworks(d.artworks || []);
    } catch {}
  }
  async function updateLikes(id: string, likesCount: number) {
    const n = Math.max(0, Math.floor(Number(likesCount)) || 0);
    const res = await fetch("/api/admin/artworks/updateLikes", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, likesCount: n }),
    });
    const ct = res.headers.get("content-type") || "";
    let data: any = null;
    try { data = ct.includes("application/json") ? await res.json() : { error: await res.text() }; } catch { data = { error: "解析响应失败" }; }
    if (!res.ok) {
      if (res.status === 404) {
        // 静默刷新列表，不提示 not found
        await refreshArtworks();
      } else {
        alert(data?.error || "更新失败");
      }
      return;
    }
    if (data?.artworks) {
      setArtworks(data.artworks || []);
    } else {
      setArtworks(prev => prev.map(a => a.id === id ? { ...a, likesCount: n } : a));
    }
  }
  async function updateInfo(id: string) {
    const art = artworks.find(a => a.id === id);
    if (!art) return;
    const payload: any = { id, title: art.title ?? "", userId: art.userId };
    const authorName = authorNames[id];
    if (authorName && authorName.trim().length > 0) {
      payload.authorName = authorName.trim();
    }
    const res = await fetch("/api/admin/artworks/updateInfo", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const ct = res.headers.get("content-type") || "";
    let data: any = null;
    try { data = ct.includes("application/json") ? await res.json() : { error: await res.text() }; } catch { data = { error: "解析响应失败" }; }
    if (!res.ok) {
      if (res.status === 404) {
        await refreshArtworks();
      } else {
        alert(data?.error || "更新失败");
      }
      return;
    }
    if (data?.artworks) {
      setArtworks(data.artworks || []);
    } else if (data?.artwork) {
      setArtworks(prev => prev.map(a => a.id === id ? data.artwork : a));
    }
  }
  return (
    <div className="min-h-screen">
      <NavBar />
      <TrackVisits />
      <main className="pt-20 px-4 sm:px-6">
        <h1 className="text-white text-2xl font-semibold mb-6 drop-shadow">管理员：每日访问用户数</h1>
        {loading ? (
          <div className="text-white/80">加载中…</div>
        ) : forbidden ? (
          <div className="bg-white/80 rounded-xl p-4 w-full max-w-2xl">
            <h2 className="text-red-600 text-xl font-semibold">仅管理员可访问</h2>
            <p className="text-zinc-700 mt-2">请输入管理员账号与密码登录。</p>
            <div className="mt-4 flex gap-3 items-center">
              <input value={username} onChange={e => setUsername(e.target.value)} placeholder="管理员账号" className="rounded px-3 py-2" />
              <input value={password} onChange={e => setPassword(e.target.value)} placeholder="密码" type="password" className="rounded px-3 py-2" />
              <button onClick={login} disabled={!username || !password} className="bg-white/20 text-zinc-800 px-4 py-2 rounded hover:bg-white/30 disabled:opacity-50">登录</button>
            </div>
            {loginError && <div className="text-red-600 mt-2">{loginError}</div>}
          </div>
        ) : (
          <div className="bg-white/80 rounded-xl p-4 w-full max-w-2xl">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left">
                <th className="py-2">日期</th>
                <th className="py-2">唯一用户数</th>
              </tr>
            </thead>
            <tbody>
              {rows.map(r => (
                <tr key={r.date} className="border-t">
                  <td className="py-2">{r.date}</td>
                  <td className="py-2">{r.count}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <h2 className="text-zinc-800 text-lg font-semibold mt-6 mb-2">每日新增作品数</h2>
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left">
                <th className="py-2">日期</th>
                <th className="py-2">新增作品数</th>
              </tr>
            </thead>
            <tbody>
              {artworkRows.map(r => (
                <tr key={r.date} className="border-t">
                  <td className="py-2">{r.date}</td>
                  <td className="py-2">{r.count}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <h2 className="text-zinc-800 text-lg font-semibold mt-6 mb-2">作品管理</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {artworks.map(a => (
                <div key={a.id} className="bg-white rounded p-3 shadow">
                  <img src={a.dataUrl} alt={a.title ?? "作品"} className="rounded" />
                  <div className="mt-2 text-sm text-zinc-700 flex justify-between">
                    <span>{a.title ?? "作品"}</span>
                    <span>❤ {a.likesCount ?? 0}</span>
                  </div>
                  <div className="text-xs text-zinc-500">ID：{a.id}</div>
                  <div className="mt-2 flex items-center gap-2 flex-wrap">
                    <label className="text-xs text-zinc-600">修改点赞：</label>
                    <button onClick={() => updateLikes(a.id, Math.max(0, (a.likesCount ?? 0) - 1))} className="px-2 py-1 rounded bg-zinc-200 text-zinc-800 hover:bg-zinc-300">-</button>
                    <input
                      type="number"
                      min={0}
                      value={a.likesCount ?? 0}
                      onChange={e => {
                        const val = Math.max(0, Math.floor(Number(e.target.value)) || 0);
                        setArtworks(prev => prev.map(x => x.id === a.id ? { ...x, likesCount: val } : x));
                      }}
                      className="w-20 px-2 py-1 rounded border"
                    />
                    <button onClick={() => updateLikes(a.id, (a.likesCount ?? 0) + 1)} className="px-2 py-1 rounded bg-zinc-200 text-zinc-800 hover:bg-zinc-300">+</button>
                    <button onClick={() => updateLikes(a.id, a.likesCount ?? 0)} className="ml-auto bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700">更新点赞</button>
                  </div>
                  <div className="mt-3 grid grid-cols-1 gap-2">
                    <label className="text-xs text-zinc-600">标题：</label>
                    <input
                      type="text"
                      value={a.title ?? ""}
                      onChange={e => {
                        const val = e.target.value;
                        setArtworks(prev => prev.map(x => x.id === a.id ? { ...x, title: val } : x));
                      }}
                      className="w-full px-2 py-1 rounded border"
                    />
                    <label className="text-xs text-zinc-600">作者ID：</label>
                    <input
                      type="text"
                      value={a.userId}
                      onChange={e => {
                        const val = e.target.value.trim();
                        setArtworks(prev => prev.map(x => x.id === a.id ? { ...x, userId: val } : x));
                      }}
                      className="w-full px-2 py-1 rounded border"
                    />
                    <label className="text-xs text-zinc-600">作者名（可选）：</label>
                    <input
                      type="text"
                      value={authorNames[a.id] ?? ""}
                      onChange={e => {
                        const val = e.target.value;
                        setAuthorNames(prev => ({ ...prev, [a.id]: val }));
                      }}
                      className="w-full px-2 py-1 rounded border"
                    />
                    <div className="flex justify-end">
                      <button onClick={() => updateInfo(a.id)} className="bg-green-600 text-white px-3 py-1 rounded hover:bg-green-700">更新信息</button>
                    </div>
                  </div>
                  <button onClick={() => deleteArtwork(a.id)} className="mt-2 bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600">删除</button>
                </div>
              ))}
              {artworks.length === 0 && (
                <div className="text-zinc-600">暂无作品</div>
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
