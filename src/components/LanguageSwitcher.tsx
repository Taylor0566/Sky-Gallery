"use client";
import { useEffect, useState } from "react";
import { SupportedLanguages, type Lang } from "@/lib/i18n";
import { useRouter } from "next/navigation";

const LABELS: Record<Lang, string> = {
  "zh-CN": "简体中文",
  "zh-TW": "繁體中文",
  en: "English",
  fr: "Français",
};

function readCookie(name: string): string | undefined {
  if (typeof document === "undefined") return undefined;
  const parts = document.cookie.split(";").map(s => s.trim());
  for (const p of parts) {
    if (p.startsWith(name + "=")) return decodeURIComponent(p.slice(name.length + 1));
  }
  return undefined;
}

export default function LanguageSwitcher() {
  const router = useRouter();
  const [lang, setLang] = useState<Lang>("zh-CN");

  useEffect(() => {
    const fromCookie = readCookie("lang");
    const fromStorage = typeof localStorage !== "undefined" ? localStorage.getItem("lang") || undefined : undefined;
    const val = (fromCookie || fromStorage) as Lang | undefined;
    if (val && (SupportedLanguages as readonly string[]).includes(val)) setLang(val);
  }, []);

  const updateLang = (val: Lang) => {
    try {
      document.cookie = `lang=${encodeURIComponent(val)}; path=/; max-age=31536000; samesite=lax`;
      try { localStorage.setItem("lang", val); } catch {}
    } catch {}
    setLang(val);
    router.refresh();
  };

  return (
    <label className="flex items-center gap-1 text-white/90">
      <span className="hidden sm:inline">🌐</span>
      <select
        value={lang}
        onChange={e => updateLang(e.target.value as Lang)}
        className="bg-white/20 hover:bg-white/30 text-white rounded px-2 py-1 text-sm"
      >
        {SupportedLanguages.map(l => (
          <option key={l} value={l} className="text-black">{LABELS[l]}</option>
        ))}
      </select>
    </label>
  );
}

