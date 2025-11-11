import { promises as fs } from "fs";
import path from "path";
import { v4 as uuidv4 } from "uuid";
import type { User, Artwork, Like, Visit, Comment, CommentLike } from "./types";
import { kv } from "@vercel/kv";
import { list, put } from "@vercel/blob";

const baseDataDir = path.join(process.cwd(), "data");
const isServerlessEnv = Boolean(process.env.VERCEL || process.env.AWS_REGION || process.env.LAMBDA_TASK_ROOT);
// 在 Vercel/AWS Lambda 等环境下，/var/task 是只读；改为写入 /tmp（临时，不持久）。
const localWritableDir = isServerlessEnv ? path.join("/tmp", "sky-gallery-data") : baseDataDir;

async function ensureDir() {
  try {
    await fs.mkdir(localWritableDir, { recursive: true });
  } catch {}
}

const hasKV = Boolean(
  process.env.KV_REST_API_URL || process.env.KV_URL || process.env.VERCEL_KV_REST_API_URL
);
const hasBlob = Boolean(
  process.env.BLOB_READ_WRITE_TOKEN || process.env.BLOB_TOKEN || process.env.BLOB_URL
);

function toKVKey(file: string): string {
  const base = file.endsWith(".json") ? file.slice(0, -5) : file;
  return `sky_gallery:${base}`;
}

async function readJsonArrayKV<T>(file: string): Promise<T[]> {
  try {
    const key = toKVKey(file);
    const value = (await kv.get<T[] | null>(key)) ?? [];
    return Array.isArray(value) ? value : [];
  } catch {
    return [];
  }
}

async function writeJsonArrayKV<T>(file: string, data: T[]): Promise<void> {
  const key = toKVKey(file);
  await kv.set(key, data);
}

async function readJsonArrayBlob<T>(file: string): Promise<T[]> {
  try {
    const blobKey = `data/${file}`;
    const res = await list({ prefix: blobKey, limit: 1 });
    const item = (res as any)?.blobs?.[0];
    if (!item) return [];
    const url: string = item.downloadUrl ?? item.url;
    const resp = await fetch(url);
    if (!resp.ok) return [];
    const text = await resp.text();
    const arr = JSON.parse(text) as T[];
    return Array.isArray(arr) ? arr : [];
  } catch {
    return [];
  }
}

async function writeJsonArrayBlob<T>(file: string, data: T[]): Promise<void> {
  const blobKey = `data/${file}`;
  await put(blobKey, JSON.stringify(data, null, 2), {
    access: "public",
    contentType: "application/json",
  });
}

async function readJsonArray<T>(file: string): Promise<T[]> {
  if (hasKV) return readJsonArrayKV<T>(file);
  if (hasBlob) return readJsonArrayBlob<T>(file);
  await ensureDir();
  const writablePath = path.join(localWritableDir, file);
  const readonlyPath = path.join(baseDataDir, file);
  // 先尝试读取可写目录（/tmp 或本地 data），若不存在则回退到只读源（/var/task/data）。
  try {
    const content = await fs.readFile(writablePath, "utf-8");
    const arr = JSON.parse(content) as T[];
    return Array.isArray(arr) ? arr : [];
  } catch {}
  try {
    const content = await fs.readFile(readonlyPath, "utf-8");
    const arr = JSON.parse(content) as T[];
    return Array.isArray(arr) ? arr : [];
  } catch {
    return [];
  }
}

async function writeJsonArray<T>(file: string, data: T[]): Promise<void> {
  if (hasKV) return writeJsonArrayKV<T>(file, data);
  if (hasBlob) return writeJsonArrayBlob<T>(file, data);
  await ensureDir();
  const filePath = path.join(localWritableDir, file);
  await fs.writeFile(filePath, JSON.stringify(data, null, 2), "utf-8");
}

export async function getUsers() {
  return readJsonArray<User>("users.json");
}
export async function saveUsers(users: User[]) {
  return writeJsonArray<User>("users.json", users);
}

export async function getArtworks() {
  return readJsonArray<Artwork>("artworks.json");
}
export async function saveArtworks(artworks: Artwork[]) {
  return writeJsonArray<Artwork>("artworks.json", artworks);
}

export async function getLikes() {
  return readJsonArray<Like>("likes.json");
}
export async function saveLikes(likes: Like[]) {
  return writeJsonArray<Like>("likes.json", likes);
}

export async function getVisits() {
  return readJsonArray<Visit>("visits.json");
}
export async function saveVisits(visits: Visit[]) {
  return writeJsonArray<Visit>("visits.json", visits);
}

export function todayStr(): string {
  const d = new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function newId() {
  return uuidv4();
}

export async function getOrCreateUser(userId?: string, name?: string): Promise<User> {
  const users = await getUsers();
  let user = users.find(u => u.id === userId);
  if (!user) {
    user = { id: userId ?? newId(), name, createdAt: Date.now() };
    users.push(user);
    await saveUsers(users);
  } else if (name && user.name !== name) {
    user.name = name;
    await saveUsers(users);
  }
  return user;
}

// Comments
export async function getComments() {
  return readJsonArray<Comment>("comments.json");
}
export async function saveComments(comments: Comment[]) {
  return writeJsonArray<Comment>("comments.json", comments);
}

// Comment Likes
export async function getCommentLikes() {
  return readJsonArray<CommentLike>("commentLikes.json");
}
export async function saveCommentLikes(commentLikes: CommentLike[]) {
  return writeJsonArray<CommentLike>("commentLikes.json", commentLikes);
}
