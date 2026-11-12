🇬🇧 English (source) · 🇮🇩 [Bahasa Indonesia](0054-html-gets-a-shared-cache-lifetime-and-every-deploy-purges-the-cdn.id.md)

# ADR-0054 — HTML gets a shared-cache lifetime, and every deploy purges the CDN

- **Status:** Accepted
- **Date:** 12 November 2026
- **Amends:** [ADR-0016](0016-penyajian-bun-di-belakang-traefik-tanpa-nginx.md) decision 5 and the rule it carries from "What nginx actually did here" item 3 (HTML `max-age=0, must-revalidate`). Everything else in ADR-0016 stands, including the `immutable` rule for `/_astro/`.
- **Related:** [ADR-0014](0014-rendering-campuran-dan-bff-portal.md) (authenticated and BFF routes are never cacheable), [ADR-0019](0019-csp-ketat-dikirim-penyaji.md), [ADR-0041](0041-locale-stays-at-the-root-and-two-vary-names-are-refused.md) (`Vary: Cookie` and `Vary: Accept-Language` stay refused, which is what makes a shared copy safe), [`docs/deploy-coolify.md`](../deploy-coolify.md), issue #168

## Context

This site is static HTML served by Bun behind the platform proxy. ADR-0016 sends
every HTML response `Cache-Control: public, max-age=0, must-revalidate`, chosen
so a successful webhook rebuild is visible at once. A CDN in front of the site
therefore has no freshness window to use: every page view reaches the origin,
although the pages are byte-identical for every reader. The origin load equals
the edge request rate, which is the opposite of what a static site should cost.

The original reason still holds and is the constraint on any change: a cache that
outlives a rebuild makes a successful rebuild look like it never ran, and nothing
fails when that happens.

## Options considered

| Option | What it does | Strengths | Weaknesses |
| --- | --- | --- | --- |
| **A. `s-maxage` plus purge on deploy** (chosen) | HTML carries a short shared-cache lifetime; each deploy purges the CDN once the new build is live | Rebuilds stay prompt (purge) and the CDN absorbs read traffic; a missed purge is bounded by the short `s-maxage` | Adds a deploy step and a CDN credential to hold |
| B. Short `s-maxage`, no purge | Same header, nothing else | Simplest; no credential | A rebuild can look unapplied for up to the whole `s-maxage`; the bound is the only control |
| C. Keep today's headers | No change | No new moving part | The CDN cannot cache HTML; every view hits the origin |

The owner chose **A** on 12 November 2026 through the standard choice dialog.

### Trade-off analysis

| Criterion | A, chosen | B | C |
| --- | --- | --- | --- |
| Security | One new credential. Mitigated: it is a zone-scoped, purge-only token, supplied through environment variables only, never committed | No credential | No credential |
| Performance | CDN serves nearly all HTML reads; origin load falls to the miss rate | Same, with a longer staleness tail | Origin serves every view |
| Maintainability | One small, dependency-free script and a documented hook | Fewest parts | Fewest parts |
| Scalability | Origin load no longer scales with readers | Same | Origin scales with readers |
| Accessibility | No effect | No effect | No effect |
| SEO impact | Faster, steadier TTFB for crawlers; freshness bounded by purge | Freshness bounded only by `s-maxage` | Unchanged |
| UI/UX | Readers see a rebuild at once after the purge | A rebuild may lag by `s-maxage` | Immediate |
| Compatibility | Standard `Cache-Control` (RFC 9111) that any shared cache understands; `max-age=0` keeps browsers revalidating | Same | Same |
| Operational complexity | A post-deploy step that must not fail the deploy; one variable set to maintain | None | None |
| Long-term implications | Fits a capacity target that wants a very high CDN hit ratio for public pages | Weaker guarantee | Cannot reach that target |

## Decision

1. **HTML responses send `Cache-Control: public, max-age=0, s-maxage=300, must-revalidate`.**
   - `max-age=0` and `must-revalidate` keep the browser behaviour of ADR-0016: a
     browser always revalidates, so a reader never sits on a stale page because
     of the browser cache.
   - `s-maxage=300` (five minutes) is the only new part. It is addressed to
     shared caches only, and five minutes is deliberately conservative: it is
     long enough for a CDN to absorb bursts and short enough that a deploy whose
     purge did not run is still bounded to a few minutes of staleness.
   - `stale-while-revalidate` is **not** adopted. It would lengthen the
     staleness tail past the stated bound, and it can be added later by its own
     decision if the measured miss rate asks for it.
   - The same value applies to every non-`/_astro/` response (including the
     unhashed `/tema.js` and the 404 page), exactly as the single HTML rule did
     before.
2. **`/_astro/*` stays `public, max-age=31536000, immutable`.** Hashed asset
   names make this safe forever, and nothing here changes it.
3. **Authenticated and BFF routes are never cacheable.** This template declares
   none (`tests/peran-situs.test.mjs`). A site that adds one under ADR-0014 or
   ADR-0034 must send its own `Cache-Control: private, no-store` for it; the
   `s-maxage` of this ADR does not extend to it.
4. **Every deploy purges the CDN after the new build is live.** The step is
   [`server/purge-cdn.mjs`](../../server/purge-cdn.mjs), shipped in the runtime
   image at `dist/server/purge-cdn.mjs` and run by the platform's post-deployment
   command (`docs/deploy-coolify.md`). It purges **by hostname** (Cloudflare
   `purge_cache` with `hosts`), not everything in the zone, so other sites that
   share the zone are untouched. Hostname purge is what the CDN plan documents
   for every plan tier, which is why a URL list from the sitemap is not needed.
5. **The credential travels through the secrets path only.** The script reads
   `CLOUDFLARE_API_TOKEN` and `CLOUDFLARE_ZONE_ID` from the environment of the
   deployed application as runtime variables marked secret in the platform. Nothing
   is written to the repo, the image layers, or a log; the token is not printed
   even in dry-run. The token must be scoped to **Cache Purge on one zone**.
6. **A missing credential degrades, it does not fail.** If a variable is missing
   the script logs one warning that names the missing variable names, says that
   `s-maxage` bounds staleness, and exits `0`. An API failure after bounded
   retries logs an error and also exits `0`, because the site is already live
   and the deploy must not be marked failed for a cache hint. `--strict` exits
   `1` instead, for a pipeline that wants the failure. `--dry-run` prints the
   request without sending it.
7. **Errors and rate limits are handled, not ignored.** HTTP `429` honours
   `Retry-After` (capped); `5xx` and network errors back off exponentially; any
   other `4xx` (bad token, wrong zone, missing permission) stops at once with the
   CDN's own error message, because a retry cannot fix it. Three attempts at most.

## Consequences

- **A rebuild is visible promptly**: at the purge for a live purge, and within
  five minutes in the worst case where the purge did not run.
- **The CDN must be configured to cache HTML.** A CDN does not cache HTML by
  default. The site's operator adds a cache rule that treats HTML as eligible and
  respects the origin `Cache-Control`. This is CDN account configuration and is
  out of this repo's scope (issue #168); `docs/deploy-coolify.md` says how to
  verify it from the response headers.
- **The token lives in the runtime container.** The purge step runs inside the
  container, so the credential is in that container's environment. The serving
  process (`server/penyaji.mjs`) never reads it, and a test keeps it that way, but
  the exposure is real; it is why the token is purge-only and zone-scoped.
- **A cached 404 is possible for up to `s-maxage`.** The header is set before the
  file is looked up, so a 404 carries it too. The purge on deploy clears it; the
  worst case is a new page showing 404 from the CDN for under five minutes if the
  purge did not run.
- **Hostname scope is the operator's to state.** `CDN_PURGE_HOSTS` (or the host in
  `SITE_URL`) names what is purged. A wrong value purges nothing and says so.
- **The one-line rule in ADR-0016, in the performance standard, and in
  `docs/deploy-coolify.md` changes with this ADR.** Each now states two HTML
  rules for two audiences: browser and shared cache.

## Verification

`tests/penyaji.test.mjs` proves the header values (HTML shared-cache lifetime and
bound, browser revalidation retained, `/_astro/` immutable and free of
`s-maxage`, GET/HEAD parity). `tests/purge-cdn.test.mjs` proves the purge step
against a local fake endpoint: request shape, hostname scope, dry-run sends
nothing, missing credential warns and exits clean, `429` and `5xx` retry,
`4xx` stops, and the token never appears in output. The real Cloudflare API is not
called by any test.
