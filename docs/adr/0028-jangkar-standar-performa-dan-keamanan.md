🇬🇧 English (source) · 🇮🇩 [Bahasa Indonesia](0028-jangkar-standar-performa-dan-keamanan.id.md)

# ADR-0028 — The performance and security posture is anchored to standards that are named

- **Status:** Accepted
- **Date:** 4 August 2026
- **Owner's rule:** 4 August 2026 — "analyse the whole contents of this repo, give recommendations based on the awcms development standards and their relation to the ahliweb/awcms repo, international performance standards and international security standards."
- **Related:** [ADR-0019](0019-csp-ketat-dikirim-penyaji.md) (the CSP sent by the server, matched to `awcms`), [ADR-0016](0016-penyajian-bun-di-belakang-traefik-tanpa-nginx.md) (the server as the sole owner of headers), [ADR-0024](0024-seni-lokal-di-src-assets.md) (a knowingly accepted performance cost), [ADR-0027](0027-penahanan-adr-0021-selesai.md) (the hold is over — this ADR is the first work after it), `awcms` [ADR-0062](https://github.com/ahliweb/awcms/blob/main/docs/adr/0062-skills-are-gated-against-the-code-they-describe.md) (skills gated against their code)

## Context

### 1. The rules already exist; their names do not

This repo has a strict CSP that is really sent, five security headers proven by
tests, a ban on raw HTML from the CMS enforced by its renderer, a cross-verified
tenant, and four gates in CI. Almost all of it maps neatly onto controls that
already have names out in the world — OWASP Top 10, ASVS, the Secure Headers
Project, ISO/IEC 27001 Annex A, NIST SSDF.

Not one of those names has ever been mentioned in this repo. Two consequences, and
both are real:

- A derived site asked "which controls are met?" has no answer it can send, even
  though the answer is mostly "met".
- A control that is **not** met has nowhere to be seen. This repo has already
  recorded five documents stating something that does not exist; its opposite —
  something that does not exist and was never recorded as absent — has not one
  checker, because it is not a statement.

### 2. One difference from `awcms` found by that very mapping

Four files in this repo state that the server sends "five security headers …
matched to the `awcms` posture". Those five are indeed identical in value. What is
not identical is their count: `awcms` sends **six** in production —
`buildSecurityHeaders` in `src/lib/security/security-headers.ts` adds
`Strict-Transport-Security: max-age=31536000; includeSubDomains` behind an
`isProduction` gate.

This repo sends HSTS in no environment. The reason that reads plausibly — "TLS is
terminated by Traefik, so that is the front layer's business" — does not survive
checking: Traefik does not install HSTS without a declared middleware, so what was
happening was not "installed elsewhere" but **installed nowhere**. And
[ADR-0016](0016-penyajian-bun-di-belakang-traefik-tanpa-nginx.md) already forbids
solving it in Traefik.

This difference was not found by code review. It was found when both postures were
laid side by side in one table — which before this ADR did not exist.

### 3. A budget never measured, and targets never written

`standar-teknis.md` sets image budgets (home ≤ 250 KB, content page ≤ 100 KB)
carried over from the reference repo and **never once measured here**. It also
requires `fetchpriority="high"` on above-the-fold images;
`src/components/Ilustrasi.astro` sets only `loading="eager"`.

Meanwhile there is not one **outcome** target — LCP, INP, CLS. A byte budget and a
reading experience are not the same thing: a page can meet its image budget and
still have a bad LCP because its largest image is downloaded at low priority. That
is exactly this repo's state today.

## Decision

### §A — The standards anchor is declared, with its editions

[`docs/awcms-astro/standar-performa-dan-keamanan.md`](../awcms-astro/standar-performa-dan-keamanan.md)
becomes the map between this repo's controls and the standards that name them.
Each standard's edition is written explicitly, and **the OWASP editions are matched
to `awcms`** (Top 10 2021, ASVS 4.0.3), which maps itself to those editions in its
`awcms-security-hardening` skill.

Matching editions is not tidiness. Two family repos mapping themselves to two
different editions produce two matrices that cannot be added together, and whoever
reads them will read a numbering difference as a control gap. Moving to a new
edition is therefore a **family-level** decision: this repo follows `awcms`, it does
not go ahead of it.

### §B — Checkable performance targets, written as targets

Core Web Vitals at p75 of real visits: **LCP ≤ 2.5 seconds, INP ≤ 200
milliseconds, CLS ≤ 0.1**. INP is recorded as the replacement for FID since March
2024 so that a document mentioning FID later reads as stale, not as an alternative.

All three are written **together with a statement that none of them has been
measured.** That is not excessive caution: writing a target without saying it has
not been measured is precisely the defect class this repo's four gates were built
to catch.

### §C — Nine gaps recorded as gaps, each with its checker

Their list is in that document's §Gaps. The rule binding their closure is taken
whole from this repo itself: **a rule without its checker is a rule that will be
broken**, and that applies to a rule coming from an external standard too. So each
row names the checker that has to land with it, and gap 1 (HSTS) is marked as
needing its own ADR because it changes the security posture.

### §D — What is refused is refused in writing

Five controls the standards recommend and that are **not** adopted — CSP
reporting, blanket `Cross-Origin-Resource-Policy`, SRI, RUM for measuring Core Web
Vitals, and rate limiting in the server — are written down with their reasons.
Three of them are refused because they collide with the ban on collecting reader
data, one because it guards nothing without external resources, and one because it
decides for a site that does not exist yet.

Without this list, all five would be proposed again six months later as new
findings — which is precisely why ADRs exist in this repo.

### §E — Rule 2 of `awcms` ADR-0062 is absorbed as work

`awcms` ADR-0062 gates skills against the code they describe, through three rules.
This repo already meets the spirit of rules 1 and 3: `bun run audit:dokumen` checks
the file paths named by `.claude/skills/` exactly as it checks `docs/`, and its
exception list requires every entry to name **whose** that path is.

Rule 2 is not here yet: an `ADR-NNNN` citation is not checked to resolve to its
file. It is listed as a gap that is cheap to close — its gate already reads all of
this repo's markdown and already has the ADR index.

## Consequences

**What is gained.** One real posture difference from `awcms` (HSTS) stops being
invisible. Eight other gaps have a name, a consequence, and a checker. A derived
site has an answer it can send when asked about compliance.

**What is paid.** A document stating control status is a document that can go
stale — the defect class this repo finds in itself most often. What holds it back
in part: every file path and every link inside it is already gated by
`bun run audit:dokumen`. What is **not** held back: the "State" column. A row can
read "Met" after its control has been removed, and no gate can see it. That is
stated in the document itself rather than left to look guarded.

**What is NOT done.** Zero code changes. Not one header added, not one gate
loosened, not one dependency added. Nine gaps stay open and **read as open** —
closing them silently along with the ADR that names them would make this ADR
indistinguishable from work that claims more than it did.

## Alternatives considered

- **Closing gap 1 (HSTS) in this ADR as well.** Refused: it changes the security
  posture, which by the criteria in this directory's [`README.md`](README.md)
  requires its own ADR. Merging them means the decision "we follow standard X" and
  the decision "we send header Y with `max-age` Z" live in one file, and the second
  will be withdrawn or changed far more often than the first.
- **Putting the compliance matrix in `standar-teknis.md`.** Refused: that file
  holds **binding** rules, and a compliance matrix holds **status**. Mixing them
  makes a rotting status row read as a rule still in force — exactly the same defect
  as an ADR index listing six decisions that never existed.
- **Copying the `awcms` compliance matrix as-is.** Refused: most of its rows
  describe controls with no surface here (RLS, ABAC, idempotency, the audit trail).
  A matrix whose rows are mostly "not applicable" stops being read, and the rows
  that do apply go with it.
- **Writing no ADR at all, just the document.** Refused: §A and §D are decisions —
  which edition of a standard is followed, and which controls are refused and why. A
  decision living only inside a table will be dismantled by the next person who
  reads that table as a to-do list.
