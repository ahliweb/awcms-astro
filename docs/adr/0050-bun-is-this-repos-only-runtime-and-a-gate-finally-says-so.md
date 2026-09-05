🇬🇧 English (source) · 🇮🇩 [Bahasa Indonesia](0050-bun-is-this-repos-only-runtime-and-a-gate-finally-says-so.id.md)

# ADR-0050 — Bun is this repo's only runtime, and a gate finally says so

- **Status:** Accepted
- **Date:** 5 September 2026
- **Related:** [ADR-0015](0015-runtime-bun-menutup-divergence-keluarga.md) (Bun runtime, closing the family divergence — the decision this ADR gates), [ADR-0016](0016-penyajian-bun-di-belakang-traefik-tanpa-nginx.md) (Bun serves the build output in production, not nginx), [ADR-0030](0030-aturan-tertulis-mendapat-pemeriksanya.md) (a rule that is only written down is a rule that drifts — the shape this ADR closes again), [ADR-0037](0037-pin-typescript-6-adalah-syarat-hidupnya-gerbang-astro-check.md) (a family-level pin with its own gate, the nearest precedent for the two keeps below)

## Context

### The rule was already true, and true is not the same as guarded

An audit asked, plainly: does this repo depend on a Node.js runtime anywhere?
The answer was no, and it was no in every place that matters:

- every entry in `package.json` `scripts` invokes `bun`;
- `.github/workflows/*.yml` carries no `actions/setup-node`, no
  `node-version`, and no bare `node`/`npm`/`npx`/`yarn`/`pnpm` step — only
  `oven-sh/setup-bun`;
- `Dockerfile` builds and runs on nothing but `oven/bun:*` images, and its
  `CMD` invokes `bun`;
- `server/penyaji.mjs` opens with `#!/usr/bin/env bun`.

Nothing here was decayed or accidental. It is exactly the situation
[ADR-0030](0030-aturan-tertulis-mendapat-pemeriksanya.md) already named once
for the Bun *version* rule and once more for the TypeScript pin
([ADR-0037](0037-pin-typescript-6-adalah-syarat-hidupnya-gerbang-astro-check.md)):
a fact that holds today, is written nowhere as a check, and can therefore stop
holding without a single command turning red. A `node` step folded into
`ci.yml` "just to run a script quickly," a base image swapped for a generic
`node:alpine` during a Dockerfile edit, or a dependency's postinstall script
quietly requiring `npm` — none of these fail `check`, `bun test`, or any audit
script today, because not one of them reads `package.json` by command, reads
`Dockerfile` by `FROM`/`CMD`, or reads a workflow file for a toolchain action.
That silence is this repo's own definition of a defect worth gating.

### Two distinctions the gate must get right, or it is dishonest about what it forbids

A gate that bans the wrong things is worse than no gate: it teaches the next
editor a false rule with the full authority of a red CI check behind it. Two
distinctions had to be drawn precisely before any assertion was written.

**1. `node:*` built-ins are not a Node.js dependency here.** `node:fs`,
`node:path`, `node:http`, `node:child_process`, `node:crypto`,
`node:assert` and the rest of the surface `server/penyaji.mjs` and every
script under `scripts/` import from are Bun's OWN implementation of that API.
Nothing about importing `node:http` launches a Node.js process; it runs Bun's
own HTTP stack. They are the portable surface this repo is written against,
and forbidding them would gate against the very modules the runtime this ADR
protects is built on.

**2. `@astrojs/node` and `compression` in `dependencies` are not the runtime
creeping back in — both are executed BY Bun, and both are kept on purpose.**

- `@astrojs/node` (the Astro adapter) owns URL-to-file-path resolution.
  `server/penyaji.mjs`'s own docblock names exactly why that stays there
  rather than being reimplemented: "every line that maps a URL to a file is a
  line that can go wrong into an arbitrary file read: `..`, a
  double-encoded path, and a symlink are a defect class that was already
  solved years ago in the library the adapter uses." Dropping the adapter
  would mean rebuilding that resolver from scratch, in a repo whose CSP and
  header posture ([ADR-0019](0019-csp-ketat-dikirim-penyaji.md)) already
  assumes it is correct.
- `compression` negotiates Brotli. Per
  `docs/awcms-astro/standar-performa-dan-keamanan.md`, response compression
  uses a mature library specifically because it is "not only gzip:
  `compression` v1.8 negotiates Brotli (RFC 7932) when a browser asks for it,
  and Brotli beats gzip by roughly 15-20% on HTML." It pulls in `negotiator`
  (`Accept-Encoding` q-value parsing) and `compressible` (a curated MIME
  table) — both genuine parsing/data problems this repo would otherwise carry
  and keep current by hand.

Both packages run entirely inside the Bun process `server/penyaji.mjs`
starts. Neither spawns, shells out to, or requires a Node.js binary at any
point. Removing either in the name of this ADR would misread it.

### Why this is a repo-level ADR and not a `tests/tanpa-backend.test.mjs` addition

[ADR-0038](0038-kebutuhan-backend-menjadi-modul-di-awcms.md) already gates
package **capability** — a database driver, a queue client, anything that
gives this repo a place to write. This ADR gates something different: the
**execution substrate** itself, regardless of what any package does. A
backend-capability denylist growing a "Node.js runtime" entry would blur two
questions that fail for different reasons and get fixed by different people —
whoever adds `pg` needs ADR-0038's answer, whoever adds a `setup-node` step to
CI needs this one.

## Decision

**`tests/runtime-bun.test.mjs` gates the absence of a Node.js runtime,
end to end, and runs in CI's `check` job like every other gate that needs no
build and no network.**

It asserts, each in the direction it actually fails:

1. Every `package.json` `scripts` entry runs only `bun`/`bunx` commands, and
   names no Node.js-runtime binary (`node`, `npm`, `npx`, `yarn`, `pnpm`)
   anywhere in its command line — not only as the first word, so an argument
   naming one is caught too.
2. `package.json` carries no `engines.node`.
3. No `package-lock.json`, `yarn.lock`, `pnpm-lock.yaml`, `.nvmrc`, or
   `.node-version` exists at the repo root — each one is itself the
   regression, evidence that some other package manager or Node.js version
   manager was run against this repo.
4. Every `.github/workflows/*.yml` carries no `actions/setup-node`, no
   `node-version:` key, and no run-step whose command opens on a Node.js-
   runtime binary.
5. Every `Dockerfile` `FROM` line references an `oven/bun` image, and every
   `CMD`/`ENTRYPOINT` — exec form or shell form — invokes `bun`.
6. Every shebang under `scripts/` and `server/` reads `#!/usr/bin/env bun`.
   A script with no shebang at all is outside this rule — it is only ever
   invoked as `bun scripts/x.mjs`, and only a file that DECLARES an
   interpreter can declare the wrong one.

And, so the two keeps are checked from the other side and not merely left
alone by accident:

7. `@astrojs/node` and `compression` remain declared in `dependencies`. Their
   disappearance fails loudly, naming this ADR, rather than passing silently
   as "one fewer thing to check."

None of the seven ever inspects an import statement or reads a dependency
list for a `node:*` name — the two distinctions above are kept correct by
never writing an assertion that could catch them, not by an exception that
carves them back out after the fact.

## Consequences

- **A Node.js runtime re-entering this repo now fails a gate the moment it
  lands**, in the same PR, instead of surviving until someone tries to build
  a derived site and finds an unexplained `npm` requirement.
- **The two deliberate keeps are documented as decisions, not omissions.**
  Before this ADR, "why does `compression` still exist" had its answer
  scattered across a code comment and a standards document; after it, both
  packages' presence is asserted, and their absence points here.
- **What this gate does NOT prove:** every assertion above is a static read
  of files already tracked in this repo. It cannot see a transitive
  dependency spawning a `node` binary at runtime from inside its own
  `postinstall` or its own bundled tooling — proving that would mean running
  the dependency tree, not reading it, and this repo's gates run without a
  build and without a network wherever they can. It also says nothing about a
  maintainer running `npm install` by hand on their own machine, outside CI,
  against files that are never committed. What it closes is the class this
  repo has already lived through elsewhere: a written rule with nothing that
  turns red when it breaks.

## Rejected

- **Leaving it as a stated fact in `AGENTS.md` with no checker.** That is the
  status quo this ADR replaces, and it is precisely the shape ADR-0030 warns
  against: true today, silent tomorrow.
- **Forbidding `node:*` imports.** They are Bun's own implementation of that
  API surface, not a Node.js dependency; a gate that flagged them would be
  wrong about what it is protecting against and would push this repo's own
  code away from the portable API it is correctly written against.
- **Forbidding `@astrojs/node` and `compression`, or requiring them behind an
  allow-list exception.** Both run entirely under Bun and both close a real
  defect class (arbitrary file read via URL resolution; Brotli negotiation
  and MIME-table currency) that this repo would otherwise reimplement and
  maintain by hand. An exception list "because these are fine" reads as an
  afterthought bolted onto a rule that forbade them by default; recording
  them as a decision, checked from the keep-side, says instead that they were
  never in the rule's target to begin with.
- **Merging this into `tests/tanpa-backend.test.mjs`.** That gate answers a
  different question — package capability, not execution substrate — and
  answers it by KELAS (class) rather than by name. Folding "no Node.js
  runtime" into it would make one gate answer two unrelated questions, and a
  reader trying to find out why their PR went red would have to rule out the
  wrong one first.
- **A runtime probe — actually spawning processes or inspecting the running
  container to prove no `node` binary exists.** This repo's gates run without
  a build and without a network wherever they can; a probe like that adds
  both, for a defect class (files already committed to this repo) that a
  static read already catches. The class it cannot catch — a dependency
  quietly shelling out to `node` at runtime — is named as a limit above
  rather than chased with a heavier gate.
