🇬🇧 English (source) · 🇮🇩 [Bahasa Indonesia](checklist-repo-baru.id.md)

# Starting a New Site on awcms-astro

The steps for deriving a new repo from this standard. The order is deliberate: the contract first, content next, presentation last.

Prerequisites: read [`README.md`](README.md) to make sure `awcms-astro` really is the right choice, and [`standar-teknis.md`](standar-teknis.md) for the binding rules.

## 1. Create the repo from the template

`ahliweb/awcms-astro` is a GitHub **template repository**: the **"Use this template"** button creates a new repo containing the whole skeleton with a clean commit history. There is no copy-and-paste step, and no file left behind because somebody forgot to copy it — the old way, and the way this repo itself once inherited another repo's ADR index.

What comes along and **must be emptied before the first commit**, because its contents are the template's history and not your site's:

- [ ] `.changesets/*.md` — delete every file except `README.md`.
- [ ] `CHANGELOG.md` — empty it; it is the template's release history.
- [ ] `docs/adr/00*.md` + the table in `docs/adr/README.md` — this template's decisions, not your site's. Start your own numbering from `0001`; `bun run audit:dokumen` demands the table and its files match in both directions, so deleting one without the other turns CI red.
- [ ] `package.json` — `name`, `description`, `homepage`, `repository`, and `version` (back to `0.1.0`).
- [ ] `graphify-out/` — an analysis artefact of the template repo; delete it, and add it to `.gitignore` if you do not use its tooling.

What does **not** need touching: `src/lib/`, `src/layouts/`, `src/components/`, `src/styles/global.css`, `scripts/`, `tests/`, `server/`, `.github/`. That is the skeleton.

## 2. Settle the contract before writing a single article

- [ ] `src/config/site.ts` — the name, the domain, `siteUrl`, the list of locales, the main navigation and its order, and **`urutanSeksi` for every tab**.
- [ ] **Decide: is this site public only, or public + user admin?** The default is public only (`permukaanAdmin` empty), and that is the right answer for almost every site. If your site needs a surface where an author or a reviewer does their own part, declare it in `permukaanAdmin` — the route prefix AND the role code, both at once. Three things that will turn `bun test` red if missed ([ADR-0034](../adr/0034-publik-secara-bawaan-admin-hanya-bila-dinyatakan.md)): `owner` in the role list (the principal admin stays `awcms`'s), a prefix that swallows the public surface (`/`, a locale prefix, or a tab slug), and a `prerender = false` route whose prefix is not declared. Remember its cost too: sessions, CSRF, caches that must be separated, and the whole ADR-0019 posture now applying on a path that carries credentials.
- [ ] **If you do declare it: check that every feature there already has its manager in `awcms`.** The rule ([ADR-0034](../adr/0034-publik-secara-bawaan-admin-hanya-bila-dinyatakan.md) §4, mirrored by `awcms` ADR-0070 §4): every feature a user works with on your site's admin surface **must also be manageable by an `owner`** through `awcms`'s own `/admin/*`. The order is therefore **`awcms` first, always** — a feature landing here first is a feature that for a while nobody can switch off. This item is on the checklist precisely because it **cannot be gated from this repo**: the permission catalogue and the screen registry live in `awcms`, and this repo has no instance to ask. What can be gated is only its consequence — the `awcms` surfaces the build calls are hardened to exactly three by `tests/kontrak-awcms.test.mjs`, so a user admin feature needing a fourth surface **certainly** turns `bun test` red until its contract is agreed simultaneously with that side (`awcms` ADR-0065). The list of `/admin/*` screens available today is in [`integrasi-awcms.md`](integrasi-awcms.md).
- [ ] **Does your site need to store something — form submissions, subscriptions, memberships?** That is a **backend need**, and its place is a **module in `awcms`** ([ADR-0038](../adr/0038-kebutuhan-backend-menjadi-modul-di-awcms.md)), not a folder in your site's repo. Not a formality: that module is what carries RLS, the permission catalogue, the audit trail, retention descriptors, and the data subject descriptor — so its data can answer "what do you store about me" rather than becoming a table nobody knows about. `tests/tanpa-backend.test.mjs` refuses backend-class dependencies, write paths to `awcms` from `src/`/`scripts/`, and persistence artefacts; it checks SHAPE, so do not read it as permission to store data somewhere else that happens to pass.
- [ ] **A news site?** Declare its sections, do not merely name them. A tab named `news` left on `urutanSeksi: "manual"` will sort ALPHABETICALLY, because every article that is not numbered has `urutan` 99 and the tiebreaker is its title. What switches news behaviour on ([ADR-0033](../adr/0033-seksi-berita-urutan-dari-tanggal-dan-dua-tanggal-yang-terpisah.md)):

      ```ts
      export const tabs = [
        { slug: "news", label: "News", urutanSeksi: "terbaru" }
      ] as const satisfies readonly TabDef[];
      ```

      That one line orders the section by `publishedAt` descending, changes the card badge from an article number into a date, makes its articles emit `NewsArticle` instead of `Article`, and — since [ADR-0035](../adr/0035-feed-atom-per-seksi-berita-dan-gerbang-atas-xml.md) — **publishes an Atom feed** at `/news/feed.xml` and `/<locale>/news/feed.xml`, announced by the section page and by its article pages. You need touch nothing to get it, and there is no way to switch it off other than returning the section to `"manual"`. What you still have to supply yourself: six PO keys per locale (`home.tab.news.title`/`.desc`, `tab.news.h1`/`.lead`/`.pageTitle`/`.metaDesc` — `bun test` is red without them), 16:9 section artwork in `src/assets/` following the `tab/<tab>` convention, and a way for a post to LAND in that section. Since [ADR-0045](../adr/0045-a-section-comes-from-the-cms-vocabulary-not-from-a-sidecar-only-we-write.md) that means `termSlugs` on the tab naming the awcms category your editors actually file under — **not** `kategori: "news"` in `contentJson.awcmsAstro`, which no authoring screen in awcms writes. The sidecar still works and still wins when present; it is written by the legacy importer, not by an editor.

      **A boundary you have to accept before switching it on:** the section index renders ALL of its articles on one page, and **so does its feed** — pagination does not exist for either, and the reasoning is in §What was not built of ADR-0033 and ADR-0035. A feed carries a summary, not the article contents (ADR-0035 §3), so subscribers click through to your site rather than reading in their reader. `Content-Type: application/atom+xml` is only guaranteed when `dist/client` is served by `server/penyaji.mjs`; behind somebody else's static host it reverts to `application/xml`. For a high-volume news site, first weigh serving `awcms`'s own public surface at `/{locale}/blog/{tenantCode}/**`: over there, pagination, category/tag archives, search, feeds, and a sitemap already exist, and publishing goes live without a rebuild. Note the shape before you advertise a URL: since `awcms` ADR-0098 (15 August 2026) the locale is IN the path and the bare `/blog/{tenantCode}/…` answers a `307`, so the address you print on paper should be the prefixed one. **Not `/news/**` from `awcms`** — its four routes were deleted over there on 8 August 2026 and now 301 to `/blog/{tenantCode}/**` (**except** for a tenant with `legacyTenantRouteEnabled: false`, which has already switched off its entire public content surface and is therefore still answered 404 rather than given a 301 towards a certain 404 (`awcms` ADR-0071 §4 item 3)); since [ADR-0036](../adr/0036-news-adalah-kosakata-repo-ini-dan-sebuah-tab-yang-memikulnya.md) (its counterpart being `awcms` ADR-0071) `/news/` is **this repo's** URL vocabulary, and `/blog/` is `awcms`'s. One route family per repo, and never both in one repo.
- [ ] `.env` from `.env.example` — `AWCMS_API_URL`, `AWCMS_API_TOKEN` (the machine credential; it is what carries the tenant), `AWCMS_TENANT_ID` as an assertion. **Issue that token on `awcms`'s `/admin/machine-credentials` screen**, in the **read** class, with two keys (`blog_content.posts.read` + `media_library.media.read`), on a service account belonging to your own site's tenant — not a partner's delegated actor, which stops building the moment that partnership is suspended (`awcms` ADR-0093). Its plaintext appears once; reloading that page burns it. **Content does not live in this repo**: there is no `src/content.config.ts` and no frontmatter, because articles are pulled from `awcms` at build time (ADR-0018). The schema Zod used to enforce is now the `awcms` side's responsibility — its list of guarantees is in [`integrasi-awcms.md`](integrasi-awcms.md).
- [ ] `astro.config.mjs` — `site`, `compressHTML: true`, the sitemap `serialize`. **There is no markdown pipeline**: content comes from `awcms` as structured blocks, and what renders it is `src/lib/content-blocks.ts`, not remark/rehype. Four other settings in that file **must not be touched without reading their reasoning**: `output: "static"`, the node adapter, `build.inlineStylesheets: "never"`, and `vite.build.assetsInlineLimit: 0` — the last two are what make a strict CSP possible, and both fail silently when loosened.
- [ ] `package.json` — `name`, `description`, `homepage`, `repository`, `engines`, and every script.
- [ ] The Bun version consistent across **five values**, not three files — `packageManager`, `engines.bun`, `bun-version` in **two** CI jobs, and the image tag (identical in both `Dockerfile` stages) — plus the digest pinned beside those tags, making six things that move together ([ADR-0030](../adr/0030-aturan-tertulis-mendapat-pemeriksanya.md) §Consequences). Counting files rather than values is the mistake [ADR-0030](../adr/0030-aturan-tertulis-mendapat-pemeriksanya.md) was written to end: the second duplicate in each file is the one most likely to be left behind, and each stays green on its own. `tests/versi-toolchain.test.mjs` compares all of them, and it also refuses one stage being pinned to a digest while the other is not — when a tag and a digest are both present, Docker obeys the digest and the tag becomes a comment.

  **Raising the pin later has one trap that gate cannot see, because it is about a Bun BINARY someone runs, not a value written in this repo.** Since Bun 1.4 writes `bun.lock` as `lockfileVersion: 2` — a format a Bun that only satisfies `>=1.3.0` cannot parse at all — a `bun.lock` regenerated by anyone with a newer Bun installed locally (a contributor, a teammate's PR, Dependabot) silently upgrades the format while your site's own five pinned values may still say `1.3.x`. The five stay internally consistent and the gate above stays green, yet the very next `bun install --frozen-lockfile` in CI or `docker build` fails with `error: Unknown lockfile version at bun.lock:2:22` — a message naming the lockfile, never Bun. The symptom, cause, and fix are written out in [`deploy-coolify.md`](../deploy-coolify.md#a-bun-install---frozen-lockfile-that-names-a-lockfile-not-a-bun-version).

The question that shapes your schema: **what mistake harms this site's readers most, and which field makes that mistake hard to make?** In the reference repo the answers were `cakupan` and `biaya[].jenis` — both force a decision that would otherwise be missed.

## 3. i18n

- [ ] Set the default locale and the list of other locales in `localeMeta`.
- [ ] Fill in `src/locales/<default>/messages.po`. The default catalogue is the reference; a key absent here will display as a raw key name.
- [ ] Create the other locale catalogues, which may be almost empty — the fallback handles that.
- [ ] If there is a language with few speakers and a thin technical register, **write its condition as an ADR from the start**, not after machine translation has already been published. Example: the reference repo's ADR-0004.

## 4. Content and assets

- [ ] Write one complete article in the default locale **through the `awcms` admin panel** as a shape reference, then build and look at the result. Content is not written in this repo.
- [ ] **Settle one image ratio for the whole site**, then use that ratio in every frame **and** every source. A frame uses `object-fit: cover`; a source at another ratio is cropped silently, not scaled down. Its value is `--ratio-visual` in `src/styles/global.css`, and `bun run audit:konten` enforces it over every file in `src/assets/`.
- [ ] Put illustrations in `src/assets/` following the naming convention — `hero`, `tab/<tab>`, `artikel/<tab>/<slug>`, with no extension ([ADR-0024](../adr/0024-seni-lokal-di-src-assets.md)). **There is no map to fill in**: `src/lib/article-images.ts` resolves it through `import.meta.glob`, and a file that does not exist renders a styled placeholder — **with one exception, `hero`**, which renders nothing at all on the home page (see below).
- [ ] Share cards: **optional, and absent by default.** `awcms-astro` carries no
      card generator (`scripts/kartu-share.mjs` exists only in the reference
      repo). If this site has one standard card, put its file in `public/` and
      point at it with `SITE_SOCIAL_IMAGE`; if not, leave that variable empty and
      the pages install no image tag at all. **Do not fill it in with a file that
      does not exist yet** — that publishes a broken preview on every page with
      not one build failure, and that is exactly what once happened in this
      template.

If illustrations are generated, **do not let their configuration inject raw markup**. Escape all text in one place. A raw-markup door looks practical and only needs to be used once to let through a bare `&` that makes a browser fail to render with not one error message.

## 5. The audit gates

They must stay green:

- [ ] `bun run check` — the lockfile gate, then `astro check`.
- [ ] `bun test` — 40 gate files. The ones that most often turn a new site red:
      the PO catalogues (`tests/katalog-po.test.mjs` — a key used by the code but
      absent from a catalogue, a locale catalogue left behind, an empty `msgstr`,
      a tab key not yet written for any locale), the **site role**
      (`tests/peran-situs.test.mjs` — `permukaanAdmin` and every
      `prerender = false` route), the **`news` vocabulary**
      (`tests/kosakata-news.test.mjs` — a tab slugged `news` must be
      `urutanSeksi: "terbaru"`), the `awcms` contract
      (`tests/kontrak-awcms.test.mjs`), **no backend**
      (`tests/tanpa-backend.test.mjs` — backend-class dependencies, write paths to
      `awcms`, persistence artefacts), the Atom feed (`tests/feed.test.mjs`), and
      the block renderer (`tests/content-blocks.test.mjs`). All three audit
      scripts are re-run from inside `bun test`, so it can never be green while
      one of them is red.
- [ ] `bun run audit:konten` — the image gates (ratio, format from the file
      contents, SVG XML, text size).
- [ ] `bun run build && bun run audit:konten` — **run it again after the build.**
      The output gates (titles, descriptions, canonicals, hreflang, assets
      promised by metadata, dead links, the sitemap, key names leaking onto the
      screen) skip themselves when `dist/` does not exist, and say so. In the
      template repo that is normal; in YOUR SITE it means the gate did not run.
- [ ] `bun run audit:dokumen` — dead markdown links and the ADR index. It needs
      neither a build nor a network. A site that deletes `docs/adr/` gets an index
      gate that **skips itself and says so**; one that keeps it is bound by the
      same rules as the template: every ADR recorded, every row pointing at a file
      that exists, and the Status column agreeing with its ADR.
- [ ] `bun run audit:translation` — stale mirrors and mirror coverage. It needs no
      build either. A site that keeps only one language has nothing to mirror and
      an empty ledger; one that keeps both is bound by the same rule as the
      template ([ADR-0039](../adr/0039-english-is-the-source-language.md)): English
      at the bare path is the source, and `<name>.id.md` records the hash of what
      it was translated from.
- [ ] `bun run audit:graf` — the `graphify-out/` artefacts. A site that deletes
      that directory (see the list above) gets a gate that **skips itself and says
      so**; one that keeps it is bound by the same rules as the template,
      including that every community's name must be chosen rather than inherited
      from graphify's automatic naming.

**Placing artwork:** files in `src/assets/`, with the naming convention `hero`,
`tab/<tab>`, `artikel/<tab>/<slug>` without an extension — there is no registry to
edit alongside. A file that does not exist renders a styled placeholder, and that
is a **supported** state. Details in
[ADR-0024](../adr/0024-seni-lokal-di-src-assets.md).

**`hero` is the one name that renders NOTHING when the file is absent**, rather
than a placeholder. Everywhere else an empty frame holds up a layout that would
otherwise collapse; on the home page the hero panel already carries the latest
articles, so an empty frame there holds the reader's attention rather than the
layout — a striped rectangle in the first fold, directly above the only real
content the page has. Ship a `hero` file and it appears; ship none and the panel
is simply the article list.

Two image rules have no checker and never will: **text inside an image is only a
topic label**, and **no state institution's emblem or attributes**. Both are
judged by a human, every time new artwork arrives.

**Every new rule in the documentation must bring its checker here.** This is the part most often skipped, and its consequences are the slowest to be felt.

## 6. Presentation

- [ ] Adjust the design tokens in `:root` — see [`ui-ux-design-system.md`](ui-ux-design-system.md).
- [ ] Make sure contrast is sufficient in the light theme **and** the dark one.
- [ ] Test from 360px wide up to desktop — including **reading the text inside images** at the narrowest width.
- [ ] Hover feedback is also active on `:focus-visible`; switch decorative animation off entirely under `prefers-reduced-motion`, rather than merely speeding it up.

Presentation comes last because it is the only layer that is cheap to change.

## 7. Governance

- [ ] `AGENTS.md` — the working contract; bind every standard and point at its detailed document.
- [ ] `README.md` — why this site exists.
- [ ] `docs/adr/0001-*.md` — the first decision: why static, why this structure.
- [ ] **Optional, and this template deliberately does not carry them:** `docs/ARCHITECTURE.md` (the repo's anatomy) and `docs/PROJECT_STATE.md` (its state and resumption points). In the template their role is carried by §Structure of the README, each file's docblock, and §"What does not exist yet". Create both if your site grows beyond that — **do not** create them empty to satisfy this list. A mandatory empty file is the fastest way for a checklist to stop being read.
- [ ] `LICENSE` — check its scope; code and content often need different terms.
- [ ] `SECURITY.md`, `CONTRIBUTING.md`, `GOVERNANCE.md`, `CODE_OF_CONDUCT.md`, `SUPPORT.md`.
- [ ] `.github/workflows/ci.yml` and the issue/PR templates.
- [ ] `.claude/skills/` — the template carries **four** skills that apply to every
      derived site (the `awcms` integration, the gates, deriving a new site, and
      performance/security). Keep all four; **add** your domain-specific skills
      alongside them rather than replacing them. A skill describing something that
      does not exist in your repo is a defect, and `bun run audit:dokumen` checks
      the paths it names — `.claude/` is not excluded.
- [ ] **Make sure your deployment sets `NODE_ENV=production`.**
      `Strict-Transport-Security` is sent by the server only behind that gate
      ([ADR-0029](../adr/0029-hsts-digerbangi-produksi-tanpa-includesubdomains.md)),
      and a deployment that does not set it **gets no HSTS with nothing saying
      so**. The `Dockerfile` sets it; any other deploy path has to set it itself.

      **Do not** add it again in Traefik: two policy sources overwriting each
      other is the quietest way to end up with no policy at all, and that is
      exactly what already happened here once — for two months everyone assumed
      HSTS was installed there.

- [ ] **Decide `includeSubDomains` deliberately, or do not touch it.**
      This template deliberately sends only `max-age=31536000`. Adding it forces
      **every subdomain** of your organisation to be HTTPS-only for a year, in the
      browser of everyone who has ever opened this site — and what bears the
      consequence is the other services, whose owners took no part in the
      decision. Add it only once you have checked they are all HTTPS, in
      `server/penyaji.mjs`, then update `tests/penyaji.test.mjs`.

## 8. The first release

```bash
bun install
bun run build             # lockfile + astro check + astro build + bundle the server + media origin
bun test                  # must be green; after the build, the serving layer runs too
bun run audit:konten      # after the build, so its output gates run too
bun run audit:dokumen     # markdown links & the ADR index; needs no build
bun run audit:translation # stale mirrors & mirror coverage; needs no build
bun run audit:graf        # the graphify-out/ artefacts; skips itself if deleted
bun run serve             # check headers and cache as a reader sees them
bun audit                 # must be 0 vulnerabilities
bun run release minor --apply
```

The order is not taste: `bun run audit:konten` reads `dist/client`, and without a build output it skips its own output gates while saying so. `scripts/rilis.mjs` runs both in the same order, unconditionally.

`bun audit` (dependency vulnerabilities) and `bun run audit:konten` (site contents) are two different things; their names are deliberately not made to look alike.

## The most frequent mistakes

| Mistake | Its consequence |
| --- | --- |
| Writing many articles before the schema is final | A manual frontmatter migration across dozens of files in several locales |
| Adding a rule to the documentation without its checker | The rule is broken silently, and found out months later |
| Putting UI strings directly in `.astro` | That string can never be translated, and the page still looks correct in the default locale so nobody notices |
| Letting `public/` hold content images | It escapes `bun run audit:konten`: the ratio, format-from-file-contents, and SVG text size gates only read `src/assets/`. `public/` is deliberately excluded because a favicon must be square and a share card has its own standard size — so putting an illustration there means publishing it with not one checker |
| Filling `src/assets/` with large raster photos | There is no `srcset` ([ADR-0024](../adr/0024-seni-lokal-di-src-assets.md)), so a 360px phone downloads the same file as a 1920px desktop. The image budget in [`standar-teknis.md`](standar-teknis.md#performance) is the first place going over shows up |
| An image source at a different ratio from its frame | The image still appears, only its contents are cropped — nobody notices until somebody reads the text inside it |
| Trusting an image file's extension | A `.png` file whose contents are JPEG works normally until some tool reads it by its name |
| Putting figures or data inside an image | It escapes the rules guarding every other number, and it is not updated when that number changes |
| Writing a relative link in a changeset without adjusting it when folded | The link is off by one level, and the gate does not see it because it runs before folding |
| Postponing an ADR until "later" | The reasoning is lost; the same proposal comes back six months later |
| Copying a page component per locale | Six copies that slowly diverge from one another |
