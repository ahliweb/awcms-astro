🇬🇧 English (source) · 🇮🇩 [Bahasa Indonesia](0056-accessibility-is-gated-by-axe-in-a-real-browser-with-no-exceptions.id.md)

# ADR-0056 — Accessibility is gated by axe in a real browser, with no exceptions

- **Status:** Accepted
- **Date:** 19 November 2026
- **Related:** [ADR-0055](0055-reading-preferences-are-a-native-same-origin-panel-not-an-overlay-widget.md) (the panel whose follow-up 1 this closes), [ADR-0019](0019-csp-ketat-dikirim-penyaji.md) (the strict CSP the gate runs under), [ADR-0053](0053-main-is-fenced-by-a-ruleset-that-no-gate-can-see.md) (`Check` is a required status), [ADR-0030](0030-aturan-tertulis-mendapat-pemeriksanya.md) (a written rule gets its checker), [ADR-0015](0015-runtime-bun-menutup-divergence-keluarga.md) (Bun, one `bun-version` declaration per job), issue #179

## Context

This repo states that its public pages meet WCAG 2.2 AA in their own markup
(ADR-0055; the minimum was raised from 2.1 AA in the change for issue #179). Until
this ADR **nothing checked that claim on every change.**

Two things made that visible:

- Issue #179 found five defects that had been shipping before the reading
  preferences panel existed. They were found by running axe-core in a browser
  **once, by hand, from outside the repo**, and the fix could only be guarded
  statically (`tests/aksesibilitas-halaman.test.mjs` computes the contrast of the
  tokens and greps the markup). A static check proves the defect it was written
  for does not come back; it cannot find the next one.
- ADR-0055's own follow-up 1 recorded the same gap: focus handling, axe with the
  panel open, and horizontal overflow at 360 px were verified once by hand and
  "not repeatable from the repo".

Colour contrast is the clearest case. It is a property of the **computed** style
of the **rendered** page (cascade, theme, the reading-preferences palette, an
animation caught mid-way), so it cannot be read from CSS text. A repo whose
accessibility depends on contrast and whose only contrast check is arithmetic over
two tokens is guarding the arithmetic.

### Position in the development flow

This is step 11 tooling for the existing public pages (a test gate and the
corrections it forces), not a new screen: no new data model, contract or endpoint,
so steps 5 to 8 do not apply. The owner decided to add the gate on **19 November
2026** (decision dialog, option "add it"). The decision is recorded by the
orchestrator.

## Options considered

| Option | What it does | Strengths | Weaknesses |
| --- | --- | --- | --- |
| **A. axe-core in Chromium via Playwright, in CI, against the production build and a stand-in `awcms`** (chosen) | Builds the site, serves it with the real server (real CSP), loads each page in a real browser and runs axe | Sees computed contrast, the rendered DOM, the search results that are built in the browser, every reading-preferences mode; repeatable; runs in the template repo | A browser in CI (about a minute of extra time); a stand-in backend to maintain |
| B. Static checks only (status quo) | Token arithmetic and markup greps | No browser, fast | Cannot see computed style, client-rendered markup or interaction; finds only what it was written to find |
| C. axe over `happy-dom`/`jsdom` | Runs axe in a simulated DOM | No browser | Neither implements layout or the cascade the way a browser does, so `color-contrast` is skipped or wrong; a green here would be false assurance |
| D. Lighthouse accessibility category | Already runs in the `build` job (ADR-0032) | No new tool | Runs only when the site has a content source; it reports a weighted **score**, and a score under 100 is not a failure; it runs a subset of axe |
| E. Manual audit before each release | A person with assistive technology | Finds what axe cannot | Not repeatable per change; this is complementary and stays deferred to UAT (ADR-0055), not a substitute |

The orchestrator decided **A**, and the owner chose to add it on 19 November 2026.

## Decision

1. **The gate is axe-core, in a real Chromium, against the production build served
   by `server/penyaji.mjs`** (so the CSP of ADR-0019 applies exactly as in
   production). `bun run test:a11y` does all of it: it starts the stand-in
   `awcms`, builds, starts the server, runs Playwright, and stops only the
   processes it started. Ports come from the OS, so a busy shared host never
   collides.
2. **The rule set is the five WCAG tags:** `wcag2a`, `wcag2aa`, `wcag21a`,
   `wcag21aa`, `wcag22aa`. Best-practice rules and `wcag2aaa` are not in the gate.
3. **A failure is any violation, of any impact.** No exclusions, no
   `disableRules`, no `exclude()`, no baseline file, no "known issues" list. A
   real finding is fixed in the code. If a finding is genuinely outside this repo's
   control, that is reported and decided in an ADR; it is not added to a list in
   the test. The first run found real defects, and they were fixed (below).
4. **What is exercised** (45 cases, light and dark where it applies):
   - **Pages**, default locale and English: home, home in English, a tab list, an
     article (fee table, steps, FAQ, legal basis, rich body text, category and tag
     links), the same article in English, a category archive, a tag archive, the
     search page empty, the search page **with results and facets** (built in the
     browser from the stand-in), the privacy page, the sitemap page. The footer
     menu, header and footer widgets and the newsletter form are rendered by the
     fixture, so they are in every page.
   - **Home with each reading-preferences mode alone** (ADR-0055): large text,
     extra-large text, high contrast, monochrome, dyslexia-friendly, underline
     links, highlight links, reduce motion, and all of them together. Each mode is
     applied through `localStorage` key `awcms-a11y` and the case first asserts the
     matching `data-a11y-*` attribute is on `<html>`, so a mode that never took
     effect cannot pass vacuously.
   - **Article, search with results and home at 360 px with every preference on,**
     which also asserts no horizontal scroll.
   - **The panel itself open,** with the default and with every preference on.
5. **The stand-in `awcms` (`e2e/awcms-tiruan.mjs`) is read-only and fixed.** It
   exists so the gate can run in the template repo, which has no `awcms` instance
   (the reason the `build` job is conditioned on `vars.AWCMS_API_URL`). It answers
   the requests the build and the search page make with a small corpus chosen to
   put every kind of markup in front of axe. **It proves the markup is
   accessible, not that this template can talk to `awcms`**: that claim stays with
   the conditioned `build` job and `tests/kontrak-awcms.test.mjs`.
6. **It lives in the `check` job, not in a new job and not in `build`.** `build`
   does not run in the template repo; a new job would add a third `bun-version`
   declaration that ADR-0015 and `tests/versi-toolchain.test.mjs` require to move
   together; and `Check` is already a required status on `main` (ADR-0053), so the
   gate blocks merge without a ruleset change that no gate could verify. Chromium is
   installed with `bunx --bun playwright install --with-deps chromium` and its
   download cached by lockfile. Traces are uploaded only on failure.
7. **It stays out of `bun test`.** The specs are `e2e/*.axe.mjs`, not `*.test.*`
   or `*.spec.*`: `bun test` collects both patterns recursively and would run
   Playwright specs under its own runner. `e2e/` is outside `tests/`, so the gate
   file count that documents quote (`tests/documented-counts.test.mjs`) is
   unchanged.
8. **Pinned versions, and why those.** `@playwright/test` **1.65.0** and
   `@axe-core/playwright` **4.14.0** (axe-core 4.14), exact, in `devDependencies`.
   They are the newest releases that were at least two weeks old on 19 November
   2026 (1.65.0 published 5 November; 1.65.1 on 13 November was too new;
   `@axe-core/playwright` 4.14.0 on 15 October). The repo does not take a release
   before it has aged, so a regression in a fresh one is found by others first.
9. **A new axe release is allowed to turn the gate red.** axe adds and tightens
   rules between versions. That is the point of a gate, and the answer is to fix
   the markup, not to pin axe forever; the version only moves in a deliberate
   change.
10. **The gate says what it cannot see.** axe finds only the automatable fraction
    of WCAG. A green run means "no automatable violation under these tags on these
    pages", never "accessible" or "compliant", and nothing in this repo claims
    otherwise (this also keeps ADR-0055's rule that the panel is not a compliance
    claim).

### Trade-off analysis

| Criterion | A, chosen | B (static only) | C (jsdom) | D (Lighthouse) |
| --- | --- | --- | --- | --- |
| Security | A dev dependency and a browser in CI, from the registry and the Playwright CDN; no runtime code, no new origin in production; the stand-in binds `127.0.0.1` | Unchanged | A dev dependency | Already present |
| Performance | No effect on pages; adds roughly a minute to `Check` | None | Small | Already paid |
| Maintainability | A fixture to keep in step with the `awcms` shapes the build reads; a failing case names the rule, the nodes and the help URL | Cheap, but each rule is hand-written | Cheap | Config only |
| Scalability | Cases are data (a page list and a mode list); a new page is one row | One checker per defect | As A, without the browser | Sampled URLs |
| Accessibility | Finds computed-style and rendered-DOM defects, with the real panel modes | Only the defects already known | Misses contrast | Partial, scored |
| SEO impact | None directly; the fixes remove contrast, naming and heading-order defects that also affect usability | None | None | None |
| UI/UX | Forced a visible change to link colour (see Consequences); no layout change | None | None | None |
| Compatibility | Chromium only; Firefox and WebKit are not covered | Not applicable | Not applicable | Chromium |
| Operational complexity | One more script, one config, one fixture; Chromium install in CI | None | Little | None |
| Long-term implications | The 2.2 AA claim is checked per change; a future axe rule can redden it | The claim decays silently | False assurance | A score that hides failures |

## Consequences

- **The first run found real defects in the template's own markup and styles, and
  they are fixed in this change** (nothing was excluded):
  - **Link colour (`1.4.3`, `1.4.1`).** The base link colour `--accent-primary`
    (`#0284c7`) is 3.91:1 on the page background, so every ordinary link in body
    text, the category and tag links, and the current-tab pill (3.56:1) failed.
    Links now use `--accent-hover` (5.67:1; lighter, so higher, in the dark theme).
    Links inside article bodies are underlined, because `link-in-text-block` needs
    them distinguishable by more than colour. **This is a visible change to every
    site derived from the template** that has not overridden link colours.
  - **Emerald badge (`1.4.3`).** White on `#059669` was 3.76:1 (2.53:1 in the dark
    theme). The badge is now `#047857` with white text (5.48:1) in both themes.
  - **Newsletter block in the footer (`1.4.3`).** The invitation text was
    `#334155` on `#090d16` (1.87:1) and the field label `#64748b` (4.08:1): the
    component's scoped styles do not reach, and out-specify, the footer's rules.
    Both now take the footer colour. Only a site that turns the newsletter on saw
    it.
  - **Search facet chips (`aria-allowed-attr`).** The chips are links and carried
    `aria-pressed`, which ARIA allows only on buttons. The selected one now carries
    `aria-current="true"`, and its colour uses `--accent-hover`.
  - **Fee table scroll region (`scrollable-region-focusable`).** At 360 px with
    extra-large text the table scrolls sideways and a keyboard could not reach it.
    The wrapper is now a focusable, named region.
  - **Highlight links mode.** A link whose label sits in child elements
    (the "Terbaru" rows) kept the children's light text on the yellow fill (1.16:1).
    The children now take the link's colour.
  - **The test itself.** A fade-in measured half way reported a contrast no reader
    sees for more than a moment, and made the result depend on machine speed. The
    gate waits for fonts and every finite animation before running axe.
- **The base link colour moved for everyone.** It is the least invasive fix that
  reaches the root cause rather than overriding each place, but a derived site
  with its own palette should confirm its own accent still reaches 4.5:1 against
  its own background; the gate runs on its own content and will say.
- **`Check` takes longer.** Measured at about one minute (Chromium install, a second
  build, 45 cases); the figure is recorded in the pull request, not here, because
  runner speed drifts.
- **A derived site runs the gate against the stand-in, not its own content.** It
  can add pages to the list in `e2e/a11y.axe.mjs`, but the build it exercises is
  the stand-in's. Running axe over a derived site's real pages needs a content
  source, which only that site has, and is its own decision.
- **Chromium only.** An accessibility-tree difference in another engine is not seen.

## Follow-ups

1. **Real-user usability testing at UAT (step 14),** unchanged from ADR-0055: axe
   does not replace readers who use these preferences or assistive technology.
2. **Focus behaviour of the panel as assertions** (Esc and outside click return
   focus, the persistence of each switch after a reload) are exercised by hand and
   by `tests/aksesibilitas.test.mjs` at the logic level; adding them to this gate is
   a cheap next case, not done here because this ADR is the axe gate.
3. **Other engines** (Firefox, WebKit) if the reader base shows they matter.

## Verification

`bun run test:a11y` runs the 45 cases and exits non-zero on any violation. Run
without the fixes in this change, the gate fails 39 of the 45 cases, which is
the evidence it can fail. The unit gates stay green: `tests/aksesibilitas-halaman.test.mjs`
and `tests/aksesibilitas.test.mjs` keep proving what they proved, and
`tests/documented-counts.test.mjs` is unaffected because `e2e/` is outside
`tests/`.
