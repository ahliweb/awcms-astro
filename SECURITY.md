🇬🇧 English (source) · 🇮🇩 [Bahasa Indonesia](SECURITY.id.md)

# Security Policy

## Reporting a vulnerability

**Do not open a public issue for an exploitable vulnerability.**

Report it through [GitHub Security Advisory](https://github.com/ahliweb/awcms-astro/security/advisories/new) (a private route). Include reproduction steps, the impact you estimate, and the version/commit you tested.

We aim for an initial response within **3 working days** and a fix for a confirmed vulnerability within **14 working days**, depending on its severity.

## This repo's attack surface

Its output is **static** (`output: 'static'`): no database, no authentication, and no form that sends data anywhere. The vulnerability classes that usually dominate — SQL injection, session leakage, per-user access control — do not apply here.

**"No server runtime" is NOT part of that claim, and was once mistakenly written here as though it were.** Since [ADR-0016](docs/adr/0016-penyajian-bun-di-belakang-traefik-tanpa-nginx.md) the build output is served by a Bun process ([`server/penyaji.mjs`](server/penyaji.mjs)) behind Traefik. That process is a surface, and it is what holds every response header — which makes it the part most deserving of examination, not a part that is absent.

What remains relevant:

| Area | Risk |
| --- | --- |
| Dependencies | Transitive vulnerabilities in the build chain. Guarded by `bun audit --audit-level=low` in CI; must be zero before a release |
| Content from the CMS | Article bodies come from `awcms` as **structured blocks**, not as HTML or markdown. [`src/lib/content-blocks.ts`](src/lib/content-blocks.ts) assembles every element from escaped text and fixed tags, so there is no raw-markup path — adding an `html`/`raw`/`embed` block type voids that entire guarantee |
| The server | Security headers, CSP, and cache rules. Its only owner: `server/penyaji.mjs`; a second policy in Traefik or in `<meta http-equiv>` is the quietest way to end up with no policy at all |
| Build credentials | `AWCMS_API_TOKEN` is a read-only machine credential that carries its tenant. It is never prefixed `PUBLIC_` and therefore never enters the output; it **does** remain readable in the builder cache on the build machine |
| Outbound links | A `target="_blank"` link must carry `rel="noopener noreferrer"` |
| Assets | An SVG in `src/assets/` can reference external resources; it is `img-src` in the CSP that constrains it when the page is rendered |
| Release pipeline | The build and release scripts have write access to the repo |

## Controls, and their gaps

The full mapping to **OWASP Top 10 2021, OWASP ASVS 4.0.3, the OWASP Secure Headers Project, ISO/IEC 27001:2022 Annex A, and NIST SSDF SP 800-218** is in [`docs/awcms-astro/standar-performa-dan-keamanan.md`](docs/awcms-astro/standar-performa-dan-keamanan.md) ([ADR-0028](docs/adr/0028-jangkar-standar-performa-dan-keamanan.md)).

That document carries a **list of gaps**, and the list is deliberately public: all ten of its numbered gaps are now closed, and a closed row stays in the table together with its checker.

Two limits are stated plainly — not gaps, but conditions accepted knowingly: `.astro` files are not statically analysed (CodeQL does not parse them, and each run's summary says so), and Core Web Vitals are measured in a lab, not on real visits (RUM is refused because it collects reader data). Reporting either of them again adds no information; reporting its **concrete consequence** on a real deployment does.

One limit a reporter should know: `Strict-Transport-Security` is sent **only when `NODE_ENV=production`**. A deployment that does not set it gets no HSTS and nothing says so — that is knowingly accepted in [ADR-0029](docs/adr/0029-hsts-digerbangi-produksi-tanpa-includesubdomains.md), and the `Dockerfile` sets it.

## Binding rules

- **No secret, token, or credential** in code, commits, issues, or documentation. This repo needs none of them to run.
- **No third-party script, SDK, widget, or pixel** — including the official share buttons of social providers. Sharing uses ordinary `GET` links, so no reader data is sent before the reader clicks it themselves.
- **No collection of readers' personal data** (national ID, chassis number, engine number, licence plate, photographs of documents) through any form.
- **No analytics that tracks individuals.**
- `bun audit` must report zero vulnerabilities before a release.

## Not a security vulnerability

The following matter, but they are not security reports — use an ordinary issue:

- Incorrect tariff, requirement, or address information. This is a **content correction**, and it is prioritised through the routes in [`SUPPORT.md`](SUPPORT.md).
- A third-party site impersonating this one. Report it to that site's hosting provider; we have no control there.
