export function isAdmin(id?: string | null): boolean {
  const idsRaw = (process.env.ADMIN_USER_IDS || process.env.ADMIN_USER_ID || "").trim();
  if (!idsRaw) return false; // 安全默认：未配置则无管理员
  const ids = idsRaw.split(",").map(s => s.trim()).filter(Boolean);
  if (!id) return false;
  return ids.includes(id);
}

