# Rendering index

`output: 'static'` is a **premise** of this template, not a default that
happens to be set — changing it to `'server'` pulls back a runtime, a live
database dependency, and every operational control of the AWCMS family, and
is an ADR decision, not a config edit. Full statement:
[`AGENTS.md` §"Moving to SSR"](../../AGENTS.md#moving-to-ssr).

## The two legitimate classes of on-demand route

`tests/peran-situs.test.mjs` accepts exactly two prefix lists for a route
declaring `export const prerender = false`, and refuses everything else:

1. The Jualanku BFF prefixes from
   [ADR-0014](../../docs/adr/0014-rendering-campuran-dan-bff-portal.md).
2. The prefixes a site declares in `permukaanAdmin.prefiks`
   ([ADR-0034](../../docs/adr/0034-publik-secara-bawaan-admin-hanya-bila-dinyatakan.md)).

Neither list is populated in this template repo — see
[`frontend-map.md`](frontend-map.md).

## Who decides

Ownership, entitlement, and status transitions are always decided by `awcms`;
a rule that lives only in this repo's BFF code does not exist as a rule at
all — it is presentation over an `awcms` answer. Adding a THIRD class of
on-demand route, or widening either existing one, is a decision written as an
ADR first (see `AGENTS.md`'s own worked precedent: ADR-0034 narrowing
ADR-0020), never a one-line change to `astro.config.mjs` or `site.ts` alone.
