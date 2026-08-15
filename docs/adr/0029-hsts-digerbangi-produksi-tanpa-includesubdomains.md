🇬🇧 English (source) · 🇮🇩 [Bahasa Indonesia](0029-hsts-digerbangi-produksi-tanpa-includesubdomains.id.md)

# ADR-0029 — HSTS sent by the server, gated to production, without `includeSubDomains`

- **Status:** Accepted
- **Date:** 4 August 2026
- **Owner's rule:** 4 August 2026 — "do it according to your best recommendation."
- **Related:** [ADR-0028](0028-jangkar-standar-performa-dan-keamanan.md) (gaps 1 and 5, closed here), [ADR-0019](0019-csp-ketat-dikirim-penyaji.md) (the CSP sent by the server), [ADR-0016](0016-penyajian-bun-di-belakang-traefik-tanpa-nginx.md) (the server as the sole owner of headers)
- **Comparison source in `awcms`:** `src/lib/security/security-headers.ts` (`buildSecurityHeaders`, Issue #437). It is **not** an ADR over there — the `awcms` header posture landed through an issue, so there is no ADR number to cite. This line is written that way rather than guessing a number: the first draft of this ADR cited `awcms` ADR-0035, which turned out to be about the ERP/SaaS repositioning. That is exactly rule 2 of `awcms` [ADR-0062](https://github.com/ahliweb/awcms/blob/main/docs/adr/0062-skills-are-gated-against-the-code-they-describe.md) — a citation its reader cannot check either — and the gap ADR-0028 records as not yet gated here.

> **Banner (14 August 2026) — this decision is CORRECT and still in force, but
> for eight days it never reached a reader.**
>
> This ADR's body is a record and is not edited. What was found while verifying
> the first production deploy: `bun build --target=bun` **folds** a dotted
> `process.env.NODE_ENV` into a literal while bundling, so the
> `dist/server/penyaji.mjs` that was serving contained
> `headerKeamanan(produksi = false)`. The container ran with
> `NODE_ENV=production`, and its real responses still had **no**
> `Strict-Transport-Security`.
>
> Every gate was green throughout, and the reason is exactly the defect class
> this repo has repeatedly written rules about: both read
> `server/penyaji.mjs`, where the production gate is indeed still correct — not
> the **bundle** that ships.
>
> The fix is one form of access (`process.env["NODE_ENV"]`, which is not folded),
> and its checker runs the **artefact**: `tests/penyaji.test.mjs` starts
> `dist/server/penyaji.mjs` twice and demands HSTS be present in `production` and
> absent outside it. It runs inside `docker build`, so an image that loses the
> sixth header can no longer be built.

## Context

### 1. A sixth header installed nowhere

[ADR-0028](0028-jangkar-standar-performa-dan-keamanan.md) recorded one posture
difference from `awcms` as numbered gap 1: `awcms` sends
`Strict-Transport-Security` in production, this repo sends it in no environment
at all.

The reason that read plausibly for two months — "TLS is terminated by Traefik, so
that is the front layer's business" — does not survive checking. Traefik does not
install HSTS without a declared middleware, so what was happening was not
"installed elsewhere" but **installed nowhere**. And
[ADR-0016](0016-penyajian-bun-di-belakang-traefik-tanpa-nginx.md) already forbids
solving it in Traefik: response headers are decided in `server/penyaji.mjs`, not
in two places that can overwrite each other.

What HSTS guards is not a request that is already HTTPS. It guards a reader's
**first** request — `contoh.go.id` typed with no scheme, the browser tries HTTP,
and the redirect to HTTPS is a response anybody sitting on that path can replace.
A public information site whose readers are on connections that cannot be relied
on is exactly the context where that attack is cheap.

### 2. Why this decision cannot be taken in one line

Two properties make HSTS different from the four other headers in that file, and
both lead to a danger that is **invisible when the change is written**:

- **It cannot be cancelled from the site's side.** Once a browser has received
  it, it refuses to speak HTTP to that host for `max-age`. Sending it and
  regretting it means waiting a year, not deploying a fix.
- **It applies to a HOST, not to a site.** On `localhost`, what gets locked is
  not only this preview but **every other project** the machine's owner develops
  at `http://localhost:<port>`. `bun run serve` and `bun run preview` run the same
  file as production — so without a gate, one local preview breaks the machine
  running it, and nothing fails when that happens.

### 3. `includeSubDomains` is right for `awcms` and wrong for a template

`awcms` sends `max-age=31536000; includeSubDomains`. That is right over there:
`awcms` is ONE deployment whose operator knows exactly what its subdomains are.

`awcms-astro` is a **template**. It runs on a domain that did not exist when this
line was written, belonging to an organisation that almost certainly has other
services on other subdomains. `includeSubDomains` from `contoh.go.id` forces
`mail.contoh.go.id` and every other subdomain to be HTTPS-only for a year, in the
browser of everyone who has ever opened its site — and what bears the consequence
is not this site but those services, whose owners never took part in the decision.

Copying the `awcms` value as-is is therefore not "family parity". It moves a
context-dependent decision to a place that does not have its context.

## Decision

### §A — HSTS is sent, gated on `NODE_ENV === "production"`

`server/penyaji.mjs` exports `HSTS` and `headerKeamanan(produksi)`. The second
returns five headers outside production and six inside it. `pasangHeader` uses it.

`NODE_ENV` is used because the `Dockerfile` runtime stage **already** sets it to
`production`, so there is no second place to remember when deploying. What makes
this gate safe is the asymmetry of its consequences: an error in the "forgot"
direction only loses HSTS, while an error in the "too early" direction locks a
developer's machine for a year. **Its default is therefore off.**

### §B — `max-age=31536000`, without `includeSubDomains`, without `preload`

One year is the value the OWASP Secure Headers Project recommends and matches
`awcms`. The other two directives do not follow:

- **`includeSubDomains`** — the reasoning in §3. A site whose subdomains really
  are all HTTPS **may** add it, in `server/penyaji.mjs` and not in a second place,
  then update `tests/penyaji.test.mjs`. The rule is the same as for widening
  `img-src`.
- **`preload`** — it requires `includeSubDomains`, and registration on the
  browser preload list is practically irreversible. A template may not make a
  permanent commitment over a domain that does not exist yet.

This divergence from `awcms` is **narrow and deliberate**, and it closes ADR-0028
gap 1 completely: what was recorded there is a header not sent at all, not a
shorter directive.

### §C — Three assertions, and the most important one runs backwards

`tests/penyaji.test.mjs` gains three, and all three are **mutation-proven** —
each was demonstrated RED with its control removed, then green again:

1. **HSTS is NOT sent outside production.** This is the assertion that really
   guards something. A gate that only checks "the header is present" would be
   green on a version that locks every developer's `localhost`.
2. **HSTS is sent in production, without `includeSubDomains` and without
   `preload`**, and the other five headers do not disappear when the sixth is
   added.
3. **`Server` and `X-Powered-By` are absent** on every response class — ADR-0028
   gap 5, ASVS V14.4.

HSTS presence is tested through the pure `headerKeamanan(true)` function rather
than by setting `NODE_ENV` inside the test process: setting it would leak into
other test files in the same process, and its failure would surface far from its
cause.

### §D — `Server`/`X-Powered-By` are removed, not merely asserted

Neither is in fact sent by Node today. `pasangHeader` still calls `removeHeader`
on both, because **"not sent today" and "will not be sent" are two different
things** — a middleware added later (a proxy, logging, other compression) could
install one with nobody deciding it. `removeHeader` on an absent header is a
no-op.

## Consequences

**What is gained.** A reader's first request stops being hijackable after their
first visit. The header-count difference from `awcms` is closed, and the
difference that remains (`includeSubDomains`) is now **written as a decision**
rather than reading as an oversight.

**What is paid.** A site deploying without `NODE_ENV=production` gets no HSTS and
**nothing says so**. That is knowingly accepted: the opposite gate — warning when
HSTS is not sent — could only run at runtime, and a runtime warning on a static
server would become the first log line people learn to ignore. The `Dockerfile`
sets it, and that is the documented deploy path.

**What is NOT done.** There is no env variable controlling HSTS. Adding
`HSTS_MAX_AGE` or `HSTS_INCLUDE_SUBDOMAINS` would move a security policy out of
the file ADR-0016 established as its only owner — and a wrong value there does
not fail, it merely locks somebody else's domain for a year.

## Alternatives considered

- **Installing HSTS in Traefik/Coolify.** Refused: ADR-0016 forbids it, and the
  reason for that ban is proven right here — for two months everyone assumed it
  was installed there.
- **Sending HSTS in every environment.** Refused: it locks every developer's
  `localhost`, including for projects unrelated to this repo, for a year and with
  no way to revoke it from the site's side.
- **Copying the `awcms` value as-is**, `includeSubDomains` and all. Refused with
  the §3 reasoning: it moves a context-dependent decision to a place without its
  context, and what bears the consequence is a party that took no part in it.
- **A short `max-age` first (e.g. 300 seconds), raised gradually.** This is the
  right advice for a SITE that is not yet sure all of its surfaces are HTTPS —
  and wrong for a template, which cannot know what stage a derived site is at. A
  site wanting to raise it gradually edits `HSTS` in its own server; the
  template's default is the value for a site that is already fully HTTPS, which is
  a prerequisite for deploying behind Traefik.
