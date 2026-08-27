🇬🇧 English (source) · 🇮🇩 [Bahasa Indonesia](standar-performa-dan-keamanan.id.md)

# awcms-astro — Performance and Security Standard

The map between the controls that genuinely run in this repo and the
**international standards that name them**, together with an honest list of gaps.

This document adds not one new rule. Its rules already exist — in
[`AGENTS.md`](../../AGENTS.md), [`standar-teknis.md`](standar-teknis.md), and
twenty-four ADRs. What did not exist is an **external name** for those rules, and
that absence has two real consequences:

1. A site built from this template cannot answer "which controls do you meet?"
   when asked by an auditor, a procurement office, or a prospective partner — even
   though the answer is mostly "met".
2. A gap that is not yet closed has nowhere to be **seen**. This repo has already
   found five documents stating something that does not exist
   ([`awcms-astro-gerbang`](../../.claude/skills/awcms-astro-gerbang/SKILL.md));
   its opposite is equally dangerous — a control that does not exist and was never
   recorded as absent.

**Each row's state below is verified against files, not assumed.** A row that
cannot be verified is written `not measured`, not `met`.

## The standards that bind

| Standard | Edition used | What it governs | Binding here through |
| --- | --- | --- | --- |
| OWASP Top 10 | 2021 | Web application risk categories | The matrix below |
| OWASP ASVS | 4.0.3 (L1/L2) | Control verification per category | V5, V9, V14 below |
| OWASP Secure Headers Project | rolling | HTTP response headers | [`server/penyaji.mjs`](../../server/penyaji.mjs) |
| ISO/IEC 27001 | 2022, Annex A | The controls that touch code | The matrix below |
| NIST SSDF | SP 800-218 v1.1 | Software supply chain practices | `.github/`, `bun.lock`, `Dockerfile` |
| OWASP API Security Top 10 | 2023 | API-specific risks | **Not applicable** — this repo does not SERVE an API. Named so that parity with `awcms` can be read rather than guessed |
| ISO/IEC 25010 | 2023 | The product quality model (performance, compatibility, reliability) | Compatibility/interoperability: the surface gate in §The relationship with `awcms` |
| Core Web Vitals | LCP · INP · CLS | Performance as a reader feels it | §Performance |
| RFC 9111 (+ RFC 5861) | HTTP Caching, `stale-while-revalidate` | `Cache-Control` semantics | [`tests/penyaji.test.mjs`](../../tests/penyaji.test.mjs) |
| WCAG | 2.1 AA (2.2 AA for any authenticated surface: the Jualanku BFF and USER admin alike) | Accessibility | [`standar-teknis.md`](standar-teknis.md#accessibility) |

**This list is deliberately matched to the `ahliweb/awcms` assessment of 4 August 2026** (`docs/awcms/repo-assessment-2026-08-04.md`), which measures itself against ISO/IEC 25010, RFC 9111/5861, Core Web Vitals, OWASP Top 10 2021, OWASP API Security Top 10 2023, ASVS 4.0, and ISO/IEC 27001:2022 Annex A. Two of them were absent from this list until today, and one (API Security Top 10) does not apply here — it is still recorded, because a "not applicable, and here is why" row is what makes two family matrices addable.

**RFC 5861 (`stale-while-revalidate`) is deliberately NOT used.** It is valuable for a SHARED cache; this site is served by one Bun process behind Traefik with no shared cache, so that directive would only add a promise nobody keeps. A site putting a CDN in front has a different reason — and that is the site's decision, not the template's.

**The OWASP Top 10 and ASVS editions are deliberately matched to `ahliweb/awcms`** —
and since 4 August 2026 that pin has an address: `awcms` ADR-0068 writes it as a
family decision (Top 10 2021, ASVS 4.0.3, API Security 2023, ISO 27001:2022,
SSDF v1.1 — all five reviewed again on 2027-02-04; ISO/IEC 25010:2023 is used by
both repos but is NOT part of that pin), replacing the earlier state where the pin
lived only in the `awcms-security-hardening` skill with no ADR, no review date, and
no owner. Moving to a new edition is a **family-level** decision: two repos mapping
themselves to two different editions produce two matrices that cannot be added
together, and whoever reads them will take the difference for a gap. If `awcms`
moves edition through a superseding ADR, this repo follows — it does not go ahead.

## Response headers — and one real difference from `awcms`

What [`server/penyaji.mjs`](../../server/penyaji.mjs) actually sends, and what
[`tests/penyaji.test.mjs`](../../tests/penyaji.test.mjs) proves:

| Header | Its value here | Its value in `awcms` | The OWASP Secure Headers recommendation |
| --- | --- | --- | --- |
| `Content-Security-Policy` | `default-src 'self'`; `script-src`/`style-src` without `'unsafe-inline'`; `img-src` + the media origin; `connect-src` + the `awcms` origin when the search box is published (ADR-0043) | the same, plus the theme script hash and the Turnstile origin when active | Required |
| `X-Content-Type-Options` | `nosniff` | `nosniff` | Required |
| `X-Frame-Options` | `DENY` | `DENY` | Required (along with `frame-ancestors`) |
| `Referrer-Policy` | `strict-origin-when-cross-origin` | the same | Required |
| `Permissions-Policy` | `geolocation=(), camera=(), microphone=(), payment=()` | exactly the same | Required |
| `Strict-Transport-Security` | `max-age=31536000`, gated to production | `max-age=31536000; includeSubDomains`, gated to production | Required |
| `Server` / `X-Powered-By` | **removed**, and their absence asserted | — | Required not to leak versions |
| `Cross-Origin-Opener-Policy` | not sent | `same-origin` (since 4 August 2026) | Recommended |
| `Cross-Origin-Resource-Policy` | not sent | `same-origin` (since 4 August 2026) | Recommended |

The last two rows are a new difference and are **deliberate on both sides**:
`awcms` installs both to fence off its authenticated admin sessions, and a comment
in its own code (`src/lib/security/security-headers.ts`) states that its reason
does NOT carry over to this template — a static public site whose images may
legitimately be embedded by other sites, and which has no session for COOP to fence
off. The details of its refusal are in §"What is deliberately NOT adopted". Since
5 August 2026 this difference is **no longer merely two documents that happen to
agree**: `awcms` ADR-0069 records it as a named divergence with a `reviewDate` of
2027-02-04 in its family compatibility manifest, in the same cohort as this repo's
HSTS divergence — meaning it returns to the table on that date rather than rotting,
and nobody will "fix" it towards parity without reading its reasoning first.

**Until 4 August 2026 this repo sent FIVE, and four files called that "matched to
the `awcms` posture".** Those five are indeed identical in value; what is not
identical is their count. The reason that reads plausibly — TLS is terminated by
Traefik, so "that is the front layer's business" — does not survive checking:
Traefik does not install HSTS without a declared middleware, so what was happening
was not "installed elsewhere" but **installed nowhere**.

[ADR-0029](../adr/0029-hsts-digerbangi-produksi-tanpa-includesubdomains.md)
closes it. Two things inside it to know before touching that line:

- **Its production gate is not tidiness.** HSTS cannot be cancelled from the
  site's side, and it applies to a HOST — not to a site. On `localhost` what gets
  locked is not only this preview but every other project the machine's owner
  develops at `http://localhost:<port>`, for a year. The assertion guarding it is
  therefore **inverted**: what is tested is that HSTS is NOT sent outside
  production.
- **`includeSubDomains` deliberately does not follow, unlike in `awcms`.** `awcms`
  is one deployment whose operator knows its subdomains; this template runs on a
  domain belonging to an organisation that almost certainly has other services on
  other subdomains, and that directive forces all of them to be HTTPS-only for a
  year. A site whose subdomains really are all HTTPS may add it — in the server,
  then update its test.

## OWASP Top 10 (2021) → this repo's surfaces

A site from this template is **static**: no database, no sessions, no forms, no
mutations. Most categories therefore do not apply — and writing "not applicable"
along with **its reason** is more useful than deleting its row, because it is that
reason which stops being true the moment a site adds an authenticated surface.

**Its trigger has a name, and it can be read from one file.** Every "not
applicable" row below rests on an EMPTY `permukaanAdmin` in
[`src/config/site.ts`](../../src/config/site.ts) and zero `prerender = false`
routes. A site declaring a USER admin surface
([ADR-0034](../adr/0034-publik-secara-bawaan-admin-hanya-bila-dinyatakan.md))
voids that premise, and A01/A07/A09 apply again along with CSRF, sessions, and
cache separation. That holds for the Jualanku surface and the USER admin surface
alike — the surface's name decides nothing; what decides is whether there is a
path carrying credentials. Its full list is in
[`permukaan-admin-user.md`](permukaan-admin-user.md) §3.

| # | Category | Its state here | Evidence / note |
| --- | --- | --- | --- |
| A01 | Broken Access Control | Not applicable on the public surface | There is no per-user object. What remains: a leak **between tenants** at build time — guarded by the tenant assertion in [`src/lib/awcms/tenant.ts`](../../src/lib/awcms/tenant.ts) |
| A02 | Cryptographic Failures | Met | TLS belongs to Traefik; the build token never enters the output (no `PUBLIC_` prefix); **HSTS is sent in production** since [ADR-0029](../adr/0029-hsts-digerbangi-produksi-tanpa-includesubdomains.md) |
| A03 | Injection | Met | There is no raw HTML path: [`src/lib/content-blocks.ts`](../../src/lib/content-blocks.ts) assembles every element from escaped text and fixed tags; `set:html` only accepts its output. Guarded by [`tests/content-blocks.test.mjs`](../../tests/content-blocks.test.mjs) |
| A04 | Insecure Design | Met | Static-by-default is an ADR decision ([ADR-0014](../adr/0014-rendering-campuran-dan-bff-portal.md)), not an accidental default. Silently truncating content is treated as a **failure** in [`src/lib/content.ts`](../../src/lib/content.ts) |
| A05 | Security Misconfiguration | Met | Six headers in production, a strict CSP sent by the server ([ADR-0019](../adr/0019-csp-ketat-dikirim-penyaji.md), [ADR-0029](../adr/0029-hsts-digerbangi-produksi-tanpa-includesubdomains.md)); `Server`/`X-Powered-By` removed; no secrets in the repo; a non-root image |
| A06 | Vulnerable Components | Met | `bun audit --audit-level=low` in the CI `check` job; weekly Dependabot; `bun install --frozen-lockfile` in CI and in the image; the `bun run check:lockfile` gate |
| A07 | Identification & Auth Failures | Not applicable | There is no login. The build credential is a **machine** credential, refused when it takes the shape of a human session token — [`src/lib/awcms/tenant.ts`](../../src/lib/awcms/tenant.ts) |
| A08 | Software & Data Integrity | Met | `bun.lock` committed and gated in two layers; **GitHub actions pinned to commit SHAs and the base image pinned to a digest** since [ADR-0030](../adr/0030-aturan-tertulis-mendapat-pemeriksanya.md), guarded by `tests/versi-toolchain.test.mjs`. What remained of this category: the release SBOM (gap 9) |
| A09 | Logging & Monitoring | Out of scope | The server process writes no request log and **may not** start writing one without an ADR: an access log contains readers' IPs, and the ban on collecting readers' personal data applies in full |
| A10 | SSRF | Not applicable | The only outbound URL is `AWCMS_API_URL` from a trusted env, used only at build time. No reader input becomes a URL |

## OWASP ASVS 4.0.3 — the categories that genuinely have a surface here

| Category | The relevant items | State |
| --- | --- | --- |
| V5 Validation & Encoding | Output encoding at every sink | Met. Astro escapes by default; the only `set:html` accepts the output of `renderContentBlocks` and never a string from another source |
| V9 Communications | TLS in production | Met — TLS belongs to Traefik, HSTS is sent by the server in production (ADR-0029) |
| V14.4 HTTP Security Headers | CSP, `nosniff`, `Referrer-Policy`, `Permissions-Policy` | Met and **proven by tests**, not checked by eye |
| V14.4 | Headers leaking technology (`Server`, `X-Powered-By`) | Met — removed by `pasangHeader`, and their absence asserted over three response classes |
| V14.5 Validate HTTP Request Header | Not applicable | A request is not mapped onto a file by this repo's code — that belongs to the `@astrojs/node` adapter, and [`AGENTS.md`](../../AGENTS.md) forbids rewriting it precisely because the traversal defect class is already solved there |

## ISO/IEC 27001:2022 Annex A — the controls that touch code

Only controls that can be proven from the repo. Policy, personnel, and physical
controls are outside a template's scope.

| Control | How it is met here |
| --- | --- |
| A.8.8 Technical vulnerability management | `bun audit` in CI + Dependabot; the peer boundaries that matter are written explicitly in `.github/dependabot.yml` because `bun install` **warns** about a peer mismatch rather than refusing it |
| A.8.9 Configuration management | One configuration place (`src/config/site.ts` + `.env`); every variable the code reads must exist in `.env.example` along with the consequence of filling it in wrongly |
| A.8.24 Cryptography | Outside the repo's scope (TLS belongs to Traefik, hashing to `awcms`) |
| A.8.25 Secure development lifecycle | An ADR per decision; a changeset per iteration; six gates in CI |
| A.8.28 Secure coding | [`AGENTS.md`](../../AGENTS.md) §Security, with every rule naming the defect it guards |
| A.8.31 Separation of environments | The `AWCMS_TENANT_ID` assertion fails the build when **ANOTHER tenant's token** is installed — the class of mistake this control exists to prevent, and the only one that can genuinely be prevented from here. The example "a staging token in a production deployment" is deliberately no longer used: `awcms` ADR-0083 removed `"staging"` from the family's deployment profile union, so it names an environment that does not exist |
| A.5.7 / A.8.16 Threat intelligence & monitoring | **Not met, and partly deliberately.** An access log contains readers' IPs; see A09 above |

## NIST SSDF (SP 800-218 v1.1) — the practices that apply to a template

| Practice | State |
| --- | --- |
| PS.1 Protect all forms of code | Met — branch protection + review; no direct commits to `main` |
| PS.2 Provide a mechanism for verifying release integrity | Met — a deterministic CycloneDX SBOM travels in every tag since [ADR-0031](../adr/0031-sbom-cyclonedx-dari-lockfile-pada-rilis.md); regenerating on the same tag produces identical bytes, so its SBOM can be **verified** rather than merely trusted |
| PW.4 Use secure third-party components | Met — the lockfile committed, installs frozen, an audit in CI |
| PW.7 Review code | Met — a PR + a mandatory green CI |
| PW.8 Test executable code | Met — six gates, and every gate that **skips itself says so** |
| RV.1 Identify vulnerabilities on an ongoing basis | Met — Dependabot + `bun audit` + scheduled CodeQL over the JS/TS surface since [ADR-0032](../adr/0032-dua-celah-terakhir-ditutup-dengan-syarat-kejujuran.md), with its coverage (and its `.astro` limit) stated in every run summary |

## Performance

### The targets that were never written down

This repo has image budgets (home ≤ 250 KB, content page ≤ 100 KB) but **not one
target for the outcome a reader feels**. A byte budget and a reading experience are
not the same thing: a page can meet its image budget and still have a bad LCP
because its largest image is downloaded at low priority.

The Core Web Vitals targets, measured at **p75 of real visits**, not on one
Lighthouse run on a developer's laptop:

| Metric | The "good" threshold | Why it is the one chosen for this site |
| --- | --- | --- |
| LCP — Largest Contentful Paint | ≤ 2.5 seconds | The largest element on these pages is almost always an article illustration; their readers are on connections that cannot be relied on |
| INP — Interaction to Next Paint | ≤ 200 milliseconds | It replaced FID in March 2024. This site is very nearly JS-free, so this threshold should be met with room to spare — and if it is not, that is a signal JS has crept in |
| CLS — Cumulative Layout Shift | ≤ 0.1 | Image frames already carry `aspect-ratio: var(--ratio-visual)`, so their space is reserved before the image arrives. What could break it: a font loaded late — and this repo loads none |

**Since [ADR-0032](../adr/0032-dua-celah-terakhir-ditutup-dengan-syarat-kejujuran.md)
LCP and CLS are asserted in a LAB in CI** — on every PR of a site with a content
source; in the template repo that step does not run because there is nothing to
build. THREE of its limits must be read alongside it, and all three are stated:
(1) a lab measures pages, not readers — the p75-of-real-visits figures in the table
above are STILL not measured, because RUM is refused; (2) INP is not measurable in
a lab and is represented by its proxy, Total Blocking Time ≤ 200 ms; (3) what is
audited is a **sample** of pages — up to 10 URLs to a depth of 4, numbers CHOSEN in
`lighthouserc.json` (the lhci default silently stops at the 5 shallowest URLs and
never reaches a localised article page) and guarded by `tests/cwv-lab.test.mjs`; a
site needing more coverage raises them in that file.
**Do not write "meets Core Web Vitals" from a lab result.** Details in §Gaps
row 8.

### What is already right, and why

| Decision | Its performance consequence | Where |
| --- | --- | --- |
| No webfonts — `system-ui` as `--font-sans` | Zero font requests, zero FOIT/FOUT, zero contribution to CLS. It is recorded as a **privacy** decision in [`src/styles/global.css`](../../src/styles/global.css); it is also a performance decision | `src/styles/global.css` |
| No UI framework, no CSS framework | JS shipped is near zero on most pages | [`standar-teknis.md`](standar-teknis.md#the-stack) |
| `compressHTML: true` | Smaller HTML before transport compression | `astro.config.mjs` |
| Response compression uses a mature library | Not only gzip: `compression` v1.8 negotiates **Brotli** (RFC 7932) when a browser asks for it, and Brotli beats gzip by roughly 15–20% on HTML | [`server/penyaji.mjs`](../../server/penyaji.mjs) |
| `Cache-Control` in two rules | Hashed assets `immutable` for a year; HTML `max-age=0, must-revalidate` so a rebuild is immediately visible. Both per RFC 9111, and both **proven by tests** — including the GET/HEAD parity that once made `curl -I` report the wrong value | [`tests/penyaji.test.mjs`](../../tests/penyaji.test.mjs) |
| Content pulled at build time | Zero calls to the CMS when a reader asks for a page; the site stays live when `awcms` is down | [ADR-0018](../adr/0018-kontrak-build-token-mesin-dan-traversal-konten.md) |
| Media resolved **once per build** | A 300-article × 2-locale site does not turn into hundreds of HTTP requests at render time | [`src/lib/content.ts`](../../src/lib/content.ts) |

### A knowingly accepted cost, not to be read as an oversight

[ADR-0024](../adr/0024-seni-lokal-di-src-assets.md) chose `import.meta.glob` with
`query: "?url"` over `astro:assets`. Its consequence is stated there and repeated
here because it is a **performance** cost, not a code-shape cost: rasters are not
re-encoded and there is **no `srcset`**, so a 360px phone downloads the same file
as a 1920px desktop.

What makes it acceptable: this template's local artwork is SVG, and article images
come from `awcms` media, which serves the file an editor uploaded. What makes it
**stop** being acceptable: a site filling `src/assets/` with large raster photos.
Such a site needs to reweigh ADR-0024 for itself — and the image budget in
[`standar-teknis.md`](standar-teknis.md#performance) is the first place going over
will show up.

## Gaps: all ten closed — and their rows stay here

Ordered by consequence, not by effort. **Six were closed on 4 August 2026** — five
in the morning, the sixth (supply chain pinning) following that afternoon through
[ADR-0030](../adr/0030-aturan-tertulis-mendapat-pemeriksanya.md) — and **three more
on 5 August 2026**: the SBOM through
[ADR-0031](../adr/0031-sbom-cyclonedx-dari-lockfile-pada-rilis.md), static analysis
and lab Core Web Vitals through
[ADR-0032](../adr/0032-dua-celah-terakhir-ditutup-dengan-syarat-kejujuran.md) —
each with its checker. **The tenth was found and closed on 6 August 2026**, and it
is not a missing control but two rows in this very table: the checkers for gaps 2
and 3 had never once been executed in the repo where they were written. In this
repo a rule without its checker is a rule that will be broken, and that applies to
a rule coming from an external standard too — **and to a checker itself.**

A closed row **stays in the table**. Deleted, it would be proposed again as a new
finding six months later, and its checker would be loosened by somebody who does
not know why it is there.

| # | Gap | State | Its checker |
| --- | --- | --- | --- |
| 1 | `Strict-Transport-Security` not sent | **CLOSED** — [ADR-0029](../adr/0029-hsts-digerbangi-produksi-tanpa-includesubdomains.md): gated to production, without `includeSubDomains`. **It briefly reopened unseen from 6–14 August 2026**: the bundler folded a dotted `process.env.NODE_ENV`, so the artefact that served contained `produksi = false` and the sixth header was never sent even with `NODE_ENV=production` set | Three assertions in `tests/penyaji.test.mjs` over the SOURCE, **mutation-proven** — one runs backwards and that is the important one: HSTS is **not** sent outside production, and a gate that only checks "the header is present" would be green on a version that locks every developer's `localhost` for a year. Since 14 August 2026 there is a fourth assertion running the **artefact** (`dist/server/penyaji.mjs`, twice, `production` and not) — and it runs inside `docker build`, because the first three read the source, where the gate was always correct |
| 2 | No `fetchpriority="high"` on above-the-fold images | **CLOSED** — [`Ilustrasi.astro`](../../src/components/Ilustrasi.astro) sets it for a `hero`. `loading="eager"` alone is not enough: an `<img>`'s default priority stays Low until layout proves it is in the viewport | The `performa` gate in `scripts/audit-konten.mjs`: every `<img loading="eager">` in `dist/client` must carry `fetchpriority="high"`. Checked in the OUTPUT, so an `<img>` that did not go through the component is caught too |
| 3 | The image budget had no checker | **CLOSED** — 250 KB for the home page, 100 KB for a content page, measured for the first time since those numbers were written | The `performa` gate: it sums the bytes of the images this build actually PUBLISHES, per page. `awcms` media are not in `dist/client` and so are not weighed — a deliberate limit, named in its script |
| 4 | `awcmsGet` with no timeout | **CLOSED** — `AbortSignal.timeout`, 30 seconds by default, changed through `AWCMS_API_TIMEOUT_MS` | Two assertions in `tests/kontrak-awcms.test.mjs`, **mutation-proven**: a double that accepts a connection and then never answers (removing its signal makes that test hang, exactly the original defect), and a malformed limit value REFUSED rather than silently falling back to the default |
| 5 | Technology-leaking headers not verified | **CLOSED** — `Server` and `X-Powered-By` are removed by `pasangHeader`, not merely asserted: "not sent today" and "will not be sent" are two different things | Negative assertions over three response classes in `tests/penyaji.test.mjs`, **mutation-proven** |
| 6 | GitHub actions pinned to tags, the base image pinned to a tag | **CLOSED** — [ADR-0030](../adr/0030-aturan-tertulis-mendapat-pemeriksanya.md): four actions pinned to commit SHAs with a `# vX.Y.Z` comment Dependabot reads, the base image pinned to a digest | `tests/versi-toolchain.test.mjs`, **mutation-proven**. It closes the defect class the digest pin itself ADDED: when a tag and a digest are both present, Docker obeys the digest and the tag becomes a comment |
| 7 | No static analysis | **CLOSED** — [ADR-0032](../adr/0032-dua-celah-terakhir-ditutup-dengan-syarat-kejujuran.md) §A: `.github/workflows/codeql.yml` scheduled weekly + on changes, over the JS/TS surface. Its honesty condition is exactly what this column prescribed from the start: the `State the coverage` step writes into the run summary how many files were analysed and how many `.astro` were NOT — counted by `find` at run time, not written by hand | `tests/analisis-statik.test.mjs`: every action SHA-pinned + a version comment, the schedule present, and the coverage-statement step — along with its mention of `.astro` — impossible to delete silently |
| 8 | Core Web Vitals not measured | **CLOSED** — [ADR-0032](../adr/0032-dua-celah-terakhir-ditutup-dengan-syarat-kejujuran.md) §B: Lighthouse CI over a **sample** of `dist/client` (up to 10 URLs, depth 4 — a chosen limit, not the lhci default that silently stops at the 5 shallowest URLs) in the `build` job, conditioned on a content source like the other output gates — in the template repo it does not run, in every SITE it runs on every PR. LCP ≤ 2500 ms and CLS ≤ 0.1 at `error` level; INP is not measurable in a lab, so TBT ≤ 200 ms is used as a proxy and is CALLED a proxy | `tests/cwv-lab.test.mjs`, running in the template repo: the `lighthouserc.json` thresholds are PINNED to this document's numbers and all three of its coverage limits (depth, sample size, the 404 blocklist) are asserted explicitly — loosening any of them requires changing the test, which is visible in review; its CI step is conditioned and SHA-pinned |
| 9 | No SBOM on releases | **CLOSED** — [ADR-0031](../adr/0031-sbom-cyclonedx-dari-lockfile-pada-rilis.md): `scripts/sbom.mjs` derives CycloneDX 1.5 from `bun.lock` — deterministic, with no new dependency — and the releaser writes it BEFORE the release commit so `sbom.cdx.json` travels inside the tag | `tests/sbom.test.mjs`, **mutation-proven** over a synthetic lockfile: scoped packages, base64→hex hash conversion, deduplicated resolution paths, and an unknown entry REFUSED rather than skipped — a silently incomplete SBOM answers "not affected" with confidence. Its release step is asserted structurally so it cannot disappear silently |
| 10 | The checkers for gaps 2 and 3 had never been executed in the repo where they were written | **CLOSED** — `tests/audit-konten.test.mjs`. Every output family in `scripts/audit-konten.mjs` — including both performance gates above — sits behind `if (existsSync("dist/client"))`, and `dist/client` is born from a build that needs a content source. In the template repo that meant ~330 lines of checker that **never ran**: not in CI, not in `bun test`, nowhere. Rows 2 and 3 read CLOSED on the basis of code nobody had ever run | 86 cases over a real fixture tree, run with the fixture as `cwd` so the script is tested **as it is**, with no test-only mode. Every gate proven both ways and **mutation-proven**: removing the `fetchpriority` requirement, equalising the content-page budget with the home budget, removing `src` deduplication, removing hreflang reciprocity, ignoring the catalogue namespace, treating unreadable dimensions as a pass, or deleting the "SKIPPED" note — each turns a different test red |
| 11 | No client asset byte budget — the family's reader surface was the one repo without one | **CLOSED** — `scripts/audit-aset.mjs`. `awcms` ADR-0101 gates its reader at 24,000 B; by its ADR-0070 THIS repo carries the family's public surface, so the repo with the tight reader budget was the one whose reader surface is an admin application. `lighthouserc.json` is real and does something else: it samples pages, runs only when a content source is configured (so **never for the template repo itself**), and cannot name the file that grew — an 8 KB regression sits comfortably under a 2500 ms LCP on a fast runner and is still felt on a phone on 3G. Two layers, following `audit-konten.mjs`: source always, output when `dist/client` exists, and the skipped layer SAYS SO. Budgets derived from measurement — article 29,510 B (script 5,809); search 32,358 B (script 9,963) — never copied from `awcms`, whose 24,000 is the reader slice of an ADMIN bundle | `tests/audit-aset.test.mjs`, 14 cases over a real fixture tree, both directions. The `public/` registry is enforced BOTH ways (an undeclared file AND an entry whose file is gone). Inline `<script>` bytes are asserted to count — the first budget written for this gate was 9,000, from a hand count that MISSED some of them, and the gate corrected it on its first run; a script violation is asserted NOT to name a CSS file, which the first version did |

**Nothing is open today — and that sentence has limits that must be read with
it.** Gaps 7 and 8 were held for a long time precisely because the easy closure is
a closure that lies; both were eventually closed in the form this table itself
prescribed, with their honesty conditions guarded by tests that **run in the
template repo** — the old objection "a gate that cannot be proven where it was
written will rot" is answered, not ignored
([ADR-0032](../adr/0032-dua-celah-terakhir-ditutup-dengan-syarat-kejujuran.md)).
Its limits: `.astro` is still not statically analysed (and the CodeQL run summary
says so on every run), p75 of real visits is still not measured (RUM is still
refused — a lab measures pages, not readers), and this table's State column still
**cannot be machine-gated**. Ten out of ten does not mean "finished forever"; it
means every KNOWN gap has a checker, and the next finding enters this table as
number eleven — rather than replacing an old row.

**Gap 10 is the proof that this sentence applies to this table itself.** It was
found on 6 August 2026 with one question that should have been asked the day gaps 2
and 3 were closed — *who has ever run its checker?* — and the answer was "nobody, in
this repo". Its two limits are stated too, because a closure larger than its reality
is precisely the defect class this table fights:

- **A fixture is not a site.** Those 86 cases prove the gate's LOGIC over synthetic
  output shaped like Astro output. They do not prove that a real `astro build`
  emits the same shape — only a SITE can prove that, and there
  `bun run audit:konten` after a build does run on every PR.
- **One line in its script is still ungated, and that is written in its test.** The
  `mailto:|tel:|data:|javascript:` filter cannot be mutated from outside —
  `internal()` already refuses those schemes first, so removing it changes not one
  result. Its test guards its behaviour rather than its line, and that difference is
  named there rather than counted as coverage.

Its family context, as of 5 August 2026: `awcms` **already** measured Core Web
Vitals in a lab that same day (its ADR-0067 Option D — LCP+CLS on the `/login`
page, zero visitor data), so both repos now measure the LAB and neither measures the
field. **ADR-0067's status over there is now `Accepted (not yet implemented)`**: its
RUM part was decided on 8 August 2026 — Option B, aggregation at the entry point
with no raw row per visit — and has not been built; here RUM is already refused as a
posture. The remaining difference therefore has a known expiry date: once Option B
lands, one repo measures the field in aggregate and this one does not.

## What is deliberately NOT adopted

Equally important to write down: a control recommended by a standard and
**refused with its reasoning** will not be proposed again six months later as a new
finding.

> **Two of the five refusals below are refused for reasons that have an expiry
> date, and that date is not on a calendar.** CORP/COOP is refused because this
> repo "has no session to fence off", and SRI because "there are no cross-origin
> resources". Both are **premises, not principles** — and the first falls at the
> first site that switches on `permukaanAdmin`
> ([ADR-0034](../adr/0034-publik-secara-bawaan-admin-hanya-bila-dinyatakan.md)).
> Such a site must re-examine both before going live; see
> [`permukaan-admin-user.md`](permukaan-admin-user.md) §3. The other three — CSP
> reporting, RUM, and analytics that tracks individuals — are refused on
> **principle** (the ban on collecting reader data) and are unchanged by any
> surface.

- **CSP reporting (`report-to` / `report-uri`).** It sends a report containing the
  URL a reader currently has open to a collector. This repo forbids collecting
  reader data, and that ban has no "but this is for security" exception. A site
  with a collector of its own may add it through an ADR in that site's repo.
- **Blanket `Cross-Origin-Resource-Policy: same-origin`.** It would block other
  sites from embedding images from this one — behaviour some sites may want and
  others certainly do not. It is not a safe default for a **template**, and putting
  it here means deciding for a site that does not exist yet. `awcms` now sends it
  (along with `Cross-Origin-Opener-Policy`) to fence off its admin sessions, and a
  comment in its own code states that its reason does not carry over here: this repo
  has no session to fence off, and an HTML page is a navigation — which CORP does
  not govern. This refusal is now **recorded on both sides**: `awcms` ADR-0069 makes
  it a named divergence with a `reviewDate` of 2027-02-04, so it will not be
  proposed again as a finding in six months.
- **Subresource Integrity.** Not one cross-origin resource is loaded by these
  pages. SRI without external resources is an attribute that guards nothing.
- **RUM-based analytics for measuring Core Web Vitals.** It collects reader data.
  Gap 8 above was therefore closed through **lab** measurement in CI, with its
  limitations stated: a lab measures pages, not readers.
- **Rate limiting and a WAF.** They belong to Traefik/Coolify, not to the server
  process. Putting them here means two places deciding the same thing.

## The relationship with `ahliweb/awcms`

> **Two repos, two numbers — and the difference is now settled, on both sides.**
> The `awcms` assessment of 4 August 2026 (`docs/awcms/repo-assessment-2026-08-04.md`
> §4) recorded this repo as calling **six** of its surfaces; in reality this repo
> calls **three**, and since
> [ADR-0030](../adr/0030-aturan-tertulis-mendapat-pemeriksanya.md) the list on this
> side is extracted from the code and gated in both directions.
>
> `awcms` answered the same day with ADR-0065: the consumer contract is frozen on
> its side (`bun run api:consumer-contract:check`, part of its `check` chain), with
> a list **derived from grepping this repo** — three paths the build genuinely calls
> (`/blog/posts`, `/media/objects`, `/media/public-origin`) separated from two only
> PROMISED by an ADR (`/auth/session` for a BFF that does not exist,
> `/access/machine-credentials`, how a human issues a build token — and since
> 13 August 2026 that surface has an `/admin/machine-credentials` screen over there,
> and can also issue WRITE-class credentials that **must not** be used for a build
> token), while `GET /blog/posts/{id}`, removed by ADR-0018, was not frozen with
> them. (The ADR-0065 prose says "6 path"; its fixture freezes FIVE — the number
> here follows the code.) Its freeze walks the `$ref` closure so referenced schemas
> are frozen too, and its rule is an additive subset: adding an optional field
> passes, removing one or changing a type is red — in `awcms` CI, before this repo's
> build can break. A fixture regeneration over there is the signal that this repo
> must change **in the same breath**.

This repo **consumes** `awcms` and serves no API at all, so most family controls —
RLS, default-deny ABAC, idempotency, the audit trail, synchronisation HMAC — are
enforced there and have no equivalent here. That does **not** mean they are
irrelevant: an `awcms` decision changes what is true here. The four middle rows of
this table come from that side's ADR wave of 4 August 2026 (0065–0068); its three
bottom rows from the round of 5 August 2026, when both repos closed their last
cross-repo gaps and stopped holding different versions of the same fact.

| The `awcms` decision | Its consequence in this repo |
| --- | --- |
| ADR-0049/0050 — machine credentials + BFF session handover | Already absorbed: the tenant from the token, with no tenant header ([ADR-0018](../adr/0018-kontrak-build-token-mesin-dan-traversal-konten.md)) |
| ADR-0071 — the public URL vocabulary split; **superseding ADR-0059** | **Already absorbed** ([ADR-0036](../adr/0036-news-adalah-kosakata-repo-ini-dan-sebuah-tab-yang-memikulnya.md)). This row previously read "not yet absorbed" and described the `/news/**` route family in `awcms` — all four were **deleted** over there on 8 August 2026 and now 301 to `/blog/{tenantCode}/**` — **except** for a tenant with `legacyTenantRouteEnabled: false`, which has already switched off its entire public content surface and is therefore still answered 404 rather than given a 301 towards a certain 404 (`awcms` ADR-0071 §4 item 3). The vocabulary is now one family per repo: `/blog/**` is `awcms`'s (path-scoped, its permanent vocabulary), `/news/**` is this repo's, in the shape of a tab. The question "when to use `awcms-astro` instead of the `awcms` public surface" stays real and is still answered by [`README.md`](README.md#when-to-choose-awcms-astro) — what is chosen here is **zero calls to the CMS when a reader asks for a page**, not a URL shape |
| ADR-0061 — host-resolved surfaces may be cached at the edge | Not directly applicable: this site does not pass through Varnish. What **does** apply is its reasoning — a cacheable 404 is a second observation channel. This repo has no 404 branch distinguishing tenants, so that defect class cannot occur here |
| ADR-0062 — skills gated against the code they describe | **Fully absorbed since 5 August 2026.** `bun run audit:dokumen` checks the file paths named by `.claude/skills/` exactly as it checks `docs/`, and now its rule 2 as well: every `ADR-NNNN` citation must resolve to its file, unless marked as another repo's in the same paragraph. Its first run immediately found eleven unmarked citations |
| ADR-0065 — the `awcms-astro` consumer contract frozen over there | **The inter-repo boundary is now guarded from both directions.** This side gates the list of surfaces called (ADR-0030); that side freezes their shape (five paths + their `$ref` closure, an additive subset). A non-additive change to a surface the build uses is red in `awcms` CI first — and a regeneration of its fixture is an explicit invitation to update this repo simultaneously |
| ADR-0067 — Core Web Vitals collection (`Accepted (not yet implemented)` since 8 August 2026) | **Lab parity holds, but the sentence "only the field decision remains" is now answered — and its answer is a NEW posture divergence.** `awcms` landed its Option D the same day as gap 8 here (5 August 2026): LCP+CLS measured in a lab, zero visitor data, INP not claimed. On 8 August 2026 that side **decided Option B** — aggregation at the entry point, buckets per (tenant, route pattern, day), with not one raw row per visit — and has not built it. That means the family sentence "both repos measure the LAB and neither measures the field" has a **known expiry date**: once Option B is built, one repo measures the field in aggregate and this one does not, because RUM here is **permanently refused** ([ADR-0032](../adr/0032-dua-celah-terakhir-ditutup-dengan-syarat-kejujuran.md) §B). That difference **has no entry yet** in that side's family manifest; it deserves one when Option B lands, and this repo cannot write it itself |
| ADR-0068 — the family standards posture: editions pinned, divergences recorded | **The sentence "we follow `awcms`'s editions" finally has an address.** The edition pin (Top 10 2021, ASVS 4.0.3, API Security 2023, ISO 27001:2022, SSDF v1.1 — **five**, and ISO/IEC 25010:2023 is not one of them) is now an ADR decision with a review date of 2027-02-04, and HSTS without `includeSubDomains` here (ADR-0029) is recorded as a named divergence in that side's `awcms-family-compatibility.yaml` — with a `reviewDate` that turns `awcms` CI red when it falls due, rather than a note that rots silently. **There are FIVE entries, not two**, and the fifth had never been mentioned in this repo: `astro-files-not-type-checked`. Its direction runs opposite to the assumption — `astro check` runs **here** and not there, because `@astrojs/check` requires the TypeScript 6.x programmatic API while `awcms` is already on 7.0.2. Its divergence note leans explicitly on this repo still being at `^6.0.3`, so raising TypeScript here **kills the `Type check` gate** and voids half of that note at once. That is now an ADR decision in this repo: [ADR-0037](../adr/0037-pin-typescript-6-adalah-syarat-hidupnya-gerbang-astro-check.md), with its checker in `tests/versi-toolchain.test.mjs` |
| ADR-0069 — the COOP/CORP difference recorded as a family divergence | **The CORP refusal here stops reading as an oversight.** `awcms` sends COOP+CORP `same-origin` to fence off its admin sessions; this repo sends neither, and both sides now write their reasoning: CORP is refused as a template decision (deciding image embedding for a site that does not exist), and COOP has no session to fence off because every page here is public navigation. The `coop-corp-cross-origin-isolation` entry with a `reviewDate` of 2027-02-04 in that manifest is what brings it back to the table. **The direction of parity is not changed**: a derived site needing both decides so through an ADR in its own repo, not by copying the `awcms` values into this template |
| Its gap C3 closed — inherited compression must now be declared | The ownership difference stays and stops being invisible: this repo's server compresses itself (negotiated Brotli/gzip, `server/penyaji.mjs`), while `awcms` inherits it from Cloudflare — and `bun run security:readiness` over there now requires a marked block naming the compressing tier along with its consequence outside the CDN. What a derived site needs to read: the word "compressed" means two different things in the two repos — here it belongs to a process the repo ships, there to a layer the operator rents |
| ADR-0070 — the family roles: this repo carries public **and USER admin** | **The open request in [ADR-0034](../adr/0034-publik-secara-bawaan-admin-hanya-bila-dinyatakan.md) §Relationship is finally answered.** That ADR stated its tension with `awcms` ADR-0051 ("every admin screen … is built in the `awcms` repo") and then closed with "this repo cannot write it itself". `awcms` ADR-0070 **NARROWS** ADR-0051 rather than superseding it: the axis shifts from AUDIENCE to **what is managed**, SYSTEM admin stays there, USER admin may live here when a site declares it, and **none of ADR-0051's three replacement gates is loosened at all**. The entry `admin-user-surface-in-awcms-astro` with a `reviewDate` of 2027-02-04 enters that manifest — and what is reviewed on that date is **not** whether USER admin may live here, but whether its **boundary** is still in the same place. What a derived site must read: switching on `permukaanAdmin` takes on sessions, CSRF, and caches that must be separated — a cost that is chosen, not inherited |
| Its static assets once went out WITH NO headers — and its fix is this repo's server shape | **A pattern from this side was adopted over there, and it is worth reading as a warning.** On 10 August 2026 `awcms` found the `@astrojs/node` adapter composing its handler as `staticHandler(req, res, () => appHandler(req, res))` — the static handler runs **first**, and `appHandler` (the only one running middleware) is only a fallback for when the file does not exist. As a result every `dist/client` file over there went out with no CSP, `X-Content-Type-Options`, `X-Frame-Options`, `Referrer-Policy`, `Permissions-Policy`, or COOP/CORP; measured on a real build, not inferred. Its fix installs the headers as a **FLOOR before delegating** — exactly the shape of [`server/penyaji.mjs`](../../server/penyaji.mjs) since [ADR-0016](../adr/0016-penyajian-bun-di-belakang-traefik-tanpa-nginx.md). **Never "simplify" the server here by calling the adapter's handler directly**: that is precisely the defect that side has just paid for, and it is green on every gate that does not measure a real response |
| ADR-0073 — `suspended` is a SERVICE status, not a login status | **A NEW build failure mode, and it is not code work.** A `suspended` **or** `inactive` tenant is answered `403 TENANT_SUSPENDED`, and its refusal now reaches **machine credentials** — not only human sessions. It is decided before permissions are looked up, so no token scope fixes it: the build fails completely, zero files published. Absorbed as a named refusal in [`integrasi-awcms.md`](integrasi-awcms.md) and [`AGENTS.md`](../../AGENTS.md) §Data source, so it is not misdiagnosed as a revoked token |
| ADR-0084 — an entitlement REFUSES, it never grants | The same refusal shape (`403 ENTITLEMENT_REQUIRED`, above the grant lookup), but it **cannot yet reach this build**: entitlements are decided per MODULE, and the only `awcms` module declaring one today is `tenant_domain` (`custom_domain`, in the DEFAULT package). This build only calls `blog_content` and `media_library`. The same ADR raised the family's `moduleDescriptorContractVersion` to **3.1.0** through the optional `requiresEntitlement` field — a pure addition, zero work here |
| ADR-0083 — the `awcms` template deploys to ONE environment | **The family vocabulary narrows.** The member `"staging"` was **removed** from the module deployment profile union (now `development \| production \| offline-lan`) — a capability withdrawal, and therefore MAJOR. Its consequence here is purely editorial and already done: this document no longer narrates "a staging token" as an environment on a par with production |
| ADR-0092 — machine credentials may WRITE | **A security premise of this repo falls, and it is quoted in three files.** "Machine credentials cannot write" stops being a property of the CLASS: an action ceiling of `create`/`update` in code (not a column), mandatory CIDR binding, **refused when `clientIp` is unknown**, a maximum age of 30 days instead of 365. Credentials issued before its migration stay read-only with no backfill. This repo's build token still cannot change anything — but because its `allowed_write_actions` is empty, that is a property of its **row**. Absorbed in [`.env.example`](../../.env.example), the [ADR-0018](../adr/0018-kontrak-build-token-mesin-dan-traversal-konten.md) banner, and [`README.md`](../../README.md) |
| ADR-0093 — a suspended partner STOPS reaching | **A CONDITIONAL build failure mode, and its condition is who issued the token.** `403 PARTNER_SUSPENDED` refuses a **delegated** actor at the chokepoint, per request. A machine credential inherits the `principal_kind` of its service account, and nothing in that side's issuing path forbids a service account from being a delegated tenant user — the shape that appears when an agency builds its customer's site. The rule is operational, not code: issue the build token on a service account belonging to the **site's** tenant. Absorbed in [`AGENTS.md`](../../AGENTS.md) §Data source and the diagnosis table in [`deploy-coolify.md`](../deploy-coolify.md) |
| ADR-0094 — a data subject is answered PER TENANT | **Zero code work, one obligation that must be stated.** A static site holds a **copy**: an erasure or anonymisation carried out in `awcms` does not touch an already-published file until the next build, and a copy already distributed can live longer still (CDN caches, the git history of `dist/` if a site commits its output). **That obligation is now LIVE**, and the sentence that used to stand here — *"this template publishes zero per-person data"* — is retired by [ADR-0042](../adr/0042-a-byline-is-the-first-per-person-data-this-template-publishes.md). Since `awcms` ADR-0109 an author may opt into a public byline, and this template renders it on all three surfaces that name an author: the article page, the JSON-LD `author` (now a `Person` when there is one), and the article's Atom entry. What bounds it is the opt-in and ADR-0042 Decision 3: the only per-person datum published is a name a person chose to publish, carrying no `@id`, `url`, `sameAs`, `<uri>` or `<email>` — gated by `tests/schema.test.mjs` and `tests/feed.test.mjs`. An article whose author did not opt in still carries organisation attribution, and the absence renders as no byline row rather than the publisher's name. So **a site publishing bylines must be able to trigger a rebuild**, and that is stated rather than gated: nothing in this repo can observe an erasure in `awcms`. The family module descriptor contract rose to **4.0.0** — zero work here, this repo declares no module descriptor |
| ADR-0098 — the cache key carries the locale, in the PATH | **A caching decision over there, and a posture decision here — with the two going opposite ways on purpose.** `awcms` moved its public content URL to `/{locale}/blog/{tenantCode}/**` because `vcl_hash` keys on `(host, url)` and a cookie-selected body under one key cross-serves readers. This repo does **not** adopt the prefix: a static build writes one file per URL and `server/penyaji.mjs` reads `req.url` and nothing else, so the key and the body already agree and the prefix would break every indexed default-locale URL to buy a property already held. What **is** adopted is that ADR's decision 2 — `Vary: Cookie` and `Vary: Accept-Language` REFUSED on every response, refused rather than stripped — now [ADR-0041](../adr/0041-locale-stays-at-the-root-and-two-vary-names-are-refused.md) with its checker in `tests/penyaji.test.mjs`. **A family divergence that needs an entry** in that side's `awcms-family-compatibility.yaml`, and this repo cannot write it |
| The rest of the ADR wave 0072–0099 | **Read in full, and not relevant to the static build path** — 0072 (decision log retention), 0074/0077 (the outbox, sync pull), 0075 (SSE), 0076 (retention descriptors), 0078–0082 (grants, user groups, invitations), 0085–0091 (identity, lockout, MFA, tenant selection, partners, delegated access, attribution), and from the 14–15 August 2026 tail 0095/0096/0099 (the reader's language, the self-service account surface, the sign-in address). All of them touch **authenticated** surfaces, and precisely for that reason they matter to this repo's SECOND role: their consequences are recorded in [`permukaan-admin-user.md`](permukaan-admin-user.md) §5, not here. 0097 (English as the source language) is the same decision this repo took as [ADR-0039](../adr/0039-english-is-the-source-language.md), reached independently and with the same mechanism. This row's silence therefore means "examined and not relevant", not "not yet examined" |
| Its gap C16 closed — CodeQL stops claiming `.astro` | The coverage-statement pattern [ADR-0032](../adr/0032-dua-celah-terakhir-ditutup-dengan-syarat-kejujuran.md) §A established here was adopted over there: its workflow comment had briefly said "TypeScript/Astro source" while CodeQL has no Astro extractor. The family posture is therefore now one identical sentence in two repos: **`.astro` is statically analysed nowhere, and each repo says so in its own run summary** — rather than leaving a reader to infer it |

That `awcms` ADR-0062 gap was closed on 5 August 2026, exactly as cheaply as
expected: its gate already read all of this repo's markdown and already had the ADR
index. Its checker is proven in both directions in
`tests/audit-dokumen.test.mjs`, and its first run found eleven citations whose
reader could not tell whose they were. That work is recorded in
[ADR-0028](../adr/0028-jangkar-standar-performa-dan-keamanan.md) §E.

## How to use this document in a derived site

Three lines change their meaning the moment this template becomes a site:

1. **Every "not measured" becomes a question that must be answered.** In the
   template repo the output gates skip themselves because there is no content
   source. In a site that means the gate **did not run**.
2. **HSTS is already sent by the server in production** ([ADR-0029](../adr/0029-hsts-digerbangi-produksi-tanpa-includesubdomains.md))
   — what becomes your site's is making sure `NODE_ENV=production` is set (the
   `Dockerfile` image sets it; a deployment not going through that image sets it
   itself) and **not installing a second HSTS policy in Traefik**: two policy
   sources overwriting each other is the quietest way to end up with no policy.
   `includeSubDomains` remains your site's decision, not the template's — its
   reasoning is in ADR-0029, and this difference is recorded as a named divergence
   in the `awcms` family manifest (its ADR-0068 §B).
3. **Every authenticated surface changes this matrix, and there are TWO doors to
   it.** A credentialed surface targets WCAG 2.2 AA and brings back every OWASP
   category written "not applicable" above — A01, A07, and A09 in particular —
   along with sessions, CSRF, cache separation, and a re-examination of the
   COOP/CORP and SRI posture. The first door is the Jualanku BFF, its prerequisites
   in [`jualanku/04-kesiapan.md`](jualanku/04-kesiapan.md); the second is
   `permukaanAdmin` for USER admin, and all of its consequences are in
   [`permukaan-admin-user.md`](permukaan-admin-user.md). What decides is not the
   surface's name but the existence of a path carrying credentials.
