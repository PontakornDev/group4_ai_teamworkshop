# Phase 3: Swipe UI — Discussion Log

> **Audit trail only.** Do not use as input to planning, research, or execution agents.
> Decisions are captured in CONTEXT.md — this log preserves the alternatives considered.

**Date:** 2026-05-10 (updated 2026-05-11)
**Phase:** 3-Swipe UI
**Areas discussed:** Phase status, Bug fix, Design fidelity, Error states, Auth gap on /api/dog, res.ok + seen-dog checks, Input validation hardening

---

## Area: Phase Status (2026-05-10)

| Option | Description | Selected |
|--------|-------------|----------|
| Fix url→imageUrl bug | API returns wrong field name | ✓ |
| Design fidelity check | Verify layout vs Stitch export | ✓ |
| Error/loading states | Confirm MVP error handling | ✓ |
| Phase is verify-only | Treat as E2E verification | ✓ |

**User's choice:** All four — fix the bug, check design, confirm error states, treat as verify-only

---

## Area: Bug Fix (2026-05-10)

| Option | Description | Selected |
|--------|-------------|----------|
| Fix API | Return `imageUrl` from `/api/dog/route.ts` | ✓ |
| Fix client | Rename DogData.imageUrl to url | |

**User's choice:** Fix API — change `/api/dog/route.ts` to return `imageUrl`

---

## Area: Design Fidelity (2026-05-10)

| Option | Description | Selected |
|--------|-------------|----------|
| Close enough | Existing layout matches Stitch pattern | ✓ |
| Full pixel check | Re-verify every token against Stitch export | |

**User's choice:** Close enough — existing mobile/desktop layout matches Stitch pattern

---

## Area: Error/Loading States (2026-05-10)

| Option | Description | Selected |
|--------|-------------|----------|
| Fine for MVP | POLISH-03 stays deferred | ✓ |
| Distinct error UI | Separate network error vs empty state | |

**User's choice:** Fine for MVP

---

## Area: Auth Gap on /api/dog (2026-05-11)

| Option | Description | Selected |
|--------|-------------|----------|
| Session required | 401 if no session; session.user.name is authoritative | ✓ |
| Trust query param | Keep current behavior; acceptable for workshop | |

**User's choice:** Yes — session required

**Follow-up — which session helper:**

| Option | Description | Selected |
|--------|-------------|----------|
| auth() from @/auth | NextAuth v5; already used in app/swipe/page.tsx | ✓ |
| getServerSession(authOptions) | NextAuth v4 pattern; authOptions not exported | |

**User's choice:** auth() from @/auth (after clarifying codebase is NextAuth v5)

**Follow-up — query param vs session mismatch:**

| Option | Description | Selected |
|--------|-------------|----------|
| Ignore query param | Session is authoritative; drop query param entirely | ✓ |
| Reject if mismatched | Return 403 on mismatch | |

**User's choice:** Ignore query param — always use session.user.name

---

## Area: res.ok + Seen-Dog Checks (2026-05-11)

| Option | Description | Selected |
|--------|-------------|----------|
| Check res.ok, continue on fail | Prevents TypeError crash on random.dog errors | ✓ |
| Keep as-is | Current code crashes on non-2xx responses | |

**User's choice:** Yes — continue on non-2xx

**Follow-up — seen-dog check:**

| Option | Description | Selected |
|--------|-------------|----------|
| Skip already-seen dogs | hasUserSeenDog check in fetch loop | ✓ |
| Accept duplicates | Minor UX glitch, acceptable for workshop | |

**User's choice:** Yes — skip already-seen dogs

**Follow-up — hasUserSeenDog implementation:**

| Option | Description | Selected |
|--------|-------------|----------|
| New helper in lib/storage.ts | Keeps all JSON reads in storage module | ✓ |
| Inline in route | Breaks CLAUDE.md design contract | |

**User's choice:** New helper function in lib/storage.ts

---

## Area: Input Validation Hardening (2026-05-11)

| Option | Description | Selected |
|--------|-------------|----------|
| Guard empty dogId in route loop | if (!dogId) continue; one line | ✓ |
| Return null from extractDogId | Changes return type, updates all callers | |
| Skip — prototype risk acceptable | Malformed URLs from random.dog are rare | |

**User's choice:** Guard in the route — if (!dogId) continue

**Notes:** WR-01 (missing username → 400) is moot — auth check ensures username always comes from session.

---

## Claude's Discretion

None — all decisions locked by user.

## Deferred Ideas

- **WR-03:** Race condition in appendAction — defer to Polish phase
- **POLISH-01:** Swipe card animation — v2
- **POLISH-03:** Distinct API error UI — v2
