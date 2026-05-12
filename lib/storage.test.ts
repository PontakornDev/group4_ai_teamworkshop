import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import fs from "fs/promises";
import os from "os";
import path from "path";

let tmpDir: string;

beforeEach(async () => {
  tmpDir = await fs.mkdtemp(path.join(os.tmpdir(), "dogtinder-"));
  vi.spyOn(process, "cwd").mockReturnValue(tmpDir);
});

afterEach(async () => {
  vi.restoreAllMocks();
  await fs.rm(tmpDir, { recursive: true, force: true });
});

async function getStorage() {
  vi.resetModules();
  return import("./storage");
}

describe("ensureStore", () => {
  it("creates /data dir and swipes.json when neither exists", async () => {
    const { ensureStore } = await getStorage();
    await ensureStore();
    const stat = await fs.stat(path.join(tmpDir, "data", "swipes.json"));
    expect(stat.isFile()).toBe(true);
    const content = await fs.readFile(path.join(tmpDir, "data", "swipes.json"), "utf-8");
    expect(content).toBe("[]");
  });

  it("is idempotent — safe to call multiple times", async () => {
    const { ensureStore } = await getStorage();
    await ensureStore();
    await ensureStore();
    const content = await fs.readFile(path.join(tmpDir, "data", "swipes.json"), "utf-8");
    expect(content).toBe("[]");
  });
});

describe("readDogs", () => {
  it("returns empty array on fresh install", async () => {
    const { readDogs } = await getStorage();
    const result = await readDogs();
    expect(result).toEqual([]);
  });
});

describe("appendAction", () => {
  it("creates new dog record when dogId does not exist", async () => {
    const { appendAction, readDogs } = await getStorage();
    const result = await appendAction("dog1", "https://example.com/dog1.jpg", "alice", "alice@example.com", "like");
    expect(result.dogId).toBe("dog1");
    expect(result.imageUrl).toBe("https://example.com/dog1.jpg");
    expect(result.col).toHaveLength(1);
    expect(result.col[0].username).toBe("alice");
    expect(result.col[0].action).toBe("like");
    expect(result.col[0].timestamp).toMatch(/^\d{4}-\d{2}-\d{2}T/);
    const all = await readDogs();
    expect(all).toHaveLength(1);
  });

  it("appends to col when dogId already exists", async () => {
    const { appendAction, readDogs } = await getStorage();
    await appendAction("dog1", "https://example.com/dog1.jpg", "alice", "alice@example.com", "like");
    await appendAction("dog1", "https://example.com/dog1.jpg", "bob", "bob@example.com", "dislike");
    const all = await readDogs();
    expect(all).toHaveLength(1);
    expect(all[0].col).toHaveLength(2);
    expect(all[0].col[1].username).toBe("bob");
    expect(all[0].col[1].action).toBe("dislike");
  });

  it("two different dogs produce two records", async () => {
    const { appendAction, readDogs } = await getStorage();
    await appendAction("dog1", "https://example.com/dog1.jpg", "alice", "alice@example.com", "like");
    await appendAction("dog2", "https://example.com/dog2.jpg", "alice", "alice@example.com", "dislike");
    const all = await readDogs();
    expect(all).toHaveLength(2);
  });
});

describe("findUnseenDog", () => {
  it("returns null when storage is empty", async () => {
    const { findUnseenDog } = await getStorage();
    const result = await findUnseenDog("alice");
    expect(result).toBeNull();
  });

  it("returns dog record that username has not swiped on", async () => {
    const { appendAction, findUnseenDog } = await getStorage();
    await appendAction("dog1", "https://example.com/dog1.jpg", "bob", "bob@example.com", "like");
    const result = await findUnseenDog("alice");
    expect(result).not.toBeNull();
    expect(result!.dogId).toBe("dog1");
  });

  it("returns null when all dogs already swiped by username", async () => {
    const { appendAction, findUnseenDog } = await getStorage();
    await appendAction("dog1", "https://example.com/dog1.jpg", "alice", "alice@example.com", "like");
    const result = await findUnseenDog("alice");
    expect(result).toBeNull();
  });

  it("skips swiped dogs and returns unseen one", async () => {
    const { appendAction, findUnseenDog } = await getStorage();
    await appendAction("dog1", "https://example.com/dog1.jpg", "alice", "alice@example.com", "like");
    await appendAction("dog2", "https://example.com/dog2.jpg", "bob", "bob@example.com", "like");
    const result = await findUnseenDog("alice");
    expect(result!.dogId).toBe("dog2");
  });
});

describe("getTopDogs", () => {
  it("returns { mostLiked: null, mostDisliked: null } when swipes.json is empty", async () => {
    const { getTopDogs } = await getStorage();
    const result = await getTopDogs();
    expect(result).toEqual({ mostLiked: null, mostDisliked: null });
  });

  it("returns mostLiked with correct shape when one dog has 3 likes, mostDisliked null", async () => {
    const { appendAction, getTopDogs } = await getStorage();
    await appendAction("dog1", "https://example.com/dog1.jpg", "alice", "alice@example.com", "like");
    await appendAction("dog1", "https://example.com/dog1.jpg", "bob", "bob@example.com", "like");
    await appendAction("dog1", "https://example.com/dog1.jpg", "carol", "carol@example.com", "like");
    const result = await getTopDogs();
    expect(result.mostLiked).toEqual({
      dogId: "dog1",
      imageUrl: "https://example.com/dog1.jpg",
      likeCount: 3,
    });
    expect(result.mostDisliked).toBeNull();
  });

  it("returns dog with more likes as mostLiked when two dogs compete", async () => {
    const { appendAction, getTopDogs } = await getStorage();
    // dogA gets 2 likes
    await appendAction("dogA", "https://example.com/dogA.jpg", "alice", "alice@example.com", "like");
    await appendAction("dogA", "https://example.com/dogA.jpg", "bob", "bob@example.com", "like");
    // dogB gets 5 likes
    await appendAction("dogB", "https://example.com/dogB.jpg", "carol", "carol@example.com", "like");
    await appendAction("dogB", "https://example.com/dogB.jpg", "dave", "dave@example.com", "like");
    await appendAction("dogB", "https://example.com/dogB.jpg", "eve", "eve@example.com", "like");
    await appendAction("dogB", "https://example.com/dogB.jpg", "frank", "frank@example.com", "like");
    await appendAction("dogB", "https://example.com/dogB.jpg", "grace", "grace@example.com", "like");
    const result = await getTopDogs();
    expect(result.mostLiked!.dogId).toBe("dogB");
    expect(result.mostLiked!.likeCount).toBe(5);
  });

  it("first encountered dog wins on tie for mostLiked (stable, first-encountered)", async () => {
    const { appendAction, getTopDogs } = await getStorage();
    // dogA and dogB both get 3 likes — dogA is encountered first
    await appendAction("dogA", "https://example.com/dogA.jpg", "alice", "alice@example.com", "like");
    await appendAction("dogA", "https://example.com/dogA.jpg", "bob", "bob@example.com", "like");
    await appendAction("dogA", "https://example.com/dogA.jpg", "carol", "carol@example.com", "like");
    await appendAction("dogB", "https://example.com/dogB.jpg", "dave", "dave@example.com", "like");
    await appendAction("dogB", "https://example.com/dogB.jpg", "eve", "eve@example.com", "like");
    await appendAction("dogB", "https://example.com/dogB.jpg", "frank", "frank@example.com", "like");
    const result = await getTopDogs();
    expect(result.mostLiked!.dogId).toBe("dogA");
  });

  it("counts only 'like' for mostLiked and only 'dislike' for mostDisliked (mixed actions)", async () => {
    const { appendAction, getTopDogs } = await getStorage();
    await appendAction("dog1", "https://example.com/dog1.jpg", "alice", "alice@example.com", "like");
    await appendAction("dog1", "https://example.com/dog1.jpg", "bob", "bob@example.com", "dislike");
    await appendAction("dog1", "https://example.com/dog1.jpg", "carol", "carol@example.com", "like");
    const result = await getTopDogs();
    expect(result.mostLiked!.likeCount).toBe(2);
    expect(result.mostDisliked!.dislikeCount).toBe(1);
  });

  it("returns correct mostLiked and mostDisliked from different dogs", async () => {
    const { appendAction, getTopDogs } = await getStorage();
    // dog1: 2 likes, 1 dislike
    await appendAction("dog1", "https://example.com/dog1.jpg", "alice", "alice@example.com", "like");
    await appendAction("dog1", "https://example.com/dog1.jpg", "bob", "bob@example.com", "like");
    await appendAction("dog1", "https://example.com/dog1.jpg", "carol", "carol@example.com", "dislike");
    // dog2: 0 likes, 3 dislikes
    await appendAction("dog2", "https://example.com/dog2.jpg", "dave", "dave@example.com", "dislike");
    await appendAction("dog2", "https://example.com/dog2.jpg", "eve", "eve@example.com", "dislike");
    await appendAction("dog2", "https://example.com/dog2.jpg", "frank", "frank@example.com", "dislike");
    const result = await getTopDogs();
    expect(result.mostLiked!.dogId).toBe("dog1");
    expect(result.mostLiked!.likeCount).toBe(2);
    expect(result.mostDisliked!.dogId).toBe("dog2");
    expect(result.mostDisliked!.dislikeCount).toBe(3);
  });
});
