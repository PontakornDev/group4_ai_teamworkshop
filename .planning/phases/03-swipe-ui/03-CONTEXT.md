# Phase 3: Swipe UI - Context

**Gathered:** 2026-05-11 (updated — code review fixes)
**Status:** Implementation complete — code review fixes decided

<domain>
## Phase Boundary

Users can see dog images in a card and swipe like or dislike — each action is saved and the next dog loads. Phase 3 code is complete and verified end-to-end. Remaining work: fix three critical issues and one warning found in the Phase 3 code review (`app/api/dog/route.ts` + `lib/storage.ts`).

**Phase 3 implementation status:**
- `app/swipe/page.tsx` — auth guard + session pass-through ✅
- `app/swipe/SwipeClient.tsx` — dog fetch, swipe logic, loading/empty states ✅
- `components/SwipeCard.tsx` — card with image, gradient scrim, tag overlay ✅
- `components/SwipeButtons.tsx` — dislike/superlike/like FABs ✅
- `components/Navbar.tsx` — Google avatar + display name + sign out ✅
- `lib/storage.ts` — findUnseenDog + appendAction ✅ (needs hasUserSeenDog)
- `app/api/dog/route.ts` — unseen-first logic + .mp4 retry ✅ (needs auth + res.ok + seen check + dogId guard)
- `app/api/swipe/route.ts` — appendAction upsert ✅

</domain>

<decisions>
## Implementation Decisions

### Original Decisions (Phase 3 execution)
- **D-01:** Fix `url → imageUrl` in `/api/dog/route.ts`. ✅ Applied.
- **D-02:** Existing layout close enough — no redesign. Mobile bottom-nav and desktop sidebar match Stitch swipe pattern.
- **D-03:** "No more dogs!" + try-again button covers empty state and API error for MVP.
- **D-04:** Verify-only phase. Code exists. Bug fix + E2E verification. ✅ Complete.
- **D-05:** SuperLike maps to "like" action — already implemented.
- **D-06:** `lib/storage.ts` exposes `findUnseenDog` and `appendAction`. SWIPE-03 complete.

### Auth on /api/dog (CR-01)
- **D-07:** `/api/dog` must verify the NextAuth session before serving a dog — return 401 if no session.
- **D-08:** Use `auth()` from `@/auth` (NextAuth v5). This is the only option — `authOptions` is not exported anywhere; `getServerSession` is v4 and won't work.
- **D-09:** `session.user.name` is the authoritative username. Drop the `username` query param from route logic entirely.

### HTTP Error Handling (CR-02)
- **D-10:** Check `res.ok` before `res.json()` in the fetch loop. `if (!res.ok) continue` — skips the attempt, prevents TypeError crash on random.dog 4xx/5xx.

### Freshly-Fetched Dog Seen Check (CR-03)
- **D-11:** After fetching from random.dog, verify the dog hasn't been seen by this user before returning. If already seen, `continue` the loop.
- **D-12:** Add `hasUserSeenDog(username: string, dogId: string): Promise<boolean>` to `lib/storage.ts`. Reads swipes.json, checks if dogId record has username in its col array. All JSON reads stay in storage.ts per CLAUDE.md design contract.

### Input Validation (WR-02)
- **D-13:** Guard empty dogId in the fetch loop: `const dogId = extractDogId(data.url); if (!dogId) continue;` — prevents empty-string records in swipes.json.
- **D-14:** WR-01 (missing username) is moot — auth check (D-07) ensures username always comes from a valid session.

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

### API Routes
- `app/api/dog/route.ts` — needs: auth() check, res.ok guard, dogId guard, hasUserSeenDog check
- `app/api/swipe/route.ts` — POST: validates body, calls appendAction

### Storage
- `lib/storage.ts` — findUnseenDog(username), appendAction(...), readDogs(), ensureStore(); add hasUserSeenDog(username, dogId)

### Auth
- `auth.ts` — NextAuth v5 config; exports `auth`, `handlers`, `signIn`, `signOut`. Use `auth()` for server-side session.
- `app/api/auth/[...nextauth]/route.ts` — Only exports GET + POST handlers. Does NOT export authOptions.

### Code Review Findings
- `.planning/phases/03-swipe-ui/03-REVIEW.md` — CR-01, CR-02, CR-03, WR-01, WR-02, WR-03 with fix code

### Design Reference
- `design/pawnder_swipe_mobile/` — Mobile swipe layout reference
- `design/pawnder_swipe_desktop/` — Desktop swipe layout reference

### Requirements
- `.planning/REQUIREMENTS.md` — UI-01, UI-02, UI-03, UI-04, UI-05, SWIPE-03

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- `auth()` from `@/auth` — NextAuth v5 server-side session; already used in `app/swipe/page.tsx`
- `useSession()` from `next-auth/react` — client session access in Navbar
- `SwipeCard` — accepts `{ imageUrl: string, dogId: string }` props
- `SwipeButtons` — accepts `{ onDislike, onSuperLike, onLike, disabled? }` props
- `findUnseenDog(username)` in `lib/storage.ts` — returns first unseen dog record or null

### Established Patterns
- Auth guard: `const session = await auth(); if (!session?.user) redirect("/login");` — in `app/swipe/page.tsx`
- API route auth (to implement): `const session = await auth(); if (!session?.user?.name) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });`
- Storage reads: always through lib/storage.ts, never fs directly in routes

### Integration Points
- **app/api/dog/route.ts changes needed:**
  1. Import `auth` from `@/auth`
  2. `const session = await auth(); if (!session?.user?.name) return 401`
  3. Derive `const username = session.user.name` (drop query param)
  4. Fetch loop: `if (!res.ok) continue` before `res.json()`
  5. Fetch loop: `const dogId = extractDogId(data.url); if (!dogId) continue`
  6. Fetch loop: `if (await hasUserSeenDog(username, dogId)) continue`
- **lib/storage.ts change:** Export `hasUserSeenDog(username, dogId)` — reads existing records, returns true if username found in col

</code_context>

<specifics>
## Specific Ideas

- Auth uses `auth()` not `getServerSession` — codebase is NextAuth v5, authOptions not exported
- Session is the only authoritative source for username — query param dropped from route logic
- `hasUserSeenDog` reads same data as `readDogs()` — avoid double file reads if possible by sharing the read
- WR-03 (race condition in appendAction) explicitly deferred — not fixing in Phase 3
- No animations in v1 — POLISH-01 stays deferred
- SuperLike already mapped to "like" — `onSuperLike={() => swipe("like")}` in SwipeClient

</specifics>

<deferred>
## Deferred Ideas

- **WR-03:** Race condition in `appendAction` (read-modify-write, no file lock). Low concurrency risk for workshop prototype — defer to Polish phase.
- **POLISH-01:** Swipe card animates off-screen on like/dislike — v2
- **POLISH-03:** Distinct error UI (network failure vs no more dogs) — v2

</deferred>

---

*Phase: 3-Swipe UI*
*Context gathered: 2026-05-11 (updated with code review fix decisions)*
