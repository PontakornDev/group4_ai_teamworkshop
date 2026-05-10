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

- [ ] **Phase 2: Login Page** - Users sign in with Google (NextAuth) and the app guards /swipe access
- [ ] **Phase 3: Swipe UI** - Users can swipe on dogs with full like/dislike flow and persistence

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
- [ ] 02-01-PLAN.md — Replace globals.css (@theme design tokens) and layout.tsx (Quicksand font + Pawnder metadata + SessionProvider)
- [ ] 02-02-PLAN.md — NextAuth route handler, login page (Google Sign-In), swipe auth-guard stub, root redirect

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
**Plans**: TBD
**UI hint**: yes

## Progress

| Phase | Plans Complete | Status | Completed |
|-------|----------------|--------|-----------|
| 1. API Layer | 1/1 | ✅ Complete | 2026-05-08 |
| 2. Login Page | 0/2 | Ready to execute | - |
| 3. Swipe UI | 0/? | Not started | - |
