🇬🇧 English (source) · 🇮🇩 [Bahasa Indonesia](0030-aturan-tertulis-mendapat-pemeriksanya.id.md)

# ADR-0030 — Four already-written rules finally get a checker, and the supply chain is pinned to SHAs

- **Status:** Accepted
- **Date:** 4 August 2026
- **Owner's rule:** 4 August 2026 — "analyse the whole contents of this repo … then update all the docs and skills. agreed, act on your best recommendation."
- **Related:** [ADR-0028](0028-jangkar-standar-performa-dan-keamanan.md) (gap 6, closed here), [ADR-0015](0015-runtime-bun-menutup-divergence-keluarga.md) (the Bun version pinned in several places), [ADR-0018](0018-kontrak-build-token-mesin-dan-traversal-konten.md) (the surfaces the build calls), `awcms` [ADR-0062](https://github.com/ahliweb/awcms/blob/main/docs/adr/0062-skills-are-gated-against-the-code-they-describe.md) (skills gated against their code)

## Context

This repo has a binding rule: **"a new rule must bring its own checker."** A
full reading on 4 August 2026 found four rules already written — some of them for
months — and **not one of them had a checker.** All four share the same failure
shape: nothing fails when they are broken.

### 1. The Bun version: five values, zero gates

`AGENTS.md` §Configuration states it as a rule that cannot be broken:

> Its version is pinned in THREE places that must move together … Raising only
> one of them makes the local build, CI, and the image behave differently —
> **silently**.

That sentence counts FILES. What has to agree is VALUES, and the value appears
**five** times: `packageManager`, `engines.bun`, `bun-version` in two CI jobs, and
the image tag in two `Dockerfile` stages. The second duplicate in each file is the
most likely to be left behind — it sits far from the first, and each stays green
on its own.

`grep -rln "packageManager\|bun-version" tests/ scripts/` returns **zero lines**.

### 2. Releases: two mandatory gates the releaser does not run

Four documents — `AGENTS.md` §Definition of Done, `CONTRIBUTING.md`, the PR
template, and `checklist-repo-baru.md` — demand a green `bun test` and a zero
`bun audit` before a release. `standar-teknis.md` §Security writes it with the
word **must**, which in that document means "breaking it fails a quality gate".

`scripts/rilis.mjs` runs `bun run build`, `audit:konten`, and `audit:dokumen`. It
does **not** run `bun test` or `bun audit`.

What is missing is not merely two commands. Two layers of `bun test` — the
serving gate and the CSP output gate — **skip themselves without `dist/`**, so the
only place both can really run is after the build; and after the build is exactly
the point the releaser skips.

### 3. `awcms` surfaces: two repos, two numbers

`ahliweb/awcms` judges its readiness partly from the list of surfaces this repo
consumes. Its repo assessment of 4 August 2026
(`docs/awcms/repo-assessment-2026-08-04.md` §4) records **six**, and builds a
consumer contract snapshot plan on that number.

This repo calls **three**. Verified against the code, not against a list:

| Surface | State |
| --- | --- |
| `GET /api/v1/blog/posts` | called |
| `GET /api/v1/media/objects` | called |
| `GET /api/v1/media/public-origin` | called |
| `GET /api/v1/blog/posts/{id}` | **REMOVED BY ADR-0018** — it used to be N+1 per build |
| `GET /api/v1/auth/session` | belongs to a portal BFF that does not exist |
| `POST /api/v1/access/machine-credentials` | how a HUMAN issues a token |

The difference is not merely a number. A consumer contract freezing three
surfaces that are not consumed would bind the repo OVER THERE to a shape the repo
HERE never needed — while making "the contract is guarded" feel more complete than
it is. And the list on this side, until this ADR, was only prose: it has already
been wrong once, with `/posts/{id}` surviving in the documents for months after
its call was deleted.

### 4. ADR-0028 gap 6: supply chain pinning

Four GitHub actions pinned to tags and the base image pinned to a tag. Tags can be
moved; actions run with access to the workflow token and the whole checkout.

## Decision

### §A — `tests/versi-toolchain.test.mjs`

The five Bun version values are compared: `packageManager` as the reference,
`engines.bun` must ACCEPT it (a range, not equality — the two answer different
questions), and the two CI `bun-version` values and two `Dockerfile` tags must
equal it exactly. Pure file reading: no build, no network.

### §B — The supply chain is pinned to SHAs and digests

All four actions are pinned to commit SHAs with a trailing `# vX.Y.Z` comment —
the form Dependabot reads in order to raise both the pin and its comment, so the
line stays human-readable without ceasing to be machine-updatable. The base image
is pinned to a digest, with the tag kept in front of it.

**A digest pin may not land without §A, and that is not a freely chosen order.**
When a tag and a digest are both present, **Docker obeys the digest and the tag
becomes a comment** — so raising the tag without raising the digest produces a
`Dockerfile` that reads `1.3.15` while building `1.3.14`, with not one failure.
A digest pin therefore ADDS a class of silent defect that only §A closes. That
gate checks it specifically: if one stage is pinned to a digest, both must be, and
the digests must be identical.

### §C — The releaser runs the gates its documents demand

`scripts/rilis.mjs` runs `bun test` and `bun audit --audit-level=low`, both
**after** the build. `--audit-level=low` matches CI: a looser threshold in the
releaser would admit an advisory its own PRs refuse, and that difference is
visible only to someone comparing two files.

### §D — The `awcms` surface list is extracted from the code, compared both ways

`tests/kontrak-awcms.test.mjs` extracts `/api/v1/…` paths from string literals in
`src/` — **after stripping comments**, because files here describe surfaces that
are not called far more often than they call them — then compares them with the
marked table in
[`awcms-astro-integrasi`](../../.claude/skills/awcms-astro-integrasi/SKILL.md).

Both directions, and both have already happened: a new surface not recorded, and a
row left behind after its surface was deleted. The number three is also written
explicitly, so that a fourth surface turns the gate red even if its author
remembers to update the skill — two checks that can be wrong together are not two
checks.

## Consequences

**What is gained.** Four rules stop depending on memory. ADR-0028 gap 6 is
closed. `awcms` gets a trustworthy source for its consumer contract — a list that
goes red when it is wrong, rather than prose that has already been mistaken.

**What is paid.** Raising the Bun version now touches six values, not five: the
tag, the digest, and four others. That genuinely is more work — and its gate is
what makes that work impossible to half-finish. Raising an action is also no
longer a matter of changing `v7` to `v8`; Dependabot does that work, and without
Dependabot it becomes real manual labour.

**What is NOT done.** `graphify-out/` **stays tracked.** An earlier
recommendation in the same session was to `gitignore` it because a hook writes to
it on every branch switch; reading `.gitignore` withdrew that recommendation. That
file already carries three reasoned graphify rules that deliberately **leave** the
shared outputs (`graph.json`, `manifest.json`, `GRAPH_REPORT.md`) tracked while
discarding intermediates, dated snapshots, and `graph.html`. That is a decision
already weighed; its churn is friction, not a defect.

## Alternatives considered

- **Pinning actions to a major tag only** (`@v7`) and relying on Dependabot.
  Refused: Dependabot keeps a version NEW, not the SAME. What a SHA pin guards is
  the window between a tag being moved and somebody noticing.
- **Pinning digests without a version gate.** Refused with the §B reasoning: it
  trades one defect class for another, quieter one.
- **Widening the surface list to six so it matches `awcms`.** Refused: this list
  states what this repo CALLS, and three of them are not called. Making the
  numbers agree by adding wrong rows is making two documents agree on something
  false.
- **Running `bun test` before the build in the releaser.** Refused: two of its
  layers skip themselves without `dist/`, so it would be green without running
  anything that matters — the purest form of a gate that looks guarded.
