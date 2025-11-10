export type User = {
  id: string;
  name?: string;
  createdAt: number; // epoch millis
};

export type Artwork = {
  id: string;
  userId: string;
  title?: string;
  dataUrl: string; // base64 image (PNG)
  createdAt: number;
  likesCount: number;
};

export type Like = {
  id: string;
  userId: string;
  artworkId: string;
  createdAt: number;
  date: string; // YYYY-MM-DD for daily limit
};

export type Visit = {
  id: string;
  userId: string;
  date: string; // YYYY-MM-DD
};

export type LeaderboardItem = {
  artwork: Artwork;
  user?: User;
};
