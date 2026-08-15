🇬🇧 English (source) · 🇮🇩 [Bahasa Indonesia](README.id.md)

# Changesets

One file per change, written in the same iteration as the change itself. The purpose is simple: when a release is versioned, its notes already exist and were written by the person who understood the context best — not reconstructed from `git log` months later.

## When one is required

A change affecting public content, structure, dependencies, or deployment. A typo fix with no change of meaning does not need one.

## Format

File name: `YYYY-MM-DD-summary-in-kebab-case.md`.

```markdown
---
tipe: konten | struktur | perbaikan | dependency | dokumentasi
dampak: publik | internal
---

# A short title

What changed and **why**. The "why" is the valuable half —
the "what" can be read from the diff, the "why" cannot.

- A point of change a site's reader would see.
- A point of change only felt while developing.
```

## Notes

Files here are folded into [`CHANGELOG.md`](../CHANGELOG.md) by `bun run release`, then deleted. Their titles are demoted two levels so they nest neatly under the version heading.

**This rule is now guarded.** `bun run audit:dokumen` resolves every link from the location of the file containing it, so `../docs/adr/x.md` here passes and `docs/adr/x.md` is red — with no special rule for this directory.

**Relative links are written from the point of view of `.changesets/`.** The release script rewrites those paths to the repo root's point of view as it folds them — `../docs/adr/x.md` becomes `docs/adr/x.md`. Before that existed, every relative link was off by one level once folded, and the defect only showed up in CI: the audit gate runs **before** the changesets are folded, so the broken file did not yet exist when the audit looked at it.

Changesets themselves are **not** mirrored into Indonesian, unlike the rest of the documents here ([ADR-0039](../docs/adr/0039-english-is-the-source-language.md)): they are ephemeral by construction — folded into the changelog and deleted on release — so a mirror would outlive its source by exactly one release. This README is a document like any other, and is mirrored.
