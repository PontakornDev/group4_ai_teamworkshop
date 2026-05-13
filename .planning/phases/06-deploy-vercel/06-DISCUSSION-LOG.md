# Phase 6: Deploy to Vercel - Discussion Log

> **Audit trail only.** Do not use as input to planning, research, or execution agents.
> Decisions are captured in CONTEXT.md — this log preserves the alternatives considered.

**Date:** 2026-05-13
**Phase:** 06-deploy-vercel
**Areas discussed:** Env var naming, README depth, NEXTAUTH_URL in example

---

## Env var naming

| Option | Description | Selected |
|--------|-------------|----------|
| CLIENT_ID / CLIENT_SECRET | NextAuth v5 convention — confirmed in STATE.md. .env.local.example already uses these. | ✓ |
| GOOGLE_CLIENT_ID / GOOGLE_CLIENT_SECRET | What CONTEXT.md D-01 previously said. Explicit provider prefix. | |

**User's choice:** CLIENT_ID / CLIENT_SECRET
**Notes:** Code in auth.ts already uses these names. CONTEXT.md D-01 was updated to reflect canonical naming.

---

## README depth

| Option | Description | Selected |
|--------|-------------|----------|
| Workshop quick-start | ~1-2 pages. Setup, env vars table, 5-step Vercel deploy, known limitations. | ✓ |
| Full onboarding doc | Detailed architecture, data schema, API route docs, troubleshooting. ~3-4 pages. | |
| Minimal | Just env vars + deploy steps. | |

**User's choice:** Workshop quick-start
**Notes:** Enough for a teammate to clone and run. No architecture deep-dive needed.

---

## NEXTAUTH_URL in example

| Option | Description | Selected |
|--------|-------------|----------|
| localhost:3000 | Example file is for local dev setup. Production URL goes in Vercel dashboard. | |
| Production URL placeholder | https://your-project.vercel.app — signals where to get the real value. | ✓ |
| Both with comments | Show both localhost and production placeholder. | |

**User's choice:** Production URL placeholder
**Notes:** NEXTAUTH_URL=https://your-project.vercel.app in .env.local.example.

---

## Claude's Discretion

None — all areas had user-selected decisions.

## Deferred Ideas

None raised during this discussion session. Previously deferred items (persistent storage, custom domain, CI) remain unchanged.
