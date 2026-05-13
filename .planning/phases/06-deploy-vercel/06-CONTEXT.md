# Phase 6: Deploy to Vercel — Context

**Gathered:** 2026-05-13
**Status:** Ready for planning

<domain>
## Phase Boundary

Ship the Dog Tinder app to production on Vercel via GitHub. All env vars configured in Vercel dashboard, Google OAuth redirect URIs updated, and the ephemeral-storage limitation documented.

**What Phase 6 delivers:**
- `.env.local.example` — all four required env vars as placeholders
- `.gitignore` audit — confirm `.env.local` and `data/swipes.json` excluded
- `next.config.ts` — verify `images.remotePatterns` includes `random.dog` and `lh3.googleusercontent.com`
- `README.md` — workshop quick-start: local dev setup, env vars table, 5-step Vercel deploy walkthrough, known limitations
- CLAUDE.md note — swipes.json resets on each deployment; recommend persistent store for v2
- Production verification checklist — Google login, swipe page, history page all working on Vercel URL

**What Phase 6 does NOT deliver:**
- Persistent storage migration (Vercel KV / PlanetScale / Supabase) — documented as future work
- CI/CD pipeline beyond Vercel's built-in GitHub integration
- Custom domain setup

</domain>

<decisions>
## Implementation Decisions

### Environment variables
- **D-01:** Four required vars: `CLIENT_ID`, `CLIENT_SECRET`, `NEXTAUTH_SECRET`, `NEXTAUTH_URL`
  - `CLIENT_ID`/`CLIENT_SECRET` is the NextAuth v5 convention — confirmed in `auth.ts` and `STATE.md`
  - Do NOT use `GOOGLE_CLIENT_ID`/`GOOGLE_CLIENT_SECRET` — those are NOT what the code reads
- **D-02:** `NEXTAUTH_URL` must equal the exact Vercel production URL (e.g. `https://your-project.vercel.app`) — no trailing slash
- **D-03:** `NEXTAUTH_SECRET` generate with `openssl rand -base64 32`; document this command in README.md

### .gitignore
- **D-04:** `.env.local` must not be committed — contains real credentials
- **D-05:** `data/swipes.json` must not be committed — causes merge conflicts across teammates; resets cleanly on each deploy anyway
- **Status:** Neither is currently in `.gitignore` — both must be added

### next.config.ts — image domains
- **D-06:** `images.remotePatterns` already includes `random.dog` and `lh3.googleusercontent.com` ✓ — no change needed
- **Status:** Already correct as of codebase scout

### .env.local.example
- **D-07:** `NEXTAUTH_URL` in example file should be production URL placeholder (`https://your-project.vercel.app`), not localhost
  - Rationale: Example communicates what the real value looks like; local dev setup covered in README
- **D-08:** Use `CLIENT_ID`/`CLIENT_SECRET` naming (not GOOGLE_*) to match actual code in `auth.ts`

### Storage limitation
- **D-09:** Vercel serverless functions run in ephemeral containers — `data/swipes.json` written during one request may not persist to the next invocation, and is wiped on every new deployment
- **D-10:** Document this as a known limitation in README.md and CLAUDE.md; recommend Vercel KV (simplest drop-in) or Supabase as migration path
- **D-11:** No code change to storage layer in this phase — limitation is accepted for workshop prototype

### Google OAuth redirect URI
- **D-12:** Must add `https://<project>.vercel.app/api/auth/callback/google` to "Authorized redirect URIs" in Google Cloud Console → APIs & Services → Credentials → OAuth 2.0 Client
- **D-13:** Local `http://localhost:3000/api/auth/callback/google` must remain in the list (do not remove it)

### README structure (workshop quick-start, ~1-2 pages)
- **D-14:** Sections: Project Description → Tech Stack → Local Development → Environment Variables → Deploy to Vercel → Known Limitations → Future Improvements
- **D-15:** Scope: enough for a teammate to clone and run locally + deploy to Vercel. No architecture deep-dive.

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Auth config
- `auth.ts` — NextAuth v5 config; uses `process.env.CLIENT_ID` and `process.env.CLIENT_SECRET` (not GOOGLE_* prefixed); `NEXTAUTH_URL` read automatically by NextAuth; no code change needed

### Config files to verify/update
- `next.config.ts` — already has both `random.dog` and `lh3.googleusercontent.com` in remotePatterns; no change needed
- `.gitignore` — missing `.env.local` and `data/swipes.json`; both must be added
- `.env.local.example` — exists; uses CLIENT_ID/CLIENT_SECRET correctly; NEXTAUTH_URL should be updated to production placeholder

### Documentation
- `CLAUDE.md` — add storage limitation note under "Decisions Made" section

### Requirements
- `.planning/REQUIREMENTS.md` — DEPLOY-01, DEPLOY-02, DEPLOY-03, DEPLOY-04, DEPLOY-05

### Prior phase context
- `.planning/phases/02-login-page/02-CONTEXT.md` — NextAuth setup, Google provider config

</canonical_refs>

<code_context>
## Existing Code Insights

### Files that need changes
- `.gitignore` — add `.env.local` and `data/swipes.json`
- `.env.local.example` — update `NEXTAUTH_URL` value to production placeholder; variable names already correct
- `README.md` — full rewrite from boilerplate to project-specific quick-start
- `CLAUDE.md` — add one-sentence storage limitation note

### Files that are already correct
- `next.config.ts` — both hostnames configured ✓
- `auth.ts` — reads correct env var names (`CLIENT_ID`, `CLIENT_SECRET`) ✓

### Files that do NOT need changes
- `lib/storage.ts` — no change; limitation documented, not fixed
- Any component or API route — no code change required for deploy phase

### .env.local.example target state
```
# Google OAuth credentials (from Google Cloud Console → APIs & Services → Credentials → OAuth 2.0)
CLIENT_ID=your-google-client-id.apps.googleusercontent.com
CLIENT_SECRET=your-google-client-secret

# NextAuth secret — generate with: openssl rand -base64 32
NEXTAUTH_SECRET=your-nextauth-secret-32-chars-min

# App URL — set to your Vercel production URL after first deploy
NEXTAUTH_URL=https://your-project.vercel.app
```

</code_context>

<specifics>
## Specific Implementation Notes

### Pre-deploy checklist (execute in order)
1. Add `.env.local` and `data/swipes.json` to `.gitignore`
2. Update `.env.local.example` — change `NEXTAUTH_URL` to production placeholder
3. Write `README.md` (workshop quick-start format)
4. Add storage limitation note to `CLAUDE.md` under "Decisions Made"
5. Commit all changes

### Vercel deploy steps (document in README.md)
1. Push repo to GitHub (if not already)
2. Go to vercel.com → New Project → Import GitHub repo
3. Framework preset: Next.js (auto-detected)
4. Add environment variables in Vercel dashboard:
   - `CLIENT_ID` — from Google Cloud Console
   - `CLIENT_SECRET` — from Google Cloud Console
   - `NEXTAUTH_SECRET` — generate: `openssl rand -base64 32`
   - `NEXTAUTH_URL` — set to `https://<your-project>.vercel.app`
5. Deploy
6. After first deploy, copy the actual Vercel URL
7. Update `NEXTAUTH_URL` in Vercel dashboard to the real URL
8. Add `https://<your-project>.vercel.app/api/auth/callback/google` to Google OAuth authorized redirect URIs
9. Redeploy (trigger via Vercel dashboard or push a commit)

### Post-deploy verification
- Visit production URL → redirects to `/login` ✓
- Click "Sign in with Google" → OAuth completes → lands on `/swipe` ✓
- Swipe a dog → image loads from `random.dog` ✓
- Check `/history` → records visible ✓
- Sign out → returns to `/login` ✓

### Known limitation wording (for README.md and CLAUDE.md)
> **Storage limitation**: `data/swipes.json` is a local file on the Vercel serverless container. It resets on every new deployment and may not persist between function invocations. For a persistent production store, migrate to Vercel KV, PlanetScale, or Supabase — all require replacing `lib/storage.ts` read/write calls with the respective client SDK.

</specifics>

<deferred>
## Deferred Ideas

- **Persistent storage migration** — Vercel KV is the simplest path (key-value JSON blob, no schema). Deferred post-workshop.
- **Custom domain** — Not needed for workshop. Vercel subdomain sufficient.
- **Branch preview deployments** — Vercel auto-creates these; no config needed. Not in scope.
- **Auth on /api/history/route.ts** — Route has no auth check; not exploitable without the data file but still a gap. Defer to Polish phase.
- **CI checks** — No test suite exists yet; no point adding CI gates before tests are written.

</deferred>

---

*Phase: 6-Deploy to Vercel*
*Context gathered: 2026-05-13*
