🇬🇧 English (source) · 🇮🇩 [Bahasa Indonesia](0023-penahanan-dipersempit-pekerjaan-tanpa-awcms.id.md)

# ADR-0023 — The ADR-0021 hold is narrowed: work that does not need `awcms` may land

- **Status:** Accepted
- **Date:** 3 August 2026
- **Owner's rule:** 3 August 2026 — "carry on first with what can be done without the `ahliweb/awcms` repo."
- **Refines:** [ADR-0021](0021-tahan-pengembangan-menunggu-fondasi-awcms.md) — the hold stays; this ADR narrows what it holds.
- **Related:** [ADR-0019](0019-csp-ketat-dikirim-penyaji.md) (the CSP constraining image origins), [ADR-0022](0022-situs-menerbitkan-tenant-default-awcms.md)

## Context

ADR-0021 held development of this repo for a reason that was specific and is
still true: **a feature built on an `awcms` contract that is not yet stable has
to be written twice**, and this repo has already paid that once (the content
adapter was written for the summary list, then rewritten when the build feed
landed — ADR-0018).

What ADR-0021 assumed, and wrote plainly in its §Context, is that **all** of the
remaining backlog was waiting on `awcms`. That assumption did not survive a day:

- **The first item of its §Resumption points contradicts it.** "Article images —
  no longer blocked by `awcms`", with two decisions both belonging to this repo.
- **The defect found on 3 August 2026 does not touch `awcms` at all.**
  `docs/adr/README.md` listed six ADRs that never existed in this repo and missed
  nine that did, ever since the file landed. No gate could have caught it, and
  that gate — a link checker over markdown — has not one dependency on `awcms`.

Holding work **because** it is in this repo is a misreading of the reason for the
hold. What is expensive is not "working on this repo"; what is expensive is
guessing at a contract that does not exist yet.

## Decision

**Work that does not need the `ahliweb/awcms` repo may land.** The ADR-0021 hold
still applies to everything that does need it.

The test is one question, deliberately answerable without argument:

> **Would this change be rewritten if `awcms` changed?**

- **No** → it may land. Examples: gates over this repo's own files, styling and
  accessibility, document corrections, the local illustration path
  (`src/assets/`), build tooling that does not talk to the network.
- **Yes** → held. Examples: anything that shapes a request to `awcms`, reads the
  shape of its response, or stands on an endpoint that does not exist yet —
  including resolving `featuredMediaId` through `/api/v1/media/objects`, and the
  portal BFF (ADR-0014), which calls `awcms` on every one of its requests.

**A boundary that has to be stated so this test does not stretch:** "the endpoint
already exists" is **not** an answer of "no". `GET /api/v1/media/objects` does
indeed already exist, but the code calling it is code whose shape is decided by
the `awcms` response — and this template repo has no `awcms` instance to prove
its calls are right (its CI conditions the build on `vars.AWCMS_API_URL` for
exactly that reason). Writing it now means writing an integration nobody can run
until the hold is lifted.

### What does NOT change

- **The criteria for lifting it fully**, in ADR-0021 §When this hold is lifted,
  along with both of its indicators. As of 3 August 2026: criterion 1 is at zero,
  criterion 2 is not.
- **Every gate** still applies: `bun run check`, `bun test`,
  `bun run audit:konten`, a changeset when behaviour changes, an ADR when the
  decision belongs on the `docs/adr/README.md` list.
- **Security patches and dependency bumps** may still land — this ADR adds a
  third class, it does not replace the two that exist.

## Consequences

- **Positive:** backlog whose blocker is here stops waiting on something that
  never blocked it. The gate that should have caught the 3 August defect can be
  built now, rather than months later once the next defect of the same class has
  already landed.
- **Negative / accepted trade-off:** the test needs judgement, and judgement can
  stretch. The example named explicitly above — "the endpoint already exists" is
  not an answer of "no" — is where that stretching is most likely, so it is
  written as a boundary rather than left to good intentions.
- **Neutral:** ADR-0021 is not superseded. It remains a decision in force; what
  changes is its scope.

## Alternatives considered

- **Lift the hold entirely.** Refused: ADR-0021's criterion 2 is not met, and its
  original reason — a contract not yet firm gets written twice — still applies
  exactly to article images and the portal BFF.
- **Treat each item as an ad-hoc exception with no ADR.** Refused: a hold that is
  loosened per PR with no written rule stops being a hold after the third PR, and
  nobody can point to when that happened.
- **Define the test as a list of permitted items rather than as a question.**
  Refused: such a list goes stale on the first item nobody thought of while
  writing it, and this repo already has examples of documents going stale with
  nothing turning red.
