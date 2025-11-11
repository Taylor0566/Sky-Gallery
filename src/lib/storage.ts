import { promises as fs } from "fs";
import path from "path";
import { v4 as uuidv4 } from "uuid";
import type { User, Artwork, Like, Visit, Comment, CommentLike } from "./types";

const dataDir = path.join(process.cwd(), "data");

async function ensureDir() {
  try {
    await fs.mkdir(dataDir, { recursive: true });
  } catch {}
}

async function readJsonArray<T>(file: string): Promise<T[]> {
  await ensureDir();
  const filePath = path.join(dataDir, file);
  try {
    const content = await fs.readFile(filePath, "utf-8");
    const arr = JSON.parse(content) as T[];
    return Array.isArray(arr) ? arr : [];
  } catch {
    return [];
  }
}

async function writeJsonArray<T>(file: string, data: T[]): Promise<void> {
  await ensureDir();
  const filePath = path.join(dataDir, file);
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
