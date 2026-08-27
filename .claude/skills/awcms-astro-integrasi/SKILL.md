---
name: awcms-astro-integrasi
description: The awcms-astro ↔ awcms integration contract — the tenant coming from the machine token, the build feed traversal (view=full + cursor), media resolution + media origin for img-src, and the refusals that MUST be imitated. Use when touching src/lib/content.ts, src/lib/awcms/**, scripts/asal-media.mjs, or when a build publishes a site that looks right but is missing content.
---

🇬🇧 English (source) · 🇮🇩 [Bahasa Indonesia](SKILL.id.md)

# awcms-astro — the integration contract with `awcms`

This repo **consumes** `awcms`; it does not serve an API. `src/lib/awcms/client.ts`
is the only file that contacts `awcms`, and `src/lib/content.ts` is the only
place a component touches the result.

## Rules that may not be broken

| Rule | What happens when it is broken |
| --- | --- |
| A component **never** fetches its own data | One HTTP request per rendered card, or an async component |
| The traversal uses `view=full` **and** `order=created_at` | The list returns SUMMARIES; `contentJson` is `undefined`, article bodies are empty, sections are empty, **and the build stays green** |
| Every page is walked through `nextCursor` | The site is published with articles missing — and the ones missing are the newest |
| The tenant comes from the **token**, never from a header | `awcms` derives the tenant from the machine credential and ignores a header that says otherwise |
| A `published` post without `publishedAt` **is not published** | `awcms` answers 404 for that post on its own public surface (`/{locale}/blog/{tenantCode}/**` since its ADR-0098); the static site publishes it — two surfaces disagreeing about what is live |
| Ordering comes from the field the section **declares**, ending on the SOURCE slug | A comparator returning 0 hands the pair over to the API's ordering. Breaking ties on the title makes a section run in a different order in each language |
| `publishedDate` and `updatedDate` are read from **one row** | Paired across rows → `dateModified` precedes `datePublished` on valid content, and the crawler discards the whole block |
| Silently truncating data is a **failure**, not an optimisation | See every row above |

## Surfaces — THIRTEEN that are called, three that are not

**Six of the thirteen are a different CLASS, and reading past that is how the
next one lands wrong.** `/api/v1/site-search/query`, `/suggest`,
`/api/v1/analytics/collect` and the three `/api/v1/newsletter/*` paths are
called from the READER's browser at runtime; the other seven are called by
`astro build` from a machine holding a read-only credential.

**One of the six WRITES**, and it is the only one that does: a subscribe POST
makes `awcms` send mail to an address somebody typed. A wrong shape there does
not leave a page empty — it sends something, or silently stops sending, to a
person who asked for it (ADR-0049).

**And the six do not share one rule.** The two search paths must carry NO
header — there is no `OPTIONS` handler behind them. The beacon and the three
newsletter paths MUST carry one (`content-type: application/json`), because
`checkOrigin` over there refuses a form-like content type and their `OPTIONS`
handlers exist for the preflight that follows. Making them consistent, in either
direction, kills one of them in the browser. The gate below cannot see the
difference — it extracts string literals from `src/`, and who executes them is
not something a regex can know. What the difference decides is where a broken
contract surfaces: in a stranger's browser, silently, rather than in a build
somebody is watching. See ADR-0043.

The difference matters, and it was once written wrongly in this file as "five
surfaces in use". The `awcms` assessment of 4 August 2026 briefly recorded SIX,
and ADR-0065 over there — which landed the same day — still writes "6 path"; it
was never edited, and it should not be. What corrected the number is a commit a
day later that split `CONSUMER_PATHS` into **three** CONSUMED paths (called
today) and **two** COMMITTED ones (promised through an ADR, deliberately frozen
before any caller exists: `/auth/session`, `/access/machine-credentials`).
`GET /blog/posts/{id}`, removed by ADR-0018, was not frozen with them. The gate
over there prints "OK — 5 consumer paths" today, along with the 16 components
reachable through `$ref` closure.

A non-additive change to a response shape is therefore red in `awcms` CI first.
**What obliges this file to change is a regeneration that touches a CONSUMED
path**, not every regeneration: the fixture over there was regenerated on
13 August 2026 and what it touched was only COMMITTED paths — **not** entirely
additively: `summary` and three already-frozen `description` fields were
rewritten too, and that is precisely why that fixture HAD to be regenerated
rather than pass as it stood (its comparator compares scalars by equality). A
rule written more broadly than "a regeneration that touches a CONSUMED path"
would read as a promise that has already been broken.

The list below is therefore **gated**, not written by hand:
`tests/kontrak-awcms.test.mjs` extracts the `/api/v1/…` paths from the `src/`
source code and refuses the list if it diverges from them, in both directions. It
is what makes a new surface unable to land without this file changing too.

**The fourth surface landed on 22 August 2026** — `/api/v1/site-profile/composed`
(`awcms` #596, ADR-0102), which is where a site's own identity comes from. It
went through this gate in the order the Definition of Done requires and that
order is worth reading once, because it is the whole point of a cross-repo
contract: `awcms` froze the shape FIRST, entering it as **COMMITTED** — a
promise, since nothing called it yet — and only then did this repo start
calling it, at which point the entry moves to CONSUMED over there. Doing it the
other way round would put this build on a shape the other repo had not agreed
to keep, which is exactly the failure the fixture exists to move back to where
someone can see it.

**The fifth landed the same way** — `/api/v1/blog/terms` (`awcms` #597 item 1,
ADR-0104), the tenant's vocabulary, which is what makes a category or tag
archive possible at all. Two things about it are not optional:

- **Always `?order=created_at` with `nextCursor`, never the default list.** That
  list is `name ASC` with a bounded `LIMIT` and returns a bare array — nothing
  in it can say "there are more". A tag vocabulary grown over a 23,906-article
  archive would be truncated at around the letter B, and the site would build a
  hundred archive pages out of thousands with every gate green.
- **The build credential's role needs `blog_content.taxonomies.read`.** A
  credential minted before `awcms` ADR-0104 holds it only if its role already
  did. A 403 or 404 warns and builds without archives; anything else throws — an
  empty vocabulary is a legitimate state, so a blanket `catch` would make "your
  CMS is down" and "this newsroom uses no categories" the same event.

**The sixth and seventh landed together** — `/api/v1/blog/menus` and
`/api/v1/blog/widgets` (`awcms` #597 item 6, `awcms` ADR-0105). They could only
be frozen AFTER `awcms` #652 gave both responses an actual schema: before that
each declared an array of bare `object`, which is not a wrong shape but no
shape, and freezing it would have frozen a promise nothing can ever fail
against.

Two rules on them, and neither is optional:

- **The CMS menu does NOT replace the tab bar.** An `awcms` menu item carries
  ONE label — there is no per-locale label in the schema — so a CMS-driven
  primary navigation would put this site's main interface back into a single
  language. The tab bar renders through the PO catalogue and stays; the CMS menu
  is a secondary footer region.
- **`bodyText` is escaped, never rendered as HTML.** The write path over there
  REFUSES markup rather than sanitizing it, so rendering it as HTML would grant
  the trust that path declined.

A menu item of type `page` is dropped with a warning naming it: this template
has no page route, and a published dead link is a reader's problem while the
warning reaches the editor who can fix it.

<!-- permukaan:dipanggil:mulai -->
| Surface called | Called from |
| --- | --- |
| `/api/v1/blog/posts` | `src/lib/content.ts` — the build feed traversal, `view=full` + `order=created_at` + cursor |
| `/api/v1/media/objects` | `src/lib/awcms/media.ts` — media resolution, max 100 ids per request |
| `/api/v1/media/public-origin` | `src/lib/awcms/media.ts` — the media origin for `img-src` |
| `/api/v1/site-profile/composed` | `src/lib/awcms/profil.ts` — who the site is: masthead, footer, contact, social links, `Organization` |
| `/api/v1/blog/terms` | `src/lib/awcms/taksonomi.ts` — the tenant's vocabulary for the category/tag archives, `order=created_at` + cursor (never the default alphabetical list, which truncates silently) |
| `/api/v1/blog/menus` | `src/lib/awcms/navigasi.ts` — the tenant's navigation menus, rendered as a SECONDARY footer region; the localised tab bar is NOT replaced |
| `/api/v1/blog/widgets` | `src/lib/awcms/navigasi.ts` — widgets in their declared positions; `bodyText` is plain text and is escaped, never rendered as HTML |
| `/api/v1/site-search/query` | `src/lib/pencarian.ts` — the reader's search results. The ONLY surface called from the READER's browser at runtime rather than from the build: no headers, no credentials, tenant from the `Origin` (`awcms` ADR-0107) |
| `/api/v1/site-search/suggest` | `src/lib/pencarian.ts` — the typeahead behind the same box, same origin rule, same anonymity |
| `/api/v1/analytics/collect` | `src/lib/beacon.ts` — one page view, posted from the READER's browser WITHOUT credentials so the `awcms_visitor_key` cookie never lands (ADR-0044). The only request in this repo that carries a header, and it MUST: `checkOrigin` over there refuses a form-like content type, so only `application/json` gets through — which is what the `OPTIONS` handler exists for |
| `/api/v1/newsletter/subscribe` | `src/lib/newsletter.ts` — a reader subscribes from the site's own footer form. The FIRST call in this repo that WRITES from a stranger's browser: it makes `awcms` send mail to an address somebody typed. Carries `content-type: application/json` and no credentials; the tenant comes from the `Origin`, verified against `awcms_tenant_domains` (`awcms` ADR-0118) |
| `/api/v1/newsletter/confirm` | `src/lib/newsletter.ts`, from the page at `/newsletter/confirm` — where the link in the confirmation email lands. This is where consent is recorded, so the token is posted on a CLICK and never on page load: a link scanner in a mail client would otherwise record consent no human ever gave |
| `/api/v1/newsletter/unsubscribe` | `src/lib/newsletter.ts`, from the page at `/newsletter/unsubscribe`. Same shape, and `awcms` PRD §30 makes it the one surface that must never ask a reader to prove who they are first |
<!-- permukaan:dipanggil:selesai -->

### Promised, not yet called — NONE today

`awcms`'s own contract keeps CONSUMED and COMMITTED apart, and its reason
transfers exactly: *"a promise and a dependency both deserve stability, but they
fail differently."* This block is that second list, on this side.

A path here appears in `src/` and is **not called** — the feature that would call
it is switched off. The gate over the table above refuses a path that is in the
source and in neither block, so a surface still cannot land silently; what it can
now do is land as a promise rather than as a lie about what the build calls.

**The block is empty, and that is a state rather than an omission.** Its one
entry, `/api/v1/newsletter/subscribe`, sat here from 27 to 28 August 2026 while
four measured things in `awcms` made the endpoint unreachable from a static
site. `awcms` ADR-0118 closed all four and froze the three newsletter paths as
COMMITTED, so they moved up into the called table above — in that order, which
is the order both repos' Definition of Done requires.

<!-- permukaan:dijanjikan:mulai -->
| Surface promised | Blocked on |
| --- | --- |
<!-- permukaan:dijanjikan:selesai -->

```
NOT CALLED (3)
GET /api/v1/blog/posts/{id}    hydrating one post — REMOVED by ADR-0018.
                               It used to be N+1: one request per post, per build,
                               to an admin endpoint, on every publish. The build
                               feed replaced it. Do not bring it back "for one
                               missing field" — that field is in `view=full`.
GET /api/v1/auth/session       session introspection — it belongs to the portal BFF,
                               which does not exist yet. `awcms` refuses machine
                               credentials here with the same 401 as an unknown
                               token (anti-oracle, ADR-0049), so it is NOT a way
                               to check a build token.
POST /api/v1/access/machine-credentials
                               how a HUMAN issues a build token, once, outside the
                               build. It is frozen as COMMITTED over there, not
                               because this repo calls it. Since 13 August 2026
                               this surface also issues WRITE-class credentials —
                               never use it for a build token.
```

All three are outside the marked block above, and **it is this `NOT CALLED (3)`
fenced block** that is not gated — the marked table above it is gated against the
code in both directions. What guards this block is only a reader's eye. If one of
them starts being called from `src/`, the table above goes red first.

## `awcms` refusals that MUST be imitated in the test doubles

A test whose double is more lenient than the real `awcms` will be green for code
that fails in production. `tests/kontrak-awcms.test.mjs` imitates all of these:

- `view=full` without `order=created_at` → **400**, not ignored.
- Without `view=full` → the list gives a **summary**, not full rows.
- `ids` beyond 100 → **400**, not silently truncated.
- A media id that does not resolve is reported in `unresolved`, **not dropped**.

## Images and share cards

Resolved **once per build** in `src/lib/content.ts`, with the results in
`LocalizedArticle.gambar` and `LocalizedArticle.kartuShare` (ADR-0025/0026).

- The share-card order `seoImageMediaId ?? featuredMediaId` **belongs to `awcms`**;
  do not reassemble it here.
- `awcms` media win over local art in `src/assets/` — specific beats generic
  (ADR-0024/0025).
- **One id missing** → placeholder, the build continues. **Zero out of N** → the
  build fails; that means a token without `media.read`, an older `awcms`, or
  media that is not configured.
- A card carries its **own** MIME type and dimensions. The 1200×630 constant
  applies only to `SITE_SOCIAL_IMAGE`, and only because `.env.example` contracts
  it.

## `img-src` is asked for, not copied

`scripts/asal-media.mjs` asks for the media origin at build time and writes
`dist/server/asal-media.json`; `server/penyaji.mjs` reads it and widens
`img-src`. **Do not** copy `NEWS_MEDIA_R2_PUBLIC_BASE_URL` here — two copies of
one value that agree until one of them is edited, with a failure that never names
its cause: images silently blocked by a policy that looks perfectly fine.

The `Dockerfile` **must** copy that file. Without it the server falls back to
`img-src 'self'` and every article image is blocked, on an image whose build was
green.

## Before adding a fourth surface

Apply the [ADR-0023](../../../docs/adr/0023-penahanan-dipersempit-pekerjaan-tanpa-awcms.md)
test: **would this change be rewritten if `awcms` changed?** If yes, it needs an
`awcms` instance to be proven — and **"the endpoint already exists" is not an
answer of "no"**. This template repo has no instance; that is exactly why its CI
conditions the build on `vars.AWCMS_API_URL`.

That test was **not** withdrawn when the ADR-0021 hold ended
([ADR-0027](../../../docs/adr/0027-penahanan-adr-0021-selesai.md)). Its premise
changed; its boundary did not.

## `awcms` decisions that change what is true here

Check these when `awcms` releases a new ADR — not every time, but every time an
ADR touches public content, media, or credentials.

| `awcms` | Its consequence here |
| --- | --- |
| ADR-0049/0050 — machine credentials + BFF session handover | **Already absorbed.** The tenant comes from the token, with no tenant header |
| ADR-0056 §B — a media object may be purged, its reference becoming inert | **Already absorbed.** One id missing → placeholder; ZERO out of N → the build fails |
| ADR-0071 — the URL vocabulary is split; supersedes ADR-0059 | **Already absorbed** ([ADR-0036](../../../docs/adr/0036-news-adalah-kosakata-repo-ini-dan-sebuah-tab-yang-memikulnya.md)). All four `/news/**` routes were **removed** in `awcms` on 8 August 2026 and now 301 to `/blog/{tenantCode}/**` — **except** for a tenant with `legacyTenantRouteEnabled: false`, which has already switched off its entire public content surface and is therefore still answered 404 rather than given a 301 towards a certain 404 (`awcms` ADR-0071 §4 item 3); `publicRouteMode` and `withHostResolvedBlogTenant` were withdrawn along with them. `/blog/**` is now permanent `awcms` vocabulary — **path-scoped**, not host-resolved — and `/news/**` is this repo's vocabulary, in the shape of a tab. The old sentence "both are host-resolved, so one domain can only be served by one of them" no longer describes anything and has been deleted from this row. **The SHAPE of that vocabulary moved again on 15 August 2026** — see the ADR-0098 row below; the ownership split it decided did not |
| The `published_at` public predicate on the `awcms` news routes | **Absorbed since 7 August 2026** (ADR-0033). `IS NOT NULL` is imitated exactly; `<= now()` is imitated with a 15-minute clock-skew tolerance, because the two timestamps come from two machines and the normal path is publish → webhook → build. `visibility` is deliberately kept STRICTER: static output has no "only through a direct link" state |
| ADR-0061 — host-resolved surfaces may be cached at the edge | Not applicable: this site does not go through Varnish, and has no 404 branch that distinguishes tenants |
| ADR-0062 — skills are gated against their code | **Fully absorbed since 5 August 2026.** `bun run audit:dokumen` checks the file paths named by this file AND the `ADR-NNNN` citations — one that does not resolve to `docs/adr/` and is not marked as another repo's is a violation |
| ADR-0065 — the `awcms-astro` consumer contract is frozen | **The boundary is guarded from both sides.** The marked table above is gated here (ADR-0030); the response shapes of its five paths are frozen over there (additive subset, `$ref` closure). When the fixture over there is regenerated touching a CONSUMED path, the adapter here changes too — simultaneously |
| ADR-0070 — the family roles: this repo bears public + USER admin | **Already absorbed** ([ADR-0034](../../../docs/adr/0034-publik-secara-bawaan-admin-hanya-bila-dinyatakan.md)). Not adapter work, but it is what determines that a fourth surface **may** exist one day. Its condition is recorded there: that narrowing holds as long as `owner` stays refused by a gate here |
| ADR-0073 — `suspended` is a SERVICE status | **A NEW build failure mode.** A `suspended` **or** `inactive` tenant is answered `403 TENANT_SUSPENDED` (`matchedPolicy: "tenant_suspended"`), and since that ADR the refusal reaches **machine credentials** too. It is decided before permissions are looked up, so no token scope fixes it. The build fails completely, zero files published — and it reads exactly like a revoked token |
| ADR-0084 — an entitlement REFUSES, it never grants | **New refusal vocabulary, but it CANNOT yet reach this build.** `403 ENTITLEMENT_REQUIRED` has the same shape as `TENANT_SUSPENDED` — above the grant lookup — but entitlements are decided per MODULE, and the only `awcms` module declaring one today is `tenant_domain` (`custom_domain`, in the DEFAULT package, refusing zero tenants). This build only calls `blog_content` and `media_library`. Recorded for its shape, not because it has appeared in a log. The same ADR raised the family's `moduleDescriptorContractVersion` to **3.1.0** (the optional `requiresEntitlement` field) — a pure addition, zero work here |
| ADR-0083 — the `awcms` template deploys to ONE environment | **The family vocabulary narrows.** The member `"staging"` was **removed** from the union of module deployment profiles (now `development \| production \| offline-lan`), so neither an example nor a document here may narrate "a staging token" as an environment on a par with production |
| ADR-0093 — a suspended partner STOPS reaching | **A CONDITIONAL build failure mode — the first that depends on who ISSUED the token.** `403 PARTNER_SUSPENDED` (`matchedPolicy: "partner_suspended"`) refuses every **delegated** actor whose partner is no longer `active`, at the chokepoint, per request. A machine credential inherits the `principal_kind` of its service account, and nothing in the `awcms` issuing path forbids that service account from being a **delegated** tenant user: the service-account picker lists every tenant user without filtering by kind. Whoever picks wrongly is certainly the site's tenant admin — the agency itself cannot issue anything in `identity_access` (`awcms` ADR-0090). The rule is therefore operational: issue the build token on a service account belonging to the **site's** tenant. And its diagnosis is deliberately made harder by a decision that is correct over there: suspension makes a grant **inapplicable, not absent**, so inspecting the grant list will not show anything missing |
| ADR-0094 — a data subject is answered PER TENANT | **Zero adapter work, and that is exactly what has to be recorded.** This build publishes a **static copy**, so anonymising a subject in `awcms` does not reach a single already-published file until the next build — and copies already distributed can live longer still (CDN caches, the git history of `dist/` if a site commits its output). **That obligation is now LIVE — do not read the old sentence here.** This entry used to say the template publishes *zero per-person data*; [ADR-0042](../../../docs/adr/0042-a-byline-is-the-first-per-person-data-this-template-publishes.md) retires that claim. Since `awcms` ADR-0109 an author may opt into a public byline, and it is rendered on all three surfaces that name an author: the article page, the JSON-LD `author` — a `Person` when there is one ([`src/lib/schema.ts`](../../../src/lib/schema.ts)) — and the article's Atom entry ([`src/lib/feed.ts`](../../../src/lib/feed.ts)). Both are gated now ([`tests/schema.test.mjs`](../../../tests/schema.test.mjs), [`tests/feed.test.mjs`](../../../tests/feed.test.mjs)), including the refusal to emit `@id`/`url`/`sameAs`/`<uri>`/`<email>` beside the name. **No new surface is called** — `authorByline` rides on `?view=full`, which the build already traverses. What bounds the exposure: the byline is opt-in, `NULL` (every pre-ADR row) renders no byline row at all rather than the publisher's name, and a site that publishes bylines must be able to trigger a **rebuild** — stated, not gated, because nothing here can observe an erasure in `awcms`. The same ADR raised the family's `moduleDescriptorContractVersion` to **4.0.0** (the `SubjectDataErasure` union widens, `tenantColumn` becomes `string \| null`) — zero work here, because this repo declares no module descriptor at all |
| ADR-0092 — machine credentials may WRITE | **An old premise falls, and it is a security premise.** "Machine credentials cannot write" stops being a property of the CLASS: a write class exists, with an action ceiling of `create`/`update` **in code** (not a column), mandatory CIDR binding, **REFUSED when `clientIp` is unknown** (fail-closed), a maximum age of 30 days (database CHECK 31) instead of 365, and the refusal sentinel `machine_credential_write_forbidden`. Every credential issued before its migration stays read-only, with no backfill. **This repo's build token MUST stay in the read class** — now an issuing decision that is maintained, not a property that is inherited. Absorbed in [`.env.example`](../../../.env.example) and in the [ADR-0018](../../../docs/adr/0018-kontrak-build-token-mesin-dan-traversal-konten.md) banner |
| ADR-0098 — the cache key carries the locale, and it carries it in the PATH | **The first `awcms` decision since ADR-0071 to change the SHAPE of a public URL, and the first in a long while that touches nothing in the adapter.** Since 15 August 2026 the canonical public content URL over there is `/{locale}/blog/{tenantCode}/**`; the bare path renders nothing and answers `307`, `private, no-store`. Two consequences here, and both are documentation rather than code. **First:** every sentence in this repo pointing a reader at `awcms`'s own public surface was naming a URL that now redirects, and a retired `/news/**` link is now **two hops** — `301` to the bare path, then `307` to the prefixed one — because the `Location` rewrite over there only carries a locale the reader already had. **Second, and it is the one worth holding on to:** this repo does **not** follow the prefix. Its default locale keeps the root (`/panduan/`, not `/id/panduan/`), because the failure ADR-0098 exists to prevent is structurally unavailable in a static build — `server/penyaji.mjs` reads `req.url` and nothing else, so the cache key and the body already agree. What IS imported is that ADR's decision 2: `Vary: Cookie` and `Vary: Accept-Language` are REFUSED on every response here. Recorded with its checker in [ADR-0041](../../../docs/adr/0041-locale-stays-at-the-root-and-two-vary-names-are-refused.md) |
| ADR-0097 — English is the source language, Indonesian the mirror | **Family alignment, and this repo got there first.** The same decision landed here as [ADR-0039](../../../docs/adr/0039-english-is-the-source-language.md) with the same mechanism — the marker moves to the mirror, the gate DETECTS drift and never translates, and the ledger may only shrink. The one difference is size, and it is worth knowing before reading anything over there: that repo's ledger opened at **253** outstanding documents, so **a bare `<name>.md` in `awcms` is still Indonesian far more often than not**. Do not read an `awcms` document's path as a promise about its language yet |
| ADR-0095/0096/0099 — the reader's language, the self-service account surface, and the login address | **Nothing for the adapter — and their place is not this file.** All three shape an AUTHENTICATED surface: where a language preference lives (the PRINCIPAL, global, no `tenant_id`), what someone may change about themselves with no permission at all, and what proof an address transfer needs. They matter to this repo's SECOND role and their consequences are recorded in [`permukaan-admin-user.md`](../../../docs/awcms-astro/permukaan-admin-user.md) §5. Named here only so their absence from this table reads as "examined, belongs elsewhere" rather than "not yet read" |

**The `awcms` ADR wave 0072–0099 (9–15 August 2026) has been read in full, and
what does not appear in the table above is not relevant here — not merely
unexamined.** What is not relevant, with its reason, so that the silence can be
told apart: 0072 (decision log retention), 0074/0077 (the outbox and sync pull),
0075 (SSE), 0076 (retention descriptors for infrastructure tables), 0078–0082
(grant shapes, user groups, invitations), 0085–0088 (identity, lockout, MFA,
tenant selection), 0089–0091 (partners, delegated access, attribution) — all of
them touch **authenticated** surfaces and not one touches the static build path.
**The last three clusters** (0078–0082, 0085–0088, 0089–0091) do still matter to
this repo, but their place is
[`permukaan-admin-user.md`](../../../docs/awcms-astro/permukaan-admin-user.md),
not this file: they shape the USER admin surface, not the content adapter — and
so do 0095, 0096 and 0099, which have a row above for that reason alone.

## The timeout: it exists, and it is NOT the same as a retry

`awcmsGet` installs an `AbortSignal.timeout` — 30 seconds by default, changed
through `AWCMS_API_TIMEOUT_MS`. It does not collide with the "no retries" rule
above, and the difference is worth holding on to: **no-retries decides what
happens when `awcms` answers badly; the timeout decides what happens when it
never answers at all.** Both end the same way — the build fails, zero files
published.

What it guards against is not slowness but **silence**: a connection that is
accepted and then never answered, the most common failure shape of a database
that has run out of connections. `fetch` has no default timeout, so before this
the build hung until the CI job limit killed it — with a message naming the job,
not `awcms`.

Two things not to change without reading why:

- **The limit is generous (30 seconds), and that is deliberate.** `view=full`
  carries the whole `contentJson`; a large tenant on a cold database can legitimately
  be slow. Setting it to a "healthy request path" value turns a slow build into a
  failed build — the opposite of its purpose.
- **A malformed value is REFUSED, including `0`.** `0` looks like "no limit" and
  in fact restores exactly the hang this gate exists to prevent.

## The absorption ledger — every `awcms` decision, with a verdict

The table above records CONSEQUENCES. This block records COVERAGE, and it is
the half that had no checker: `audit:dokumen` asks whether a cited ADR
resolves; nothing asked whether an `awcms` decision exists that nothing here
cites. That question's answer drifted for twelve decisions — ADR-0100 through
ADR-0116, accepted in nine days, of which this repo cited five. Two of the
misses were not small: ADR-0100 §5 names a pull request IN THIS REPO as the
condition for deleting a compatibility writer `awcms` still carries, and
ADR-0114 replayed 67 redirect rules against this repo's built server and got
404 on every one.

`bun run audit:serapan` reads the block below and refuses three things: a gap
in the numbering, a `belum` count that disagrees with its stated ceiling, and —
when the network allows — an `awcms` ADR that has no row here at all. That last
check is the only one that can catch "`awcms` shipped ADR-0117 and nobody
looked"; it is SKIPPED and says so when the index cannot be fetched, because a
gate that reddens on a dead network gets switched off and a gate that greens on
one lies in the comfortable direction.

Three verdicts, and the middle one is the point: **silence has to be
distinguishable from oversight.**

- `diserap` — its consequence is recorded in a named document here.
- `diperiksa` — read, does not touch the static build path, reason stated.
- `belum` — nobody here has read it. A shrink-only ledger, like ADR-0039's.

<!-- serapan:adr-awcms:mulai -->

    lantai: 0049
    plafon-belum: 0

`lantai` is ADR-0049 because that is where the relationship starts: machine
credentials and the BFF session handover are the first `awcms` decisions this
repo is a party to. Below it, `awcms` ADRs 0000–0048 are platform foundations
predating this consumer, and this repo has **not** examined them systematically
— that is stated here rather than implied by their absence.

| ADR | Verdict | Where, or why not |
| --- | --- | --- |
| 0049 | diserap | The tenant comes from the token — table above, and `src/lib/awcms/tenant.ts` refuses the retired header variables |
| 0050 | diserap | BFF session handover — table above; the BFF does not exist yet, and `/auth/session` is COMMITTED, not consumed |
| 0051 | diserap | Admin screens consolidated in `awcms` — narrowed by ADR-0070, which [ADR-0034](../../../docs/adr/0034-publik-secara-bawaan-admin-hanya-bila-dinyatakan.md) absorbs |
| 0052 | diperiksa | Region dataset activation becomes a CLI job and its HTTP surface is deleted. No surface this build calls |
| 0053 | diperiksa | Platform-scoped permissions. Shapes an authenticated grant, not a build credential's read path |
| 0054 | diperiksa | Tenant provisioning. One creation path inside `awcms`; a site is provisioned before this repo exists for it |
| 0055 | diserap | Development confined to `awcms` and `awcms-astro` — the premise of [ADR-0023](../../../docs/adr/0023-penahanan-dipersempit-pekerjaan-tanpa-awcms.md)'s test |
| 0056 | diserap | A purged media object goes inert — table above; one id missing → placeholder, zero of N → the build fails |
| 0057 | diperiksa | Blog PAGE lifecycle. This template has no page route; a `page` menu item is dropped with a warning naming it |
| 0058 | diperiksa | Disposition of unenforced permissions. Authenticated surface |
| 0059 | diserap | Host-resolved public content routes — SUPERSEDED by ADR-0071, which the table above absorbs |
| 0060 | diperiksa | Business-scope hierarchy supplied by a tenant admin. Authenticated surface |
| 0061 | diserap | Host-resolved surfaces are edge-cacheable — table above; not applicable, this site does not go through Varnish |
| 0062 | diserap | Skills are gated against their code — table above; `bun run audit:dokumen` is this repo's answer |
| 0063 | diperiksa | Ownership grants run through the chokepoint. Authenticated surface |
| 0064 | diperiksa | Foreign-key columns must be index-reachable. A database rule; this repo has no database |
| 0065 | diserap | The consumer contract is frozen — table above; the boundary is guarded from both sides |
| 0066 | diperiksa | Shared rate limiting and full auth-surface coverage. The three reader-browser calls are rate-limited THERE, and this repo's debounce is a courtesy, not a control (ADR-0043) |
| 0067 | diperiksa | Core Web Vitals collection. `awcms` collects; this repo REFUSES field/RUM measurement and says so — [ADR-0032](../../../docs/adr/0032-dua-celah-terakhir-ditutup-dengan-syarat-kejujuran.md) closes the same gap in a lab |
| 0068 | diserap | Family standards posture and recorded divergences — [ADR-0028](../../../docs/adr/0028-jangkar-standar-performa-dan-keamanan.md) states this repo matches those editions |
| 0069 | diserap | Cross-origin isolation divergence — recorded over there at this repo's request; this repo sends neither COOP nor CORP |
| 0070 | diserap | The family roles: this repo bears public + USER admin — table above, and [ADR-0034](../../../docs/adr/0034-publik-secara-bawaan-admin-hanya-bila-dinyatakan.md) |
| 0071 | diserap | The URL vocabulary is split — table above, and [ADR-0036](../../../docs/adr/0036-news-adalah-kosakata-repo-ini-dan-sebuah-tab-yang-memikulnya.md) |
| 0072 | diperiksa | Decision-log retention. `awcms` internals |
| 0073 | diserap | `suspended` is a SERVICE status — table above; a new build failure mode no token scope fixes |
| 0074 | diperiksa | The outbox. Authenticated/infrastructure; the publish→webhook→build path is documented in `docs/deploy-coolify.md`, not consumed as an API |
| 0075 | diperiksa | SSE. No streaming surface in a static build |
| 0076 | diperiksa | Retention descriptors for infrastructure tables. No consumer surface |
| 0077 | diperiksa | Sync pull. Authenticated surface |
| 0078–0082 | diperiksa | Grant shapes, user groups, invitations. All authenticated; their consequences for this repo's SECOND role live in [`permukaan-admin-user.md`](../../../docs/awcms-astro/permukaan-admin-user.md) |
| 0083 | diserap | The `awcms` template deploys to ONE environment — table above; `"staging"` left the deployment-profile union |
| 0084 | diserap | An entitlement REFUSES, never grants — table above; recorded for its shape, it cannot yet reach this build |
| 0085–0088 | diperiksa | Identity, lockout, MFA, tenant selection. Authenticated; see `permukaan-admin-user.md` |
| 0089–0091 | diperiksa | Partners, delegated access, attribution. Authenticated; see `permukaan-admin-user.md` |
| 0092 | diserap | Machine credentials may WRITE — table above; this build's token MUST stay read-class |
| 0093 | diserap | A suspended partner stops reaching — table above; the first failure mode that depends on who ISSUED the token |
| 0094 | diserap | A data subject is answered per tenant — table above, retired in part by [ADR-0042](../../../docs/adr/0042-a-byline-is-the-first-per-person-data-this-template-publishes.md) |
| 0095 | diserap | The reader's language lives on the PRINCIPAL — `permukaan-admin-user.md` §5 |
| 0096 | diserap | The self-service account surface — `permukaan-admin-user.md` §5 |
| 0097 | diserap | English is the source language — [ADR-0039](../../../docs/adr/0039-english-is-the-source-language.md) landed the same decision here first |
| 0098 | diserap | The cache key carries the locale in the PATH — [ADR-0041](../../../docs/adr/0041-locale-stays-at-the-root-and-two-vary-names-are-refused.md); this repo keeps its default locale at the root and refuses two `Vary` names |
| 0099 | diserap | The login address and what a transfer must prove — `permukaan-admin-user.md` §5 |
| 0100 | diserap | Portable Text is the canonical body, and since #74 this repo **reads `bodyPortableText` directly** (`src/lib/portable-text.ts`). Its §4 keeps `content_json` alive as the ENVELOPE because this repo stores a sidecar in it — that half stands. **Its §5 condition is now MET**, so `awcms` may delete its compatibility WRITER; the fallback here is a separate deletion with its own condition (every row backfilled), and the two must not be done together |
| 0101 | diserap | The client asset budget splits by audience — `READER_BUDGET_BYTES` = 24,000 there. This repo carries the family's reader surface and has no byte budget at all; that gap is now tracked, not merely true |
| 0102 | diserap | Tenant site identity is its own module — the fourth consumed surface, `src/lib/awcms/profil.ts` |
| 0103 | diserap | Newsletter is its own module — three anonymous public endpoints exist and no reader here can reach them. A fourth reader-browser call when it lands, and it must be COMMITTED there first |
| 0104 | diserap | The build reads the taxonomy — the fifth consumed surface, and since [ADR-0045](../../../docs/adr/0045-a-section-comes-from-the-cms-vocabulary-not-from-a-sidecar-only-we-write.md) it is also what decides an article's SECTION |
| 0105 | diserap | Navigation is CMS data and the localised tab bar stays — surfaces six and seven |
| 0106 | diserap | Domain verification proves control of the zone: `_awcms-verify.<host>` TXT, 32 server-minted random bytes, and supplying either half is REFUSED with a 400 naming the field. Zero adapter work — it is how a site's own domain becomes `active`, done once by a human before this repo builds anything for it |
| 0107 | diserap | A reader's browser may search, and the Origin names the tenant — surfaces eight and nine, [ADR-0043](../../../docs/adr/0043-the-readers-browser-calls-awcms-and-nothing-else-changes.md) |
| 0108 | diserap | What an export withholds and what an erasure destroys are different questions. `anonymizedColumns` is now declared separately from `redactedColumns`. Zero adapter work and it sharpens [ADR-0042](../../../docs/adr/0042-a-byline-is-the-first-per-person-data-this-template-publishes.md)'s stated-not-gated obligation: an erasure over there still reaches no already-published file here until a rebuild |
| 0109 | diserap | A byline is opted into — [ADR-0042](../../../docs/adr/0042-a-byline-is-the-first-per-person-data-this-template-publishes.md), the first per-person data this template publishes |
| 0110 | diserap | A video-embed origin is an OPERATOR's decision — `BLOG_VIDEO_EMBED_ENABLED` adds `youtube-nocookie.com` to `frame-src` there. This repo REFUSES an embed and renders `video_news` as a link; recorded as [ADR-0046](../../../docs/adr/0046-a-video-embed-is-refused-here-and-that-is-a-divergence-not-an-omission.md) |
| 0111 | diserap | A tenant's exact redirect beats the retired `/news` family rewrite. Precedence over paths whose vocabulary this repo owns — and it is resolved in a middleware that runs THERE, which is exactly the gap ADR-0114 measures |
| 0112 | diserap | `.astro` frontmatter is type-checked by extraction, because `astro check` cannot run there. The family manifest's `astro-files-not-type-checked` divergence says this repo's TypeScript 6 pin *"is the only reason its gate runs"* — cross-cited from [ADR-0037](../../../docs/adr/0037-pin-typescript-6-adalah-syarat-hidupnya-gerbang-astro-check.md) |
| 0113 | diserap | A legacy rubrik pair flattens to its rubrik, landing on `/kategori/{slug}` — a route THIS repo serves. Its shape-4 decision is retracted; its §Consequences claim that this repo needs no change is false, and ADR-0114 supersedes that half |
| 0114 | diserap | The edge owns the legacy 301s, and an article is found by its id. 67 rules replayed against this repo's real built server: 404 on every one, zero `Location` headers. This origin has no redirect capability at all |
| 0115 | diserap | The migrated archive lands on ONE origin — `/{section}/{slug}/` here — and the importer DECLARES the section into `content_json.awcmsAstro.kategori`, which is why [ADR-0045](../../../docs/adr/0045-a-section-comes-from-the-cms-vocabulary-not-from-a-sidecar-only-we-write.md) keeps the sidecar winning |
| 0116 | diserap | The legacy site is a feature reference, not a migration source. Withdraws the obligation 0113–0115 serve while leaving their mechanics standing — without this row those three read as live work orders |

| 0117 | diperiksa | `:latest` moves only after the release environment's approval signs it. Entirely `awcms`'s own release workflow — this repo builds no container from that pipeline and pulls no `:latest` — so nothing here changes. Recorded because silence and irrelevance read identically |
| 0118 | diserap | The newsletter endpoints answer a cross-origin browser and resolve that origin's tenant, the four blockers this repo measured are closed, and the three paths are frozen as COMMITTED. Absorbed by [ADR-0049](../../../docs/adr/0049-a-reader-may-subscribe-and-the-first-write-from-a-strangers-browser.md), which turns the caller on |

<!-- serapan:adr-awcms:selesai -->

## References

- [`docs/adr/0018-kontrak-build-token-mesin-dan-traversal-konten.md`](../../../docs/adr/0018-kontrak-build-token-mesin-dan-traversal-konten.md)
- [`docs/adr/0025-gambar-artikel-dari-media-awcms.md`](../../../docs/adr/0025-gambar-artikel-dari-media-awcms.md)
- [`docs/adr/0027-penahanan-adr-0021-selesai.md`](../../../docs/adr/0027-penahanan-adr-0021-selesai.md)
- [`docs/awcms-astro/integrasi-awcms.md`](../../../docs/awcms-astro/integrasi-awcms.md)
- [`AGENTS.md`](../../../AGENTS.md) §Data source
