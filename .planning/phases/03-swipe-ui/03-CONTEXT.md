# Phase 3: Swipe UI - Context

**Gathered:** 2026-05-10
**Status:** Implementation largely complete — fix one bug + verify end-to-end

<domain>
## Phase Boundary

Users can see dog images in a card and swipe like or dislike — each action is saved and the next dog loads. Phase 3 code already exists in the codebase. Work here is: fix one API field name bug, then verify the full swipe flow end-to-end.

**Phase 3 implementation status:**
- `app/swipe/page.tsx` — auth guard + session pass-through ✅
- `app/swipe/SwipeClient.tsx` — dog fetch, swipe logic, loading/empty states ✅
- `components/SwipeCard.tsx` — card with image, gradient scrim, tag overlay ✅
- `components/SwipeButtons.tsx` — dislike/superlike/like FABs ✅
- `components/Navbar.tsx` — Google avatar + display name + sign out ✅
- `lib/storage.ts` — findUnseenDog + appendAction (SWIPE-03 done) ✅
- `app/api/dog/route.ts` — unseen-first logic + .mp4 retry ✅ (bug: returns `url` not `imageUrl`)
- `app/api/swipe/route.ts` — appendAction upsert ✅

</domain>

<decisions>
## Implementation Decisions

### Bug Fix
- **D-01:** Fix is in the API — `/api/dog/route.ts` must return `{ imageUrl, dogId }` (not `{ url, dogId }`). The client `DogData` interface, `SwipeCard`, and swipe POST body all use `imageUrl` — the API was the outlier. This is the only code change needed.

### Design Fidelity
- **D-02:** Existing layout is close enough — no redesign. Mobile bottom-nav and desktop sidebar already match the Stitch swipe pattern. Card/button sizing follows design tokens (rounded-3xl, primary FAB, outline-variant dislike ring). Do not rebuild UI from scratch.

### Error & Loading States
- **D-03:** "No more dogs!" + try-again button covers both empty state and API error for MVP. POLISH-03 (distinct error UI) stays deferred to v2.

### Phase Approach
- **D-04:** Verify-only phase (same as Phase 2). Code exists. Plan = fix the url→imageUrl bug, then run end-to-end verification (fetch dog → swipe → confirm swipes.json updated → next dog loads).

### SuperLike
- **D-05:** SuperLike button maps to "like" action — already implemented in SwipeButtons/SwipeClient. No change needed.

### SWIPE-03
- **D-06:** `lib/storage.ts` already exposes `findUnseenDog(username)` and `appendAction(dogId, imageUrl, username, email, action)`. Both API routes already use these. SWIPE-03 is complete.

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Swipe UI (existing implementation)
- `app/swipe/page.tsx` — Server component auth guard; passes username + email to SwipeClient
- `app/swipe/SwipeClient.tsx` — Client component: fetchDog, swipe(), loading/error/empty render
- `components/SwipeCard.tsx` — Card UI: image fill, gradient scrim, tag overlay, info strip
- `components/SwipeButtons.tsx` — Dislike (close, w-16), SuperLike (star, w-12), Like (favorite, w-[72px] bg-primary)
- `components/Navbar.tsx` — Desktop sidebar + mobile bottom nav, useSession for avatar/name, signOut

### API Routes (existing, one needs fix)
- `app/api/dog/route.ts` — GET ?username=: unseen-first via findUnseenDog, falls back to random.dog; BUG: returns `url` must become `imageUrl`
- `app/api/swipe/route.ts` — POST: validates body, calls appendAction

### Storage
- `lib/storage.ts` — findUnseenDog(username), appendAction(dogId, imageUrl, username, email, action), readDogs(), ensureStore()

### Design Reference
- `design/pawnder_swipe_mobile/` — Mobile swipe layout reference
- `design/pawnder_swipe_desktop/` — Desktop swipe layout reference

### Requirements
- `.planning/REQUIREMENTS.md` — UI-01, UI-02, UI-03, UI-04, UI-05, SWIPE-03

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- `auth()` from `@/auth` — server-side session guard, already in `app/swipe/page.tsx`
- `useSession()` from `next-auth/react` — client session access in Navbar
- `SwipeCard` — accepts `{ imageUrl: string, dogId: string }` props
- `SwipeButtons` — accepts `{ onDislike, onSuperLike, onLike, disabled? }` props

### Established Patterns
- Auth guard: `const session = await auth(); if (!session?.user) redirect("/login");` — already in place
- Session to props: `username={session.user.name ?? session.user.email ?? "user"}` and `email={session.user.email ?? ""}` passed as SwipeClient props
- Dog fetch: `GET /api/dog?username=${encodeURIComponent(username)}` → response must be `{ imageUrl, dogId }`
- Swipe POST: `{ dogId, imageUrl, username, email, action }` body — `imageUrl` comes from `dog.imageUrl`

### Integration Points
- **The only code change needed:** In `app/api/dog/route.ts`, two `NextResponse.json()` calls return `url:` — change both to `imageUrl:`.
  - Line returning unseen dog: `{ url: unseen.imageUrl, ... }` → `{ imageUrl: unseen.imageUrl, ... }`
  - Line returning random.dog fetch: `{ url: data.url, ... }` → `{ imageUrl: data.url, ... }`

</code_context>

<specifics>
## Specific Ideas

- Fix is surgical: only `/api/dog/route.ts` changes, two `url:` keys renamed to `imageUrl:`
- No animations in v1 — POLISH-01 (swipe card animate off-screen) stays deferred
- SuperLike already mapped to "like" — `onSuperLike={() => swipe("like")}` in SwipeClient

</specifics>

<deferred>
## Deferred Ideas

- POLISH-01: Swipe card animates off-screen on like/dislike — v2
- POLISH-03: Distinct error UI (network failure vs no more dogs) — v2

</deferred>

---

*Phase: 3-Swipe UI*
*Context gathered: 2026-05-10*
