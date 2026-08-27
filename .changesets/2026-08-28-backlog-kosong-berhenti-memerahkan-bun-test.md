---
bump: patch
tipe: perbaikan
dampak: internal
---

# An empty backlog stops reddening `bun test`

`tests/versi-changeset.test.mjs` asserted that `.changesets/` holds at least one
entry. The reasoning was sound — an empty directory makes every assertion under
it vacuously true, and a suite that checks nothing reads exactly like a suite
that found nothing (ADR-0030).

But an empty backlog is the state **a release leaves behind**: `bun run release`
folds every changeset into `CHANGELOG.md` and deletes it. The assertion turned
`main` red for the entire window between a release and the next change to land,
which is precisely the window in which nobody has done anything wrong. It was
written on 17 August 2026 and nothing reached the state it forbade until v0.3.0
was cut — the first release since it existed.

The guard it was really built for survives, asked from the other side: a `.md`
file present in the directory and read by no assertion below. Posing the
question in terms of the directory rather than of `isChangesetFile` means a
future narrowing of that filter shows up here as **files silently excluded from
the version**, rather than as nothing at all.

The end-to-end derivation test now returns early on an empty set, and says why:
the arithmetic itself is proven above over inputs the file supplies, and
`bun run release` already refuses "no changesets, no level" at the command
line — where a person can answer it.
