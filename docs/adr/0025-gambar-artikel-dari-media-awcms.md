🇬🇧 English (source) · 🇮🇩 [Bahasa Indonesia](0025-gambar-artikel-dari-media-awcms.id.md)

# ADR-0025 — Article images from `awcms` media: resolved once per build, with an `img-src` that is ASKED FOR

- **Status:** Accepted
- **Date:** 3 August 2026
- **Owner's rule:** 3 August 2026 — "check the `ahliweb/awcms` repo, then carry on with what can be done on the basis of that repo's readiness."
- **Closes:** [ADR-0021](0021-tahan-pengembangan-menunggu-fondasi-awcms.md) §Resumption points item 1
- **Related:** [ADR-0018](0018-kontrak-build-token-mesin-dan-traversal-konten.md) (the build contract), [ADR-0019](0019-csp-ketat-dikirim-penyaji.md) (`img-src`), [ADR-0023](0023-penahanan-dipersempit-pekerjaan-tanpa-awcms.md) (the "rewritten if `awcms` changed?" test), [ADR-0024](0024-seni-lokal-di-src-assets.md) (local artwork), `awcms` [ADR-0049](https://github.com/ahliweb/awcms/blob/main/docs/adr/0049-machine-credentials-and-session-introspection.md), `awcms` [ADR-0056](https://github.com/ahliweb/awcms/blob/main/docs/adr/0056-media-library-admin-surface.md)

## Context

ADR-0023 held work that **needs** `awcms` with one boundary stated plainly:
*"the endpoint already exists" is not an answer of "no"*, because code calling
`awcms` has its shape decided by an `awcms` response, and this template repo has
no instance to prove its calls are right.

Two things changed that basis on 3 August 2026, and both came from `awcms`, not
from here:

1. **The `awcms` readiness analysis for this repo** (`awcms` #371). It checked
   against the CODE, not against a list, and concluded: **every content and
   session contract `awcms-astro` actually calls is complete** — post traversal
   (`view=full`/cursor/`locale`), media object resolution, session introspection,
   machine credentials, and the single post. What was holding this repo back was
   not a missing contract.
2. **One real gap was closed in the same wave** (`awcms` #370):
   `GET /api/v1/media/public-origin`, opened **precisely for this repo**, because
   `img-src` has to name the media host in a policy written BEFORE a single object
   is fetched.

The first item of ADR-0021 §Resumption points recorded two decisions remaining
here, and both are still exactly that: **where the resolved image lives**, and
**what `img-src` allows**. This ADR answers both.

## Decision

### 1. Resolved once per build, with the result in `LocalizedArticle`

`content.ts` collects every `featuredMediaId` from the feed, resolves them in a
batch against `GET /api/v1/media/objects?ids=…`, and puts the result in
`LocalizedArticle.gambar`.

**Not in `article-images.ts`**, and that is an ADR-0021 decision preserved: that
module is synchronous and a component may not fetch its own data (`AGENTS.md`).
Putting it there means either async components, or one HTTP request per rendered
card — for a 300-article site in two locales, hundreds of requests for data one
batch already holds.

The batch is split at **100 ids**, the limit `awcms` enforces. Exceeding it is
answered with a 400, not truncated — so a site's 101st illustrated article fails
the build rather than silently losing the rest.

### 2. `awcms` media beat local artwork

The order is not "remote beats local" but **specific beats generic**:
`featuredMediaId` is a choice an editor made for THAT article in the CMS, while
`artikel/<tab>/<slug>` is a file the site happened to place on a matching path.
Honouring the file when both exist means overriding an editorial decision with no
sign of it on the page.

A site wanting the opposite needs no switch: it stops filling in the featured
image in `awcms`. That is a decision made where the article lives.

### 3. One id missing ≠ every id missing

| State | Treatment | Reason |
| --- | --- | --- |
| One id does not resolve | Placeholder, the build continues | `awcms` permits an object to be purged and decides that a dangling reference becomes **inert, not an obstacle** (ADR-0056 §B). Failing the build here means this repo vetoing that decision — a site that cannot publish because one image was deleted. |
| ZERO of N ids resolve | **The build fails** | This is not an operator action. It is a build token without `media_library.media.read`, an `awcms` older than the endpoint, or media that is not configured. All three publish a site whose EVERY article loses its image at once — exactly the ADR-0018 defect shape. |

### 4. `img-src` is ASKED FOR, not copied

`scripts/asal-media.mjs` asks `GET /api/v1/media/public-origin` at build time and
writes `dist/server/asal-media.json`; `server/penyaji.mjs` reads it at start-up
and widens `img-src` with that origin.

ADR-0019 §Adjusting says to widen `img-src` **in the server file**, and that still
applies to an origin a SITE chooses (a CDN, a third-party host). A media origin is
not the site's choice — it belongs to the `awcms` deployment, derived from
`NEWS_MEDIA_R2_PUBLIC_BASE_URL` over there. Writing it by hand is two copies of
one value that agree until one of them is edited, and its failure names its cause
nowhere: **images silently blocked by a policy that looks perfectly fine.**
`awcms` opened that endpoint precisely to close this.

What does **not** change: the policy is still assembled in `penyaji.mjs` alone.
That JSON file is **data, not a second policy**. Two policy sources overwriting
each other is the quietest way to end up with no policy at all, and that remains
the ADR-0019 rule.

The value read from that file ends up **inside a header**, so it is treated as
untrusted input: broken JSON, `configured: false`, a scheme other than
`http`/`https`, and a non-string value are all treated as absent, and the origin
is trimmed through `new URL(...).origin` so that neither a path nor whitespace can
smuggle in a second directive. One malformed value makes the browser refuse the
WHOLE policy — along with `script-src`, `object-src`, and every other directive
inside it.

## Consequences

- **The first item of ADR-0021 §Resumption points is done.** What remains on that
  list is the share card (needs a generator, its own ADR) and the portal BFF.
- **The `Dockerfile` copies one more file**, and its absence fails nothing —
  exactly the defect class this ADR exists to close. Its `COPY` line carries a
  comment naming the consequence.
- **A deployment with no public media stays valid.** `configured: false` is a
  state, not an error (`awcms` chose 200 rather than 404 precisely so a build does
  not fail on a valid deployment), and `img-src 'self'` is the right policy for it.
- **The ADR-0023 test still applies to the rest.** What lands here is not a
  loosening of that test but its satisfaction: the contract is complete, and
  `awcms` itself verified that against the code in #371. The portal BFF — which
  calls `awcms` on every runtime request, not once per build — stays held.
- **An accepted risk:** images are verified against a test double, not against a
  real `awcms` instance, because this template repo has none. The double imitates
  the real refusals (`unresolved` reported, the 100-id limit), and the zero-of-N
  gate is what catches the difference if that double turns out to be looser than
  the original. A SITE runs the same build against a real `awcms` in its own CI.

  > **Attempted, and here is what stopped it — 3 August 2026.** Closing this risk
  > locally needs two things, and neither exists. **First**, the host→container
  > data path to the `awcms` Postgres is dead: the TCP connect succeeds
  > (docker-proxy accepts on loopback) but the session hangs —
  > `Connection timeout after 30s (sent startup message, but never received
  > response)`, and pings to the container IP are 100% lost while outbound FROM
  > the container works and the whole bridge configuration is correct. That is a
  > drop in a lower layer of the host, not a code defect in either repo, and not
  > something an iptables/sysctl tweak fixes. **Second**, and this is the
  > decisive one: that database is migrated (126 tables) but **empty** — zero
  > tenants, zero posts, zero media objects. An end-to-end build against it would
  > prove nothing about media resolution, and filling it means inventing data in
  > somebody else's development database to satisfy a test. The risk stays
  > accepted, now with a reason that can be checked rather than assumed.

## Alternatives considered

- **Reading the origin from the returned `publicUrl`** — refused, and the reason
  belongs to `awcms`: the policy is written before the first object is fetched, so
  a build that happens to contain no images would produce a policy with no
  `img-src` at all and break the next build.
- **Copying `NEWS_MEDIA_R2_PUBLIC_BASE_URL` into this repo's `.env`** — refused;
  two copies of one value, with a failure that names its cause nowhere. This is
  what `awcms` #370 removes.
- **Widening `img-src` through a server env var** — refused by ADR-0019, and its
  reasoning still holds: a policy that can be changed from outside its file is a
  policy that can be emptied with not one diff.
- **Failing the build on any missing id** — refused; see the §3 table.
- **Putting the resolution in `article-images.ts` with a module cache** — refused:
  it makes components wait on I/O and moves data fetching into the presentation
  layer, two `AGENTS.md` rules at once.
