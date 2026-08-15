🇬🇧 English (source) · 🇮🇩 [Bahasa Indonesia](0014-rendering-campuran-dan-bff-portal.id.md)

# ADR-0014 — Mixed rendering (static-by-default + on-demand routes) and the Jualanku portal BFF

- **Status:** Accepted
- **Date:** 2026-07-29
- **Decision-makers:** the `awcms-astro` maintainers together with
  Product/Architecture and Engineering/Platform
- **Related:** `ahliweb/awcms` [ADR-0045](https://github.com/ahliweb/awcms/blob/main/docs/adr/0045-jualanku-porting-awcms-system-of-record-astro-bff.md)
  (`awcms` as the system of record, `awcms-astro` as the experience layer);
  [`AGENTS.md`](../../AGENTS.md) §"Moving to SSR", which requires this ADR to
  exist first; the PT TIM SIX validation document v1.0 (29 July 2026); the
  [`docs/awcms-astro/jualanku/`](../awcms-astro/jualanku/README.md) blueprint.

## Context

Jualanku.info needs three things purely static output cannot serve: pages that
depend on a **session** (`/penjual/**`, `/affiliate/**`), **mutations** from
portal forms, and a **cache separation** between public and private pages.

The state of this repo today (verified, not assumed):

- `astro.config.mjs` uses `output: "static"`, **with no adapter**.
- The runtime and package manager are Node/npm (`engines`: Node ≥ 22.12,
  npm ≥ 10.9) **at the time this ADR is written** — not Bun, as an earlier
  architecture document briefly stated. That state **has since changed**:
  [ADR-0015](0015-runtime-bun-menutup-divergence-keluarga.md) moved this repo to
  Bun.
- The `Dockerfile` builds statically and then serves with unprivileged nginx;
  `ops/nginx-situs.conf` only does `try_files` onto files.
- Content is pulled at **build** time through `src/lib/awcms/client.ts`; a
  finished container never contacts `awcms` again.
- `AGENTS.md` already states that moving to `output: 'server'` is an ADR
  decision, not a one-line configuration change.

The term "hybrid application" used by the earlier design is not accurate for
modern Astro: `output` is only `static` or `server`; the mixed capability comes
from `export const prerender = false` per route **after an adapter is installed**.

## Decision

**1. This repo becomes the Jualanku.info experience layer** — public pages, the
seller portal, the affiliate portal — and **the only BFF** towards `awcms`. A
browser never calls `awcms` directly.

**2. The rendering pattern: static-by-default with on-demand routes.** A server
adapter is installed, `output` stays `static`, and only genuinely personal routes
declare `export const prerender = false`:

- On-demand: `/penjual/**`, `/affiliate/**` (except the `/affiliate` landing),
  `/_portal-api/**`, and optionally `/cari`.
- Prerendered: all the rest, including the homepage, categories, business pages,
  articles, and legal pages.

Making the whole site `server` is **refused**: it throws away the cache and
resilience characteristics that are the reason this template exists.

**3. ~~The runtime stays Node/npm until there is a separate runtime migration
ADR~~ — REPLACED by [ADR-0015](0015-runtime-bun-menutup-divergence-keluarga.md).**
This item originally held the runtime at Node/npm so that rendering risk and
runtime risk would not mix, while waiting for a separate runtime migration ADR.
ADR-0015 is that ADR, and it was decided earlier than expected: this repo
**already** uses Bun as its runtime and package manager. The risk-separation
reasoning still holds as a work order — the runtime migration landed first,
alone, with its own gates, before a single line of portal code was written.

**4. The BFF is orchestration and projection only.** `/_portal-api/**` may: hold
the portal session cookie, exchange a session for an `awcms` token server-side,
set the tenant from the host, enforce CSRF/Origin, set `no-store`, and shape a
view model. The BFF **may not**: decide entitlements, merchant ownership, status
transitions, commission calculations, or anything with a business consequence. A
rule living only in the BFF is a rule that does not exist — a direct call to
`awcms` from the internal network would bypass it.

**5. The session contract:** the portal cookie is `HttpOnly`/`Secure`/`SameSite`,
the `awcms` token never reaches JavaScript, the tenant is derived server-side from
the host, logout revokes the session in `awcms` **before** the cookie is deleted,
and revocation stays `awcms`'s. Details in
[`../awcms-astro/jualanku/02-kontrak-bff.md`](../awcms-astro/jualanku/02-kontrak-bff.md).

**6. Deployment changes, and the change is explicit.** The image stops being
"nginx + static files" for the Jualanku deployment: a Node process running the
adapter output is needed, with nginx/Traefik in front of it. Public static files
may still be served by nginx. **The rollback path is preserved**: a full static
build (with no on-demand routes) must still be producible and deployable while
the portal is not yet active.

**7. Accessibility rises to WCAG 2.2 AA** (ISO/IEC 40500:2025) for the Jualanku
surfaces, up from the 2.1 AA baseline written in `AGENTS.md`. The other rules in
`AGENTS.md` — no third-party scripts, no raw HTML from the CMS, design tokens not
loose values, core functions working without JavaScript — **still apply in full**
on public pages. The private portal may require JavaScript for advanced
interaction, but its critical flows (logging in, seeing a status, submitting the
main form) must still work without it.

**8. The execution order is binding.** No production screen before: the adapter
is installed on a separate branch, one on-demand route proves the
login → session → read profile flow through a private `awcms`, the deployment
configuration is updated, and the static rollback is documented and tried.

## Consequences

**Positive**

- Public pages stay static: fast, cheap, resilient to CMS trouble, and still
  cacheable at the edge.
- Sessions, CSRF, and tenant context are controlled server-side, so there is no
  token in browser storage and no client-decided tenant.
- `awcms` does not need to be exposed to the internet.

**Negative / trade-offs**

- This repo stops being "with no server runtime": there is a process to run,
  monitor, and restart. The template's old premise still holds for purely static
  sites, but no longer for the Jualanku deployment.
- Two build modes (fully static vs mixed) both have to be kept green, or the
  rollback path will rot silently.
- The BFF is a tempting new place to put business rules.

**Neutral**

- The contract that `src/lib/awcms/client.ts` is the only file contacting `awcms`
  still holds, and now also covers request-time calls.
- This change does not force any other static site using this template to follow.

## Alternatives considered

- **The whole site at `output: 'server'`.** Simple in configuration, expensive
  operationally: every public page becomes a request to a live application, and
  this template's main advantage disappears.
- **The portal as an SPA calling `awcms` directly.** It moves tokens, tenant
  selection, and CORS into the browser; it raises the `awcms` attack surface and
  makes every cache rule the client's business.
- **Building the portal inside `awcms` (an SSR admin shell).** Technically
  consistent, but it merges internal and external audiences into one origin and
  one shell — precisely the separation ADR-0045 exists to preserve.
- **Waiting for the runtime migration to Bun first.** It postpones a product need
  for the sake of runtime consistency, and merges two unrelated risks.
