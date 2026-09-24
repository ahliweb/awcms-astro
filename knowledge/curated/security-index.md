# Security index

## No raw-HTML path from the CMS

[`src/lib/content-blocks.ts`](../../src/lib/content-blocks.ts) assembles every
rendered element from escaped text and a fixed tag — there is no `html`/
`raw`/`embed` block type, and adding one voids the whole guarantee. `set:html`
may only ever receive that function's output, never a string from any other
source.

## CSP is decided in exactly one place

[`server/penyaji.mjs`](../../server/penyaji.mjs) is the only file allowed to
decide response headers (ADR-0016), including `Content-Security-Policy` and
`Permissions-Policy` (ADR-0019). Not through an env variable, not through a
proxy config, not through `<meta http-equiv>` — two policy sources
overwriting each other is the quietest way to end up with no policy at all.
Any change here is proven by
[`tests/penyaji.test.mjs`](../../tests/penyaji.test.mjs), not checked by eye.

## HSTS is production-only, and the test runs in reverse

`Strict-Transport-Security` is sent **only** in production (ADR-0029) — HSTS
cannot be revoked from the site's side and applies to a whole HOST, so a
`bun run serve` preview sending it would lock every other project on
`http://localhost:<port>` for a year. The assertion therefore checks that it
is **NOT** sent outside production, not that it is sent in it.

## COOP/CORP: a premise that collapses on the first admin surface

This repo's official reason for not sending `Cross-Origin-Opener-Policy` and
`Cross-Origin-Resource-Policy` is "it has no session to fence" (`awcms`
ADR-0069, a recorded family divergence). **The first site that switches on
`permukaanAdmin` invalidates that premise** — it now has a session — and with
it the reason SRI was declined ("there are no cross-origin resources"). Both
must be revisited in `server/penyaji.mjs` before that surface goes live; this
template repo cannot gate it today because it declares no such surface to
gate.
