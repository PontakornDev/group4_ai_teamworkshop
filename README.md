# Dog Tinder

A Tinder-like swipe app for dogs. Sign in with Google, then swipe right to like or left to dislike random dog photos fetched from the [random.dog](https://random.dog) API. Every swipe is saved to a local JSON file, and a history page lets you review all past decisions. Built as a workshop prototype to explore Next.js App Router, NextAuth.js, and serverless deployment on Vercel.

## Tech Stack

- **Next.js 14+ (App Router)** — server components, API routes, file-based routing
- **TypeScript** — end-to-end type safety
- **Tailwind CSS** — utility-first styling
- **NextAuth.js** — Google OAuth provider, session management
- **random.dog API** — `https://random.dog/woof.json`, no API key required
- **Local JSON storage** — swipe records persisted to `data/swipes.json` via Node.js `fs`

## Local Development

1. Clone the repository:
   ```bash
   git clone <repo-url>
   cd <repo-directory>
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Copy the example env file:
   ```bash
   cp .env.local.example .env.local
   ```
4. Fill in real values in `.env.local` (see Environment Variables below). For local development, override `NEXTAUTH_URL` to `http://localhost:3000`.
5. Start the development server:
   ```bash
   npm run dev
   ```
6. Open `http://localhost:3000` in your browser. You will be redirected to the Google login page on first visit.

## Environment Variables

| Variable | Description | Where to get it |
|----------|-------------|-----------------|
| `CLIENT_ID` | Google OAuth client ID | Google Cloud Console → APIs & Services → Credentials → OAuth 2.0 Client |
| `CLIENT_SECRET` | Google OAuth client secret | Same credentials page as `CLIENT_ID` |
| `NEXTAUTH_SECRET` | Secret used to sign NextAuth JWTs and cookies | Generate locally: `openssl rand -base64 32` |
| `NEXTAUTH_URL` | Base URL of the app (no trailing slash) | `http://localhost:3000` for local dev; your Vercel URL in production |

## Deploy to Vercel

1. Push the repository to GitHub (if not already done).
2. Go to [vercel.com](https://vercel.com) → **New Project** → **Import Git Repository** and select your repo.
3. Vercel will auto-detect the **Next.js** framework preset — no build config changes needed.
4. Add the four environment variables in the **Vercel dashboard** under Settings → Environment Variables:
   - `CLIENT_ID` — from Google Cloud Console
   - `CLIENT_SECRET` — from Google Cloud Console
   - `NEXTAUTH_SECRET` — generate with: `openssl rand -base64 32`
   - `NEXTAUTH_URL` — set to `https://<your-project>.vercel.app` (use placeholder for now; update after first deploy)
5. Click **Deploy**. Wait for the build to complete.
6. After the first deploy, copy the actual Vercel URL from the dashboard (e.g. `https://my-app.vercel.app`).
7. Update `NEXTAUTH_URL` in the Vercel dashboard to the real URL, then save.
8. In **Google Cloud Console** → APIs & Services → Credentials → your OAuth 2.0 Client → **Authorized redirect URIs**, add:
   ```
   https://<your-project>.vercel.app/api/auth/callback/google
   ```
   Keep the existing `http://localhost:3000/api/auth/callback/google` entry — removing it will break local development.
9. Trigger a redeploy (push a commit or click **Redeploy** in the Vercel dashboard) so the updated `NEXTAUTH_URL` takes effect.

## Known Limitations

Storage on Vercel is ephemeral — the `data/swipes.json` file does not survive re-deployments or concurrent serverless invocations reliably.

> **Storage limitation**: `data/swipes.json` is a local file on the Vercel serverless container. It resets on every new deployment and may not persist between function invocations. For a persistent production store, migrate to Vercel KV, PlanetScale, or Supabase — all require replacing `lib/storage.ts` read/write calls with the respective client SDK.

Additionally, `GET /api/history` has no authentication check — any unauthenticated request can read all swipe records. This is a known gap deferred to a future polish phase.

## Future Improvements

- **Persistent storage** — migrate `lib/storage.ts` to Vercel KV for a zero-config, persistent key-value store
- **Custom domain** — configure a custom domain in the Vercel dashboard after deployment
- **Branch preview deployments** — Vercel auto-creates preview URLs for every pull request; no extra config needed
- **Auth on `/api/history`** — add a session check to the history API route to restrict access to signed-in users
