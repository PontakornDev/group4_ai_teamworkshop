# Phase 5: Top Dogs - Discussion Log

> **Audit trail only.** Do not use as input to planning, research, or execution agents.
> Decisions are captured in CONTEXT.md — this log preserves the alternatives considered.

**Date:** 2026-05-12
**Phase:** 05-top-dogs
**Areas discussed:** Data fetching strategy, Empty category behavior, Card visual layout

---

## Data fetching strategy

| Option | Description | Selected |
|--------|-------------|----------|
| Server: call getTopDogs() directly | Add getTopDogs() call in history/page.tsx alongside readDogs(). Pass result as prop to TopDogsSection. No loading state, SSR. | ✓ |
| Client: TopDogsSection fetches /api/stats | TopDogsSection is a 'use client' component that calls fetch('/api/stats') on mount. Needs loading state. | |

**User's choice:** Server — call getTopDogs() directly in history/page.tsx
**Notes:** /api/stats still created to satisfy TOP-02; it just won't be consumed by the history page itself.

---

| Option | Description | Selected |
|--------|-------------|----------|
| Yes, create /api/stats anyway | Satisfies TOP-02. Lightweight route — calls getTopDogs() and returns JSON. | ✓ |
| Skip /api/stats | Omit the API route. Mark TOP-02 as out of scope. | |

**User's choice:** Create /api/stats regardless of whether the history page uses it
**Notes:** No auth guard — public stats endpoint.

---

## Empty category behavior

| Option | Description | Selected |
|--------|-------------|----------|
| One real card only | If mostDisliked is null, show only the Most Liked card. No placeholders. | ✓ |
| Two cards, one as placeholder | Always show two card slots. Missing category shows a grayed-out placeholder. | |

**User's choice:** Show only real cards — no placeholder for missing category
**Notes:** Applies when one category is null. Both-null case handled separately.

---

| Option | Description | Selected |
|--------|-------------|----------|
| Hide the section entirely | TopDogsSection renders null when both are null. Matches ROADMAP SC-6. | |
| Show empty state message | Show "No swipes yet — start swiping to see top dogs!" message instead of cards. | ✓ |

**User's choice:** Show empty state message when both mostLiked and mostDisliked are null

---

## Card visual layout

| Option | Description | Selected |
|--------|-------------|----------|
| Vertical spotlight card | Thumbnail top (~140px), "Most Liked" label in primary color below, dogId in small text, count badge prominent. | ✓ |
| Horizontal compact card | Small circular thumbnail left (~64px), title + dogId + count stacked on right. | |

**User's choice:** Vertical spotlight card

---

| Option | Description | Selected |
|--------|-------------|----------|
| Side by side (grid-cols-2) on all screen sizes | Both cards always side by side. Simple, consistent. | ✓ |
| Stacked on mobile, side by side on desktop | flex-col on mobile, flex-row on md+. | |

**User's choice:** grid-cols-2 on all screen sizes

---

| Option | Description | Selected |
|--------|-------------|----------|
| Yes — 'Top Dogs' section title | Heading above the grid in text-headline-sm / text-title-lg. | ✓ |
| No heading — cards speak for themselves | No heading; card labels (Most Liked / Most Disliked) are self-explanatory. | |

**User's choice:** Include "Top Dogs" section heading above card grid

---

## Claude's Discretion

- Exact typography class for section heading (`text-headline-sm` vs `text-title-lg`) — either consistent with design scale
- Count badge exact layout — suggested `<number> likes` with bold number, muted label text

## Deferred Ideas

- Per-user leaderboard — who liked the most dogs across all users
- Real-time stats refresh via websocket/SSE
- Dog "win streak" or other engagement stats
