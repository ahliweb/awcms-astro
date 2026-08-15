🇬🇧 English (source) · 🇮🇩 [Bahasa Indonesia](0021-tahan-pengembangan-menunggu-fondasi-awcms.id.md)

# ADR-0021 — Development of this repo is held until the `awcms` foundation is finished

- **Status:** Superseded by [ADR-0027](0027-penahanan-adr-0021-selesai.md)
- **Date:** 2 August 2026
- **Owner's rule:** 2 August 2026 — "further development of this repo waits until **foundational** development in the `ahliweb/awcms` repo is finished first, then development continues from this repo."
- **Related:** [ADR-0020](0020-layar-admin-kembali-ke-awcms.md) (admin screens return to `awcms` — the decision that moved the centre of gravity of the work over there), `awcms` [ADR-0047](https://github.com/ahliweb/awcms/blob/main/docs/adr/0047-mini-micro-frozen-foundation-built-here.md) (freezing `awcms-mini`/`awcms-micro`), `awcms` [ADR-0051](https://github.com/ahliweb/awcms/blob/main/docs/adr/0051-admin-screens-consolidated-in-awcms.md)

## Context

Four changes landed in this repo on 2 August 2026 and closed out all the work
that could be finished without `awcms` moving first: a strict CSP that is really
sent (ADR-0019), the content audit gate over the build output, aligning CI with
ADR-0018, and aligning the repo's role with `awcms` ADR-0051 (ADR-0020).

What is left in the backlog is **all waiting on `awcms`**, and that is no
coincidence. ADR-0020 has just moved every admin screen to `awcms`; `awcms`
ADR-0047 freezes `awcms-mini`/`awcms-micro` so that foundational features are
pioneered directly in `awcms`; and the `awcms` admin surface audit found 13 of 21
modules with no screen at all, now being worked through in waves. The centre of
gravity of this family's work is in `awcms`, and this repo is a **consumer** of
its contract.

Developing this repo in parallel therefore has a specific cost, not merely "less
focus": **every feature built on a contract that is not yet stable has to be
written twice.** This repo has already paid that once — its content adapter was
written for the summary list, then rewritten when `awcms` shipped the build feed
(ADR-0018), and its first version published a site whose every article was empty
with a green build.

## Decision

**Development of this repo is held until FOUNDATIONAL development of `awcms` is
finished.**

This is a hold, not a permanent freeze, and not a statement that this repo is
finished — its backlog still exists and is recorded in
[`README.md`](../../README.md).

### What may STILL land

Two classes, and both are narrow:

1. **Security patches.** This repo has a production image running behind Traefik.
   Vulnerabilities do not freeze along with its development, and holding them for
   months trades a real risk for a tidy schedule.
2. **Dependency bumps.** Dependabot is already active (`bun` weekly,
   `github-actions` monthly) and will keep opening PRs during the hold. Letting
   them pile up means lifting the hold onto a months-deep stack of bumps to be
   judged all at once — precisely the state most likely to smuggle in a behaviour
   change with nobody reading it.

Both remain subject to every existing gate: `bun run build`, `bun test`,
`bun run audit:konten`, and a changeset when behaviour changes.

### What is HELD

Everything other than the two items above: features, refactors, new gates, and
documentation changes that are not corrections.

**One exception that has to be stated plainly:** a document that *stops being
true* because `awcms` changed is a defect, not new work. If `awcms` changes a
contract and `AGENTS.md` here becomes misleading, its correction lands — that is
exactly what this hold protects. What is held is growing the documents, not
keeping the existing ones honest. This repo has already found two examples in a
single day (the admin role, and a media endpoint that already existed), and
neither would be visible to anyone reading only the documents.

### When this hold is lifted

When the owner declares foundational `awcms` development finished. The closest
signals that can be checked today are two, both in `awcms`'s own
[`docs/PROJECT_STATE.md`](https://github.com/ahliweb/awcms/blob/main/docs/PROJECT_STATE.md):

- **Every module has a screen.** ~~The §Admin screens table records "**7 of 21
  modules** still without a screen" (down from 13 when `awcms` ADR-0051 was
  written).~~ Zero is the marker, and `tests/admin-navigation-registry.test.ts`
  over there is what enforces it.

  **This indicator is now MET, 3 August 2026.** `grep -L 'navigation:'
  src/modules/*/module.ts` in `awcms` returns **zero** lines — checked against the
  code, not against its table, because that table itself once went stale with
  nothing turning red. The remaining seven were closed by `/admin/reporting`,
  `/admin/approvals`, `/admin/domain-events`, `/admin/sync`, `/admin/blog`,
  `/admin/media` (ADR-0056), and `/admin/idn-regions`; `/admin/blog-pages`
  (ADR-0057) followed on top of them.

- **§4 "outstanding" is empty** — the seam waiting for a provider, host-resolved
  public routes, and the remaining `awcms-micro` absorption.

  ~~**NOT YET, as of 3 August 2026.** All three are still open in §4: the
  business-scope resolver base is still a fail-closed NO-OP, the host-based
  content route `/blog/{slug}` is still a follow-up, and `newsletter` +
  `social-publishing` + the Wave 0 component library + the Wave 3 trajectory are
  not absorbed.~~

  **MET as well, 4 August 2026** — two of the three closed, and the third turned
  out never to have been included. `awcms` ADR-0059 landed host-resolved content
  routes (`/news/**`; `/blog/{slug}` **refused with evidence** — Astro lets two
  route files silently shadow each other), and ADR-0060 gave the business-scope
  resolver its provider. The remaining `awcms-micro` absorption (`newsletter`,
  `social-publishing`, the `src/components/ui/` library) **is still absent and
  does not block this repo** — that is not a judgement from here but `awcms`'s own
  conclusion in the §`awcms-astro` readiness section of its PROJECT_STATE:
  **"What remains AND belongs to this repo: zero."**

  Its consequences are written in [ADR-0027](0027-penahanan-adr-0021-selesai.md).

Those criteria are **indicators, not an automatic gate**: what lifts the hold is
still the owner's statement. They are written here so that "is it finished yet?"
has something that can be looked at rather than guessed.

## Resumption points — what waits for the hold to be lifted

Written now, while the context is still fresh. A list reconstructed months later
from `git log` always loses its reasoning.

1. **Article images.** No longer blocked by `awcms` —
   `GET /api/v1/media/objects?ids=…` already exists and the build feed already
   carries `featuredMediaId`. Two decisions remain here: where the resolved image
   lives (`LocalizedArticle`, resolved once per build in `content.ts` — not in a
   synchronous module called by components), and what `img-src` allows (the media
   host is on another origin, so the ADR-0019 CSP blocks it until that origin is
   declared). Details in
   [`src/lib/article-images.ts`](../../src/lib/article-images.ts).
2. **The locale filter in the `awcms` feed.** ~~Still absent — checked directly in
   `blog-post-list-query.ts` on 2 August 2026. The build pulls EVERY locale and
   pairs them up here; correct, but excessive for a single-language site.~~

   **Correction, 3 August 2026 — this item stopped being true within hours.**
   `awcms` [#346](https://github.com/ahliweb/awcms/pull/346) landed the same day
   and names this item in its commit body: `?locale=` now exists on all three list
   branches (`view=full` included), exact-match, absent meaning every locale,
   empty answered with a 400.

   And the reason this item was **wrong**, not merely out of date. "Excessive for
   a single-language site" describes another repo: this template serves two
   locales (`id` + `en`, `src/config/site.ts`) and pairs them through
   `translationGroupId`. Using `?locale=id` here would discard every `en` row
   **without a single gate turning red** — `assertTranslationsArePairable` catches
   a translation arriving without a group, not a translation that was never pulled
   at all. The result is a green build publishing every `/en/**` page as
   Indonesian marked "not translated yet": exactly the same failure shape as
   ADR-0018 (an ignored `view=full` → every article empty, green build), and
   `AGENTS.md` already calls that a failure, not an optimisation.

   So what waits on the hold being lifted is not "add `?locale=`" but a smaller
   decision: a **single-locale deployment** may send it, and that means one
   traversal per locale (the parameter accepts one value), not one leaner
   traversal.
3. **A share card per page.** It needs a generator bound to domain artwork;
   `SITE_SOCIAL_IMAGE` (one card, optional) remains a supported state.
4. **The Jualanku portal BFF (ADR-0014).** The two contracts that used to block it
   have landed in `awcms` (ADR-0049/0050); the remaining prerequisites are in
   [`04-kesiapan.md`](../awcms-astro/jualanku/04-kesiapan.md).

## Consequences

- **The `awcms` contract hardens first, then is consumed once.** That is the main
  benefit, and this repo has already paid the price of the opposite.
- **The backlog does not disappear, it waits** — and the resumption points above
  are what make this postponement cheap to lift.
- **Dependabot keeps running**, so this hold does not produce a repo left behind
  by its own build chain.
- **An accepted risk:** "foundational development is finished" has no formal
  definition, so this hold could last longer than intended without anyone
  noticing. The two indicators above are what give it something to check; if both
  are at zero and the hold is still in force, that is a question worth raising,
  not a state to be left alone.
