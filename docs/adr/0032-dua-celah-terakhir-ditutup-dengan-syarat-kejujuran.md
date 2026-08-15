🇬🇧 English (source) · 🇮🇩 [Bahasa Indonesia](0032-dua-celah-terakhir-ditutup-dengan-syarat-kejujuran.id.md)

# ADR-0032 — The last two ADR-0028 gaps are closed, each with its honesty condition

- **Status:** Accepted
- **Date:** 5 August 2026
- **Owner's rule:** 5 August 2026 — "where implementation is needed, act on all the recommendations."
- **Related:** [ADR-0028](0028-jangkar-standar-performa-dan-keamanan.md) (gaps 7 and 8, closed here), [ADR-0030](0030-aturan-tertulis-mendapat-pemeriksanya.md) (SHA pinning + a new rule must bring its checker), [ADR-0031](0031-sbom-cyclonedx-dari-lockfile-pada-rilis.md) (gap 9, the same closure pattern), `awcms` [ADR-0067](https://github.com/ahliweb/awcms/blob/main/docs/adr/0067-core-web-vitals-collection.md) (field CWV collection, still `Proposed` over there)

## Context

Two ADR-0028 gaps remained, and both were held not because they are hard but
because the easy closure is a closure that lies:

- **Gap 7 (static analysis).** CodeQL does not parse `.astro`. Switching it on
  and then calling this repo "statically analysed" is ceremony that looks like
  coverage — a claim larger than the reality.
- **Gap 8 (Core Web Vitals).** Field measurement (RUM) is refused because it
  collects reader data — a refusal that has no "but this is for
  security/performance" exception. Lab measurement needs Chrome in CI and a build
  output, and the template repo has no content source to build.

The ADR-0028 gap table itself already prescribed the honest closure shape for
both: "a scheduled CodeQL workflow, **with its coverage STATED in the run
summary**" and "Lighthouse CI over `dist/client` in the `build` job, **running
only when the site has a content source**". What was being waited on was not a
decision — that decision was already written — but the owner's instruction to pay
its cost.

## Decision

### §A — Gap 7: CodeQL over the JS/TS surface, with coverage counted rather than claimed

`.github/workflows/codeql.yml`: language `javascript-typescript`, scheduled
weekly plus on changes (GitHub updates CodeQL queries continuously, so even code
that has not moved deserves rescanning), every action pinned to a commit SHA
(ADR-0030).

**Its honesty condition:** the `State the coverage` step writes into the run
summary how many `.ts`/`.mjs`/`.js` files were analysed and how many `.astro`
files were NOT — both **counted by `find` at run time**, not written by hand,
because a hand-written number stops being true the moment a file is added. This
repo's risky data paths (`content-blocks.ts`, `penyaji.mjs`, the `awcms` client,
every gate) are inside the coverage; what is outside is component markup.

### §B — Gap 8: lab Core Web Vitals, conditioned on a content source, with a proxy that is called a proxy

The `Core Web Vitals (lab) over the build output` step in the `build` job
(`treosh/lighthouse-ci-action`, SHA-pinned), `if: vars.AWCMS_API_URL != ''` — the
same pattern as the serving gate and the content audit over the build output: in
the template repo it does not run, in every SITE it runs on every PR.

The thresholds in `lighthouserc.json` match the standards document's targets:
LCP ≤ 2500 ms, CLS ≤ 0.1, at `error` level — `warn` is theatre. **INP is not
measured, and that is stated:** it is a field metric, and field means the RUM
that has already been refused. Total Blocking Time ≤ 200 ms is used as its lab
proxy — a site that is very nearly JS-free should be near zero, so a high TBT is
a signal that JS has crept in, exactly what the INP threshold guards.

**What is audited is a SAMPLE, and its limit is chosen — not inherited.** The
`@lhci/cli` default stops silently at the 5 shallowest URLs with a discovery
depth of 2 — on a real derived site that means NOT ONE localised article page
(`/{lang}/{tab}/{slug}/`, depth 3) is ever measured, while 404.html eats a slot.
An adversarial pre-merge review found it from the pinned version's source. The
configuration therefore states all three: `staticDirFileDiscoveryDepth: 4`,
`maxAutodiscoverUrls: 10`, and a `/404.html` blocklist — asserted by
`tests/cwv-lab.test.mjs` so nobody can return them to the defaults unseen. A site
needing more coverage raises the numbers in `lighthouserc.json`; ten pages is a
sample chosen deliberately to protect CI time, not a claim of full coverage.

### §C — Its checkers (ADR-0030 applies to this closure too)

- `tests/analisis-statik.test.mjs`: the workflow exists, is scheduled, every
  action carries a SHA + a version comment, and the coverage-statement step —
  along with its mention of `.astro` and its `find` — cannot be deleted silently.
- `tests/cwv-lab.test.mjs`: the configuration thresholds are PINNED to the
  standards document's numbers (loosening them requires changing the test —
  visible in review), and its CI step is conditioned and pinned. Both tests run in
  the template repo, so this closure **can be proven where it was written** — the
  old objection about gates rotting is answered here rather than ignored.

## Consequences

**What is gained.** All nine ADR-0028 gaps are closed, each with its checker.
SSDF RV.1 rises to Met. A derived site gets lab CWV measurement over a sample of
its pages on every PR from day one, without a single byte of its readers' data
being collected.

**What is paid.** Two CI workflows depend on two third-party actions (SHA-pinned,
bumped by Dependabot); an honest CodeQL run summary has to keep saying `.astro`
is not analysed; and lab results will fluctuate — three runs per page damp that,
they do not remove it.

**What does NOT change.** RUM stays refused; "meets Core Web Vitals" still may
not be written from a lab result (a lab measures pages, not readers); and a
closed gap's row STAYS in the ADR-0028 table.

**What would reopen this.** An `.astro` extractor for CodeQL (or another static
analysis that parses it) requires §A to be reviewed; the `awcms` ADR-0067
decision changes nothing here — whichever option it picks, this repo's posture is
already stated.

## Alternatives considered

- **Leaving both open.** Until today that was the right decision; what changed it
  is the owner's instruction. The closure shape was not renegotiated — exactly
  what the gap table prescribed is what was used.
- **Semgrep/oxlint instead of CodeQL.** Equally unable to parse `.astro`, adds a
  second tooling family, and loses the Security tab integration.
- **Measuring CWV with RUM.** Permanently refused — not a technical trade-off but
  the ban on collecting reader data.
- **Running Lighthouse over fixture pages in the template repo.** It measures
  pages nobody will ever publish; a green that proves nothing, a red that means
  nothing.
