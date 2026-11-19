🇬🇧 English (source) · 🇮🇩 [Bahasa Indonesia](0055-reading-preferences-are-a-native-same-origin-panel-not-an-overlay-widget.id.md)

# ADR-0055 — Reading preferences are a native same-origin panel, not an overlay widget

- **Status:** Accepted
- **Date:** 18 November 2026
- **Related:** [ADR-0019](0019-csp-ketat-dikirim-penyaji.md) (strict CSP, no inline script or style), [ADR-0054](0054-html-gets-a-shared-cache-lifetime-and-every-deploy-purges-the-cdn.md) (the unhashed `public/` scripts share the HTML cache rule), [`docs/awcms-astro/ui-ux-design-system.md`](../awcms-astro/ui-ux-design-system.md), issue #174

## Context

The pages of this template aim at WCAG in their own markup, and that is the
floor. But a reader has no way to adjust the display to their own needs beyond
the light/dark toggle and whatever the operating system already asks for. Readers
with low vision, dyslexia or motion sensitivity are better served by a small set
of display preferences kept on their own device: text size, contrast, spacing,
link emphasis, and reduced motion.

There is a ready-made way to get a button like that: embed a third-party
"accessibility overlay" widget. This ADR records why this repo does not, and what
it builds instead. It touches the security posture (CSP stays as it is, and a
third-party script is refused) and adds a client feature to every public page, so
it needs an ADR under `GOVERNANCE.md`.

### Position in the development flow

The slice is client-side only: it stores nothing on any server, adds no table and
no endpoint. Steps 5 to 8 of the 18-step flow (ERD, RBAC and RLS, domain spec,
API contract) therefore do not apply. The owner passed gate 9 for this slice on
**18 November 2026**, and the decision is recorded by the orchestrator. **Real-user
usability testing is deferred to UAT (step 14), before gate 15**: the panel has
been built and checked by automated tests and by the rules below, not yet tried by
readers who need it.

## Options considered

| Option | What it does | Strengths | Weaknesses |
| --- | --- | --- | --- |
| **A. A native same-origin panel** (chosen) | A floating button opens a small non-modal dialog; each choice sets an attribute on `<html>` that the site's own CSS reacts to; the choices live in `localStorage` | No third-party code, no request, no cookie; strict CSP untouched; every pixel and word is ours to keep accessible and translated; honest about what it does | We write and maintain it; every preference is only as good as the CSS behind it |
| B. A third-party overlay widget | One script tag adds a button and a panel that rewrites the page at runtime | Fast to add | See below |
| C. Do nothing | Rely on the OS and the browser (zoom, forced colours, reduced motion) | Nothing to build or maintain | Readers whose device is not configured, or who share one, get no help; the existing toggles stay the only control |

The orchestrator decided **A**, and the owner passed gate 9 for it on 18 November 2026.

### Why not B

- **Privacy.** A vendor script runs with the reader's IP address and User-Agent on
  every page, and can keep a record of the reader's accessibility settings.
  That would be data about a disability, collected without a reader asking for it. This
  template already refuses third-party fonts for the lesser reason that they leak
  an IP address.
- **CSP.** `script-src 'self'` is a posture this repo earned (ADR-0019). A widget
  needs a vendor origin in `script-src`, typically `connect-src` and `style-src`
  too, and may need `'unsafe-inline'`. Each is a hole in a policy that currently has
  none.
- **It does not do what it claims.** Overlays that try to repair markup at runtime
  are widely criticised by the accessibility community and by assistive-technology
  users; the public Overlay Fact Sheet (overlayfactsheet.com) records that
  criticism and is signed by many accessibility professionals. They can also
  interfere with the screen reader a reader already uses. A site's accessibility
  comes from its own markup; a script that claims otherwise is a worse position
  than saying nothing.
- **Claims and legal exposure.** A widget's "compliance" badge is a claim this
  repo cannot stand behind (`CONTRIBUTING.md`: forbidden are third-party scripts
  and collecting readers' personal data).

## Decision

1. **The panel is user display preferences, not an overlay.** It never rewrites
   content, never injects ARIA, never claims the page meets any standard, and
   never loads third-party code. The pages must meet WCAG in their own markup; the
   panel is supplementary. Its copy states only where the setting is kept
   ("Saved on this device only, never sent to the server") and makes no legal
   claim.
2. **No tracking, no server.** Preferences live only in the visitor's
   `localStorage`, under the key `awcms-a11y`. Nothing is sent anywhere, and no
   analytics event is emitted.
3. **Storage contract.** The value is JSON
   `{"v":1,"text":"normal"|"large"|"x-large","contrast":bool,"mono":bool,"dyslexia":bool,"underline":bool,"highlight":bool,"motion":bool}`
   (`motion: true` means reduce motion). The whole object is written after any
   change. Invalid JSON, a wrong version, a missing key or an unknown value is
   treated as "no stored preference", never as a partly valid object. Every read
   and write is inside `try/catch`, because some browsers throw merely on touching
   `localStorage`. **Reset** removes the key and the attributes.
4. **DOM contract.** Each preference is an attribute on `<html>`:
   `data-a11y-text="large|x-large"`, `data-a11y-contrast`, `data-a11y-mono`,
   `data-a11y-dyslexia`, `data-a11y-underline`, `data-a11y-highlight`, and
   `data-a11y-motion="reduce"`. An absent attribute is the feature off, and every
   rule in `src/styles/aksesibilitas.css` is scoped under one of them, so nothing
   changes for a reader who never opens the panel. `src/lib/aksesibilitas.ts`
   holds the pure logic; the effects are:
   - **Text size:** 120 % and 140 % on the root, so every `rem` follows. All font
     sizes in this repo are `rem`, which is what makes this work without touching
     components.
   - **High contrast:** the colour tokens are replaced by a palette with text at
     7:1 or better (WCAG 1.4.6): near-black on white in the light scheme, white on
     near-black in the dark scheme; solid borders on boxes and fields; the hero's
     gradient and decorations become a solid backing. It works together with
     `data-theme`. It is **not applied under `forced-colors: active`**: the reader
     asked the system for its palette, and a site palette on top is the fight that
     media query exists to prevent.
   - **Monochrome:** `filter: grayscale(1)` on `<html>`, never on `<body>` or a
     wrapper, because a filter on any other element makes it the containing block
     of its `position: fixed` descendants and the floating button would scroll
     away. A test refuses a `filter` anywhere else in the stylesheet.
   - **Dyslexia-friendly text:** a plain system sans stack with the WCAG 1.4.12
     text-spacing values (line height 1.5, letter spacing 0.12 em, word spacing
     0.16 em, paragraph spacing 2 em) and no justified text. **No "dyslexia font"
     is bundled.** The controlled study that compared one with an ordinary sans
     font (Wery and Diliberto, Annals of Dyslexia, published online 2016) found no
     reading benefit; offering what is documented to help (spacing, plain letters)
     and nothing more keeps the panel honest.
   - **Underline all links** and **highlight links** (yellow `#ffeb3b` with
     `#111`, above 7:1, with a visible focus ring).
   - **Reduce motion:** animations and transitions are switched off, not sped up.
5. **OS preferences are the default, and the reader can override them.** With
   nothing stored, motion reduction follows `prefers-reduced-motion: reduce` and
   high contrast follows `prefers-contrast: more`. A stored choice wins, including
   a stored "off" for something the OS asks for: a reader who turned motion back
   on in the panel meant it. To make that possible without two sources of truth,
   `public/aksesibilitas.js` marks `<html data-a11y-ready>` once it has run, and
   the CSS media queries apply **only while that marker is absent**: without
   JavaScript, or with the script blocked. This changed one existing rule: the
   `prefers-reduced-motion` block in `global.css` is now scoped to
   `:root:not([data-a11y-ready])`.
6. **Progressive enhancement.** Without JavaScript the page is fully usable; the
   button is rendered `hidden` and only the script reveals it, so there is never a
   control that does nothing; the OS media queries still apply through CSS.
7. **Two scripts, one contract.** The attributes must exist before first paint,
   so the early half is `public/aksesibilitas.js`, a classic blocking
   `<script src>` in `<head>` after `public/tema.js`, the same pattern and for the
   same reasons as the theme (an inline script is blocked by the CSP, an Astro
   bundle runs too late). It cannot import the module, so it carries a
   hand-written copy of the parse and attribute rules; `tests/aksesibilitas.test.mjs`
   runs it and the module against the same fixtures and compares the attributes,
   so the copies cannot drift unnoticed. The panel half is a bundled module in
   `PanelAksesibilitas.astro` that reveals the button, wires the controls, writes
   storage, updates the attributes live, and dispatches
   `document.dispatchEvent(new CustomEvent("awcms-a11y-change", {detail}))` so a
   ticker, carousel or autoplay added later can react. This template has none
   today.
8. **The panel itself must be accessible.** The floating button is fixed at the
   bottom inline-start, at least 44 by 44 CSS px, with an icon and visually hidden
   text, `aria-label`, `aria-expanded` and `aria-controls`, and is hidden in
   print. The panel is a non-modal `role="dialog"` named by its heading (not
   `aria-modal`), anchored above the button with an internal scroll; it closes on
   Esc, on the close button, and on an outside click; focus moves to its heading
   when it opens and returns to the button on Esc or the close button. Text size is
   three native radios styled as segments; the six switches are
   `button[role=switch][aria-checked]` with their label and description wired by
   `aria-labelledby` and `aria-describedby`. Targets are at least 44 px high, and
   the panel uses the site's own tokens so it follows the light and dark themes and
   high contrast.
9. **Same origin only; the CSP is unchanged.** No inline script, no inline
   `style=""`, no `'unsafe-inline'`, no new origin. `tests/keluaran-csp.test.mjs`
   stays the guard for that.
10. **The byte budget moves, and the move is a measurement.** The panel adds two
    scripts and its styles to every page. `scripts/audit-aset.mjs` now allows
    18,500 B of script and 53,700 B in total per page (from 13,000 and 40,000), and
    registers `aksesibilitas.js` in its `public/` registry. The reasoning and the
    numbers are written beside each constant.

### Trade-off analysis

| Criterion | A, chosen | B (third-party overlay) | C (nothing) |
| --- | --- | --- | --- |
| Security | No new origin, no new request; CSP unchanged | New vendor origin and a relaxed CSP | Unchanged |
| Privacy | Settings never leave the device | Vendor sees the reader and may see the settings | Unchanged |
| Performance | About 5.7 KB of script and 8.0 KB of CSS added to every page (gzip is a fraction); no CLS, the button is fixed | A vendor bundle and its requests on every page | None |
| Maintainability | Ours to maintain; pure logic is unit tested and the early copy is parity tested | Vendor-controlled; changes without review | None |
| Scalability | Static files only; no origin load | Vendor availability becomes ours | None |
| Accessibility | Real benefit for the readers it targets; the panel itself is designed against WCAG 2.2 AA criteria; exercised once by hand in a browser, not automated | Claims it cannot honour; can interfere with assistive technology | Readers without a configured device get nothing |
| SEO impact | None: it rewrites no content and adds no blocking third party | Extra third-party weight can hurt vitals | None |
| UI/UX | One consistent control in the site's own look and language (id and en) | A foreign look and language | None |
| Compatibility | Plain CSS attributes, `localStorage`, `matchMedia`; degrades to the OS defaults | Depends on the vendor | Not applicable |
| Operational complexity | One more gate and one `public/` file, both documented | Contract and renewal with a vendor | None |
| Long-term implications | A panel a derived site can extend; the event lets later motion features obey it | Lock-in and a standing claim to defend | Pressure returns whenever someone asks for it |

## Consequences

- **Every public page gets the button.** It is rendered by `BaseLayout.astro`, so
  `ArtikelLayout.astro` and every other page have it without a per-page change.
- **The OS reduced-motion rule now has a second mode.** Once the early script has
  run, the attribute is the single source of truth and a reader can switch the
  OS-backed preference off. `global.css`'s `prefers-reduced-motion` block applies
  only without that marker, and carries a note saying so.
- **The reduce-motion attribute sets `transition: none`, the existing OS rule sets
  `transition-duration: 0.01ms`.** The existing comment in `global.css` argues
  that zeroing transitions loses focus and hover feedback; the final state is
  still applied at once, so the feedback is not lost, but the two rules are not
  identical and a reader who gets the attribute rule (anyone whose script runs) gets
  the stricter one.
- **A cost the budget now reflects.** About 13.7 KB more per page before
  compression, 1.5 KB of it gzipped CSS. A later option, not taken here, is to load
  the panel's script and styles only when the reader first opens it; it would lower
  the first-load cost but not the bytes that are eventually fetched, and it needs
  its own loading-state handling for focus, so it is recorded rather than used to
  satisfy the gate.
- **The palette is written twice.** CSS cannot share one rule between an attribute
  selector and a media query; the media copy exists only for the no-script and
  script-blocked cases. One corner is left out on purpose: the dark theme chosen on
  a light OS with the early script blocked gets the light high-contrast palette.
- **`filter: grayscale` is not free.** It makes the root element repaint
  differently on some browsers; it is opt-in and off by default.
- **Not tested in a browser by this repo.** This repo has no Playwright or axe, so
  the gates above cannot see focus movement, Esc, outside click, axe results with
  the panel open, or overflow at 360 px. Before the change was opened, all of them
  were exercised **once, by hand**, with Chromium and axe-core run from outside the
  repo against a production build served by `server/penyaji.mjs` (so the real CSP
  applied) and a stand-in `awcms`: the panel opens, Esc, the close button and an
  outside click close it with focus returned as specified, every switch sets its
  attribute and survives a reload, reset removes the key and the attributes, OS
  defaults apply and can be overridden, the button stays fixed with monochrome on,
  there was no CSP violation, axe reported nothing on any panel node with the
  panel open (light and dark, with and without high contrast), and there was no
  horizontal overflow at 360 px with extra-large text and every preference on.
  That run is not repeatable from the repo, which is what the follow-up below is
  for. It also found, and this change fixes, three existing defects the new
  preferences exposed; see the next item.
- **Three existing layouts changed so larger text does not overflow.** At the
  360 px floor with extra-large text the page scrolled sideways because of
  `.prinsip-grid` on the home page (`minmax(15rem, 1fr)` is 336 px at 140 %, wider
  than the 320 px inner width), because of `.share-list` below 480 px (a bare `1fr`
  cannot shrink below its content), and in high contrast because `.badge--emerald`
  put white text on a fill that the dark palette turns light. They now use
  `minmax(min(15rem, 100%), 1fr)`, `repeat(auto-fit, minmax(min(8rem, 100%), 1fr))`
  (two columns at the default size, one when larger text no longer fits two), and
  a dark fill in `aksesibilitas.css`. Layouts that carry real content from a
  derived site (tables, long words) were not exercised.

## Follow-ups

1. **Add Playwright and axe** (*done 19 November 2026 for the axe half, by
   [ADR-0056](0056-accessibility-is-gated-by-axe-in-a-real-browser-with-no-exceptions.md):
   axe runs in a real browser on every change, with the panel open and every mode
   on, and at 360 px; focus movement and persistence after a reload remain
   unautomated*) to cover: open the panel on a public page, toggle each
   preference, assert the attribute and persistence after a reload, Esc returns
   focus, axe finds no serious or critical violation with the panel open and with
   contrast on, and no horizontal overflow at 360 px with extra-large text. This
   was out of scope here because it adds a test framework.
2. **Real-user usability testing at UAT (step 14)**, before gate 15, with readers
   who use these preferences.
3. **Consider loading the panel lazily**, as described above, if the measured cost
   matters to a site.

## Verification

`tests/aksesibilitas.test.mjs` proves, with no browser:

- the storage contract: a valid object round-trips, and invalid JSON, a wrong
  version, a missing or non-boolean switch, an unknown text size and a throwing
  storage are all "no stored preference" and never throw;
- OS-default resolution, and that a stored object wins over the OS;
- the attributes each preference produces, and that reset keeps the ready marker;
- **parity**: `public/aksesibilitas.js` run in a sandbox produces the same
  attributes as the module for every combination of stored value and OS setting,
  including blocked storage and a missing `matchMedia`;
- the stylesheet: every attribute has a rule scoped under it, `filter` appears only
  on `html[data-a11y-mono]`, the high-contrast palette sits only inside
  `forced-colors: none` queries, the button is `position: fixed`, and it loads
  after `global.css`;
- the build output (when `dist/client` exists): the early script is a file on every
  page, the button and the panel are rendered `hidden` with their ARIA, the panel
  is a non-modal dialog, and the panel script is a same-origin bundle.

`tests/keluaran-csp.test.mjs` continues to prove that the output has no inline
script, style or `style=""`. `tests/audit-aset.test.mjs` proves the new budgets and
the registry entry.
