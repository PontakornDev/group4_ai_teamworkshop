# Phase 2: Login Page - Context

**Gathered:** 2026-05-10
**Status:** Implementation complete — verify only, no PLAN.md needed

<domain>
## Phase Boundary

Users can sign in with Google via NextAuth v5 and the app guards /swipe (and /history) access. After OAuth, a NextAuth session exists with user.name, user.email, user.image. Visiting a protected page without a session redirects to /login.

**Phase 2 implementation already exists in the codebase.** This context reflects the actual code, not planned work.

</domain>

<decisions>
## Implementation Decisions

### Environment Variables
- **D-01:** Canonical env var names are `CLIENT_ID` and `CLIENT_SECRET` (not `GOOGLE_CLIENT_ID`/`GOOGLE_CLIENT_SECRET`). This matches `auth.ts` which reads `process.env.CLIENT_ID` and `process.env.CLIENT_SECRET`.
- **D-02:** Required env vars: `CLIENT_ID`, `CLIENT_SECRET`, `NEXTAUTH_SECRET`, `NEXTAUTH_URL`
- **D-03:** `.env.local.example` must be created as a Phase 2 deliverable (committed, no secrets)

### NextAuth Version
- **D-04:** Project uses NextAuth **v5** (not v4). All patterns must use v5 APIs.
- **D-05:** Page protection uses server-side `auth()` from `@/auth` in Server Components — NOT `useSession()` guards.
- **D-06:** `auth.ts` at project root is the NextAuth v5 config file. It exports `{ handlers, auth, signIn, signOut }`.
- **D-07:** `SessionProvider` is in `app/layout.tsx` directly (no `providers.tsx` wrapper needed with v5).

### Phase Status
- **D-08:** Phase 2 code is complete — implementation done in a prior session. No PLAN.md required.
- **D-09:** Next step is manual verification: confirm OAuth flow works end-to-end with real Google credentials, then mark Phase 2 done.

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Auth Implementation (already built)
- `auth.ts` — NextAuth v5 config. Google provider, reads `CLIENT_ID`/`CLIENT_SECRET`/`NEXTAUTH_SECRET` from env.
- `app/api/auth/[...nextauth]/route.ts` — NextAuth handler. Re-exports `handlers` from `auth.ts`.
- `app/login/LoginClient.tsx` — Client component with Google Sign-In button + full mobile/desktop layout.
- `app/login/page.tsx` — Server component: checks session via `auth()`, redirects to `/swipe` if already authenticated.
- `app/page.tsx` — Root redirect: `auth()` → `/swipe` if session, `/login` if not.
- `app/layout.tsx` — Wraps children in `SessionProvider` from `next-auth/react`.
- `app/swipe/page.tsx` — Server-side auth guard via `auth()` + redirect to `/login` if no session.
- `components/Navbar.tsx` — `useSession()` for avatar + display name + sign out.

### Design Reference
- `design/pawnder_login_with_google_mobile/` — Mobile login design (implemented in LoginClient.tsx)
- `design/pawnder_login_with_google_desktop/` — Desktop login design (implemented in LoginClient.tsx)

### Requirements
- `.planning/REQUIREMENTS.md` — LOGIN-01, LOGIN-02, LOGIN-03

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- `auth()` from `@/auth`: Server-side session check — use in any Server Component page that needs auth guard
- `useSession()` from `next-auth/react`: Client-side session access — use in `"use client"` components (Navbar, etc.)
- `signIn("google", { callbackUrl: "/swipe" })` — Google OAuth trigger used in `LoginClient.tsx`
- `signOut()` from `next-auth/react` — available in Navbar for sign out

### Established Patterns
- **Server-side guard pattern** (DO NOT use `useSession()` for protection):
  ```typescript
  // In any protected page.tsx (Server Component)
  import { auth } from "@/auth";
  import { redirect } from "next/navigation";
  const session = await auth();
  if (!session?.user) redirect("/login");
  ```
- **Session data access in Server Components**:
  ```typescript
  const session = await auth();
  const username = session.user.name ?? session.user.email ?? "user";
  const email = session.user.email ?? "";
  const avatar = session.user.image ?? null;
  ```
- **Client component session access**: `const { data: session } = useSession()` (requires `SessionProvider` in layout — already wired)

### Integration Points
- Phase 3 `/swipe` page inherits the auth guard stub already in `app/swipe/page.tsx` — Phase 3 replaces the `<SwipeClient>` body only, keeps the auth guard
- `session.user.name` → `username` param for `GET /api/dog?username=` and `POST /api/swipe`
- `session.user.email` → `email` field in POST /api/swipe body
- `session.user.image` → avatar URL for Navbar

</code_context>

<specifics>
## Specific Ideas

- Google Sign-In button: white pill, Google G SVG logo, "Sign in with Google" text, official Google branding rules satisfied — no custom colors on button background
- Hero image: Unsplash dog photo (hardcoded URL in LoginClient.tsx — acceptable for prototype)
- Floating paw/heart/star decoration icons on desktop panel (already implemented in LoginClient.tsx)

</specifics>

<deferred>
## Deferred Ideas

- POLISH-04: Sign out button in navbar — deferred to v2 (requirements list)
- History page link in Navbar already present but history page is v2 scope

</deferred>

---

*Phase: 2-Login Page*
*Context gathered: 2026-05-10*
