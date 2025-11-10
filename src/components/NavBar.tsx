"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import LanguageSwitcher from "./LanguageSwitcher";
import { t, type Lang } from "@/lib/i18n";
import { getLangClient } from "@/lib/i18nClient";

type Props = { initialLang?: Lang | string };

export default function NavBar({ initialLang }: Props) {
  const [lang, setLang] = useState<Lang>((typeof initialLang === "string" ? (initialLang as Lang) : "zh-CN"));
  const [likesLeft, setLikesLeft] = useState<number | null>(null);
  // 这里可扩展显示“今日剩余点赞”，当前不主动请求 API 以减少无谓网络开销。
  const shareFacebook = () => {
    const url = encodeURIComponent(window.location.href);
    window.open(`https://www.facebook.com/sharer/sharer.php?u=${url}`, '_blank');
  };
  const shareX = () => {
    const url = encodeURIComponent(window.location.href);
    const text = encodeURIComponent(document.title || t(lang, 'common.brand'));
    window.open(`https://twitter.com/intent/tweet?url=${url}&text=${text}`, '_blank');
  };
  const shareInstagram = async () => {
    const href = window.location.href;
    try { await navigator.clipboard?.writeText(href); } catch {}
    alert('链接已复制，打开 Instagram 后粘贴分享');
    window.open('https://www.instagram.com/', '_blank');
  };
  const IconFacebook = () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M22 12a10 10 0 1 0-11.5 9.9v-7H8v-3h2.5V9.5A3.5 3.5 0 0 1 14 6h3v3h-2a1 1 0 0 0-1 1V12h3l-.5 3h-2.5v7A10 10 0 0 0 22 12Z"/></svg>
  );
  const IconInstagram = () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M7 2h10a5 5 0 0 1 5 5v10a5 5 0 0 1-5 5H7a5 5 0 0 1-5-5V7a5 5 0 0 1 5-5Zm0 2a3 3 0 0 0-3 3v10a3 3 0 0 0 3 3h10a3 3 0 0 0 3-3V7a3 3 0 0 0-3-3H7Zm5 4a5 5 0 1 1 0 10 5 5 0 0 1 0-10Zm6.5-.5a1.5 1.5 0 1 1-3.001.001A1.5 1.5 0 0 1 18.5 7.5Z"/></svg>
  );
  const IconX = () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M4 4h3.5l5.2 6.9L16.5 4H20l-6.7 8.7L20 20h-3.5l-5.5-7.3L7.5 20H4l7-9.1L4 4Z"/></svg>
  );
  
  // 保证首屏 SSR 与客户端初次渲染一致，避免 hydration mismatch
  useEffect(() => {
    if (typeof initialLang === "string" && initialLang !== lang) {
      setLang(initialLang as Lang);
    }
    const clientLang = getLangClient();
    if (clientLang !== lang) setLang(clientLang);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialLang]);
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-4 sm:px-6 py-3 backdrop-blur-sm">
      <div className="flex items-center gap-2 sm:gap-4">
        <Link href="/" prefetch={false} className="font-semibold text-white drop-shadow">{t(lang, "common.brand")}</Link>
        <Link href="/draw" prefetch={false} className="text-white/90 hover:text-white">{t(lang, "nav.draw")}</Link>
        <Link href="/leaderboard" prefetch={false} className="text-white/90 hover:text-white">{t(lang, "nav.leaderboard")}</Link>
        <Link href="/search" prefetch={false} className="text-white/90 hover:text-white">{t(lang, "nav.search")}</Link>
      </div>
      <div className="flex items-center gap-2 sm:gap-3 text-white/90 flex-wrap justify-end">
        <span className="hidden sm:block">{likesLeft !== null ? `${t(lang, "nav.likesLeft")}：${likesLeft}` : ""}</span>
        <button onClick={shareFacebook} aria-label={t(lang, "share.facebook")} className="p-2 rounded bg-white/20 hover:bg-white/30 text-white"><IconFacebook /></button>
        <button onClick={shareInstagram} aria-label={t(lang, "share.instagram")} className="p-2 rounded bg-white/20 hover:bg-white/30 text-white"><IconInstagram /></button>
        <button onClick={shareX} aria-label={t(lang, "share.x")} className="p-2 rounded bg-white/20 hover:bg-white/30 text-white"><IconX /></button>
        <LanguageSwitcher />
      </div>
    </nav>
  );
}
