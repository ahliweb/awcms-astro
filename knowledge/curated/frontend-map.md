# Frontend map

What this repo is, and what is not built yet — facts a graph query cannot
state because there is no code for it to find.

## What this repo is

The public frontend half of the AWCMS family. `awcms` is the backend and
system of record; this repo pulls content at **build time** and publishes a
**static** site (`output: 'static'` in `astro.config.mjs`) — nothing here
renders per request by default. Full statement: `AGENTS.md` §"What this repo
is" and §"This repo's role".

## Public by default, enforced

Every route is public unless a site explicitly declares otherwise through
`permukaanAdmin` in `src/config/site.ts` (ADR-0034). This template itself
declares zero authenticated surfaces — `bun test` goes red if a route ships
`export const prerender = false` outside a declared prefix
([`tests/peran-situs.test.mjs`](../../tests/peran-situs.test.mjs)).

## Two planned authenticated doors — neither has code yet

1. **The Jualanku portal BFF** (ADR-0014): `/penjual/**`, `/affiliate/**`
   (other than its landing page), `/_portal-api/**`. Composes `awcms` calls
   for this site's own screens; owns no data. Prerequisites tracked in
   [`docs/awcms-astro/jualanku/04-kesiapan.md`](../../docs/awcms-astro/jualanku/04-kesiapan.md).
2. **A site's own USER admin surface**, declared through `permukaanAdmin`
   (ADR-0034) — writing an article, submitting for review, managing a
   profile. Never the **main admin** (`owner`, modules, roles, tenants,
   audit trail) — that stays in `awcms`'s own `/admin/*` permanently.

## What decides whether a capability belongs here at all

Not "does it need a screen" but "where does the backend need land":
[ADR-0038](../../docs/adr/0038-kebutuhan-backend-menjadi-modul-di-awcms.md)
— a backend need becomes a MODULE in `awcms`, never a folder here. This repo
reads `awcms`; it does not write, checked by
[`tests/tanpa-backend.test.mjs`](../../tests/tanpa-backend.test.mjs).
