# Phase 4: History Page - Discussion Log

> **Audit trail only.** Do not use as input to planning, research, or execution agents.
> Decisions are captured in CONTEXT.md — this log preserves the alternatives considered.

**Date:** 2026-05-11
**Phase:** 04-history-page
**Areas discussed:** Record grouping model, Summary bar content, Filter + sort UX, Existing code reuse

---

## Record grouping model

| Option | Description | Selected |
|--------|-------------|----------|
| By dog (current) | One card per dog. Shows current user's action badge. Already built in HistoryList.tsx. | ✓ |
| By username | One section per user with dogs they swiped. Matches ROADMAP 'grouped by username' goal. | |
| Flat list, newest first | All swipe actions as a flat chronological list, no grouping. | |

**User's choice:** By dog (current)
**Notes:** Existing architecture retained.

---

| Option | Description | Selected |
|--------|-------------|----------|
| Current user only | Show only your like/dislike badge. Other users' swipes hidden. | ✓ |
| All users expanded | Each dog card shows every user's action (kamchai.b: Like, alice: Dislike). | |

**User's choice:** Current user only

---

| Option | Description | Selected |
|--------|-------------|----------|
| Hide it | Only show dogs you personally swiped. Others' dogs absent. | ✓ |
| Show with 'Not swiped' label | Show all dogs, tag unswiped as 'Not swiped by you'. | |

**User's choice:** Hide it — history is personal swipe log only.

---

## Summary bar content

| Option | Description | Selected |
|--------|-------------|----------|
| Your totals only | Shows your personal like/dislike counts inline. | ✓ |
| All users breakdown | Per-user rows: kamchai.b: 12L 5D / alice: 8L 3D. | |

**User's choice:** Your totals only

---

| Option | Description | Selected |
|--------|-------------|----------|
| Sticky header row with counts + total | Below title, above filters. 3 chips: [N Swiped][❤ N][✕ N]. Stays on scroll. | ✓ |
| Inline stats in page header | Stats in the page title area. Not sticky. | |

**User's choice:** Sticky header row with counts + total

---

## Filter + sort UX

| Option | Description | Selected |
|--------|-------------|----------|
| Client-side useState | Filter + sort in React state in HistoryList. No page reload. Already 'use client'. | ✓ |
| URL query params | ?filter=like&sort=newest. Shareable, back-button. Needs useSearchParams(). | |

**User's choice:** Client-side useState

---

| Option | Description | Selected |
|--------|-------------|----------|
| Pill tabs (filter) + dropdown (sort) | Pill tabs for All/Likes/Dislikes. Dropdown for Newest/Oldest. Matches Stitch design. | ✓ |
| Single dropdown for both | One dropdown combining filter + sort options. Compact but less discoverable. | |

**User's choice:** Pill tabs for filter + dropdown for sort

---

## Existing code reuse

| Option | Description | Selected |
|--------|-------------|----------|
| Extend existing | Keep HistoryList.tsx, add filter/sort/summary. Minimal change, reuse card designs. | ✓ |
| Rewrite HistoryList | Replace with new component built from scratch. Cleaner but more work. | |

**User's choice:** Extend existing

---

| Option | Description | Selected |
|--------|-------------|----------|
| Filter inside HistoryList (client-side) | page.tsx passes all records. HistoryList filters to currentUser's swipes. | ✓ |
| Filter in page.tsx (server-side) | page.tsx pre-filters. HistoryList only handles display + filter/sort. | |

**User's choice:** Inside HistoryList (client-side)

---

## Claude's Discretion

None — all gray areas had explicit user decisions.

## Deferred Ideas

- Auth check on `/api/history/route.ts` — not consumed by history page; defer to Polish phase
- All-users history view — out of scope for Phase 4
- Per-user summary breakdown — out of scope for Phase 4
- Top Dogs highlight cards — Phase 5 scope
