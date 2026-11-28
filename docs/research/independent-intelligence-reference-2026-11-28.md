🇬🇧 English (source) · 🇮🇩 [Bahasa Indonesia](independent-intelligence-reference-2026-11-28.id.md)

# Independent intelligence capability research

## Document control

- **Version:** v1.3.0
- **Last updated:** 2026-11-28
- **Status:** Research and reference only. All design items, controls, test IDs and requirement IDs below are **proposed**. No product code, no approved dependency, no Gate 9 or Gate 15 decision, and no permission to implement.
- **Tracker:** [#212](https://github.com/ahliweb/awcms-astro/issues/212) (stays open).
- **Evidence snapshot:** on `main` at takeover (head `3a693d5`), `AGENTS.md` was git blob `3debbf7ad824` and `README.md` was git blob `1875c568e0b5`. Blob prefixes are not commit SHAs. Full code, migration, issue-status and CI audits are still pending.
- **Provenance:** drafted by another AI session as a draft pull request; taken over, corrected and reference-checked on 2026-11-28 by an orchestrated AI session at the owner's choice. The takeover is not a merge approval.
- **Document Changeset:** Takeover revision: commercial-product names, prices, service hours and assessments of vendor claims removed; reference claims corrected or marked not verified; spike-test wording corrected; reference-verification section added.

## Evidence and intellectual property

This research was prompted by public descriptions of commercial products in data fusion, security assessment and AI-assisted accounting; it uses only general functional concepts and open standards. Descriptions by a vendor are self-report, not independently tested or certified, and none is relied on here. No license to reproduce any product has been established.

Use only public functional concepts, original requirements, and original specifications, design and implementation. No third-party code, UI, assets, text, datasets, brand, proprietary SDK, rules or reverse engineering of any third-party product; no unauthorized testing. Indonesian Law 28/2014 on Copyright ([BPK page](https://peraturan.bpk.go.id/Details/38690/uu-no-28-tahun-2014)) is cited for the distinction between protected program expression and ideas or methods (articles 40 and 41); the page opened at takeover shows the title and in-force status only, so the article reading is **not verified at takeover**. Patent, trademark, trade secret and contract review is still required. No dependency is introduced; every proposed dependency, model or data source needs version or SHA, license and SPDX identifier, commercial or SaaS rights, notice, transitive SBOM, owner approval and an exit plan before use. Do not reproduce licensed standards text.

## Repository disposition (proposed)

Reusable presentation only: public aggregates approved for publication at build time, and an optional declared USER admin. SYSTEM admin and the backend stay in `awcms`. No new authenticated routes without an ADR. This matches `AGENTS.md` on `main` at takeover (public pages are the primary function; zero authenticated surfaces declared; backend needs become modules in `awcms`).

## Controls, validation and evidence (proposed)

Keyboard operation, screen-reader labels, a table equivalent, contrast and WCAG 2.2 AA; a build-output secret and PII scan, a tenant-bound mock and no owner surface. No duplicate API or state, and no public export of private evidence.

Record requirements and threats, then control, versioned contract, reproducible synthetic test, evidence and SOP or monitoring. Baselines and thresholds are hypotheses until measured. Use least privilege, default-deny RBAC/ABAC and forced RLS where applicable, no trust in a client-provided tenant, no secrets or PII in logs, audited approvals and recovery. No live vendor, customer or public targets are tested. Verify data purpose, retention, lawful basis and controller or processor role. No cross-tenant data sharing without explicit scoped grants.

## Professional reference register

Status column is the result of read-only page checks on 2026-11-28 ("not verified at takeover" means the page could not be opened or showed no usable content; it is not a finding that the reference is wrong). No reference was added at takeover.

| Reference | Status at takeover |
| --- | --- |
| Hall and Llinas (1997), IEEE, data fusion ([DOI](https://doi.org/10.1109/5.554205)) | **Not verified at takeover** (the DOI redirects to a publisher page with no readable content) |
| Lewis et al. (2020), NeurIPS, retrieval-augmented generation ([paper page](https://papers.nips.cc/paper/2020/hash/6b493230205f780e1bc26945df7481e5-Abstract.html)) | Checked |
| W3C PROV-O ([TR](https://www.w3.org/TR/prov-o/)) | Checked: W3C Recommendation, 30 April 2013 |
| NIST AI RMF 1.0 ([DOI](https://doi.org/10.6028/NIST.AI.100-1)) | **Not verified at takeover** (resolved to a PDF whose title and date could not be read) |
| NIST Cybersecurity Framework 2.0 ([page](https://www.nist.gov/cyberframework)) | Page mentions CSF 2.0; its release year was not shown and is not stated here |
| NIST SSDF 1.1 ([SP 800-218](https://csrc.nist.gov/pubs/sp/800/218/final)) | Checked: final, February 2022. Revision 1 (v1.2) is an initial public draft released 17 December 2025 ([draft page](https://csrc.nist.gov/pubs/sp/800/218/r1/ipd)), not final |
| NIST SP 800-218A, AI profile ([page](https://csrc.nist.gov/pubs/sp/800/218/a/final)) | Checked: final, July 2024 |
| NIST SP 800-61 Rev. 3, incident response ([page](https://csrc.nist.gov/pubs/sp/800/61/r3/final)) | Checked: final, April 2025, CSF 2.0 profile |
| OASIS STIX 2.1 ([spec](https://docs.oasis-open.org/cti/stix/v2.1/os/stix-v2.1-os.html)) | Checked: OASIS Standard, 10 June 2021 |
| OWASP ASVS 5.0.0 ([project page](https://owasp.org/projects/asvs)) | Checked: listed as 5.0.0 (stable); release date not shown and not stated |
| WCAG 2.2 ([TR](https://www.w3.org/TR/WCAG22/)) | Checked: W3C Recommendation, 12 December 2024 |
| FIRST CVSS v4.0 FAQ ([page](https://www.first.org/cvss/faq)) | Checked: base scores are not risk |
| FIRST EPSS ([page](https://www.first.org/epss/), [research](https://www.first.org/epss/research)) | Checked: probability a published CVE is exploited in the wild in the next 30 days |
| Jacobs et al. (2021), EPSS ([DOI](https://doi.org/10.1145/3436242)) | **Not verified at takeover** (publisher refused access) |
| CISA [KEV catalog](https://www.cisa.gov/known-exploited-vulnerabilities-catalog) and [SSVC](https://www.cisa.gov/ssvc) | Pages exist; contents not read beyond the title |
| NIST SP 800-115 ([page](https://csrc.nist.gov/pubs/sp/800/115/final)) | Checked: final, September 2008 |
| NIST SP 800-52 Rev. 2, TLS ([page](https://csrc.nist.gov/pubs/sp/800/52/r2/final)) | Checked: August 2019 |
| NIST SP 800-92, log management ([page](https://csrc.nist.gov/pubs/sp/800/92/final)) | Checked: final, 13 September 2006. Revision 1 is still a draft; its draft date is not shown |
| NIST SP 800-137 ([page](https://csrc.nist.gov/pubs/sp/800/137/final)) | Checked: final, September 2011 |
| NIST SP 800-53 Rev. 5, Release 5.2.0 ([page](https://csrc.nist.gov/pubs/sp/800/53/r5/upd1/final)) | Partly checked: the page carries Rev. 5 (final 2020, update 1) and notes Release 5.2.0 dated 27 August 2025 as the latest release; Release 5.2.0 is not the version the page itself describes |
| NIST SP 800-124 Rev. 2 ([page](https://csrc.nist.gov/pubs/sp/800/124/r2/final)) | Checked: final, 17 May 2023 |
| NIST SP 800-101 Rev. 1 ([page](https://csrc.nist.gov/pubs/sp/800/101/r1/final)) | Checked: final, May 2014 |
| RFC 5424, syslog ([page](https://www.rfc-editor.org/info/rfc5424/)) | Checked: March 2009 |
| OpenTelemetry logs data model ([page](https://opentelemetry.io/docs/specs/otel/logs/data-model/)) | Checked: page exists |
| RFC 9846, TLS 1.3 ([info](https://www.rfc-editor.org/info/rfc9846/)) | Checked: July 2026; obsoletes RFC 8446 |
| BCP 195 ([info](https://www.rfc-editor.org/info/bcp195/)) | Checked: BCP 195 comprises RFC 8996, RFC 9325 and RFC 9852 (July 2026, updates RFC 9325). RFC 9325 is also updated by RFC 10015 (July 2026, deprecating obsolete TLS 1.2 key-exchange methods), which is **not** part of BCP 195 |
| RFC 9525, service identity in TLS ([page](https://www.rfc-editor.org/rfc/rfc9525.html)) | Checked: November 2023; obsoletes RFC 6125 |
| Denning (1987), IEEE TSE ([DOI](https://doi.org/10.1109/TSE.1987.232894)) | **Not verified at takeover** (DOI redirect without readable content) |
| ISO/IEC catalogue entries: 27001, 27002, 27005, 27017, 27018, 27034-1, 27701, 15408-1, 20000-1, 22301, 42001, 23894, 25010, 27035, 27036-3, 27037 ([ISO catalogue](https://www.iso.org/standard/iso-iec-27000-family)) | **Not verified at takeover** (the catalogue refused access). Edition years from the draft are not stated here; check each edition on the catalogue before use. Public catalogue metadata only; no certification, compliance or full clause audit is claimed |
| Indonesian PDP Law 27/2022 ([BPK page](https://peraturan.bpk.go.id/Details/229798/uu-no-27-tahun-2022)) | Partly checked: the page shows metadata, abstract and court rulings; the article text (including the notification window attributed to article 46) is **not verified at takeover** |
| Government Regulation 71/2019 ([page](https://jdih.komdigi.go.id/produk_hukum/view/id/695/t/common)) | Checked: title and number only |
| Presidential Regulation 82/2022 on vital information infrastructure ([page](https://peraturan.bpk.go.id/Details/211029/perpres-no-82-tahun-2022)) | Checked: title and number only |
| Indonesian Law 28/2014 on Copyright, WIPO copy ([page](https://www.wipo.int/wipolex/en/legislation/details/15600)) | Checked: title only; article 41 not read |

Review applicable ITE law, sector laws and current implementing rules before release.

## Next gate

Follow the internal cross-portfolio 18-step lifecycle: discovery and UX, privacy and threat model, data and authorization, algorithm and contracts before Gate 9. Only the research issue is authorized now. Validate repository-specific CI, index, changeset and project board, milestone and dependencies during review; consumer UAT and Gate 15 come before production. Rollback is removal of this document (no runtime effect); future features need tested recovery or rollback and monitoring. No CI or test execution is claimed for this research.

## Security capability follow-up research (2026-11-28)

Status: research only; no implementation gate, no third-party IP and no dependency admission. Product pages of a commercial offering were consulted at drafting time; this revision keeps only the functional concepts and drops the vendor's names, prices, service hours and claims. The concepts used are: ownership checks before assessment, assessment versus monitoring, triage and retest, controlled incident response, privacy assessment, and reporting by rights-holders. These are functional concepts only; no copy of any UI, code, scoring formula, text, proprietary API, assets, scan templates or data; no account, no target testing and no download of any vendor internals. Automated monitoring does not imply a staffed analyst service. A data-residency statement by anyone is not proof of the location of all processing; review subprocessors, transfers, deletion and contracts separately. PDP readiness is not certification.

### License admission register (observed on the default branch, not a pinned release)

Checked by opening the license or README file on 2026-11-28; this is not approval of any release.

| Candidate | Evidence and proposed disposition |
| --- | --- |
| ZAP | Apache-2.0 ([LICENSE](https://github.com/zaproxy/zaproxy/blob/main/LICENSE)); candidate; check add-ons and NOTICE |
| Nuclei | MIT ([LICENSE](https://github.com/projectdiscovery/nuclei/blob/dev/LICENSE.md)); candidate, no new dependency |
| Nuclei templates | MIT official collection ([LICENSE](https://github.com/projectdiscovery/nuclei-templates/blob/main/LICENSE.md)); review provenance, signatures and safety separately; no unknown third-party templates |
| testssl.sh | GPL-2.0 ([repository](https://github.com/testssl/testssl.sh)); hold until distribution and integration review |
| Wazuh | Mixed ([README](https://github.com/wazuh/wazuh/blob/main/README.md)): the engine is AGPL-3.0-or-later, certain shared libraries are GPL-2.0-only OR AGPL-3.0-or-later, the rest GPLv2; inspect all packages, indexer, dashboard, agent and the actual release; HOLD |
| MVT | Custom consent-restricted license, MVT License 1.1 ([LICENSE](https://github.com/mvt-project/mvt/blob/main/LICENSE)); HOLD; requires explicit, informed, non-coerced data-owner consent; separate IOC licenses |

No tool is approved, installed or bundled. Before an ADR, pin release or tag or SHA, digest, transitive SBOM, license obligations and NOTICE, distribution and network-use terms, dataset and feed terms, support, exit plan and legal review. Process separation does not erase license obligations. Prefer the approved native foundation; external adapters only after a gate. No reverse engineering of any vendor API.

### Scientific and professional method

- CVSS v4.0: base severity is not business risk. EPSS: the current score estimates exploitation in the wild within the next 30 days, not the compromise probability of a specific asset; the original EPSS paper used a different horizon, so do not conflate them (that paper is not verified at takeover). CISA KEV (known exploitation) and SSVC (stakeholder-specific decision). Record feed date and version; unknown or stale data is explicitly unknown and never scored as zero. A risk decision combines verified exposure, asset impact, controls, exploitation evidence and human review; no invented production formula and no automatic closure. Evaluate on a time-split synthetic or authorized historical dataset: coverage and efficiency, precision and recall, calibration (Brier score) and analyst burden against a severity-only baseline. No measured result is claimed.
- NIST SP 800-115 for assessment planning; SP 800-61 Rev. 3 for incident response integrated with CSF 2.0; ASVS 5.0.0; PROV-O; WCAG 2.2. ISO incident-process, supply-chain and evidence standards (27035-1, 27035-2, 27036-3, 27037; not verified at takeover) supplement the existing ISO control mapping; they are not certification or reproduction of licensed text.
- Indonesian PDP Law, article 46: a notification window for qualifying failures is attributed to it in the draft (stated there as 3x24 hours); this is **not verified at takeover**. Human and legal validation of the trigger and recipients is required; no automated filing. A regulation number and a January 2027 date taken from a vendor statement were removed because they are not independently authenticated; nothing is hard-coded as a rule. Legal review covers lawful basis, DPIA, data transfer, electronic-system-operator and sector requirements, UU ITE, PP 71/2019, Perpres 82/2022, and IP under Law 28/2014.

### Proposed safety and acceptance tests

All IDs are provisional and must be reconciled with existing CAP/REQ identifiers; every test below is proposed and no CI was executed.

- SEC-001: verified asset and a signed scope grant; expiry and revocation; recheck before every job. DNS or file proof alone is not blanket permission; third-party or shared hosting is authorized separately.
- SEC-002: deny unapproved destinations, redirects, DNS changes, SSRF and private or link-local targets; no broad or disruptive tests, no exploitation, no credential collection, no external callbacks; sandbox with synthetic fixtures, a bounded resource budget, a stop switch and an independent worker identity.
- SEC-003: admission, SBOM and version or signature; no arbitrary user templates or shell.
- SEC-004: finding and evidence hash, redacted output, tenant-scoped access, stale flag, audit, retest and a false-positive workflow.
- SEC-005: explainable risk decision with provenance and uncertainty.
- SEC-008: GRC evidence and legal review. SEC-009: incident chronology, configurable notification deadline, approval and recovery drill. SEC-010: restricted evidence retention and deletion, access audit.
- SEC-011: a GitHub issue only after scoped authorization and redaction; no automatic action.
- SEC-012: AI may draft only, with no secrets or raw customer telemetry; prompt-injection and egress tests; citations and abstention.
- SEC-013: endpoint monitoring of metadata only, where authorized. SEC-014: legitimate rights-holder reports only, with human review and no retaliatory action. SEC-015: device-owner consent, no reading of communications, no forensic guarantee.
- No real customer assets or data in this research.

### Local research deliverables (#212, proposed)

Original, accessible risk, finding and evidence presentation; public SSG only for approved aggregated content, USER admin only where declared; SYSTEM admin and the risk workflow stay in the backend. A mock test with keyboard and focus, severity that is not color-only, text equivalents for charts, stale, unavailable and confidence states, an accessible report table and WCAG 2.2 AA. Verify that no PII, vulnerability detail, tenant identifiers or signed evidence URLs appear in static build artifacts. No backend and no private data in the public client bundle.

## Independent reconstruction direction (2026-11-28, proposed)

Direction recorded in the draft: use original capabilities rather than unapproved dependencies. This supersedes the earlier HOLD-as-candidate for testssl.sh (GPL-2.0), Wazuh (engine AGPL-3.0-or-later, mixed manager and shared libraries) and MVT (custom license, consent). Do not install, link, vendor, port, translate or copy source, structure, UI, rules, templates, IOCs or datasets of these tools or of any commercial product; do not use them as an oracle; do not reverse engineer them. GPL and AGPL are not commercial bans; independent implementation is a business and architecture choice, not a legal exemption. Informed, non-coerced device-owner consent is preserved regardless of implementation. ZAP and Nuclei remain unapproved candidates; no dependency admission. Use public functional descriptions and independent standards only; require contributor provenance or attestation, a source register, independent requirements, a reviewer, similarity checks, dependency and SBOM checks, and pinned version, SHA, license, notice, patent and data terms and an exit plan. No formal clean-room or compliance claim is made. For the copyright basis see the register above (article reading not verified at takeover). Review other IP and contracts. No restricted material in agent prompts.

### Independent standards and scope

- TLS: RFC 9846 (July 2026) obsoletes RFC 8446; BCP 195 comprises RFC 8996, 9325 and 9852, and RFC 9325 is also updated by RFC 10015 outside BCP 195; RFC 9525 for service identity; NIST SP 800-52 Rev. 2. Use approved runtime TLS APIs and never new cryptography; record negotiated version, chain, identity and expiry only; unknown is not a pass. Observing TLS 1.2 is not BCP compliance; no parity or exploit probes.
- Logging and monitoring: Denning (1987, not verified at takeover); NIST SP 800-92 (Revision 1 is a draft) and SP 800-137; SP 800-53 Rev. 5 (Release 5.2.0, 27 August 2025) controls AU-6, SI-7 and SI-4; RFC 5424; the OpenTelemetry logs data model as reference only.
- Mobile: NIST SP 800-124 Rev. 2 and SP 800-101 Rev. 1 as a scope boundary, not forensic acquisition.
- Secure development: SSDF 1.1 final; v1.2 is an initial public draft and is not final.
- Map the ISO/IEC standards listed in the register (not verified at takeover; no edition years) as evidence, not certification. UU PDP, UU ITE, PP 71/2019, purpose, retention, consent and legal review.

Provisional requirement IDs (proposed): IND-01 TLS posture (consumer worker); IND-02 host metadata (host-side component, to be decided); IND-03 event normalization and correlation (`awcms` contract and host-side summaries); IND-04 integrity evidence (host-side component); IND-05 mobile posture (product discovery); IND-06 risk, evidence and cases (`awcms` and consumer). No claim of a full SIEM, XDR, forensics or spyware detection. Explicit scoped grant, expiry and revocation, an independent worker, synthetic data, no unauthorized I/O or private data, and no action without approval. Reconcile CAP/REQ, source provenance, ADR and Gate 9 and 15; no new product code or deployment.

A reference spike, reported by the research session as a local offline run on Node v22.16.0 with 19 passing synthetic tests, was executed outside this repository. It was not run here, covers only pure decisions on supplied observations, and is not evidence of any implementation in this repository. No Bun, CI, real TLS, device, RLS or production test was run.

### Local requirements and acceptance (proposed)

IND-06: independent report visualizations only. Show observed-ok, review, unknown and denied explicitly; no all-clear and no color-only conclusion; show evidence freshness and version; text alternatives, keyboard operation and WCAG 2.2 AA. Public SSG only for approved aggregates; no private tenant evidence, no signed URLs and no backend. Declared USER surface only; SYSTEM admin stays in `awcms`.

## Reference verification at takeover (2026-11-28)

Read-only page checks on 2026-11-28; a page summary is not a raw copy, and a page that could not be opened was not treated as correct.

- **Supported:** 24 of the 33 register entries are marked "Checked" (some for title, date or status only); two are partly checked (SP 800-53 Rev. 5 release 5.2.0 and the PDP Law page); two pages were only confirmed to exist (CSF 2.0 and the CISA pages); five are not verified (see next item).
- **Not verified at takeover:** Hall and Llinas, Denning, Jacobs et al., NIST AI RMF 1.0, the ISO catalogue entries and their edition years, and the article text of the PDP Law (including article 46) and of Law 28/2014 (articles 40 and 41). They remain listed, marked, and no figure or edition year taken from them is stated as fact.
- **Corrections made:** RFC 10015 is not a member of BCP 195; SP 800-53 is cited as Rev. 5, Release 5.2.0 (27 August 2025); the vendor's price comparison, service hours, scanner-tool claim and regulation-date claim were removed; the "19/19 synthetic tests on Node" claim is restated as an external reference spike; the CSF release year and the ASVS release date were dropped because the pages opened do not show them.
- **Repository claims checked against `main`:** `AGENTS.md` and `README.md` blob prefixes, the zero-authenticated-surface statement, and issue #212 as tracker.

## Changelog

- v1.3.0 (2026-11-28): takeover revision; neutral wording for commercial products, reference corrections and verification section, Indonesian mirror.
- v1.2.0 (2026-11-28): independent reconstruction replacing unapproved components; proposed local acceptance.
- v1.1.0 (2026-11-28): license dispositions, risk methodology and local research criteria.
- v1.0.0 (2026-11-28): initial research, local ownership and controls.
