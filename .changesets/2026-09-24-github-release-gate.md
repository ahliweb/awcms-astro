---
bump: patch
tipe: struktur
dampak: internal
---

# GitHub Releases become part of the release convention, with a checker

ADR-0031's rejected-alternatives list claimed "this repo's
releases are annotated git tags, not GitHub Release objects" — and the
v0.5.x `CHANGELOG.md` entry absorbing `awcms` ADR-0119 restated the same
claim. It was false, and had been for a while: seven GitHub Releases already
existed (`v0.2.0` through `v0.6.0`), created by hand, and once drifted three
versions behind the tags with every other gate green, because nothing in
this repo read `.changesets/`, `git ls-remote`, or the GitHub Releases API
for anything Release-shaped. Per ADR-0030 ("a written rule gets its
checker"), the repo owner decided GitHub Releases are this repo's
convention rather than a human habit, and the convention now brings its
checker: [ADR-0052](../docs/adr/0052-github-releases-are-part-of-this-repos-release-convention.md).

- `scripts/rilis.mjs` now prints a ready `gh release create --verify-tag
  --latest --title "…" --notes-file <path>` command as the next step after
  `git push`, reading release notes from a temp file it writes alongside the
  folded `CHANGELOG.md` entry. It still never pushes and never runs the
  command itself.
- `scripts/audit-rilis.mjs` gains a fourth check: every `vX.Y.Z` tag on the
  remote must have a matching GitHub Release, compared via
  `scripts/lib/tag-rilis.mjs`'s pure `tagRilisSah`/`tagTanpaRilis` (16 new
  tests, `tests/tag-rilis.test.mjs`). It fails closed on any git or network
  trouble — a note, never a false pass and never a violation — and carries
  no floor, since all seven existing tags already comply.
- This changes no public surface of a derived site, so it is a `patch`; it
  is filed `struktur` because it changes this repo's own release tooling and
  its documented convention, not an article, section, or piece of prose a
  reader would notice.

Documents updated in the same change: `AGENTS.md`/`.id.md` (Definition of
Done gains an `audit:rilis` line naming the Release check),
`docs/awcms-astro/standar-teknis.md`/`.id.md` (the gates table and the
Versioning section now describe the real four-part `audit:rilis` and the
real release flow), `.claude/skills/awcms-astro-gerbang/SKILL.md`/`.id.md`
(the `audit:rilis` row, and the gate-file count moving 44 → 45),
`docs/awcms-astro/checklist-repo-baru.md`/`.id.md` and `README.md`/`.id.md`
(same count), `docs/adr/README.md`/`.id.md` (the new ADR-0052 row), and a
one-line pointer at the now-superseded bullet of ADR-0031 itself — its SBOM
decision is untouched and stays `Accepted`.
