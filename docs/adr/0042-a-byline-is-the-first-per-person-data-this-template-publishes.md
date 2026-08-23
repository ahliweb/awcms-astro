🇬🇧 English (source) · 🇮🇩 [Bahasa Indonesia](0042-a-byline-is-the-first-per-person-data-this-template-publishes.id.md)

# ADR-0042 — A byline is the first per-person data this template publishes, and that changes an obligation rather than a rule

- **Status:** Accepted
- **Date:** 23 August 2026
- **Supersedes:** nothing. Consumes `awcms` ADR-0109 and narrows one sentence that three documents in this repo state as a property.

## Context

`awcms` ADR-0109 (its Issue #597 item 4) added `authorByline` to the post row.
It is opt-in: an author sets it themselves through `PATCH /api/v1/auth/profile`,
`NULL` is the state of every row that existed before that ADR, and `NULL` means
the article keeps organisation-level attribution. It is deliberately **not** the
author's account display name — publishing that because somebody pressed
Publish is the PII surface `awcms` Issue #649 refused to open.

It arrives on `GET /api/v1/blog/posts?view=full`, which this build **already**
calls. So consuming it adds no surface to the list
[`tests/kontrak-awcms.test.mjs`](../../tests/kontrak-awcms.test.mjs) hardens,
and that gate does not change colour. That is the whole reason this decision is
cheap to implement — and precisely why it needs writing down: a change that no
gate can see is a change nobody is forced to read.

**Three documents in this repo state, as a property, that this template
publishes zero per-person data.** Each names the same two pieces of evidence:
the JSON-LD `author` is an `Organization`, and the feed's `<author>` is the site
name. Two of them go on to say what would follow if that changed — *"a site that
adds a byline, an avatar, or comments takes on that obligation, and its erasure
path ends in a rebuild"* — which is the sentence this ADR is here to act on.

## Decision 1 — the byline is rendered, on all three surfaces that name an author

The article page (`✍️ Written by …`), the JSON-LD `author`, and the article's
entry in the Atom feed. Not one or two of them.

A feed that credits the organisation while the page credits a person is two
answers to one question, and a feed subscriber sees only one of them. The three
surfaces are therefore fed from **one field on one row** —
`LocalizedArticle.authorByline` — rather than each deciding for itself.

## Decision 2 — absent stays absent, and nothing is substituted for it

`NULL`, a missing field (an `awcms` that predates ADR-0109), and a
whitespace-only value all arrive at the renderer as `undefined`, and
`undefined` renders **no byline row at all** — not a row carrying the publisher
name.

This is the load-bearing half of the decision. An author who never opted in has
made a choice, and a template that filled the gap with the organisation name
would print an attribution line that reads as a person's name. The Atom feed
gets this for free and is worth naming: RFC 4287 §4.2.1 says the feed-level
`<author>` applies to every entry that lacks its own, so an entry with no byline
is already attributed to the organisation without one byte written for it.

## Decision 3 — the `Person` node carries a NAME and nothing else

No `@id`, no `url`, no `sameAs` in the JSON-LD; no `<uri>`, no `<email>` in the
feed. Both formats have a place for all of them.

A byline is credit for one piece of writing. An identifier or a profile link
turns it into an identity that can be followed across articles and across
sites — which is not what somebody asked for by filling in one name field.
Adding any of them later is a few characters that would pass every other gate,
so the refusal is asserted in
[`tests/schema.test.mjs`](../../tests/schema.test.mjs) and
[`tests/feed.test.mjs`](../../tests/feed.test.mjs) rather than left as prose.

## Decision 4 — the byline is read from the TRANSLATED row, not from the source row

This differs from `termIds`, `urutan` and `kategori`, which
[`src/lib/content.ts`](../../src/lib/content.ts) deliberately reads from the
source post so that a translator leaving the classification blank cannot drop an
article out of one language's archives alone.

Authorship is not classification. A translated article is frequently written by
somebody else, and taking the source author's name for it credits a person for
text they did not write. `publishedDate`, `updatedDate` and the featured image
are read from the same row for the same reason.

A **fallback** article — one shown in a locale that has no translation — is the
source post being displayed elsewhere, so it carries the source author's byline.
That is not an exception to this decision; it is the same rule reaching the same
answer.

## Decision 5 — the "zero per-person data" property is RETIRED, and the obligation behind it is now live

The three documents that state it are corrected rather than quietly left
standing, because a document describing a property the code no longer has sends
the next reader looking for a defect instead of at a decision.

What replaces it is the obligation those documents already spelled out:

- **A static site holds a COPY.** An erasure or anonymisation carried out in
  `awcms` does not touch an already-published file until the next build, and a
  copy already distributed can outlive that (CDN caches, the git history of
  `dist/` if a site commits its output).
- **So this repo's erasure path ends in a REBUILD**, and a site publishing
  bylines must be able to trigger one. This is stated, not gated: nothing in
  this repo can observe an erasure in `awcms`.
- **The scope is bounded by the opt-in.** The only per-person datum this
  template can publish is a name a person chose to publish, on articles they
  wrote. No email address, no identifier, no avatar, no profile URL — Decision 3
  is what keeps that list from growing by accident.

### What does NOT change

`AGENTS.md` §Security's *"no collection of readers' personal data"* is untouched
and is a different rule. That one is about the people who **read** this site —
no forms, no analytics binding an identity, no third-party scripts. A byline is
data about the person who **wrote** the article, published at their own request.
Reading the two as one rule would either forbid something nobody objected to or
license something everybody does.

## Consequences

- One PO key in every locale catalogue (`artikel.penulis`), called with the
  catalogue as the only source of the label.
- `tests/schema.test.mjs` gains the `Person`/`Organization` branch and the
  "name and nothing else" assertion; the test that read *"author is always an
  Organization"* is **renamed** rather than deleted, so it stops reading as a
  prohibition on behaviour that was added on purpose.
- `tests/kontrak-awcms.test.mjs` gains five adapter cases — including the
  translated-vs-source one, proven by mutation, because flipping that line
  passes typecheck and every other gate.
- No new `awcms` surface, so the hardened surface list is unchanged. This is
  worth re-reading before the next field arrives: the list guards **which
  endpoints** are called, and says nothing about what those endpoints return.
  A response that grows a field is a change this repo can consume in silence.
