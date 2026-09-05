🇬🇧 English (source) · 🇮🇩 [Bahasa Indonesia](standar-teknis.id.md)

# awcms-astro — Technical Standard

The technical rules binding every `awcms-astro` repo. Written so another repo can use them without carrying the reference repo's domain contents.

The word **must** in this document means that breaking it fails a quality gate, not merely that it is discouraged.

## The stack

| Aspect | Decision | Reason |
| --- | --- | --- |
| Framework | Astro 7, `output: 'static'` | Zero JavaScript shipped by default; pages stay fully readable without JS |
| Runtime | Bun `>=1.3.0`, enforced by `engines.bun` + `packageManager` | One runtime for the whole AWCMS family (ADR-0015); `bun.lock` the only lockfile |
| UI framework | **None** | Interactivity is written in vanilla DOM. No React/Vue/Svelte |
| Styling | One global CSS file + design tokens | No CSS framework; tokens on `:root`, the dark theme through `data-theme` |
| Content | **Pulled from `awcms` at build time** (ADR-0018); the family standard says markdown per collection per locale | Its contract is `LocalizedArticle` in `src/lib/content.ts`, not frontmatter |
| i18n | PO catalogues + `t(locale, key)` | Editable by a native speaker with no risk of breaking syntax |
| Sitemap | `@astrojs/sitemap` with `serialize` | `lastmod` from the content's date, not from the build time |
| Images | `<img>` over URLs from `import.meta.glob` (ADR-0024); the family standard says `astro:assets` | One shape for SVG and raster alike; cropping is guarded by the CSS frame + the ratio gate |

**Forbidden:** UI frameworks, CSS frameworks, animation libraries, third-party SDKs/widgets/pixels, and analytics that tracks individuals.

**Version differences from `awcms`, stated so they are not rediscovered as findings.** The `awcms` family compatibility manifest records the versions **that repo itself** uses; those values are not an obligation for this repo, but the difference is still worth knowing before somebody equalises it "for tidiness":

**The `this repo` column is read by `tests/versi-toolchain.test.mjs` and compared against `package.json`.** The `awcms` column is not, and cannot be: it names another repository, and a gate that needs the network is a gate that fails for reasons of its own. That column is a note taken by hand, and it can be stale — the one next to it cannot.

| Value | `awcms` | this repo | Its state |
| --- | --- | --- | --- |
| Bun | `1.3.14` | `1.4.2` | This repo raised its pin on 5 September 2026; the `awcms` column is unchanged and now lags — guarded by `tests/versi-toolchain.test.mjs` over five values here |
| `astro` | `^7.2.4` | `^7.2.9` | **This repo is five patches AHEAD since 2 September 2026**, and the direction is the new part: from 23 August it matched `awcms` exactly, and it is Dependabot raising this repo alone that separated them. Nothing here depends on the two agreeing — an `astro` patch range carries no cross-repo contract — so the gap is recorded rather than closed by holding a security-relevant patch back. `awcms` will close it on its own bump. The third column is the one with a checker; **this column is hand-written and read from `ahliweb/awcms` on 2 September 2026**, so treat it as a note that can go stale |
| `@astrojs/node` | `^11.1.4` | `^11.1.4` | The same as above, raised in the same pull request |
| `typescript` | `^7.0.2` | `^6.0.3` | **Deliberately different, and binding.** The 6.x pin here is the condition for the `astro check` gate being alive — see [ADR-0037](../adr/0037-pin-typescript-6-adalah-syarat-hidupnya-gerbang-astro-check.md) |

## The mandatory structure

```
src/
├── assets/images/        # source images — in src/, not public/, so they are optimised
├── components/           # render components; views/ holds page bodies shared across locales
├── config/site.ts        # the site contract: locales, navigation, URL helpers
├── content/<collection>/<locale>/*.md
├── content.config.ts     # the frontmatter contract
├── data/                 # the single source of reference data
├── layouts/              # BaseLayout (head, SEO, share) + content layouts
├── lib/                  # data & metadata access; never called from markdown
├── locales/<locale>/messages.po
├── pages/                # thin routes: getStaticPaths + one view component
└── styles/global.css
scripts/                  # the automated gates
docs/{adr,workflows,awcms-astro}/
.changesets/
.claude/skills/
```

**In `awcms-astro` itself FIVE of the entries above are absent, and that is
deliberate.** The first four — `content/`, `content.config.ts`, `data/`, and
`assets/images/` — are the shape of content-in-the-repo. This repo pulls it from
`awcms` at build time, so the frontmatter contract is replaced by
`src/lib/content.ts` (the API → `LocalizedArticle` adapter) and its reference data
lives in the CMS. The fifth is `docs/workflows/`: its role is carried by
`.claude/skills/`, because a procedure that can be run beats a procedure that has
to be read first.

In their place are two entries not on the standard list:
`server/penyaji.mjs` (the production server since
[ADR-0016](../adr/0016-penyajian-bun-di-belakang-traefik-tanpa-nginx.md)) and
`tests/` (the gates that run through `bun test`).

The direction rule runs one way: **content knows nothing about components, and components do not fetch their own data.**

- Components receive data through props. Calling `getCollection` inside a presentation component is forbidden.
- Files in `src/pages/` are thin wrappers. A page body is written once in `src/components/views/` and reused across every locale.
- Reference data (regions, categories, units) has **one source** in `src/data/` and is never retyped in markdown.

## Internationalisation

| Rule | Mandatory |
| --- | --- |
| The default locale at the root (`/artikel/`); other locales prefixed with their code (`/en/artikel/`) | Yes |
| Non-default locales built from one `src/pages/[lang]/` subtree, not a folder per language | Yes |
| The set of slugs decided by the default locale; slugs are not translated | Yes |
| Untranslated content falls back to the default locale with a marker the reader can see | Yes |
| Interface strings only from the PO catalogue, never literals in `.astro` | Yes |
| A key missing in another locale falls back to the default catalogue; a raw key name may not appear | Yes |
| Complete `hreflang` for every locale + `x-default` on every indexable page | Yes |
| Dead keys deleted from every catalogue | Yes |

The fallback chain means a "not translated yet" violation does not break the site — and precisely for that reason, **translation coverage must be reported by an audit gate** so it stays visible.

## Content

**In `awcms-astro` content does not live in the repo.** It is pulled from `awcms` at build time (ADR-0018), so its contract is `LocalizedArticle` in `src/lib/content.ts` — not frontmatter, and there is no `content.config.ts` here. What follows is the FAMILY standard for a site whose content is markdown-in-the-repo; it is still written down because that schema is what the `awcms` side has to satisfy for a site like this to have the same guarantees.

What a schema must have in a repo serving rule-bound information:

| Field | Function |
| --- | --- |
| `title`, `description` (max. 160 characters) | Page metadata |
| `publishedDate`, `updatedDate`, `reviewDueDate` | The information's age; a missed `reviewDueDate` is content debt. The first two come from `awcms` and are **read from the same one row** — folded into a single value, `dateModified` freezes at the publication date forever ([ADR-0033](../adr/0033-seksi-berita-urutan-dari-tanggal-dan-dua-tanggal-yang-terpisah.md)) |
| `cakupan` / the level of applicability | Forces the author to decide how far the information applies |
| `sumber` per numeric claim | Every figure is bound to a reference a reader can check |
| `dasarHukum` | The type of regulation, its number, year, and title — complete |

Binding writing rules:

- Anything unverified is written `TBD` along with the source to be checked. **Do not guess, do not copy from a third party.**
- Structured data (requirements, steps, fees, FAQs) is written in the frontmatter and rendered by components — not retyped in the article body.
- Fields that must be identical across locales: the category, the order, the level of applicability, tags, the **figures** in amounts, and every date named by the article's CONTENTS (a regulation's effective date, a deadline, an expiry).
- What is **not** required to be identical, deliberately: `publishedDate` and `updatedDate`. Both belong to each locale's own `awcms` ROW — a translation published later genuinely was published later, and forcing it to copy the source post's date would publish a claim that never happened.
- A translation does not change figures, regulation numbers, the degree of certainty of a sentence, or a warning.

## Image assets

| Rule | Mandatory |
| --- | --- |
| Source files in `src/assets/`, not `public/` | Yes |
| One content entity = one unique image, mapped centrally from its slug | Yes |
| SVG must be valid XML; a bare `&` makes a browser fail to render silently | Yes |
| **The source's ratio equals its frame's ratio** | Yes |
| **The format is read from the file's contents, not its extension** | Yes |
| **Text inside an image is only a topic label** — no figures, dates, identities, mocked-up documents, or application interfaces | Yes |
| **No state institution's emblem, logo, or attributes inside an illustration** | Yes |
| The smallest text in an SVG stays readable at the narrowest card width | Yes |
| Sources are committed as they are, not manually compressed | Yes |
| `public/` only for files needing a fixed URL | Yes |

The four rules in bold were born from real defects rather than theoretical caution; their details are in the reference repo's ADR-0013.

**Two family rules `awcms-astro` deliberately does NOT follow**, and which until 4 August 2026 were still written in this table as "mandatory" while being contradicted by its own code:

| The family rule | What applies in `awcms-astro` | Why |
| --- | --- | --- |
| Render with `<Image>` from `astro:assets`, never a raw `<img>` | `<img>` over URLs from `import.meta.glob` with `query: "?url"` | [ADR-0024](../adr/0024-seni-lokal-di-src-assets.md). `astro:assets` returns `ImageMetadata`, not a string — it changes the shape of `ArticleVisual` and all four of its frames, and treats SVG differently from raster while SVG is exactly the format this repo's gates were written to read |
| Cropping set through `width`/`height`, not only `object-fit` | One `--ratio-visual` for the whole site; frames crop through `object-fit: cover` | Cropping does not disappear because of it — it is **prevented**: `bun run audit:konten` refuses a source that is not `--ratio-visual` before it can be published |

**An accepted cost, and one to read before a site fills `src/assets/` with photographs:** rasters are not re-encoded and there is **no `srcset`**, so a 360px phone downloads the same file as a 1920px desktop. That is acceptable for SVG and for article images coming from `awcms` media; it stops being acceptable for large raster photos. The budget in §Performance is the first place going over shows up.

**The ratio is the easiest thing to miss.** Frames use `object-fit: cover`, so a source at another ratio is not scaled down — it is cropped, silently, at every screen size. A 1∶1 source in a 16∶9 frame loses its top 22%, and an image's title is almost always there.

**Two content rules require a human eye.** A checker cannot read an image's contents. Say so plainly in the documentation: a rule that looks guarded and is not is more dangerous than a rule that is plainly manual.

## SEO and sharing

Mandatory on every indexable page:

- A unique `<title>`, a `meta description` ≤ 160 characters and not empty, exactly one `<h1>`.
- An absolute `canonical` with a consistent trailing slash.
- `hreflang` for every locale + `x-default`.
- A share card, **when there is one**, sets `og:image:width`, `og:image:height`, `og:image:type`, and an `og:image:alt` describing **that** image — not another image on the same page. A page with no card sets no image tag at all: a preview with no image falls back to a tidy text card, a preview with a broken image falls back to nothing.
- **A card's MIME type and dimensions come from the card, not from a constant.** The 1200×630 PNG constant applies to **one** thing: `SITE_SOCIAL_IMAGE`, and only because `.env.example` contracts it to whoever fills it in. A per-article card comes from `awcms` media and carries its own MIME type and dimensions — WebP 1600×900, most likely ([ADR-0026](../adr/0026-kartu-share-per-artikel-dari-media-awcms.md)). Using the site constant for an image that never signed that contract publishes three false claims on every article page, and a scraper that trusts them will letterbox the card or discard it.
- What **stays** true from the old rule: avoid SVG as a share card. Social preview fetchers are not browsers and their SVG support is uneven. What changed is only the blanket ban on WebP — it is contradicted by a card an editor genuinely uploaded.
- `twitter:card` `summary_large_image` when there is a card, `summary` when there is not.
- One JSON-LD `@graph` block carrying the site's identity, plus the page-specific schema.
- A sitemap with `lastmod` from the content's date, not the build time.
- **A news section** (`urutanSeksi: "terbaru"`) containing articles publishes an Atom feed at `/{tab}/feed.xml`, announced by its section page and article pages through a `<link rel="alternate" type="application/atom+xml">` with a `title`. A `"manual"` section and an empty news section publish nothing — the reasoning for both is in [ADR-0035](../adr/0035-feed-atom-per-seksi-berita-dan-gerbang-atas-xml.md) §1. A feed **leaves the sitemap**: a sitemap lists pages, and the sitemap gate skips every `.xml` `<loc>` without a sound.
- **Every published `.xml` file must have its gate.** One that is not `sitemap*.xml` is treated as an Atom feed and required to be valid; one that is neither is a violation. This closes the state ADR-0033 recorded: an `.xml` file under another name is read by no gate, while the page scanner only picks up `**/*.html`.

The 404 page is excluded: `noindex, follow`, no canonical and no hreflang, no share buttons.

## Accessibility

The WCAG 2.1 AA target. What is binding:

- The skip link to the main content is the first element inside `<body>`, its text from the PO catalogue.
- Navigation is fully keyboard-operable; the active item is marked with `aria-current`.
- Sufficient contrast in the light and dark themes.
- `prefers-reduced-motion: reduce` is honoured. Decorative animation is **switched off**, not sped up — the global `*` rule only trims durations, and a 0.01 ms animation still flickers.
- Hover feedback is also active on `:focus-visible`, so a keyboard user does not get the poorer version.
- Data tables use `th` with a correct `scope` and can be scrolled horizontally without making `body` scroll too.
- **A control depending on JavaScript is hidden when its API is unavailable.** A button that stays silent when clicked is worse than a button that is not there.
- Core functions still work without JavaScript.

## Performance

**Outcome** targets, measured at p75 of real visits — Core Web Vitals:

| Metric | Threshold | Note |
| --- | --- | --- |
| LCP — Largest Contentful Paint | ≤ 2.5 seconds | Its largest element is almost always an article illustration |
| INP — Interaction to Next Paint | ≤ 200 milliseconds | **It replaced FID in March 2024.** A document still naming FID is stale, not using an alternative |
| CLS — Cumulative Layout Shift | ≤ 0.1 | Frames reserve their space through `aspect-ratio: var(--ratio-visual)`; there is no webfont that could shift it |

**Since [ADR-0032](../adr/0032-dua-celah-terakhir-ditutup-dengan-syarat-kejujuran.md) LCP and CLS are asserted in a LAB in CI** — on every PR of a site that has a content source; in the template repo that step does not run. All three of its limits are stated rather than hidden: a lab measures pages, not readers (p75 of real visits stays unmeasured — RUM is refused); INP is not measurable in a lab and is represented by its TBT ≤ 200 ms proxy; and what is audited is a **sample** of up to 10 URLs at depth 4 — a limit chosen in `lighthouserc.json`, not the lhci default that silently stops at the 5 shallowest URLs. Those thresholds and coverage limits are pinned to the tests through `tests/cwv-lab.test.mjs`.

How they are achieved — and this is what binds:

- No large UI dependency; interactivity uses vanilla DOM.
- **No webfonts.** `--font-sans` is `system-ui`: zero font requests, zero FOIT/FOUT, zero contribution to CLS. It is recorded as a privacy decision in `src/styles/global.css`; it is also a performance decision, and a site adding a font must self-host it in `public/` rather than adding an origin to the critical render path.
- A first-screen image is `loading="eager"` + `fetchpriority="high"`; the rest are `loading="lazy"`. Both are needed and do not substitute for each other: `eager` only means "do not defer", while an `<img>`'s default priority stays **Low** until layout proves it is in the viewport. Enforced by `bun run audit:konten` over the output, so an `<img>` that did not go through `src/components/Ilustrasi.astro` is caught too.
- **The theme is installed by the external file `public/tema.js` loaded through a classic `<script src>`**, not an inline script. Since [ADR-0019](../adr/0019-csp-ketat-dikirim-penyaji.md) the server sends `script-src 'self'` without `'unsafe-inline'`, so an inline script is not "less tidy" — it is dead in a reader's browser. An Astro bundle is always `type="module"` and modules are always deferred, so it is not a substitute for the before-paint case.
- Response compression is not only gzip: `compression` negotiates **Brotli** (RFC 7932) when a browser asks for it, and Brotli beats gzip by roughly 15–20% on HTML.
- `Cache-Control` in two rules per RFC 9111: hashed assets `immutable` for a year, HTML `max-age=0, must-revalidate` so a rebuild is immediately visible to a reader.
- The budgets proven in the reference repo: **home ≤ 250 KB of images, content page ≤ 100 KB.** Since 4 August 2026 they are **measured** by `bun run audit:konten` over `dist/client`, per page. What is weighed is only the images this build actually publishes — `awcms` media are not there, so this figure guards local artwork rather than the whole page weight.
- **Script and stylesheet bytes have their own ceilings**, checked by `bun run audit:aset`: 13,000 B of script and 40,000 B in total per page, plus 8,000 B for one published script file. They are measurements with headroom rather than round numbers, and the measurement is recorded in `scripts/audit-aset.mjs` beside each one. A violation names the file that grew, which is the whole reason it exists next to Lighthouse rather than inside it — a lab score cannot say which file to look at. **Where a rule LIVES is part of this budget**: `src/styles/global.css` is loaded by every page, so a rule only one component uses is bytes every other page pays for.

## Security

The full mapping to **OWASP Top 10 2021, OWASP ASVS 4.0.3, the OWASP Secure Headers Project, ISO/IEC 27001:2022 Annex A, and NIST SSDF SP 800-218** is in [`standar-performa-dan-keamanan.md`](standar-performa-dan-keamanan.md) ([ADR-0028](../adr/0028-jangkar-standar-performa-dan-keamanan.md)). Its OWASP editions are **matched to `awcms`**; moving to a new edition is a family-level decision, not a repo-level one.

What binds here:

- No secret, token, or credential in the repo. Build credentials live in `.env`/the build platform, and are never prefixed `PUBLIC_`.
- No third-party scripts, and no collection of readers' personal data. That ban **has no "but this is for security" exception** — it is what refuses CSP reporting and RUM.
- No raw HTML path from the CMS. Content blocks are assembled from escaped text and fixed tags.
- Response headers are decided in **one** file. A second policy — in a proxy, in `<meta http-equiv>`, in an env variable — is the quietest way to end up with no policy at all.
- `bun audit` must be zero before a release.
- An outbound `target="_blank"` link must carry `rel="noopener noreferrer"`.

**All ten ADR-0028 gaps are now closed** ([ADR-0029](../adr/0029-hsts-digerbangi-produksi-tanpa-includesubdomains.md) for HSTS, [ADR-0030](../adr/0030-aturan-tertulis-mendapat-pemeriksanya.md) for supply chain pinning, [ADR-0031](../adr/0031-sbom-cyclonedx-dari-lockfile-pada-rilis.md) for the release SBOM, [ADR-0032](../adr/0032-dua-celah-terakhir-ditutup-dengan-syarat-kejujuran.md) for static analysis and lab Core Web Vitals, the rest with no posture change) — each with its checker, and its row STAYS in the standards document's table. The last two closures carry an honesty condition that must not be lost: a CodeQL run summary states that `.astro` is not analysed, and a Lighthouse result is a LAB number — not p75 of real visits, which stays unmeasured because RUM is refused.

## Quality gates

This standard's gates, all of which must be green before work is declared done:

| Gate | Command | What it catches | Present in `awcms-astro`? |
| --- | --- | --- | --- |
| Lockfile | `bun run check:lockfile` | A lockfile belonging to another project, an undeclared dependency | Yes |
| Type check | `astro check` (inside `bun run build`) | Type and prop errors | Yes |
| PO catalogues | `bun test` | Catalogue parity across locales, an empty `msgstr`, a key used by the code but never written | Yes |
| Serving | `bun test` | Security headers including CSP and Permissions-Policy, HTML vs asset cache rules, compression, the 404 page | Yes |
| CSP output | `bun test` **after** `bun run build` | Inline styles and scripts in the HTML, cross-origin sources, JS that disappeared with them | Yes — skips itself when `dist/` does not exist |
| Content audit — images | `bun run audit:konten` | The ratio against `--ratio-visual`, the format read from the file contents, SVG XML, the smallest text size in an SVG | Yes |
| Content audit — output | `bun run audit:konten` **after** `bun run build` | Titles/descriptions/canonicals, lopsided hreflang, an asset promised by metadata but not published, dead links, the sitemap, key names leaking onto the screen | Yes — skips itself when `dist/` does not exist |
| Content audit — feeds and every `.xml` | `bun run audit:konten` **after** `bun run build` | Every `.xml` in the output that is not `sitemap*.xml` must be a valid Atom feed: the completeness Atom requires, a `rel="self"` stating its own address, absolute IRIs, RFC 3339 dates, newest-first ordering, the feed's `<updated>` = its newest entry (not the build clock), entries pointing at pages that really were published, leaked key names, an auto-discovery link with a `title`, and a feed absent from the sitemap. An `.xml` file that is not a feed is **reported as a violation**, not skipped | Yes — since [ADR-0035](../adr/0035-feed-atom-per-seksi-berita-dan-gerbang-atas-xml.md); skips itself when `dist/` does not exist |
| A gate over the content gate | `bun test` | `scripts/audit-konten.mjs` itself: every family proven RED-and-GREEN over a fixture tree, **mutation-proven**. It closes the state in which the output families — including both performance gates — were never executed in the template repo because `dist/client` never exists here | Yes — since 6 August 2026 (gap 10 in the [performance and security standard](standar-performa-dan-keamanan.md)) |
| Document audit | `bun run audit:dokumen` | Markdown links to files that do not exist (resolved from their own file's location, so the `.changesets/` link rule is guarded too), an ADR index incomplete in either direction, a Status column that disagrees with its ADR, a polish-surface list that diverges from `global.css`, and an `ADR-NNNN` citation that neither resolves to its file nor is marked as another repo's | Yes |
| Translation audit | `bun run audit:translation` | An `.id.md` mirror gone stale against the English source whose hash it records, an orphan mirror whose source is gone, a document with no mirror that is not on the shrink-only ledger, and a ledger entry whose mirror now exists | Yes — since [ADR-0039](../adr/0039-english-is-the-source-language.md) |
| Graph audit | `bun run audit:graf` | `graphify-out/` artefacts tracked beyond the four shared outputs, a report that disagrees with `graph.json`, community names that were not chosen (a file name, a placeholder, a twin, or differing between artefacts), and a corpus that ignored `.graphifyignore` | Yes — since 4 August 2026; skips itself when `graphify-out/` is absent |
| Toolchain versions | `bun test` | The five Bun version values (`packageManager`, `engines.bun`, two CI `bun-version`, two `Dockerfile` tags) that must agree, plus the image digest attached to the right tag | Yes — since [ADR-0030](../adr/0030-aturan-tertulis-mendapat-pemeriksanya.md) |
| SBOM | `bun test` | The `scripts/sbom.mjs` generator in sync with `bun.lock` (mutation-proven), and the SBOM step in the releaser not disappearing silently. The freshness of `sbom.cdx.json` in the working tree is DELIBERATELY not gated — an SBOM describes a release, not a working tree | Yes — since [ADR-0031](../adr/0031-sbom-cyclonedx-dari-lockfile-pada-rilis.md) |
| Static analysis | `.github/workflows/codeql.yml` | Vulnerabilities on the JS/TS surface (lib, config, scripts, server, tests) — scheduled weekly + on changes. `.astro` is NOT analysed and each run summary says so; `tests/analisis-statik.test.mjs` keeps that statement from being deleted | Yes — since [ADR-0032](../adr/0032-dua-celah-terakhir-ditutup-dengan-syarat-kejujuran.md) |
| Core Web Vitals (lab) | The CI `build` job, `treosh/lighthouse-ci-action` | LCP > 2500 ms, CLS > 0.1, TBT > 200 ms (the INP proxy) over a **sample** of `dist/client` (up to 10 URLs, depth 4 — chosen in `lighthouserc.json`) — running only when the site has a content source; its thresholds AND its coverage limits are pinned to this document through `tests/cwv-lab.test.mjs` | Yes — since [ADR-0032](../adr/0032-dua-celah-terakhir-ditutup-dengan-syarat-kejujuran.md); it does not run in the template |
| `awcms` surfaces | `bun test` | The `/api/v1/…` paths `src/` actually calls, compared in both directions with the marked table in the integration skill | Yes — since ADR-0030 |
| **The site's role** | `bun test` | `owner` in `permukaanAdmin.peran` (whatever its capitalisation), a prefix swallowing the public surface (`/`, a locale prefix, or a tab slug), a half declaration (a route with no role, or a role with no route), and every `prerender = false` route whose prefix is declared by neither `permukaanAdmin` nor the Jualanku BFF — two separate checks over the CONFIGURATION and over the CODE, because the two can disagree and what decides what is served is the code | Yes — since [ADR-0034](../adr/0034-publik-secara-bawaan-admin-hanya-bila-dinyatakan.md) |
| **The `news` vocabulary** | `bun test` | A tab slugged `news` left on `urutanSeksi: "manual"` — a surface claiming to be news in its address and denying it in every detail. Its gate does not demand that tab exist; `news` is not a reserved word here | Yes — since [ADR-0036](../adr/0036-news-adalah-kosakata-repo-ini-dan-sebuah-tab-yang-memikulnya.md) |
| Dependency audit | `bun audit --audit-level=low` | Vulnerabilities in the build chain. Run by CI **and** by the releaser | Yes |
| CI | `.github/workflows/ci.yml` | All of the above, on every PR | Yes |

**Two image rules stay manual, and that is said plainly.** Text inside an image may only be a topic label, and there may be no state institution's emblem or attributes — including inside an illustration. No checker can judge either. A rule that looks guarded and is not is more dangerous than a rule that is plainly manual.

**What is still in the reference repo** and not yet ported: domain-specific content rules (links between documents, synchronising the skill list). The remaining backlog is in [this repo's README](../../README.md#what-does-not-exist-yet-an-explicit-backlog-not-an-oversight).

**A new rule must bring its checker.** A rule written only in the documentation will be broken sooner or later — that is why the audit gates exist (the reference repo's ADR-0008).

Loosening a checker so a gate goes green is a violation, not a fix. If a rule really is wrong, change the rule deliberately and record its reasoning in the documentation.

## Versioning

`MAJOR.MINOR.PATCH`, with annotated git tags `vX.Y.Z`. Semver was designed for libraries with an API, so its meaning has to be restated for an information site — the reference repo's ADR-0009 does that, and [ADR-0040](../adr/0040-changeset-menyatakan-bump-semver.md) fixes the restatement here:

| Level | The site | 
| ----- | -------- |
| `major` | a public URL, the content structure, or the frontmatter contract **breaks** |
| `minor` | a reader gains something: an article, tab, locale, or feature |
| `patch` | a fix that does not change the shape of the site |

Every change affecting public content, structure, dependencies, or deployment is written as a changeset **in the same iteration**, and folded into `CHANGELOG.md` at release.

**The changeset declares the level, and the release derives the version from it.** Each one carries `bump: major | minor | patch`; the next version is the largest bump among those waiting. The level is therefore chosen while the change is being written, by its author — not at release time, from a list of file names, by whoever ran the script. `bun run release` still accepts a level, and it may only be a **larger** one; a smaller one is refused, because it publishes a break behind a number promising there is none.

Version strings are parsed strictly: a `v` prefix, prerelease or build metadata, and leading zeros are each refused by name. The arithmetic that preceded this refused nothing and answered `NaN` — enough to tag a release `v0.2.NaN`, which sorts nowhere and makes the *next* release read the wrong tag as latest. Its checker is `tests/versi-changeset.test.mjs`.

The repo is still `0.x`, where semver itself promises nothing about compatibility. The `bump` field records intent now so the record is already true on the day `1.0.0` makes it binding.

## The knowledge graph (`graphify-out/`)

This repo tracks the knowledge graph index produced by [graphify](https://github.com/safishamsi/graphify): `graph.json` (the graph data), `GRAPH_REPORT.md` (the report), `manifest.json` (the basis for `--update`), and `cost.json`. It is tracked because it is useful to be re-read by a person or an agent new to the repo — not a build artefact but a map.

**Only those four files are tracked.** The rest have a written reason in `.gitignore` to stay outside the history: machine-specific caches, dot-files that are always intermediates, dated copies duplicating the live artefact beside them, and `graph.html`, which stops being emitted above a node threshold and then rots silently. Those three rules were written on 3 August 2026 and lived two days with no checker; since [ADR-0030](../adr/0030-aturan-tertulis-mendapat-pemeriksanya.md) forbids that state, `bun run audit:graf` enforces them.

### The corpus: what is indexed, and what deliberately is not

`.graphifyignore` at the repo root narrows the corpus. Its syntax is `.gitignore` syntax, read **after** `.gitignore`, and it can only exclude more — never restore what has already been discarded. Adding a line there is always safe in one direction.

`.changesets/` is excluded, and its reasoning is structural rather than a matter of taste. It contributes **171 of 971 nodes** (18% of the graph) with 139 edges pointing at other changesets and only 39 crossing over: many nodes, almost no bridges — a separate clump. It raised the community count from 90 to 101 in one rebuild, lowered their cohesion, and buried the communities that mean something. It also **retells** the documents it summarises, so the same content enters the graph twice in different words — visible immediately as twin key concepts in the report. What is lost by excluding it: nothing. The rationale of every decision lives in `docs/adr/`, and that is still indexed.

A rebuild run without `.graphifyignore` puts back what was excluded. Its gate catches that.

### A community's name must be chosen, not inherited

graphify names communities automatically from the **most connected node** inside them (`label_communities_by_hub`). That naming is free, deterministic, and never reads its community — it only copies the biggest file's name. Four rules bind a name that is committed:

1. **Not a file name.** `client.ts`, `BaseLayout.astro`, `package.json` are not community names; they are the output of automatic naming, available free at any time.
2. **Not a `Community N` placeholder.** A community with no name is a hole in the map.
3. **No two communities share a name.** Twin names make both indistinguishable to every downstream consumer.
4. **`graph.json` and `GRAPH_REPORT.md` name the same community the same way.**

These rules were written because their violation had already happened and was seen by nobody. On 4 August 2026, **60 of 101 labels were attached to the wrong community** — a legacy of old clustering that was never validated. Community 6 was named `content-blocks.ts` while its contents came entirely from [`standar-performa-dan-keamanan.md`](standar-performa-dan-keamanan.md); community 22 was named `Kontrak BFF /_portal-api/**` while its centre was `Pedoman Perilaku`; three different communities were all named `BaseLayout.astro`.

The defect was invisible because its artefact was valid JSON beside a tidy report, and not one other gate read `graphify-out/`. A community name is not decoration: it is what `graphify query` reads, and what anyone using this graph to find their way reads. **A graph that names itself wrongly is more dangerous than no graph, because it answers confidently.**

Its technical cause is closed upstream, in the graphify skill: the labelling step now writes `.graphify_labels.json.sig` — a signature of each community's membership — so the next run can tell which communities really changed. Without that sidecar, graphify falls back to comparing the **number** of communities, and any run that changes that number moves every label onto a different community.

### Freshness: reported, not gate-reddening

`bun run audit:graf` prints the gap between `built_at_commit` and `HEAD`, and never fails because of it. Turning it red would mean every PR touching an indexed file has to carry a multi-megabyte rebuild — a gate that expensive would be loosened within a month, exactly what §Quality gates forbids. What this gate guards is the artefact's **internal correctness**; when it is rebuilt stays a deliberate decision, and its note makes that decision visible.

Rebuild with `/graphify .` (full, relabelling every community) or `/graphify . --update` (incremental). `graphify cluster-only` does **not** relabel: it reuses stored labels and renames changed communities with a hub name — so it can turn cohesion green while turning the label gate red.

## Documentation

Mandatory, and mandatory to stay in sync with the code:

| File | Contents | Present in `awcms-astro`? |
| --- | --- | --- |
| `AGENTS.md` | The binding technical working contract that binds every standard and points at its detailed document | Yes |
| `README.md` | Why this site exists, its shape, how to run it | Yes |
| `docs/adr/` | Decisions with their reasoning | Yes — its index gated in both directions |
| `.claude/skills/` | The standards above, encoded as procedures an AI agent can run | Yes — four skills |
| `docs/ARCHITECTURE.md` | The anatomy of every folder and file; what exists vs the gaps | **No.** Its role is carried by §Structure of the README and each file's docblock |
| `docs/PROJECT_STATE.md` | The project's state, its known debt, its resumption points | **No.** Its role is carried by §"What does not exist yet" in the README and §Gaps in the standards document |
| `docs/workflows/` | How to do repeated tasks | **No.** Its role is carried by `.claude/skills/` — a procedure that can be run beats a procedure that has to be read first |

**The last three rows deliberately read "no" rather than being deleted.** Until 4 August 2026 this table demanded all three as "mandatory" for an `awcms-astro` repo while this standard's reference repo — this repo itself — carried not one of them. A derived site reading it would create three empty files to satisfy the list, and a mandatory empty file is the fastest way for a list to stop being read. What is right is not to delete their rows but to say **who carries their role here**.

Added since: [`standar-performa-dan-keamanan.md`](standar-performa-dan-keamanan.md) — the map to international standards along with its list of gaps ([ADR-0028](../adr/0028-jangkar-standar-performa-dan-keamanan.md)).

Documentation that diverges from the code is more dangerous than no documentation: it is believed. So **updating the documents is part of the same iteration**, not follow-up work.
