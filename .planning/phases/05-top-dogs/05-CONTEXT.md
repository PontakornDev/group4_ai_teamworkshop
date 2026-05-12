# Phase 5: Top Dogs - Context

**Gathered:** 2026-05-12
**Status:** Ready for planning

<domain>
## Phase Boundary

Phase 5 adds a "Top Dogs" leaderboard section at the top of `/history` — two highlight cards showing the most liked and most disliked dog across all swipe records. Backed by `getTopDogs()` in `lib/storage.ts` and a new GET `/api/stats` endpoint.

**What Phase 5 delivers:**
- `getTopDogs()` function in `lib/storage.ts` — aggregates likes/dislikes per dogId across all col entries, returns `{ mostLiked, mostDisliked }` (null per category if no data)
- GET `/api/stats` route — calls `getTopDogs()` and returns JSON (TOP-02)
- `components/TopDogsSection.tsx` — two vertical spotlight cards: Most Liked + Most Disliked
- `app/history/page.tsx` updated — calls `getTopDogs()` server-side, passes result to `<TopDogsSection />`

**What Phase 5 does NOT deliver:**
- Per-user leaderboard breakdowns (global stats only)
- Animated or real-time stats refresh
- Dog name/breed (random.dog gives no metadata — show dogId only)

</domain>

<decisions>
## Implementation Decisions

### Data fetching strategy
- **D-01:** Call `getTopDogs()` directly in `app/history/page.tsx` (server component), alongside the existing `readDogs()` call. Pass the result as a prop to `<TopDogsSection topDogs={topDogs} />`. No client-side fetch, no loading state needed — SSR.
- **D-02:** Still create GET `/app/api/stats/route.ts` to satisfy TOP-02. It calls `getTopDogs()` and returns the result as JSON. No auth guard required (public stats endpoint).

### Empty category behavior
- **D-03:** When only one category has data (e.g. likes exist but no dislikes — one result is null), show only the real card(s). No placeholder card for the missing category.
- **D-04:** When both categories are null (swipes.json is empty or no swipes recorded), show a message in the section — e.g. "No swipes yet — start swiping to see top dogs!" — rather than hiding the section entirely.

### Card visual layout
- **D-05:** Vertical spotlight card layout: dog image thumbnail at top (~140px height, full width, `object-cover`), "Most Liked" / "Most Disliked" label below in `text-primary` (`#9b4500`), dogId in small muted text, count badge prominent (e.g. "12 likes").
- **D-06:** Two cards displayed side by side in a `grid grid-cols-2 gap-md` on all screen sizes.
- **D-07:** Section has a "Top Dogs" heading (`text-headline-sm` or `text-title-lg`, `text-on-surface`) above the card grid.
- **D-08:** Cards follow design system: `rounded-[24px]`, `shadow-[0_4px_24px_rgba(0,0,0,0.04)]`, `bg-surface-container-lowest`, Quicksand font.

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Storage and data model
- `lib/storage.ts` — `readDogs()`, `appendAction()`, `findUnseenDog()` already exist; add `getTopDogs()` here. `DogRecord` has `{ dogId, imageUrl, col: SwipeAction[] }`; `SwipeAction` has `{ username, email, action, timestamp }`.

### History page (extend, do not rewrite)
- `app/history/page.tsx` — Server component: auth guard via `auth()`, calls `readDogs()`, renders `<HistoryList />`. Add `getTopDogs()` call and `<TopDogsSection />` render here.
- `components/HistoryList.tsx` — No changes needed for Phase 5. TopDogsSection renders above it as a sibling.

### Design system
- `CLAUDE.md` — Design System section: color tokens, typography scale, shadow values, border radius. Phase 4 design contract section shows card patterns for history page.
- `tailwind.config.ts` — Custom tokens (`bg-primary`, `text-on-surface`, `rounded-[24px]`, etc.)

### Requirements
- `.planning/REQUIREMENTS.md` — TOP-01, TOP-02, TOP-03, TOP-04

### Auth pattern (for history page server component)
- `auth.ts` — NextAuth v5 config; `auth()` for server-side session; already used in history/page.tsx

### Prior phase context
- `.planning/phases/04-history-page/04-CONTEXT.md` — Design patterns, auth pattern, storage patterns established in Phase 4

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- `lib/storage.ts` — Add `getTopDogs()` here. Pattern: `async function` using `readDogs()` internally, returns typed result. Follow existing function style.
- `app/history/page.tsx` — Already a server component with `auth()` guard and `readDogs()` call. Pattern for adding `getTopDogs()` is identical — call it, pass result as prop.
- Design tokens in Tailwind — `rounded-[24px]`, `shadow-[0_4px_24px_rgba(0,0,0,0.04)]`, `bg-surface-container-lowest`, `text-primary` all already configured.

### Established Patterns
- Server component data fetching: call storage functions directly (never `fetch()` in server components for own data)
- Storage reads: always via `lib/storage.ts`, never `fs` directly in routes or pages
- Auth guard: `const session = await auth(); if (!session?.user) redirect("/login");` — already in history/page.tsx (no changes needed)
- New API routes: `app/api/{name}/route.ts`, export `async function GET(req)` returning `NextResponse.json(...)`

### Integration Points
- `app/history/page.tsx`: add `const topDogs = await getTopDogs();` then `<TopDogsSection topDogs={topDogs} />` before `<HistoryList />` in the JSX
- `app/api/stats/route.ts`: new file — GET handler calling `getTopDogs()`, returning result
- `components/TopDogsSection.tsx`: new file — receives `topDogs` prop, renders section heading + `grid-cols-2` card grid

</code_context>

<specifics>
## Specific Ideas

- `getTopDogs()` return type: `{ mostLiked: { dogId: string; imageUrl: string; likeCount: number } | null; mostDisliked: { dogId: string; imageUrl: string; dislikeCount: number } | null }`
- Count badge style: prominent number + label text, e.g. `<span className="text-headline-md font-bold text-primary">12</span><span className="text-body-sm text-on-surface-variant"> likes</span>`
- Tie-breaking: if two dogs have the same like count, either is acceptable — first encountered wins
- `/api/stats` has no auth guard — public endpoint (same rationale as /api/history)
- Empty message when both null: `"No swipes yet — start swiping to see top dogs!"` inside the section (not hiding section)

</specifics>

<deferred>
## Deferred Ideas

- Per-user leaderboard (who liked the most dogs) — new capability, its own phase
- Real-time stats refresh — websocket/SSE for live count updates — Polish phase
- Dog "win streak" or other engagement stats — beyond current scope

</deferred>

---

*Phase: 5-Top Dogs*
*Context gathered: 2026-05-12*
