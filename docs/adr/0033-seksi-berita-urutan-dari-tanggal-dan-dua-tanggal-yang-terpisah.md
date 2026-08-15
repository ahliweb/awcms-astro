🇬🇧 English (source) · 🇮🇩 [Bahasa Indonesia](0033-seksi-berita-urutan-dari-tanggal-dan-dua-tanggal-yang-terpisah.id.md)

# ADR-0033 — News sections: ordering comes from the date, and two dates stop being folded into one

- **Status:** Accepted
- **Date:** 7 August 2026
- **Owner's rule:** 7 August 2026 — "check and analyse the readiness for running a news website using the blog module with the `/news/` prefix", then "carry on, following the awcms flow."
- **Related:** [ADR-0018](0018-kontrak-build-token-mesin-dan-traversal-konten.md) (the build feed, and the "green build, empty site" defect shape referred to repeatedly here), [ADR-0023](0023-penahanan-dipersempit-pekerjaan-tanpa-awcms.md) (the "rewritten if `awcms` changed?" test), [ADR-0026](0026-kartu-share-per-artikel-dari-media-awcms.md) (the `seoImageMediaId ?? featuredMediaId` order imitated rather than reinvented), [ADR-0030](0030-aturan-tertulis-mendapat-pemeriksanya.md) (every new rule must bring its checker), `awcms` [ADR-0044](https://github.com/ahliweb/awcms/blob/main/docs/adr/0044-merge-news-portal-into-blog-content.md) (the news portal merged into `blog_content`), `awcms` [ADR-0059](https://github.com/ahliweb/awcms/blob/main/docs/adr/0059-host-resolved-public-content-routes.md) (host-resolved public `/news/**` routes over there)

## Context

The question was specific: **is this template ready to run a news site on the
`/news/` prefix?** The answer, before this ADR: the prefix was ready, the model
was not.

Adding `/news/` mechanically is indeed trivial — the `[tab]` route is already
generic, so one line in `src/config/site.ts` gives birth to `/news/` and
`/news/<slug>/`. What was not ready is what happens AFTER that prefix exists.

### 1. A news section would sort alphabetically

`src/lib/content.ts` orders every section by `urutan` — a number the editors
write in `contentJson`, defaulting to **99** for an article that was never
numbered. In a news section nobody numbers anything, so every article is 99 and
the tiebreaker takes over: **the section is ordered by title.** The latest news is
buried among the letters.

Ironically `awcms` already answers this on its side. The build feed is returned
`created_at DESC`, and its own public `/news/**` routes use
`ORDER BY published_at DESC`. The adapter here discards both and then re-sorts by
a field nobody fills in.

### 2. Not one page can report a correction

`LocalizedArticle` carries ONE date, filled from `publishedAt ?? updatedAt`, and
three surfaces read it:

- `src/lib/schema.ts` puts it on `datePublished` **and** `dateModified`;
- `src/layouts/BaseLayout.astro` puts it on `article:published_time` **and**
  `article:modified_time`;
- `src/layouts/ArtikelLayout.astro` displays it labelled "Updated".

Its consequences are layered. The mildest: the page label lies — the value shown
is in fact the PUBLICATION date. The worst: once `publishedAt` is filled in,
`updatedAt` is never read again, so `dateModified` freezes at the publication date
**forever**. An article corrected three times still declares itself untouched. For
a service guide that is already a shame; for news, recency is the one signal that
gets read.

A comment in `src/lib/schema.ts` defended that state with a sentence that was true
when written and no longer is: *"The repo does not store a separate publication
date."* The repo does not; `awcms` does, in two columns, and returns both on the
same row. All that was needed was to stop folding them.

### 3. An article can publish here while `awcms` hides it

The surface the build calls — `GET /api/v1/blog/posts?view=full` — is served by
`listBlogPostsFullPage`, which filters by tenant, `deleted_at`, `status`, and
`locale`. **There is no `published_at` there at all.** `awcms`'s own public routes
filter `published_at IS NOT NULL AND published_at <= now()`. So a post with
`status='published'` and no `published_at` is answered 404 by `awcms` and
**published** by the static site — two answers to one question, and the wrong one
is the one with a public URL.

This is defence in depth, not a demonstrable leak: through the `awcms` write path
today, a `published` row always carries a `published_at` (an INSERT is always
`draft`; a transition sets `now()`; scheduled publication uses `COALESCE`).
Writing it up as "closing a leak" would be a claim nobody could stand behind —
exactly the class of mistake the `src/lib/schema.ts` comment above exemplifies.

### 4. A fork in the road that has to be stated, not passed over

`awcms` **already** serves `/news/**` itself: a paginated index, category pages,
tag pages, RSS/Atom/JSON feeds at the host root, search, advertising, and
publish-goes-live-without-a-rebuild. Because both are host-resolved, one domain
can only be served by one of them.

What this repo chose does not change, and it is not its URL shape: **zero calls to
the CMS when a reader asks for a page.** This ADR does not move that choice; it
makes its static side genuinely usable for news.

## Decision

### 1. A tab DECLARES itself a news section

`src/config/site.ts` gives every tab `urutanSeksi: "manual" | "terbaru"`.

One declaration, three consequences, because all three are one decision: its
ordering (`publishedAt` descending), the contents of its card badge (a date, not
"Article 99"), and what its articles claim to be (`NewsArticle`, not `Article`).

That field is written on **every** tab, not only on those that need it. Not
because verbose is better: `as const` over a heterogeneous array makes its element
type a union, and `tab.urutanSeksi` then becomes a property some members do not
have — `astro check` red.

### 2. Ordering still comes from an explicit field; the FIELD belongs to the section

Rule 3 in `src/lib/content.ts` is not loosened, it is clarified. What that rule
forbids is depending on whatever order the API happened to return. `publishedAt`
is an explicit field, exactly like `urutan`.

**What `"terbaru"` reads is the `publishedAt` of the article DISPLAYED, not of its
source post**, and that differs from `urutan`. The reason: a section index shows a
date on every card, so ordering by a column the card does not show produces a list
whose dates rise and fall for no visible reason — on `/en/`, an article whose
translation was published in July would sit above one whose translation was
published in August, because their Indonesian versions were published the other way
round. The column that is sorted must be the column the reader sees.

The reason `urutan` is read from the SOURCE does not carry over here: a translator
could leave `urutan` empty and silently re-order their whole language, whereas
`publishedAt` can never be empty — §3 refuses to build a post without it. What is
given up is the guarantee that two locales order their sections identically; that
is honest, because their publication schedules genuinely differ.

Both end on the **source slug** as the final tiebreaker, and that is not
decoration. `Array#sort` is stable, so a comparator returning 0 hands its pair over
to the API's order — precisely what rule 3 forbids. The earlier keys are not
enough alone: `"terbaru"` can tie on the same timestamp (a bulk publication stamps
one `now()` onto every row), and `"manual"` can tie on `urutan` **and** title at
once. The slug is the only key that is unique per article and identical in every
locale, so a tie never breaks in different directions in Bahasa Indonesia and in
English.

Its comparator is exported as a pure function (`urutkanArtikel`). The reason is not
tidiness: `getArticles` picks its branch from `siteConfig.tabs`, every tab this
template ships is `"manual"`, and the template repo has no `awcms` instance to
build anything with. Written inline, the `"terbaru"` branch would be code never
executed in the repo that owns it — its first execution would happen in a derived
site's production build.

### 3. The `awcms` publication predicate is imitated — with one stated deviation

The adapter filters `publishedAt !== null` on top of the existing
`status`/`visibility`. What is **not** imitated literally:

| `awcms` predicate | Here | Reason |
| --- | --- | --- |
| `published_at IS NOT NULL` | Imitated exactly | A post with no publication date is answered 404 by `awcms`; publishing it makes two surfaces disagree |
| `published_at <= now()` | Imitated **with a 15-minute tolerance** | The two timestamps come from two machines: `awcms` stamps from ITS OWN clock — the database `now()` on a manual transition, the application process clock on a scheduled publication — while this comparison runs on the builder's clock. The normal path is publish → webhook → build, seconds apart. Without a tolerance, a builder a minute behind discards a just-published article — and in a news section that is the FIRST card. What is really guarded against is a post dated days ahead, never one ninety seconds ahead |
| `visibility IN ('public','unlisted')` | **Deliberately stricter** | That is `awcms`'s DETAIL predicate, loose so a direct link to an unlisted post stays alive. Static output has no "only through a direct link" state: everything enters the sitemap and can be crawled, so an unlisted post published here stops being unlisted |
| `deleted_at IS NULL` | Not needed | The build feed already filters it on the `awcms` side |

A filter that can only SUBTRACT gets its floor, the same shape as the media gate in
[ADR-0025](0025-gambar-artikel-dari-media-awcms.md): one post held back is an
editorial state and the build continues; **zero out of however many** is not —
that is an `awcms` that never stamped `published_at`, a clock wrong beyond the
tolerance, or a changed response shape, and all three publish a site whose every
section is empty with nothing failing.

Two orderings of operations are locked down too, because both can turn emptiness
green:

- The `view=full` assertion and translation pairing run **before** the date
  filter, over the wider set. Both pass vacuously on an empty array, so running
  them after the filter would turn "`awcms` answered with summaries" into "there
  was nothing to check".
- A `publishedAt` that **cannot be parsed** throws rather than returning `false`.
  Every comparison against `NaN` is false, so treating a date-that-is-not-a-date as
  "not time to publish yet" would discard EVERY article at once and read like a CMS
  that is still empty.

### 4. Two dates, from ONE row

`LocalizedArticle` carries `publishedDate` and `updatedDate`, both read from the
post whose words that page displays.

"One row" is the decisive part. Pairing a publication date from the SOURCE post
with a modification date from the TRANSLATION produces a `dateModified` preceding
its `datePublished` on entirely normal content — a source article published this
month whose translation has not been touched since last month — and crawlers
discard a block that says that. `awcms` reads both from one row; this repo
follows.

`ArticleSchemaInput.updatedDate` is **renamed**, not accompanied by a new field.
Adding an optional field would leave every old caller green while continuing to
emit a `datePublished` that is actually a modification date — the very defect this
exists to close. It is that rename which forces `astro check` to find its callers.

How far the typecheck genuinely helps here needs stating, because it is easy to
assume it goes further: `articleSchema` has only ONE caller, and that is the one it
turns red. The second surface (`articleMeta` in `BaseLayout`) is red because its
new field is declared required, not because of the rename. The third surface — a
read of `LocalizedArticle.updatedDate` whose MEANING changes without its type
changing — cannot be found by a typecheck at all; it was found by reading, and is
guarded by tests.

The "Updated" line on an article page now appears **only when the article really
was changed after publication**, compared STRICTLY over the raw values
(`pernahDiubahSetelahTerbit`). Strict is sufficient because both `awcms`
publication paths write `published_at` and `updated_at` in ONE statement with the
same value, so a just-published article carries two EXACTLY equal stamps — not two
a few milliseconds apart. Comparing at date granularity would instead hide a
correction made on the same day as publication, and on a news site that is the kind
of correction that happens most.

### 5. `NewsArticle` with an ORGANISATION-level author

An article in a `"terbaru"` section emits `NewsArticle`; anything else stays
`Article`. Its type comes from the caller and is never guessed from its contents:
what makes a page news or not is the section it lives in — the site's
configuration, not something inferable from a title.

`author` is added along with it, and that is part of this decision, not a garnish.
Changing only the `@type` string would in fact IMPOVERISH the output: until now
`articleSchema` here has no `author` at all, so a `NewsArticle` with no author
would be poorer than the `Article` it replaces. The organisation-level byline
imitated here comes from `awcms`'s `NewsArticle` node
(`structured-data-rendering.ts`), which fills it from the tenant name.

It is written INLINE, not as an `@id` reference to the page's Organization node,
because a reader that does not resolve `@id` would read an article with no author
at all. `publisher` **stays** an `@id` reference, and that is not an inconsistency
overlooked: it was already so before this ADR, the node it points at is in the same
`@graph` on the same page, and changing it is not part of this decision. What makes
`author` different is that it is NEW — there is no old behaviour to preserve — and
that an empty `author` on a `NewsArticle` is precisely the state this §5 exists to
end.

A **person**-level byline is still absent, and its reason belongs to `awcms`: that
repo refuses it first, noting that putting an internal user's identity into public
structured data opens a new PII surface. The `authorTenantUserId` column does exist
on a post row; resolving it into a name needs a fourth `awcms` surface, and
`tests/kontrak-awcms.test.mjs` hardens the list of three surfaces precisely so such
an addition goes red.

### 6. Its checkers land with its rule

[ADR-0030](0030-aturan-tertulis-mendapat-pemeriksanya.md) applies in full, and
"in full" here means ALL THREE surfaces of §2 — not one.

- **JSON-LD.** A new family in `scripts/audit-konten.mjs` reads every
  `Article`/`NewsArticle` node in the output — however deep inside `@graph`,
  because a scanner that only looks at the root would report zero violations over
  zero nodes and that reads exactly like a pass — and demands: both dates present,
  both parseable, `dateModified` not preceding `datePublished`, and `author.name`
  readable.
- **Open Graph.** A second family demands `article:published_time` and
  `article:modified_time` be paired, parseable, and not in reverse order. It is a
  family of its own because its surface is not JSON-LD and its installation lives in
  `.astro` — which is reached by neither `astro check` nor any test, so the folding
  this ADR closes could be reinstalled there with all five gates staying green.
- **The date line on the page.** Its predicate is lifted out of `.astro` into
  `pernahDiubahSetelahTerbit` in `src/lib/tanggal.ts`, and tested directly. So too
  is the `Article`/`NewsArticle` choice, which becomes `tipeArtikelSeksi` in
  `src/lib/schema.ts`. A decision left as a ternary inside `.astro` is a decision
  that can be inverted without one gate changing colour.

Two IDENTICAL dates stay green in both families. An article never corrected does
carry two equal stamps, and a rule that legitimate content can break is a rule the
next person loosens.

A boundary that stays stated: both output families only run AFTER `bun run build`,
which in the template repo cannot be run at all. What proves them here is the
two-way fixture in `tests/audit-konten.test.mjs`, and `audit:konten` names every
family it skips instead of staying silent.

## What was NOT built, and why

All four were checked against the code first; not one is refused for "no time".

- **RSS/Atom/JSON feeds.** Postponed, and needing an ADR of their own. The
  decisive reason is not their cost but that **the only `.xml` any gate reads is
  `sitemap*.xml`** — and even that gate skips every `<loc>` ending in `.xml` without
  a sound. An `.xml` file under any other name is read by nobody: the page scanner
  only picks up `**/*.html`. A feed pointing at an unpublished article, carrying a
  raw key name, or carrying relative URLs (illegal in RSS) would pass EVERY gate
  with a green build — precisely what ADR-0030 forbids. Closing that means a new
  gate family the size of this whole ADR. Plus one thing that cannot be worked
  around: an endpoint's response headers are discarded in a static build, so
  `Content-Type: application/rss+xml` is decided by the file extension in the
  adapter, not by code.
- **Section index pagination.** Postponed; it changes the ROUTE SHAPE, which by the
  criteria in `docs/adr/README.md` is a class of decision needing its own ADR. It
  also demands things nothing above demands: a different title per page (the
  duplicate-title gate turns identical ones red, and its standard escape — `noindex`
  + canonical to page one — is absolutely forbidden by the "two colliding signals"
  gate), a page count that must be identical in every locale so hreflang stays
  reciprocal, and a Lighthouse sample that shifts with it. **Its consequence is
  stated rather than disguised: until that lands, a news section index renders ALL
  of its articles on one page.**
- **Tag and category archives.** Blocked on the `awcms` side, and that is a stated
  decision over there: `listBlogPostsFullPage` deliberately omits `termIds` because
  both would be an extra query per post, which would restore the N+1 ADR-0018
  deleted. This is a performance decision, not an oversight — so its refusal is
  durable and can be re-examined by the next reader.
- **An editor's byline.** See §5.

## Consequences

- **The three tabs this template ships do not change behaviour.** All of them are
  `"manual"`, and the manual branch is identical to what came before except for one
  final tiebreaker that is only active when `urutan` AND title both tie — a state
  that today ends in an arbitrary order.
- **One metadata line on every article page changes meaning**, including on the old
  tabs: what used to be labelled "Updated" was in fact the publication date, and
  now there really are two lines with the second conditional.
- **The template does NOT add a `news` tab.** This repo is a mould, not a site;
  adding a fourth tab changes the site every derivative inherits and demands twelve
  catalogue entries and 16:9 artwork for a section with not one article. What lands
  is the capability. How a site declares `/news/` is written in
  `docs/awcms-astro/checklist-repo-baru.md`.
- **A derived site declaring `"terbaru"` inherits the §What was not built
  boundary**: with no pagination, a section with hundreds of articles is one large
  page, and that has to be considered before switching it on.
- **The ADR-0023 test passes for everything in this ADR.** There is no new `awcms`
  surface; every field read already exists in the `view=full` response and is frozen
  over there. What would need an `awcms` instance is exactly what is refused above.

## Alternatives considered

- **Ordering by `createdAt` instead of `publishedAt`** — refused. The build feed is
  indeed paginated over `created_at` (the only ordering safe for a keyset cursor),
  but what a reader reads is when an article was PUBLISHED. A draft written in
  January and published in August would appear near the bottom under `createdAt`.
  `awcms`'s own public routes use `published_at`.
- **Inferring a news section from its data** (e.g. "a tab where not one article has
  an `urutan`") — refused. It changes silently the moment one editor fills in one
  field, and no page states why a whole section suddenly re-ordered.
- **Making `urutanSeksi` optional with a `"manual"` default** — refused by
  `astro check`; see §1.
- **Clamping `updatedDate` to `max(updatedAt, publishedAt)`** so the date-order gate
  could never go red — refused. It hides inconsistent data rather than showing it,
  and with both dates read from one row, the state it would clamp cannot be produced
  by the `awcms` write path.
- **Leaving `<= now()` without a tolerance**, or dropping it entirely — both
  refused; see the §3 table. Without a tolerance it discards the newest article over
  a reasonable clock difference; with no comparison at all, the only defence against
  a `published_at` set outside the `awcms` write path goes with it.
- **Serving news from `awcms`'s own `/news/**` and building nothing here** — still
  a valid choice, and for many sites the cheaper one: over there, pagination, tag
  archives, feeds, and search already exist, and publishing goes live immediately.
  It is not chosen here because it trades this template's premise — zero calls to the
  CMS when a reader asks for a page — for completeness. What is right is to state the
  fork, not to pretend there is only one road.
