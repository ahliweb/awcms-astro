🇬🇧 English (source) · 🇮🇩 [Bahasa Indonesia](AGENTS.id.md)

# AGENTS.md — the `awcms-astro` working contract

Applies to humans and AI agents working in this repo alike. Where a rule here
collides with common habit, the rule here wins — every item is written because
breaking it has caused, or would certainly cause, a defect a reader can see.

## What this repo is

An AWCMS family template on Astro with
[`ahliweb/awcms`](https://github.com/ahliweb/awcms) as its content backend and
system of record. Its public site is **static**: content is pulled at **build**
time, not at request time. What lives entirely in `awcms` are the **SYSTEM**
admin screens — modules, roles, tenants, audit trail, anything cross-tenant —
not every screen that asks its reader to sign in (§This repo's role).

Authenticated surfaces planned here therefore have **two doors**, and neither
has code yet: the Jualanku portal BFF (ADR-0014), and the USER admin surface a
site declares through `permukaanAdmin`
([ADR-0034](docs/adr/0034-publik-secara-bawaan-admin-hanya-bila-dinyatakan.md)).
This template itself declares zero authenticated surfaces, and `bun test` is
what proves it.

And a screen always draws something that **already exists**, so one question
comes before §This repo's role: where a new capability is built. The answer is
[ADR-0038](docs/adr/0038-kebutuhan-backend-menjadi-modul-di-awcms.md) — **a
backend need becomes a MODULE in `awcms`**, never a folder here.

## This repo's role (in force 8 August 2026 — ADR-0034)

**The PRIMARY function of this repo — and of every site born from it — is
PUBLIC PAGES.** That is its original state and remains its main one: this
template declares zero authenticated surfaces, and `bun test` goes red if a
route slips out of `output: 'static'` without being declared.

**Beyond that primary function, a site may DECLARE that it also carries admin
pages for USERS.** Since
[ADR-0034](docs/adr/0034-publik-secara-bawaan-admin-hanya-bila-dinyatakan.md)
that is allowed, through one door: `permukaanAdmin` in
[`src/config/site.ts`](src/config/site.ts). Empty means public only.

**Admin for a USER, not the MAIN ADMIN.** This is the boundary, and it is not a
nuance. What may live here is a surface a signed-in user uses to do their own
part on THIS site — writing an article, submitting it for review, managing
their profile. What may never live here is the **main admin**: the screens that
manage the SYSTEM — modules, roles, tenants, audit trail, anything
platform-scoped — and that stays in `awcms`'s own `/admin/*` (`awcms` ADR-0051
**as narrowed by** `awcms` ADR-0070).

**`owner` therefore never exists here.** It is the full-system super manager.
Only roles **below** owner may be declared.

The second column of the table below is **what is managed**, not who uses it.
That axis was chosen by `awcms` ADR-0070 precisely to replace the audience axis,
and the difference decides: an `owner` writing an article is doing USER work,
while an author who can edit the role list is not — whatever their job title.

| Repo          | Frontend role                                                        | What is managed there                                       |
| ------------- | --------------------------------------------------------------------- | ------------------------------------------------------------ |
| `awcms`       | public frontend + the **main admin** of the whole system, including `owner` | SYSTEM: modules, roles, tenants, audit trail, anything cross-tenant |
| `awcms-astro` | **public pages as the primary function**; optionally USER admin beside them + BFF | the contents of ONE site: writing, submitting for review, one's own profile |

Five rules make that exception something other than a hole — numbered from 0
because the first is not an extra condition but the state the other four guard:

0. **Public remains its primary function.** Declaring an admin surface does not
   turn this site into an admin application with a brochure attached.
   `permukaanAdmin.prefiks` may therefore not be `/`, may not be a locale
   prefix, and may not be a tab slug — all three would put a public section
   behind a login, and the site would still build green: every page is there,
   and every one of them now asks its reader to sign in first.

1. **It must be DECLARED, it may not simply appear.** One route file with
   `export const prerender = false` is enough to stand up an authenticated
   surface on a domain whose owner never decided to have one — with a green
   build. `tests/peran-situs.test.mjs` refuses an on-demand route whose prefix
   is in neither `permukaanAdmin.prefiks` nor the Jualanku BFF prefixes of
   ADR-0014.
2. **Declaring it moves not one permission.** `awcms`'s default-deny RBAC/ABAC
   still decides every request. A declaration here draws a button; it grants
   nothing, and a role `awcms` refuses stays refused with its button on screen.
   This is the ADR-0017 item that ADR-0020 kept, and it is what makes ADR-0034
   not a reversal of ADR-0020: **what moves risk is the authorization gate, not
   the repo address where the button is drawn.**
3. **`owner` is refused by a gate, not merely by this sentence.** A
   `permukaanAdmin.peran` containing it reddens `bun test`.
4. **No feature exists ONLY here.** Every feature a user reaches through this
   site's admin surface **must also be manageable by `owner`** through `awcms`'s
   `/admin/*`. This rule runs in the opposite direction from item 3 and
   completes it for exactly that reason: item 3 keeps `owner` from getting IN
   here, this one keeps anything here from escaping `owner`. Its consequence
   sets the order of work — **`awcms` first, always.** A feature that lands here
   first is a feature nobody can switch off for a while.

**This template is indeed meant to grow into many variations.** Each derived
site has its own public surface and, if declared, its own USER admin surface,
according to what its users need to manage. What varies is the **shape of the
surface**, not the set of capabilities: two sites may differ greatly in what
they show and how, and both still stand on the same capabilities — owned,
permitted, audited, and revocable by `awcms`.

**One `awcms`, many sites.** One `awcms` instance may own many site repos at
once, each with its own public pages and optionally its own USER admin pages;
all of them still refer to the same `awcms` as **backend** and as **main admin
(`owner`)**. The repo you are editing is therefore not "the system" — it is one
face of one system. Never write code that assumes this site is the only one, and
never copy a capability across several sites: a capability used by more than one
site lives in `awcms` ONCE. Two copies are two places to patch, and the second
usually does not get patched.

The previous rule (ADR-0017, 31 July 2026) put owner/internal screens here. It
was **superseded** by ADR-0020 — not because the path was a dead end, but
because moving a screen was never the security control it was claimed to be.
That boundary is **not lifted** by ADR-0034: what opened is only SITE admin for
non-owner roles; SYSTEM admin stays `awcms`'s.

One other authenticated surface is still planned here, and it is not admin: the
**Jualanku portal BFF** (ADR-0014, `awcms` ADR-0045). The four rules below bind
**every** authenticated surface in this repo — BFF and site admin alike — and
were moved across whole from ADR-0017 because all four concern any authenticated
surface, not admin screens specifically:

1. **`awcms` remains the system of record.** This repo has no database; its data
   comes from `/api/v1/*` through the BFF. The browser never calls `awcms`
   directly and never holds its credentials.
2. **Permissions do not travel with a screen** — `awcms`'s default-deny
   RBAC/ABAC still decides. A surface here is not a looser second path.
3. **No shared cache** between the public surface and an authenticated one.
4. Every addition to an authenticated surface is judged as a **security
   surface**, not merely as a page.

Item 4 has one consequence that deserves to be named, because it takes the form
of a premise that collapses rather than a rule that is broken: **the official
reason this repo does not send `Cross-Origin-Opener-Policy` and
`Cross-Origin-Resource-Policy` is "it has no session to fence"** (`awcms`
ADR-0069, recorded as a family divergence with `reviewDate` 2027-02-04). The
first site to switch on `permukaanAdmin` invalidates that premise, and with it
the reason SRI was declined — "there are no cross-origin resources". Both must
be revisited in [`server/penyaji.mjs`](server/penyaji.mjs) before that surface
goes live. This template repo cannot gate it: it has no site that switches it
on, and writing it down as "gated" would be a claim nobody could stand behind.

Two contracts that used to block that surface — the tenant header and machine
credentials a BFF can hold — **have landed** in `awcms` (ADR-0049 and ADR-0050,
1 August 2026). What has not: their implementation here, with the prerequisites
in [`04-kesiapan.md`](docs/awcms-astro/jualanku/04-kesiapan.md).

**And that session contract moved again on 12 August 2026, so do not build on
memory.** The `awcms` changes that decide the shape of any surface asking people
to sign in: one human now has ONE credential across many tenants and their
lockout counter is **global** (ADR-0085, ADR-0086), MFA factors moved to the
principal so a reset by another tenant's admin also kills this site's user's
authenticator (ADR-0087), and a login with no tenant selected is answered `409`
together with a short-lived selection token instead of a session (ADR-0088).
Those two tenant selection/switching endpoints are **outside** the frozen
consumer contract of `awcms` ADR-0065 — calling them means agreeing their
contract there first, not adding them here. A handed-over (`handoff`) session —
exactly the BFF mechanism of ADR-0050 — is **forbidden** to switch tenants.

## A backend need becomes a MODULE in `awcms` (in force 14 August 2026 — ADR-0038)

§This repo's role answers **who may have a screen** here. This section answers
the question that comes first — **where a capability is built** — and the answer
is one sentence:
[ADR-0038](docs/adr/0038-kebutuhan-backend-menjadi-modul-di-awcms.md) decides
that **the unit of a backend need is a MODULE in `awcms`**: landing in that
repo's module directory, registered in its registry, through module admission
(`awcms` [ADR-0012](https://github.com/ahliweb/awcms/blob/main/docs/adr/0012-module-admission-and-trusted-registry-boundary.md)).
Not a folder here, not "a small service on the side".

What makes the address decisive: **family obligations attach to a module, not to
code.** A module carries its descriptor, its permissions in the catalogue, its
tables under RLS, its audit trail, its retention descriptor, and since `awcms`
ADR-0094 its data-subject descriptor too — a completeness that is gated there.
Not one of those obligations has anywhere to attach on code that lives in this
repo.

A piece of work is **backend** if it stores or becomes the authority over data
that is not a file in this repo, decides permissions, runs business rules,
touches anything cross-tenant, or provides a surface called by anyone other than
this site itself. What **stays** here and is not an exception but a different
thing: [`server/penyaji.mjs`](server/penyaji.mjs) (serving files and sending
headers — it owns no data), build-time reads, and the ADR-0014 BFF which
**composes** `awcms` calls for this site's own screens without owning a single
row of data. A write cache is data ownership by another name.

**This repo reads `awcms`; it does not write.** Until 13 August 2026 that was a
property of the machine-credential CLASS; since `awcms` ADR-0092 opened a write
class, it is a property that must be maintained deliberately — on the
token-issuing side (ADR-0018) and on the code side by
[`tests/tanpa-backend.test.mjs`](tests/tanpa-backend.test.mjs). That gate
refuses backend-class dependencies in `package.json`, a `fetch` with a `method`
other than `GET` in `src/` and `scripts/`, persistence artefacts, and the
disappearance of this very rule from the file you are reading. It checks
**shape, not intent**: a site that stores its data in a third-party service over
`GET` passes entirely.

## One test before starting anything (in force 4 August 2026 — ADR-0027)

**The ADR-0021 hold is OVER.** Both indicators that ADR set for itself were met
on 3–4 August 2026, and it was superseded by
[ADR-0027](docs/adr/0027-penahanan-adr-0021-selesai.md). New features, gates,
and documents may land again. ADR-0021 is still read as a historical note — it
explains why this repo was silent for two days, and its reasoning was right when
it was written.

What **replaces** it is one question, taken whole from
[ADR-0023](docs/adr/0023-penahanan-dipersempit-pekerjaan-tanpa-awcms.md) and not
changed at all:

> **Will this change be rewritten if `awcms` changes?**

Only the premise changed. While ADR-0021 held, "yes" meant *held until the
foundation is finished*. Now "yes" means *needs an `awcms` instance to prove its
calls are right before it lands* — the same boundary, a different reason, and
the second reason will never expire. This template repo has no instance; that is
why the `build` job in CI is conditioned on `vars.AWCMS_API_URL` being filled.

ADR-0023's explicit boundary has not changed either: **"the endpoint already
exists" is not an answer of "no".**

What that test still holds back, and by what: the **Jualanku portal BFF**
(ADR-0014) calls `awcms` on EVERY runtime request, not once per build, so its
shape is decided by `awcms`'s response on each request.

The reason this test is expensive to break has not changed: building on a
contract that is not yet stable means writing it twice, and this repo has
already paid that once — its content adapter was written for a summary list,
then rewritten when `awcms` shipped a build feed (ADR-0018), and the first
version published a site whose every article was empty, with a green build.

## Where work may land (in force 2 August 2026)

**The AWCMS family is two repos, and only two** (`awcms` ADR-0055):

| Repo                  | Role                                                                                                                             |
| --------------------- | -------------------------------------------------------------------------------------------------------------------------------- |
| `ahliweb/awcms`       | **System of record** — every authorization surface, every API, and every **SYSTEM** admin screen (`awcms` ADR-0051 + ADR-0070)    |
| `ahliweb/awcms-astro` | **Public pages as the primary function**, and a **USER admin surface** when the site declares one ([ADR-0034](docs/adr/0034-publik-secara-bawaan-admin-hanya-bila-dinyatakan.md), `awcms` ADR-0070); still an experience layer + BFF, and **never a source of truth** |

The pair of them is the **general-purpose replacement** for all three of the old
templates — not either one alone.

**The public URL vocabulary is split, one route family per repo** — and that
split runs both ways, so it is also a rule about what may NOT be built here:

| Vocabulary | Repo that serves it | Its form there                                                                          |
| ---------- | ------------------- | ----------------------------------------------------------------------------------------- |
| `/blog/**` | `ahliweb/awcms`     | `/{locale}/blog/{tenantCode}/**` since its ADR-0098 — path-scoped, with both the locale and the tenant code inside the path. The bare `/blog/{tenantCode}/**` renders nothing and answers `307` |
| `/news/**` | this repo           | a **tab** with slug `news` declaring `urutanSeksi: "terbaru"` — not a new route family    |

That first row is why the second half of this rule finally has a checker.
`awcms`'s canonical public URL is now shaped exactly like this repo's own
`/{lang}/{tab}/…`, so a tab whose slug is `blog` would not merely resemble the
other repo's vocabulary — it would collide with it character for character, on a
green build. [`tests/kosakata-news.test.mjs`](tests/kosakata-news.test.mjs)
refuses three shapes: a tab claiming the slug, a `permukaanAdmin.prefiks` entry
under `/blog`, and a route file writing the segment literally
([ADR-0041](docs/adr/0041-locale-stays-at-the-root-and-two-vary-names-are-refused.md)).
The rule is about the address, not the word — `/blog-panduan/` is this repo's own
URL and collides with nothing.

Do not build `/blog/**` here, and do not assume `awcms` still serves `/news/**`:
its four routes were **removed** there on 8 August 2026 and now 301 to
`/blog/{tenantCode}/**` — **except** for a tenant with
`legacyTenantRouteEnabled: false`, which has already switched off its whole
public content surface and is therefore still answered 404 rather than given a
301 towards a certain 404 (`awcms` ADR-0071 §4 item 3)
([ADR-0036](docs/adr/0036-news-adalah-kosakata-repo-ini-dan-sebuah-tab-yang-memikulnya.md),
`awcms` ADR-0071 superseding `awcms` ADR-0059). Since 15 August 2026 that 301 is
the **first of two hops**: it lands on the bare `/blog/{tenantCode}/…`, which
answers `307` to the locale-prefixed URL. What is split is the **URL**, not
ownership of content: the module is the same, the managing screen is the same,
and this repo still stores not one article.

`news` here is **not** a reserved word — it is a tab slug a site chooses, and
this template does not ship it. Its gate is
[`tests/kosakata-news.test.mjs`](tests/kosakata-news.test.mjs): a tab with slug
`news` left at `urutanSeksi: "manual"` reddens `bun test`.

**`ahliweb/awcms-mini` and `ahliweb/awcms-micro` are ARCHIVES.** Not a standard,
not a source to port from, not a family template. They may be read as historical
reference — the same way you read an old commit — but **no work is scheduled to
be "ported from" them**, and none is scheduled to be "ported out" to them. A
capability that is wanted gets **built** in the repo that owns it, with its own
ADR.

> **This replaces the freeze of 31 July 2026, and three of its sentences no
> longer hold — worth naming so they are not used again:**
>
> - "porting out is allowed" — that path was **closed** by `awcms` ADR-0055 §1,
>   which supersedes `awcms` ADR-0047.
> - "this freeze is **temporary**" — it is not temporary. There is no plan to
>   lift it, and no upstream repatriation waiting to be decided.
> - "`awcms/AGENTS.md` requires foundation features to be tested in `awcms-mini`
>   first" — the mini-first rule was **withdrawn**, not suspended (`awcms`
>   ADR-0055 §1). Foundation features are pioneered directly in `awcms`, and
>   that is now the correct path rather than an exception.
>
> What **still** holds from the old rule: removing a route is not removing its
> guard. The security review for auth/access modules, an ADR for a standards
> change, and the `family:conformance:check` gate there are all intact.

**Differences between repos are recorded, not remembered.** A decision here that
diverges from the `awcms` contract goes into that repo's
`awcms-family-compatibility.yaml` as an entry with an `owner` and a `reviewDate`
(`awcms` ADR-0068). This repo cannot write it itself — what can be done here is
to **state the difference in its ADR and say that it needs recording there**,
exactly what
[ADR-0034](docs/adr/0034-publik-secara-bawaan-admin-hanya-bila-dinyatakan.md)
§Relationship does and what `awcms` ADR-0070 answers.

## The mandatory workflow

1. One iteration = one atomic scope. Finish and validate before moving on.
2. Branch from `main` before touching code. Do not commit straight to `main`.
3. `bun run build` must be clean before work is called done. `build` already
   includes `astro check`; skipping it is the most common cause of "green
   locally, red in CI".
4. Conventional Commits (`feat:`, `fix:`, `docs:`, `refactor:`, `chore:`).
5. A change that changes behaviour must update the document that explains that
   behaviour — in this repo documentation is part of the product, not a garnish.

## Rules that cannot be broken

### Data sources

- **`src/lib/awcms/client.ts` is the only file allowed to contact awcms.**
  Components receive data through props and never fetch it themselves. This is
  what makes the data source replaceable without touching a single component —
  and that is not theory: the originating repo read markdown from disk, and its
  render layer did not change at all when it moved to an API.
- **The four rules in `src/lib/content.ts` may not be loosened**: the set of
  slugs is decided by the default locale, `isFallback` is computed by the
  adapter, ordering comes from a declared field, and only posts awcms itself
  serves publicly enter the build. Each keeps one specific defect impossible;
  the reasons are written in that file.
- **Section ordering comes from an EXPLICIT field, and which field is the
  section's own** (ADR-0033). `urutanSeksi: "manual"` reads the `urutan` an
  editor typed; `"terbaru"` reads `publishedAt` descending, at parity with
  `ORDER BY published_at DESC` on awcms's public routes. Both end on the source
  slug as a tiebreaker — a comparator that returns 0 hands its pair over to
  whatever order the API happened to return, which is exactly what this rule
  forbids. Do not order by a value read from a TRANSLATED post: the same section
  would run in a different order in each language.
- **`publishedDate` and `updatedDate` are two claims, read from ONE awcms row**
  (ADR-0033). They were once folded into `publishedAt ?? updatedAt` under a
  single name, so `dateModified` froze at the publication date forever and no
  page could ever report a correction. Do not pair a source post's publication
  date with its translation's modification date: the result is a `dateModified`
  preceding `datePublished` on legitimate content, and crawlers discard a block
  that says that.
- **Silently truncating data is a failure, not an optimisation.** The adapter
  walks the ENTIRE list with a keyset cursor; a page limit is not a content
  limit. If something blocks completeness — a cursor that does not advance, a
  translation that cannot be paired — **throw**, do not build a site that looks
  successful while losing articles.
- **The awcms post list returns SUMMARIES unless `view=full` is asked for.**
  `contentJson`, `excerpt`, `metaDescription`, `canonicalUrl`, and
  `translationGroupId` come only with `view=full` (which requires
  `order=created_at`). Reading one of them from a summary response does not
  error — it is `undefined`, and because `kategori` lives inside `contentJson`,
  every section of the site goes empty with the build still green. That has
  happened in this repo (ADR-0018), so do not drop that parameter "because the
  list works anyway".
- **The tenant comes from the token, and `AWCMS_TENANT_ID` is an assertion.** Do
  not turn it back into a resolution chain, and do not send a tenant header:
  awcms derives the tenant from the machine credential and ignores a header that
  differs. What that assertion guards is not "the build guesses the tenant" —
  it is another tenant's token installed on this site, which looks exactly like
  a healthy build.
- **One awcms refusal is decided BEFORE permissions are looked up, so widening
  the token's scope does not help at all.** `403 TENANT_SUSPENDED` (with
  `matchedPolicy: "tenant_suspended"`) hits a tenant with status `suspended`
  **or** `inactive`, and since `awcms` ADR-0073 it applies to machine
  credentials too — not only human sessions. It fails the build **totally** —
  zero files published — and reads exactly like a revoked token. The difference
  decides what to do: a revoked token is fixed by issuing a new one, while this
  refusal cannot be fixed from this repo at all. `403 ENTITLEMENT_REQUIRED`
  (`awcms` ADR-0084) has the same shape but **cannot hit this build yet**:
  entitlement is decided per module, and not one module behind the three
  surfaces this build calls declares it.
- **And since 13 August 2026 there is a second refusal of the same shape, but
  this one CAN hit the build — depending on who issued the token.** `403
  PARTNER_SUSPENDED` (`matchedPolicy: "partner_suspended"`, `awcms` ADR-0093)
  refuses every **delegated** actor whose partner is no longer `active`,
  evaluated at the chokepoint on every request. A machine credential inherits
  the `principal_kind` of its service account, and nothing in `awcms`'s issuing
  path forbids that service account from being a **delegated tenant user** — its
  service-account picker lists every tenant user without filtering by kind. Who
  picks is certainly a site tenant admin, not the agency itself: a delegated
  actor cannot write anything in the `identity_access` module (`awcms`
  ADR-0090), including issuing credentials. So the rule is operational, not
  code: **issue the build token on a service account belonging to the SITE's
  tenant**, not on a partner's delegated actor. The latter stops building the
  day their partnership is suspended, with a message that reads exactly like a
  revoked token — and the grant that gave it access is still there, so nothing
  looks missing.
- **A FOURTH surface is out of contract until the awcms side agrees it.**
  `awcms` ADR-0065 freezes the response shape of the surfaces this repo calls,
  and that list was derived by grepping this repo — not from memory. So adding
  one `/api/v1/...` call here reddens
  [`tests/kontrak-awcms.test.mjs`](tests/kontrak-awcms.test.mjs), and that works
  as intended: a surface not yet frozen there is a surface whose shape may
  change without any CI making a sound.

### Security

- **No raw-HTML path from the CMS.** `src/lib/content-blocks.ts` assembles every
  element from escaped text and fixed tags. Adding an `html`/`raw`/`embed` block
  type voids the whole guarantee.
- **`set:html` may only receive the output of `renderContentBlocks`.** Never
  give it a string from any other source.
- **The build token is never prefixed `PUBLIC_`.** Astro inlines only
  prefixed variables into the client output; a token in a static bundle is a
  token published to every reader.
- **No third-party scripts.** No SDKs, widgets, pixels, or share buttons
  belonging to a social provider. Sharing uses ordinary links.
- **No collection of readers' personal data.** No forms, no analytics that bind
  an identity.
- **Never advertise an asset this build did not publish.** `og:image`,
  `twitter:image`, and JSON-LD `ImageObject` are CLAIMS, and a claim pointing at
  a 404 is worse than a missing tag: a preview with no image degrades to a tidy
  text card, a preview with a broken image degrades to nothing. This template
  once set all three on every page, pointing at `/social/<slug>.png` generated
  by a script that never came to this repo. An optional asset is declared
  through env and **dropped entirely when empty**, not given a guessing default.
- **No state emblem, logo, or official institutional attribute** — including
  inside illustrations.
- **No fabricated documents, receipts, registration numbers, identities, or
  government application interfaces**, in any form including illustrations. A
  reader may conclude that is what the real thing looks like, and that
  conclusion makes fraud easier.

### Serving

- **`server/penyaji.mjs` is the only place response headers are decided**
  (ADR-0016). Five security headers — including `Content-Security-Policy` and
  `Permissions-Policy` since ADR-0019 — two `Cache-Control` rules, and
  compression live there and may not be spread elsewhere — in nginx a similar
  rule must be re-`include`d in every `location`, and forgetting produces pages
  with no security header at all without anything failing.

  **The sixth, `Strict-Transport-Security`, is sent ONLY in production**
  (ADR-0029) and its gate is not tidiness: HSTS cannot be revoked from the
  site's side and applies to a HOST, so one `bun run serve` preview that sent it
  would lock every other project on `http://localhost:<port>` for a year. The
  assertion guarding it therefore **runs in reverse** — what is tested is that
  it is NOT sent outside production. `includeSubDomains` is deliberately absent,
  unlike in `awcms`; the reasons are in ADR-0029, and adding it is a SITE's
  decision, not a template's.

  `Server` and `X-Powered-By` are stripped on the same path. Node does not send
  them today — but "not sent today" and "will not be sent" are two different
  things.

- **Do not write your own file server.** Translating a URL into a file path
  stays the job of the `@astrojs/node` adapter. Every line that does it itself
  is a line that can turn into arbitrary file reading — `..`, double-encoded
  paths, and symlinks are a class of defect settled years ago in the library the
  adapter uses, and its failure mode is not an ugly page.
- **HTML is never cached for long; `/_astro/` assets are always `immutable`.**
  Both behave correctly-looking when wrong: the site stays up, only a successful
  rebuild is never seen by readers. Any change to serving must therefore go
  through `tests/penyaji.test.mjs`.
- **Whatever judges "is this an asset" must normalise the path first.**
  `/_astro/../index.html` serves the front page; judging it from the raw prefix
  would attach a one-year cache to a file that changes on every rebuild.
- **CSP is loosened in `server/penyaji.mjs`, and in no second place.** Not
  through an env variable, not through an extra header in Traefik, not through
  `<meta http-equiv>`. What a site is most likely to need loosened is `img-src`
  (article images from the awcms media host) — do it there, then update
  `tests/penyaji.test.mjs`. Two policy sources overwriting each other is the
  quietest way to end up with no policy at all.

### Interface

- **Every core function works without JavaScript.** Navigation, the language
  switcher, accordions, and the whole body of every page. Anything that
  genuinely needs JS is hidden when JS is off — a control that does nothing when
  clicked is worse than a control that is not there.
- **WCAG 2.1 AA accessibility** is a floor, not a target: sufficient contrast in
  both themes, visible focus, full keyboard navigation, `prefers-reduced-motion`
  honoured. Decorative animation is **switched off** when that is asked for, not
  sped up — a global `*` rule only trims duration, and a 0.01 ms animation still
  flickers. Hover feedback is also active on `:focus-visible`, so keyboard users
  do not get a poorer version.
- **Mobile-first from 360px.**
- **Interface strings come through the PO catalogue**, never written straight
  into a component. This applies to labels coming from configuration too: the
  main navigation once rendered UPPERCASE values from `src/config/site.ts`, so
  the most visible surface on the site was the one piece that never changed
  language.
- **The `t()` fallback chain ends at a KEY NAME, and a key name on screen is not
  "a readable page".** So every key that might not exist in any catalogue — a
  key assembled from a tab slug, from a fee category, from anything decided by
  configuration or by editors — **must** be called with a readable fallback
  argument: `t(locale, key, tab.label)`. This repo once published
  `translation.notice.label`, `biaya.jenis.pnbp`, `tab.articleNo`, and
  `tab.readMoreCta` as text readers read, in both languages, with `astro check`
  clean and a green build. `tests/katalog-po.test.mjs` now refuses a literal key
  without a fallback that is absent from the catalogue — but it cannot see a
  dynamic key, and that is where this rule works. Its last layer is in the
  output: `scripts/audit-konten.mjs` flags on-screen text shaped like a key from
  this site's catalogue namespace. In `dist/` a dynamic key is no longer
  dynamic — it is ordinary text, and it can be seen.
- **Design tokens, not loose values.** No one-off styles; a new component uses
  tokens that already exist in `src/styles/global.css`.
- **`src/styles/global.css` is loaded by every page, so a rule only one component
  uses is bytes every other page pays for.** The split — shared in the global
  file, a component's own in its scoped `<style>` — is not tidiness, it is the
  page weight budget. `bun run audit:aset` is what makes it real: the home page
  hero sat in the global file while `Home.astro` was its only user, and adding to
  it pushed `/cari/` past the total ceiling on the strength of an element that
  page never renders. Moving the block returned 1,853 B to **every** page. When
  that gate goes red, look first for a rule in the wrong file, not for a budget to
  raise.
- **A `padding` shorthand on an element that also carries `.container` deletes
  the container's side padding, and it is invisible on a desktop screen.** Above
  `--max-width` the container is already inset by its own auto margins, so
  nothing looks wrong; at 360px, where the container is the full screen, the
  content sits flush against the edge of the glass. `.header-top` did exactly
  this for months. Use `padding-block`. Measure the result — `x=0` on the site
  name is a fact, "it looks fine in the screenshot" is not.
- **No `style=""` attribute, and no `<style>` block inside the HTML.** Styles
  live in `src/styles/global.css` (when used by more than one component) or in a
  component's scoped `<style>` — which Astro emits as a separate CSS file rather
  than inlining into the page. Both are blocked by the CSP `style-src 'self'`,
  and the failure is a page with no layout and no error at build. What guards
  the second path is `build.inlineStylesheets: "never"`;
  `tests/keluaran-csp.test.mjs` checks the output. Dynamic values once sent
  through `style="--var: …"` are written as classes — see the share channel
  colours in `global.css`.
- **No JavaScript inside the HTML** (ADR-0019). Since the server sends
  `script-src 'self'` without `'unsafe-inline'`, an inline script is not "less
  tidy" — it is dead in the reader's browser. Two paths let it in, and the
  second is invisible in `src/` entirely:
  1. `<script is:inline>` containing code. A script that must run before first
     paint becomes a file in `public/` loaded by a classic `<script src>` — see
     `public/tema.js`. Astro bundles are always `type="module"` and modules are
     always deferred, so that is not a substitute for this case.
  2. An ordinary `<script>` in a component, which Astro bundles and then
     **inlines back** into the HTML when its chunk is smaller than
     `assetsInlineLimit`. `vite.build.assetsInlineLimit: 0` in
     `astro.config.mjs` is what closes it, and without that setting a component
     stops complying merely because its code got smaller — exactly the pattern
     that makes `inlineStylesheets: "never"` necessary.

  Exactly one exclusion: `<script type="application/ld+json">`. It is a data
  block, not a script — the browser never executes it so `script-src` does not
  apply, and moving it to an external file only stops search engines reading it.

### Images

This template ships no illustration yet, but the frame exists and the rules
below apply from the first image a site using it brings in.

**Two sources, and the more specific wins.** `featuredMediaId` in `awcms` is the
editor's choice for THAT article and is used first (ADR-0025); a file in
`src/assets/` is a template-level fallback. A media image is resolved **once per
build** in `content.ts` and lives in `LocalizedArticle.gambar` — never call it
from a component.

**How to add local artwork: put the file in `src/assets/`, there is no second
step.** Its naming convention — relative to `src/assets/`, without the extension
— is `hero`, `tab/<tab>`, and `artikel/<tab>/<slug>`; any extension from
`EKSTENSI_SENI` works, so swapping `.svg` for `.webp` touches not one line of
code. **There is no fallback from an article to its section's artwork**
(ADR-0024): a fallback makes every article in a section use the same image while
looking like an image chosen for it. A missing file renders
`.visual-placeholder`, and that is honest.

- **One ratio for the whole site, used by frame and source alike.** Its value is
  `--ratio-visual` in `src/styles/global.css`, currently 16∶9. The frame uses
  `object-fit: cover`, so a source at another ratio is **not** scaled down — it
  is cropped, silently, at every screen size. A 1∶1 source in a 16∶9 frame loses
  the top 22% and the bottom 22%, and an image's title is almost always there.
  The reference repo lost the title on eleven banners at once before anyone
  noticed, and not one build failed because of it.
- **Changing `--ratio-visual` means regenerating all the artwork.** Changing it
  in CSS alone moves the crop, it does not remove it.
- **Format is read from file contents, not from the extension.** Eleven files in
  the reference repo had a `.png` extension while their contents were JPEG.
- **SVG must be valid XML.** One bare `&` makes the browser silently fail to
  render the image — with no error message at all.
- **Text inside an image is only a topic label.** No amounts, dates,
  registration numbers, personal names, mock documents, or government
  application interfaces. A number inside an image cannot carry its source and
  legal basis, so it escapes the rule that guards every other number — and it
  does not get updated when the tariff changes.
- **No state emblem, logo, or institutional attribute — including inside
  illustrations.** A site from this template is an independent portal, and a
  state emblem on its pages contradicts that statement at a glance.
- **The smallest text in an SVG is at least 22px on an 800px canvas.** On a card
  328px wide — a 360px viewport — an 800px canvas appears at 0.41 scale, so
  below that threshold its text appears under 9px and is practically unreadable.
- **`src: undefined` is a supported state.** A caller renders
  `.visual-placeholder`. A missing illustration must not become a missing page —
  nor a frame of zero height.
- **One caller renders NOTHING instead, and it is named here so the exception
  does not spread by imitation: the home page hero.** The rule above exists
  because an empty frame holds up a layout that would otherwise collapse. On the
  home page the hero panel already carries the latest articles, so an empty frame
  there holds not the layout but the reader's attention — a striped rectangle the
  width of the panel, in the first fold, directly above the only real content the
  page has. Anywhere the frame is load-bearing, the placeholder stays.

Four of the rules above are now **checked** by `scripts/audit-konten.mjs` across
every source in `src/assets/`: ratio (including an SVG `viewBox`), format read
from file contents, a bare `&` in SVG, and the smallest text size. A format
whose dimensions that gate cannot yet read is **reported as a violation**, not
skipped — a gate that passes what it does not recognise can be bypassed by
changing format. Files in `public/` deliberately have their ratio unchecked: a
favicon must be square and a share card has its own standard size.

The two content rules above — image text and institutional emblems — **cannot be
machine-checked**. Say so plainly rather than letting them look guarded; a rule
that looks guarded but is not is more dangerous than one that is obviously
manual.

### Configuration

- **`src/config/site.ts` and `.env` are the only places configuration lives.**
  Standing up a new site must not require editing a component. This is the rule
  most often broken without anyone noticing, because breaking it never fails —
  it just publishes another site's identity. What has been found hard-coded in
  this template's own code: the reference repo's site name in every `<title>`,
  an institutional emoji and regional badge in the header, `'id'` as
  `hreflang="x-default"`, a map of the reference repo's five tab names, a
  province name in the JSON-LD builder, and the red-and-white flag for every
  locale that is not `en`. **Before writing any value specific to one site, ask
  what happens when the next site uses it.**
- **A default specific to one site is worse than an empty value.** `SITE_MARK`
  and `SITE_SOCIAL_IMAGE` are empty by default, and both empty states render
  fully.
- **Every env variable the code reads must be in `.env.example`**, together with
  the consequence of filling it in wrongly — not just its name.
- **Bun is this repo's runtime and package manager** (ADR-0015), including in
  production: since ADR-0016 the build output is served by a Bun process, not
  nginx. Its version is pinned in three FILES and **five VALUES** that must move
  together: `packageManager` + `engines.bun` in `package.json`, `bun-version` in
  TWO jobs of `.github/workflows/ci.yml`, and the image tag in TWO stages of
  `Dockerfile`. Raising just one makes local builds, CI, and the image behave
  differently — silently.

  Since ADR-0030 this rule has a checker: `tests/versi-toolchain.test.mjs`.
  Before that it was a written rule with no gate, and `grep` over `tests/` and
  `scripts/` returned zero lines — exactly the "looks guarded but is not" shape
  this document forbids elsewhere.

  **The base image is also pinned to a digest**, with the tag still written in
  front of it. When both are present, Docker obeys the digest and the tag
  becomes a comment — so raising the tag without the digest builds the old
  version while announcing the new one. The gate above checks this specifically.

- **No Node.js runtime re-enters this repo** (ADR-0050): no `node`/`npm`/
  `npx`/`yarn`/`pnpm` invocation, no `actions/setup-node`, no `engines.node`,
  no non-Bun base image, no `#!/usr/bin/env node` shebang, no `.nvmrc`/
  `.node-version` file, no `package-lock.json`/`yarn.lock`/`pnpm-lock.yaml`.
  This was already true everywhere it matters and unguarded until now; since
  ADR-0050 this rule has a checker: `tests/runtime-bun.test.mjs`.

  What this does **not** forbid: `node:fs`, `node:http`, and the rest of the
  `node:*` built-ins are Bun's own implementation, not a Node.js dependency,
  and stay. Nor does it forbid `@astrojs/node` or `compression` in
  `dependencies` — both run entirely under Bun and are kept on purpose
  (URL-to-file-path resolution; Brotli negotiation), checked from the
  keep-side by the same test file.

- **GitHub Actions are pinned to a commit SHA, not a tag**, with a `# vX.Y.Z`
  comment that Dependabot reads. A tag can be moved, and an action runs with
  access to the workflow token and the whole checkout (ADR-0030).
- **`bun.lock` must be a statement about this repo**, and must be committed.
  `bun run check:lockfile` checks it before install: the workspace name must
  belong to this repo (a lockfile copied from another repo is recognised exactly
  here) and the dependency block must match `package.json` precisely. Install in
  CI and in the image is always `bun install --frozen-lockfile`.
- **Regenerate the lockfile in full**: `rm -rf node_modules bun.lock && bun
  install`.
- **Do not name a script the same as the binary it calls.** `bun run` resolves a
  name to a `package.json` script **before** `node_modules/.bin`, so a script
  `"astro": "bun --bun astro"` sends every other script that calls `astro` into
  infinite recursion — and its death reads `E2BIG: Argument list too long`,
  which names nothing about the cause. For a one-off Astro command: `bunx astro
  <command>`.
- **`bun install` does NOT refuse a peer-dependency mismatch** the way npm does
  — it warns and installs anyway. So peer boundaries that matter (e.g. pinning
  `typescript` for `@astrojs/check`) are written explicitly in
  `.github/dependabot.yml`; without that an unsupported bump installs smoothly
  and fails far from its cause.
- **Read env through `src/lib/env.ts`**, not `import.meta.env` directly. A
  non-`PUBLIC_` variable can read as `undefined` inside a prerender chunk even
  when its value is in `.env`, and the failure disguises itself as something
  else.

## External standards that bind this repo (ADR-0028)

Most rules in this document map onto controls that already have names out there.
The map — together with an **honest list of gaps** — is in
[`docs/awcms-astro/standar-performa-dan-keamanan.md`](docs/awcms-astro/standar-performa-dan-keamanan.md).
Four things to know before touching headers, cache, or the performance budget:

- **Standard editions are kept level with `awcms`**, and not only OWASP: Top 10
  2021, ASVS 4.0.3, API Security 2023, ISO/IEC 27001:2022, NIST SSDF v1.1 — **all
  five** are pinned by `awcms` ADR-0068 §A with a shared review date of
  2027-02-04. ISO/IEC 25010:2023 is used by both repos as a product quality model
  but is **not** part of that pin; it has no family review date, and billing it
  to `awcms` would be billing a promise that was never made. Moving up an edition
  is a family-level decision, not a repo-level one — two matrices on two
  different editions cannot be added together, and their numbering differences
  will be read as control gaps.
- **This repo's differences from `awcms` are recorded in that family manifest,
  and there are FIVE** — not two, and not only the ones born here. The three
  already known: HSTS without `includeSubDomains` (ADR-0029 here), COOP/CORP not
  sent (`awcms` ADR-0069), and the USER admin surface (`awcms` ADR-0070). **Two
  have never been named in this repo.** The first is
  `owasp-edition-pin-owned-here`: the OWASP edition pin is held by `awcms`
  precisely because ADR-0028 here states in writing that this repo follows that
  repo's edition, so moving up an edition demands an ADR there — not a table edit
  here. The second is `astro-files-not-type-checked` — `awcms` lost type-checking
  of its `.astro` files by being on TypeScript 7.x, and its divergence note leans
  explicitly on the fact that this repo is still on `^6.0.3`. That is not version
  trivia: it makes the TypeScript pin here the condition for the `astro check`
  gate being alive at all, and it therefore now has its own ADR
  ([ADR-0037](docs/adr/0037-pin-typescript-6-adalah-syarat-hidupnya-gerbang-astro-check.md)).
  All five carry `reviewDate` 2027-02-04, one cohort, so the whole family posture
  is reviewed in one sitting.
- **The performance target is Core Web Vitals at p75**: LCP ≤ 2.5 seconds, INP ≤
  200 milliseconds, CLS ≤ 0.1. INP replaced FID in March 2024 — a document still
  naming FID is stale, not using an alternative. **Since ADR-0032, LCP and CLS
  are asserted in the LAB in the CI of a site that has a content source**, over a
  sample of pages whose bounds are chosen and written in `lighthouserc.json` (in
  the template repo that step does not run). INP is not measurable in a lab — TBT
  ≤ 200 ms is used as its proxy — and p75 of REAL visits is still unmeasured
  because RUM is refused; both are written plainly rather than left looking
  guarded. Do not write "meets Core Web Vitals" from lab results.
- **All ten gaps are now closed** (six on 4 August 2026; SBOM, static analysis,
  and lab Core Web Vitals followed on 5 August — ADR-0031/ADR-0032; the tenth was
  found and closed on 6 August 2026, and it was not a missing control but two
  checkers that were never executed in the repo where both were written), **and a
  closed row STAYS in the table.** Each names its checker, and a closed row stays
  in the table: deleted, it will be proposed again as a new finding, and its
  checker will be loosened by someone who does not know why it exists. Closing a
  gap without its checker moves it from "known open" to "believed closed", and
  the second is worse.

## Definition of Done

- [ ] `bun run build` clean (including `astro check`).
- [ ] `bun test` green — including the catalogue gate `tests/katalog-po.test.mjs`.
- [ ] `bun run audit:konten` green **after** the build. Before the build it only
      checks image sources and says its output gates were skipped; reading that
      output is part of running it.
- [ ] `bun run audit:dokumen` green. It needs no build: dead markdown links, an
      ADR index incomplete in either direction, and an `ADR-NNNN` citation that
      does not resolve to its file — a citation of another repo's ADR is written
      with a marker (`awcms`, "repo rujukan"/"reference repo", or a github link)
      in the same paragraph. **Adding an ADR means adding its row to
      `docs/adr/README.md`** — that index once listed six decisions that never
      existed in this repo while missing nine that did, and survived nine ADRs
      unseen.
- [ ] `bun run audit:graf` green. It needs no build either: tracked
      `graphify-out/` artefacts beyond the four shared outputs, and community
      names that were not chosen — file names inherited from automatic naming,
      placeholders, twins, or names differing between `graph.json` and
      `GRAPH_REPORT.md`. It was born from 60 of 101 labels attached to the wrong
      community, inside valid JSON, with every other gate green because not one
      of them read `graphify-out/`.
- [ ] `bun run audit:translation` green. It needs no build either: an Indonesian
      mirror gone stale against the English source it records the hash of, and
      documents with no mirror at all. **A document written after
      [ADR-0039](docs/adr/0039-english-is-the-source-language.md) is written in
      English and mirrored in the same change** — the ledger of outstanding
      documents may only shrink, and nothing may be added to it.
- [ ] A new page works with JavaScript switched off.
- [ ] New interface strings enter EVERY locale catalogue.
- [ ] A key assembled from configuration or editorial data is called with a
      readable fallback argument.
- [ ] No `any` on the props of a component that receives `LocalizedArticle`.
      `entry: any` in `ArtikelLayout` hid four fields that never existed and one
      metadata line that was always empty; replacing it with its contract type
      found all of them in a single typecheck.
- [ ] The default locale and prefixed locales produce the same number of pages.
- [ ] A new image is at `--ratio-visual`, its extension matches its contents, it
      carries no institutional emblem or mock data, and its text is readable at
      360px wide.
- [ ] A change to serving — headers, CSP, `Cache-Control`, compression, port —
      is proven by `tests/penyaji.test.mjs`, not checked by eye. **A `Vary` is
      part of that**: `Cookie` and `Accept-Language` are refused outright
      ([ADR-0041](docs/adr/0041-locale-stays-at-the-root-and-two-vary-names-are-refused.md)),
      and the same gate refuses every other `Vary` written from that file, so a
      third value is an ADR rather than an edit.
- [ ] A change touching headers, cache, compression, or the performance budget
      also updates its row in
      `docs/awcms-astro/standar-performa-dan-keamanan.md`. The "State" column
      there **cannot be machine-gated** — a row can read "Met" after its control
      has been removed, and nothing will go red.
- [ ] The build output carries no styles or scripts inside its HTML. `bun test`
      after `bun run build` runs `tests/keluaran-csp.test.mjs` over
      `dist/client/` — with no build result, that gate SKIPS itself and says so.
      Reading an `N pass` summary without reading the skipped line is not proof;
      the number is green precisely because the gate did not run.
- [ ] Touching `src/config/site.ts` means re-reading the two gates that guard
      this repo's ROLE, because both judge configuration rather than prose:
      `tests/peran-situs.test.mjs` (ADR-0034 — `owner` refused, a prefix that
      swallows the public surface refused, a half declaration refused, and every
      `prerender = false` route required to sit under a declared prefix) and
      `tests/kosakata-news.test.mjs` (ADR-0036 — a tab with slug `news` must be
      `urutanSeksi: "terbaru"`, and **no** tab, admin prefix, or route file may
      claim `blog`, which belongs to `awcms`).
- [ ] Adding a call to `awcms` means agreeing its contract THERE first.
      `tests/kontrak-awcms.test.mjs` hardens the surfaces the build calls to
      exactly three and requires them to match the marked table in the
      integration skill in both directions; a fourth surface reddens it until
      `awcms` freezes its response shape (`awcms` ADR-0065).
- [ ] Adding a dependency means asking first whether it brings **backend**
      capability — a database, an ORM, a server framework, a queue, sessions. If
      so, the need is a MODULE in `awcms`, not a package here
      ([ADR-0038](docs/adr/0038-kebutuhan-backend-menjadi-modul-di-awcms.md));
      `tests/tanpa-backend.test.mjs` refuses it by class, and the same gate
      refuses a WRITE path to `awcms` from `src/` or `scripts/`.
- [ ] A new env variable is documented in `.env.example`, including a RUNTIME
      variable read by `server/penyaji.mjs`.
- [ ] The document explaining the changed behaviour is updated with it.

## Moving to SSR

`output: 'static'` is this template's premise, not a default that happens to be
there. Changing it to `'server'` pulls back a runtime, a live database
dependency, and every operational control of the AWCMS family. That decision is
written as an ADR first, not taken through one line in `astro.config.mjs`.

**One such ADR already exists:**
[ADR-0014](docs/adr/0014-rendering-campuran-dan-bff-portal.md) (Jualanku.info)
decides the pattern of **static-by-default with on-demand routes** — an adapter
is installed, `output` **stays** `static`, and only `/penjual/**`,
`/affiliate/**` (other than the landing page), and `/_portal-api/**` declare
`export const prerender = false`. Its design is in
[`docs/awcms-astro/jualanku/`](docs/awcms-astro/jualanku/README.md).

**And since ADR-0034 there is a SECOND legitimate class of on-demand route**,
with exactly the same shape: the prefixes a site declares in
`permukaanAdmin.prefiks`. `tests/peran-situs.test.mjs` accepts both and **only**
both — a `prerender = false` route whose prefix is in neither of those two lists
reddens `bun test`. That is what makes "public by default" an enforced state
rather than a habit: adding one authenticated route file can no longer happen
without someone writing it down.

Three things to read before touching that area:

- **There is no implementation yet.** The portal routes and `_portal-api` do not
  exist, and not one route declares `prerender = false`. The adapter **is**
  installed, since ADR-0016 — but to SERVE the build output, not to render at
  request time; `output` stays `static`. Do not read its presence as a sign that
  the portal prerequisites have been passed: they are in
  [`04-kesiapan.md`](docs/awcms-astro/jualanku/04-kesiapan.md) and have not
  changed.
- **The BFF decides nothing with business consequences.** Ownership,
  entitlement, and status transitions are decided by `awcms`. A rule that lives
  only in this repo is a rule that does not exist.
- **Every AUTHENTICATED surface targets WCAG 2.2 AA**, up from 2.1 AA above —
  the Jualanku BFF (ADR-0014) and the USER admin surface a site declares through
  `permukaanAdmin` (ADR-0034) alike. What decides is not the surface's name but
  the presence of controls, forms, and focus that moves. Every other rule in
  this document still applies in full.

## Language

English at the bare path is the authoritative source; Indonesian at
`<name>.id.md` is the mirror, recording the hash of the English it was
translated from ([ADR-0039](docs/adr/0039-english-is-the-source-language.md)).
This document's mirror is [`AGENTS.id.md`](AGENTS.id.md). Code — comments,
identifiers, gate messages — is English and single-language; it is not mirrored.
