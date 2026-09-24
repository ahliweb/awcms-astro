# Knowledge tree — a navigation aid, never a source of truth

This directory, and the `graphify-out/` graph, `.graphifyignore`, and
`bun run knowledge:*` / `bun run audit:graf` scripts it documents, are this
repo's own Graphify knowledge-graph workflow, added by
[issue #113](https://github.com/ahliweb/awcms-astro/issues/113). It exists to
help a human or an agent find their way around this codebase faster than
`grep` alone — **it is not authoritative about anything it describes.** The
code, the tests, and `AGENTS.md` decide what is true; a graph node, a curated
note, or an exported Obsidian page is a pointer to go verify that, never a
substitute for reading it.

No `.id.md` mirror exists for anything under this directory. See
[§Language and scope](#language-and-scope-why-no-id-md-mirror) for why, and
[ADR-0051](../docs/adr/0051-a-knowledge-tree-points-at-the-code-and-owns-none-of-it.md)
for the decision this whole directory implements.

## Toolchain

Tested against **`graphify` 0.9.35**, installed at `~/.local/bin/graphify`
(not a repo dependency — nothing in `package.json` installs it). `graphify` is
**not installed in CI**, so only the artefact-reading gate (`bun run
audit:graf`) runs there; the two commands that invoke `graphify` itself run
locally only.

| Command | Does | Needs `graphify` on `PATH` |
| --- | --- | --- |
| `bun run knowledge:graph:update` | Rebuilds `graphify-out/graph.json` via `graphify extract . --code-only`, then re-clusters via `graphify cluster-only .` — it owns the PARTITION and is allowed to move communities, because that is its job | yes |
| `bun run knowledge:graph:label` | Applies the curated names in `graphify-out/.graphify_labels.json` to whatever partition is on disk right now — it owns the NAMES, invokes `graphify` not at all, and never rewrites `node.community`. Fail-closed: a missing, filename-shaped, `Community N`, empty, or duplicated name refuses the entire run and writes nothing | no |
| `bun run knowledge:obsidian:export` | Exports the graph to a staging directory, validates every file, and syncs the allowlisted result into `knowledge/generated/` | yes |
| `bun run knowledge:check` | Alias for `bun run audit:graf` — the CI-safe half of this workflow | no |
| `bun run audit:graf` | Reads the already-committed artefacts (`graphify-out/graph.json`, `GRAPH_REPORT.md`, `manifest.json`) and checks the invariants below, including bounded staleness | no |

**`knowledge:graph:check` from the original issue text was deliberately NOT
added.** It would be a second gate reading the same artefacts `audit:graf`
already reads — exactly the redundant-gate shape the issue itself warns
against ("integrate them with current `audit:graf` conventions rather than
creating redundant gates"). The four scripts above are the whole surface;
there is no fifth.

## Community detection is not deterministic — update and label are separate on purpose

Measured on this branch, reproducibly: three consecutive `graphify cluster-only`
runs over a byte-identical graph (1404 nodes, 2717 edges) produced **92, then
90, then 91** communities. Community detection here does not converge on one
partition, so a naming loop that re-runs `cluster-only` to apply a curated name
also re-partitions the very graph it is applying names to — and because names
are keyed by community id, that re-partition silently re-attaches every curated
name to a DIFFERENT community. That is the exact mechanism behind this repo's
own recorded incident: 60 of 101 labels sitting on the wrong community, inside
valid JSON, with every other gate green.

The fix is a separation of duties, not a smarter retry:

- `bun run knowledge:graph:update` decides the **partition** — it extracts and
  clusters, and moving communities is its job.
- `bun run knowledge:graph:label` decides the **names**, applied to whatever
  partition is on disk right now, over `graph.json` alone — it never invokes
  `graphify` and never touches `node.community`.

Between the two, a human reads `graphify-out/GRAPH_REPORT.md`, looks at what
each community actually contains, and writes names into
`graphify-out/.graphify_labels.json`. That ordering is what makes a curated
name mean something: it is chosen against a membership that is still there
when the name lands. `knowledge:graph:label` writes
`graphify-out/.graphify_labels.json.sig` (per-community membership
fingerprints) LAST, only once every name is accepted, so a refused run never
leaves a signature claiming a partition was curated when it was not.

Current state after the rebuild and naming pass that found this: **1404
nodes, 2717 edges, 91 communities**, all 91 names distinct and
content-derived. Before the rebuild it was 1421 / 2603 / 97; the rebuild
itself was code-only and cost 0 tokens.

## Extraction mode: code-only, local, no API key

`bun run knowledge:graph:update` runs `graphify extract . --code-only` —
structural extraction from the local AST, no network call, no provider key
read, for any file, in this workflow's default path. Community **naming** is
a separate step and is non-LLM here too: with no
`GEMINI_API_KEY`/`GOOGLE_API_KEY` configured, `graphify cluster-only` (part of
`knowledge:graph:update`) falls back to deterministic, free hub-based naming.
**Hand-naming happens by editing `graphify-out/.graphify_labels.json`, then
running `bun run knowledge:graph:label` to apply it — not by re-running
`graphify cluster-only`.** Re-clustering to apply a name is not a neutral
step here: this repo's own community detection is not deterministic (see
above), so a `cluster-only` re-run changes the partition the labels are keyed
to, and the names land on the wrong communities. `graph.json` stays generated
output either way; `knowledge:graph:label` is the only step allowed to write
its `community_name` field. Semantic/LLM extraction is opt-in and manual, run
through the interactive `graphify` skill directly by a human's explicit
choice; it is never something any script above does on its own.

## Tracked / untracked

| Path | Contents | Tracked? |
| --- | --- | --- |
| `graphify-out/graph.json` | this repo's graph, code-only AST | yes |
| `graphify-out/GRAPH_REPORT.md` | audit report for the graph | yes |
| `graphify-out/manifest.json` | incremental-update state, including per-file `ast_hash` | yes |
| `graphify-out/cache/`, `graphify-out/.*`, `graphify-out/graph.html`, `graphify-out/[YYYY-MM-DD]/` | build intermediates, visualisation, dated backups | no (root `.gitignore`) |
| `graphify-out/obsidian-staging/` | ephemeral Obsidian export staging | no |
| `knowledge/curated/*.md` | six hand-written files | yes |
| `knowledge/generated/` | the allowlisted Obsidian export of the graph | **no — diverges from the reference workflow, see below** |

**`knowledge/generated/` is gitignored here, and this is a deliberate
divergence from the `awcms-one` design this workflow was ported from**, which
tracks its equivalent directory. Reason: a full export of this graph is
roughly 1520 files. This repo already refuses to track `graphify-out/graph.html`
("a committed copy rots silently, and its size doubles every rebuild's load on
history" — `.gitignore`) and `redesign/` ("this repo tracks no archives" —
`.gitignore`). A 1520-file generated vault fails both of those tests harder
than either exhibit that earned its own refusal. `audit:graf` gains a
fail-closed check that nothing under `knowledge/generated/` is ever
git-tracked, so the divergence is enforced, not merely written down.

## The Obsidian export boundary

`bun run knowledge:obsidian:export` stages the export, **validates every file
it produced, and only then syncs an allowlist of `.md`/`.canvas` files** into
`knowledge/generated/`. The validation logic —
[`scripts/lib/obsidian-safety.mjs`](../scripts/lib/obsidian-safety.mjs) — rejects
a symlinked entry outright, skips anything under an `.obsidian` path segment
or named `.graphify_obsidian_manifest.json`, rejects any extension outside
`.md`/`.canvas`, and rejects a generated filename that would collide with one
already in `knowledge/curated/` (`knowledge/curated/` is read for that
collision check only — the export never writes to it). The whole sync aborts
rather than writing a partial result. [`tests/obsidian-safety.test.mjs`](../tests/obsidian-safety.test.mjs)
proves the classification logic directly; [`tests/knowledge-obsidian-export.test.mjs`](../tests/knowledge-obsidian-export.test.mjs)
proves the export script's wiring against a fixture tree.

## Cross-repo source-of-truth rules

- **`ahliweb/awcms`** is the backend, the domain model, and the system of
  record. Its RBAC/ABAC, its modules, its tenant and content data — none of it
  is re-derived or restated here. A graph node pointing at `awcms` behaviour is
  a pointer to go read that repo, never a cached claim about it.
- **`ahliweb/awcms-astro`** (this repo) is the frontend consumer authority: how
  a build turns `awcms`'s public API into a static site, what this repo's own
  routes, components, and gates do. That is what this graph indexes.
  `AGENTS.md`'s "Where work may land" section is the standing statement of
  which repo owns which questions; this directory does not reopen it.
- **Graphs stay independently rebuildable.** This repo's graph is built from
  this repo's own tree with `graphify extract . --code-only`; it never merges,
  federates, or embeds a graph built elsewhere. There is no combined-graph
  step here, unlike the reference workflow — this repo has no subtree and
  nothing to federate with.
- **No permanent dual copy of a canonical document.** A curated note links to
  `AGENTS.md`, an ADR, or a skill rather than restating its content, for the
  same reason `*.id.md` mirrors are excluded from the graph (`.graphifyignore`):
  a second copy of the same fact drifts from the first, silently, and a graph
  that indexed both would report the drifted copy as if it were still true.
- **This repo diverges from `awcms-one`'s design on purpose in several places**
  (D2/D4/D6/D7 of this issue's own working notes) — divergences from prior art
  in a sibling repo, not from a family standard.
- **`ahliweb/awcms#805` closed as completed at 2026-09-23T22:25:59Z**, landed
  by `awcms` PR #819 and recorded as `awcms` ADR-0124 ("Obsidian opens a
  dedicated `knowledge/` vault, not the repository root"). This repo's
  workflow was built following `awcms-one`'s prior art
  ([issue #11](https://github.com/ahliweb/awcms-one/issues/11)) while
  `awcms#805` was still open, and the two designs converged independently: a
  dedicated `knowledge/` vault, curated notes beside a disposable generated
  export, and an allowlisted fail-closed sync fed by an isolated staging
  directory. **`awcms` does not track its generated vault either** — its
  `.gitignore` excludes `knowledge/generated/*`, keeping only a tracked
  README so the directory does not read as empty in a fresh checkout, which
  this repo now does too (`knowledge/generated/README.md`). So not tracking
  the generated vault is family-consistent, not a divergence — the divergence
  is only from `awcms-one`, which does track its equivalent directory.
- **One real divergence from `awcms` remains, and needs recording in its
  `awcms-family-compatibility.yaml` (`awcms` ADR-0068) — this repo cannot
  write that file itself:** `awcms` mirrors its knowledge tree into
  Indonesian (`knowledge/README.id.md`, `knowledge/curated/*.id.md`); this
  repo keeps `knowledge/**` English-only. The reason is specific to being a
  TEMPLATE: every site derived from this repo is expected to rewrite its own
  curated notes, and mirroring would double that rewrite burden per derived
  site, whereas `awcms` mirrors once, for itself. See
  [ADR-0051](../docs/adr/0051-a-knowledge-tree-points-at-the-code-and-owns-none-of-it.md)'s
  Consequences and Decision item 4 for the full reasoning.

### Worked procedure: verifying a frontend finding that depends on an `awcms` contract

A graph query or a curated note can point at *where* this repo calls `awcms`;
it cannot tell you whether that call is still correct against what `awcms`
actually does today. Whenever a finding here rests on an assumption about
`awcms`'s behaviour — a response shape, a status code, a refusal — verify it
by ending at `awcms`, not at this graph:

1. Check whether the surface is one of the ones this build is allowed to call
   at all: [`tests/kontrak-awcms.test.mjs`](../tests/kontrak-awcms.test.mjs)
   hardens the exact set to three build-time surfaces, plus the reader-browser
   surfaces named in the `awcms-astro-integrasi` skill. A surface outside that
   set is out of contract until `awcms` freezes its response shape there
   (`awcms` ADR-0065) — a finding built on a fourth surface is not yet
   verifiable at all, only speculative.
2. Read the [`awcms-astro-integrasi`](../.claude/skills/awcms-astro-integrasi/SKILL.md)
   skill for the frozen shape of that surface — the rules table and the
   surfaces table are both maintained against `awcms`'s actual, current
   behaviour, not against what this repo's code assumes.
3. If the two disagree, the code is wrong, not the contract: this repo reads
   `awcms`; it does not get to redefine what `awcms` returns.

This is the same discipline `AGENTS.md`'s "One test before starting anything"
section states for any new call: **"the endpoint already exists" is not an
answer of "no."** A knowledge-graph pointer does not change that question.

## Security and privacy: what this workflow considers, and does not certify

These are engineering controls, aligned informally with ISO/IEC
27001/27002/27005/27034/27701 principles. **No certification or formal
compliance with any of those standards is claimed anywhere in this
directory or by this workflow.**

| # | Risk | Control in this repo |
| --- | --- | --- |
| 1 | `.env`, a build token, or another secret gets indexed into the graph | The root `.gitignore`'s `.env`/`.env.*` rules apply to `graphify` too — it reads `.gitignore` before `.graphifyignore` and can only exclude further, never re-include. This repo has no database and no migration dump to leak (`AGENTS.md` §"A backend need becomes a MODULE in `awcms`"). |
| 2 | A document reaches an external model backend during extraction | Off by default: extraction runs `--code-only` (structural AST parsing, no network); no script in this workflow reads `ANTHROPIC_API_KEY`, `OPENAI_API_KEY`, `GEMINI_API_KEY`, or `GOOGLE_API_KEY`. A semantic run is always a deliberate, manual, human-run act through the interactive `graphify` skill — never triggered by `knowledge:graph:update`. |
| 3 | Query logs or extraction caches leak repository context off-machine | `graphify-out/cache/` and every `graphify-out/.*` marker are gitignored and machine-local; never tracked, never synced anywhere by this workflow's scripts. |
| 4 | The Obsidian export overwrites a human's own notes or Obsidian configuration | The stage → validate → allowlist-sync boundary above: a curated-filename collision aborts the whole sync rather than overwriting anything, and `.obsidian/` app-state paths are always skipped, never synced. |
| 5 | Stale generated output is read and acted on as if it were current | `audit:graf`'s bounded staleness check (below) fails the gate once drift between the manifest and the current tree exceeds `MAX_STALE_FILES` — a stale graph cannot sit silently forever. |
| 6 | Prompt injection: indexed content instructs an agent reading the graph | Every node, edge, label, and generated note is repository content an agent reads as **data**, never as an instruction — the same rule this repo already applies to any untrusted CMS content (`AGENTS.md` §"No raw-HTML path from the CMS"). A finding surfaced by a graph query is verified against the real file before anyone acts on it, exactly as this README's opening paragraph states. |
| 7 | Graph or export artefacts inflate a Docker build context, a release tarball, or CI | `graphify-out/` is already excluded from `.dockerignore`; `knowledge/` is added to it too, because `.dockerignore`'s existing `*.md` rule matches root-level files only and would not otherwise exclude a `knowledge/**/*.md` tree. `knowledge/generated/` is untracked (risk #5 above is separate from this one — an untracked directory cannot inflate a release either). |
| 8 | Cross-repo context confuses backend (`awcms`) ownership with frontend (`awcms-astro`) ownership | The graph is built from this repo's own tree only — it never indexes or federates `awcms`'s source. §"Cross-repo source-of-truth rules" above states which repo owns which fact in prose, for the cases a graph edge cannot express (sanctioned vs. accidental coupling, temporary vs. permanent). |

## Language and scope: why no `.id.md` mirror

`docs/**`, `.claude/skills/**`, `.changesets/README.md`, and the root
SHOUTING files (`AGENTS.md`, `README.md`, `CONTRIBUTING.md`, …) are all in
scope for [ADR-0039](../docs/adr/0039-english-is-the-source-language.md)'s
mirror requirement, checked by `scripts/check-docs-translation.mjs`'s
`isInScope`. `knowledge/**` is deliberately outside that scope: it is a
developer navigation layer over the code, not product or process
documentation, and mirroring it would recreate exactly the duplication
`*.id.md` mirrors are excluded from the graph itself to avoid (see
`.graphifyignore`'s own reasoning for that exclusion). `docs/**` and every
root document keep their `.id.md` mirror requirement unchanged — this
carve-out is scoped to `knowledge/` alone.
