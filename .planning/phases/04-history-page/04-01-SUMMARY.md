---
plan: 04-01
phase: 04-history-page
status: complete
started: 2026-05-12T02:03:32Z
completed: 2026-05-12T02:09:00Z
---

# Summary: Extend HistoryList with filter, sort, and summary bar

## What Was Built

Extended `components/HistoryList.tsx` with client-side user-scoping, action filter pills, sort dropdown, and sticky summary bar per the Phase 4 UI-SPEC.

## Tasks Completed

| Task | Status | Commit |
|------|--------|--------|
| Task 1: Add imports, hooks, and user-filter + sort logic | ✓ Complete | 1c1304f |
| Task 2: Replace JSX return block with filter UI, sort dropdown, and summary bar | ✓ Complete | 912c62e |

## Key Files Created/Modified

- `components/HistoryList.tsx` — extended with hooks, derived data, and new JSX

## What Changed

**Task 1** added `useState`/`useMemo` imports and inserted four derived-data computations inside the `HistoryList` function body:
- `mine` — user-scoped records (current user's swipes only)
- `filtered` — action-filtered (`all` / `like` / `dislike`)
- `sorted` — timestamp-sorted (`newest` / `oldest`)
- `stats` — pre-filter totals for the summary bar (`total`, `likes`, `dislikes`)

**Task 2** replaced the entire JSX return block with:
- Sticky `SummaryBar` showing total/likes/dislikes chip counts (computed from `mine`, pre-filter)
- `FilterPills` row (All / Likes / Dislikes) with `SortDropdown` pushed right via `ml-auto`
- Filtered empty state with `filter_list` icon when active filter yields zero results
- Updated mobile/desktop card lists iterating `sorted` instead of `records`
- `ActionBadge` typography corrected: `font-label-sm text-label-sm` → `font-bold text-label-lg`
- Global empty guard changed from `records.length === 0` to `mine.length === 0`

## Deviations

- **D-06 / desktop SortDropdown placement**: Per plan note and D-09, SortDropdown lives inside `HistoryList` for both breakpoints (pushed right via `ml-auto`), not in the page header. Avoids prop-lifting complexity for minimal UX gain.
- **D-06 stats scope**: Summary bar stats computed from `mine` (pre-filter user totals), not `filtered`. Gives permanent overview regardless of active filter pill.

## Self-Check: PASSED

- [x] `useState`/`useMemo` imports added
- [x] `mine`, `filtered`, `sorted`, `stats` derived data inserted before JSX
- [x] Full JSX return block replaced with SummaryBar + FilterPills + SortDropdown + card lists
- [x] ActionBadge typography corrected to `label-lg`
- [x] No modifications to STATE.md or ROADMAP.md
