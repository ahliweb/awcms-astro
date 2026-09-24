🇬🇧 English (source) · 🇮🇩 [Bahasa Indonesia](0052-github-releases-are-part-of-this-repos-release-convention.id.md)

# ADR-0052 — GitHub Releases are part of this repo's release convention

- **Status:** Accepted
- **Date:** 24 September 2026
- **Supersedes:** one rejected-alternative bullet of [ADR-0031](0031-sbom-cyclonedx-dari-lockfile-pada-rilis.md) — "the SBOM as a GitHub Release asset" — not that ADR as a whole. ADR-0031's SBOM decision (CycloneDX derived from `bun.lock`, written before the release commit) stands entirely and its Status stays `Accepted`.
- **Related:** [ADR-0031](0031-sbom-cyclonedx-dari-lockfile-pada-rilis.md) (the claim this ADR corrects), [ADR-0030](0030-aturan-tertulis-mendapat-pemeriksanya.md) (a written rule gets its checker — the rule this ADR applies to itself), [ADR-0048](0048-a-release-is-cut-when-the-backlog-crosses-a-bound.md) (the backlog bound — the other half of `audit:rilis`), [ADR-0040](0040-changeset-menyatakan-bump-semver.md) (a changeset declares its own bump — the version `rilis.mjs` computes before printing the Release command), `awcms` ADR-0119 (`--latest` must be written explicitly rather than inherited from `gh`'s date-and-version default — the lesson this repo already absorbed and is now acting on)

## Context

### The written claim

[ADR-0031](0031-sbom-cyclonedx-dari-lockfile-pada-rilis.md)'s own
rejected-alternatives list states, about attaching the SBOM as a Release
asset: "this repo's releases are annotated git tags, **not** GitHub Release
objects; adding a second publication path for one file means two places that
can disagree." The v0.5.x `CHANGELOG.md` entry absorbing `awcms` ADR-0119
restates the same claim in stronger terms — "`bun run release` makes a git tag
only — this repo does not publish GitHub Releases" — and adds that it should
be re-read "when this repo has its own release flow."

### The claim was false, and had been for a while

Seven GitHub Releases exist right now: `v0.2.0` through `v0.6.0`. All seven
were created **by hand**, by a human running `gh release create` after
pushing a tag — never by `scripts/rilis.mjs`, which has only ever printed
`git push && git push origin <tag>` and stopped there. At one point the
Releases list sat **three versions behind** the tags before anyone noticed,
on a repo whose every other gate stayed green throughout, because no gate
read `.changesets/`, `git ls-remote`, or the GitHub Releases API for anything
to do with Releases at all.

### This is the "looks guarded but is not" shape, pointed the other way

`AGENTS.md` names this shape repeatedly — a rule that reads settled while
nothing checks it drifts silently. Every prior instance in this repo was a
rule that had no practice behind it yet (a count that decayed, a convention
with no gate). This one inverts the direction: the **practice** — seven
Releases, created deliberately and repeatedly by the repo's own maintainer —
had already overruled the **written decision** seven times over, and the
written decision kept being read as current because nothing compared it
against what actually happened on GitHub. A decision that reads settled while
practice has already moved on seven times is not a decision that was merely
forgotten; it is a decision that was quietly voted down by every release
since `v0.2.0`, without anyone writing that vote down.

### The repo owner's decision

GitHub Releases **are** part of this repo's release convention, not an
optional flourish a human adds when they remember to. Per
[ADR-0030](0030-aturan-tertulis-mendapat-pemeriksanya.md) — "a written rule
gets its checker" — the convention now brings its checker rather than staying
a sentence someone has to remember to reread.

## Decision

### `scripts/rilis.mjs` prints the `gh release create` command; it does not run it

The releaser writes the folded release notes to a temp file
(`os.tmpdir()`, not a repo path — this is not a release artefact the SBOM
already is, and it has no reason to be committed or to outlive the run) and
prints a ready `gh release create <tag> --verify-tag --latest --title "<tag>
— <title>" --notes-file <path>` command as the next step, in both the
`--commit` and non-`--commit` branches, after the `git push` line. `--latest`
is written explicitly — the `awcms` ADR-0119 lesson this repo already
recorded and parked, and this is the moment of acting on it rather than
merely citing it again.

### `scripts/audit-rilis.mjs` gains a fourth check: every remote tag has a matching Release

Reading `git ls-remote --tags origin` and the public, unauthenticated GitHub
Releases API for the configured repo slug, comparing the two, and reporting
any tag present on the remote with no Release carrying its name. It fails
**closed**: no git remote, no network, or a non-`ok` response is a `note()`
saying the check did not run — never a silent pass, and never treated as a
violation. This is the same shape as check 2 of `audit-serapan.mjs`, and for
the same reason — a runner with no outbound network is a normal environment,
not a failure worth reddening a build over.

The comparison itself lives in `scripts/lib/tag-rilis.mjs` as two pure
functions, `tagRilisSah` (a strict `vX.Y.Z` tag pattern) and `tagTanpaRilis`
(remote tags minus Release names), covered by sixteen tests in
`tests/tag-rilis.test.mjs` that need no network — the same separation
`scripts/lib/git.mjs` already draws between the shell boundary and the logic
it feeds.

**No floor was added.** All seven existing tags already have a matching
Release at the moment this check was written, verified with `gh release
list` against `git ls-remote --tags origin` before the code landed — so the
gate is born **green**, not yellow with a bound someone has to remember to
lower later. A floor would only be a place for a future gap to hide below;
this repo has already watched one convention drift silently once, and is not
building a second place for the same failure to hide.

## Consequences

- The gap between what this repo **says** about Releases and what it
  **does** closes, and closes with a checker rather than with a sentence.
- `bun run audit:rilis` now prints, on a healthy repo: "rilis GitHub: 7 tag
  diperiksa terhadap 7 GitHub Release, semua cocok."
- A future tag pushed without its Release turns `audit:rilis` red the next
  time anyone runs it — informing, not blocking, since `main` carries no
  required checks — rather than staying invisible until a human happens to
  compare two lists by eye again.
- `docs/awcms-astro/standar-teknis.md` and its quality-gates table now
  describe the actual four-part shape of `audit:rilis` and the actual release
  flow (tag → push → `gh release create`, printed not run), rather than the
  tag-only story ADR-0031's rejected alternative told.
- ADR-0031 itself is not rewritten. Its SBOM decision — CycloneDX from
  `bun.lock`, written before the release commit, deterministic, no new
  dependency — is unaffected by any of the above and keeps its `Accepted`
  status; only the one sentence claiming this repo publishes no GitHub
  Releases is superseded, with a pointer left at that bullet.

## Rejected

- **Having `rilis.mjs` run `gh release create` itself.** Refused for the
  reason the releaser's own comments already give for not pushing: the
  script deliberately never pushes a commit or a tag (see its §Prerequisites
  comment), and `--verify-tag` refuses a tag that is not yet on the remote.
  Running the command here would mean either pushing to satisfy
  `--verify-tag` — crossing a boundary the releaser holds on purpose — or
  calling a command certain to fail against a tag that is not there yet.
  Printing the command as the next manual step keeps the same boundary
  `git push` already sits behind.
- **A floor on which tags the gate checks** (for example, "only tags from
  `v0.7.0` onward"). Refused: every tag this repo has ever pushed already
  complies, so a floor would not close a real gap — it would only create a
  band below which a future drift could hide unseen, which is exactly the
  failure mode this ADR exists to close, not reproduce in a new shape.
- **Attaching the SBOM as a Release asset.** Still refused. ADR-0031's
  reasoning — a second publication path for one file means two places that
  can disagree — survives this ADR intact: `sbom.cdx.json` already travels
  inside the tag, verifiable against the `bun.lock` beside it, and adding a
  Release-asset copy would only create a second copy that could drift from
  the first with nothing reading the difference. This ADR corrects a claim
  about **whether Releases exist**, not the reasoning about **what belongs
  attached to one**.
