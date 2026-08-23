🇬🇧 English (source) · 🇮🇩 [Bahasa Indonesia](0043-the-readers-browser-calls-awcms-and-nothing-else-changes.id.md)

# ADR-0043 — The reader's browser calls `awcms` directly, and that is the only thing that changes

- **Status:** Accepted
- **Date:** 23 August 2026
- **Supersedes:** nothing. Consumes `awcms` ADR-0107 and adds the eighth and ninth entries to the hardened surface list.

## Context

`awcms` #607 asks for a reader's search box. Its engine has been complete and
mature over there for some time — weighted `tsvector`, GIN index, `ts_rank`,
snippets escaped at source, facet counts each computed without their own filter,
trigram typeahead, per-IP rate limiting, all inside the same RLS boundary as the
content. What was missing was the box, in both repos.

`awcms` ADR-0107 (23 August 2026) removed the last blocker, and the interesting
half of it was not CORS. `withSiteSearchTenant` resolved the tenant from the
HOST, so a reader on a statically built site calling that CMS fell through the
documented chain and landed on the deployment's DEFAULT tenant — one tenant's
site displaying another's articles as its own results, with a 200 and nothing
reporting a problem. A cross-origin request there now resolves its tenant from
the `Origin` and from nothing else.

## Decision 1 — the reader's browser calls `awcms` directly, and nothing else does

This is the first call in this repo that happens anywhere other than
`astro build`. Every existing one runs on a build machine holding a read-only
machine credential; these two run in a stranger's browser, anonymously.

The rule in `AGENTS.md` that reads *"the browser never calls `awcms` directly
and never holds its credentials"* is **not loosened**, because it does not
apply: it is item 1 of the four rules binding an AUTHENTICATED surface, and its
second clause says what it is protecting. There is no session here, no
credential, and nothing to hold. `awcms` refuses `credentials: "include"` by
construction — its grant carries no `Access-Control-Allow-Credentials` — so a
future author who reaches for one gets a response the browser will not let them
read.

A BFF was considered and rejected. It would mean `export const prerender = false`
on a route in a repo whose premise is `output: 'static'` (ADR-0014's territory,
with its own prerequisites), a runtime this site does not otherwise need, and a
second cache in front of a search index — for a request that carries no
credential and reveals nothing the reader is not already reading.

## Decision 2 — three properties of the call, and each fails only in a stranger's browser

1. **No custom headers.** A `GET` with only CORS-safelisted headers is a *simple
   request*. `awcms` deliberately ships no `OPTIONS` handler, so adding one
   header — an `accept`, a tenant id, a correlation id — does not degrade
   gracefully: the browser refuses to send the request at all.
2. **No credentials.**
3. **The tenant comes from the `Origin`.** A site whose public domain is not a
   registered, verified, active domain over there is answered with the neutral
   empty payload and no grant — byte-identical to "no results". The search box
   then finds nothing, for every query, and the only thing that knows why is a
   counter on the server.

None of the three is visible in a build log, so all three are gated in
[`tests/kotak-cari.test.mjs`](../../tests/kotak-cari.test.mjs), proven by
mutation. `.env.example` states the third consequence where an operator meets
it, because it is a configuration mistake and not a code one.

## Decision 3 — the snippet never becomes HTML, even though it is safe

`awcms` returns snippets whose only markup is `<mark>`, and it earns that claim
honestly: it escapes the whole `ts_headline` output FIRST, then swaps plain-ASCII
sentinels for the tags. Handing that string to `innerHTML` would work correctly
today.

It is still refused. `AGENTS.md` §Security's *"no raw-HTML path from the CMS"*
is not a statement about how careful the other side is — it is what keeps the
NEXT field, from the NEXT endpoint, from arriving through a path that already
exists. `potongSnippet` turns the string into text segments; the component
writes each one with `textContent` into a text node or a `<mark>`.

That generalises into the shape of the whole component: **no HTML is assembled in
JavaScript at all.** Every form the page can take is written as a `<template>` in
the `.astro` file and cloned by the script. The second reason is as load-bearing
as the first — a string built in the script would be the one piece of text on
this site that never goes through the PO catalogue, which is precisely the defect
the tab bar once paid for.

## Decision 4 — a value with no readable label is not rendered

Two lists are allow-lists here rather than pass-throughs, and the second was
found by running it rather than by reading it:

- **Facet PARAMETERS.** Only `channel`, `topic`, `institution`, `region` and
  `type` are ever put on a request. Forwarding whatever is in the address bar
  would push this site's readers' tracking parameters (`utm_source`, `fbclid`)
  into a request to another origin, and `awcms` ignores unknown keys, so nothing
  would fail.
- **Content-type VALUES.** Term facets carry an editor-written `label`; the
  content-type facet does not — its values are `resource_type` as stored
  (`blog_post`, `blog_page`), machine identifiers belonging to that repo's module
  registry. The first browser run of this feature rendered them as chips reading
  `blog_post`, in both languages: a machine key on screen, the exact shape this
  repo has a rule against. They now render through the PO catalogue, and a value
  with no entry renders no chip.

Both cost the same thing: a new facet or a new content type in `awcms` is inert
here until this repo names it. That is the correct direction — what is missing is
one chip, never a result.

## Decision 5 — the box is hidden until its script runs, and `[hidden]` is made to win

`/cari/` is one static file; without JavaScript nothing can fetch results. A form
that appears anyway is a control that does nothing when used, which `AGENTS.md`
§Interface calls worse than a control that is not there. So the form is `hidden`
in the source and the script reveals it — **after** every node it needs has been
found, so a missing template produces no box rather than a box that never
answers. `<noscript>` says so plainly.

That needed one rule this repo did not have: `[hidden] { display: none !important }`
in `global.css`. The `hidden` attribute works through a browser default that
LOSES to any author `display` rule on the same element — including
`.chip { display: inline-flex }`, which the "load more" button on this very page
uses. Without it, both controls are visible and clickable before the script runs.

## Decision 6 — `connect-src` travels the same road `img-src` already travels

`server/penyaji.mjs` stays the only place the policy is assembled (ADR-0019).
`scripts/asal-pencarian.mjs` writes `dist/server/asal-pencarian.json` from
`AWCMS_API_URL` after the build, and one reader — shared with the media origin,
not copied from it — parses both. Both directives are derived from values the
build wrote, so the policy and the page cannot disagree: a site that published a
box without the directive is a box whose every request the browser blocks, with
nothing on the server side reporting it.

Unlike the media origin, this one is NOT asked of `awcms`. There is nothing to
ask: the media origin is derived over there from its own R2 configuration and
cannot be guessed from here, while the search origin IS the API address this
build already calls seven times.

## Consequences

- The hardened surface list goes from seven to nine
  ([`tests/kontrak-awcms.test.mjs`](../../tests/kontrak-awcms.test.mjs)), and the
  integration skill's marked table with it, in both languages. **Two of the nine
  are a different class** — called by the reader's browser, not by the build —
  and the gate cannot see the difference, so it is written into the gate's own
  comment and into the skill's prose.
- `cari` joins `kategori`, `tag` and `halaman` as a reserved path segment; a tab
  slugged `cari` now throws where the configuration is written.
- `AWCMS_API_URL` becomes reader-visible. It is still not `PUBLIC_`-prefixed and
  nothing is inlined by Vite: the origin travels as an attribute rendered at
  build time.
- Verified against real Chrome outside this repo before landing: the box opens,
  a `javascript:` URL in a result is dropped rather than linked, the snippet
  highlights without `innerHTML`, an entity-escaped `<bantuan>` stays text, chips
  write the address bar and are shareable, the suggestion list fills, and the
  console reports zero CSP violations. `tests/kotak-cari.test.mjs` is what keeps
  each of those from being changed silently afterwards.
