# Requirements: Dog Tinder

**Defined:** 2026-05-08
**Core Value:** A user can log in, swipe on dogs, and have their swipes saved — the loop must work end to end.

## v1 Requirements

### Dog API

- [x] **DOG-01**: GET /api/dog?username= returns a dog the user hasn't seen (not in col) from storage first; falls back to random.dog API only when no unseen dog exists locally
- [x] **DOG-02**: API route retries automatically if random.dog returns a non-image URL (.mp4)

### Swipe Storage

- [x] **SWIPE-01**: POST /api/swipe upserts `/data/swipes.json` — finds existing record by `dogId` or creates one (`{dogId, imageUrl, col: []}`), then appends `{username, email, action, timestamp}` to its `col` array
- [x] **SWIPE-02**: GET /api/swipe (or /api/history) reads all records from `/data/swipes.json`
- [ ] **SWIPE-03**: `lib/storage.ts` exposes `findUnseenDog(username)` (returns first dog record where username absent from col, or null) and `appendAction(dogId, imageUrl, username, email, action)` (upsert with email in col entry); all API routes use these functions instead of reading fs directly

### Login / Identity

- [ ] **LOGIN-01**: `/login` page shows "Sign in with Google" button; clicking it initiates NextAuth Google OAuth flow
- [ ] **LOGIN-02**: After Google OAuth, NextAuth session is established with `session.user.name`, `session.user.email`, `session.user.image`; env vars `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, `NEXTAUTH_SECRET`, `NEXTAUTH_URL` required
- [ ] **LOGIN-03**: Visiting `/swipe` or `/history` without an active NextAuth session redirects to `/login`

### Swipe UI

- [ ] **UI-01**: `/swipe` page displays the current dog image in a card
- [ ] **UI-02**: User can click Like or Dislike buttons on the swipe page
- [ ] **UI-03**: Each button click sends a POST /api/swipe with the correct action and username
- [ ] **UI-04**: Next dog image loads automatically after each swipe
- [ ] **UI-05**: Navbar displays Google avatar + display name while on the swipe page

## v2 Requirements

### History

- **HIST-01**: User can view all past swipe records on a `/history` page
- **HIST-02**: History page shows each dog record's dogId, imageUrl thumbnail, and all swipes from its `col` array (username, email, action, timestamp per entry)

### Polish

- **POLISH-01**: Swipe card animates off-screen on like/dislike
- **POLISH-02**: Empty state shown when no swipes have been recorded
- **POLISH-03**: Error state shown when random.dog API is unreachable
- **POLISH-04**: Sign out button in navbar calls NextAuth `signOut()` and redirects to /login

## Out of Scope

| Feature | Reason |
|---------|--------|
| Custom username/password auth | Google OAuth via NextAuth covers identity; no password system needed |
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
*Last updated: 2026-05-08 — Google OAuth swap (NextAuth), email added to col entries*
