import { NextResponse, NextRequest } from "next/server";
import { cookies } from "next/headers";

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => ({}));
  const username = (body?.username || "").toString();
  const password = (body?.password || "").toString();
  const envUser = (process.env.ADMIN_USERNAME || "").trim();
  const envPass = (process.env.ADMIN_PASSWORD || "").trim();
  if (!envUser || !envPass) {
    return NextResponse.json({ error: "未配置管理员账密" }, { status: 500 });
  }
  if (username !== envUser || password !== envPass) {
    return NextResponse.json({ error: "账号或密码错误" }, { status: 401 });
  }
  const store = await cookies();
  store.set("adminAuth", "1", { path: "/", httpOnly: true, sameSite: "lax" });
  return NextResponse.json({ ok: true });
}
