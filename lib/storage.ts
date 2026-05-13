import fs from "fs/promises";
import path from "path";

const DATA_DIR = path.join(process.cwd(), "data");
const SWIPES_FILE = path.join(DATA_DIR, "swipes.json");

export interface SwipeAction {
  username: string;
  email: string;
  action: "like" | "dislike";
  timestamp: string;
}

export interface DogRecord {
  dogId: string;
  imageUrl: string;
  col: SwipeAction[];
}

export interface DogSummary {
  dogId: string;
  imageUrl: string;
  likeCount: number;
  dislikeCount: number;
  latestTimestamp: string;
}

export async function ensureStore(): Promise<void> {
  await fs.mkdir(DATA_DIR, { recursive: true });
  try {
    await fs.access(SWIPES_FILE);
  } catch {
    await fs.writeFile(SWIPES_FILE, "[]", "utf-8");
  }
}

export async function readDogs(): Promise<DogRecord[]> {
  await ensureStore();
  const raw = await fs.readFile(SWIPES_FILE, "utf-8");
  return JSON.parse(raw) as DogRecord[];
}

export async function findUnseenDog(
  username: string,
): Promise<DogRecord | null> {
  const dogs = await readDogs();
  return dogs.find((d) => !d.col.some((a) => a.username === username)) ?? null;
}

export async function getHistoryWithCounts(): Promise<DogSummary[]> {
  const dogs = await readDogs();
  return dogs.map((d) => ({
    dogId: d.dogId,
    imageUrl: d.imageUrl,
    likeCount: d.col.filter((c) => c.action === "like").length,
    dislikeCount: d.col.filter((c) => c.action === "dislike").length,
    latestTimestamp: d.col.reduce(
      (max, c) => (c.timestamp > max ? c.timestamp : max),
      "",
    ),
  }));
}

export async function appendAction(
  dogId: string,
  imageUrl: string,
  username: string,
  email: string,
  action: "like" | "dislike",
): Promise<DogRecord> {
  await ensureStore();
  const dogs = await readDogs();
  const entry: SwipeAction = {
    username,
    email,
    action,
    timestamp: new Date().toISOString(),
  };
  const existing = dogs.find((d) => d.dogId === dogId);
  if (existing) {
    existing.col.push(entry);
  } else {
    dogs.push({ dogId, imageUrl, col: [entry] });
  }
  await fs.writeFile(SWIPES_FILE, JSON.stringify(dogs, null, 2), "utf-8");
  return dogs.find((d) => d.dogId === dogId)!;
}

export interface TopDogsResult {
  mostLiked: {
    dogId: string;
    imageUrl: string;
    likeCount: number;
    dislikeCount: number;
  } | null;
  mostDisliked: {
    dogId: string;
    imageUrl: string;
    likeCount: number;
    dislikeCount: number;
  } | null;
}

export async function getTopDogs(): Promise<TopDogsResult> {
  const dogs = await readDogs();

  let mostLiked: {
    dogId: string;
    imageUrl: string;
    likeCount: number;
    dislikeCount: number;
  } | null = null;
  let mostDisliked: {
    dogId: string;
    imageUrl: string;
    likeCount: number;
    dislikeCount: number;
  } | null = null;

  for (const dog of dogs) {
    const likeCount = dog.col.filter((a) => a.action === "like").length;
    const dislikeCount = dog.col.filter((a) => a.action === "dislike").length;

    if (
      likeCount > 0 &&
      (mostLiked === null || likeCount > mostLiked.likeCount)
    ) {
      mostLiked = {
        dogId: dog.dogId,
        imageUrl: dog.imageUrl,
        likeCount,
        dislikeCount,
      };
    }

    if (
      dislikeCount > 0 &&
      (mostDisliked === null || dislikeCount > mostDisliked.dislikeCount)
    ) {
      mostDisliked = {
        dogId: dog.dogId,
        imageUrl: dog.imageUrl,
        likeCount,
        dislikeCount,
      };
    }
  }

  return { mostLiked, mostDisliked };
}
