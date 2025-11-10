import { cookies } from "next/headers";
import { newId } from "./storage";

const USER_COOKIE = "userId";

export async function getUserIdFromCookie() {
  const store = await cookies();
  const val = store.get(USER_COOKIE)?.value;
  return val;
}

export async function ensureUserCookie(): Promise<string> {
  const store = await cookies();
  const existing = store.get(USER_COOKIE)?.value;
  if (existing) return existing;
  const id = newId();
  // 长效持久化，确保不同设备/浏览器拥有独立ID，并在很长时间内复用
  store.set(USER_COOKIE, id, { path: "/", httpOnly: false, sameSite: "lax", maxAge: 365 * 24 * 60 * 60 });
  return id;
}
