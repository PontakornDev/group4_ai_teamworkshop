# Phase 4: History Page - Context

**Gathered:** 2026-05-11
**Status:** Ready for planning

<domain>
## Phase Boundary

Users can view their personal swipe history on `/history` — a list of dogs they swiped, filterable by action and sortable by timestamp, with a summary bar showing their total likes and dislikes counts.

**What Phase 4 delivers:**
- Summary bar: sticky chip row showing [N Swiped] [❤ N Likes] [✕ N Dislikes] for the current user
- Action filter: pill tabs — All / Likes / Dislikes
- Timestamp sort: dropdown — Newest first (default) / Oldest first
- Personal view: only dogs the current user swiped appear; others' dogs hidden

**What Phase 4 does NOT deliver:**
- All-users history view (out of scope — current user only)
- Per-user breakdown in summary bar (out of scope)
- Top Dogs highlight cards (Phase 5)

</domain>

<decisions>
## Implementation Decisions

### Record grouping model
- **D-01:** Group records by dog (one card per dogId) — keep existing HistoryList card architecture.
- **D-02:** Show only dogs the current user has personally swiped. Dogs swiped by teammates but not by the current user are hidden.
- **D-03:** Each dog card shows the current user's action badge (❤ Like or ✕ Dislike) + total swipe count across all users.

### Summary bar
- **D-04:** Summary bar is sticky, positioned below the page title and above the filter pills.
- **D-05:** Shows three stat chips: total dogs swiped, total likes, total dislikes — all computed for the current user only.
- **D-06:** Summary bar is computed from the current user's filtered records (not all users).

### Filter and sort
- **D-07:** Action filter uses pill tabs: [All] [Likes] [Dislikes]. Default: All.
- **D-08:** Sort uses a dropdown: "Newest first" (default) / "Oldest first". Sort is by the current user's swipe timestamp in that dog's col entry.
- **D-09:** Filter and sort state live in client-side `useState` inside `HistoryList.tsx`. No URL query params.

### Code approach
- **D-10:** Extend existing `components/HistoryList.tsx` — do not rewrite from scratch. Add summary bar, filter state, sort state.
- **D-11:** `app/history/page.tsx` passes all records + `currentUser` (unchanged). `HistoryList` filters to user's swipes client-side: `records.filter(r => r.col.some(e => e.username === currentUser))`.
- **D-12:** Summary bar totals computed inside HistoryList from the filtered (user-only) records.

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Existing history implementation (extend, do not replace)
- `app/history/page.tsx` — Server component: auth guard via `auth()`, reads all records via `readDogs()`, passes to HistoryList
- `components/HistoryList.tsx` — Client component: dog-grouped cards, mobile list + desktop grid, ActionBadge, empty state; needs summary bar + filter/sort added
- `app/api/history/route.ts` — GET handler (not consumed by history page — page reads storage directly)

### Storage
- `lib/storage.ts` — `readDogs()` returns `DogRecord[]`; `DogRecord` has `{ dogId, imageUrl, col: SwipeAction[] }`; `SwipeAction` has `{ username, email, action, timestamp }`

### Auth
- `auth.ts` — NextAuth v5 config; `auth()` for server-side session; `session.user.name` = current username

### Design reference
- `design/pawnder_history_mobile/` — Mobile history layout (sticky header, list cards, filter row)
- `design/pawnder_history_desktop/` — Desktop history layout (same sidebar as swipe, grid cards)
- `CLAUDE.md` — Phase 4 design contract section (summary of mobile + desktop layout patterns)

### Requirements
- `.planning/REQUIREMENTS.md` — HIST-01, HIST-02, HIST-03, HIST-04

### Prior phase context (auth + design patterns)
- `.planning/phases/03-swipe-ui/03-CONTEXT.md` — Auth pattern (`auth()` from `@/auth`), Navbar reuse, design system tokens

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- `components/HistoryList.tsx` — already "use client", has dog cards for mobile (list) + desktop (grid), ActionBadge component, empty state; extend in-place
- `components/Navbar.tsx` — already used in history/page.tsx; mobile bottom nav + desktop sidebar; no changes needed
- `auth()` from `@/auth` — already used in history/page.tsx for session guard
- `readDogs()` from `lib/storage.ts` — already called in history/page.tsx; returns all DogRecord[]

### Established Patterns
- Auth guard in server component: `const session = await auth(); if (!session?.user) redirect("/login");` — already in history/page.tsx
- Storage reads: always via `lib/storage.ts`, never `fs` directly in routes or pages
- Design tokens: Tailwind classes like `bg-primary`, `text-on-surface`, `rounded-[24px]`, `shadow-[0_4px_24px_rgba(0,0,0,0.04)]`

### Integration Points
- **HistoryList.tsx changes needed:**
  1. Add `useState` for `filter: 'all' | 'like' | 'dislike'` and `sort: 'newest' | 'oldest'`
  2. Filter: `const mine = records.filter(r => r.col.some(e => e.username === currentUser))`
  3. Apply action filter: `mine.filter(r => filter === 'all' || r.col.find(e => e.username === currentUser)?.action === filter)`
  4. Apply sort: sort by `myEntry.timestamp` ascending/descending
  5. Compute summary: `{ total: mine.length, likes: mine.filter(...like...).length, dislikes: mine.filter(...dislike...).length }`
  6. Render summary bar above filter pills, sticky
  7. Render pill tabs + sort dropdown above the cards list

</code_context>

<specifics>
## Specific Ideas

- Summary bar chip style: 3 pill-shaped stat chips inline — matches design system pill pattern (`rounded-full`, `bg-primary-container` or `bg-surface-container-low`)
- Pill tabs for filter: active tab = `bg-primary-container text-on-primary-container`, inactive = `text-on-surface-variant` — same active-tab pattern as bottom nav in Navbar
- Sort dropdown: simple `<select>` or custom dropdown; "Newest first" as default option
- Timestamp sort key: use `myEntry.timestamp` (the current user's col entry timestamp for that dog)
- Empty state (after filter): "No [likes/dislikes] yet" message with icon — distinct from the global empty state (no swipes at all)

</specifics>

<deferred>
## Deferred Ideas

- **Auth on /api/history/route.ts** — route has no auth check but is not consumed by the history page (page reads storage directly). Not blocking Phase 4. Defer to Polish phase.
- **All-users view** — Showing all teammates' swipe history was considered but deferred. Only current user's history shown.
- **Per-user summary breakdown** — Multi-user stats table (kamchai.b: 12L 5D, alice: 8L 3D) deferred. Current user totals only.
- **Top Dogs cards** — Phase 5 scope.

</deferred>

---

*Phase: 4-History Page*
*Context gathered: 2026-05-11*
