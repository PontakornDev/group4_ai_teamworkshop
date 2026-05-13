# Dog Tinder

## What This Is

A Tinder-like swipe app for dogs, built as a workshop exercise for learning AI-assisted development. Users enter a username, then swipe right (like) or left (dislike) on random dog images fetched from the random.dog API. Swipe actions are persisted to a local JSON file.

## Core Value

A user can log in, swipe on dogs, and have their swipes saved — the loop must work end to end.

## Current State

**Phase 5 complete 2026-05-13** — All phases shipped. Top Dogs leaderboard live on /history. v0.1 milestone 100% complete: login → swipe → history → leaderboard.

## Requirements

### Validated (v0.1 + Phase 2 + Phase 3)

- App fetches random dog image from random.dog, skips .mp4 URLs ✓ (Phase 1)
- Swipe records saved to /data/swipes.json grouped by dog: `{dogId, imageUrl, col: [{username, email, action, timestamp}]}` ✓ (Phase 1 schema; email field added in Phase 2 scope)
- History readable from /data/swipes.json ✓ (Phase 1)
- User signs in with Google (NextAuth) on /login and is redirected to /swipe ✓ (Phase 2)
- Active NextAuth session required before accessing /swipe; no session → redirect to /login ✓ (Phase 2)
- GET /api/dog?username= serves an unseen dog from storage first; falls back to random.dog only when none available ✓ (Phase 1 + Phase 3)
- User can swipe like or dislike on a dog image ✓ (Phase 3)
- Each swipe appends `{username, email, action, timestamp}` to the dog's `col` array in /data/swipes.json via lib/storage.ts appendAction ✓ (Phase 3)
- Google avatar + display name visible in the navbar while swiping ✓ (Phase 3)

### Validated (Phase 4 + Phase 5)

- /history page shows all swipe records with dog thumbnails, actions, timestamps ✓ (Phase 4)
- getTopDogs() aggregates col entries, returns top scorer per like/dislike category ✓ (Phase 5)
- GET /api/stats exposes getTopDogs() over HTTP, no auth guard ✓ (Phase 5)
- TopDogsSection renders Most Liked / Most Disliked cards with design tokens ✓ (Phase 5)
- /history page renders Top Dogs leaderboard above swipe history ✓ (Phase 5)

### Active

(none — all v0.1 requirements satisfied)

### Out of Scope

- History page — deferred to v2 (core loop first, history is nice-to-have)
- Custom username/password auth — Google OAuth via NextAuth covers identity needs
- Drag gesture swiping — buttons only for now; gestures are optional polish
- Database — JSON file storage is sufficient for this prototype
- .mp4 handling UI — skip silently and re-fetch, no user-facing error needed

## Context

Workshop project for a team learning AI-assisted development with Claude Code. Speed of delivery matters. Stack is pre-decided: Next.js 14+ App Router, TypeScript, Tailwind CSS. External API is random.dog (no key required). Storage is a local JSON file at /data/swipes.json via Node.js fs in API routes.

Dog ID extraction: split URL by "/" and take last segment, then strip file extension.
Example: "https://random.dog/d40de385-3626-46c8-94bf-b7097226174f.jpg" → "d40de385-3626-46c8-94bf-b7097226174f"

## Constraints

- **Tech stack**: Next.js 14+ App Router, TypeScript, Tailwind CSS — pre-decided for workshop
- **Storage**: Local JSON file only — no database for this prototype
- **API**: random.dog (GET https://random.dog/woof.json) — no API key
- **Auth**: No passwords — username in sessionStorage only

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| App Router (not Pages Router) | Workshop uses latest Next.js patterns | ✅ Validated (Phase 1) |
| JSON file storage | No DB setup overhead for prototype | ✅ Validated (Phase 1) |
| NextAuth.js + Google OAuth for identity | Real identity, no custom auth UI, session managed by NextAuth | ✅ Validated (Phase 2) |
| Buttons for swipe (not drag) | Simpler to build, drag optional later | ✅ Validated (Phase 3) |
| Skip .mp4 URLs silently | random.dog returns video sometimes; re-fetch is cleaner UX | ✅ Validated (Phase 1) |
| data/swipes.json in .gitignore | Avoid team conflicts on shared swipe data | ✅ Validated (Phase 1) |

## Evolution

This document evolves at phase transitions and milestone boundaries.

**After each phase transition** (via `/gsd-transition`):
1. Requirements invalidated? → Move to Out of Scope with reason
2. Requirements validated? → Move to Validated with phase reference
3. New requirements emerged? → Add to Active
4. Decisions to log? → Add to Key Decisions
5. "What This Is" still accurate? → Update if drifted

**After each milestone** (via `/gsd-complete-milestone`):
1. Full review of all sections
2. Core Value check — still the right priority?
3. Audit Out of Scope — reasons still valid?
4. Update Context with current state

---
*Last updated: 2026-05-13 — Phase 5 complete, v0.1 milestone shipped*
