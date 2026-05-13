# Roadmap: Dog Tinder

## Overview

Three vertical slices deliver the full core loop: API routes first (the data layer), then login identity (the gate), then the swipe UI (the experience). Each phase is independently runnable and testable.

## Phases

**Phase Numbering:**
- Integer phases (1, 2, 3): Planned milestone work
- Decimal phases (2.1, 2.2): Urgent insertions (marked with INSERTED)

---

## ✅ v0.1 — API Layer Checkpoint (SHIPPED 2026-05-08)

- [x] **Phase 1: API Layer** — Dog fetch and swipe storage endpoints live and callable → [archive](.planning/milestones/v0.1-ROADMAP.md)

---

## 🚧 v1.0 — Full Core Loop (IN PROGRESS)

- [x] **Phase 2: Login Page** - Users sign in with Google (NextAuth) and the app guards /swipe access
- [x] **Phase 3: Swipe UI** - Users can swipe on dogs with full like/dislike flow and persistence (complete 2026-05-11)
- [ ] **Phase 4: History Page** - Show all like/dislike records grouped by username with summary bar, filters, and sort
- [ ] **Phase 5: Top Dogs** - Most liked and most disliked dog highlight cards at the top of the history page, backed by `getTopDogs()` and GET `/api/stats`
- [ ] **Phase 6: Deploy to Vercel** - Ship to production via GitHub → Vercel with env vars, OAuth redirect config, and known limitations documented

## Phase Details

### Phase 2: Login Page
**Goal**: Users sign in with Google via NextAuth and the app prevents access to /swipe without an active session
**Mode:** mvp
**Depends on**: Phase 1
**Requirements**: LOGIN-01, LOGIN-02, LOGIN-03
**Success Criteria** (what must be TRUE):
  1. User can visit /login and see a "Sign in with Google" button with official Google branding
  2. After Google OAuth completes, NextAuth session exists with user.name, user.email, user.image
  3. User is redirected to /swipe after successful sign-in
  4. Visiting /swipe without an active NextAuth session redirects back to /login
**Plans**: 2 plans

Plans:
- [x] 02-01-PLAN.md — Replace globals.css (@theme design tokens) and layout.tsx (Quicksand font + Dogs Tinder metadata + SessionProvider)
- [x] 02-02-PLAN.md — NextAuth route handler, login page (Google Sign-In), swipe auth-guard stub, root redirect

### Phase 3: Swipe UI
**Goal**: Users can see dog images and swipe like or dislike — each action is saved and the next dog loads
**Mode:** mvp
**Depends on**: Phase 2
**Requirements**: UI-01, UI-02, UI-03, UI-04, UI-05
**Success Criteria** (what must be TRUE):
  1. /swipe page shows a dog image in a card layout
  2. User can click Like or Dislike buttons on the card
  3. Each button click sends a POST to /api/swipe with the correct action, dogId, imageUrl, username (session.user.name), and email (session.user.email)
  4. After each swipe, the next dog image loads automatically in the card
  5. The navbar displays Google avatar (session.user.image) + display name while on the swipe page
**Plans**: 3 plans
**UI hint**: yes

Plans:
- [x] 03-01-PLAN.md — Fix url→imageUrl field name bug in app/api/dog/route.ts (two NextResponse.json() calls)
- [x] 03-02-PLAN.md — End-to-end verification: automated pre-flight checks + human swipe loop checkpoint
- [ ] 03-03-PLAN.md — Code review fixes: auth gate (CR-01), res.ok guard (CR-02), hasUserSeenDog helper + seen check (CR-03), empty dogId guard (WR-02)

### Phase 4: History Page
**Goal**: Users can view all swipe records grouped by username — with a summary bar showing total likes/dislikes per user, action filter (all/like/dislike), and timestamp sort
**Mode:** mvp
**Depends on**: Phase 3
**Requirements**: HIST-01, HIST-02, HIST-03, HIST-04
**Success Criteria** (what must be TRUE):
  1. /history page lists all swipe records from swipes.json, grouped by username
  2. Summary bar at top shows total likes count and total dislikes count per user
  3. User can filter records by action: all / like / dislike
  4. Records are sortable by timestamp (newest first by default)
  5. UI matches Stitch design export for history page (mobile + desktop layouts)
**Plans**: 2 plans
**UI hint**: yes

Plans:
- [x] 04-01-PLAN.md — Extend HistoryList.tsx: useState hooks, user-filter, sort, summary bar, filter pills, sort dropdown, filtered empty state, typography corrections
- [x] 04-02-PLAN.md — Update history/page.tsx: fix title ("Your Swipe History"), mobile/desktop subtitles, typography classes

### Phase 5: Top Dogs
**Goal**: Show the most liked and most disliked dogs as highlight cards at the top of the history page
**Mode:** mvp
**Depends on**: Phase 4
**Requirements**: TOP-01, TOP-02, TOP-03, TOP-04
**Success Criteria** (what must be TRUE):
  1. `getTopDogs()` in lib/storage.ts correctly aggregates col entries by action across all dog records
  2. GET `/api/stats` returns `{ mostLiked: { dogId, imageUrl, likeCount }, mostDisliked: { dogId, imageUrl, dislikeCount } }`
  3. `/history` page shows two highlight cards above the record list when data exists
  4. Cards display dog image thumbnail, dogId label, and numeric count (e.g. "12 likes")
  5. Cards match design system: Quicksand font, `#9b4500` primary, 24px border radius, design system shadow
  6. Empty state: no cards shown (or placeholder) when swipes.json is empty
**Plans**: TBD

### Phase 6: Deploy to Vercel
**Goal**: Ship the app to production on Vercel via GitHub with all environment variables configured, Google OAuth redirect URIs updated, and known limitations (ephemeral JSON storage) documented
**Mode:** mvp
**Depends on**: Phase 5
**Requirements**: DEPLOY-01, DEPLOY-02, DEPLOY-03, DEPLOY-04, DEPLOY-05
**Success Criteria** (what must be TRUE):
  1. `.env.local.example` lists all four required env vars with placeholder values
  2. `.env.local` and `data/swipes.json` are in `.gitignore`
  3. `next.config.ts` includes `random.dog` in `images.remotePatterns`
  4. `README.md` covers local setup, env vars, known limitations, and Vercel deploy steps
  5. Google login works on the production Vercel URL
  6. Swipe page loads dog images from random.dog on production
  7. History page shows records correctly on production (resets on redeploy — documented and expected)
**Plans**: TBD

## Progress

| Phase | Plans Complete | Status | Completed |
|-------|----------------|--------|-----------|
| 1. API Layer | 1/1 | ✅ Complete | 2026-05-08 |
| 2. Login Page | 2/2 | ✅ Complete | 2026-05-10 |
| 3. Swipe UI | 2/3 | 🔧 Code review fixes pending | 2026-05-11 |
| 4. History Page | 0/? | Not started | - |
| 5. Top Dogs | 0/? | Not started | - |
| 6. Deploy to Vercel | 0/? | Not started | - |
