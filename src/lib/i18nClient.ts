import { SupportedLanguages, t, type Lang } from "./i18n";

function parseCookie(name: string): string | undefined {
  if (typeof document === "undefined") return undefined;
  const parts = document.cookie.split(";").map(s => s.trim());
  for (const p of parts) {
    if (p.startsWith(name + "=")) {
      return decodeURIComponent(p.slice(name.length + 1));
    }
  }
  return undefined;
}

export function getLangClient(): Lang {
  const raw = parseCookie("lang") || (typeof localStorage !== "undefined" ? localStorage.getItem("lang") || undefined : undefined);
  return (SupportedLanguages as readonly string[]).includes(String(raw)) ? (raw as Lang) : "zh-CN";
}

export function tc(key: string): string {
  return t(getLangClient(), key);
}

