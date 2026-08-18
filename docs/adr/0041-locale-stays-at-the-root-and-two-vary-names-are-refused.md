🇬🇧 English (source) · 🇮🇩 [Bahasa Indonesia](0041-locale-stays-at-the-root-and-two-vary-names-are-refused.id.md)

# ADR-0041 — The default locale stays at the ROOT, and two `Vary` names are refused

- **Status:** Accepted
- **Date:** 18 August 2026
- **Supersedes:** nothing. Absorbs `awcms` ADR-0098 (15 August 2026) and gives [ADR-0036](0036-news-adalah-kosakata-repo-ini-dan-sebuah-tab-yang-memikulnya.md) the checker its second half never had.

## Context

On 15 August 2026 `awcms` moved the locale of its public content surface into
the URL path (`awcms` ADR-0098, implemented the same day). `/blog/{tenantCode}/…`
no longer renders anything over there: it answers `307` to
`/en/blog/{tenantCode}/…` or `/id/blog/{tenantCode}/…`, `private, no-store`,
and only the prefixed URL is canonical and cacheable.

The reasoning is one sentence of arithmetic, and it is worth quoting because it
is what decides this repo's answer rather than the conclusion it reaches:
`vcl_hash` over there hashes `(host, url)` and nothing else, so **one public URL
whose body varies by cookie is a cross-serving machine** — the first reader to
miss the cache decides what the second reader sees, minutes later, on a page
neither of them can re-render.

Two questions land here on the same day, and they have opposite answers. Both
are written down because the expensive one is the second: the mechanism that
makes `awcms` ADR-0098 unnecessary here is a property of how this repo is
built, and a property nobody wrote down is a property somebody removes.

## Decision 1 — this repo does NOT adopt the prefix, and the default locale keeps the root

`/panduan/` stays `/panduan/`. Every other locale keeps its prefix
(`/en/panduan/`), exactly as `localePath()` in
[`src/config/site.ts`](../../src/config/site.ts) has always written it.

The failure `awcms` ADR-0098 exists to prevent is not mitigated here — it is
**structurally unavailable**, for three reasons that are each checkable:

1. **There is no negotiation.** A static build writes one file per URL. The body
   of `/panduan/` is decided at build time and cannot vary by reader, cookie, or
   header, so there is nothing for a shared cache to get wrong.
2. **No request state reaches the decision.** `server/penyaji.mjs` reads exactly
   one thing from a request: `req.url`. Not a cookie, not `Accept-Language`, not
   a session. A cache key of `(host, url)` and a body selected by the path are
   therefore already in agreement, which is the property `awcms` ADR-0098
   spends a redirect to buy.
3. **The URLs are already indexed.** Adopting the prefix would answer every
   default-locale URL with a redirect, in exchange for a property this repo
   already has. By [ADR-0040](0040-changeset-menyatakan-bump-semver.md)'s own
   vocabulary that is a `major` — a public URL breaks — and it would be paid for
   nothing.

`x-default` needs no change either, and for a reason worth stating rather than
assuming: `awcms` ADR-0098 decision 5 requires `x-default` to point at the
tenant default's **prefixed** URL specifically because the bare path there is a
redirect, and a crawler following `x-default` must land on a cacheable canonical
document. Here the bare path **is** that document, and
[`BaseLayout.astro`](../../src/layouts/BaseLayout.astro) already points
`x-default` at it. The requirement is met; only its spelling differs.

**This is a family divergence and needs recording as one.** Per `awcms` ADR-0068
it belongs in that repo's `awcms-family-compatibility.yaml` — this repo cannot
write that entry itself, which is why it is stated here instead, following the
precedent of [ADR-0034](0034-publik-secara-bawaan-admin-hanya-bila-dinyatakan.md)
§Relationship. The entry being asked for is a **sixth**, beside the five that
file already carries: `id: public-locale-url-shape`, `owner: "@ahliweb"`,
`reviewDate: "2027-02-04"` to keep the family's single cadence. What is reviewed
on that date is not whether the two repos spell their URLs the same way, but
whether the premise above still holds: that nothing in this repo's serving path
reads a request header.

## Decision 2 — `Vary: Cookie` and `Vary: Accept-Language` are REFUSED

Decision 1 removes the mechanism. It does not remove the temptation, and the
temptation has an obvious shape: the way to make this site choose a reader's
language without a rebuild is to negotiate `Accept-Language` in
`server/penyaji.mjs` and declare the variation with a `Vary`. Every response
this server sends is `public` (`CACHE_HALAMAN`), so Traefik, a CDN, or a
corporate proxy may hold one copy and hand it to everybody.

The two names fail differently, and both fail silently:

- **`Cookie`** puts a credential-bearing header into the cache key. The object
  count multiplies by the number of DISTINCT cookie strings rather than by the
  number of locales, so the hit rate collapses toward zero — worse than having
  no cache, because the origin now pays for the cache's misses too.
- **`Accept-Language`** looks like the right tool. It cannot see an explicit
  choice, so a reader who clicked Indonesian keeps getting English while the
  switch behaves exactly as specified. `awcms` rejected it for that reason after
  shipping, breaking, and fixing its own language switcher twice.

`awcms`'s wording is kept exactly: the names are **REFUSED, not stripped**.
Stripping would cache a body whose author had just declared that it varies —
the same defect, arrived at politely.

`Vary: Accept-Encoding`, which `compression` sets, is untouched and correct: it
names a transport encoding, not a different body.

## Its checker ([ADR-0030](0030-aturan-tertulis-mendapat-pemeriksanya.md))

[`tests/penyaji.test.mjs`](../../tests/penyaji.test.mjs), three assertions, each
proven red by its own mutation and green again after it:

| Assertion | The mutation that proves it |
| --- | --- |
| A real response names neither, with a request that offers both a `Cookie` and an `Accept-Language` | A handler that sets `Vary: Accept-Language` — red on this assertion alone, which is what shows it does not depend on the source check below |
| `server/penyaji.mjs` writes no `Vary` of its own | `res.setHeader("Vary", "Cookie")` in `pasangHeader` — red on this and on the assertion above |
| The forbidden list is exactly the two names | Narrowing `VARY_DILARANG` to one name |

The middle assertion is deliberately **stricter than the rule it guards**, and
the test says so rather than dressing it up: it refuses every `Vary` written
from that file, not only the two forbidden names. `Accept-Encoding` already
arrives correctly from `compression`, so the file has no legitimate reason to
write one — and a gate that had to parse a header value to judge it would be the
gate getting the judgement wrong. A third value that is genuinely needed is an
ADR, which is where these two came from.

The rule itself lives in `server/penyaji.mjs` as `VARY_DILARANG`, next to the
code it constrains, on the same reasoning as `PERAN_DILARANG` in
`src/config/site.ts`: a constant the gate reads cannot drift from the docblock
beside it.

## What landed with it: the half of ADR-0036 that had nothing reading it

ADR-0036 splits the public URL vocabulary in **both** directions — `/news/` is
this repo's, `/blog/` is `awcms`'s — and
[`AGENTS.md`](../../AGENTS.md) writes the second half as an imperative: "Do not
build `/blog/**` here". Only the first half was gated.
[`tests/kosakata-news.test.mjs`](../../tests/kosakata-news.test.mjs) checked
that a tab named `news` declares `urutanSeksi: "terbaru"`, and nothing at all
read the other sentence. That is the exact shape the gate skill records five
times over: a rule that is correct, firmly written, and unchecked.

`awcms` ADR-0098 is what turns it from a latent gap into a live one. Its
canonical public URL is now `/{locale}/blog/{tenantCode}/…`, which is
character-for-character the shape `src/pages/[lang]/[tab]/…` produces here. A
tab whose slug is `blog` would publish `/id/blog/…` and `/en/blog/…` from this
repo — not a near-miss of the other repo's vocabulary but a collision with it,
on a build that stays green and a site that looks right.

The same file now refuses three shapes, each proven red by mutating **this**
repo rather than only a fixture: a tab claiming the slug `blog`, a
`permukaanAdmin.prefiks` entry under `/blog`, and a route file writing the
segment literally. A fourth assertion checks that the route scan actually reads
something, so the check cannot pass by finding nothing.

The rule is about the address, not the word: `/blog-panduan/` is this repo's own
URL and collides with nothing.

## What was deliberately NOT decided

- **Not decided: whether a derived site may prefix its default locale.** It may,
  through its own ADR in its own repo. What is refused is doing it *here*, by
  copying the family, in a template whose URLs every derived site inherits.
- **Not adopted: a redirect layer in `server/penyaji.mjs`.** Decision 1's third
  reason is that the URLs are already correct; adding redirects to prove it
  would be the cost without the change.
- **Not changed: `awcms`'s own surface.** A site that serves readers from
  `/blog/{tenantCode}/**` over there now gets a locale-prefixed canonical URL and
  a two-hop redirect from any retired `/news/**` link (`301` to the bare path,
  then `307` to the prefixed one). That is that repo's decision, correctly taken;
  what this ADR does about it is make sure the documents here stop describing the
  old shape.
- **Not gated: the divergence entry itself.** Whether
  `awcms-family-compatibility.yaml` really gains a row is a fact about another
  repo, and this template has no instance to ask. It is a review-time human
  check, and claiming otherwise would be a claim nobody could stand behind.
