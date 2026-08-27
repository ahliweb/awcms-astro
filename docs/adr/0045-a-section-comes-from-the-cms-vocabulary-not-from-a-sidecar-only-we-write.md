🇬🇧 English (source) · 🇮🇩 [Bahasa Indonesia](0045-a-section-comes-from-the-cms-vocabulary-not-from-a-sidecar-only-we-write.id.md)

# ADR-0045 — A section comes from the CMS vocabulary, not from a sidecar only we write

- **Status:** Accepted
- **Date:** 27 August 2026
- **Supersedes:** nothing. Narrows the placement rule established alongside [ADR-0018](0018-kontrak-build-token-mesin-dan-traversal-konten.md), which introduced `contentJson.awcmsAstro` as this repo's structured sidecar.
- **Related:** `awcms` ADR-0100 §4 (the envelope survives *because* this sidecar lives in it), `awcms` ADR-0104 (the build reads the taxonomy), `awcms` ADR-0115 §2–4 (the legacy importer declares the section), `ahliweb/awcms#739` (the write path that destroyed the sidecar), Issue #73

## Context

### The site published nothing an editor wrote, and nothing said so

Which section an article belongs to was decided by one expression in
`src/lib/content.ts`:

```ts
readBlock(post).kategori === tab
```

`readBlock` reads `contentJson.awcmsAstro`. That key is **this repo's own
sidecar**. Grepping `ahliweb/awcms` for it returns the legacy importer and a few
envelope-preservation comments and nothing else: there is no field for it on
`admin/blog.astro`, and no request body that screen sends carries it. The only
writer in the entire CMS is `bun run blog:legacy:import --section-map`, a one-off
migration CLI (`awcms` ADR-0115 §2).

So for an article written the normal way — an editor, in the CMS, pressing
Publish — `readBlock(post).kategori` is `undefined`, the comparison is
`undefined === tab` for every configured tab, and the post is filtered out of
the page set. **No article page, no section index entry, no archive entry, no
error.** The build is green and the site is empty.

For a template whose entire premise is "awcms is the content backend", the
default authoring path produced nothing.

### Neither repo could see it

This is the part worth recording, because the defect is older than the day
somebody noticed it.

- **Here:** `buatPost` in `tests/kontrak-awcms.test.mjs` wrote
  `contentJson: { awcmsAstro: { … kategori: "panduan" } }` on **every** fixture
  row. The one shape that fails in production was the one shape the doubles
  could not produce.
- **Over there:** `/blog/{code}/{slug}` renders from `body_portable_text`, so an
  affected post looks perfect on awcms's own public surface. `awcms`'s
  PROJECT_STATE records the same finding from its side on 26 August 2026, after
  its importer produced 25,029 articles for a repo that would have built a page
  for none of them.

A gate on either side would have had to produce an input neither side's fixtures
contained. That is the rung above "is the caller called" and "is the caller in
the request path": **does the repo that SERVES this read the field this writer
wrote?**

### The classification an editor CAN set was already being read

`/api/v1/blog/terms` has been a consumed surface since `awcms` ADR-0104, and
`src/lib/awcms/taksonomi.ts` already traverses it every build — to render the
category and tag archives. The article's own `termIds` already ride on
`?view=full`.

So the site was reading the editor's real classification, using it to build
archives, and then deciding the article's section from a key the editor cannot
reach.

## Decision

**A section is resolved from the tenant's taxonomy, with the sidecar kept as an
explicit override.**

### 1. Each tab declares the term slugs that place an article in it

`TabDef` grows `termSlugs: readonly string[]`, written out on **every** tab.
Writing it on every entry is not verbosity and follows the precedent
`urutanSeksi` already set in that file: a heterogeneous `as const` array makes
the element type a union, and `tab.termSlugs` becomes a property that does not
exist on some members of it. `astro check` goes red.

The obvious default — a tab's slug is its term's slug — is still **written**,
because the interesting case is the one where they differ: a site whose section
is `berita` while its editors file under `berita-daerah` and `berita-kota` has
somewhere to say so, instead of being told to rename categories in the CMS.

### 2. The sidecar wins when it is present

Not for backward compatibility. `awcms` ADR-0115 §4 **refuses** to import a row
its `--section-map` cannot place, which makes the sidecar a deliberate
instruction from the one tool that writes it. Letting taxonomy override it would
land a migration somewhere its operator did not choose.

A sidecar naming a tab that is not configured is **not** a silent fallback to
taxonomy. It is reported as unplaced, because it means a tab was renamed or
removed and something still points at the old name.

### 3. Ties break on declaration order, and that is stated rather than left to a hash map

An article filed under two categories that both map to tabs lands in whichever
tab appears first in `tabs`. Some rule has to be chosen; without one, a
section's contents reshuffle between builds that changed nothing.

### 4. Placement is computed ONCE per build, and unplaced posts are reported

Two outcomes, deliberately different events:

- **Some posts unplaced** → each is named in the build output, and the build
  continues. Failing here would let one mistyped category stop a newsroom from
  publishing.
- **Every post unplaced, out of N > 0** → the build **fails**. This is not an
  article-level mistake: it is `termSlugs` naming a vocabulary this tenant does
  not use, a build credential without `blog_content.taxonomies.read`, or tabs
  renamed while `site.ts` was not. All three publish an empty site from a green
  build, which is the defect this ADR exists to end.

This is the same shape as the media rule ADR-0025 already applies — one id
missing is an operator action, zero out of N is not — and it is applied here for
the same reason.

### 5. An empty vocabulary stays a legitimate state

`taksonomi.ts` warns and returns `[]` for a 403 or 404, because "your CMS is
down" and "this newsroom uses no categories" must not be the same event. A site
that places every article through the sidecar keeps building exactly as it did
before this ADR.

## Consequences

- An article written in awcms's admin screen, filed under a mapped category,
  builds its page, its section index entry and its archive entries.
- `entry.data.kategori` now carries the **placed** tab rather than the sidecar's
  raw string. Reading the sidecar there would give a taxonomy-placed article an
  empty section: its breadcrumb would name nothing, and `urutanSeksiTab("")`
  answers `"manual"`, so a news section would silently render as a reference one.
- `getArticles` costs one extra bounded request per build (the vocabulary), not
  one per tab and not one per post. Asserted per-endpoint in the contract suite,
  because a total-request count is a number that rises by one every time someone
  adds a request and stops guarding anything.
- **`buatPost` gained a sidecar-less variant**, and the suite asserts that
  variant is published. Without it this ADR would be a change nothing could
  prove.
- A malformed `/blog/terms` response — `200` with no `terms` array — now fails
  with a message naming the endpoint, instead of `Spread syntax requires
  ...iterable not be null or undefined` thrown from inside the adapter.

## Rejected

- **Dropping the sidecar entirely.** It is a written cross-repo contract
  (`awcms` ADR-0115 §2) with a live writer. Removing it would break the legacy
  import path this family still ships.
- **Falling back to taxonomy when the sidecar names an unknown tab.** Turns a
  renamed tab into a silent re-filing, which is a content decision made by a
  bug.
- **Failing the build on ANY unplaced post.** One editor's typo would stop every
  other article from publishing.
- **Warning only, never failing.** A warning in a CI log is not read by anyone
  the day a site publishes zero articles. The zero-of-N case has to stop the
  build, or this ADR would only have made the failure quieter.
