---
phase: 03-swipe-ui
reviewed: 2026-05-11T02:57:00Z
depth: standard
files_reviewed: 1
files_reviewed_list:
  - app/api/dog/route.ts
findings:
  critical: 3
  warning: 3
  info: 0
  total: 6
status: issues_found
---

# Phase 03: Code Review Report

**Reviewed:** 2026-05-11T02:57:00Z
**Depth:** standard
**Files Reviewed:** 1 (`app/api/dog/route.ts`; cross-referenced `lib/storage.ts` as imported dependency)
**Status:** issues_found

## Summary

`app/api/dog/route.ts` is a short file with clean structure, but it contains three critical defects: no authentication on the endpoint, an unchecked HTTP response before JSON parsing that will throw a TypeError in production, and a logic gap where a freshly-fetched dog is never verified as unseen for the requesting user. Three additional warnings cover a missing 400 on absent `username`, a silent empty-string dogId, and a read-modify-write race in the storage layer.

---

## Critical Issues

### CR-01: No authentication — any caller can impersonate any username

**File:** `app/api/dog/route.ts:17-24`
**Issue:** `username` is taken directly from the query string with no session verification. Any unauthenticated request to `/api/dog?username=someone_else` will receive dogs "unseen" by that user, exposing the unseen-dog state of every user to anyone who knows their display name. The session (NextAuth) is never checked.
**Fix:**
```typescript
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export async function GET(req: NextRequest): Promise<NextResponse> {
  const session = await getServerSession(authOptions);
  if (!session?.user?.name) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  // Use session.user.name as the authoritative username — ignore the query param
  // or verify that the query param matches session.user.name before use.
  const username = session.user.name;
  ...
}
```

---

### CR-02: `res.ok` not checked before `res.json()` — TypeError crash on random.dog errors

**File:** `app/api/dog/route.ts:27-30`
**Issue:** `fetch` resolves (does not reject) on non-2xx responses. If `random.dog` returns a 429, 500, or any error body that lacks a `url` field, `data.url` will be `undefined`. The next call `isImageUrl(data.url)` calls `undefined.toLowerCase()`, throwing a `TypeError` and crashing the route with an unhandled 500 rather than a graceful retry or clean error message.
**Fix:**
```typescript
const res = await fetch(RANDOM_DOG_URL, { cache: "no-store" });
if (!res.ok) {
  // count this attempt as exhausted and continue the loop
  continue;
}
const data = (await res.json()) as { fileSizeBytes: number; url: string };
if (!data.url) continue;

if (isImageUrl(data.url)) {
  return NextResponse.json({ imageUrl: data.url, dogId: extractDogId(data.url) });
}
```

---

### CR-03: Freshly-fetched dog is not checked against the user's seen history

**File:** `app/api/dog/route.ts:26-33`
**Issue:** `findUnseenDog(username)` only searches dogs already in `swipes.json`. When it returns `null` (all stored dogs are seen, or storage is empty), the code fetches a new dog from `random.dog` and immediately returns it without verifying that the user hasn't already seen it. Because `swipes.json` may contain records for dogs fetched by other sessions or re-fetched after retries, the returned dog could already have an entry for this username in its `col` array — violating the "unseen first" contract.
**Fix:**
```typescript
for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
  const res = await fetch(RANDOM_DOG_URL, { cache: "no-store" });
  if (!res.ok) continue;
  const data = (await res.json()) as { fileSizeBytes: number; url: string };
  if (!data.url || !isImageUrl(data.url)) continue;

  const dogId = extractDogId(data.url);
  if (!dogId) continue;

  // Re-use findUnseenDog or a simple lookup to skip already-seen fetched dogs
  const alreadySeen = await hasUserSeenDog(username, dogId); // new helper in storage.ts
  if (alreadySeen) continue;

  return NextResponse.json({ imageUrl: data.url, dogId });
}
```
Alternatively, add `hasUserSeenDog(username, dogId): Promise<boolean>` to `lib/storage.ts` that checks the stored records.

---

## Warnings

### WR-01: Missing `username` produces silent fallback instead of 400

**File:** `app/api/dog/route.ts:17-24`
**Issue:** When `username` is absent from the query string, the code skips the `findUnseenDog` call and silently falls through to fetch from `random.dog`. Per the CLAUDE.md spec and the route contract (`GET /api/dog?username=<name>`), `username` is a required parameter. A missing `username` should be rejected with a 400, not silently treated as "fetch a random dog for nobody."
**Fix:**
```typescript
const username = req.nextUrl.searchParams.get("username");
if (!username) {
  return NextResponse.json({ error: "username query parameter is required" }, { status: 400 });
}
```

---

### WR-02: `extractDogId` returns empty string on malformed URL, propagated to client and storage

**File:** `app/api/dog/route.ts:12-14`
**Issue:** If `url` is an empty string or a malformed URL where `split("/").pop()` returns `""`, the nullish coalesce `?? ""` still yields `""`. An empty `dogId` is returned to the client. If the client then calls `POST /api/swipe` with `dogId: ""`, a corrupt record is written to `swipes.json` under key `""`. The check belongs before the response is sent.
**Fix:**
```typescript
function extractDogId(url: string): string {
  return url.split("/").pop()?.replace(/\.[^.]+$/, "") ?? "";
}

// At call site in GET handler:
const dogId = extractDogId(data.url);
if (!dogId) continue; // skip this attempt
```

---

### WR-03: `appendAction` in `lib/storage.ts` has a read-modify-write race condition

**File:** `lib/storage.ts:47-57`
**Issue:** `appendAction` reads the entire file, mutates the in-memory array, and writes it back — with no file lock or concurrency guard. Two concurrent POST requests for the same dog (e.g., two browser tabs) can both read the same state, each append their entry, and the last write will silently overwrite the first, losing one swipe action. This is a data-loss risk, not just a performance concern.
**Fix:** Use an in-process mutex (e.g., a simple Promise-chain lock) around the read-modify-write cycle, or switch to an append-only log and compact on read. Minimal approach:
```typescript
let writeLock: Promise<void> = Promise.resolve();

export async function appendAction(...): Promise<DogRecord> {
  writeLock = writeLock.then(async () => {
    // read → mutate → write inside the chained promise
  });
  return writeLock.then(() => dogs.find((d) => d.dogId === dogId)!);
}
```

---

_Reviewed: 2026-05-11T02:57:00Z_
_Reviewer: Claude (gsd-code-reviewer)_
_Depth: standard_
