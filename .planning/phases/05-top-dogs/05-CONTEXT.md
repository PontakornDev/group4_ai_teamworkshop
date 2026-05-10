# Phase 5: Top Dogs (Most Popular Page)

**Phase:** 5
**Mode:** mvp
**Status:** Not started
**Depends on:** Phase 4 (History Page)

## Goal

Surface the most liked and most disliked dogs as highlight cards at the top of the history page, giving users a quick "leaderboard" view of community favorites and rejects.

## Requirements

- **TOP-01**: `lib/storage.ts` exposes `getTopDogs()` — reads swipes.json, counts likes and dislikes per dogId across all col entries, returns `{ mostLiked: { dogId, imageUrl, likeCount }, mostDisliked: { dogId, imageUrl, dislikeCount } }`
- **TOP-02**: GET `/api/stats` returns the `getTopDogs()` result as JSON
- **TOP-03**: History page (`/history`) renders a "Top Dogs" summary section above the record list — two highlight cards: Most Liked and Most Disliked, each showing the dog image, dogId, and count
- **TOP-04**: Summary cards follow the Stitch design system (Quicksand font, `#9b4500` primary, `rounded-[24px]`, card shadow `shadow-[0_4px_24px_rgba(0,0,0,0.04)]`)

## Success Criteria

1. `getTopDogs()` correctly aggregates col entries by action across all dog records
2. GET `/api/stats` returns valid JSON with `mostLiked` and `mostDisliked` — both include `dogId`, `imageUrl`, and count
3. `/history` page shows two highlight cards above the record list when data exists
4. Cards display dog image thumbnail, dogId label, and numeric count (e.g. "12 likes")
5. Cards match design system: Quicksand font, primary color `#9b4500`, 24px radius, design system shadow
6. Edge cases handled: empty swipes.json → no cards shown (or zero-state placeholder); tie → either dog acceptable

## Data Flow

```
swipes.json
  └─ getTopDogs() [lib/storage.ts]
       └─ GET /api/stats
            └─ /history page (TopDogsSection component)
```

## Files to Create / Modify

| File | Action |
|------|--------|
| `lib/storage.ts` | Add `getTopDogs()` function |
| `app/api/stats/route.ts` | New GET handler — calls `getTopDogs()`, returns JSON |
| `components/TopDogsSection.tsx` | New component — two highlight cards |
| `app/history/page.tsx` | Import and render `<TopDogsSection />` above record list |

## Implementation Notes

- `getTopDogs()` iterates all records, counts `col` entries where `action === "like"` vs `"dislike"` per dogId, finds max of each
- Returns `null` for a category if swipes.json is empty or no actions of that type exist
- `/api/stats` is a lightweight read-only endpoint — no auth guard required (public stats)
- Component fetches `/api/stats` on mount (client component) or via server fetch — prefer server component for SSR
- If `mostLiked` and `mostDisliked` are the same dog (all swipes on one dog), show same dog in both cards
