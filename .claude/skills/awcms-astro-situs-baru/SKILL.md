---
name: awcms-astro-situs-baru
description: Deriving a new site from the awcms-astro template through "Use this template" — what must be emptied before the first commit, the order contract → content → presentation, and the traps that happen most often. Use when starting a new site repo from this template, or when a derived site behaves like its template.
---

🇬🇧 English (source) · 🇮🇩 [Bahasa Indonesia](SKILL.id.md)

# awcms-astro — deriving a new site

`ahliweb/awcms-astro` is a GitHub **template repository**. The **"Use this
template"** button creates a new repo with a clean commit history — not a fork,
so the site does not inherit the template's history.

The full procedure is in
[`docs/awcms-astro/checklist-repo-baru.md`](../../../docs/awcms-astro/checklist-repo-baru.md).
This skill carries what goes wrong most often.

## What MUST be emptied before the first commit

All of it comes along, and all of it is the **template's** history, not your
site's:

- `.changesets/*.md` — delete every one except `README.md`.
- `CHANGELOG.md` — empty it.
- `docs/adr/00*.md` **and** the table in `docs/adr/README.md` — start your own
  numbering from `0001`. `bun run audit:dokumen` demands the two agree in both
  directions, so deleting one without the other turns CI red.
- `package.json` — `name`, `description`, `homepage`, `repository`, `version`.
- `graphify-out/` — an analysis artefact of the template repo.

What is **not** touched: `src/lib/`, `src/layouts/`, `src/components/`,
`src/styles/global.css`, `scripts/`, `tests/`, `server/`, `.github/`. That is
the skeleton.

## The order: contract → content → presentation

Deliberate. Presentation comes last because it is the only layer that is cheap
to change.

1. **`src/config/site.ts`** — name, `siteUrl`, the list of locales, the tabs and
   their order, the `urutanSeksi` of every tab, **and `permukaanAdmin`**. A
   locale added here MUST have its PO catalogue.

   **This site is public only, unless you state otherwise.** An empty
   `permukaanAdmin` is the default, and it is a constant in THIS file — not an
   environment variable. (Looking for it in `.env` is the fastest way to stall
   halfway through a bootstrap; it is not there, and it never will be: the
   public-vs-public+admin decision ranks with tabs and locales, so it belongs in
   the contract.) A site may carry an admin surface for **users** (authors,
   reviewers) ALONGSIDE its public pages — not replacing them, so its prefix may
   not be `/`, a locale prefix, or a tab slug. `owner` is refused by a gate: the
   principal admin stays in `awcms`'s own `/admin/*` (ADR-0034). Declaring it
   moves not one permission — `awcms` still decides — and every feature there
   must **also** be manageable by an `owner` over there. Its shape,
   prerequisites, and cost:
   [`permukaan-admin-user.md`](../../../docs/awcms-astro/permukaan-admin-user.md).

   **A news site:** naming a tab `news` is NOT enough, and since
   [ADR-0036](../../../docs/adr/0036-news-adalah-kosakata-repo-ini-dan-sebuah-tab-yang-memikulnya.md)
   that is **no longer a silent trap**: a tab slugged `news` left on
   `urutanSeksi: "manual"` turns `bun test` red through
   `tests/kosakata-news.test.mjs`, and so do two tabs slugged `news`. What
   **stays** silent is a news section under any OTHER slug — `berita`, `kabar`,
   `press` — because the rule is about the ADDRESS, not the contents: `/news/`
   is this repo's URL vocabulary, and its gate keeps that address from lying.
   Without `urutanSeksi: "terbaru"` a section sorts alphabetically — every
   article that is not numbered has `urutan` 99 and the tiebreaker is the title,
   so the newest news is buried. That one word is also what turns the card badge
   into a date, makes its articles emit `NewsArticle` (ADR-0033), and publishes
   an **Atom feed** at `/news/feed.xml` per locale, announced by the section page
   and by its article pages (ADR-0035). The feed cannot be switched off
   separately — it is part of "this section is a news section". What does not
   exist yet, and you have to accept it first: pagination, for the pages AND for
   the feed — a section index and its feed both carry every article in that
   section.
2. **`.env`** from `.env.example` — `AWCMS_API_URL`, `AWCMS_API_TOKEN` (the
   machine credential; it is what carries the tenant, scoped to **two** keys:
   `blog_content.posts.read` and `media_library.media.read`), `AWCMS_TENANT_ID`
   as an **assertion** that fails the build when it does not match.

3. **Content** is written in the `awcms` admin panel, **not** in this repo.
   There is no `src/content.config.ts` and there is no frontmatter (ADR-0018).
4. **Illustrations** in `src/assets/`: `hero`, `tab/<tab>`,
   `artikel/<tab>/<slug>`, without an extension. There is no map to fill in
   (ADR-0024). `awcms` media wins over them when the article has a
   `featuredMediaId`.
5. **Presentation** — tokens in `:root`, contrast in light **and** dark, 360px
   and up.

## The traps that happen most often

| Trap | Consequence |
| --- | --- |
| `SITE_SOCIAL_IMAGE` points at a file that does not exist | Broken previews on every page, **without a single build failure**. Empty is a SUPPORTED state |
| An image ratio that is not `--ratio-visual` | The frame uses `object-fit: cover` → the source is silently CROPPED, not scaled down. `audit:konten` refuses it |
| `AWCMS_TENANT_CODE` is filled in | That variable is **refused**, not ignored (ADR-0018) |
| `AWCMS_TENANT_ID` is left empty | Valid, but it checks nothing — another tenant's token will build a full site of somebody else's articles, with a green build |
| Interface strings written literally in `.astro` | They are never translated; the PO catalogue gate catches a missing key, not a literal that never became a key |
| Forgetting `bun run audit:konten` **after** the build | Nine output gate families, plus two performance budget gates, skip themselves and say so — in a SITE that means they did not run |
| Deploying without `NODE_ENV=production` | `Strict-Transport-Security` is **silently not sent**, and nothing says so (ADR-0029). The `Dockerfile` sets it; a deployment that does not go through that image has to set it itself |
| Adding `includeSubDomains` without checking the subdomains | Every subdomain of the organisation becomes HTTPS-only for a year, in every visitor's browser — and what bears the consequence is the other services, not this site |
| Filling `src/assets/` with large raster photos | There is no `srcset` (ADR-0024): a 360px phone downloads the same file as a 1920px desktop. The image budgets (home ≤ 250 KB, content page ≤ 100 KB) are **measured** by `bun run audit:konten` over `dist/client` since 4 August 2026 — so going over is red after a build, not invisible |
| Creating empty `docs/ARCHITECTURE.md` and `docs/PROJECT_STATE.md` "because the checklist asked for them" | A mandatory empty file is the fastest way for a checklist to stop being read. Both are OPTIONAL; this template deliberately does not carry them |

## Before the first release

```bash
bun install
bun run build          # check + astro build + bundle the server + media origin
bun test               # after the build, the server layer runs too
bun run audit:konten   # after the build, the output gates run too
bun run audit:dokumen  # needs no build
bun run audit:translation  # needs no build
bun run audit:graf     # the graphify-out/ artefact; skips itself if deleted
bun run serve          # check headers & cache as a reader sees them
bun audit              # 0 vulnerabilities
bun run release minor --apply
```

`bun audit` (dependency vulnerabilities) and `bun run audit:konten` (site
contents) are two different things; the names are deliberately not made to look
alike.
