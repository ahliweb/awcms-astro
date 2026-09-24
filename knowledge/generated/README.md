# Generated knowledge — machine output, never hand-edited

Everything under this directory except this file is written by
`bun run knowledge:obsidian:export` and is **not tracked by git**. If you have
just cloned this repo, the directory is empty apart from this README, and that
is the correct state — not a missing download.

## Why nothing here is committed

One full export of this repo's graph is roughly 1,500 files: one Obsidian note
per graph node, plus one per community, plus a canvas. Committing that would
repeat two mistakes this repo has already refused by name in
[`.gitignore`](../../.gitignore) — `graph.html` ("a committed copy then rots
silently, and its size doubles every rebuild's load on history") and
`redesign/` ("this repo tracks no archives"). A 1,500-file vault fails both
tests harder than either.

`bun run audit:graf` makes that fail-closed rather than conventional: anything
git-tracked under `knowledge/generated/`, other than this README, reddens the
gate. The same check refuses any tracked `.obsidian/` path anywhere in the repo,
because that is the Obsidian app's own per-machine workspace state.

This is also what [`ahliweb/awcms`](https://github.com/ahliweb/awcms) does for
its own vault (its ADR-0124), including keeping a tracked README here for
exactly this reason. It is the one place this workflow deliberately differs from
`ahliweb/awcms-one`, which tracks its generated notes.

## How to fill it

```bash
bun run knowledge:graph:update      # rebuild the graph (needs graphify on PATH)
bun run knowledge:graph:label       # apply curated community names, no re-clustering
bun run knowledge:obsidian:export   # stage, validate, sync the allowlisted result here
```

Then open `knowledge/` — not the repository root — as an Obsidian vault.

The export never writes here directly. graphify writes into an isolated,
gitignored staging directory first; every file it produced is then validated,
and only allowlisted `.md`/`.canvas` files are copied in. A symlink, an
unexpected extension, a path that escapes staging, or a name colliding with a
hand-written file in [`../curated/`](../curated/) aborts the **whole** sync
rather than writing a partial one. See
[`../README.md`](../README.md) for the full boundary and
[`../../docs/adr/0051-a-knowledge-tree-points-at-the-code-and-owns-none-of-it.md`](../../docs/adr/0051-a-knowledge-tree-points-at-the-code-and-owns-none-of-it.md)
for why it is shaped this way.

## Two rules for anyone — human or agent — reading notes from here

1. **Never hand-edit a file in this directory.** The next export overwrites it,
   and an edit that disappears silently is worse than one that was refused.
   Corrections belong in [`../curated/`](../curated/) or in the code the note
   describes.
2. **A note is a pointer, not an authority.** It is derived from a graph built
   at one moment, and this repo's contract lives in its code, its tests, and its
   ADRs. Verify anything you are about to act on against those.
