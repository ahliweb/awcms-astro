🇬🇧 English (source) · 🇮🇩 [Bahasa Indonesia](0039-english-is-the-source-language.id.md)

# ADR-0039 — English is the source language; Indonesian is the mirror

- **Status:** Accepted
- **Date:** 15 August 2026
- **Related:** [ADR-0030](0030-aturan-tertulis-mendapat-pemeriksanya.md) (a written rule must carry its checker), [ADR-0028](0028-jangkar-standar-performa-dan-keamanan.md) (posture anchored to standards that are named), `awcms` [ADR-0097](https://github.com/ahliweb/awcms/blob/main/docs/adr/0097-english-is-the-source-language.md) (the mechanism adopted here), `awcms` [ADR-0023](https://github.com/ahliweb/awcms/blob/main/docs/adr/0023-bilingual-docs-indonesian-source-english-default.md) (the staleness gate, and the direction that was later inverted)

## Context

Every document in this repo is Indonesian, and every one of them sits at a bare
path. That was never a decision — it is simply where the repo started, and it
has held while the audience changed underneath it.

Two things make it worth changing now.

**The audience is no longer only the authors.** `.claude/skills/**` is
operational instruction read by coding agents, not only by people, and a skill
that is misread produces wrong work rather than confusion. The same is true of
[`AGENTS.md`](../../AGENTS.md), which is the first thing an agent loads and is
815 lines of binding contract.

**The family already chose.** The `awcms` repo — this repo's content backend and
the family's system of record — adopted the pattern in its ADR-0023 and inverted
its direction in ADR-0097 after finding that 253 of its 260 documents were
Indonesian prose sitting at a path its own convention promised was English. That
is a mistake this repo can decline to repeat rather than discover.

The direction is the half worth being careful about. Keeping the source in the
language fewer readers use means the copy people actually open is the copy
allowed to drift, because the staleness marker necessarily lives on the
generated side.

## Decision

1. **English at the bare path `<name>.md` is the authoritative source.** It is
   written and edited by hand, and it is what a reader or an agent gets by
   default. Indonesian at `<name>.id.md` is the mirror.

2. **The staleness marker lives in the mirror.**
   `<!-- i18n-source-hash: sha256:<hex> -->` sits in `<name>.id.md` and records
   the hash of `<name>.md`. The gate DETECTS drift; it does not translate, and no
   translation API is called from CI. Translating is done by hand in the same
   change that made the mirror stale.

3. **Scope is every document, not a front door.** `docs/**`,
   `.claude/skills/**`, `.changesets/README.md`, and the SHOUTING root documents
   — including `AGENTS.md`. The `awcms` scope regex omits its own `AGENTS.md`;
   that is a hole rather than a decision, and it is not copied. Out of scope:
   `CHANGELOG.md` (an append-only record of what was said when it was said),
   individual changesets (folded into the changelog and deleted on release, so a
   mirror would outlive its source by one release), and `graphify-out/**`
   (generated). The predicate is `isInScope` in
   [`scripts/lib/docs-i18n-checks.mjs`](../../scripts/lib/docs-i18n-checks.mjs),
   and it is tested rather than inlined into a git call — ADR-0030 applies to a
   gate's SCOPE as much as to the gate.

4. **The migration is a shrink-only ledger, not an intention.**
   `DOCS_AWAITING_MIRROR` in
   [`scripts/check-docs-translation.mjs`](../../scripts/check-docs-translation.mjs)
   names all 52 outstanding documents. Entries come off as documents are
   translated; the gate rejects an entry whose mirror already exists, so the
   ledger cannot overstate the debt, and nothing may be added to it. **A document
   written after this ADR is written in English and mirrored in the same
   change** — this ADR is the first, and it is deliberately not on the ledger.

5. **Coverage and currency are separate checks.** "Is this mirror current?" and
   "which documents have no mirror at all?" are different questions. A document
   with no mirror has no pair to be stale, so fusing them would produce a gate
   that reads green while most of the corpus is untranslated.

6. **Human review for binding documents.** The gate proves a mirror is not
   stale; it cannot prove it is faithful. On an ADR or on the parts of
   `docs/awcms-astro/` that state binding policy, the difference between "must"
   and "may" moves a decision, so a translation of one is reviewed by a human
   before merge.

7. **Code is English, and it is not mirrored.** Comments, identifiers, and gate
   messages are single-language. Code written after this ADR is written in
   English; the Indonesian identifiers and comments already in `src/`,
   `scripts/`, `server/`, and `tests/` are converted separately and are not
   governed by the ledger above. That is why
   [`scripts/check-docs-translation.mjs`](../../scripts/check-docs-translation.mjs)
   is named `audit:translation` while its three siblings are not — naming it
   `terjemahan` would add a fourth entry to a debt this same ADR schedules for
   removal.

## Three gates that had to move first

This ADR could not land on its own, because the first `.id.md` file in the tree
would have turned [`scripts/audit-dokumen.mjs`](../../scripts/audit-dokumen.mjs)
red for reasons that have nothing to do with a defect. All three are fixed in
the change that carries this ADR, each with a test proving it red without the
fix:

1. **A mirror is not an ADR.** The ADR-file filter matched `^\d{4}-.+\.md$`, and
   `0038-x.id.md` matches it. Every mirror would have been demanded as its own
   row in the ADR index, so the gate would have gone red on the first
   translation rather than on the first mistake.

2. **The foreign-repo marker was an Indonesian literal.** A citation of another
   repo's ADR is excused when its paragraph names `awcms`, a github link, or the
   phrase "repo rujukan". A translated document writes "reference repo" instead
   — and without the English form accepted alongside, all 325 currently-excused
   citations in this repo would have become violations at once. That would not
   have read as a language defect; it would have read as a gate that hates
   translations, and the gate is what gets loosened.

3. **An orphan mirror must not supply an ADR number.** A mirror
   `0042-x.id.md` whose source `0042-x.md` is gone would have made every citation
   of that number resolve to a decision the repo no longer has. Orphans are
   caught by `audit:translation`; what matters here is that they cannot quietly
   patch the hole this gate exists to find.

   (Written without the literal citation form on purpose — spelling the number
   out here would itself be a reference to a decision that does not exist, and
   this gate would refuse the ADR that describes it. It refused this one once.)

A fourth change is not a fix but an extension: the ADR index gate now reads the
Indonesian mirror of the index too, when one exists. The translation hash keeps a
mirror the same AGE as its source; it does not keep it CORRECT against the
contents of `docs/adr/`. A mirror index one decision short would otherwise pass
with a matching hash. For the same reason the status column now accepts either
language — this gate's question is whether the table agrees with the ADR file,
not what language the table is in, and language is `audit:translation`'s
question.

## Consequences

- **Positive:** the file every reader and every agent opens by default is the
  authoritative one, so the copy that drifts is the copy fewer people read. The
  migration is counted rather than aspirational, and the count may only go down.

- **Trade-off, and it is the real one:** every documentation change now costs two
  writes, because the mirror must be re-translated in the same change or CI
  fails. Across 52 documents that is a permanent tax, accepted deliberately.

- **Trade-off:** this repo's authors write in Indonesian. Making English
  authoritative asks them to author in a second language or to translate their
  own drafts forward. That is the cost of having the default copy be the
  authoritative one, and it is why decision 6 is kept rather than relaxed.

- **Neutral:** 52 documents stay Indonesian at their bare path until their ledger
  entry is cleared. During the migration the convention is true of a growing
  subset rather than of everything — the difference from doing nothing is that it
  is now counted.

- **Neutral:** `*.id.md` is excluded from the knowledge graph in
  `.graphifyignore`. A mirror retells its source word for word, so indexing both
  would enter every concept twice and produce two neighbouring communities that
  the automatic namer would give the same name — which `bun run audit:graf`
  already refuses.

## Alternatives considered

- **Translating everything in one change** — rejected. 8,700 lines with no
  gradual review path, on a corpus where a mistranslated ADR moves a binding
  decision. `awcms` rejected the same option for the same reason.

- **Keeping Indonesian authoritative, generating English** — rejected, and it is
  the option this repo would have drifted into. The marker then lives on the
  generated side, which makes the copy most readers and all agents see the one
  permitted to be stale. `awcms` ran it that way and inverted it.

- **One file with per-language sections** — rejected: every file doubles in
  length, diffs stop being readable per language, and a hash-based staleness
  check has nothing clean to hash.

- **A parallel `docs/en/**` tree** — rejected: the root `README.md` must live at
  that exact path for GitHub to render it, so a directory scheme cannot cover the
  one document with the most readers.
