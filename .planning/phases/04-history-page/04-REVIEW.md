---
phase: 04-history-page
reviewed: 2026-05-12T02:19:00Z
depth: standard
files_reviewed: 2
files_reviewed_list:
  - app/history/page.tsx
  - components/HistoryList.tsx
findings:
  critical: 2
  warning: 3
  info: 1
  total: 6
status: issues_found
---

# Phase 4: Code Review Report

**Reviewed:** 2026-05-12T02:19:00Z
**Depth:** standard
**Files Reviewed:** 2
**Status:** issues_found

## Summary

Reviewed the history page server component (`app/history/page.tsx`) and the client-side list component (`components/HistoryList.tsx`). Cross-referenced `lib/storage.ts` and `auth.ts` for call-chain correctness.

The core swipe-history display logic is structurally sound: auth guard, user-scoped filtering, and sort/filter UI are all present. However, two critical defects were found: real OAuth credentials are committed to the repository in `.env`, and `readDogs()` in `storage.ts` (called directly by the page) has an unguarded `JSON.parse` that can crash the page with an unhandled exception if the JSON file is corrupted. Three warnings cover a silent data-display bug (wrong action shown to current user), a missing timestamp display on mobile, and duplicate local type definitions that drift from the canonical `lib/storage.ts` types.

---

## Critical Issues

### CR-01: Real Google OAuth credentials committed in `.env`

**File:** `.env:1-2`
**Issue:** The file `.env` contains a real Google OAuth Client ID and Client Secret. While `.env` is listed in `.gitignore`, the file exists on disk in the repository working tree and was readable during this review. If `.env` is ever accidentally staged (e.g. `git add -A`, IDE auto-stage, or force-add), these credentials will be pushed to the remote. The CLAUDE.md project spec documents the env vars as `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET` but `auth.ts` reads `CLIENT_ID` / `CLIENT_SECRET` — meaning these specific credentials are already in active use and cannot simply be rotated without updating the auth config too.

This finding is scoped here because the history page review revealed the mismatch between documented env var names and the actual ones read by `auth.ts`, prompting inspection of `.env`.

**Fix:**
1. Immediately rotate the exposed credentials in Google Cloud Console.
2. Move secrets to `.env.local` (already gitignored and excluded from Next.js builds by convention).
3. Never store real credentials in `.env` — use `.env.local` for local secrets, `.env.local.example` with placeholder values for documentation.
4. Reconcile the env var names: CLAUDE.md documents `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET`; `auth.ts` reads `CLIENT_ID` / `CLIENT_SECRET`. Pick one naming scheme and use it consistently.

---

### CR-02: Unhandled `JSON.parse` in `readDogs()` crashes the history page with no error boundary

**File:** `lib/storage.ts:32` (called by `app/history/page.tsx:11`)
**Issue:** `readDogs()` calls `JSON.parse(raw)` with no try/catch. If `data/swipes.json` contains malformed JSON (truncated write, concurrent write collision, manual edit error), this throws a `SyntaxError` that propagates up through `app/history/page.tsx` as an unhandled server-side exception. Next.js App Router will render the nearest error boundary or a generic 500 page. The history page has no `error.tsx` co-located, so users see a raw error page. More importantly, because `appendAction` also calls `readDogs()` internally (line 48), a corrupted file will also break all new swipe writes — the whole app's write path dies silently until someone manually fixes the JSON file.

**Fix:**
```typescript
// lib/storage.ts
export async function readDogs(): Promise<DogRecord[]> {
  await ensureStore();
  const raw = await fs.readFile(SWIPES_FILE, "utf-8");
  try {
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed as DogRecord[];
  } catch {
    // Corrupted file — treat as empty rather than crashing the app.
    // Optionally: back up the corrupted file before returning [].
    console.error("[storage] swipes.json is malformed; returning empty list");
    return [];
  }
}
```

---

## Warnings

### WR-01: `col[0]` fallback silently shows another user's action badge on the card

**File:** `components/HistoryList.tsx:159` and `components/HistoryList.tsx:191`
**Issue:** Both the mobile list and the desktop grid use:
```ts
const myEntry = dog.col.find((e) => e.username === currentUser) ?? dog.col[0];
```
The `mine` filter on line 47 ensures every `dog` in `sorted` has at least one entry where `e.username === currentUser`, so `dog.col.find(...)` should never return `undefined` for a correctly filtered record. The `?? dog.col[0]` fallback is therefore dead code under normal operation — but if a race condition, stale prop, or future refactor breaks the invariant, the fallback silently renders a *different user's* like/dislike badge on the card, which is a data integrity display bug. The fallback should either be removed (trust the filter) or assert the invariant explicitly.

**Fix:** Remove the fallback to make intent explicit and surface bugs early:
```ts
const myEntry = dog.col.find((e) => e.username === currentUser);
if (!myEntry) return null; // invariant violation — skip card
```
Or if you want to keep the fallback, document clearly why it's needed and what the UX intent is.

---

### WR-02: Mobile card omits timestamp; desktop card shows it — inconsistent UX

**File:** `components/HistoryList.tsx:182` (mobile) vs `components/HistoryList.tsx:215-219` (desktop)
**Issue:** The desktop grid card shows the swipe timestamp below the action badge (lines 215-219). The mobile list card (line 182) only renders `<ActionBadge>` with no timestamp at all. The history page's purpose is to show "past swipe records" — omitting the timestamp on mobile means users on mobile cannot see when they swiped. This is a feature gap, not just cosmetic inconsistency.

**Fix:** Add timestamp display below the action badge in the mobile card:
```tsx
{/* Mobile card — after ActionBadge */}
{myEntry && (
  <div className="flex flex-col items-end gap-xs">
    <ActionBadge action={myEntry.action} />
    {myEntry.timestamp && (
      <p className="font-bold text-label-lg text-on-surface-variant">
        {new Date(myEntry.timestamp).toLocaleDateString()}
      </p>
    )}
  </div>
)}
```

---

### WR-03: Local `ColEntry` / `DogRecord` interfaces in `HistoryList.tsx` duplicate `lib/storage.ts` types and can silently drift

**File:** `components/HistoryList.tsx:6-17`
**Issue:** `HistoryList.tsx` defines its own `ColEntry` and `DogRecord` interfaces locally (lines 6-17). `lib/storage.ts` already exports the canonical `SwipeAction` and `DogRecord` interfaces. The two definitions are structurally compatible today, but they are not linked — a future change to `lib/storage.ts` (e.g. adding a required field to `SwipeAction`) will not cause a compile error in `HistoryList.tsx`. The component will silently accept stale data shapes.

**Fix:** Import and reuse the canonical types from `lib/storage.ts`:
```ts
import type { DogRecord } from "@/lib/storage";
// ColEntry becomes SwipeAction in lib/storage.ts — use that name, or re-export an alias
```
Then remove the local `ColEntry` and `DogRecord` interface declarations (lines 6-17).

---

## Info

### IN-01: `sorted` array is re-traversed up to 4× per render via repeated `col.find()` calls

**File:** `components/HistoryList.tsx:55-79` and `:159`, `:191`
**Issue:** For each dog record, `col.find(e => e.username === currentUser)` is called independently in `filtered` (line 56), `sorted` (lines 63-64), `stats` (lines 74, 77), and again in the render body (lines 159, 191). For a user with many swipe records and large `col` arrays (shared dogs swiped by many users), this traverses each `col` array 5-6 times. While not a correctness issue, the pattern creates fragility — the find predicate is duplicated in 6 places and would need to be updated in 6 places if the matching logic changes (e.g. switching from username to email matching).

**Fix:** Extract a helper or compute `myEntry` once per record upstream in `mine`:
```ts
// Compute once; carry through filter/sort/render
const mine = useMemo(() => {
  if (!currentUser) return [];
  return records
    .map((r) => ({ ...r, myEntry: r.col.find((e) => e.username === currentUser) }))
    .filter((r) => r.myEntry !== undefined) as (DogRecord & { myEntry: ColEntry })[];
}, [records, currentUser]);
```
This makes the predicate single-source and eliminates all downstream `col.find()` calls.

---

_Reviewed: 2026-05-12T02:19:00Z_
_Reviewer: Claude (gsd-code-reviewer)_
_Depth: standard_
