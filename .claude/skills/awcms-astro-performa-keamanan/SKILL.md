---
name: awcms-astro-performa-keamanan
description: Checking awcms-astro's performance and security against standards that are named (OWASP Top 10 2021, ASVS 4.0.3, Secure Headers, ISO 27001 Annex A, NIST SSDF, Core Web Vitals) — what is already met and with what evidence, ten numbered gaps that are all closed together with two limits that are still stated (.astro is not statically analysed; CWV is measured in a lab, not on real visits), and five controls that are deliberately REFUSED. Use before a release, before a derived site goes live, when touching server/penyaji.mjs or the performance budgets, or when answering a compliance question.
---

🇬🇧 English (source) · 🇮🇩 [Bahasa Indonesia](SKILL.id.md)

# awcms-astro — performance and security

Source of truth: [`docs/awcms-astro/standar-performa-dan-keamanan.md`](../../../docs/awcms-astro/standar-performa-dan-keamanan.md)
([ADR-0028](../../../docs/adr/0028-jangkar-standar-performa-dan-keamanan.md)).
This skill is the procedure; that document is the matrix.

**The first rule, and the one most often broken when answering a compliance
question: do not answer from memory.** Every "Met" row in that document names its
file. Open the file. This repo has already recorded eleven documents stating
something that does not exist, and a compliance matrix is the kind of document
most likely to become number twelve — its "State" column **cannot be gated by a
machine**.

## What five minutes answers

```bash
bun run check             # types + lockfile
bun test                  # PO catalogues, awcms contract, site role, news vocabulary, server, output CSP, toolchain
bun run audit:konten      # image sources; after a build, nine output families + two performance gates
bun run audit:dokumen     # links, the ADR index, polish surfaces, paths named by a document
bun run audit:translation # stale mirrors, and which documents have no mirror at all
bun run audit:graf        # the graphify-out/ artefact — community names that were genuinely chosen
bun audit --audit-level=low   # dependency-chain vulnerabilities — MUST be zero before a release
```

`bun run release <level> --apply` runs **six of those seven**, in an order that
means something — `bun test` and `bun run audit:konten` AFTER the build, because
three of their layers skip themselves without `dist/`. Until 4 August 2026 the
releaser skipped `bun test` and `bun audit` entirely while four documents
demanded both ([ADR-0030](../../../docs/adr/0030-aturan-tertulis-mendapat-pemeriksanya.md)).
The seventh, `audit:translation`, runs in CI on every push but **not** in the
releaser — so a stale mirror is caught before merge rather than at the release,
and that difference is worth knowing rather than assuming.

`bun audit` (dependency vulnerabilities) and `bun run audit:konten` (site
contents) are two different things; the names are deliberately not made to look
alike.

**In the template repo two layers skip themselves** because there is no content
source, and both say so in their output. **In a SITE, "skipped" means it did not
run** — run `bun run build` first, then `bun test` and `bun run audit:konten`
again.

## Headers — check how MANY, not only their values

`server/penyaji.mjs` is the **only** place response headers are decided
(ADR-0016). Five are sent in every environment, and all five have the same values
as `awcms`:

```
Content-Security-Policy    default-src 'self'; script-src 'self'; style-src 'self'; …
X-Content-Type-Options     nosniff
X-Frame-Options            DENY
Referrer-Policy            strict-origin-when-cross-origin
Permissions-Policy         geolocation=(), camera=(), microphone=(), payment=()
```

The sixth is **production only** (ADR-0029):

```
Strict-Transport-Security  max-age=31536000        ← NODE_ENV=production only
```

Two things about that line are most often misunderstood:

- **Its production gate is not tidiness.** HSTS cannot be cancelled from the
  site's side and applies to a HOST, not to a site. `bun run serve` runs the same
  file as production — once it sends HSTS on `localhost`, EVERY other project on
  `http://localhost:<port>` is locked for a year too, with no way to revoke it
  short of editing browser internals. The assertion that guards it is therefore
  **inverted**: what is tested is that HSTS is NOT sent outside production.
- **`includeSubDomains` is deliberately absent, unlike in `awcms`.** `awcms` is
  one deployment whose operator knows its subdomains; this template runs on a
  domain belonging to an organisation that almost certainly has other services on
  other subdomains. Adding it is a decision for a SITE whose subdomains really
  are all HTTPS — in the server, then update `tests/penyaji.test.mjs`.

`Server` and `X-Powered-By` are removed by `pasangHeader`, and their absence is
asserted.

Loosening or adding a header **must** go through `tests/penyaji.test.mjs`, and if
it changes the security posture, through an ADR first.

## Performance — targets, not only budgets

Core Web Vitals at **p75 of real visits**:

| Metric | Threshold | What can break it in this template |
| --- | --- | --- |
| LCP | ≤ 2.5 seconds | An article illustration without `fetchpriority="high"` (gap 2), or a raster photo without `srcset` (ADR-0024) |
| INP | ≤ 200 milliseconds | JS that sneaks in. This site is very nearly JS-free, so a bad INP **is a signal**, not merely a number |
| CLS | ≤ 0.1 | A webfont added without `font-display`, or an image frame that has lost its `aspect-ratio` |

**LCP and CLS are asserted in a LAB in CI since ADR-0032** — Lighthouse in the
`build` job, only on a site that has a content source; in the template repo that
step does not run. INP is not measurable in a lab, so TBT ≤ 200 ms is used as a
proxy and is called a proxy. What is audited is a **sample**: up to 10 URLs to a
depth of 4 — a limit CHOSEN in `lighthouserc.json` and asserted by
`tests/cwv-lab.test.mjs`; the lhci default quietly stops at the 5 shallowest URLs
and never reaches a localised article page. **Do not write "meets Core Web
Vitals" from a lab result** — a lab measures pages, not readers, and p75 of real
visits stays unmeasured because RUM is refused.

Budgets: **home ≤ 250 KB of images, content page ≤ 100 KB.** Since 4 August 2026
they are **measured** by `bun run audit:konten` over `dist/client`, per page —
what is weighed is only the images this build actually publishes, because `awcms`
media are not there.

**The byte budget for scripts and stylesheets is a different gate**, `bun run
audit:aset`, and its ceilings live in `scripts/audit-aset.mjs`: **13,000 B of
script and 40,000 B in total per page**, plus 8,000 B for one published script
file. Every one of them is a MEASUREMENT with headroom, not a round number
somebody liked — the script ceiling was first written as 9,000 from a hand count
that missed some inline blocks, and the gate corrected it on its first run.

The total moved 36,000 → 40,000 on 2 September 2026, when the home page redesign
made `/` the heaviest page at 38,136 B. Read what happened before quoting the new
number: the gate was let bite first, and what it found was hero CSS sitting in
`src/styles/global.css` while one component used it — every article, section and
search page was downloading it. Moving that block returned 1,853 B to every page,
and only the genuinely new surface was left to justify the raise. **A red
`audit:aset` is a question about which file a rule is in before it is a question
about the ceiling.**

What is still wrong and deliberately not fixed there is recorded in the script:
`BaseLayout.css` is 22,577 B and still ships article-body, fee-table and
accordion styles to pages that have none of them.

## Ten gaps — all closed, two limits still stated

All ten (1 HSTS, 2 `fetchpriority`, 3 image budgets, 4 the `awcmsGet` timeout,
5 leaking headers, 6 SHA/digest pinning, 7 static analysis, 8 lab Core Web
Vitals, 9 the release SBOM, and **10** the checkers for gaps 2 and 3 that had
never once been executed in the repo where both were written — closed on
6 August 2026 by `tests/audit-konten.test.mjs`, which runs the script over a
fixture tree) **remain recorded in the standards document's table** with each of
their checkers. Do not delete their rows: deleted, the gap gets proposed again as
a new finding six months later, and its checker gets loosened by someone who does
not know why it is there.

The last two closures (ADR-0032) carry an **honesty condition** that has to be
stated every time a compliance question is answered:

| The claim that is true | The claim that is TOO LARGE — do not write it |
| --- | --- |
| "The JS/TS surface is analysed by scheduled CodeQL; `.astro` is not, and every run's summary says so" | "This repo is statically analysed", without naming the `.astro` limit |
| "LCP and CLS are asserted in a LAB in a site's CI over a sample of ≤10 pages (TBT 200 ms as an INP proxy)" | "Meets Core Web Vitals" — that is a claim about p75 of real visits, which is not measured because RUM is refused; and "measured over dist/client" without the word SAMPLE |

## Five controls that are REFUSED — do not propose them again without reading why

Written up in the standards document §"What is deliberately NOT adopted", and
three of them are refused by the same rule:

| Control | Why it is refused |
| --- | --- |
| CSP reporting (`report-to`) | It sends the URL a reader currently has open to a collector. The ban on collecting reader data **has no "but this is for security" exception** |
| RUM for measuring Core Web Vitals | The same reason. Gap 8 was therefore pointed at **lab** measurement in CI, with its limitations stated |
| Blanket `Cross-Origin-Resource-Policy: same-origin` | It blocks other sites from embedding images from this one — a decision that does not belong to a TEMPLATE. `awcms` does send it (along with COOP) to fence off its admin sessions; since 5 August 2026 that difference is recorded as a divergence with a `reviewDate` in the family manifest over there (its ADR-0069), so **do not "fix" it towards parity** — a site that needs it decides so through an ADR in that site's repo |
| Subresource Integrity | There is not a single cross-origin resource. SRI without external resources guards nothing |
| Rate limiting / WAF in the server | That belongs to Traefik/Coolify. Two places deciding the same thing is the quietest way to end up with no decision |

## Before a derived site goes live

- [ ] All six gates green **after** `bun run build`, not before.
- [ ] `bun audit` zero.
- [ ] **If that site declares `permukaanAdmin`, this checklist is not enough.**
      The moment there is one route that asks its reader to log in, there is a
      session, there is a form, there is CSRF; public and authenticated caches
      MUST be separated; the ADR-0019 posture applies on any path carrying
      credentials; the accessibility target rises to WCAG 2.2 AA; and OWASP
      A01/A07/A09 apply again. The easiest thing to miss: **two of the five
      refused controls in the table above are refused for reasons that stop
      holding in exactly that kind of site** — COOP ("no session to fence off")
      and SRI ("no cross-origin resources"). Both are premises, not principles.
      The full list is in
      [`docs/awcms-astro/permukaan-admin-user.md`](../../../docs/awcms-astro/permukaan-admin-user.md) §3.
- [ ] `bun run serve`, then check the headers actually sent — `curl -sI` and
      `curl -s -o /dev/null -D -` must report the same thing (GET/HEAD parity is
      a defect that has already happened here).
- [ ] `NODE_ENV=production` is set, so the server sends HSTS (ADR-0029; the
      `Dockerfile` image sets it). **Do not install a second HSTS policy in
      Traefik** — two policy sources overwriting each other is the quietest way
      to end up with no policy; if your proxy already sets it, pick one source
      and record it in your site's ADR.
- [ ] `AWCMS_TENANT_ID` is filled in. It is optional and selects nothing; what it
      prevents is another tenant's token building a full site of somebody else's
      articles, with a green build.
- [ ] `SITE_SOCIAL_IMAGE` is empty **or** points at a file that really exists.
      Empty is a supported state; pointing at a 404 is not.
- [ ] Token contrast is audited with measurements if the colour tokens are
      changed — this repo has **never** run that audit over its own default
      tokens.

## References

- [`docs/awcms-astro/standar-performa-dan-keamanan.md`](../../../docs/awcms-astro/standar-performa-dan-keamanan.md)
- [`docs/adr/0028-jangkar-standar-performa-dan-keamanan.md`](../../../docs/adr/0028-jangkar-standar-performa-dan-keamanan.md)
- [`docs/adr/0019-csp-ketat-dikirim-penyaji.md`](../../../docs/adr/0019-csp-ketat-dikirim-penyaji.md)
- [`docs/adr/0016-penyajian-bun-di-belakang-traefik-tanpa-nginx.md`](../../../docs/adr/0016-penyajian-bun-di-belakang-traefik-tanpa-nginx.md)
- [`AGENTS.md`](../../../AGENTS.md) §Security, §Serving, §External standards
- [`docs/awcms-astro/permukaan-admin-user.md`](../../../docs/awcms-astro/permukaan-admin-user.md) — what changes the moment a site declares a USER admin surface
- On the `awcms` side: ADR-0068 (the family's pinned standard editions — Top 10
  2021, ASVS 4.0.3, API Security 2023, ISO 27001:2022, SSDF v1.1 — all five
  reviewed again on 2027-02-04; ISO/IEC 25010:2023 is used by both repos but is
  NOT part of that pin — with **five** divergence entries, including this repo's
  HSTS and `astro-files-not-type-checked`, which leans on the TypeScript 6.x pin
  here), ADR-0065 (the `awcms-astro` consumer contract frozen and gated over
  there), ADR-0092 (machine credentials may WRITE — the "read-only" premise stops
  being a property of the class), the `awcms-security-hardening` skill (the
  OWASP/ASVS/ISO matrix whose editions are matched here), and
  `awcms-performance` (data access patterns — not applicable in this repo, which
  has no database)
- **ADR-0067's status on the `awcms` side has changed**, and the family sentence
  "both repos measure the LAB and neither measures the field" has a known expiry
  date: that ADR is now `Accepted (not yet implemented)` with **Option B**
  decided on 8 August 2026 — aggregation at the entry point, with no raw row per
  visit. Once it is built, one repo measures the field and this one does not,
  because RUM here is permanently refused (ADR-0032 §B)
