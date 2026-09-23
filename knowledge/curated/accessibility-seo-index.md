# Accessibility and SEO index

## Two accessibility floors, not one

**WCAG 2.1 AA is the floor for every public page.** Sufficient contrast in
both themes, visible focus, full keyboard navigation,
`prefers-reduced-motion` honoured — never a target to reach eventually.
**Every authenticated surface targets WCAG 2.2 AA instead** — the Jualanku
BFF and any declared USER admin surface alike (`AGENTS.md` §"Moving to
SSR"). What decides which floor applies is the presence of controls, forms,
and moving focus, not the surface's name.

## The 360px floor has a checker, not just a rule

Mobile-first from 360px: `.container`'s own padding leaves an inner width of
exactly 320px at that floor. A fixed-px/rem `minmax(…)` or a fixed
`width`/`min-width` that reaches or exceeds it, anywhere in `src/`, reddens
[`tests/lebar-360.test.mjs`](../../tests/lebar-360.test.mjs) unless wrapped in
`min(…, 100%)`, gated behind a desktop-only media query, or made
self-contained `overflow-x`. It is a static gate over CSS text — it proves
nothing about real rendering (sub-pixel rounding, font metrics, scrollbars),
which is why it is described as a floor, not a guarantee.

## Core Web Vitals: what is measured, and what is honestly not

Target is p75 LCP ≤ 2.5s, INP ≤ 200ms, CLS ≤ 0.1. Since ADR-0032, LCP and CLS
are asserted in the **lab** in CI for a site with a content source (see
`lighthouserc.json`; this template repo's own CI does not run that step). INP
has no lab proxy but TBT ≤ 200ms; p75 of REAL visits is unmeasured because RUM
is refused. Do not write "meets Core Web Vitals" from lab results alone — see
[`docs/awcms-astro/standar-performa-dan-keamanan.md`](../../docs/awcms-astro/standar-performa-dan-keamanan.md)
for the full honest-gaps table.

## Never advertise an asset the build did not publish

`og:image`, `twitter:image`, and JSON-LD `ImageObject` are CLAIMS a crawler
acts on. An optional social asset is declared through env and **dropped
entirely when empty** — never given a guessing default — because a preview
with no image degrades to a text card, while a preview with a broken image
degrades to nothing. This template once set all three on every page pointing
at a file a separate script never produced (`AGENTS.md` §"Security").
