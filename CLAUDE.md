# Dog Tinder — Project Memory

## Project Overview
A Tinder-like app for dogs. Users sign in with Google before swiping.
Users swipe right (like) or left (dislike) on random dog images.
Data is fetched from random.dog API. Swipe results are stored in a local JSON file,
recording which user performed each action.
A history page shows all past swipe records.

## Stack
- Framework: Next.js 14+ (App Router)
- Language: TypeScript
- Styling: Tailwind CSS
- Auth: NextAuth.js (next-auth) with Google provider
- External API: https://random.dog/woof.json
- Storage: Local JSON file at /data/swipes.json (via Node.js fs on API routes)

## API Details

### External: random.dog
- Endpoint: GET https://random.dog/woof.json
- No API key required
- Returns: { "fileSizeBytes": 123456, "url": "https://random.dog/abc123.jpg" }
- Dog ID extraction: split url by "/" and take last segment, then remove file extension
  - Example: "https://random.dog/d40de385-3626-46c8-94bf-b7097226174f.jpg"
  - ID → "d40de385-3626-46c8-94bf-b7097226174f"
- Note: some URLs may be .mp4 — skip and fetch again if not an image

### GET /api/dog?username=<name>
Serves an unseen dog to the requesting user. Logic (in order):
1. Read swipes.json via lib/storage.ts findUnseenDog(username)
2. If a dog record exists where username does NOT appear in col → return that record (url + dogId) without calling random.dog
3. If all existing dogs already have this username in col (or swipes.json is empty) → call random.dog API to fetch a new dog, then return it

### POST /api/swipe
Body: { dogId, imageUrl, username, email, action }
Logic via lib/storage.ts appendAction(dogId, imageUrl, username, email, action):
- If dogId already exists in swipes.json → push { username, email, action, timestamp } into its col array
- If dogId does not exist → create new record { dogId, imageUrl, col: [{ username, email, action, timestamp }] }

## Data Schema (swipes.json)
Records are grouped by dog — one entry per dogId, multiple user actions in col array.
[
  {
    "dogId": "string",
    "imageUrl": "string",
    "col": [
      {
        "username": "string",
        "email": "string",
        "action": "like" | "dislike",
        "timestamp": "ISO string"
      }
    ]
  }
]

## Auth / Session Flow
- Auth provider: NextAuth.js with Google provider
- Required env vars: GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, NEXTAUTH_SECRET, NEXTAUTH_URL
- On app load, if no NextAuth session → redirect to /login page
- /login page: "Sign in with Google" button (official Google branding) — no username form
- After Google OAuth: session.user.name = display name, session.user.email = email, session.user.image = avatar URL
- username (session.user.name) is sent in every POST /api/swipe request body
- email (session.user.email) is stored in col entries for reference
- Navbar shows Google avatar + display name + sign out button (NextAuth signOut())

## File Structure
/app
  /page.tsx                — Redirect: if no session → /login, else → /swipe
  /login/page.tsx          — Google Sign-In page (NextAuth signIn("google") CTA)
  /swipe/page.tsx          — Main swipe page (protected: requires session)
  /history/page.tsx        — History page — shows all swipe records
  /api
    /auth
      /[...nextauth]
        /route.ts          — NextAuth handler (GET + POST) with Google provider
    /dog/route.ts          — GET ?username=: serve unseen dog from storage, else fetch from random.dog
    /swipe/route.ts        — POST: appendAction upsert into swipes.json via lib/storage.ts
    /history/route.ts      — GET: read all swipe records from swipes.json
/lib
  /storage.ts              — findUnseenDog(username), appendAction(dogId, imageUrl, username, email, action)
/data
  /swipes.json             — Persistent swipe storage (grouped by dog)
/components
  /SwipeCard.tsx           — Dog card with swipe animation
  /SwipeButtons.tsx        — Like/Dislike buttons
  /HistoryList.tsx         — List of dog records from swipes.json, shows col entries (username/email/action/timestamp) per dog
  /Navbar.tsx              — Top bar showing Google avatar + display name + sign out button

## Milestones
1. API Layer — random.dog integration + swipes.json grouped schema + lib/storage.ts (findUnseenDog, appendAction)
2. Login Page — NextAuth Google OAuth + session guard on /swipe
3. Swipe UI — Card display + swipe interaction + GET /api/dog?username= unseen-first logic
4. History Page — Display past swipe records with col array entries per dog
5. Polish — Animations, empty states, error handling, skip .mp4 urls

## Decisions Made
- Using App Router (not Pages Router)
- JSON file storage (no database needed for this prototype)
- Swipe via buttons (optional: add drag gesture later)
- Auth: NextAuth.js with Google provider — real identity, no custom username input
- Username = session.user.name (Google display name), email = session.user.email (stored for reference)
- Dog ID extracted from URL via split("/").pop() then remove extension
- Skip .mp4 and non-image URLs from random.dog — fetch again automatically
- data/swipes.json should be in .gitignore to avoid team conflicts
- swipes.json grouped by dog (not per-swipe) — one record per dogId, col array holds all users' actions on that dog
- col entries include email for future deduplication / multi-user queries
- GET /api/dog?username= serves unseen dogs first — avoids redundant random.dog calls when storage has unseen dogs
- lib/storage.ts owns all JSON read/write — routes call findUnseenDog/appendAction, never read fs directly

## Design Reference
- UI design exported from Stitch — located at /design/**/*.md and /design/**/*.html
- GSD must read these files before planning any UI phase
- Use the exported HTML/CSS as the base for all components
- Do not invent UI — follow Stitch export exactly

## Design System (extracted from /design/friendly_pet_discovery/DESIGN.md)

### Brand
- Name: Dogs Tinder (displayed as "Dogs Tinder" in UI)
- Personality: energetic, heartwarming, approachable — "Tactile-Modern"

### Tokens
- Font: Quicksand (400/500/600/700) — import from Google Fonts
- Icons: Material Symbols Outlined — import from Google Fonts, filled variant for active states
- Primary: #9b4500 (warm orange)
- Surface: #fbf9f8 (off-white cream)
- Surface-container-lowest: #ffffff
- Surface-container-low: #f6f3f2
- Primary-container: #ff8c42 (button orange)
- On-primary: #ffffff
- On-surface: #1b1c1c
- On-surface-variant: #564338
- Outline-variant: #ddc1b3
- Error: #ba1a1a (dislike/close color)
- Tertiary-container: #83ba48 (green, success)
- Full color map: see /design/friendly_pet_discovery/DESIGN.md

### Shape & Radius
- Cards: 24px (rounded-3xl or `rounded-[24px]`)
- Inputs: 12px (rounded-xl = 0.75rem)
- Buttons: full pill (rounded-full)
- Modals/sheets: 32px top corners

### Spacing (8px base scale)
- xs: 4px, sm: 12px, md: 24px, lg: 40px, xl: 64px, container-padding: 20px

### Shadows
- Card (resting): `shadow-[0_4px_24px_rgba(0,0,0,0.04)]`
- Card (hover): `shadow-[0_8px_16px_rgba(0,0,0,0.08)]`
- Bottom sheet: `shadow-[0_-8px_24px_rgba(0,0,0,0.06)]`

### Tailwind Config
All design files carry a tailwind.config block — copy it into `tailwind.config.ts` as the single source of truth for custom colors, spacing, fontSize, fontFamily, and borderRadius.

## Phase 2 — Login Page Design Contract

### Mobile (/design/pawnder_login_mobile/code.html)
- Layout: `h-screen flex flex-col overflow-hidden`
- Top half: full-bleed hero dog image (`h-1/2 w-full object-cover`)
- Bottom half: `bg-surface rounded-t-[32px] -mt-6` card overlapping image, shadow on top
- Brand: "Dogs Tinder" in `text-display text-primary` + tagline "Join the pack" in `text-on-surface-variant`
- CTA: Replace Stitch username input + "Start Sniffing" button with a single "Sign in with Google" button
  - Use official Google Sign-In button (white pill, Google logo + "Sign in with Google" text)
  - onClick: call `signIn("google")` from next-auth/react
  - Keep card layout, brand header, and hero image — only the form contents change

### Desktop (/design/pawnder_login_desktop/code.html)
- Layout: `min-h-screen flex flex-row`
- Left `md:w-3/5`: full-height dog photo with right-side gradient overlay fading to surface
- Right `md:w-2/5`: centered login card, floating paw/heart/star icons as background decoration
- Login card: `bg-surface rounded-xl shadow-[0_4px_24px_rgba(0,0,0,0.04)] p-md border border-surface-container`
- CTA: Replace form with single "Sign in with Google" button (official Google branding, white pill)
  - onClick: call `signIn("google")` from next-auth/react

## Phase 3 — Swipe UI Design Contract

### Mobile (/design/pawnder_swipe_mobile/code.html)
- Header: minimal centered "Dogs Tinder" in `text-headline-lg text-primary`
- Card: `absolute` fills `top-0 left-container-padding right-container-padding bottom-[120px]`, `rounded-3xl shadow`, overflow hidden
  - Image fills top, gradient scrim at bottom for text readability
  - Overlay text bottom-left: dog name/age (we show dogId or skip label)
  - Tag pills top-left/right: `bg-surface/90 backdrop-blur-md rounded-full px-sm py-xs`
  - Info strip bottom 100px: description text
- FABs (pinned at `bottom-[20px]` center row):
  - Pass/Dislike: `w-16 h-16 rounded-full bg-surface border-2 border-outline-variant text-error` (close icon 32px)
  - Super Like: `w-12 h-12 rounded-full bg-surface text-tertiary-container` (star icon) — map to like action
  - Like: `w-[72px] h-[72px] rounded-full bg-primary text-on-primary shadow-[0_6px_20px_rgba(155,69,0,0.25)]` (favorite icon 36px)
- Bottom nav: fixed, `rounded-t-xl shadow-[0_-4px_12px_rgba(0,0,0,0.04)]`
  - Active tab: `bg-primary-container text-on-primary-container rounded-full px-6 py-1`
  - Inactive: `text-secondary p-2 hover:bg-secondary-container rounded-full`
  - Tabs: Swipe (pets icon) / Matches→History (favorite icon) / Profile (person icon)

### Desktop (/design/pawnder_swipe_desktop/code.html)
- Fixed sidebar `w-64 bg-surface-container-low border-r border-outline-variant`
  - Logo + nav links (Find Pets active, My Matches, Messages)
  - Active link: `bg-secondary-container text-on-secondary-container rounded-xl`
  - "Get Premium" CTA at bottom: `bg-primary text-on-primary rounded-full`
- Main area `ml-64`: paw-pattern bg, card centered `max-w-[420px] aspect-[3/4] rounded-[24px]`
  - Image top fills card, cream info strip at bottom
  - Buttons below card: Dislike `w-16 h-16 border-2 border-outline-variant text-error`, SuperLike `w-14 h-14`, Like `w-20 h-20 bg-primary`

## Phase 4 — History Page Design Contract (future reference)

### Mobile (/design/pawnder_history_mobile/code.html)
- Sticky top header + search/filter row + pill tabs
- List cards: `flex items-center gap-md rounded-xl p-sm shadow-sm bg-surface-container-lowest`
  - Circular dog thumbnail 64px, name, breed/action, Chat/View button

### Desktop (/design/pawnder_history_desktop/code.html)
- Same sidebar pattern as swipe desktop
- Grid: `grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-md`
- Cards: `rounded-[24px] flex flex-col items-center text-center`

## Adaptation Notes (design vs our data model)
- No breed/name/age from random.dog — show dogId or omit label row in swipe card
- Super Like button present in design — treat as like action (same POST /api/swipe with action:"like")
- History cards adapt "Chat" button → shows like/dislike badge + timestamp instead
- Navbar shows Google avatar (session.user.image) + display name (session.user.name) + sign out button; not a plain username text label