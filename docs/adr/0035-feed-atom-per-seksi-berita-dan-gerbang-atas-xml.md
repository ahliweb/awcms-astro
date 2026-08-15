🇬🇧 English (source) · 🇮🇩 [Bahasa Indonesia](0035-feed-atom-per-seksi-berita-dan-gerbang-atas-xml.id.md)

# ADR-0035 — An Atom feed per news section, and a gate over every `.xml` in the output

- **Status:** Accepted
- **Date:** 8 August 2026
- **Follows on from:** [ADR-0033](0033-seksi-berita-urutan-dari-tanggal-dan-dua-tanggal-yang-terpisah.md) §What was NOT built
- **In force alongside:** [ADR-0030](0030-aturan-tertulis-mendapat-pemeriksanya.md), [ADR-0032](0032-dua-celah-terakhir-ditutup-dengan-syarat-kejujuran.md)

## Context

[ADR-0033](0033-seksi-berita-urutan-dari-tanggal-dan-dua-tanggal-yang-terpisah.md)
derived news sections and postponed the feed. What is interesting about that
postponement is not its decision but its **reason**, written as a finding rather
than as a cost:

> the only `.xml` any gate reads is `sitemap*.xml` — and even that gate skips
> every `<loc>` ending in `.xml` without a sound. An `.xml` file under any other
> name is read by nobody: the page scanner only picks up `**/*.html`.

That sentence was re-checked against the code before this ADR was written, and it
is true in full. Its consequence: a feed pointing at an article that has been
withdrawn, carrying a raw PO key name as a title, carrying relative URLs (illegal
in both Atom and RSS), or declaring itself updated at the build clock would
**pass all five of this repo's gates with a green build**. That is precisely the
state [ADR-0030](0030-aturan-tertulis-mendapat-pemeriksanya.md) forbids.

So what decides is not "is a feed useful" — it is useful, and a news section
without a feed is a news section that can only be followed by opening the site
every day. What decides is that publishing one demands a new gate family the size
of this whole ADR. That family is what lands here, and the feed rides on top of it.

## Decision

### 1. A news section publishes an Atom feed, and only if it has contents

Two conditions, both in `seksiPunyaFeed()`:

- **Only `"terbaru"` sections.** A `"manual"` section is ordered by editorial
  position, and "the newest" within it means nothing. Step 1 of a guide would be
  pushed to every subscriber every time that guide is edited, and a three-year-old
  page that genuinely belongs at the top of its section would arrive as today's
  news.
- **Only sections containing articles.** Atom requires `<updated>` on a feed, and
  the only value available for an empty section is the **build clock** — a number
  this repo has already refused for the sitemap's `lastmod`, for exactly the same
  reason: telling crawlers that everything changed on every deploy is not true, and
  they stop believing it. An empty section therefore publishes no file at all, and
  its page installs no auto-discovery link to a file that does not exist.

Its URL is `/{tab}/feed.xml` in the default locale and `/{lang}/{tab}/feed.xml` in
prefixed locales — the same shape as every other route, so it changes the shape of
no existing route. `feed.xml` is a static segment while `[...slug]` in the same
directory is a rest parameter, so the feed route wins without needing to be
ordered. Even an article genuinely slugged `feed.xml` does not collide: the
`directory` build format writes it to `{tab}/feed.xml/index.html`.

### 2. Atom 1.0, not RSS 2.0 — because what a specification requires is what can be gated

Not because Atom is "more modern". What decides: **RSS 2.0 requires almost
nothing.** The title is optional, the date is optional, `guid` is optional, links
may be relative. A broken RSS feed is still "valid", and a gate over it can only
check the things that happen to be present — which means a gate whose silence
cannot be distinguished from a pass.

Atom requires `id`, `title`, and `updated` on the feed and on every entry, and
requires every IRI to be absolute. Every sentence in §4 below is a requirement
that already exists in its specification; not one rule is invented by this repo.

A second reason, smaller but real here: Atom dates are RFC 3339, which is the
**exact same** `toISOString()` string already emitted by JSON-LD and
`article:published_time`. One date representation across the whole build, not two
that can diverge. RSS demands RFC 822, which would become a second formatter in a
repo whose default locale is not English.

### 3. A feed carries a SUMMARY, not the article's contents

`<summary type="text">` holds the same `description` as the page's
`meta name="description"`. Sending the full `bodyHtml` means publishing markup —
`<img>`, links, attributes — to a surface passed through by no CSP
([ADR-0019](0019-csp-ketat-dikirim-penyaji.md)), read by no asset gate, and
re-rendered by every feed reader under its own sanitisation rules.

**Its consequence is stated rather than disguised:** a feed subscriber reads a
summary and then clicks, and cannot read the full article inside their reader.

`<author>` is the organisation's name, matching the article JSON-LD's `author`
(ADR-0033 §5). An editor's byline is absent here because `awcms` refuses it first
as a PII surface — not because Atom has no place for it.

### 4. A gate family over EVERY `.xml` in the output, not over `feed.xml`

This is the most important part, and its reason is not completeness. What ADR-0033
found was not "the feed is not checked" but **"an `.xml` file under another name
is read by nobody"**. A gate that only looks for `feed.xml` would repeat exactly
the same gap under the next name.

`scripts/audit-konten.mjs` therefore scans `**/*.xml` in `dist/client`, excludes
the `sitemap*.xml` that already has its gate, and **every remaining one must be a
valid Atom feed** — or is reported as a file read by no gate at all. That last
part is a finding in its own right, not an oversight passed over in silence.

What is required, each with the failure shape it would have if it were not:

| Requirement | What happens without it |
| --- | --- |
| `<id>`, `<title>`, `<updated>` on the feed | A feed missing its own title passes because its entries have titles |
| `<link rel="self">` stating that feed's own address | Every new subscriber is stored against a different address, which may not exist |
| At least one `<entry>` | A feed file advertising an empty section as a subscription |
| Every `href` and `<id>` absolute | Illegal in Atom; each reader resolves them against a different base, some give up |
| Dates in **RFC 3339** form, not "whatever `new Date` accepts" | `2026-08-01` is valid in JavaScript, violates Atom, and its entry is discarded by some readers **with not one message** |
| An entry's `<updated>` not preceding its `<published>` | Some readers sort by `updated`; that entry stays at the top forever |
| Entries ordered newest-first | Some readers show them as-is, and an old entry reads as the latest news |
| The feed's `<updated>` = the newest entry's `<updated>` | The build clock; subscribers stop trusting its timestamp entirely |
| An entry's link points at a page that EXISTS in the output | An article withdrawn by the editors stays in the feed, pointing at a 404, in the reader of everyone who already received it |
| No PO key name leaks into a title/summary | The same defect class as in HTML — except that here not one human eye will ever see it |
| The feed is announced by at least one page | A subscription findable only by guessing its URL |
| The auto-discovery link carries a `title` | Feed readers show the raw URL, or the PAGE's title, as the subscription's name |
| A feed link points at a file that really is a feed | The dead-link gate cannot see this: the file EXISTS, it just is not a feed |
| The feed is NOT listed in the sitemap | See §5 |

### 5. Feeds leave the sitemap, and that is not tidiness

A sitemap lists **pages**; a feed is a second representation of a section page
that is already listed itself. What makes this more than taste: the sitemap gate
skips every `<loc>` ending in `.xml` without a sound — it takes them for sitemap
indexes — so a wrong feed entry would be invisible in the one place that checks
the sitemap.

Hence two sides: `astro.config.mjs` filters them out, and the feed gate demands
they are not there.

### 6. `Content-Type` is set by the server — and the "cannot be worked around" claim is corrected

ADR-0033 closed its postponement list with one sentence that reads as absolute:

> Plus one thing that cannot be worked around: an endpoint's response headers are
> discarded in a static build, so `Content-Type: application/rss+xml` is decided
> by the file extension in the adapter, not by code.

**Its first half is true and stays true.** Its second half is incomplete: in this
repo what serves the files is `server/penyaji.mjs`
([ADR-0016](0016-penyajian-bun-di-belakang-traefik-tanpa-nginx.md)), so the layer
discarding those headers is precisely the layer we own — and ADR-0016 already
decided response headers are settled in that file, not in two places. `tipeIsi()`
sets `application/atom+xml; charset=utf-8` for every path ending in `/feed.xml`.

What is lost without it is not compatibility — every feed reader accepts the
`application/xml` the adapter sends — but a **statement**: `application/xml` tells
nobody that the file is a subscription, so browsers and tools that decide from the
type treat it as arbitrary XML.

**Its boundary is stated:** what guarantees this type is only being served by
`server/penyaji.mjs`. A derived site putting `dist/client` behind a CDN or
somebody else's static host gets `application/xml` back from that host, and there
is nothing this repo can do about that other than say so.

### 7. Its checkers land with its rule, and here that requires three sides

[ADR-0030](0030-aturan-tertulis-mendapat-pemeriksanya.md) applies in full, and
this family carries the same burden as gap 10: **the template declares zero news
sections**, so `bun run build` in this repo will never produce a single feed file
— even if it had a content source. The feed gate therefore never finds a file to
check in the repo where it was written.

Three files answer that from three sides, and all three are needed:

- **`tests/feed.test.mjs`** — its builder as a pure function: the shape it
  produces, and the six refusals that make it throw rather than publish a
  defective feed.
- **`tests/audit-konten.test.mjs`** — its gate over a real fixture tree, each
  requirement proven in **both directions**. **Mutation-proven: 16 mutations run
  one at a time, 16 turning a different test red.**
- **`tests/kontrak-awcms.test.mjs`** — its **joint**. A builder and a checker that
  are both correct guarantee nothing if the glue between them sends the wrong
  column; a new block over there assembles a feed from a mock `awcms` response and
  demands absolute URLs, two separate date stamps, and a summary coming from
  `metaDescription`. Both **routes** are called directly too — `getStaticPaths` and
  `GET` — because both only run when `astro build` finds a news section, which
  never happens here.

`tests/penyaji.test.mjs` closes the header side: `tipeIsi()` both ways (a feed
gets its type, a sitemap and a page do not), and one real response proving that
value WINS over the type written by the handler — without which the whole function
would be correct and have no effect at all.

## What was NOT built, and why

- **RSS 2.0 and JSON Feed alongside Atom.** Refused, not postponed. A second
  format means a second gate family with different requirements, for the same
  audience — every mainstream feed reader reads Atom. All it adds is a surface
  that can diverge from its sibling.
- **A site-wide feed** (a `/feed.xml` merging every section). Postponed, and its
  reason is not cost: a site with mixed sections — manual guides and latest news —
  would send every guide edit to its news subscribers. It only makes sense once
  there is a site whose sections are all news, and on that day its shape can be
  decided from a real case.
- **Feed pagination** (Atom `rel="next"`/`rel="prev"`). Postponed along with
  section index pagination, which still awaits its own ADR (ADR-0033 §What was NOT
  built). Until both land, a feed carries ALL of its section's articles — the same
  as its index page.
- **Full `<content>`.** See §3; that is a refusal, not a postponement.
- **WebSub/PubSubHubbub.** It adds a third-party service to the publishing path,
  which per `docs/adr/README.md` is a class of decision needing its own ADR, and
  whose benefit is zero until a subscriber asks for it.

## Consequences

- **The template's behaviour does not change.** Its three tabs stay `"manual"`, so
  zero feed files are born and zero auto-discovery links are installed. What lands
  is the capability — and its gates, which run on every `bun test` here.
- **Every derived site declaring a tab `"terbaru"` gets its feed instantly**, in
  every locale at once, without touching one file. Both routes read the same
  `daftarFeed()`, so a feed cannot appear in one locale and be missing in another.
- **Every `.xml` file anyone publishes in this repo from now on has to pass a
  gate.** That is a deliberate cost: publishing an `opensearch.xml` or a news
  sitemap requires a conscious decision and its own gate, rather than a file
  landing with nobody checking it.
- **`bun run audit:konten` now names the feed family** when it skips it, just like
  the other output families. A gate that stays silent when it finds nothing cannot
  be distinguished from a gate that passed.

## Alternatives considered

- **Publishing the feed without its gate family**, relying on external validators
  — refused. A validator does not run in CI, does not know which articles this
  build published, and cannot see a leaked PO key name. Its failure shape is a
  green build with a wrong feed, which is exactly why ADR-0033 postponed it.
- **Gating only `feed.xml`** — refused; it repeats the gap ADR-0033 found under
  the next file name. See §4.
- **Using `@astrojs/rss`** — refused. It adds a dependency to assemble thirty
  lines of XML, and what it brings is not only code: the shape of its output
  becomes somebody else's, while the gate here demands a specific shape.
  `scripts/sbom.mjs` landed with no new dependency for the same reason
  ([ADR-0031](0031-sbom-cyclonedx-dari-lockfile-pada-rilis.md)).
- **Publishing feeds for `"manual"` sections too** — refused. See §1; it sends a
  three-year-old page as today's news every time somebody fixes a typo.
- **Publishing an empty feed for a news section with no contents yet** — refused.
  The only `<updated>` available is the build clock, and a subscription that never
  carries anything while continually claiming to be freshly updated is a
  subscription its reader cancels.
- **Setting `Content-Type` by naming the file `.atom`** (which MIME libraries do
  map to `application/atom+xml`) — refused. It moves a header decision into a file
  extension, where no comment can explain it, and `.atom` is an extension fewer
  tools recognise than `.xml`. Header decisions live in `server/penyaji.mjs`, where
  ADR-0016 put them.
