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
- [x] **SWIPE-03**: `lib/storage.ts` exposes `findUnseenDog(username)` (returns first dog record where username absent from col, or null) and `appendAction(dogId, imageUrl, username, email, action)` (upsert with email in col entry); all API routes use these functions instead of reading fs directly

### Login / Identity

- [x] **LOGIN-01**: `/login` page shows "Sign in with Google" button; clicking it initiates NextAuth Google OAuth flow
- [x] **LOGIN-02**: After Google OAuth, NextAuth session is established with `session.user.name`, `session.user.email`, `session.user.image`; env vars `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, `NEXTAUTH_SECRET`, `NEXTAUTH_URL` required
- [x] **LOGIN-03**: Visiting `/swipe` or `/history` without an active NextAuth session redirects to `/login`

### Swipe UI

- [x] **UI-01**: `/swipe` page displays the current dog image in a card
- [x] **UI-02**: User can click Like or Dislike buttons on the swipe page
- [x] **UI-03**: Each button click sends a POST /api/swipe with the correct action and username
- [x] **UI-04**: Next dog image loads automatically after each swipe
- [x] **UI-05**: Navbar displays Google avatar + display name while on the swipe page

## v2 Requirements

### History

- [x] **HIST-01**: User can view all past swipe records on a `/history` page
- [x] **HIST-02**: History page shows each dog record's dogId, imageUrl thumbnail, and all swipes from its `col` array (username, email, action, timestamp per entry)
- [x] **HIST-03**: History records are filterable by action (all / like / dislike)
- [x] **HIST-04**: History records are sortable by timestamp (newest first by default)

### Top Dogs (Most Popular)

- [x] **TOP-01**: `lib/storage.ts` exposes `getTopDogs()` — reads swipes.json, counts likes and dislikes per dogId across all col entries, returns `{ mostLiked: { dogId, imageUrl, likeCount }, mostDisliked: { dogId, imageUrl, dislikeCount } }`; returns null for a category if no matching actions exist
- [x] **TOP-02**: GET `/api/stats` returns the `getTopDogs()` result as JSON — `{ mostLiked: { dogId, imageUrl, likeCount }, mostDisliked: { dogId, imageUrl, dislikeCount } }`
- [x] **TOP-03**: `/history` page renders a "Top Dogs" summary section above the record list — two highlight cards (Most Liked, Most Disliked) each showing dog image, dogId, and count
- [x] **TOP-04**: Top Dogs cards follow the Stitch design system (Quicksand font, `#9b4500` primary, `rounded-[24px]`, shadow `0_4px_24px_rgba(0,0,0,0.04)`)

### Polish

- **POLISH-01**: Swipe card animates off-screen on like/dislike
- **POLISH-02**: Empty state shown when no swipes have been recorded
- **POLISH-03**: Error state shown when random.dog API is unreachable
- **POLISH-04**: Sign out button in navbar calls NextAuth `signOut()` and redirects to /login

### Deploy

- **DEPLOY-01**: `.env.local.example` exists at repo root with all four required env vars (`GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, `NEXTAUTH_SECRET`, `NEXTAUTH_URL`) as empty placeholders
- **DEPLOY-02**: `.gitignore` excludes `.env.local` and `data/swipes.json`
- **DEPLOY-03**: `next.config.ts` has `images.remotePatterns` including `random.dog` hostname
- **DEPLOY-04**: `README.md` documents local dev setup, required env vars, Vercel deploy steps, and known limitation (swipes.json resets on each Vercel deployment; future migration to Vercel KV / PlanetScale / Supabase recommended)
- **DEPLOY-05**: Google OAuth authorized redirect URI includes `https://<project>.vercel.app/api/auth/callback/google`; `NEXTAUTH_URL` env var set to production Vercel URL

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
| SWIPE-03 | Phase 3 | Complete (03-01) |
| LOGIN-01 | Phase 2 | Complete (02-02) |
| LOGIN-02 | Phase 2 | Complete (02-02) |
| LOGIN-03 | Phase 2 | Complete (02-02) |
| UI-01 | Phase 3 | Complete (03-02) |
| UI-02 | Phase 3 | Complete (03-02) |
| UI-03 | Phase 3 | Complete (03-02) |
| UI-04 | Phase 3 | Complete (03-02) |
| UI-05 | Phase 3 | Complete (03-02) |
| HIST-01 | Phase 4 | Complete (04-01) |
| HIST-02 | Phase 4 | Complete (04-01) |
| HIST-03 | Phase 4 | Complete (04-01) |
| HIST-04 | Phase 4 | Complete (04-01) |
| TOP-01 | Phase 5 | Complete |
| TOP-02 | Phase 5 | Complete |
| TOP-03 | Phase 5 | Complete |
| TOP-04 | Phase 5 | Complete |
| DEPLOY-01 | Phase 6 | Pending |
| DEPLOY-02 | Phase 6 | Pending |
| DEPLOY-03 | Phase 6 | Pending |
| DEPLOY-04 | Phase 6 | Pending |
| DEPLOY-05 | Phase 6 | Pending |

**Coverage:**
- v1 requirements: 13 total
- v2 requirements: 13 total (HIST-01–04, TOP-01–04, DEPLOY-01–05)
- Mapped to phases: 26
- Unmapped: 0 ✓

---
*Requirements defined: 2026-05-08*
*Last updated: 2026-05-13 — Phase 4 & 5 complete; HIST-01–04, TOP-01–04 marked complete*
