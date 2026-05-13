---
phase: 05-top-dogs
reviewed: 2026-05-13T02:27:00Z
depth: standard
files_reviewed: 6
files_reviewed_list:
  - lib/storage.ts
  - app/api/stats/route.ts
  - app/api/stats/route.test.ts
  - components/TopDogsSection.tsx
  - components/TopDogsSection.test.tsx
  - app/history/page.tsx
findings:
  critical: 2
  warning: 3
  info: 1
  total: 6
status: issues_found
---

# Phase 05: Code Review Report

**Reviewed:** 2026-05-13T02:27:00Z
**Depth:** standard
**Files Reviewed:** 6
**Status:** issues_found

## Summary

Phase 5 adds `getTopDogs()` in `lib/storage.ts`, a new `GET /api/stats` route, `TopDogsSection` component, and integrates everything into `app/history/page.tsx`. The core logic is functionally correct for the happy path. However, two blockers stand out: unhandled exceptions from `JSON.parse` in the storage layer will crash all API routes on a corrupt file, and `GET /api/stats` has no error handling, making stack traces externally visible on any storage failure. A visual layout defect in `TopDogsSection` (single card in a forced 2-column grid) and thin test coverage on the stats route are the most significant warnings.

---

## Critical Issues

### CR-01: `readDogs()` has no try/catch around `JSON.parse` — corrupt swipes.json crashes all routes

**File:** `lib/storage.ts:40`
**Issue:** `JSON.parse(raw)` throws a `SyntaxError` on any malformed `swipes.json` (truncated write, manual edit, disk error). This exception is not caught anywhere in `readDogs()`, `getTopDogs()`, `getHistoryWithCounts()`, or `findUnseenDog()`. Every API route that calls these functions (`/api/stats`, `/api/history`, `/api/dog`) will return an unhandled 500 with a stack trace rather than a controlled error response. A single bad byte in the file takes down the entire app's read path.

**Fix:**
```typescript
export async function readDogs(): Promise<DogRecord[]> {
  await ensureStore();
  const raw = await fs.readFile(SWIPES_FILE, "utf-8");
  try {
    return JSON.parse(raw) as DogRecord[];
  } catch {
    // Treat corrupt file as empty store — log for operator visibility
    console.error("[storage] swipes.json is corrupt; treating as empty:", raw.slice(0, 120));
    return [];
  }
}
```

---

### CR-02: `GET /api/stats` exposes unhandled exceptions with no error response

**File:** `app/api/stats/route.ts:4-6`
**Issue:** The route calls `getTopDogs()` with no try/catch. If `getTopDogs()` throws (corrupt JSON, disk full, ENOENT on an unexpected path), Next.js will surface the raw exception as an unformatted 500, potentially leaking internal paths or stack frames to callers. Every other route in this codebase that could throw (`/api/dog`, `/api/swipe`) also lacks this guard, but `stats` is the new Phase 5 addition and must not repeat the pattern.

**Fix:**
```typescript
export async function GET() {
  try {
    const result = await getTopDogs();
    return NextResponse.json(result);
  } catch (err) {
    console.error("[api/stats] failed to compute top dogs:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
```

---

## Warnings

### WR-01: `TopDogsSection` applies `grid-cols-2` even when only one card is present — visual defect

**File:** `components/TopDogsSection.tsx:55`
**Issue:** The grid container is `grid grid-cols-2 gap-md` unconditionally when `cards.length > 0`. When only `mostLiked` or only `mostDisliked` is non-null (partial state), a single card is rendered in a 2-column grid, leaving a visible empty column on the right. The partial-state test cases in `TopDogsSection.test.tsx` (lines 122–143) verify the correct card text is present but do not assert on grid class, so this defect is not caught by existing tests.

**Fix:**
```tsx
<div className={cards.length === 1 ? "flex" : "grid grid-cols-2 gap-md"}>
```
Or conditionally apply the columns:
```tsx
<div className={`grid gap-md ${cards.length === 1 ? "grid-cols-1" : "grid-cols-2"}`}>
```

---

### WR-02: `route.test.ts` for `/api/stats` has no test for the non-empty data path

**File:** `app/api/stats/route.test.ts:23-51`
**Issue:** All four tests operate on an empty `swipes.json`. There is no test that writes actual swipe data to the temp directory and verifies that `mostLiked`/`mostDisliked` are populated with correct values. This means the integration between `getTopDogs()` ranking logic and the HTTP response is never exercised at the route level. A regression in how results are serialized (e.g., wrong field name, missing `imageUrl`) would not be caught.

**Fix:** Add at least one test that seeds `data/swipes.json` with known records and asserts the shape of the non-null response:
```typescript
it("returns correct mostLiked dog when data exists", async () => {
  const dataDir = path.join(tmpDir, "data");
  await fs.mkdir(dataDir, { recursive: true });
  await fs.writeFile(
    path.join(dataDir, "swipes.json"),
    JSON.stringify([
      {
        dogId: "abc",
        imageUrl: "https://random.dog/abc.jpg",
        col: [
          { username: "u1", email: "u1@x.com", action: "like", timestamp: "2026-01-01T00:00:00Z" },
          { username: "u2", email: "u2@x.com", action: "like", timestamp: "2026-01-02T00:00:00Z" },
        ],
      },
    ])
  );
  const { GET } = await getStats();
  const res = await GET();
  const body = await res.json();
  expect(body.mostLiked).toEqual({ dogId: "abc", imageUrl: "https://random.dog/abc.jpg", likeCount: 2 });
});
```

---

### WR-03: `appendAction` has a read-modify-write race — concurrent swipes can lose data

**File:** `lib/storage.ts:66-76`
**Issue:** `appendAction` reads the full JSON, mutates in memory, and writes it back. Two concurrent POST `/api/swipe` requests that read before either writes will each see the state without the other's entry, and the last writer wins — silently dropping one swipe. This is a correctness bug (data loss), not merely a performance concern. For a prototype with a small team this risk is low, but it is not theoretical.

**Fix:** Use atomic file operations with a file lock, or serialize writes via a module-level queue:
```typescript
// Minimal: wrap write in a simple async mutex
import { Mutex } from "async-mutex"; // or a hand-rolled promise queue
const writeMutex = new Mutex();

export async function appendAction(...): Promise<DogRecord> {
  return writeMutex.runExclusive(async () => {
    // existing read-modify-write logic
  });
}
```
Alternatively, append-only writes (one JSON object per line, NDJSON) would eliminate the race entirely.

---

## Info

### IN-01: `getHistoryWithCounts()` returns `latestTimestamp: ""` for records with an empty `col` array

**File:** `lib/storage.ts:55`
**Issue:** The `reduce` call uses `""` as the initial accumulator. If a `DogRecord` ever has `col: []` (possible via direct file editing or a future code path that creates records before swipes), `latestTimestamp` will be the empty string rather than `null` or `undefined`. Callers or display components that expect a valid ISO string will render an empty timestamp label with no error, making the issue silent and hard to diagnose.

**Fix:**
```typescript
latestTimestamp: d.col.length > 0
  ? d.col.reduce((max, c) => (c.timestamp > max ? c.timestamp : max), d.col[0].timestamp)
  : null,
```
Update the `DogSummary` interface to `latestTimestamp: string | null` accordingly.

---

_Reviewed: 2026-05-13T02:27:00Z_
_Reviewer: Claude (gsd-code-reviewer)_
_Depth: standard_
