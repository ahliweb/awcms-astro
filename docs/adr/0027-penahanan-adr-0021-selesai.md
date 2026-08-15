🇬🇧 English (source) · 🇮🇩 [Bahasa Indonesia](0027-penahanan-adr-0021-selesai.id.md)

# ADR-0027 — The ADR-0021 hold is over: both of its indicators are met

- **Status:** Accepted
- **Date:** 4 August 2026
- **Owner's rule:** 4 August 2026 — "carry on analysing and acting on the recommendations, in sync with the `ahliweb/awcms` backend repo."
- **Supersedes:** [ADR-0021](0021-tahan-pengembangan-menunggu-fondasi-awcms.md)
- **Related:** [ADR-0023](0023-penahanan-dipersempit-pekerjaan-tanpa-awcms.md) (the test that still applies), `awcms` [ADR-0059](https://github.com/ahliweb/awcms/blob/main/docs/adr/0059-host-resolved-public-content-routes.md), `awcms` [ADR-0060](https://github.com/ahliweb/awcms/blob/main/docs/adr/0060-business-scope-hierarchy-provided-by-tenant-admin.md)

## Context

ADR-0021 held development of this repo "until the `awcms` foundation is
finished" and — because "finished" had no formal definition — wrote down **two
checkable indicators** along with the risk it accepted: *"this hold could last
longer than intended without anyone noticing. If both are at zero and the hold is
still in force, that is a question worth raising, not a state to be left alone."*

Both are now at zero.

| Indicator | State | Evidence |
| --- | --- | --- |
| Every `awcms` module has a screen | **Met** 3 Aug 2026 | `grep -L 'navigation:' src/modules/*/module.ts` → zero lines |
| §4 "outstanding" of `PROJECT_STATE` is empty | **Met** 4 Aug 2026 | ADR-0059 (host-resolved routes), ADR-0060 (the business-scope provider) |

What closed the second indicator was not a reading from this side. `awcms`
analysed this repo's readiness against the CODE — not against its list — and
concluded that this repo touches only **five surfaces**, all five complete, then
closed the one genuine gap it found (`GET /api/v1/media/public-origin`, #370).
Its closing sentence: **"What remains AND belongs to this repo: zero."**

The unabsorbed remains of `awcms-micro` — `newsletter`, `social-publishing`, the
`src/components/ui/` library — are still absent, and **not one of them blocks
this repo**. That too is `awcms`'s conclusion, not a judgement from here.

## Decision

**The ADR-0021 hold is over.** It was not lifted early and not left hanging: the
criteria it wrote for itself are met.

### What replaces it: the ADR-0023 test, unchanged

ADR-0023 already narrowed the hold to a single question, and that question
**still applies after this ADR**:

> **Would this change be rewritten if `awcms` changed?**

Only its premise changes. While ADR-0021 was in force, "yes" meant *held until
the foundation is finished*. Now "yes" means *it needs an `awcms` instance to
prove its calls are right before it lands* — the same boundary, a different
reason, and the second reason will never expire.

ADR-0023's explicit boundary does not change either: **"the endpoint already
exists" is not an answer of "no".**

### What is still held, and by what

**The Jualanku portal BFF (ADR-0014).** Not by ADR-0021 — by the ADR-0023 test:
it calls `awcms` **on every runtime request**, not once per build, so its shape
is decided by an `awcms` response on every request. Its session contract has
landed (`awcms` ADR-0049/0050) and the business-scope resolver now has a provider
(ADR-0060), but the shape of the Jualanku merchant scope itself still needs an
admission ADR in `awcms`.

### What does NOT change

- Every gate: `bun run check`, `bun test`, `bun run audit:konten`,
  `bun run audit:dokumen`, a changeset, and an ADR for a decision that belongs on
  the [`docs/adr/README.md`](README.md) list.
- Security patches and dependency bumps still land, as they did during the hold.
- ADR-0021 is still read as a historical record — it explains why this repo went
  quiet for two days, and its reasoning was correct when it was written.

## Consequences

- **The backlog stops waiting on something.** What remains in
  [`README.md`](../../README.md) is two items, and both wait on a **decision**
  rather than a contract: generated share cards (an image encoder dependency → its
  own ADR) and the portal BFF (above).
- **The risk ADR-0021 accepted did not occur.** The hold lasted two days, not
  months, and what ended it was the indicator it wrote for itself — not somebody
  who happened to remember.
- **A new accepted risk:** "the contract is complete" is `awcms`'s conclusion as
  of 4 August 2026, not a permanent property. A sixth surface this repo calls one
  day may well not exist over there; the ADR-0023 test is what catches that, and
  that is why the test was not withdrawn along with the hold.

## Alternatives considered

- **Leaving ADR-0021 in force until `awcms` genuinely finishes all of its §4** —
  refused: §4 contains the `awcms-micro` absorption programme and an e-commerce
  trajectory that were never this repo's contract. Waiting for it means waiting
  on work that never blocked anything here, and that is precisely the risk
  ADR-0021 wrote down as its own worry.
- **Withdrawing the ADR-0023 test as well** — refused: that test was never about
  `awcms`'s readiness, but about whether this template repo can PROVE a call is
  right. It still has no instance.
- **Declaring the hold lifted without an ADR** — refused: ADR-0021 is a written
  decision, and a written decision is withdrawn in writing. Six months from now
  "why did this repo stop for two days and then start again" must have a readable
  answer.
