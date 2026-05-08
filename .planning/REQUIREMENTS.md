# Requirements: Dog Tinder

**Defined:** 2026-05-08
**Core Value:** A user can log in, swipe on dogs, and have their swipes saved — the loop must work end to end.

## v1 Requirements

### Dog API

- [x] **DOG-01**: GET /api/dog?username= returns a dog the user hasn't seen (not in col) from storage first; falls back to random.dog API only when no unseen dog exists locally
- [x] **DOG-02**: API route retries automatically if random.dog returns a non-image URL (.mp4)

### Swipe Storage

- [x] **SWIPE-01**: POST /api/swipe upserts `/data/swipes.json` — finds existing record by `dogId` or creates one (`{dogId, imageUrl, col: []}`), then appends `{username, action, timestamp}` to its `col` array
- [x] **SWIPE-02**: GET /api/swipe (or /api/history) reads all records from `/data/swipes.json`
- [ ] **SWIPE-03**: `lib/storage.ts` exposes `findUnseenDog(username)` (returns first dog record where username absent from col, or null) and `appendAction(dogId, imageUrl, username, action)` (upsert); all API routes use these functions instead of reading fs directly

### Login / Identity

- [ ] **LOGIN-01**: User can enter a username on `/login` page and submit
- [ ] **LOGIN-02**: Username is saved to sessionStorage under the key "username" on submit
- [ ] **LOGIN-03**: Visiting `/swipe` without a username in sessionStorage redirects to `/login`

### Swipe UI

- [ ] **UI-01**: `/swipe` page displays the current dog image in a card
- [ ] **UI-02**: User can click Like or Dislike buttons on the swipe page
- [ ] **UI-03**: Each button click sends a POST /api/swipe with the correct action and username
- [ ] **UI-04**: Next dog image loads automatically after each swipe
- [ ] **UI-05**: Navbar displays the current username while on the swipe page

## v2 Requirements

### History

- **HIST-01**: User can view all past swipe records on a `/history` page
- **HIST-02**: History page shows each dog record's dogId, imageUrl thumbnail, and all swipes from its `col` array (username, action, timestamp per entry)

### Polish

- **POLISH-01**: Swipe card animates off-screen on like/dislike
- **POLISH-02**: Empty state shown when no swipes have been recorded
- **POLISH-03**: Error state shown when random.dog API is unreachable
- **POLISH-04**: Logout button in navbar clears sessionStorage and redirects to /login

## Out of Scope

| Feature | Reason |
|---------|--------|
| Authentication / passwords | Username only for record-keeping — no auth needed |
| Database | JSON file sufficient for workshop prototype |
| Drag gesture swiping | Buttons only; gestures are optional polish not in v1 |
| History page (v1) | Core loop first; history is v2 |
| .mp4 error UI | Silent retry is sufficient; no user-facing error needed |

## Traceability

| Requirement | Phase | Status |
|-------------|-------|--------|
| DOG-01 | Phase 1 | Complete (01-01) — route refactor to unseen-first logic in Phase 3 |
| DOG-02 | Phase 1 | Complete (01-01) |
| SWIPE-01 | Phase 1 | Complete (01-01) — upsert refactor via lib/storage.ts in Phase 3 |
| SWIPE-02 | Phase 1 | Complete (01-01) |
| SWIPE-03 | Phase 3 | Pending — lib/storage.ts + route refactor |
| LOGIN-01 | Phase 2 | Pending |
| LOGIN-02 | Phase 2 | Pending |
| LOGIN-03 | Phase 2 | Pending |
| UI-01 | Phase 3 | Pending |
| UI-02 | Phase 3 | Pending |
| UI-03 | Phase 3 | Pending |
| UI-04 | Phase 3 | Pending |
| UI-05 | Phase 3 | Pending |

**Coverage:**
- v1 requirements: 13 total
- Mapped to phases: 13
- Unmapped: 0 ✓

---
*Requirements defined: 2026-05-08*
*Last updated: 2026-05-08 after initial definition*
