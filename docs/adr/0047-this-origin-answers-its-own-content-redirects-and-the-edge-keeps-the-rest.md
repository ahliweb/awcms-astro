🇬🇧 English (source) · 🇮🇩 [Bahasa Indonesia](0047-this-origin-answers-its-own-content-redirects-and-the-edge-keeps-the-rest.id.md)

# ADR-0047 — This origin answers its own content redirects, and the edge keeps the rest

- **Status:** Accepted
- **Date:** 27 August 2026
- **Related:** `awcms` ADR-0114 (the edge owns the legacy 301s), `awcms` ADR-0111 (a tenant's exact redirect beats the retired family rewrite), `awcms` ADR-0071 (the public URL vocabulary is split per repo), `awcms` PRD §9.2 (no chain longer than one hop), [ADR-0016](0016-penyajian-bun-di-belakang-traefik-tanpa-nginx.md), [ADR-0032](0032-dua-celah-terakhir-ditutup-dengan-syarat-kejujuran.md), Issue #77

## Context

### This origin could not answer a single redirect, and it was measured

Not "not configured yet" — **there was no code**. `astro.config.mjs` uses
`output: "static"` with no `redirects:` key, there is no middleware file, and
`server/penyaji.mjs` contained zero occurrences of `301` or `Location`.

`awcms` did not assume this; it measured it. Its ADR-0114 replayed **67
committed redirect rules against this repo's real built server and got 404 on
every one, with zero `Location` headers.**

The rules had been written into `awcms_seo_redirects`, which is applied at
exactly one call site — `src/middleware.ts` in **that** application — while their
targets were `/kategori/**`, routes served **here**. A rule written there is
never consulted for a request that never arrives there. ADR-0071 split the public
URL vocabulary one family per repo; the redirect capability was never split with
it.

### The obligation was withdrawn; the gap was not

`awcms` ADR-0116 withdrew the requirement to migrate a 25,029-article legacy
archive, so the specific cutover that exposed this is no longer being done. What
ADR-0116 explicitly did **not** withdraw is the mechanics: *"ADR-0114 — the edge
owns the 301s; an article resolves on its leading digits. Unchanged."*

So this is no longer urgent, and the plain gap remains: a site built from this
template has **no answer at all** for a URL that used to work — a renamed tab, a
re-slugged article, a section merged into another. Today that is a reader's 404
and a lost ranking, with no mechanism short of infrastructure this repo does not
describe.

### And the choice was made in another repo, about this one

`awcms` ADR-0114 chose the edge, on the ground that only the edge can collapse
`http→https` + `www→apex` + `legacy→new` into the one hop PRD §9.2 demands. That
reasoning is sound and is not relitigated here.

What is missing is that **nothing here says so.** `docs/deploy-coolify.md`
describes the whole deploy path and mentions no redirect layer. An operator
following this template's own documentation has no idea where their redirects
belong.

## Decision

**The responsibility is split, and each half goes where it can be proven.**

### 1. The ORIGIN answers content redirects

A renamed slug, a merged section, a moved page. This repo knows about those
changes because this repo makes them.

`src/config/pengalihan.mjs` holds an exact-path map; `server/penyaji.mjs`
answers `301` from it **before** compression and before the application handler.
Both are in this repository, which means both are reviewed, versioned and
**gated** — and that is the load-bearing half of this decision. ADR-0032's
principle applies directly: a gate that cannot be proven where it is written
will rot. An edge config cannot be tested by `bun test`.

### 2. The EDGE keeps protocol and host normalisation, and legacy-domain migration

`http→https`, `www→apex`, and moving an entire indexed domain onto a new one.
Only the edge sees those, and only the edge can collapse them into one hop. This
does not contradict `awcms` ADR-0114 — it agrees with it about the class of
redirect that ADR was deciding.

### 3. Exact paths, never patterns

A pattern can redirect a page that is still alive, and its author will not find
out until a reader fails to arrive. `awcms`'s `sql/060` made the same call for
its own table, for the same reason.

Locale prefixes are written out explicitly. Deriving them would mean guessing
which locale ever published the old page, and a wrong guess publishes a redirect
into a certain 404.

### 4. Three rules over the map, each with a checker

`tests/pengalihan.test.mjs` refuses:

- **A chain.** A target that is also a key means two hops. Search engines divide
  equity per hop and some stop following after a few.
- **A loop.** `/a/` → `/a/` is a browser tab that hangs.
- **A non-canonical target or key.** This build emits `{tab}/{slug}/index.html`;
  its sitemap lists the slashed form and every `<link rel="canonical">` names it.
  Redirecting to a non-canonical spelling trades one 404 for a page that
  contradicts itself, and a non-canonical KEY simply never matches — a rule its
  author believes is working.

### 5. The template's own map is EMPTY

A template has no URL history, so it has nothing to redirect. An example left
here would be copied into every derived site as a **live** redirect to a page
that never existed.

## Consequences

- A site can rename a section without abandoning every link and every ranking it
  had.
- `301`, not `308`: what is at stake is search equity, and `301` is the code
  every crawler understands. `308`'s method preservation means nothing to a
  static site answering `GET` and `HEAD`.
- **The query string travels.** A reader arriving from a campaign does not lose
  their attribution because the page moved.
- A redirect is still a response, so the security headers still apply to it —
  asserted, because a header gap on a rarely-tested path is a gap nobody sees.
- No new file has to be copied by the `Dockerfile`. The map is a module that
  `bun build` inlines into `dist/server/penyaji.mjs`, deliberately unlike
  `asal-media.json`: that one carries a value fetched from awcms at build time
  and cannot be inlined, and the Dockerfile forgetting it is a trap this repo has
  already documented.

## Rejected

- **Edge-only, following `awcms` ADR-0114 exactly.** Correct for the class of
  redirect that ADR decided, and wrong as a general answer for a template: it puts the one
  capability a site needs most often into a layer this repo cannot test, cannot
  version, and does not describe.
- **Origin-only.** The edge really is the only place that can collapse
  protocol + host + path into a single hop. Claiming otherwise here would make
  PRD §9.2 unachievable and would contradict a measurement `awcms` already took.
- **Pattern or regex rules.** See decision 3.
- **Redirecting unmatched paths to `/`.** It would erase the 404 signal and make
  every dead link look like a live one.
