🇬🇧 English (source) · 🇮🇩 [Bahasa Indonesia](0036-news-adalah-kosakata-repo-ini-dan-sebuah-tab-yang-memikulnya.id.md)

# ADR-0036 — `/news/` is this repo's vocabulary, and a tab that carries it

- **Status:** Accepted
- **Date:** 8 August 2026
- **Owner's rule:** 8 August 2026 — "update the rule so that `/news/` only works in the ahliweb/awcms-astro repo, for public pages and USER admin pages", then "while `/blog/` is only used in the ahliweb/awcms repo", then "all of them use the blog module."
- **Related:** [ADR-0033](0033-seksi-berita-urutan-dari-tanggal-dan-dua-tanggal-yang-terpisah.md) (news sections: `urutanSeksi: "terbaru"`), [ADR-0034](0034-publik-secara-bawaan-admin-hanya-bila-dinyatakan.md) (public as the primary function, USER admin when declared), [ADR-0035](0035-feed-atom-per-seksi-berita-dan-gerbang-atas-xml.md) (an Atom feed per news section), [ADR-0018](0018-kontrak-build-token-mesin-dan-traversal-konten.md) (content traversal from `awcms`), [ADR-0030](0030-aturan-tertulis-mendapat-pemeriksanya.md) (every rule must bring its checker), `awcms` [ADR-0071](https://github.com/ahliweb/awcms/blob/main/docs/adr/0071-kosakata-url-publik-dibelah-blog-di-sini-news-di-awcms-astro.md) (this decision's counterpart), `awcms` [ADR-0059](https://github.com/ahliweb/awcms/blob/main/docs/adr/0059-host-resolved-public-content-routes.md) (superseded by that ADR-0071)

## Context

[ADR-0033](0033-seksi-berita-urutan-dari-tanggal-dan-dua-tanggal-yang-terpisah.md)
was born from a very specific question: **is this template ready to run a news
site on the `/news/` prefix?** The answer at the time — the prefix was ready, the
model was not — and that ADR fixed the model.
[ADR-0035](0035-feed-atom-per-seksi-berita-dan-gerbang-atas-xml.md) then gave
every news section its own Atom feed.

What was never answered: **who is entitled to use that prefix.** `awcms`
[ADR-0059](https://github.com/ahliweb/awcms/blob/main/docs/adr/0059-host-resolved-public-content-routes.md)
landed its own `/news/**` route family over there on 3 August 2026 — four routes,
host-resolved, from the same `blog_content` module that fills this repo. So for
five days both repos were allowed to serve public news, at the same address, from
the same content source.

That is not a technical conflict: both work. It is a **vocabulary** conflict, and
its shape is a question that has to be re-answered every time a deployment is
built — where are this site's news served from? A question answered per
deployment is a question answered differently each time.

## Decision

**`/news/` is this repo's URL vocabulary, and `/blog/` is `awcms`'s.** One route
family per repo, and never both in one repo. `awcms`
[ADR-0071](https://github.com/ahliweb/awcms/blob/main/docs/adr/0071-kosakata-url-publik-dibelah-blog-di-sini-news-di-awcms-astro.md)
is this decision's counterpart and supersedes ADR-0059 over there.

### 1. Its shape is a tab, not a new route family

A site publishing news names its tab `news` and declares
`urutanSeksi: "terbaru"` in `src/config/site.ts`. It immediately gets, with not
one line of new code:

| Route             | File                          | From                    |
| ----------------- | ----------------------------- | ----------------------- |
| `/news`           | `src/pages/[tab]/index.astro` | the existing tab engine |
| `/news/{slug}`    | `src/pages/[tab]/[...slug].astro` | the existing tab engine |
| `/news/feed.xml`  | `src/pages/[tab]/feed.xml.ts` | ADR-0035                |

…along with their localised equivalents at `/{lang}/news/**`.
`urutanSeksi: "terbaru"` is what makes it genuinely a news section: ordering from
`publishedAt` instead of the editor's `urutan`, cards showing a date instead of an
article number, and `NewsArticle` instead of `Article` (ADR-0033).

### 2. `news` is STILL not a reserved word

This is a deliberate difference from the shape of `awcms` ADR-0059, whose
§Consequences states "`/news` becomes a reserved word on any host".

Not here. `news` is a **tab slug a site chooses**. A guides site with no news has
no `/news`, does not need to switch it off, and does not need to explain why. This
template itself ships three tabs — `panduan`, `layanan`, `informasi` — and
**zero** of them are news.

This decision does not require any site to have `/news`. It states that a site
which has one, has it here.

### 3. What is split is the URL, not content ownership

This repo has no database and stores not one article. It reads
`GET /api/v1/blog/posts` from `awcms` (ADR-0018, frozen by `awcms` ADR-0065) and
builds its pages statically. The module is the same, its management screens are
the same (`/admin/blog*` over there), its permissions are the same.

So this decision does not break `awcms` ADR-0070 §4 ("no capability exists only
over there"): no capability **moves** here. What moves is the rendering of its
pages.

### 4. For public pages AND USER admin

The `/news/` prefix serves both, in the sense of
[ADR-0034](0034-publik-secara-bawaan-admin-hanya-bila-dinyatakan.md): its pages
are public as the primary function, and a site declaring `permukaanAdmin` may give
its USERS a surface for doing their own part of that content — writing, submitting
for review, managing their profile. The `owner` role stays **refused by a gate**
here, and this template still declares zero authenticated surfaces.

What does NOT change: any USER admin surface remains subject to ADR-0034 — it does
not exist until a site declares it, and this ADR declares it for nobody.

### 5. The `category`/`tag` taxonomy deliberately does NOT follow

`awcms` ADR-0059 has `/news/category/{slug}` and `/news/tag/{slug}`. This repo
does not, and does not gain them here.

The reason is not an oversight: this repo **has no taxonomy at all** — there is no
category or tag model in `src/lib/content.ts`, and a section is decided by a tab,
not by a term. Adding two archive routes means first deciding what a category is
here, how it maps from `awcms`, and what happens to an article whose category
names a tab that has been deleted — a question `urutanSeksiTab` already has to
answer today with its `"manual"` fallback.

That is a decision of its own. It is declared **open**, not refused: a site that
genuinely needs it brings it through its own ADR.

### 6. The rule brings its checker (ADR-0030)

The rule "a tab named `news` is a news section" can be broken silently with one
word: naming a tab `news` and then leaving it `"manual"`. The result is a `/news`
ordering news by a number an editor typed, with dateless cards and `Article`
instead of `NewsArticle` — a surface claiming to be news in its address and
denying it in every detail.

`tests/kosakata-news.test.mjs` refuses that configuration: if `tabs` contains the
slug `news`, its `urutanSeksi` must be `"terbaru"`. The gate does not demand that
tab exist — this template does not have it, and §2 has just stated that is
correct.

## Consequences

- The question "where are this site's news served from" has one answer readable
  from its address, in both repos, and the answer is the same on every deployment.
- A news site built on this template uses an engine actually written for news —
  `urutanSeksi` (ADR-0033) and per-section feeds (ADR-0035) — rather than four
  routes in `awcms` that have neither.
- **Zero code changes.** The tab engine exists, the feed exists, and this template
  still ships three non-news tabs. What lands is the rule and its checker.
- `awcms` still serves its `/news/**` as this ADR is written. Its removal is
  scheduled by ADR-0071 §4 over there and gated over there; this repo cannot
  enforce it and does not pretend it can.
- A site needing category/tag archives under `/news/` is not yet served (§5). That
  is stated, not hidden behind "it is ready".

## Alternatives considered

- **A physical `/news/**` route family**, imitating the shape of `awcms` ADR-0059
  — refused. It makes `news` a reserved word in **every** derived site, including
  those with no news, and duplicates a tab engine that already serves the same
  shape. Route parity is not the goal; serving news sites is the goal.
- **Letting both repos serve `/news/**`**, distinguished per deployment —
  refused, and this is what triggered this ADR. A decision answered per deployment
  is a decision never taken.
- **Taking `/blog/` as well** — refused. `awcms` needs a public content surface
  that can stand on its own: a single `awcms` deployment must still be able to
  publish without this repo installed in front of it.
- **Requiring the template to ship a `news` tab** — refused. That would make every
  derived site a news site by default, the opposite of ADR-0034, which demands a
  surface be declared rather than inherited.
