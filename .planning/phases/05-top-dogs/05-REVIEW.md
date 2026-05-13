---
phase: 05-top-dogs
reviewed: 2026-05-13T02:48:00Z
depth: standard
files_reviewed: 7
files_reviewed_list:
  - app/api/stats/route.ts
  - app/api/stats/route.test.ts
  - app/history/page.tsx
  - components/TopDogsSection.tsx
  - components/TopDogsSection.test.tsx
  - lib/storage.ts
  - lib/storage.test.ts
findings:
  critical: 3
  warning: 4
  info: 2
  total: 9
status: issues_found
---

# Phase 05: Code Review Report

**Reviewed:** 2026-05-13T02:48:00Z
**Depth:** standard
**Files Reviewed:** 7
**Status:** issues_found

## Summary

Phase 5 adds `getTopDogs()` in `lib/storage.ts`, `GET /api/stats`, `TopDogsSection`, and wires them into the history page. The ranking logic is correct and test coverage on the storage layer is thorough. Three blockers surface: `GET /api/stats` is fully unauthenticated (any caller can extract swipe analytics without signing in), `JSON.parse` in `readDogs` is unguarded so a corrupt `swipes.json` crashes the entire read path, and `appendAction` has a read-modify-write race condition that can silently drop concurrent swipes. Additional warnings cover the single-card grid layout defect, missing error handling at the route and page level, and thin test coverage on the stats route. Two info items address a silent empty-timestamp edge case and a test description that enshrines the auth gap.

---

## Critical Issues

### CR-01: `GET /api/stats` has no authentication guard — unauthenticated callers receive swipe analytics

**File:** `app/api/stats/route.ts:4`

**Issue:** The route calls `getTopDogs()` and returns `{ mostLiked, mostDisliked }` — including `imageUrl` URLs and vote counts — without checking for a valid session. Every other protected surface in the app requires `auth()` + redirect, but this API route enforces nothing. Any unauthenticated HTTP client (browser, script, automated scraper) can query `GET /api/stats` and receive full analytics data.

The test at `app/api/stats/route.test.ts:24` explicitly asserts this is correct behavior (`"returns 200 with no Authorization header (no auth guard)"`), which means the gap is documented as intentional and will not be caught by CI.

**Fix:**
```typescript
// app/api/stats/route.ts
import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { getTopDogs } from "@/lib/storage";

export async function GET() {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  try {
    const result = await getTopDogs();
    return NextResponse.json(result);
  } catch (err) {
    console.error("[api/stats] failed:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
```

Update `route.test.ts` line 24 to assert 401 on missing session.

---

### CR-02: `readDogs()` — `JSON.parse` is unguarded; corrupt `swipes.json` crashes all API routes

**File:** `lib/storage.ts:40`

**Issue:** `JSON.parse(raw)` throws a `SyntaxError` on any malformed content — truncated write, disk error, manual edit. The exception is caught nowhere in `readDogs()`, `getTopDogs()`, `getHistoryWithCounts()`, `findUnseenDog()`, or `appendAction()`. Every API route that calls these functions (`/api/stats`, `/api/history`, `/api/dog`, `/api/swipe`) will surface an unhandled 500 and may expose internal paths or stack frames. A single bad byte in the file takes down the entire read path with no recovery.

`ensureStore()` only protects against a missing file, not an invalid one.

**Fix:**
```typescript
export async function readDogs(): Promise<DogRecord[]> {
  await ensureStore();
  const raw = await fs.readFile(SWIPES_FILE, "utf-8");
  try {
    return JSON.parse(raw) as DogRecord[];
  } catch {
    console.error("[storage] swipes.json is not valid JSON; treating as empty.");
    return [];
  }
}
```

---

### CR-03: `appendAction` — read-modify-write pattern has a race condition; concurrent swipes silently drop data

**File:** `lib/storage.ts:66-76`

**Issue:** `appendAction` reads the full file, mutates the in-memory array, then writes back. Two concurrent POST `/api/swipe` requests that read before either write will each see the state without the other's entry; the last writer overwrites the first's result, silently dropping a swipe record. This is data loss under concurrent load, not a theoretical concern — Next.js runs multiple requests concurrently in a single Node.js process.

**Fix:** Serialize writes with a module-level lock:
```typescript
// lib/storage.ts (module level)
let writeLock: Promise<void> = Promise.resolve();

export async function appendAction(
  dogId: string,
  imageUrl: string,
  username: string,
  email: string,
  action: "like" | "dislike"
): Promise<DogRecord> {
  const result = await (writeLock = writeLock.then(async () => {
    const dogs = await readDogs();
    const entry: SwipeAction = { username, email, action, timestamp: new Date().toISOString() };
    const existing = dogs.find((d) => d.dogId === dogId);
    let saved: DogRecord;
    if (existing) {
      existing.col.push(entry);
      saved = existing;
    } else {
      saved = { dogId, imageUrl, col: [entry] };
      dogs.push(saved);
    }
    await fs.writeFile(SWIPES_FILE, JSON.stringify(dogs, null, 2), "utf-8");
    return saved;
  }));
  return result;
}
```

---

## Warnings

### WR-01: `TopDogsSection` applies `grid-cols-2` when only one card is present — visual layout defect

**File:** `components/TopDogsSection.tsx:55`

**Issue:** The grid container uses `grid grid-cols-2 gap-md` unconditionally whenever `cards.length > 0`. When only `mostLiked` or only `mostDisliked` is non-null (partial state), a single card is rendered in a two-column grid, leaving a permanent empty column on the right half of the screen. The partial-state tests in `TopDogsSection.test.tsx` (lines 122–143) verify card text is present but do not assert grid class, so this is not caught by the test suite.

**Fix:**
```tsx
<div className={`grid gap-md ${cards.length === 1 ? "grid-cols-1" : "grid-cols-2"}`}>
```

---

### WR-02: `GET /api/stats` route has no try/catch — storage exceptions produce unhandled 500 responses

**File:** `app/api/stats/route.ts:4-6`

**Issue:** `getTopDogs()` is awaited with no error handling. If it throws (file permission error, disk full, parse failure before CR-02 is fixed), Next.js will surface a raw exception response that may expose internal paths or stack frames. The fix in CR-01 already includes a try/catch; this warning is recorded separately to ensure the error-handling gap is addressed even if the auth fix is deferred.

**Fix:** Wrap the storage call (included in the CR-01 fix block above).

---

### WR-03: `appendAction` performs a redundant `ensureStore()` then calls `readDogs()` which also calls `ensureStore()`

**File:** `lib/storage.ts:66-67`

**Issue:** `appendAction` explicitly awaits `ensureStore()` at line 66, then calls `readDogs()` at line 67, which itself awaits `ensureStore()` at line 38. Every `appendAction` call therefore runs two `fs.access` checks and two potential `fs.mkdir` calls in sequence. The outer call is always redundant and adds unnecessary filesystem overhead on the write hot path.

**Fix:** Remove the standalone `ensureStore()` call at line 66:
```typescript
export async function appendAction(...): Promise<DogRecord> {
  // readDogs() calls ensureStore() internally — no need to duplicate
  const dogs = await readDogs();
  // ... rest unchanged
}
```

---

### WR-04: `history/page.tsx` — no error handling around storage calls; any I/O failure crashes the page render

**File:** `app/history/page.tsx:12-13`

**Issue:** `getHistoryWithCounts()` and `getTopDogs()` are awaited without try/catch. If either throws (file permission error, network filesystem timeout, JSON parse error before CR-02 is fixed), the Next.js server component render aborts and the user sees a generic unhandled error page. The prior review cycle (observation #158) flagged this same gap and it was not resolved.

**Fix:** Add a Next.js error boundary (`app/history/error.tsx`) or wrap the fetch calls:
```typescript
let records: DogSummary[] = [];
let topDogs: TopDogsResult = { mostLiked: null, mostDisliked: null };
try {
  [records, topDogs] = await Promise.all([
    getHistoryWithCounts(),
    getTopDogs(),
  ]);
} catch (err) {
  console.error("[HistoryPage] Failed to load swipe data:", err);
  // falls through with empty state rather than crashing
}
```

---

## Info

### IN-01: `getHistoryWithCounts` — `latestTimestamp` reduce returns `""` for records with an empty `col` array

**File:** `lib/storage.ts:55`

**Issue:** The `reduce` call uses `""` as the initial accumulator. If a `DogRecord` exists with `col: []` (possible via direct file edit or a future code path), `latestTimestamp` will be the empty string rather than `null`. Consumers rendering this field will display an empty label with no error signal.

**Fix:**
```typescript
latestTimestamp: d.col.length > 0
  ? d.col.reduce((max, c) => (c.timestamp > max ? c.timestamp : max), d.col[0].timestamp)
  : null,
```
Update `DogSummary.latestTimestamp` to `string | null`.

---

### IN-02: `route.test.ts` — test description permanently documents the auth gap as correct behavior

**File:** `app/api/stats/route.test.ts:24`

**Issue:** The test is titled `"returns 200 with no Authorization header (no auth guard)"`. This phrasing encodes the missing auth guard as the intended contract. If CR-01 is fixed and a 401 guard is added, this test will correctly fail — but the name will mislead future developers into thinking the auth guard was an unintentional regression.

**Fix:** After resolving CR-01, rename the test and flip the assertion:
```typescript
it("returns 401 when request has no session", async () => {
  const { GET } = await getStats();
  const res = await GET();
  expect(res.status).toBe(401);
});
```

---

_Reviewed: 2026-05-13T02:48:00Z_
_Reviewer: Claude (gsd-code-reviewer)_
_Depth: standard_
