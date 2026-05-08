---
phase: 01-api-layer
patch: 02
type: schema-patch
patched: 2026-05-08
reason: "Data schema changed from flat per-swipe record to grouped per-dog DogRecord with col array"
files_modified:
  - lib/storage.ts
  - lib/storage.test.ts
  - app/api/dog/route.ts
  - app/api/dog/route.test.ts
  - app/api/swipe/route.ts
  - app/api/history/route.ts
  - app/api/history/route.test.ts
tests_before: 15
tests_after: 22
---

# Phase 1 Schema Patch

## Why

CLAUDE.md data schema updated after Phase 1 execution. Old schema stored one flat record per swipe (`{dogId, imageUrl, action, username, timestamp}`). New schema groups by dog — one record per dogId with `col` array of swipe actions.

Additionally, GET /api/dog gained an unseen-first serving strategy: check storage for a dog the user hasn't seen before calling random.dog.

## Changes

### `lib/storage.ts`

| Before | After |
|--------|-------|
| `SwipeRecord` interface (flat) | `SwipeAction` + `DogRecord` interfaces |
| `readSwipes(): SwipeRecord[]` | `readDogs(): DogRecord[]` |
| `appendSwipe(record)` — push flat record | `appendAction(dogId, imageUrl, username, action)` — upsert DogRecord, push SwipeAction to col |
| _(absent)_ | `findUnseenDog(username)` — first dog where username absent from col, or null |

### `app/api/dog/route.ts`

- Signature: `GET()` → `GET(req: NextRequest)`
- Logic: reads `username` query param; if present calls `findUnseenDog(username)` first; falls back to random.dog only when no unseen dog found

### `app/api/swipe/route.ts`

- Removed `SwipeRecord` import
- Replaced `appendSwipe(record)` with `appendAction(dogId, imageUrl, username, action)`
- Response is now `DogRecord` (not flat record)

### `app/api/history/route.ts`

- Replaced `readSwipes()` with `readDogs()`

## Test Coverage

7 new tests added (22 total, was 15):

| Suite | New Tests |
|-------|-----------|
| `lib/storage.test.ts` | `appendAction` creates/appends/two-dogs; `findUnseenDog` null/found/null-all-seen/skip-swiped |
| `app/api/dog/route.test.ts` | serves unseen from storage; falls back when none; skips storage when no username |

All existing test behaviors preserved (random.dog retry, mp4 skip, 5-attempt 500, webp, validation 400s).
