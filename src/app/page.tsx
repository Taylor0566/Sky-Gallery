import ArtworkCloud from "@/components/ArtworkCloud";
import SkyClouds from "@/components/SkyClouds";
import NavBar from "@/components/NavBar";
import TrackVisits from "@/components/TrackVisits";
import Link from "next/link";
import { cookies } from "next/headers";
import { t } from "@/lib/i18n";

export default async function Home() {
  const lang = (await cookies()).get("lang")?.value;
  return (
    <div className="min-h-screen font-sans sky-bg">
      {/* 动态云朵 */}
      <SkyClouds />
      <NavBar initialLang={lang} />
      <TrackVisits />
      <main className="pt-20 relative">
        {/* 英雄区：更主流更精美的天空主题 */}
        <section className="relative z-10 mx-auto max-w-3xl text-center px-4 sm:px-6">
          <h1 className="text-4xl sm:text-5xl font-bold text-white drop-shadow-lg hero-fade-base hero-title">
            {t(lang, "hero.title")}
          </h1>
          <p className="mt-3 text-white/90 text-sm sm:text-base hero-fade-base hero-sub">
            {t(lang, "hero.subtitle")}
          </p>
          <div className="mt-5 flex items-center justify-center gap-3 hero-fade-base hero-cta">
            <Link href="/draw" prefetch={false} className="px-5 py-2 rounded-full bg-white/70 hover:bg-white text-zinc-900 font-semibold shadow">
              {t(lang, "hero.cta_draw")}
            </Link>
            <Link href="/leaderboard" prefetch={false} className="px-5 py-2 rounded-full bg-blue-600 hover:bg-blue-700 text-white font-semibold shadow">
              {t(lang, "hero.cta_leaderboard")}
            </Link>
          </div>
        </section>
        {/* 作品云：在天空中轻轻漂浮 */}
        <div className="relative z-5 mt-6">
          <ArtworkCloud />
        </div>
      </main>
    </div>
  );
}
