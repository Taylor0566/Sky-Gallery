import NavBar from "@/components/NavBar";
import TrackVisits from "@/components/TrackVisits";
import { getArtworks, getUsers } from "@/lib/storage";
import { cookies } from "next/headers";
import { t } from "@/lib/i18n";

export default async function LeaderboardPage() {
  const lang = (await cookies()).get("lang")?.value;
  const artworks = await getArtworks();
  const users = await getUsers();
  const items = artworks
    .slice()
    .sort((a, b) => (b.likesCount ?? 0) - (a.likesCount ?? 0))
    .map(a => ({ artwork: a, user: users.find(u => u.id === a.userId) }));
  const ranked = items.map((it, idx) => ({ ...it, rank: idx + 1 }));
  const top = ranked.slice(0, 3);
  const rest = ranked.slice(3);
  return (
    <div className="min-h-screen">
      <NavBar initialLang={lang} />
      <TrackVisits />
      <main className="pt-16 px-3 sm:px-4">
        <h1 className="text-white text-xl font-semibold mb-4 drop-shadow">{t(lang, "leaderboard.title")}</h1>
        {/* 颁奖台区域：第二、第一、第三（中间最高） */}
        <section className="max-w-4xl mx-auto mb-6">
          <div className="grid grid-cols-3 gap-2 sm:gap-4 items-end">
            {([top[1], top[0], top[2]]).map((it, idx) => {
              if (!it) return <div key={idx} />;
              const { artwork, user, rank } = it;
              const isCenter = idx === 1; // 第一名在中间
              const heightBase = isCenter ? "h-28 sm:h-36" : idx === 0 ? "h-24 sm:h-28" : "h-20 sm:h-24";
              const badgeBg = rank === 1 ? "bg-yellow-400 text-zinc-900" : rank === 2 ? "bg-gray-300 text-zinc-900" : "bg-amber-600 text-white";
              const badgeEmoji = rank === 1 ? "🥇" : rank === 2 ? "🥈" : "🥉";
              return (
                <div key={artwork.id} className="flex flex-col items-center">
                  <div className="relative">
                    <img src={artwork.dataUrl} alt={artwork.title ?? "作品"} className={`rounded ${isCenter ? "w-24 h-24 sm:w-28 sm:h-28" : "w-20 h-20 sm:w-24 sm:h-24"} object-cover drop-shadow`} />
                    <div className={`absolute -top-2 -right-2 w-7 h-7 rounded-full flex items-center justify-center font-bold ring-2 ring-white/60 ${badgeBg}`}>
                      <span className="text-[11px] leading-none">{badgeEmoji}</span>
                    </div>
                  </div>
                  <div className={`mt-2 w-full ${heightBase} bg-white/90 rounded-t-md rounded-b-lg border border-white/50 shadow-sm flex items-end justify-center`}></div>
                  <div className="mt-1 text-zinc-800 font-semibold text-sm text-center truncate max-w-[12rem]">{artwork.title ?? "作品"}</div>
                  <div className="text-zinc-500 text-xs text-center truncate max-w-[12rem]">{t(lang, "common.author")}{user?.name ?? user?.id ?? "未知"}</div>
                  <div className="text-red-600 text-sm">❤ {artwork.likesCount ?? 0}</div>
                </div>
              );
            })}
          </div>
        </section>

        {/* 竖直列表：从第4名开始 */}
        <section className="max-w-3xl mx-auto">
          <div className="space-y-2">
            {rest.map(({ artwork, user, rank }) => (
              <div key={artwork.id} className="relative pl-6 border-l-2 border-white/20 rounded-lg p-2 bg-white/85 shadow-sm">
                <div className="absolute -left-4 top-2 w-7 h-7 rounded-full bg-zinc-700 text-white flex items-center justify-center font-bold ring-2 ring-white/60">
                  <span className="text-[11px] leading-none">{rank}</span>
                </div>
                <div className="flex items-center gap-2">
                  <img src={artwork.dataUrl} alt={artwork.title ?? "作品"} className="rounded w-14 h-14 object-cover" />
                  <div className="flex-1 min-w-0">
                    <div className="text-zinc-800 font-semibold text-sm truncate">{artwork.title ?? "作品"}</div>
                    <div className="text-zinc-500 text-xs truncate">{t(lang, "common.author")}{user?.name ?? user?.id ?? "未知"}</div>
                  </div>
                  <div className="text-red-600 text-sm">❤ {artwork.likesCount ?? 0}</div>
                </div>
              </div>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}
