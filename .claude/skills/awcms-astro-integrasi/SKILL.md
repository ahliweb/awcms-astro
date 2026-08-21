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

## Surfaces — FOUR that are called, two that are not

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

<!-- permukaan:dipanggil:mulai -->
| Surface the build actually calls | Called from |
| --- | --- |
| `/api/v1/blog/posts` | `src/lib/content.ts` — the build feed traversal, `view=full` + `order=created_at` + cursor |
| `/api/v1/media/objects` | `src/lib/awcms/media.ts` — media resolution, max 100 ids per request |
| `/api/v1/media/public-origin` | `src/lib/awcms/media.ts` — the media origin for `img-src` |
| `/api/v1/site-profile/composed` | `src/lib/awcms/profil.ts` — who the site is: masthead, footer, contact, social links, `Organization` |
<!-- permukaan:dipanggil:selesai -->

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
| ADR-0094 — a data subject is answered PER TENANT | **Zero adapter work, and that is exactly what has to be recorded.** This build publishes a **static copy**, so anonymising a subject in `awcms` does not reach a single already-published file until the next build — and copies already distributed can live longer still (CDN caches, the git history of `dist/` if a site commits its output). What keeps that from being a problem today is a decision, not a coincidence: this template publishes **zero per-person data** — the JSON-LD `author` is an `Organization` ([`src/lib/schema.ts`](../../../src/lib/schema.ts), gated by [`tests/schema.test.mjs`](../../../tests/schema.test.mjs)) and the feed's `<author>` is the site name ([`src/lib/feed.ts`](../../../src/lib/feed.ts), a decision that is **not** gated — `tests/feed.test.mjs` does not check it, so do not read it as guarded). A site that adds a byline, an author avatar, or comments **takes on that obligation**, and its erasure path ends in a rebuild. The same ADR raised the family's `moduleDescriptorContractVersion` to **4.0.0** (the `SubjectDataErasure` union widens, `tenantColumn` becomes `string \| null`) — zero work here, because this repo declares no module descriptor at all |
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

## References

- [`docs/adr/0018-kontrak-build-token-mesin-dan-traversal-konten.md`](../../../docs/adr/0018-kontrak-build-token-mesin-dan-traversal-konten.md)
- [`docs/adr/0025-gambar-artikel-dari-media-awcms.md`](../../../docs/adr/0025-gambar-artikel-dari-media-awcms.md)
- [`docs/adr/0027-penahanan-adr-0021-selesai.md`](../../../docs/adr/0027-penahanan-adr-0021-selesai.md)
- [`docs/awcms-astro/integrasi-awcms.md`](../../../docs/awcms-astro/integrasi-awcms.md)
- [`AGENTS.md`](../../../AGENTS.md) §Data source
