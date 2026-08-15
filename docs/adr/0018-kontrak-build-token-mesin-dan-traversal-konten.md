🇬🇧 English (source) · 🇮🇩 [Bahasa Indonesia](0018-kontrak-build-token-mesin-dan-traversal-konten.id.md)

# ADR-0018 — The build contract against awcms: tenant from the machine token, cursor traversal + hydration, and the translation gate

- **Status:** Accepted
- **Two sentences in §Consequences stopped being true, and the body is
  deliberately NOT edited** (13 August 2026 — an ADR is a record of a decision at
  one point in time):
  - **"`awcms` ADR-0049 §3 already refuses any action other than `read` for
    machine credentials"** was true until 12 August 2026. Since `awcms`
    [ADR-0092](https://github.com/ahliweb/awcms/blob/main/docs/adr/0092-machine-credentials-may-write.md)
    the machine credential class **may write**: an action ceiling of
    `create`/`update` in code (not a column), mandatory CIDR binding, **refused
    when `clientIp` is unknown**, a maximum age of 30 days instead of 365, with
    the refusal sentinel `machine_credential_write_forbidden`. Every credential
    issued before its migration stays read-only, with no backfill. This ADR's
    build token therefore still cannot change anything — but because it is issued
    **with no write action at all**, that is a property of its row, not of its
    class. Keeping it in the read class is now an issuing decision that has to be
    maintained.
  - **"`allowed_permission_keys` contains exactly `blog_content.posts.read`"**
    became one key short when [ADR-0025](0025-gambar-artikel-dari-media-awcms.md)
    added media resolution: what is correct today is **two** keys,
    `blog_content.posts.read` and `media_library.media.read`. Without the second,
    `scripts/asal-media.mjs` is answered with a 403 and the build fails after
    every page has finished rendering. The values in force are in
    [`.env.example`](../../.env.example).
- **Date:** 1 August 2026
- **Follows on from:** `awcms` [ADR-0049](https://github.com/ahliweb/awcms/blob/main/docs/adr/0049-machine-credentials-and-session-introspection.md) (machine credentials + session introspection), which closed the two contracts ADR-0047 recorded as holding this repo back
- **Related:** [ADR-0014](0014-rendering-campuran-dan-bff-portal.md) (the BFF), [ADR-0017](0017-peran-admin-owner-internal.md) (the internal admin surface — superseded by [ADR-0020](0020-layar-admin-kembali-ke-awcms.md); the machine credentials below are unaffected, they are used by the BUILD token)

## Context

This repo pulls content at build time through `GET /api/v1/blog/posts`. Three
things about that call turned out not to match reality, and **all three fail
without failing the build**:

### 1. A tenant header nobody ever read

`src/lib/awcms/tenant.ts` sent `X-Tenant-Code`/`X-Tenant-Id`. awcms reads
`x-awcms-tenant-id`, and ADR-0049 §4 refuses to add an alias — the spelling this
repo used never existed over there. For a machine token that header is ignored
(the tenant comes from the token); for any other bearer the result is
`400 TENANT_REQUIRED`.

The three-level resolution chain (`AWCMS_TENANT_CODE` → `AWCMS_TENANT_ID` →
`AWCMS_DEFAULT_TENANT_CODE`) was therefore answering a question nobody was asking.

### 2. The post list does not contain its contents

`GET /api/v1/blog/posts` returns a **summary** (`BlogPostSummary` on the awcms
side): `id`, `title`, `slug`, `status`, `visibility`, `locale`, `publishedAt`,
`updatedAt`, `createdAt`. There is no `contentJson`, `excerpt`,
`metaDescription`, `canonicalUrl`, or `translationGroupId`.

The adapter in this repo declared the FULL post shape for that response and read
`contentJson` straight from it. The consequence was not an error: `contentJson`
read as `undefined`, every article body was empty — and because **`kategori` also
lives inside `contentJson`**, not one article matched any tab. The build
succeeded, the site published, every section empty.

### 3. The 100-row limit guarded with a `throw`

The adapter requested 100 (awcms's upper bound) and threw when the response came
back exactly at that limit. That was the right decision when it was written —
truncating silently is worse — but since awcms added keyset traversal
(`?order=created_at` with `nextCursor`), throwing means refusing to build a site
that could in fact be built whole.

## Decision

### 1. The token decides the tenant; configuration becomes an ASSERTION

`AWCMS_API_TOKEN` must be a machine credential
(`awcmsm_<32 hex tenant>_<43 char secret>`). The tenant is derived from the
token, and **no tenant header is sent** — sending one means setting a value that
looks decisive while being ignored.

`AWCMS_TENANT_ID` is kept, but changes role: from a **source** to a **verified
statement**. If it is filled in and differs from the token's tenant, the build
fails.

This is not a weakening of the guard but its move to where a leak can actually
happen. The old chain guarded against "the build guesses the tenant" — a state
that is no longer possible. What is possible, and was invisible to everything
before, is **another tenant's token installed in this site's configuration**: a
green build, a full site, somebody else's contents. A chain cannot see that; an
assertion can.

`AWCMS_TENANT_CODE` and `AWCMS_DEFAULT_TENANT_CODE` are **refused, not
ignored.** A value that reads like configuration but decides nothing is the same
defect class this ADR fixes.

### 2. Cursor traversal, then hydration per post

1. Walk the whole list with the `?order=created_at` keyset cursor — the only
   ordering awcms will paginate, because `updated_at` moves every time a post is
   edited so a row can jump across a page boundary.
2. Discard anything not `published` + `public` **before** hydration, so a draft
   never costs a single request.
3. Fetch each remaining one whole from `GET /api/v1/blog/posts/{id}`.

Step 3 is N+1 requests per build. Its cost is accepted and stated, not hidden:
**correct-but-slow beats fast-but-empty.** The real fix remains what the adapter
recorded from the start — a **build feed** on the awcms side returning full rows,
keyset-paginated and locale-aware. This ADR does not replace that need; it lets
this repo behave correctly before that feed exists.

The `MAX_PAGES` limit (200 pages ≈ 20,000 posts) is a runaway-loop backstop, not
a content limit: it **throws**, rather than returning what it has collected.

### 3. Translations that cannot be paired FAIL the build

`translationGroupId` is accepted by awcms on write and **returned by no read
endpoint**. Rule 1 of this adapter pairs locales through that field.

Continuing without it does not look like a failure: every non-default locale
falls back to the source language, each carrying a "not translated yet" marker,
and the site publishes translations that DO exist as untranslated pages. That
discards content silently, and this repo treats it as a failure.

Its gate is written as an assertion over **data**, not as an awcms version check:
a single-locale site still builds today, and once awcms returns the field, that
gate passes on its own with nothing needing to change here.

## Consequences

**A site's build changes from "green but empty" to correct, or fails with a
written cause.** There is no third state.

**Existing deployment configurations will fail once, deliberately.** Every site
that sets `AWCMS_TENANT_CODE`/`AWCMS_DEFAULT_TENANT_CODE` or a non-machine token
stops building until its variables are fixed. The alternative is to accept both
silently and let an operator believe something that does not hold.

**The credential must be issued with the narrowest scope.**
`POST /api/v1/access/machine-credentials`, with `allowed_permission_keys`
containing exactly `blog_content.posts.read`. `awcms` ADR-0049 §3 already refuses
any action other than `read` for machine credentials, so a leaked token cannot
change anything — but it can still READ tenant data, so its expiry is mandatory
and its revocation takes effect on the next request.

**Load on awcms rises.** One build is now N+1 requests, not one. For a
500-article site that is some 500 read requests per rebuild, and a rebuild is
triggered on every publish. This is an additional reason the build feed is worth
doing over there, and the reason `HYDRATION_CONCURRENCY` is capped at 8.

## Implementation notes (1 August 2026, afternoon)

Decision 2 above names the build feed as the "real fix", postponed. It **was not
postponed** — it landed in `awcms` the same day
([the build feed PR](https://github.com/ahliweb/awcms/pulls)), so the "N+1
requests per build" part of this ADR only applied for a few hours.

What differs from what is written above:

- **`GET /api/v1/blog/posts?view=full&order=created_at`** returns full rows with
  the same keyset cursor. The adapter walks one traversal; there are no more
  per-post requests. `tests/kontrak-awcms.test.mjs` asserts that the per-id
  request does **not** come back — because if it did, it would come back
  silently.
- **`translationGroupId` is now returned** by both `view=full` and the detail
  endpoint. The gate in Decision 3 therefore no longer fails a multi-locale site;
  it stays, and it still guards its condition, precisely because it was written
  as an assertion over data rather than as a version check.
- **The page size drops to 50**, the limit awcms enforces for `view=full` because
  its rows carry `contentJson`.

The root cause is recorded over there too, and is worth repeating here: the
`awcms` OpenAPI contract stated this endpoint returns a `BlogPost`, while its
implementation returned a summary. This repo's adapter was written from that
document — its type comment names
`openapi/awcms-public-api.openapi.yaml` — so the "empty site with a green build"
defect was born from a document promising more than the code delivered. The
summary shape now has a schema of its own (`BlogPostSummary`).

## Alternatives weighed

**Reading `contentText` from the list and stopping there.** Not possible: the
list does not contain that either. No form whatsoever of an article page can be
built from a summary.

**Pairing translations by matching `slug`.** Refused. Slugs are localised —
that is precisely why `translationGroupId` exists. A pairing rule living only in
this repo is a rule that does not exist, and a mispairing publishes the wrong
article under the right title.

**Building the feed now in `awcms`.** Postponed, not refused: it is a change in
another repo, with its own ADR and security review. What this ADR decides is how
this repo behaves correctly while that feed does not exist.

**Accepting a human session token as the build credential.** Refused, and the
reason is in `awcms` ADR-0049 §Context: sessions expire, a password reset revokes
every session of that identity, and an MFA step-up rotates them. The build would
die at a moment nobody could predict, far from its cause.
