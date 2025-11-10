"use client";
import NavBar from "@/components/NavBar";
import TrackVisits from "@/components/TrackVisits";
import { useEffect, useState } from "react";
import { tc } from "@/lib/i18nClient";

type Artwork = { id: string; title?: string; dataUrl: string; likesCount?: number; userId: string };

export default function SearchPage() {
  const [q, setQ] = useState("");
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<Artwork[]>([]);
  const [error, setError] = useState<string | null>(null);

  async function search() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/artworks/search?q=${encodeURIComponent(q)}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || tc("error.searchFailed"));
      setResults(data.artworks || []);
    } catch (e: any) {
      setError(e.message || tc("error.searchFailed"));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    // 简单回车触发逻辑可在输入框内通过 onKeyDown 实现
  }, []);

  return (
    <div className="min-h-screen">
      <NavBar />
      <TrackVisits />
      <main className="pt-20 px-6">
        <h1 className="text-white text-2xl font-semibold mb-4 drop-shadow">{tc("search.title")}</h1>
        <div className="flex gap-3 items-center mb-6">
          <input
            value={q}
            onChange={e => setQ(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter') search(); }}
            placeholder={tc("search.placeholder")}
            className="rounded px-3 py-2 w-full max-w-md"
          />
          <button
            onClick={search}
            disabled={!q.trim() || loading}
            className="bg-white/20 text-white px-4 py-2 rounded hover:bg-white/30 disabled:opacity-50"
          >{tc("search.submit")}</button>
        </div>
        {error && <div className="text-red-200 mb-4">{error}</div>}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {results.map(a => (
            <div key={a.id} className="bg-white/80 rounded-xl p-3 shadow">
              <img src={a.dataUrl} alt={a.title ?? tc("artwork.untitled")} className="rounded" />
              <div className="mt-2 text-sm text-zinc-700 flex justify-between">
                <span>{a.title ?? tc("artwork.untitled")}</span>
                <span>❤ {a.likesCount ?? 0}</span>
              </div>
              <div className="text-xs text-zinc-500">{tc("common.id")}{a.id}</div>
            </div>
          ))}
        </div>
        {!loading && results.length === 0 && q.trim() && !error && (
          <div className="text-white/80">{tc("search.noResults")}</div>
        )}
      </main>
    </div>
  );
}
