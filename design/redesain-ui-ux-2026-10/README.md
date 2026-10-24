# UI/UX redesign — public site (October 2026)

Reference-only design proposal for the public pages of this template: a
task-first home page and a service page built from the existing components
(`SyaratList`, `ProcedureSteps`, `BiayaTable`, `FaqAccordion`,
`DisclaimerNote`, `TranslationNotice`, `ShareButtons`). UI copy is Indonesian
and reuses the strings in `src/locales/id/messages.po` where they exist.

**Not implemented.** These pages render example content only and call nothing.
Fees and durations are deliberately left as `[ ]` placeholders: real values come
from the site's sources when an article is written in awcms.

## How to view

```bash
python3 -m http.server 8080   # from the repository root
# then open http://localhost:8080/design/redesain-ui-ux-2026-10/AstroHome.dc.html
```

Serve the repository root: the pages load this repo's own logo by relative
path. [`support.js`](support.js) is a byte-identical copy of the vendor runtime
in `ahliweb/omes` `ui/control-center/support.js`; it loads React from unpkg, so
viewing needs network access. [`canvas.json`](canvas.json) records the artboard
layout.

## Contents

| File                                           | Screen                                                                                                                              | Interactive                       |
| ---------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------- | --------------------------------- |
| [`Main.dc.html`](Main.dc.html)                 | 00 · Analysis of awcms, awcms-one, omes and awcms-astro                                                                             | no                                |
| [`AstroHome.dc.html`](AstroHome.dc.html)       | Home: search in the hero, popular topics, latest panel, channel cards, highlights, principles, optional newsletter, footer          | no                                |
| [`AstroArticle.dc.html`](AstroArticle.dc.html) | Service page: at-a-glance card, table of contents, requirements checklist, numbered steps, fee table with legal basis, FAQ, sources | native checkboxes and `<details>` |
| [`PolaData.dc.html`](PolaData.dc.html)         | Data-page pattern shared by the family, including the two public variants below                                                     | no                                |
| [`AstroSpec.dc.html`](AstroSpec.dc.html)       | Per-route spec of the public site: search, filters/facets, order and paging for every route                                         | search, filter, paging            |
| [`AstroArchive.dc.html`](AstroArchive.dc.html) | Channel archive page 2 of 9: in-channel search, category chips, numbered paging at 12 per page (`/informasi/halaman/2/`), RSS       | no (works without JavaScript)     |
| [`AstroSearch.dc.html`](AstroSearch.dc.html)   | Search: keyword, facets (content type, channel, topic, institution, region) with counts, highlighted matches, "load more" by 20     | search, facets, load more         |

[`spec-astro.json`](spec-astro.json) is the data behind the spec screen. The
archive follows `src/lib/paginasi.ts` (page 1 stays at `/{tab}/`, every page
canonical to itself, `SITE_POSTS_PER_PAGE` default 12); the search page uses the
strings and facets already in `src/locales/id/messages.po`.

## Assets used

| Asset                       | Source                                                                                                                    |
| --------------------------- | ------------------------------------------------------------------------------------------------------------------------- |
| Logo                        | [`public/favicon.svg`](../../public/favicon.svg)                                                                          |
| Public Sans, JetBrains Mono | [`assets/fonts/`](assets/fonts/LICENSE-OFL.txt) — copies of `ahliweb/awcms` `public/fonts/` (this repo ships no web font) |
| Source Serif 4 (headings)   | Google Fonts link, proposal only — it would have to be self-hosted under this site's CSP before adoption                  |

## Proposals that need a decision

- Typeface: replacing the system stack with self-hosted Public Sans (body) and
  Source Serif 4 (headings).
- The home page principle "Tanpa form pengumpul data" conflicts with the
  newsletter form that appears when `SITE_NEWSLETTER=true`; one of the two
  needs rewording.
