🇬🇧 English (source) · 🇮🇩 [Bahasa Indonesia](0031-sbom-cyclonedx-dari-lockfile-pada-rilis.id.md)

# ADR-0031 — A CycloneDX SBOM derived from `bun.lock` on every release

- **Status:** Accepted
- **Date:** 5 August 2026
- **Owner's rule:** 5 August 2026 — "carry on and act on all the recommendations."
- **Related:** [ADR-0028](0028-jangkar-standar-performa-dan-keamanan.md) (gap 9, closed here), [ADR-0030](0030-aturan-tertulis-mendapat-pemeriksanya.md) (a rule without a checker will be broken — including a release step), `awcms` [ADR-0068](https://github.com/ahliweb/awcms/blob/main/docs/adr/0068-family-standards-posture-editions-and-recorded-divergences.md) (the family standards posture)

## Context

Gap 9 of [ADR-0028](0028-jangkar-standar-performa-dan-keamanan.md): a tagged
release with no SBOM, so a downstream consumer reading a new advisory cannot
answer "is release vX.Y.Z affected?" without checking out the tag and rebuilding
its dependency tree themselves (NIST SSDF PS.2).

That gap was originally held with the reasoning "a tooling decision is better
taken once for both family repos". What changed the arithmetic: every datum an
SBOM needs — name, exact version, integrity hash — **is already in `bun.lock`**,
and the available third-party generators do not read it (they read
`package-lock.json`, which this repo does not have). The tooling decision turned
out not to be "which generator do we install" but "which format do we write" —
and the second was already answered by the standards anchor that exists.

## Decision

`scripts/sbom.mjs` derives **CycloneDX 1.5 JSON** from `bun.lock` +
`package.json`, written to `sbom.cdx.json` at the repo root. `scripts/rilis.mjs`
runs it **before the release commit**, so the SBOM travels inside the tag.

Three decisions about its shape:

1. **CycloneDX, not SPDX.** This repo's security posture is anchored to OWASP
   (ADR-0028); CycloneDX is an OWASP format and is designed for application
   SBOMs. One family of references, not two.
2. **Written here, with no new dependency.** Adding a dependency to the step
   whose job is to inventory dependencies is a real supply-chain irony: the
   generator itself becomes a surface that has to be pinned, audited, and put in
   an SBOM. All of its work is shape translation, ~100 lines.
3. **Deterministic** — no timestamp, no serialNumber, components sorted.
   Regenerating on the same tag produces identical bytes, so a tag's SBOM can be
   **verified** to be derived from the `bun.lock` beside it, rather than merely
   trusted.

**Its checker** (`tests/sbom.test.mjs`, per the ADR-0030 rule) guards two things:
that the generator is correct — proven in both directions over a synthetic
lockfile (scoped packages, base64→hex hash conversion, deduplicated resolution
paths, an unknown entry REFUSED rather than skipped) — and that the step in the
releaser cannot disappear silently (a structural assertion over
`scripts/rilis.mjs`, the same pattern as `tests/versi-toolchain.test.mjs` reading
`ci.yml`).

**What is deliberately NOT gated: the freshness of `sbom.cdx.json` in the working
tree.** An SBOM describes a RELEASE. Between two releases it may lag behind
`bun.lock`; a gate demanding the two always agree would turn every dependency
bump PR red, and a gate that expensive gets loosened within a month.

## Consequences

**What is gained.** SSDF PS.2 is met in a form that can be verified; gap 9 is
closed together with its checker; zero new dependencies.

**What is paid.** One generated file joins the history from the first release
onward, and the `bun.lock` format becomes a contract read by two scripts
(`cek-lockfile`, `sbom`) — if Bun changes it, both change together, and a
generator meeting an unknown shape **fails hard** rather than writing an
incomplete SBOM.

**For the family.** The format decision (CycloneDX) is worth following in `awcms`
when it closes its own SBOM gap; this script cannot be copied over as-is (its
lockfile and release process differ), but all three of its shape decisions are
fully portable. Recorded here so the decision is taken once — as `awcms` ADR-0068
does for edition pinning.

## Alternatives considered

- **SPDX.** Refused: two reference families for one posture. GitHub uses SPDX for
  its dependency-graph export — and that stays available to anyone without a
  single line in this repo, so choosing it here adds nothing.
- **A third-party generator (`cyclonedx-npm` and its relatives).** Refused: it
  reads a `package-lock.json` that does not exist, and it adds a dependency to
  the step that inventories dependencies.
- **An SBOM always in sync in the working tree (committed on every bump).**
  Refused: it turns every Dependabot PR red, and its gate would get loosened —
  see §Decision.
- **The SBOM as a GitHub Release asset.** Refused: this repo's releases are
  annotated git tags, not GitHub Release objects; adding a second publication
  path for one file means two places that can disagree.
