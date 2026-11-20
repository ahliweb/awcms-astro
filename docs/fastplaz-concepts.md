🇬🇧 English (source) · 🇮🇩 [Bahasa Indonesia](fastplaz-concepts.id.md)

# AWCMS-Astro public/USER-admin diagnostics — FastPlaz concepts, repository-specific architecture

## Document control
- **Version:** v1.1.0
- **Updated:** 2026-11-20
- **Status:** Proposed architecture / research only; not a production feature. Every adoption disposition below is a **proposal** until gate 9 passes in this repository.
- **Document Changeset:** Brought current with `main` as of 2026-11-20: USER admin stated as PLANNED, ordering aligned with ADR-0057 (Proposed), accessibility tied to the ADR-0056 gate, CSP and no-overlay boundary stated.
- **Owning issue:** [#164](https://github.com/ahliweb/awcms-astro/issues/164).

## Summary and confirmed local baseline
The web experience layer is an Astro public site, static at build time except three browser-side calls from the reader (search, page-view beacon, newsletter), with no database. A USER admin is allowed by ADR-0034 but is **PLANNED, not implemented**: `permukaanAdmin` is empty and no route sets `prerender = false` (see [ui-contract-inventory.md](ui-contract-inventory.md) §6). AWCMS holds SYSTEM admin, API, and authorization.

## Intent and candidate adaptation
Surface local lint/build diagnostics in structured form for trusted IDE or agent use. Preserve crawlability, canonical, sitemap and public route behavior; enforce USER/SYSTEM authorization boundaries.

## Authority and prohibitions
No new backend, no runtime agent SDK in public pages, no hidden access to production CMS secrets, no replacement with Lynx or FastPlaz views. No third-party overlay widget, and the strict CSP the server sends ([ADR-0019](adr/0019-csp-ketat-dikirim-penyaji.md)) stays as it is; nothing here may ask for a CSP relaxation.

## Existing related issues and anti-duplication
Architecture [#164](https://github.com/ahliweb/awcms-astro/issues/164). Consumer screens and contracts are inventoried in [#187](https://github.com/ahliweb/awcms-astro/issues/187) ([ui-contract-inventory.md](ui-contract-inventory.md)); check any follow-on against it instead of re-deriving it. Ordering of backend and UI work follows [ADR-0057](adr/0057-awcms-first-orders-ownership-and-contract-not-code-and-three-gates-separate-design-mock-and-release.md), which is **Proposed**, not yet a decision: a diagnostic built against a mock never stands in for integration against the real backend.

## Six concrete validation scenarios
1. Public article metadata and canonical are valid in built HTML.
2. Internal broken links are mapped to source location.
3. Incorrect locale canonical/sitemap fails check.
4. Anonymous public route is served as prebuilt static HTML; the only request-time calls are the three browser-side ones, and none reads tenant data directly.
5. USER editor cannot access SYSTEM admin endpoints (applies only once a site declares a USER admin; none does today).
6. Build diagnostic output excludes `.env` secrets.

## Proposed checks and test evidence
Run the documented Astro/Bun build and repository checks plus page-level crawl/SEO checks. Accessibility evidence is the axe gate in a real browser with no exceptions and a pinned version ([ADR-0056](adr/0056-accessibility-is-gated-by-axe-in-a-real-browser-with-no-exceptions.md)); a diagnostic report adapter does not replace or soften it. Any changed API contract first verified in AWCMS.

## Rollout / handoff
First inventory existing checks and add simple report adapters only when they close a measured gap.

## Source reference and limits
This document takes **concepts only** from [FastPlaz](https://github.com/fastplaz/fastplaz): [MCP/AI Agent Plane](https://github.com/fastplaz/fastplaz/blob/master/docs/MCP.md), [IDE workflow](https://github.com/fastplaz/fastplaz/blob/master/docs/AI_AGENT_by_FASTPLAZ.md), and [standalone operator concepts](https://github.com/fastplaz/fastplaz/blob/master/docs/STANDALONE-deployment.md). No Pascal, Lazarus, CGI, MVC/theme engine, or source-code copying. [FastPlaz license text](https://github.com/fastplaz/fastplaz/blob/master/LICENSE.txt) does not demonstrate explicit source-code permissions; independent implementation only.

## Cross-portfolio engineering invariants
Applies the **internal cross-portfolio standard**, alongside this repository's own AGENTS, ADR, CONTRIBUTING and current code reality. Human-approved **Gate 9 (cross-spec Definition of Ready)** precedes production feature code; human-approved **Gate 15 (release readiness)** precedes production. One issue/branch/PR per atomic scope. Never present a specification, green documentation check, or research as working production functionality.

Local MCP/tool connector, if ever required: loopback or authenticated IPC, host/Origin restrictions for HTTP, rotating scoped credentials, canonical-path and symlink protections, read/write/destructive approval tiers, no arbitrary shell, no default SQL/raw DB/secret access, bounded resource/time/cancellation, policy at actual tool/OS runtime, fail-closed unknown and redacted logs. Human sign-off for changes to authorization, production configuration or sensitive data.

## Relevant regulatory and control references
Evaluate applicability, not compliance by assertion: Indonesian UU 27/2022 (PDP), PP 71/2019 (PSTE), Perpres 95/2018 where SPBE applies; ISO/IEC 27001, 27002, 27005, 27017, 27018, 27034, 27701, ISO 22301, ISO/IEC 20000-1, ISO/IEC 42001, ISO/IEC 15408; OWASP LLM/Agentic Security, NIST AI RMF. Obtain independent control evidence and applicable edition before any claim of certification.

## Acceptance evidence rubric
For any follow-on: link spec/ADR and owning issue; record source commit, toolchain/runtime version, commands executed, actual error/result, denied access tests and evidence SHA. Mark unrun checks **NOT EXECUTED**. Approvals and publication/deployment status are distinct. No sensitive personal data or production secrets in prompts, logs or GitHub artifacts.

## Changelog
- **v1.1.0 — 2026-11-20:** Re-verified against `main`: USER admin is PLANNED (not implemented), added ADR-0057 (Proposed) ordering, ADR-0056 axe gate, ADR-0019 CSP and no-overlay boundary, link to the #187 inventory, and reworded scenarios 4 and 5 to match a static site.
- **v1.0.0 — 2026-11-10:** Documented evidence-backed, repo-specific adoption boundary, six practical cases and acceptance rubric.
