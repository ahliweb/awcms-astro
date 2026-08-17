🇬🇧 English (source) · 🇮🇩 [Bahasa Indonesia](README.id.md)

# Changesets

One file per change, written in the same iteration as the change itself. The purpose is simple: when a release is versioned, its notes already exist and were written by the person who understood the context best — not reconstructed from `git log` months later.

## When one is required

A change affecting public content, structure, dependencies, or deployment. A typo fix with no change of meaning does not need one.

## Format

File name: `YYYY-MM-DD-summary-in-kebab-case.md`.

```markdown
---
bump: major | minor | patch
tipe: konten | struktur | perbaikan | dependency | dokumentasi
dampak: publik | internal
---

# A short title

What changed and **why**. The "why" is the valuable half —
the "what" can be read from the diff, the "why" cannot.

- A point of change a site's reader would see.
- A point of change only felt while developing.
```

## `bump` decides the version ([ADR-0040](../docs/adr/0040-changeset-menyatakan-bump-semver.md))

This is the field the release reads. The next version is the **largest** `bump` among the waiting changesets: one `minor` beside nine `patch` entries makes the whole release `minor`.

| `bump` | For a site, that means | Example |
| ------- | ----------------------- | -------- |
| `major` | a public URL, the content structure, or the frontmatter contract **breaks** | a tab slug changes, so every link to it 404s |
| `minor` | something a reader gains: a new article, tab, locale, or feature | a `news` section appears |
| `patch` | a fix that does not change the shape of the site | a typo, a style, a dependency, documentation, a corrected response header |

Choose it **while writing the change**, which is the only moment anyone knows the answer. Before ADR-0040 the level was typed at the command line at release time, by whoever happened to run the script — often months later, often not the author, and always from a list of file names rather than from the change itself.

Two rules follow from `bump` being load-bearing, and both are gated by `tests/versi-changeset.test.mjs`:

- **A changeset without a valid `bump` fails the gate.** Not because the field is mandatory paperwork, but because the failure it prevents is invisible: a changeset the release cannot read stops contributing to the version and nothing looks wrong.
- **`bun run release` may be told a level, and it may only be a LARGER one.** A releaser who knows the change is bigger than its changesets admit may say so; a smaller one is refused, because it publishes a break behind a number promising there is none.

Versions are `MAJOR.MINOR.PATCH`, tagged `vX.Y.Z`. The repo is still `0.x`, where semver itself makes no compatibility promise — `bump` records intent now so that the record is already true when `1.0.0` makes it binding.

## Notes

Files here are folded into [`CHANGELOG.md`](../CHANGELOG.md) by `bun run release`, then deleted. Their titles are demoted two levels so they nest neatly under the version heading.

**This rule is now guarded.** `bun run audit:dokumen` resolves every link from the location of the file containing it, so `../docs/adr/x.md` here passes and `docs/adr/x.md` is red — with no special rule for this directory.

**Relative links are written from the point of view of `.changesets/`.** The release script rewrites those paths to the repo root's point of view as it folds them — `../docs/adr/x.md` becomes `docs/adr/x.md`. Before that existed, every relative link was off by one level once folded, and the defect only showed up in CI: the audit gate runs **before** the changesets are folded, so the broken file did not yet exist when the audit looked at it.

Changesets themselves are **not** mirrored into Indonesian, unlike the rest of the documents here ([ADR-0039](../docs/adr/0039-english-is-the-source-language.md)): they are ephemeral by construction — folded into the changelog and deleted on release — so a mirror would outlive its source by exactly one release. This README is a document like any other, and is mirrored.
