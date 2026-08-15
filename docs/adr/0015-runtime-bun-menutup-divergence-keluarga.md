🇬🇧 English (source) · 🇮🇩 [Bahasa Indonesia](0015-runtime-bun-menutup-divergence-keluarga.id.md)

# ADR-0015 — The Bun runtime: closing the runtime divergence from the AWCMS family

- **Status:** Accepted
- **Date:** 2026-07-29
- **Decision-maker:** the repo owner (@ahliweb), on a direct instruction to
  unify the runtime of both repos
- **Related:** [ADR-0014](0014-rendering-campuran-dan-bff-portal.md) — its item 3
  is **replaced** by this ADR; `ahliweb/awcms` ADR-0002 (Bun-only runtime &
  tooling) and [ADR-0045](https://github.com/ahliweb/awcms/blob/main/docs/adr/0045-jualanku-porting-awcms-system-of-record-astro-bff.md);
  [`docs/awcms-astro/README.md`](../awcms-astro/README.md) §"Deliberate divergence
  from the family".

## Context

The AWCMS family is **Bun-only**: `awcms`, `awcms-mini`, and `awcms-micro` use
Bun as both runtime **and** package manager, with the version pinned in
`packageManager`, `engines.bun`, and `bun-version` in CI.

This repo diverged: Node 22 + npm, `package-lock.json`, `.nvmrc`, and
`actions/setup-node` in CI. That divergence once had a defensible reason — its
output is purely static, there is no server runtime, and Node/npm lowers the
barrier for content contributors who are not developers.

Two things changed the value of that reason:

1. **ADR-0014 brought a server runtime into this repo.** The Jualanku portal
   needs on-demand routes and a BFF, so the "nothing is running" premise stops
   holding for that deployment. ADR-0014 itself chose to hold the runtime at
   Node/npm so that rendering risk and runtime risk would not mix — the right
   choice as a work order, not as a destination.
2. **Two runtimes in one family have a continuing cost.** Every document, gate,
   image, and script has to answer "which one?"; every contributor moving between
   repos switches tooling; and the npm lockfile brings its own class of defect —
   `npm ci` accepts a SUPERSET lockfile with exit 0, which is exactly what
   happened in this repo and gave birth to `scripts/cek-lockfile.mjs`.

## Decision

**This repo uses Bun as its runtime and package manager, from now on, and does
not wait for the portal.** Concretely:

1. `package.json` declares `"packageManager": "bun@1.3.14"` and
   `"engines": { "bun": ">=1.3.0" }`. `engines.node`/`engines.npm` are removed.
2. Every script is run by Bun; the Astro bin is invoked as `bun --bun astro …`,
   following the `awcms` pattern.
3. `package-lock.json` and `.nvmrc` are **deleted**; `bun.lock` becomes the only
   lockfile and must be committed.
4. `scripts/cek-lockfile.mjs` is rewritten for `bun.lock` and still runs
   **before** the install in CI. It keeps two checks `bun install
   --frozen-lockfile` does not give: lockfile identity (`workspaces[""].name` —
   the "lockfile belonging to another repo" defect that really happened) and a
   failure message naming its cause before the network is touched.
5. Unit tests use `bun:test` (`bun test`), replacing
   `node --experimental-strip-types --test`. Bun runs TypeScript directly, so
   that experimental flag is no longer needed.
6. CI uses `oven-sh/setup-bun` with a pinned version, caching
   `~/.bun/install/cache`, `bun install --frozen-lockfile`, `bun test`, and
   `bun audit --audit-level=low`.
7. ~~The production image is built from `oven/bun:1.3.14-alpine`; the runtime
   stage stays unprivileged nginx for as long as the output is static.~~
   **AMENDED BY [ADR-0016](0016-penyajian-bun-di-belakang-traefik-tanpa-nginx.md)
   (31 July 2026):** nginx is dropped from the stack; Bun serves the build output
   behind Traefik/Coolify. The "for as long as the output is static" condition is
   therefore no longer relevant, and the exception weakening this repo's Bun-only
   claim goes with it.
8. Dependabot uses `package-ecosystem: bun` (the pattern `awcms` already uses).
9. **The Bun version is pinned in three places that must move together**: the
   Docker image tag, `packageManager` + `engines.bun`, and `bun-version` in CI.
10. **No script may share a name with the binary it invokes.** The passthrough
    script `"astro": "bun --bun astro"` is deleted. `bun run` resolves a name to a
    `package.json` script **before** resolving it to `node_modules/.bin`, so
    `bun --bun astro check` inside the `check` script invoked the `astro` script
    — which invoked itself, recursively, until the process died with
    `E2BIG: Argument list too long`. This was caught during the migration, and its
    error message pointed at nothing resembling the cause. For a one-off Astro
    command: `bunx astro <command>`.

Item 3 of ADR-0014 ("the runtime stays Node/npm until there is a separate runtime
migration ADR") is **replaced by this ADR** — this is that separate ADR, and it
was decided earlier than ADR-0014 expected.

## Consequences

**Positive**

- One runtime for the whole family: tooling, documents, gates, and contributor
  knowledge move between repos without translation.
- The npm lockfile — along with its "superset but green" defect class —
  disappears. `bun.lock` also does not store the project version, so the release
  script no longer needs to sync a version into the lockfile.
- `bun install` is far faster in CI and on a contributor's machine, and the image
  build loses a slow layer.
- The on-demand routes and BFF (ADR-0014) will later run on the same runtime as
  `awcms`, so `fetch`, header, and streaming behaviour do not differ between
  layers.

**Negative / trade-offs**

- A content contributor who only has Node has to install Bun. That is a real
  cost, and the original reason for this divergence; it is accepted for the sake
  of family uniformity.
- `bun install` does **not** refuse a peer-dependency mismatch the way npm does —
  it warns and then installs. Pinning `typescript` in `.github/dependabot.yml`
  therefore becomes more important, not less: without it, TypeScript 7 would
  install smoothly and fail later in `astro check`.
- Bun is not Node: a dependency relying on a Node API that is not yet complete in
  Bun will fail here before it fails in the wider ecosystem. The mitigation is
  `astro check` + unit tests in CI, and an explicit Bun version pin so a failure
  can be reproduced.
- The `npm audit` history moves to `bun audit`; both read the same advisory
  database but their output is not identical.

**Neutral**

- `astro.config.mjs`, the components, and the whole content contract do not
  change by one line. This migration touches the tooling, not the product.
- A site already using this template can still be built with Node if they choose
  not to follow — but they lose gate parity with the template, and that is their
  decision to record themselves.

## Alternatives considered

- **Staying on Node/npm until the portal lands** (the ADR-0014 §3 position). It
  postpones one tooling change at the cost of running two family runtimes for
  longer, and forces every migration document to be written twice.
- **Bun as the package manager only, Node as the runtime.** That combination
  works, but it leaves the "which one" question in every gate and removes not one
  documentation cost.
- **Waiting for Astro to have a first-party Bun adapter.** Not relevant for static
  output, and `awcms` has already proven the `@astrojs/node`-on-Bun pattern runs
  in production — it records its exception explicitly in `astro.config.mjs`.
