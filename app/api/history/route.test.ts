import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import fs from "fs/promises";
import os from "os";
import path from "path";

let tmpDir: string;

beforeEach(async () => {
  tmpDir = await fs.mkdtemp(path.join(os.tmpdir(), "dogtinder-hist-"));
  vi.spyOn(process, "cwd").mockReturnValue(tmpDir);
});

afterEach(async () => {
  vi.restoreAllMocks();
  await fs.rm(tmpDir, { recursive: true, force: true });
});

async function getHistory() {
  vi.resetModules();
  return import("./route");
}

async function getSwipe() {
  vi.resetModules();
  return import("../swipe/route");
}

describe("GET /api/history", () => {
  it("returns empty array when no swipes recorded", async () => {
    const { GET } = await getHistory();
    const res = await GET();
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body).toEqual([]);
  });
});

describe("POST /api/swipe", () => {
  it("returns 400 when action is invalid", async () => {
    const { POST } = await getSwipe();
    const req = new Request("http://localhost/api/swipe", {
      method: "POST",
      body: JSON.stringify({ dogId: "x", imageUrl: "y", action: "jump", username: "z" }),
      headers: { "Content-Type": "application/json" },
    });
    const res = await POST(req as any);
    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body.error).toMatch(/like.*dislike|dislike.*like/i);
  });

  it("returns 400 when dogId is missing", async () => {
    const { POST } = await getSwipe();
    const req = new Request("http://localhost/api/swipe", {
      method: "POST",
      body: JSON.stringify({ imageUrl: "y", action: "like", username: "z" }),
      headers: { "Content-Type": "application/json" },
    });
    const res = await POST(req as any);
    expect(res.status).toBe(400);
  });

  it("saves record and returns DogRecord with server-generated timestamp in col", async () => {
    vi.resetModules();
    const { POST } = await getSwipe();
    const req = new Request("http://localhost/api/swipe", {
      method: "POST",
      body: JSON.stringify({ dogId: "d40de385", imageUrl: "https://random.dog/d40de385.jpg", action: "like", username: "alice" }),
      headers: { "Content-Type": "application/json" },
    });
    const res = await POST(req as any);
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.dogId).toBe("d40de385");
    expect(body.imageUrl).toBe("https://random.dog/d40de385.jpg");
    expect(body.col).toHaveLength(1);
    expect(body.col[0].action).toBe("like");
    expect(body.col[0].username).toBe("alice");
    expect(body.col[0].timestamp).toMatch(/^\d{4}-\d{2}-\d{2}T/);
  });

  it("POST then GET history — record appears in history with col entry", async () => {
    vi.resetModules();
    const { POST } = await getSwipe();
    const req = new Request("http://localhost/api/swipe", {
      method: "POST",
      body: JSON.stringify({ dogId: "end2end", imageUrl: "https://random.dog/end2end.jpg", action: "dislike", username: "bob" }),
      headers: { "Content-Type": "application/json" },
    });
    await POST(req as any);

    vi.resetModules();
    const { GET } = await getHistory();
    const res = await GET();
    const records = await res.json();
    expect(records).toHaveLength(1);
    expect(records[0].dogId).toBe("end2end");
    expect(records[0].col[0].username).toBe("bob");
    expect(records[0].col[0].action).toBe("dislike");
  });
});
