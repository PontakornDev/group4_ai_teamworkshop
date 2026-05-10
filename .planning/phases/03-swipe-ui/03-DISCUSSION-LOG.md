# Phase 3: Swipe UI — Discussion Log

**Date:** 2026-05-10
**Areas Discussed:** Phase status, Bug fix, Design fidelity, Error states

---

## Area: Phase Status

**Question:** Phase 3 code is largely already implemented — what do you want to discuss?

**Options presented:**
- Fix url→imageUrl bug
- Design fidelity check
- Error/loading states
- Phase is verify-only

**User selection:** All four — fix the bug, check design, confirm error states, treat as verify-only

---

## Area: Bug Fix

**Question:** API returns `{ url, dogId }` but client expects `{ imageUrl, dogId }`. Which side to fix?

**Options presented:**
- Fix API → return `imageUrl` (recommended)
- Fix client → rename DogData.imageUrl to url

**User selection:** Fix API — change `/api/dog/route.ts` to return `imageUrl`

---

## Area: Design Fidelity

**Question:** Stitch export (pawnder_swipe_mobile, pawnder_swipe_desktop) — what level of fidelity matters?

**Options presented:**
- Close enough — existing layout OK (recommended)
- Full pixel check needed

**User selection:** Close enough — existing mobile/desktop layout matches Stitch pattern

---

## Area: Error/Loading States

**Question:** API 500 after 5 retries shows same "No more dogs!" state. Is this fine?

**Options presented:**
- Fine for MVP (POLISH-03 stays deferred)
- Want distinct error UI

**User selection:** Fine for MVP

---

## Deferred Ideas

- POLISH-01: Swipe card animation — v2
- POLISH-03: Distinct API error UI — v2

## Claude's Discretion

None — all decisions locked by user.
