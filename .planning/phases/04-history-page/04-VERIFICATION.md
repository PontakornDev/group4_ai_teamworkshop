---
phase: 04-history-page
verified: 2026-05-12T02:22:00Z
status: gaps_found
score: 3/6 must-haves verified
overrides_applied: 0
gaps:
  - truth: "/history page lists all swipe records from swipes.json, grouped by username"
    status: failed
    reason: "Records are grouped by dog (dogId), not by username. User explicitly chose dog-grouped view in DISCUSSION-LOG, but ROADMAP SC #1 says 'grouped by username'. The SC wording was never updated to match the user decision."
    artifacts:
      - path: "components/HistoryList.tsx"
        issue: "Groups by dogId (one card per dog), not by username. No username-section grouping anywhere in the JSX."
    missing:
      - "Either update ROADMAP SC #1 wording to 'grouped by dog' to reflect the user decision, OR implement grouping by username as the roadmap contract states."

  - truth: "History page shows each dog record's dogId, imageUrl thumbnail, and all swipes from its col array (username, email, action, timestamp per entry)"
    status: failed
    reason: "HIST-02 requires all col entries (username, email, action, timestamp per entry) to be displayed. The component only shows the current user's action badge per dog via ActionBadge. Individual col entries are not iterated or rendered — no col.map() exists in the component. Email is never rendered. Timestamp is shown on desktop only; absent on mobile."
    artifacts:
      - path: "components/HistoryList.tsx"
        issue: "No col.map() or col.forEach — only col.find() for current user's single entry. Email field never rendered. Mobile cards (lines 157-186) show no timestamp."
    missing:
      - "Render all col entries per dog (or at minimum the current user's entry with username, email, action, timestamp all visible)"
      - "Add timestamp display to mobile cards (currently desktop-only, lines 215-219)"
      - "Render email field somewhere in the card (currently never displayed)"

  - truth: "Summary bar shows total likes count and total dislikes count per user"
    status: failed
    reason: "ROADMAP SC #2 says 'per user' — implying a breakdown by user. Implementation shows current user's totals only (not a per-user breakdown). User deliberately chose 'Your totals only' in DISCUSSION-LOG, but ROADMAP SC was never updated to match."
    artifacts:
      - path: "components/HistoryList.tsx"
        issue: "Stats computed from mine (current user's records only), not a per-user table. Line 71-80."
    missing:
      - "Either update ROADMAP SC #2 wording to 'current user's total likes and dislikes' to match the user decision, OR implement per-user summary breakdown."

human_verification:
  - test: "Visit /history as a logged-in user and verify the page renders without errors"
    expected: "History page loads, shows 'Your Swipe History' title, summary bar chips, filter pills, sort dropdown, and dog cards"
    why_human: "Cannot run Next.js app in verification environment"

  - test: "Verify mobile card layout (viewport < 768px) shows no timestamp"
    expected: "WR-02 from code review: mobile cards show ActionBadge but no timestamp below it (design inconsistency vs desktop)"
    why_human: "Responsive breakpoint behavior requires browser rendering"

  - test: "Verify filter pills work — click 'Likes', then 'Dislikes', then 'All'"
    expected: "Each click narrows/restores the card list; summary bar chip counts do NOT change when filter is active"
    why_human: "Client-side React state interaction requires browser"

  - test: "Verify sort dropdown — switch from 'Newest first' to 'Oldest first'"
    expected: "Card order reverses based on each dog's col entry timestamp for the current user"
    why_human: "Dynamic sort behavior requires browser"
---

# Phase 4: History Page Verification Report

**Phase Goal:** Display past swipe records — history page shows all swipe records with filter/sort UI per the approved UI-SPEC
**Verified:** 2026-05-12T02:22:00Z
**Status:** gaps_found
**Re-verification:** No — initial verification

---

## Goal Achievement

### Observable Truths

The ROADMAP defines 5 success criteria for Phase 4. All 4 requirement IDs (HIST-01 through HIST-04) are also verified against their REQUIREMENTS.md definitions.

| # | Truth | Status | Evidence |
|---|-------|--------|----------|
| SC-1 | /history page lists all swipe records from swipes.json, grouped by username | ✗ FAILED | Records are grouped by dog (dogId), one card per dog. No username grouping in JSX. User chose dog-grouping in DISCUSSION-LOG but ROADMAP SC was never updated. |
| SC-2 | Summary bar shows total likes count and total dislikes count per user | ✗ FAILED | Shows current user's totals only; no per-user breakdown. User chose "your totals only" in DISCUSSION-LOG but SC wording was never updated. |
| SC-3 | User can filter records by action: all / like / dislike | ✓ VERIFIED | FilterPills row with useState hook; All/Likes/Dislikes buttons with active/inactive styling. Lines 107-136 in HistoryList.tsx. |
| SC-4 | Records are sortable by timestamp (newest first by default) | ✓ VERIFIED | SortDropdown `<select>` with `sort` state defaulting to "newest"; sorted useMemo sorts by col entry timestamp. Lines 40, 61-69. |
| SC-5 | UI matches Stitch design export for history page (mobile + desktop layouts) | ? UNCERTAIN | Typography, colors, spacing, and copy all match UI-SPEC. Mobile/desktop card layouts exist. Requires browser rendering to fully confirm. Timestamp absent on mobile cards (WR-02) is a UI-SPEC gap. |
| HIST-01 | User can view all past swipe records on a /history page | ✓ VERIFIED | Page exists at app/history/page.tsx. Auth guard present (line 8-9). readDogs() called and all records passed to HistoryList. Filtered client-side to current user's records. |
| HIST-02 | History page shows dogId, imageUrl thumbnail, and all swipes from col array (username, email, action, timestamp per entry) | ✗ FAILED | dogId (truncated 8 chars) and imageUrl thumbnail shown. But col array entries are NOT iterated — only current user's action shown via ActionBadge. Email never rendered. Timestamp absent on mobile. No col.map() exists in component. |
| HIST-03 | History records are filterable by action (all / like / dislike) | ✓ VERIFIED | filter useState + filtered useMemo + FilterPills buttons. Lines 39, 52-58, 107-136. |
| HIST-04 | History records are sortable by timestamp (newest first by default) | ✓ VERIFIED | sort useState + sorted useMemo with localeCompare on col entry timestamps. Lines 40, 61-69, 128-135. |

**Score (roadmap SCs):** 2/5 roadmap SCs verified (SC-3 and SC-4)
**Score (requirement IDs):** 3/4 requirement IDs verified (HIST-01, HIST-03, HIST-04)
**Overall score:** 3/6 must-haves verified (counting both SC and HIST sources, deduplicated)

---

### Deferred Items

None. All gaps are from the current phase scope with no evidence they are addressed in Phase 5.

---

### Required Artifacts

| Artifact | Expected | Status | Details |
|----------|----------|--------|---------|
| `components/HistoryList.tsx` | Client component with filter/sort/summary bar UI | ✓ VERIFIED (substantive, wired) | 229 lines; useState, useMemo, SummaryBar, FilterPills, SortDropdown, mobile list, desktop grid, ActionBadge, empty states all present |
| `app/history/page.tsx` | Server component with auth guard, readDogs(), HistoryList invocation | ✓ VERIFIED (substantive, wired) | Auth guard on line 8-9; readDogs() on line 11; HistoryList with currentUser prop on lines 41-44 |
| `lib/storage.ts` | readDogs() returning DogRecord[] from swipes.json | ✓ VERIFIED (substantive, wired) | readDogs() reads swipes.json and JSON.parses to DogRecord[]. NOTE: unguarded JSON.parse (CR-02 from code review — not a phase goal blocker but a reliability risk) |
| `app/api/history/route.ts` | GET handler for history records | ✓ VERIFIED (exists, substantive) | Exists, calls readDogs(), returns JSON. Not consumed by the history page (page reads storage directly per CONTEXT.md) |

---

### Key Link Verification

| From | To | Via | Status | Details |
|------|----|-----|--------|---------|
| `app/history/page.tsx` | `lib/storage.ts` | `readDogs()` import and call | ✓ WIRED | Line 5 import, line 11 call, result passed to HistoryList as `records` prop |
| `app/history/page.tsx` | `components/HistoryList.tsx` | import + JSX invocation | ✓ WIRED | Line 4 import, lines 41-44 `<HistoryList records={records} currentUser={...} />` |
| `app/history/page.tsx` | `@/auth` | `auth()` session guard | ✓ WIRED | Line 1 import, line 8 `await auth()`, line 9 redirect if no session |
| `HistoryList.tsx` | `records` prop | `mine` useMemo filter | ✓ WIRED | `mine = records.filter(r => r.col.some(e => e.username === currentUser))` — real data flows through |
| `HistoryList.tsx` → col entries | email/username render | JSX render | ✗ NOT_WIRED | `email` field defined in ColEntry interface but never rendered. `username` used only for filtering, not displayed in any card. col entries not iterated for display. |

---

### Data-Flow Trace (Level 4)

| Artifact | Data Variable | Source | Produces Real Data | Status |
|----------|---------------|--------|--------------------|--------|
| `HistoryList.tsx` | `records` | `readDogs()` in page.tsx → `lib/storage.ts` → `data/swipes.json` | Yes — reads actual JSON file from disk | ✓ FLOWING |
| `HistoryList.tsx` | `mine` | `records.filter()` on `currentUser` | Yes — derives from real records | ✓ FLOWING |
| `HistoryList.tsx` | `stats` | `mine.filter()` for like/dislike counts | Yes — real counts from actual swipe data | ✓ FLOWING |
| `HistoryList.tsx` | `sorted` | `filtered` sorted by timestamp | Yes — real timestamps from col entries | ✓ FLOWING |
| `HistoryList.tsx` | `col` entries render | `dog.col.find()` for current user only | Partial — finds real entry but does not render all col entries | ⚠️ HOLLOW — wired for single entry but col.map() not used; email and multi-user entries not rendered |

---

### Behavioral Spot-Checks

Step 7b: SKIPPED — Next.js app server required. Cannot execute app routes without starting the dev server.

---

### Probe Execution

Step 7c: No probes declared in PLAN frontmatter. No `scripts/*/tests/probe-*.sh` found. SKIPPED.

---

### Requirements Coverage

| Requirement | Source Plan | Description | Status | Evidence |
|-------------|------------|-------------|--------|----------|
| HIST-01 | 04-01-PLAN.md, 04-02-PLAN.md | User can view all past swipe records on /history page | ✓ SATISFIED | app/history/page.tsx: auth guard + readDogs() + HistoryList render |
| HIST-02 | 04-01-PLAN.md | Shows dogId, imageUrl thumbnail, and all swipes from col array | ✗ BLOCKED | dogId and imageUrl shown; col entries NOT iterated; email never rendered; timestamp absent on mobile |
| HIST-03 | 04-01-PLAN.md | Filterable by action (all / like / dislike) | ✓ SATISFIED | FilterPills + filter useMemo in HistoryList.tsx lines 39, 52-58, 107-136 |
| HIST-04 | 04-01-PLAN.md | Sortable by timestamp (newest first by default) | ✓ SATISFIED | SortDropdown + sorted useMemo in HistoryList.tsx lines 40, 61-69, 128-135 |

**Orphaned requirements check:** No additional requirements mapped to Phase 4 in REQUIREMENTS.md beyond HIST-01 through HIST-04.

---

### Anti-Patterns Found

| File | Line | Pattern | Severity | Impact |
|------|------|---------|----------|--------|
| `components/HistoryList.tsx` | 159, 191 | `?? dog.col[0]` fallback after a filter that guarantees the find will succeed | ⚠️ Warning | Dead code that silently shows another user's action badge if the mine-filter invariant breaks (CR WR-01) |
| `lib/storage.ts` | 32 | Unguarded `JSON.parse(raw)` — no try/catch | ⚠️ Warning | Corrupted swipes.json crashes the history page with unhandled exception; also breaks all swipe writes (CR-02). Not a debt marker, but a reliability defect. |
| `components/HistoryList.tsx` | 6-17 | Local `ColEntry`/`DogRecord` interfaces duplicating `lib/storage.ts` exports | ℹ️ Info | Silent type drift possible if storage schema changes (CR WR-03) |

No unreferenced `TBD`, `FIXME`, or `XXX` markers found in phase files. Debt-marker gate: CLEAR.

---

### Human Verification Required

#### 1. History Page Rendering

**Test:** Log in with Google OAuth and visit `/history`
**Expected:** Page loads with "Your Swipe History" title, sticky summary bar (N Swiped / ❤ N Likes / ✕ N Dislikes chips), All/Likes/Dislikes filter pills, Newest first sort dropdown, and dog cards in mobile list or desktop grid layout
**Why human:** Requires running Next.js dev server and completing Google OAuth flow

#### 2. Filter Pill Interaction

**Test:** Click "Likes" filter pill, then "Dislikes", then "All"
**Expected:** Card list narrows to matching action; summary bar chip counts stay constant (pre-filter totals); switching to "All" restores full list
**Why human:** Client-side React state interaction requires browser

#### 3. Sort Dropdown Interaction

**Test:** Switch sort from "Newest first" to "Oldest first"
**Expected:** Card order reverses based on each dog's swipe timestamp for the current user
**Why human:** Dynamic ordering requires browser rendering with real data

#### 4. Mobile Timestamp Gap (WR-02)

**Test:** View `/history` on a mobile viewport (< 768px) — inspect a dog card
**Expected per UI-SPEC:** Timestamp should appear below the action badge. ACTUAL: timestamp not rendered in mobile cards (lines 157-186 have no timestamp). Desktop cards (lines 189-225) show timestamp correctly.
**Why human:** Responsive breakpoint behavior requires browser

---

### Gaps Summary

Three blockers prevent the phase goal from being fully achieved:

**Gap 1 — ROADMAP SC #1 / SC #2: Grouping and summary scope mismatch**
The ROADMAP contract says records are "grouped by username" with "per user" summary. The implementation groups by dog (one card per dogId) and shows only the current user's totals. The user explicitly chose this alternative in the DISCUSSION-LOG, but the ROADMAP success criteria were never updated to reflect the decision. The implementation is consistent with the user's expressed intent, but inconsistent with the signed-off roadmap contract. Resolution: update ROADMAP SC #1 and SC #2 wording to match the user decision, then re-verify.

**Gap 2 — HIST-02: col array entries not rendered**
HIST-02 requires displaying "all swipes from its col array (username, email, action, timestamp per entry)." The component shows only the current user's action badge — no col.map() iterates all entries. Email is never rendered. Timestamp is absent on mobile. This is a substantive data-display gap against the requirement's literal text. The user's "current user only" decision (D-02) narrows what is shown, but HIST-02 was not revised to match that decision.

**Gap 3 — Mobile timestamp absent**
Mobile dog cards (lines 157-186) show no timestamp. Desktop cards show timestamp (lines 215-219). The UI-SPEC Layout section specifies `p: timestamp — text-label-lg text-on-surface-variant (mobile only on card)` — meaning the spec actually calls for timestamp on mobile. This is a missing implementation confirmed by code review WR-02.

**Root cause of Gaps 1 and 2:** The user made architectural decisions in the DISCUSSION-LOG (dog-grouped view, current-user-only) that differed from the ROADMAP success criteria and REQUIREMENTS.md text, but neither the ROADMAP nor REQUIREMENTS.md were updated to reflect these decisions. The implementation correctly executed the user's expressed decisions but the contracts were not reconciled.

**Recommended resolution:**
1. Update ROADMAP Phase 4 SC-1 to: "User can view their own past swipe records on /history, grouped by dog"
2. Update ROADMAP Phase 4 SC-2 to: "Summary bar shows the current user's total likes count and total dislikes count"
3. Update HIST-02 in REQUIREMENTS.md to: "History page shows each dog card with dogId, imageUrl thumbnail, the current user's action badge, and swipe count"
4. Add timestamp to mobile cards (5-line fix, matches UI-SPEC spec)
5. Re-verify

---

_Verified: 2026-05-12T02:22:00Z_
_Verifier: Claude (gsd-verifier)_
