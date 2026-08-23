🇬🇧 English (source) · 🇮🇩 [Bahasa Indonesia](0044-what-a-page-view-may-cost-a-reader.id.md)

# ADR-0044 — What a page view may cost a reader

- **Status:** Accepted — the repo owner chose Option B on 23 August 2026
- **Date:** 23 August 2026
- **Supersedes:** nothing. Answers `awcms` #597 item 9, which that repo's own status table records as *"blocked on a privacy ADR in `awcms-astro`, which is the repo owner's decision, not a task"*.

## Context

`awcms` has a visitor-analytics module and an anonymous ingest endpoint,
`POST /api/v1/analytics/collect`. Its cross-origin path was opened in #637/#638
precisely so a statically built site on its own domain could reach it: a CORS
preflight is answered for origins that are active domains of a tenant, the
allowed origin is echoed verbatim and never `*`, `Vary: Origin` goes out on
every response including refusals, and the endpoint is per-IP rate-limited and
always answers `202`.

**Nothing in this repo calls it, and the reason it has stayed uncalled is not
that nobody got to it.** Two sentences here say something about it, and they
were written as properties rather than as omissions:

- `AGENTS.md` §Security: *"No collection of readers' personal data. No forms, no
  analytics that bind an identity."*
- `docs/awcms-astro/standar-performa-dan-keamanan.md`, on Core Web Vitals: p75
  of REAL visits is *"still unmeasured because RUM is refused"*.

So this is not a wiring task. It is the question of whether this template's
promise to readers changes, and that belongs in an ADR before it belongs in a
`fetch`.

## What the endpoint actually stores, checked rather than assumed

Read from `awcms`'s own collector rather than from its documentation:

| Stored | Form |
| --- | --- |
| Visitor key | **sha256, salted per tenant** — the raw key is never stored |
| IP address | **sha256, salted per tenant** — and, separately, the RAW address when the tenant has switched `rawIpEnabled` on |
| User agent | **sha256**, plus a parsed browser/OS/device-type triple |
| Referrer | **domain only**, not the full URL |
| Path | sanitized |
| Geo | country / region / city / timezone |

Two of those rows decide this ADR, and only one is about hashing.

**The visitor key is a persistent identifier on the READER's device**, not a
hash of something they already sent. It is a cookie (`awcms_visitor_key`,
30 days by default) that exists to make two page views recognisable as the same
person. Hashing it server-side protects the database; it does not change what
the cookie is.

**`rawIpEnabled` stores the address itself.** It is per-tenant and off by
default over there, and this repo cannot see its value.

## The decision that is actually open, and it is smaller than "analytics: yes or no"

Because a cross-origin `fetch` **without** `credentials: "include"` neither
sends nor stores cookies, this repo already holds the switch — without any
change in `awcms`:

- **Option A — `credentials: "include"`.** The `awcms_visitor_key` cookie is
  stored on the reader's device as a **third-party cookie**, set from another
  origin, lasting 30 days. Unique-visitor counts work. This is what `awcms`
  #637 made `SameSite=None` for.
- **Option B — a plain `fetch`.** The `Set-Cookie` is discarded by the browser.
  Nothing persistent is placed on the reader's device, and no request can be
  tied to any other. Page views are counted; every one of them looks like a
  first visit.
- **Option C — call nothing.** The status quo. The two sentences quoted above
  stay literally true and the site has no traffic figures of its own.

## Decision — Option B, and it is not a compromise position

**A site may call the beacon, only when it declares that it does, and always
without credentials.**

1. **No cookie, ever.** The call is a plain `fetch`; nothing is stored on the
   reader's device, so *"no analytics that bind an identity"* survives the change
   word for word rather than being reinterpreted. What is given up is the
   unique-visitor count, and it is worth naming what that costs: "12,000 views"
   stops being convertible into "how many people". For a public information site
   that is the smaller of the two losses.
2. **No consent banner, because there is nothing to consent to.** This is the
   consequence that makes Option B worth choosing over A rather than a detail of
   it. Under Option A the site would owe its readers a cookie notice, a stored
   choice, and a path to withdraw it — a mechanism, on every page, protecting
   readers from something the site chose to do. Under B the honest notice is one
   sentence in a privacy page, and it is true without machinery.
3. **A site DECLARES it; the template ships it off.** Empty by default in
   `src/config/site.ts`, the same shape `permukaanAdmin` uses (ADR-0034). A
   template that quietly reports every derived site's traffic to whichever
   `awcms` it was pointed at is a template that decided something on somebody
   else's behalf.
4. **The declaration must be refused when `rawIpEnabled` is on** — and this
   repo **cannot check that**, which is stated rather than gated. The site
   operator and the `awcms` operator are frequently the same person; when they
   are not, the person switching this on here cannot see what the other switched
   on there. It is written into `.env.example` and into the privacy page's own
   text, where the person who can act reads it.
5. **What may be sent is exactly what the endpoint needs and nothing added.**
   No custom fields, no client-supplied identifier, no `sendBeacon` (which
   `awcms` #637 documented as blocked by `checkOrigin` — the call must be
   `fetch` with `application/json`). A future field is a change to this ADR, not
   a change to a payload.

## What is deliberately NOT decided here

- **Whether RUM returns.** The refusal recorded in the standards document stands.
  A page-view beacon and a performance beacon collect different things and
  answer different questions; reopening the second on the back of the first is
  how a scope grows without a decision.
- **Anything about an authenticated surface.** A site that switches on
  `permukaanAdmin` has a session, and every premise above changes with it.

## Consequences if accepted

- `src/config/site.ts` grows one declaration, off by default, with a gate in
  `tests/peran-situs.test.mjs`'s neighbourhood refusing a half-declaration —
  the same shape `permukaanAdmin` already has.
- `connect-src` must name the `awcms` origin. ADR-0043 already put it there for
  search, through `dist/server/asal-pencarian.json`; the beacon adds no origin
  and no second mechanism.
- A gate must assert the call carries **no** `credentials`, in the same file and
  for the same reason the search box's own gate asserts it (ADR-0043): the
  failure of the opposite is invisible — it works, and the cost lands on the
  reader.
- `AGENTS.md` §Security keeps its sentence unchanged, and gains one clause
  naming this ADR as what makes it still true.
- The privacy page becomes something the template ships rather than something a
  site is told to write.

## Amendment — 23 August 2026, written while implementing it

Two things this document did not foresee, recorded here rather than discovered
by the next reader.

**1. This is the one request in this repo that MUST carry a header, and it is
the opposite of the rule the search box follows.** ADR-0043 established that a
reader-facing call carries no custom headers, because `awcms` deliberately ships
no `OPTIONS` handler behind search. The beacon inverts it: `security.checkOrigin`
over there refuses a cross-origin POST whose content type is form-like, and a
`fetch` with no content type falls into the same refusal — only
`application/json` gets through, which makes this a preflighted request, and
`awcms` #637 shipped an `OPTIONS` handler for exactly that. `navigator.sendBeacon`
is therefore unusable: it sends `text/plain`, one of the refused types.

Making the two consistent, in either direction, kills one of them in the
reader's browser and in no log.

**2. The "this repo reads `awcms`, it does not write" gate had to be amended,
and the amendment buys two guarantees rather than opening a hole.**
`tests/tanpa-backend.test.mjs` refuses a `fetch` carrying any method other than
`GET`, and its own message anticipated this case. The exemption is ONE FILE —
`src/components/BeaconKunjungan.astro` — never a pattern, and the rule it relaxes
is not the rule it protects: that gate exists so the build's read-only machine
credential cannot quietly grow write actions, and this call touches it not at
all. It runs in the reader's browser, anonymously, with no credential of any
kind, against a public ingest endpoint that always answers `202` and owns its own
row. It writes no data this site owns.

Beside the exemption sit two new assertions that did not exist before: the
beacon file may carry **no `credentials`** and **no authorization header**, and
the exemption must name a file that exists and really does POST — a stale
exemption is one that silently stops exempting while making the gate read
stricter than it is.

**3. The surface list goes from nine to ten.** `/api/v1/analytics/collect` is
frozen in `awcms`'s consumer contract like the rest.

## If the owner prefers Option A instead

It is a defensible choice and this document is not written to foreclose it, so
what it would additionally require is listed rather than left to be discovered:
a cookie notice on every page, a stored and revocable choice, that choice
honoured before the first beacon rather than after it, a privacy page naming the
cookie, its lifetime and its purpose, and `AGENTS.md` §Security amended in the
same change — because under Option A that sentence is no longer true.
