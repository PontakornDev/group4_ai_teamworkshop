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
    const result = await appendAction("dog1", "https://example.com/dog1.jpg", "alice", "like");
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
    await appendAction("dog1", "https://example.com/dog1.jpg", "alice", "like");
    await appendAction("dog1", "https://example.com/dog1.jpg", "bob", "dislike");
    const all = await readDogs();
    expect(all).toHaveLength(1);
    expect(all[0].col).toHaveLength(2);
    expect(all[0].col[1].username).toBe("bob");
    expect(all[0].col[1].action).toBe("dislike");
  });

  it("two different dogs produce two records", async () => {
    const { appendAction, readDogs } = await getStorage();
    await appendAction("dog1", "https://example.com/dog1.jpg", "alice", "like");
    await appendAction("dog2", "https://example.com/dog2.jpg", "alice", "dislike");
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
    await appendAction("dog1", "https://example.com/dog1.jpg", "bob", "like");
    const result = await findUnseenDog("alice");
    expect(result).not.toBeNull();
    expect(result!.dogId).toBe("dog1");
  });

  it("returns null when all dogs already swiped by username", async () => {
    const { appendAction, findUnseenDog } = await getStorage();
    await appendAction("dog1", "https://example.com/dog1.jpg", "alice", "like");
    const result = await findUnseenDog("alice");
    expect(result).toBeNull();
  });

  it("skips swiped dogs and returns unseen one", async () => {
    const { appendAction, findUnseenDog } = await getStorage();
    await appendAction("dog1", "https://example.com/dog1.jpg", "alice", "like");
    await appendAction("dog2", "https://example.com/dog2.jpg", "bob", "like");
    const result = await findUnseenDog("alice");
    expect(result!.dogId).toBe("dog2");
  });
});
