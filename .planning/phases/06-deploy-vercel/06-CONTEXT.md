# Phase 6: Deploy to Vercel — Context

**Gathered:** 2026-05-13
**Status:** Ready for planning

<domain>
## Phase Boundary

Ship the Dog Tinder app to production on Vercel via GitHub. All env vars configured in Vercel dashboard, Google OAuth redirect URIs updated, and the ephemeral-storage limitation documented.

**What Phase 6 delivers:**
- `.env.local.example` — all four required env vars as empty placeholders
- `.gitignore` audit — confirm `.env.local` and `data/swipes.json` excluded
- `next.config.ts` — verify `images.remotePatterns` includes `random.dog`
- `README.md` — local dev setup, env vars table, Vercel deploy walkthrough, known limitations
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
- **D-01:** Four required vars: `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, `NEXTAUTH_SECRET`, `NEXTAUTH_URL`
- **D-02:** `NEXTAUTH_URL` must equal the exact Vercel production URL (e.g. `https://your-project.vercel.app`) — no trailing slash
- **D-03:** `NEXTAUTH_SECRET` generate with `openssl rand -base64 32`; document this command in README.md

### .gitignore
- **D-04:** `.env.local` must not be committed — contains real credentials
- **D-05:** `data/swipes.json` must not be committed — causes merge conflicts across teammates; resets cleanly on each deploy anyway

### next.config.ts — image domains
- **D-06:** `images.remotePatterns` must include `{ protocol: 'https', hostname: 'random.dog' }` — Next.js Image component blocks unlisted hostnames
- **D-07:** Also verify `lh3.googleusercontent.com` is included for Google avatar images (used by Navbar)

### Storage limitation
- **D-08:** Vercel serverless functions run in ephemeral containers — `data/swipes.json` written during one request may not persist to the next invocation, and is wiped on every new deployment
- **D-09:** Document this as a known limitation in README.md and CLAUDE.md; recommend Vercel KV (simplest drop-in) or Supabase as migration path
- **D-10:** No code change to storage layer in this phase — limitation is accepted for workshop prototype

### Google OAuth redirect URI
- **D-11:** Must add `https://<project>.vercel.app/api/auth/callback/google` to "Authorized redirect URIs" in Google Cloud Console → APIs & Services → Credentials → OAuth 2.0 Client
- **D-12:** Local `http://localhost:3000/api/auth/callback/google` must remain in the list (do not remove it)

### README structure
- **D-13:** README sections: Project Description → Tech Stack → Local Development → Environment Variables → Deploy to Vercel → Known Limitations → Future Improvements

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Config files to verify/update
- `next.config.ts` — check `images.remotePatterns`; add `random.dog` and `lh3.googleusercontent.com` if absent
- `.gitignore` — verify `.env.local` and `data/swipes.json` present; add if missing
- `package.json` — check `name`, `version` for README reference

### Auth config
- `auth.ts` — NextAuth v5 config; `NEXTAUTH_URL` read from `process.env.NEXTAUTH_URL` automatically by NextAuth; no code change needed

### CLAUDE.md
- `/Users/c.ptk/Desktop/product/claude-ai/group4_ai_teamworkshop/CLAUDE.md` — add storage limitation note under "Decisions Made" section

### Requirements
- `.planning/REQUIREMENTS.md` — DEPLOY-01, DEPLOY-02, DEPLOY-03, DEPLOY-04, DEPLOY-05

### Prior phase context
- `.planning/phases/02-login-page/02-CONTEXT.md` — env var list, NextAuth setup, Google provider config

</canonical_refs>

<code_context>
## Existing Code Insights

### Files that need changes
- `next.config.ts` — likely missing `random.dog` in remotePatterns; verify before assuming
- `.gitignore` — verify both `.env.local` and `data/swipes.json` are excluded
- `CLAUDE.md` — add one-sentence storage limitation note

### Files that need to be created
- `.env.local.example` — new file, four empty vars
- `README.md` — new file, full project documentation

### Files that do NOT need changes
- `auth.ts` — NextAuth reads `NEXTAUTH_URL` from env automatically
- `lib/storage.ts` — no change; limitation is documented, not fixed
- Any component or API route — no code change required for deploy phase

### Known next.config.ts pattern (Next.js 14 App Router)
```ts
const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'random.dog' },
      { protocol: 'https', hostname: 'lh3.googleusercontent.com' },
    ],
  },
};
```

### .env.local.example template
```
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
NEXTAUTH_SECRET=
NEXTAUTH_URL=https://your-project.vercel.app
```

</code_context>

<specifics>
## Specific Implementation Notes

### Pre-deploy checklist (execute in order)
1. Audit `.gitignore` — add `.env.local` and `data/swipes.json` if missing
2. Create `.env.local.example` at repo root
3. Update `next.config.ts` — add `remotePatterns` for `random.dog` and `lh3.googleusercontent.com`
4. Write `README.md`
5. Add storage limitation note to `CLAUDE.md` under "Decisions Made"
6. Commit all changes

### Vercel deploy steps (document in README.md)
1. Push repo to GitHub (if not already)
2. Go to vercel.com → New Project → Import GitHub repo
3. Framework preset: Next.js (auto-detected)
4. Add environment variables in Vercel dashboard:
   - `GOOGLE_CLIENT_ID` — from Google Cloud Console
   - `GOOGLE_CLIENT_SECRET` — from Google Cloud Console
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
