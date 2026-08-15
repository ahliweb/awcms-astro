🇬🇧 English (source) · 🇮🇩 [Bahasa Indonesia](README.id.md)

# Jualanku.info — the experience layer blueprint

> **Status: PLANNED.** There is no adapter, and no `/penjual/**`,
> `/affiliate/**`, or `/_portal-api/**` route in this repo. `astro.config.mjs` is
> still `output: "static"` with no adapter, and that is the correct state until
> the prerequisites below are closed. The source of truth remains the code +
> `bun run build`.

This folder designs the experience side of the Jualanku.info port. Its decisions
are recorded in [ADR-0014](../../adr/0014-rendering-campuran-dan-bff-portal.md);
the platform side (domain, authorisation, data, API) is designed in the
[`ahliweb/awcms`](https://github.com/ahliweb/awcms/blob/main/docs/awcms/jualanku/README.md)
repo.

## Document map

| File                                                  | Contents                                                                                   |
| ----------------------------------------------------- | ------------------------------------------------------------------------------------------ |
| [01-arsitektur-experience.md](01-arsitektur-experience.md) | The rendering matrix, the adapter, the directory structure, deployment changes, the rollback path. |
| [02-kontrak-bff.md](02-kontrak-bff.md)                | The `_portal-api` endpoints, sessions, CSRF, tenant, cache, errors, the BFF's hard boundary. |
| [03-peta-rute-dan-ui.md](03-peta-rute-dan-ui.md)      | The public/portal route inventory, the Elementor disposition, components, tokens, accessibility. |
| [04-kesiapan.md](04-kesiapan.md)                      | The P0 prerequisites, the proof-of-concept, the acceptance checklist, and what is deliberately postponed. |

## Division of responsibility (in brief)

| This repo's                                       | `awcms`'s                                                |
| ------------------------------------------------- | -------------------------------------------------------- |
| HTML, components, tokens, UI state, accessibility | Business rules, invariant validation, status transitions  |
| The portal session (cookie), CSRF, the Origin check | The canonical session, rotation, revocation, MFA/step-up |
| Deriving the tenant from the host                 | Enforcing the tenant (RLS) and authorisation              |
| The view model, presentation masking              | Authoritative masking, per-purpose projection, auditing   |
| The public cache & private headers                | The decision log, idempotency, the ledger                 |

The single rule that decides: **if a check exists only in this repo, that check
does not exist.**
