import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import fs from "fs/promises";
import os from "os";
import path from "path";

let tmpDir: string;

beforeEach(async () => {
  tmpDir = await fs.mkdtemp(path.join(os.tmpdir(), "dogtinder-stats-"));
  vi.spyOn(process, "cwd").mockReturnValue(tmpDir);
});

afterEach(async () => {
  vi.restoreAllMocks();
  await fs.rm(tmpDir, { recursive: true, force: true });
});

async function getStats() {
  vi.resetModules();
  return import("./route");
}

describe("GET /api/stats", () => {
  it("returns 200 with no Authorization header (no auth guard)", async () => {
    const { GET } = await getStats();
    const res = await GET();
    expect(res.status).toBe(200);
  });

  it("returns application/json content type", async () => {
    const { GET } = await getStats();
    const res = await GET();
    expect(res.headers.get("content-type")).toMatch(/application\/json/);
  });

  it("response body is parseable JSON with keys mostLiked and mostDisliked", async () => {
    const { GET } = await getStats();
    const res = await GET();
    const body = await res.json();
    expect(body).toHaveProperty("mostLiked");
    expect(body).toHaveProperty("mostDisliked");
  });

  it("when swipes.json is empty, both mostLiked and mostDisliked are null", async () => {
    const { GET } = await getStats();
    const res = await GET();
    const body = await res.json();
    expect(body.mostLiked).toBeNull();
    expect(body.mostDisliked).toBeNull();
  });
});
