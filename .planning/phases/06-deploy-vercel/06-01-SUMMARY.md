---
phase: 06-deploy-vercel
plan: 01
subsystem: infra
tags: [vercel, nextauth, gitignore, next.config, readme, deployment, oauth]

# Dependency graph
requires:
  - phase: 02-login-page
    provides: NextAuth.js Google provider setup with CLIENT_ID/CLIENT_SECRET env vars
  - phase: 01-api-layer
    provides: data/swipes.json storage pattern that exposes the ephemeral limitation
provides:
  - .env.local.example with production-shaped placeholders for all 4 env vars
  - Verified .gitignore excludes .env.local and data/swipes.json
  - Verified next.config.ts image remotePatterns cover random.dog and lh3.googleusercontent.com
  - README.md workshop quick-start with local dev, env var table, 9-step Vercel deploy guide, known limitations
  - CLAUDE.md storage limitation note under Decisions Made
affects: [06-deploy-vercel wave-2 checkpoint, future-persistent-storage]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "env.local.example uses CLIENT_ID/CLIENT_SECRET naming (not GOOGLE_* prefix) matching auth.ts"
    - "NEXTAUTH_URL placeholder points to production Vercel URL shape in the example file"

key-files:
  created: []
  modified:
    - .env.local.example
    - README.md
    - CLAUDE.md

key-decisions:
  - "NEXTAUTH_URL in .env.local.example set to production placeholder https://your-project.vercel.app (not localhost)"
  - "data/swipes.json ephemeral limitation documented in README Known Limitations and CLAUDE.md; no code change in this phase"
  - ".gitignore and next.config.ts verified already correct; no edits required for Task 2"

patterns-established:
  - "README structure: Description, Tech Stack, Local Dev, Env Vars table, Deploy steps, Known Limitations, Future Improvements"

requirements-completed: [DEPLOY-01, DEPLOY-02, DEPLOY-03, DEPLOY-04]

# Metrics
duration: 8min
completed: 2026-05-13
---

# Phase 6 Plan 01: Deploy Vercel Prep Summary

**Production-ready env example, verified gitignore/next.config, and workshop README with 9-step Vercel deploy guide documenting Google OAuth redirect URI flow and ephemeral storage limitation**

## Performance

- **Duration:** ~8 min
- **Started:** 2026-05-13T07:26:00Z
- **Completed:** 2026-05-13T07:34:00Z
- **Tasks:** 3 (2 with commits, 1 verification-only)
- **Files modified:** 3

## Accomplishments
- Updated `.env.local.example` NEXTAUTH_URL from `http://localhost:3000` to `https://your-project.vercel.app` with corrected comment
- Verified `.gitignore` already excludes `.env.local` (via `.env*` glob) and `data/swipes.json` (via `/data/`) — no edits needed
- Verified `next.config.ts` already includes `random.dog` and `lh3.googleusercontent.com` in remotePatterns — no edits needed
- Rewrote `README.md` from create-next-app boilerplate to 78-line workshop quick-start covering all required sections
- Appended storage limitation bullet to CLAUDE.md Decisions Made section

## Task Commits

Each task was committed atomically:

1. **Task 1: Update .env.local.example to production-shaped placeholder** - `55b2ea1` (docs)
2. **Task 2: Verify .gitignore and next.config.ts** - no commit (verification only, no changes needed)
3. **Task 3: Rewrite README.md and add CLAUDE.md storage note** - `3cf6e08` (docs)

**Plan metadata:** (see final commit below)

## Files Created/Modified
- `.env.local.example` - NEXTAUTH_URL value updated to production placeholder; App URL comment updated
- `README.md` - Fully replaced boilerplate with workshop quick-start (78 lines, 7 sections)
- `CLAUDE.md` - Storage limitation bullet appended under Decisions Made

## Decisions Made
- NEXTAUTH_URL in example file communicates the production URL shape; local dev override documented in README Local Development section
- Known Limitations section includes both the verbatim storage limitation paragraph from CONTEXT.md and the word "ephemeral" in an intro sentence (required by verification grep)
- Task 2 required zero file edits — both gitignore patterns (`.env*`/`!.env*.example` and `/data/`) and both next.config.ts hostnames were already correct

## Deviations from Plan

None - plan executed exactly as written. Task 2 was verification-only as expected.

## Issues Encountered

None. All verification blocks passed on first run.

## User Setup Required

None for this plan — this plan documents the setup steps, but does not perform the external service configuration. The README itself is the artifact that guides users through Vercel dashboard and Google Cloud Console steps.

## Next Phase Readiness
- Repo is documentation-complete for Vercel deployment
- Wave 2 checkpoint plan (06-02) can proceed: push to GitHub, import into Vercel, configure env vars per README, verify OAuth redirect
- The storage limitation is accepted for the workshop prototype; Vercel KV migration is documented as future work

---
*Phase: 06-deploy-vercel*
*Completed: 2026-05-13*
