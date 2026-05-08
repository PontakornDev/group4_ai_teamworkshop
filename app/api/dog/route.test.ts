import { describe, it, expect, vi, beforeEach } from "vitest";
import { NextRequest } from "next/server";

// vi.hoisted ensures mockFindUnseenDog is initialised before vi.mock's factory runs
const { mockFindUnseenDog } = vi.hoisted(() => ({
  mockFindUnseenDog: vi.fn(),
}));

vi.mock("@/lib/storage", () => ({
  findUnseenDog: mockFindUnseenDog,
}));

function makeReq(params = "") {
  return new NextRequest(`http://localhost/api/dog${params}`);
}

function makeFetchMock(responses: Array<{ url: string }>) {
  let callCount = 0;
  return vi.fn(async () => ({
    json: async () => ({ fileSizeBytes: 1000, url: responses[callCount++ % responses.length].url }),
  }));
}

async function getRoute() {
  vi.resetModules();
  return import("./route");
}

describe("GET /api/dog", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    mockFindUnseenDog.mockReset();
    mockFindUnseenDog.mockResolvedValue(null); // default: no unseen dog → fall through to random.dog
  });

  it("returns { url, dogId } when first response is an image URL", async () => {
    global.fetch = makeFetchMock([{ url: "https://random.dog/d40de385-3626-46c8-94bf-b7097226174f.jpg" }]) as any;
    const { GET } = await getRoute();
    const res = await GET(makeReq());
    const body = await res.json();
    expect(res.status).toBe(200);
    expect(body.url).toBe("https://random.dog/d40de385-3626-46c8-94bf-b7097226174f.jpg");
    expect(body.dogId).toBe("d40de385-3626-46c8-94bf-b7097226174f");
    expect(body.fileSizeBytes).toBeUndefined();
  });

  it("retries on .mp4 and returns the first image URL found", async () => {
    global.fetch = makeFetchMock([
      { url: "https://random.dog/video.mp4" },
      { url: "https://random.dog/cute-dog.jpg" },
    ]) as any;
    const { GET } = await getRoute();
    const res = await GET(makeReq());
    const body = await res.json();
    expect(res.status).toBe(200);
    expect(body.url).toBe("https://random.dog/cute-dog.jpg");
    expect(body.dogId).toBe("cute-dog");
  });

  it("returns 500 after 5 attempts all returning non-image URLs", async () => {
    global.fetch = makeFetchMock([{ url: "https://random.dog/video.mp4" }]) as any;
    const { GET } = await getRoute();
    const res = await GET(makeReq());
    expect(res.status).toBe(500);
    const body = await res.json();
    expect(body.error).toMatch(/5 attempts/);
    expect((global.fetch as ReturnType<typeof vi.fn>).mock.calls.length).toBe(5);
  });

  it("accepts .webp URLs as valid images", async () => {
    global.fetch = makeFetchMock([{ url: "https://random.dog/fluffy.webp" }]) as any;
    const { GET } = await getRoute();
    const res = await GET(makeReq());
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.url).toBe("https://random.dog/fluffy.webp");
  });

  it("returns unseen dog from storage without calling random.dog", async () => {
    mockFindUnseenDog.mockResolvedValueOnce({
      dogId: "stored-dog",
      imageUrl: "https://random.dog/stored-dog.jpg",
      col: [],
    });
    global.fetch = makeFetchMock([{ url: "https://random.dog/other.jpg" }]) as any;
    const { GET } = await getRoute();
    const res = await GET(makeReq("?username=alice"));
    const body = await res.json();
    expect(res.status).toBe(200);
    expect(body.dogId).toBe("stored-dog");
    expect(body.url).toBe("https://random.dog/stored-dog.jpg");
    expect((global.fetch as ReturnType<typeof vi.fn>).mock.calls.length).toBe(0);
  });

  it("falls back to random.dog when no unseen dog in storage", async () => {
    mockFindUnseenDog.mockResolvedValueOnce(null);
    global.fetch = makeFetchMock([{ url: "https://random.dog/fresh.jpg" }]) as any;
    const { GET } = await getRoute();
    const res = await GET(makeReq("?username=alice"));
    const body = await res.json();
    expect(res.status).toBe(200);
    expect(body.dogId).toBe("fresh");
    expect((global.fetch as ReturnType<typeof vi.fn>).mock.calls.length).toBe(1);
  });

  it("skips storage check when no username param provided", async () => {
    global.fetch = makeFetchMock([{ url: "https://random.dog/nouser.jpg" }]) as any;
    const { GET } = await getRoute();
    await GET(makeReq());
    expect(mockFindUnseenDog).not.toHaveBeenCalled();
  });
});
