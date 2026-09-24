🇬🇧 English (source) · 🇮🇩 [Bahasa Indonesia](0051-a-knowledge-tree-points-at-the-code-and-owns-none-of-it.id.md)

# ADR-0051 — A knowledge tree points at the code, and owns none of it

- **Status:** Accepted
- **Date:** 24 September 2026
- **Related:** [ADR-0038](0038-kebutuhan-backend-menjadi-modul-di-awcms.md) (this repo reads `awcms`, it does not write — the same discipline this ADR applies to reading the codebase itself), [ADR-0039](0039-english-is-the-source-language.md) (the mirror requirement this ADR's own directory is carved out of), [ADR-0027](0027-penahanan-adr-0021-selesai.md) ("will this be rewritten if `awcms` changes?" — the question this ADR answers "no" to), `awcms` ADR-0068 (the family-compatibility manifest this repo cannot write, only point at), `awcms-one` [issue #11](https://github.com/ahliweb/awcms-one/issues/11) (the prior art this workflow ports from), [issue #113](https://github.com/ahliweb/awcms-astro/issues/113)

## Context

### `awcms-one` already solved this problem once

`awcms-one` — a sibling repo that embeds `awcms` as a `git subtree` alongside
its own storefront — built a Graphify knowledge-graph workflow over its own
tree (`awcms-one#11`): a generated graph, a handful of hand-written curated
notes, an Obsidian export, and an `audit:graf` gate that reads the committed
artefacts without needing `graphify` installed in CI. It works, it is tested,
and it is the nearest working precedent to what this repo needs. Copying its
design wholesale would be wrong in exactly the places `awcms-one`'s own shape
does not apply here — this repo has no subtree, no second graph to federate
with, and a different translation-mirror rule already in force.

### `awcms#805` was open when this design was chosen — it has since closed, in agreement

The natural question — "shouldn't the backend repo define this first, so both
repos converge on one design?" — had a concrete answer when this workflow's
shape was chosen: [`ahliweb/awcms#805`](https://github.com/ahliweb/awcms/issues/805)
proposed exactly that, and it was **open and unimplemented**. There was no
canonical knowledge-graph shape on the `awcms` side to copy, diverge from with
reasons, or block on. This repo was therefore not choosing to diverge from a
built design — there was no built design yet. Waiting for it would have meant
holding this work indefinitely against an issue with no committed timeline,
which is the exact shape ADR-0027 already closed off for this repo in
general: "will this be rewritten if `awcms` changes?" was answered here by
"no" — this workflow reads this repo's own tree only, and touches nothing
`awcms#805` would decide.

**That issue closed as completed at 2026-09-23T22:25:59Z**, landed by `awcms`
PR #819 and recorded as `awcms` ADR-0124 ("Obsidian opens a dedicated
`knowledge/` vault, not the repository root"), dated one day after. Read
against the real ADR, the two designs converge independently rather than one
copying the other: a dedicated `knowledge/` vault instead of the repository
root, hand-written curated notes (`awcms`'s `knowledge/curated/`, this repo's
own directory of the same name) beside a disposable generated export, an
allowlisted fail-closed sync fed by an isolated staging directory (`awcms`'s
`graphify-out/obsidian-staging/`; this repo's own staging path serves the
same role), and a generated directory neither repo tracks in full — `awcms`
excludes `knowledge/generated/*` in its own `.gitignore`, keeping only a
tracked README so the directory does not read as empty in a fresh checkout,
an idea this repo is adopting too (see Consequences). The convergence is
evidence the design below was the right one to build without waiting, not
evidence that waiting would have cost nothing — see Rejected.

### Four points of this repo's own shape that `awcms-one`'s design does not fit

1. **No subtree, no federation.** `awcms-one` builds a second graph over
   `apps/cms` and merges the two on demand. This repo has nothing analogous to
   merge with — one graph, over one tree, is the whole scope.
2. **A generated Obsidian vault here is much larger relative to what this repo
   would ever want committed.** A full export of this repo's graph is roughly
   1520 files. This repo already refuses to track `graphify-out/graph.html`
   ("a committed copy rots silently, and its size doubles every rebuild's load
   on history") and `redesign/` ("this repo tracks no archives") for reasons
   that apply even harder to a 1520-file vault.
3. **This repo already has a translation-mirror rule (ADR-0039) `awcms-one`
   does not carry in the same shape**, and that rule's own exclusion of
   `*.id.md` from the graph (to avoid indexing the same content twice) is the
   same reasoning a generated developer-navigation directory needs applied to
   itself.
4. **The issue's own text names a gate (`knowledge:graph:check`) that would
   duplicate `audit:graf`'s job**, and the issue instructs against exactly
   that ("integrate them with current `audit:graf` conventions rather than
   creating redundant gates").

### Community detection here is not deterministic, and that breaks the upstream naming loop

Measured directly on this repo's own graph, not suspected: run three times in a
row over a byte-identical `graph.json` (1404 nodes, 2717 edges, no file changed
between runs), `graphify cluster-only .` produced **92, then 90, then 91**
communities. The naming loop `graphify` documents upstream — edit
`.graphify_labels.json`, then re-run `cluster-only` to apply it — assumes the
partition a name was chosen against is still the partition the name lands on.
It is not: a `cluster-only` run both applies labels and re-clusters, and
because labels are keyed by community id, a run that changes the id-to-member
mapping silently re-attaches every curated name to a different community. That
is the exact mechanism behind this repo's own recorded incident, named above,
of 60 of 101 labels sitting on the wrong community inside valid JSON with
every other gate green — the loop that was supposed to fix a wrong label is
the same loop capable of causing it again on the very next run.

## Decision

**This repo adopts `awcms-one`'s Graphify + Obsidian workflow shape — a
generated graph, hand-written curated notes, an Obsidian export behind a
validated allowlist sync, and an `audit:graf` gate that needs no `graphify`
install — while diverging from it in the four places its own design does not
fit this repo, and stating each divergence in writing rather than silently.**

### 1. `knowledge/generated/` is gitignored here, never tracked

Diverging from `awcms-one`, which tracks its equivalent directory. A full
export is ~1520 files; this repo's own precedent for refusing to track a
graph artefact of comparable churn (`graphify-out/graph.html`) and any
archive-shaped directory (`redesign/`) applies here with more force, not
less. `audit:graf` gains a fail-closed check that nothing under
`knowledge/generated/` is ever git-tracked.

### 2. Bounded content staleness is adopted, with a concrete bound

`audit:graf` re-derives the same `md5` content hash `graphify` itself already
records per file in `manifest.json`'s `ast_hash` field, compares it against
the currently tracked, in-scope tree, and fails once drift (changed + added +
removed) exceeds `MAX_STALE_FILES = 40`. Verified directly against this
repo's own tree before adoption: graphify's hash reproduces exactly under
`node:crypto` with no `graphify` install, no Python, and no network — 195 of
219 manifest entries matched on the day this was checked, with the remaining
drift (24 changed, 4 added, 0 removed) comfortably under the bound.

### 3. Four new `package.json` scripts, and the fourth is not the one the issue named

`knowledge:graph:update`, `knowledge:obsidian:export`, `knowledge:check` (an
alias for `bun run audit:graf`), and — added once the non-determinism above
was measured — `knowledge:graph:label`. It is not `knowledge:graph:check` from
the original issue text; see Rejected for why that one is still refused.
`knowledge:graph:label` does a different job from the other three: it applies
curated `community_name` values to whatever partition `knowledge:graph:update`
last wrote, reading `graph.json` and `graphify-out/.graphify_labels.json` and
writing back to both plus `GRAPH_REPORT.md`, without invoking `graphify` and
without ever touching `node.community`. Splitting it out of
`knowledge:graph:update` is what makes the separation in the next item
possible — one script that clusters, a second that names, so that a run of the
first is never also, silently, a run of the second.

### 3a. Update decides the partition; label decides the names — never the same run

The naming loop above cannot converge as long as one command both re-clusters
and re-labels. So `bun run knowledge:graph:update` owns the **partition** (it
extracts and clusters, and moving communities is its job, not a defect), and
`bun run knowledge:graph:label` owns the **names**, applied to whatever
partition is on disk right now. Between the two, a human reads
`graphify-out/GRAPH_REPORT.md` against the membership it describes and writes
names into `graphify-out/.graphify_labels.json` — an ordering that makes a
curated name mean something, because it is chosen against a membership that is
still there when the name lands. `knowledge:graph:label` is fail-closed: a
name that is missing, filename-shaped, a `Community N` placeholder, empty, or
duplicated refuses the ENTIRE run and writes nothing, so a partial application
— some communities named, some inherited, with nothing on its face saying
which is which — cannot happen. It writes
`graphify-out/.graphify_labels.json.sig` (per-community membership
fingerprints, in `graphify`'s own format, reproduced with `node:crypto`) LAST,
after every name is accepted, so a refused run never leaves a signature
claiming a partition was curated when it was not.

### 4. `knowledge/**` is English-only, with no `.id.md` mirror

Diverging from every other document in `docs/**` and every root SHOUTING
file, which keep ADR-0039's mirror requirement unchanged — and diverging from
`awcms` itself, whose `awcms` ADR-0124 mirrors its knowledge tree into
Indonesian (`knowledge/README.id.md`, `knowledge/curated/*.id.md`).
`knowledge/` is a developer navigation layer over the code, not product or
process documentation — the same category the translation gate's own
`isInScope` function already excludes (it scopes to `docs/**`,
`.claude/skills/**`, `.changesets/README.md`, and root SHOUTING files only).
Mirroring it would recreate, at the level of prose, exactly the duplication
`*.id.md` mirrors are already excluded from the GRAPH itself to avoid
(`.graphifyignore`'s own stated reasoning): a second copy of the same fact
that can silently drift from the first while a hash-based gate reports it as
still current. The reason this repo's answer differs from `awcms`'s is
specific to being a TEMPLATE, not a single product repo: every site derived
from this repo is expected to rewrite its own curated notes for its own
codebase, and mirroring would double that rewrite burden for each derived
site, whereas `awcms` mirrors once, for itself.

### Placement follows this repo's own conventions, not `awcms-one`'s

Scripts in `scripts/`, pure logic in `scripts/lib/` — there is no `tools/`
and no `packages/` directory here, so nothing is placed in either.

## Consequences

- **A developer or an agent gets a faster way to orient in this codebase**
  without that aid ever being treated as ground truth — every curated note
  and every README section that makes a factual claim links to the `AGENTS.md`
  section, ADR, or test file that is actually authoritative, rather than
  restating it.
- **`knowledge/generated/` can grow and shrink freely between machines**
  without touching this repo's git history — the cost of that freedom is that
  a fresh clone has no generated vault until someone runs
  `knowledge:obsidian:export` locally, which is the correct cost for content
  this repo has already decided archives and rot-prone artefacts do not
  belong in history.
- **The staleness bound is a real, currently-measured number, not an
  arbitrary round one** — `MAX_STALE_FILES = 40` was chosen against this
  repo's own drift at adoption time (28, comfortably under), not copied from
  `awcms-one` without checking it fits.
- **This repo's divergences from `awcms-one`'s design (D2/D4/D6/D7 in this
  issue's own working notes, folded into three above once D6 — the
  ignore-file wiring — is counted as consequence of D2 rather than a separate
  design choice) are divergences from prior art in a sibling repo, not from a
  family standard.** Now that `awcms` ADR-0124 has landed, one of those D-items
  turns out not to be a divergence at all: not tracking `knowledge/generated/`
  AGREES with `awcms`, whose own `.gitignore` excludes `knowledge/generated/*`
  bar one tracked README, for the same regenerable-artefact reasoning this ADR
  gives — nothing there needs recording anywhere. **The one divergence that
  remains from `awcms` itself is language**: `awcms` mirrors its knowledge
  tree into Indonesian; this repo keeps `knowledge/**` English-only, for a
  reason specific to being a TEMPLATE (Decision item 4). That single
  divergence needs recording in `awcms`'s own `awcms-family-compatibility.yaml`
  (`awcms` ADR-0068), and this repo cannot write that file itself — what can
  be done here, and is done by this ADR, is stating the difference and the
  reason for it in writing, exactly the path ADR-0034 already used for its own
  family divergences.
- **`awcms#805` has already landed, as `awcms` ADR-0124, in independent
  agreement with the design below** rather than a different canonical shape
  this workflow would need to revisit — consistent with ADR-0027's answer that
  "needs an `awcms` instance to prove its calls are right" was a reason to
  wait only for work that actually calls `awcms`; this workflow makes no such
  call, and the wait it declined to take was never on the critical path of
  correctness here.
- **This repo is adopting `awcms` ADR-0124's tracked-README idea for its own
  generated directory** — `knowledge/generated/README.md`, kept tracked and
  exempted from `audit:graf`'s untracked-directory check, so a fresh checkout
  does not read `knowledge/generated/` as empty or missing.
- **What this ADR does NOT prove:** that the graph or its curated notes are
  complete, that every fact in them stays correct as the code changes (only
  bounded, not eliminated, by the staleness gate), or that Obsidian-specific
  export correctness (rendering, backlinks, canvas layout) works beyond what
  `scripts/lib/obsidian-safety.mjs`'s file-classification rules can check
  from file paths and extensions alone.

## Rejected

- **Tracking `knowledge/generated/` in git, matching `awcms-one`.** Rejected
  in §Decision item 1 above: the same reasoning this repo already applied to
  `graphify-out/graph.html` and `redesign/` applies here with more force, on
  a directory an order of magnitude larger than either.
- **Adding a separate `knowledge:graph:check` gate, as the original issue
  text named.** It would read the same committed artefacts `audit:graf`
  already reads, producing two gates that could disagree about the same
  facts — precisely the redundant-gate shape the issue itself warns against.
  `knowledge:check` is an alias for `audit:graf`, not a new check.
- **Pointing `graphify export obsidian --dir` straight at a contributor's own
  human vault.** The export must land in a staging directory first and be
  validated before anything is synced — writing directly into a live vault
  would let one malformed export overwrite or corrupt notes a human
  maintains by hand, with no chance to abort partway through.
- **Mirroring `knowledge/` into Indonesian per ADR-0039.** Rejected in
  §Decision item 4: it is outside that ADR's own documented scope, and
  mirroring it would introduce the exact duplication risk this workflow
  exists to avoid inside the graph itself.
- **Re-running `graphify cluster-only` to apply a curated name, as `graphify`
  documents upstream.** Rejected once measured rather than assumed: three
  consecutive `cluster-only` runs over a byte-identical graph (1404 nodes,
  2717 edges) produced 92, then 90, then 91 communities, so the loop cannot
  converge here — every run that applies a name also re-partitions the graph
  the name was chosen against, and because names are keyed by community id, a
  changed partition silently re-attaches every name to a different community.
  `knowledge:graph:label` replaces it precisely because it reads and writes
  `graph.json` without invoking `graphify` at all, so applying a name can
  never itself be the act that invalidates it.
- **Waiting for `awcms#805` before doing any of this.** At the time this ADR
  was written there was no committed timeline for that issue, and this
  workflow makes no call to `awcms` and reads no `awcms` contract — the "wait
  for a stable contract" reasoning that correctly holds other work in this
  repo (ADR-0023, ADR-0027) does not apply to a workflow that never touches
  `awcms` at all. This rejection reads stronger in hindsight, not weaker:
  `awcms#805` closed as `awcms` ADR-0124 one day before this ADR's own date,
  landing independently on the same shape — a dedicated `knowledge/` vault,
  curated notes beside a disposable generated export, an allowlisted
  fail-closed sync fed by an isolated staging directory. Waiting would have
  cost roughly a day and produced the design already chosen here; the
  agreement is evidence the design was right, not proof that waiting would
  have been free.
