🇬🇧 English (source) · 🇮🇩 [Bahasa Indonesia](0040-changeset-menyatakan-bump-semver.id.md)

# ADR-0040 — A changeset declares its own semver bump

- **Status:** Accepted
- **Date:** 17 August 2026
- **Supersedes:** nothing. Narrows the release procedure of [ADR-0031](0031-sbom-cyclonedx-dari-lockfile-pada-rilis.md), which keeps every other step it defines.

## Context

Versions here are `MAJOR.MINOR.PATCH`, tagged `vX.Y.Z`. That part was never in
doubt. What was missing is where the number comes from.

Until this decision the level was an argument: `bun run release patch`. The
person who typed it was whoever ran the release, at release time, choosing one
word for a batch of ten changes by reading a list of **file names**. The person
who actually knew whether a change broke a public URL was the author, months
earlier, and the format gave them nowhere to write it down.

Meanwhile the changeset format did carry two fields — `tipe` and `dampak` — and
**nothing on earth read them.** `scripts/rilis.mjs` stripped the frontmatter
with one regex and discarded it; no gate opened `.changesets/` for anything but
dead links. Ten changesets had filled the fields in faithfully, and no reader
of any kind had ever consumed one. A field nobody reads is wrong as often as it
is right, and nobody finds out.

Two further defects sat in the same few lines and are worth naming, because
they are what a version model is supposed to prevent:

1. **The arithmetic could not fail.** `pkg.version.split('.').map(Number)`
   answers something for every string. Run against the versions a repo drifts
   into, it produced `v0.2.NaN` for `0.2.0-rc.1`, `v1.0.NaN` for `1.0`, and
   `vNaN.2.1` for `v0.2.0`. A tag named `v0.2.NaN` sorts nowhere under
   `--sort=v:refname`, so the *next* release reads a different tag as latest —
   the damage outlives the run that caused it.
2. **The pending-changeset filter compared against one exact name**
   (`f !== 'README.md'`), so `README.id.md` counted as a changeset. The next
   release would have folded the directory's own Indonesian README into
   `CHANGELOG.md` and then deleted it.

## Decision

**A changeset declares `bump: major | minor | patch` in its frontmatter, and
the release derives the version from the largest bump among those waiting.**

- `major` — a public URL, the content structure, or the frontmatter contract
  breaks.
- `minor` — a reader gains something: an article, tab, locale, or feature.
- `patch` — a fix that does not change the shape of the site.

Three consequences, each deliberate:

1. **The judgement moves to the moment it can be made.** An author deciding one
   change's size while writing it is answering a question they can answer. A
   releaser deciding ten changes' size from a file listing is guessing.
2. **A level may still be passed on the command line, and it may only be
   LARGER.** A releaser who knows the release is bigger than its changesets
   admit may say so, and no script can make that judgement for them. Smaller is
   refused: it publishes a break behind a number promising there is none.
3. **Version strings are parsed strictly, or not at all.** `v` prefixes,
   prerelease and build metadata, and leading zeros are refused by name.
   Prerelease *syntax* without a prerelease *policy* produces tags the rest of
   the toolchain cannot order, and this repo has no such policy: there is no
   prerelease level and `CHANGELOG.md` has no section shape for one. Adding one
   later is a decision with its own checker, not a loosened regex.

## Its checker ([ADR-0030](0030-aturan-tertulis-mendapat-pemeriksanya.md))

`tests/versi-changeset.test.mjs`. It proves every waiting changeset carries a
valid `bump`; that the model refuses each of the eight version strings that
previously produced a silent `NaN`; that a bump resets the fields below it
(`1.4.7` minor is `1.5.0`, not `1.5.7`); that the largest pending bump wins and
an unknown level throws rather than being skipped; and that `package.json`,
`CHANGELOG.md`, and the documented vocabulary in
[`.changesets/README.md`](../../.changesets/README.md) still agree.

That last one is the assertion that ages best. The gate accepts a fixed
vocabulary and the README teaches one; when they drift, the contributor
following the README is the one who loses, and nothing else would notice.

`scripts/rilis.mjs` runs the same validator itself, rather than trusting the
gate. The gate catches a malformed changeset when a PR runs; the release
catches one written *after* the last gate ran — and at that moment the mistake
is being used to compute a version.

## What was deliberately NOT decided

- **Not adopted: a tool.** Changesets here stay hand-written markdown folded by
  a script this repo owns. The format's value is the prose, and the prose is
  written by people who understood the change.
- **Not changed: `tipe` and `dampak`.** They remain, now validated instead of
  ignored. They answer *what kind* and *who sees it*; `bump` answers *what it
  costs*, which is a third question and the only one the version depends on.
- **Not changed: their Indonesian vocabulary.** `AGENTS.md` §Language governs
  code — identifiers, comments, gate messages. These are content, in files a
  human writes and reads, and renaming them would rewrite ten changesets and
  both READMEs to no reader's benefit. `bump` is new and takes semver's own
  word, so it needs no translation in either direction.
- **Not resolved: `0.x`.** Semver makes no compatibility promise below `1.0.0`,
  which is where this repo still sits. `bump` records intent now so that the
  record is already true on the day `1.0.0` makes it binding. When to declare
  `1.0.0` is a separate decision and is not taken here.
