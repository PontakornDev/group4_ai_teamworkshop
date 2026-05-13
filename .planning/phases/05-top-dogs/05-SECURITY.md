---
phase: 05
slug: top-dogs
status: verified
threats_open: 0
asvs_level: 1
created: 2026-05-13
---

# Phase 05 — Security

> Per-phase security contract: threat register, accepted risks, and audit trail.

---

## Trust Boundaries

| Boundary | Description | Data Crossing |
|----------|-------------|---------------|
| fs → application | swipes.json read from disk | Aggregated swipe counts, dogIds (no PII) |
| Internet → /api/stats | Unauthenticated GET endpoint | Aggregate stats only — no user data |
| swipes.json → TopDogsSection | imageUrl rendered via Next.js Image | External URL from random.dog (trusted source) |
| Server component → HTML output | topDogs data rendered into /history page | Aggregate counts, dogIds, image URLs |
| Browser → /history | Auth-guarded route | Session token (NextAuth) |

---

## Threat Register

| Threat ID | Category | Component | Disposition | Mitigation | Status |
|-----------|----------|-----------|-------------|------------|--------|
| T-05-01 | Tampering | data/swipes.json | accept | Local dev storage only; no network exposure at this layer | closed |
| T-05-02 | Denial of Service | getTopDogs() | accept | Server-side only; no user-controlled loop count; array bounded by local file | closed |
| T-05-03 | Information Disclosure | GET /api/stats | accept | Intentionally public (D-02); exposes aggregate counts and dogIds only — no PII | closed |
| T-05-04 | Denial of Service | GET /api/stats | accept | No user-controlled computation; reads local JSON; rate limiting out of scope for prototype | closed |
| T-05-05 | Information Disclosure | TopDogsSection image src | accept | imageUrl from random.dog (trusted third party already in use); dogId is UUID substring — no PII | closed |
| T-05-06 | Tampering | TopDogsSection render | accept | Read-only display component; props are server-computed values, not user-supplied strings | closed |
| T-05-07 | Information Disclosure | /history page (server render) | accept | Top Dogs data is aggregate counts and dogIds only; auth guard in place for the page | closed |
| T-05-08 | Spoofing | imageUrl in TopDogsSection | accept | imageUrl originates from random.dog (existing trusted source); Next.js Image handles rendering — no innerHTML injection | closed |

*Status: open · closed*
*Disposition: mitigate (implementation required) · accept (documented risk) · transfer (third-party)*

---

## Accepted Risks Log

| Risk ID | Threat Ref | Rationale | Accepted By | Date |
|---------|------------|-----------|-------------|------|
| AR-05-01 | T-05-01 | swipes.json is local dev storage with no network exposure; malformed JSON returns empty array | plan-time | 2026-05-12 |
| AR-05-02 | T-05-02 | getTopDogs() is server-only; bounded by local file size; no user-controlled input | plan-time | 2026-05-12 |
| AR-05-03 | T-05-03 | /api/stats is intentionally public per design decision D-02; aggregate data only | plan-time | 2026-05-12 |
| AR-05-04 | T-05-04 | Rate limiting out of scope for prototype; DoS risk accepted | plan-time | 2026-05-12 |
| AR-05-05 | T-05-05 | random.dog is the project's existing trusted image source; no PII in dogId | plan-time | 2026-05-12 |
| AR-05-06 | T-05-06 | TopDogsSection is display-only; all props server-computed | plan-time | 2026-05-12 |
| AR-05-07 | T-05-07 | Top Dogs section exposes no user-identifying data; /history is auth-guarded | plan-time | 2026-05-12 |
| AR-05-08 | T-05-08 | imageUrl rendering delegated to Next.js Image; no innerHTML injection possible | plan-time | 2026-05-12 |

---

## Security Audit Trail

| Audit Date | Threats Total | Closed | Open | Run By |
|------------|---------------|--------|------|--------|
| 2026-05-13 | 8 | 8 | 0 | gsd-secure-phase (auto — all accept, plan-time register) |

---

## Sign-Off

- [x] All threats have a disposition (mitigate / accept / transfer)
- [x] Accepted risks documented in Accepted Risks Log
- [x] `threats_open: 0` confirmed
- [x] `status: verified` set in frontmatter
