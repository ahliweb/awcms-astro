🇬🇧 English (source) · 🇮🇩 [Bahasa Indonesia](ui-contract-inventory.id.md)

# UI, data and consumer-contract inventory of the SSG site

**Research report, 20 November 2026** · issue [#187](https://github.com/ahliweb/awcms-astro/issues/187). Documentation only: no runtime, route, dependency, endpoint or database change, and no issue to implement anything is opened by this report (an implementation issue needs gate 9 first, in `awcms` for the contract and here for the screen).

**Question.** For every screen this repo really renders, what data does it show, which `awcms` contract operation supplies it, which permission and tenant rule applies, and which test would go red if that stopped being true? Where are the gaps and the drift?

**Answer in short.**

- Every route is a **build-time static** page, except three browser-side calls from the reader (search, page-view beacon, newsletter). **There is no USER admin and no BFF code**: `permukaanAdmin` is empty and no route sets `prerender = false`. Both are PLANNED, not implemented (§6).
- The source calls **thirteen** `awcms` operations. All thirteen exist in `awcms`'s public OpenAPI at the SHA below, with the HTTP method this repo uses. No required response field this repo reads is missing from the spec (§4).
- The contract test **does not read the OpenAPI document**. It simulates `awcms` with hand-written `fetch` fakes, so a field renamed or removed upstream turns nothing red here (§4, G-01).
- Coverage is strong for traversal, tenant, publish predicate, ordering, media and taxonomy, and **thin for failure statuses other than the few special-cased** (§7, G-02 to G-04).
- Three documentation statements are stale (§8, D-01 to D-03).
- **Not exercised in this run:** the real-`awcms` integration (this repo has no instance and its CI `Build` job is skipped without `AWCMS_API_URL`) and the in-browser axe gate (Chromium revision missing locally). Both are stated, not assumed (§2).

## 1. Sources and method

| Item | Value |
| --- | --- |
| `awcms-astro` | `main` at `02c71f7fadd2fbb887baed5cada73238f4de4fee` (19 November 2026, merge of #185) |
| `awcms` | `main` at `765e52c7aca35e91a57ed24fc04a035176a32c95` (19 November 2026) |
| Spec read | `openapi/awcms-public-api.openapi.yaml` in `awcms` at that SHA, `info.version` `0.1.0`, parsed with a YAML loader and compared field by field with the consumer code |
| Evidence classes | **VERIFIED**: source path plus a test that would fail, or a command run here with its result. **ASSUMED**: stated by a comment, document or ADR, not checked by code, test or run. **PLANNED**: documented as future, no code. **DEFERRED**: explicitly postponed by a recorded decision |

Everything below is classed by those four words. A row that says VERIFIED names its evidence; a row without a test says so.

## 2. What was run, and what was not

| Command | Result |
| --- | --- |
| `bun test` on the baseline | 978 tests across 48 files: 960 pass, 18 skip, 0 fail. The 18 skips come from three `describe.skipIf` blocks that need a build output (they ran, and passed, after the stand-in build above): `tests/keluaran-csp.test.mjs`, `tests/aksesibilitas.test.mjs` ("build output carries the panel") and `tests/penyaji.test.mjs` ("artefak produksi menyajikan hasil build") |
| `bun run check` (lockfile + `astro check`) | 0 errors, 0 warnings, 6 hints |
| `bun run test:a11y` | The build against the stand-in server **succeeded** (`e2e/awcms-tiruan.mjs`, 28 HTML files). The Playwright run **failed to start**: Chromium revision 1254 is not installed on this machine (1248 and 1255 are). **No axe result was obtained**, so §7 reports the axe page list as read from `e2e/a11y.axe.mjs`, not as passed |
| Real `awcms` | **Not available.** This template repo has no instance; its CI `Build` job runs only when `vars.AWCMS_API_URL` is set and was skipped on the baseline run. No claim below depends on a real instance answering |

## 3. Screens and routes

Static means rendered once at build from `getStaticPaths` and the data layer; the reader's browser calls `awcms` only where §5 says so. `[lang]` is every prefixed locale (`en` today); `id` is the default and unprefixed.

| Route | Shows | Contract operations | Permission / tenant | Status | Evidence |
| --- | --- | --- | --- | --- | --- |
| `/` and `/{lang}/` | section lead articles, site identity, footer menus and widgets | posts, media objects, site-profile, menus, widgets | read permissions below; tenant from the machine token | VERIFIED | `src/components/views/Home.astro` via `getArticles` in `src/lib/content.ts`; `tests/kontrak-awcms.test.mjs`, `tests/identitas-situs.test.mjs`, `tests/menu-widget.test.mjs` |
| `/{tab}/` and `/{lang}/{tab}/`, `…/halaman/{n}/` | one section's article cards, bounded pages, feed link | posts (section from term or sidecar), media objects | `blog_content.posts.read`, `media_library.media.read` | VERIFIED | `src/components/views/TabIndex.astro`, `src/pages/[tab]/halaman/[nomor].astro`; `tests/paginasi.test.mjs` (pages 2..N, canonical to itself), `tests/kontrak-awcms.test.mjs` ("urutan seksi") |
| `/{tab}/{slug}/` and `/{lang}/{tab}/{slug}/` | article: title, body, byline, dates, image, categories and tags, related, share card | posts (`view=full`), media objects, terms | same | VERIFIED | `src/layouts/ArtikelLayout.astro`, `src/lib/content.ts`; `tests/kontrak-awcms.test.mjs` ("badan artikel datang dari kolom kanonik", "byline penulis", "gambar artikel dari media awcms", "kartu share per artikel") |
| `/{tab}/feed.xml`, `/{lang}/{tab}/feed.xml` | Atom feed of a section | posts, media objects | same | VERIFIED, **off by default** (the template publishes zero feeds) | `src/lib/feed-seksi.ts`; `tests/feed.test.mjs`, `tests/kontrak-awcms.test.mjs` ("template ini menerbitkan NOL feed") |
| `/kategori/{slug}/`, `/tag/{slug}/` (+ `halaman/{n}/`, + `[lang]`) | taxonomy archive of used terms | terms, posts (`termIds`) | `blog_content.taxonomies.read` | VERIFIED | `src/lib/arsip-taksonomi.ts`; `tests/arsip-taksonomi.test.mjs` |
| `/cari/`, `/{lang}/cari/` | search form, results, facets | search query and suggest, called from the reader's browser (§5) | anonymous; `awcms` resolves the tenant from the request, this repo sends no tenant header | VERIFIED markup and call shape, **not** the runtime states | `src/components/views/HalamanCari.astro`; `tests/kotak-cari.test.mjs`, `tests/pencarian.test.mjs` |
| `/privasi/`, `/{lang}/privasi/` | privacy statement, beacon disclosure | none | none | VERIFIED | `src/components/views/HalamanPrivasi.astro`; no test drives the page itself (`tests/beacon.test.mjs` covers the beacon, and `e2e/a11y.axe.mjs` lists the page) |
| `/sitemap/`, `sitemap-index.xml`, `robots.txt` | HTML and XML sitemap | posts (listing only) | same as posts | VERIFIED | `src/components/views/SitemapView.astro`, `src/pages/robots.txt.ts`, `astro.config.mjs`; `bun run audit:konten` (needs a build, not run here) |
| `/newsletter/confirm/`, `/newsletter/unsubscribe/` | token page; posts the token on a click | newsletter confirm and unsubscribe (§5) | anonymous; `awcms` resolves the tenant from the request | VERIFIED, **built even when the newsletter is off** (then shows a neutral sentence) | `src/components/views/HalamanTokenBuletin.astro`; `tests/newsletter.test.mjs` ("the token page sends nothing until a human acts") |
| `/404`, `/{lang}/404` | not found | none | none | VERIFIED | `src/components/views/NotFound.astro` |
| Every page: header, footer, locale switcher, reading-preferences panel | identity, menus, widgets; panel is local only | site-profile, menus, widgets, media objects | `site_profile.profile.read`, `blog_content.menus.read`, `blog_content.widgets.read` | VERIFIED | `src/layouts/BaseLayout.astro`; `src/components/PanelAksesibilitas.astro` uses `localStorage` key `awcms-a11y` only (`tests/aksesibilitas.test.mjs`) |

**Rendering mode.** `astro.config.mjs` sets `output: "static"` and installs the Node adapter only to serve the build. No file under `src/pages/` sets `prerender`. VERIFIED by `tests/peran-situs.test.mjs` ("template ini tidak punya satu pun rute on-demand", "tidak ada rute `prerender = false` yang tidak dideklarasikan").

## 4. Operations: spec, consumer, drift

All thirteen operations were found in the spec at the `awcms` SHA above. "Gate" is the permission the spec text names; the tenant comes from the machine token for the build-time ones (`tests/kontrak-awcms.test.mjs`, "tenant diturunan dari token").

| Operation (method) | Consumer | Spec gate | Fields the spec offers that this repo ignores | Status |
| --- | --- | --- | --- | --- |
| `/api/v1/blog/posts` (GET) | `src/lib/content.ts` | `blog_content.posts.read` | `seoTitle`, `scheduledAt`, `unpublishAt`, `institutionIds`, `regionCode`, `redirectCapture`, `autoInternalTagLinksDisabled` | VERIFIED; `seoTitle` read since #195, see G-05 |
| `/api/v1/media/objects` (GET) | `src/lib/awcms/media.ts` | `media_library.media.read` | `creditLine`, `sourceName`, `copyrightStatus`, `sizeBytes` (the consumer type keeps six fields: id, public URL, alt text, MIME type, width, height) | VERIFIED |
| `/api/v1/media/public-origin` (GET) | `src/lib/awcms/media.ts`, `scripts/asal-media.mjs` | `media_library.media.read` | none | VERIFIED |
| `/api/v1/site-profile/composed` (GET) | `src/lib/awcms/profil.ts` | `site_profile.profile.read` | `updatedAt` | VERIFIED |
| `/api/v1/blog/terms` (GET) | `src/lib/awcms/taksonomi.ts` | `blog_content.taxonomies.read` | `parentId`, `description` | VERIFIED |
| `/api/v1/blog/menus` (GET) | `src/lib/awcms/navigasi.ts` | `blog_content.menus.read` | `itemsTruncated` | VERIFIED, see G-06 |
| `/api/v1/blog/widgets` (GET) | `src/lib/awcms/navigasi.ts` | `blog_content.widgets.read` | none | VERIFIED |
| `/api/v1/site-search/query` (GET) | `src/lib/pencarian.ts`, `HalamanCari.astro` | anonymous (429 documented) | `reason` (`empty`, `too_short`, `too_long`) | VERIFIED, see G-07 |
| `/api/v1/site-search/suggest` (GET) | same | anonymous | none | VERIFIED |
| `/api/v1/analytics/collect` (POST) | `src/lib/beacon.ts`, `src/components/BeaconKunjungan.astro` | anonymous (202, 400, 413) | none | VERIFIED |
| `/api/v1/newsletter/subscribe` (POST) | `src/lib/newsletter.ts` | anonymous (200, 400, 429) | none | VERIFIED |
| `/api/v1/newsletter/confirm` (POST) | same | anonymous | none | VERIFIED |
| `/api/v1/newsletter/unsubscribe` (POST) | same | anonymous | none | VERIFIED |

**What "VERIFIED" means for this table.** The operation exists upstream with that method, and the consumer's field names match the spec's. It does **not** mean a test compares them: see G-01. The set of paths the source calls is gated both ways against the marked table in `.claude/skills/awcms-astro-integrasi/SKILL.md` by `tests/kontrak-awcms.test.mjs` ("kode sumber memanggil tepat tiga belas permukaan" and its table tests).

**Writes.** Two POSTs leave the reader's browser (beacon and newsletter), both anonymous, without credentials, to public endpoints; `tests/tanpa-backend.test.mjs` allows exactly those two files to emit a non-GET `method` and asserts no credentials travel. The build's own token class is read-only. `AGENTS.md` says "this repo reads `awcms`; it does not write" about the **build**, which holds.

## 5. Reader-browser calls (runtime)

| Call | States the UI has | Tested how |
| --- | --- | --- |
| Search query and suggest | start, searching, results, empty, error; "load more" through `nextCursor` | markup and call shape by source text (`tests/kotak-cari.test.mjs`: no second `fetch` argument, no `credentials`, no raw-HTML path, every `<template>` present, `<noscript>` says what is needed); URL and snippet logic by `tests/pencarian.test.mjs`. **No test drives the states in a browser.** A `429` shows the same error text as any failure |
| Page-view beacon | none visible by design | `tests/beacon.test.mjs`: payload bounds equal `awcms`'s, `content-type: application/json` present, inert without a declaration |
| Newsletter subscribe, confirm, unsubscribe | accepted (neutral), invalid, too often, failed, sending | `tests/newsletter.test.mjs`: 400, 429, 5xx, unparseable 200 and blocked preflight each have their own outcome; token posted on click, never on load |

## 6. Authenticated surfaces: USER admin and BFF

| Surface | Status | Evidence |
| --- | --- | --- |
| USER admin through `permukaanAdmin` | **PLANNED.** Declared as allowed by ADR-0034, **no code**. `permukaanAdmin.prefiks` and `.peran` are empty arrays in `src/config/site.ts` | `tests/peran-situs.test.mjs` ("template ini TIDAK menyatakan satu pun permukaan admin") |
| marketplace portal BFF (`/penjual/**`, `/affiliate/**`, `/_portal-api/**`) | **PLANNED**, held behind the prerequisites of `docs/awcms-astro/portal-bff/04-kesiapan.md`. Roadmap phase F3, status in the roadmap table, exit criteria still "to be proposed by the owner" | no `_portal-api` or BFF string in `src/`, `server/`; `docs/roadmap.md` |
| Public lead, consent and realtime client | **PLANNED** by `docs/crm-public-ux-contract.md` and `docs/bun-realtime-client-boundary.md`, marked "proposed documentation" in them | those documents; not repeated here |

No screen of §3 is a USER-admin or BFF screen, and no row claims otherwise. The ADR-0057 reading (Accepted 2026-11-20; it was Proposed at the baseline SHA) keeps the same rule: a release of such a surface needs the real capability in `awcms`.

## 7. Test inventory

### 7.1 Covered

| Area | File | What it proves |
| --- | --- | --- |
| Tenant | `tests/kontrak-awcms.test.mjs` | tenant derived from token; a different `AWCMS_TENANT_ID` fails the build; retired variables refused |
| Traversal | same | cursor traversal crosses one page; drafts and non-public never publish; `view=full` ignored by `awcms` fails the build; a silent `awcms` fails the build (`TIMEOUT`); an unreadable timeout is refused (`CONFIG_INVALID`); a cursor that does not advance throws; the 25,029-article corpus fits |
| Publish predicate and order | same | no `publishedAt`, far-future and unparseable dates; zero publishable posts fails the build; section ordering by editorial order or date |
| Media | same | missing id is a placeholder; all ids missing fails the build; more than 100 ids are split; resolved once per build |
| Taxonomy | same, `tests/arsip-taksonomi.test.mjs` | terms placed or named when unplaced; zero of N placed fails the build; an empty vocabulary is not a failure; response without `terms` fails naming the endpoint |
| Identity | `tests/identitas-situs.test.mjs` | 403 and 404 fall back and the build continues; media id unresolved renders nothing |
| Navigation | `tests/menu-widget.test.mjs` | item resolution, nesting, malformed payload becomes an empty list, `bodyText` rendered as text |
| Pagination, feed | `tests/paginasi.test.mjs`, `tests/feed.test.mjs` | bounded pages, self-canonical, feed bounded |
| Role | `tests/peran-situs.test.mjs`, `tests/tanpa-backend.test.mjs` | zero admin surface; no undeclared on-demand route; no backend dependency, non-GET `method`, persistence artefact |
| Output | `tests/keluaran-csp.test.mjs`, `tests/penyaji.test.mjs`, `bun run audit:konten` | need a build; skipped here without one |
| Accessibility | `tests/aksesibilitas.test.mjs`, `tests/aksesibilitas-halaman.test.mjs`; `e2e/a11y.axe.mjs` in CI | static gates; axe pages: home (id, en), section list, article (id, en), category, tag, search empty, search with results, privacy, sitemap, in light and dark, plus the panel modes and 360 px |

### 7.2 Empty or thin

| Path | State | Note |
| --- | --- | --- |
| Build against a real `awcms` | **empty** in this repo | skipped without `AWCMS_API_URL` |
| Contract versus the OpenAPI document | **empty** | no test reads the spec (G-01) |
| `AwcmsApiError` for `401`, `403` on posts, `5xx`, a non-JSON body, a refused connection (`UNREACHABLE`), `AWCMS_API_URL` unset (`CONFIG_MISSING`) | **empty**; only `TIMEOUT` and `CONFIG_INVALID` are driven | `src/lib/awcms/client.ts` (G-02) |
| `403`/`404` fallback of menus, widgets and terms | **thin**: terms is asserted by source text only (`tests/arsip-taksonomi.test.mjs`, "403 e 404 saja yang jatuh ke fallback"), menus and widgets have no behavioural test; identity is behavioural | G-03 |
| Search runtime states (error, `429`, `reason`) in a browser | **empty** | G-04 |
| axe for token pages, 404, paginated pages, `/en/cari/` | **empty**, not in the page list of `e2e/a11y.axe.mjs` | G-08 |
| Negative tenant test for the reader calls | not applicable here | tenant is `awcms`'s decision from `Origin` (not tested in this repo) |

## 8. Drift and gaps

| ID | Finding | Class | Evidence | Owner of the fix |
| --- | --- | --- | --- | --- |
| G-01 | No test compares consumer fixtures with the OpenAPI schemas; a renamed or removed upstream field is invisible until a real build | gap | §4, §7.2 | **Decided 2026-11-20 (owner):** the snapshot lives on the `awcms` side as option C′, a generator in its repo and a pinned fixture package published for consumers (`awcms` ADR for C′, issue awcms#1379; no ADR number yet). This repo consumes that package; implementation is backlog issue [#194](https://github.com/ahliweb/awcms-astro/issues/194), waiting for gate 9 and the package |
| G-02 | Failure statuses of `awcmsGet` other than timeout and bad config are untested | gap | `src/lib/awcms/client.ts` | here |
| G-03 | `403`/`404` fallbacks of menus and widgets are untested, terms by source text only | gap | `src/lib/awcms/navigasi.ts`, `src/lib/awcms/taksonomi.ts` | here |
| G-04 | Search error and `429` look the same to a reader, and `reason` is unread, so "query too short" reads as "no results" | drift, low | `src/components/views/HalamanCari.astro` | here; the contract already defines both |
| G-05 | `seoTitle` is never read: an article `<title>` is its title, a pipe and the section name, so an editor-set SEO title has no effect. Other unused post fields (`scheduledAt`, `unpublishAt`) are server-side concerns | drift | `src/layouts/ArtikelLayout.astro` (`pageTitle`), spec `seoTitle` | **Decided 2026-11-20 (owner): consumed.** A non-empty `seoTitle` from the API is the article `<title>`; empty or absent falls back to title plus section. Implemented by [#195](https://github.com/ahliweb/awcms-astro/pull/195) (closes #193), merged 2026-11-20 |
| G-06 | `itemsTruncated` on menus is unread; a legacy menu over 200 items renders only the first 200 with no signal | drift, low | `src/lib/awcms/navigasi.ts` | here |
| G-07 | The stand-in `awcms` is hand-written and covers the nine requests the build and search page make; it proves markup, not the contract (its header says so) | known limit | `e2e/awcms-tiruan.mjs` | none; noted so it is not mistaken for a mock |
| G-08 | axe page list omits the token pages, 404, paginated pages and `/en/cari/` | gap | `e2e/a11y.axe.mjs` | here |

Stale documentation, found while reading and **not** fixed in this report (docs belong to their own issue so they do not collide with open documentation work):

| ID | Statement | Reality |
| --- | --- | --- |
| D-01 | `AGENTS.md`, `docs/awcms-astro/permukaan-admin-user.md` (and mirrors) say the gate hardens the surfaces the build calls to "exactly three" | `tests/kontrak-awcms.test.mjs` hardens **thirteen** |
| D-02 | The comment above the second exception in `tests/tanpa-backend.test.mjs` says `newsletterAktif` is hard-coded `false` | `src/config/site.ts` derives it from `SITE_NEWSLETTER` and the search origin; the test still asserts it is false in the template |
| D-03 | `docs/awcms-astro/checklist-repo-baru.md` item about the `awcms` surfaces says "exactly three" | same as D-01 |

## 9. Recommended test plan, definition of ready, and risks

Backlog candidates, each S or M and non-overlapping; none is opened as an issue by this report (implementation issues wait for gate 9):

| Candidate | Size | Closes | Needs first |
| --- | --- | --- | --- |
| Client failure-status tests (`401`, `403`, `5xx`, non-JSON, `UNREACHABLE`, `CONFIG_MISSING`) | S | G-02 | nothing |
| Behavioural `403`/`404` fallback tests for menus, widgets, terms | S | G-03 | nothing |
| Search-states test in the existing Playwright setup, with distinct `429` text and `reason` handling | M | G-04 | a UX decision on the `429` and `reason` copy |
| ~~Apply `seoTitle`~~ (done, #195) and decide `itemsTruncated` | S each | G-05, G-06 | a decision for `itemsTruncated` only |
| axe page list extended | S | G-08 | stand-in routes for the missing pages |
| Contract-versus-OpenAPI check | M | G-01 | Decided: pinned fixture package from `awcms` (option C′, `awcms` ADR-0167, issue awcms#1379), backlog [#194](https://github.com/ahliweb/awcms-astro/issues/194); waits for gate 9 and the package; do not copy upstream code here |
| Fix D-01 to D-03 | S | D-01..03 | after PR #188 lands, to avoid editing the same lines |

**Definition of ready for a new screen here:** its data source is a named operation in the spec; its permission is the one the spec names; it states what it shows for empty, error and unavailable-at-build; it names its test; and it is a consumer of an `awcms` capability that exists or whose contract is agreed upstream.

**Security and privacy risks seen, none requiring a runtime change by this report:** the build token is read-only and the beacon and newsletter calls are anonymous (verified); the beacon requires a tenant code the build cannot check for `rawIpEnabled` (stated in `src/config/site.ts`); a static copy holds data `awcms` may later erase (stated in the `awcms` ADR-0094 row of `.claude/skills/awcms-astro-integrasi/SKILL.md`); the reader-browser calls fail in a stranger's browser rather than in the build (G-04, G-07).

**Placement.** Generic backend change goes to `awcms`; consumer UI goes here. Non-duplication was checked by reading that no `src/` file stores data, no non-GET call carries the build token, and every capability named above lives upstream.

## References

- [`tests/kontrak-awcms.test.mjs`](../tests/kontrak-awcms.test.mjs), [`tests/tanpa-backend.test.mjs`](../tests/tanpa-backend.test.mjs), [`tests/peran-situs.test.mjs`](../tests/peran-situs.test.mjs)
- [ADR-0014](adr/0014-rendering-campuran-dan-bff-portal.md), [ADR-0034](adr/0034-publik-secara-bawaan-admin-hanya-bila-dinyatakan.md), [ADR-0038](adr/0038-kebutuhan-backend-menjadi-modul-di-awcms.md), [ADR-0043](adr/0043-the-readers-browser-calls-awcms-and-nothing-else-changes.md), [ADR-0049](adr/0049-a-reader-may-subscribe-and-the-first-write-from-a-strangers-browser.md)
- [`docs/awcms-astro/integrasi-awcms.md`](awcms-astro/integrasi-awcms.md), [`docs/roadmap.md`](roadmap.md)
- `awcms` ADR-0156 (flow v2: per-screen data inventory and generated mock), `awcms` ADR-0065 (frozen consumer contract)

## Changelog

### 2026-11-20 - v1.1.1

- G-05 marked implemented by #195 (`seoTitle` consumed, merged 2026-11-20); the follow-up row and the endpoint row updated. Findings of v1.0.0 unchanged. The C′ decision is now `awcms` ADR-0167 (Accepted 2026-11-20).

### 2026-11-20 - v1.1.0

- Recorded owner decisions of 20 November 2026: G-01 (snapshot lives on the `awcms` side, option C′; this repo consumes the pinned fixture package, backlog #194), G-05 (`seoTitle` consumed, #193), and ADR-0057 Accepted. The findings and evidence of v1.0.0 are unchanged.

### 2026-11-20 - v1.0.0

- First report, from issue #187, at the SHAs in §1.
