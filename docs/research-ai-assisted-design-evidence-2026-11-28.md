🇬🇧 English (source) · 🇮🇩 [Bahasa Indonesia](research-ai-assisted-design-evidence-2026-11-28.id.md)

# AI-assisted design and specification evidence — public and USER-admin surfaces

## Document control

- **Version:** v0.2.0
- **Date:** 2026-11-28
- **Status:** Research proposal only. Not a normative change, not an implementation, not a gate decision. Every design item, control, temporary ID and project mapping below is **proposed**.
- **Owning issue:** [#210](https://github.com/ahliweb/awcms-astro/issues/210) (stays open).
- **Evidence snapshot:** `AGENTS.md` on `main` was git blob `3debbf7ad824` and the `main` head was `3a693d5` when this note was taken over (2026-11-28). The blob prefix is not a commit SHA; pin the real SHA before any pilot.
- **Provenance:** drafted by another AI session as a draft pull request; taken over, corrected and reference-checked on 2026-11-28 by an orchestrated AI session at the owner's choice. The takeover is not a merge approval.
- **Document Changeset:** Takeover revision: vendor names and claims removed, reference claims corrected or marked not verified, spike-test wording removed, GitHub Projects section kept as a proposal.

## Research method and evidence

Rapid review of primary public sources. It is not a systematic review and not a product trial. The research was prompted by public descriptions of commercial AI-assisted planning and design products; it uses only general functional concepts and open standards. Vendor feature descriptions are claims, not effectiveness evidence, and are not cited here.

| Source | Use in this note | Status at takeover |
| --- | --- | --- |
| Cui et al., field experiments ([publisher page](https://doi.org/10.1287/mnsc.2025.00535)) | Field evidence on completed tasks | **Not verified at takeover.** The publisher page refused access; year, participant count and effect sizes were not checked and are not stated here |
| [METR 2025](https://metr.org/blog/2025-07-10-early-2025-ai-experienced-os-dev-study/) | Randomized study with 16 experienced developers over 246 issues; developers took 19% longer | Checked. The page itself marks the result as no longer current |
| [METR update, 2026-02-24](https://metr.org/blog/2026-02-24-uplift-update/) | Changes to study design and selection effects | Checked. "Do not pool or promise savings" is this note's inference, not a quotation |
| [Perry et al.](https://arxiv.org/abs/2211.03622) | Participants with an AI assistant were more likely to believe their code was secure | Checked (paraphrase of the finding) |
| [ISO 12207](https://www.iso.org/standard/90219.html) | Software lifecycle processes | **Not verified at takeover.** Catalogue page refused access; number, title and edition year not checked, and no year is stated |
| [ISO 9241-210](https://www.iso.org/standard/77520.html) | Human-centred design for interactive systems | **Not verified at takeover.** Catalogue page returned 403; edition year not stated |
| [DTCG 2025.10](https://www.designtokens.org/tr/2025.10/format/) | Design-token interchange format | Checked. A Final Community Group Report dated 28 Oct 2025, not a W3C Recommendation |
| [Vendor-published DESIGN.md format description](https://blog.google/innovation-and-ai/models-and-research/google-labs/stitch-design-md/) | Interoperability reference only, not a mandatory tool | Checked: dated 21 Apr 2026; what was read is a draft specification |
| [NIST SSDF](https://csrc.nist.gov/projects/ssdf/publications) | Secure development framework | Checked: v1.1 final (2022); v1.2 is an initial public draft released 2025-12-17 |
| [WCAG 2.2](https://www.w3.org/TR/WCAG22/) | Accessibility floor | Checked: W3C Recommendation, 12 December 2024 |
| [Indonesian PDP law](https://peraturan.bpk.go.id/Details/229798/uu-no-27-tahun-2022) | Personal-data context, as applicable | Partly checked: the page is metadata, abstract and court rulings; the article text was **not verified at takeover** |
| [Indonesian copyright law](https://peraturan.bpk.go.id/Details/38690/uu-no-28-tahun-2014) | Copyright context, as applicable | Checked: Law 28/2014 on Copyright, shown as in force; article text not read |

Outcomes across the studies differ; do not pool them and do not promise savings.

## Boundary and proposed validation

Astro static public site; the USER-admin surface follows declared contracts ([ADR-0034](adr/0034-publik-secara-bawaan-admin-hanya-bila-dinyatakan.md)). No authenticated surface is claimed as implemented. Verified against `main` at takeover: `AGENTS.md` states that this template declares zero authenticated surfaces, and that the USER admin and portal BFF have no code yet.

- Inventory tokens, components and the existing accessibility gates.
- One synthetic public slice with responsive and keyboard/focus behavior. If an authenticated user surface is proposed, bind its mock to the existing contract and the backend permission, and document N/A for absent screens.
- SSG stays static; no generic SYSTEM admin and no SSR without an ADR.

## Evidence contract (proposed)

- Steps 2 and 4: requirement and acceptance criteria, screen ID, review context and a synthetic prototype.
- Steps 5–8: explicit data, permission and operation; a contract-generated mock when applicable.
- Gate 9: detect missing or conflicting links; correction returns to the originating specification.
- Step 11: per-slice tests only after the applicable approval.
- Step 12: a deterministic visual baseline plus manual and automated WCAG 2.2 checks; automation alone does not prove accessibility.
- Record observed, approved, inferred, unknown and proposed items separately, and pin the actual source SHA before a pilot. Where UI is absent, mark N/A. Reuse existing canonical artifacts; do not duplicate them.
- Measure time including review and rework, defect escape, task success and cost against a matched baseline.
- No fabricated tests, UAT or CI.

## Security and licensing

Concept-only independent adoption. No copying of proprietary assets or source, no code, assets, API, text or rules of any third-party product, and no reverse engineering of one. No confidential data to unapproved providers; use synthetic fixtures, least privilege, redaction and license review. No compliance certification or performance result is claimed.

## Next decision

Issue #210 owns deeper inspection (ADR, docs, actual code, CI and overlap), a bounded proposal and a reviewer decision. This note authorizes no implementation, dependency, release or gate approval.

## GitHub Projects — lifecycle coordination (proposed, 2026-11-28)

Direction recorded in the draft: coordinate the applicable lifecycle steps through GitHub Projects (v2), integrating with existing project management rather than adding a second board or replacing repository authority. Existing work: #210. Upstream public and USER admin; SSG, no fictional authenticated surface or UAT; record applicability. This section is a proposal; no project membership was checked or changed.

- Steps 1–8: track research and specification deliverables, dependency, reviewer, acceptance criteria and evidence URL; no implementation issue before the applicable Gate 9. Step 9: a gate tracker references the recorded decision and is never inferred from a board stage.
- Steps 10–12: one canonical issue per S/M unit, native parent/sub-issue and blocked-by relations where supported, milestone, priority and assignee preserved; the PR references the issue and CI evidence. Steps 13–15: track staging/UAT only if applicable, release-readiness evidence and decision. Steps 16–18: deployment, validation, monitoring and follow-up with release or incident evidence.
- Reuse the approved project and its existing fields (for example Tahap, Pelaksana, Prioritas, Mulai, Target). Proposed status mapping: Rencana = backlog, Siap = applicable definition of ready, Berjalan = claimed, Menunggu = dependency, review or approval, Selesai = verified outcome, Batal = cancelled with reason. The lifecycle step is a separate field or existing issue metadata, never inferred from the stage. A gate rejection stays recorded even if the tracker closes. A closed-unmerged PR, a duplicate or not-planned issue, or missing evidence is never marked Selesai automatically. Preserve owner, assignee and target; do not invent deadlines.
- Project membership or field changes: discover the live owner, number, access and field IDs; use the actual issue URL or node ID, idempotent add, dry-run diff, readback and reconcile; keep one canonical issue and distinguish PR items from work counts. No shared draft cards or confidential context; review permissions; avoid broad seeding or conflicts with status automation; never move an item across a visibility boundary automatically. The board is coordination only, not merge or deploy authority.

References (each page opened at takeover and exists): [Planning and tracking with Projects](https://docs.github.com/en/issues/planning-and-tracking-with-projects); [Using the API to manage Projects](https://docs.github.com/en/issues/planning-and-tracking-with-projects/automating-your-project/using-the-api-to-manage-projects); [Creating issue dependencies](https://docs.github.com/en/issues/tracking-your-work-with-issues/using-issues/creating-issue-dependencies); [About issue statuses](https://docs.github.com/en/issues/tracking-your-work-with-issues/learning-about-issues/about-issue-statuses).

## Reference verification at takeover (2026-11-28)

Read-only page checks on 2026-11-28. A page summary is not a raw copy, and a page that could not be opened is not treated as correct.

- **Supported:** 8 of the 12 table rows, plus the four GitHub pages listed under the Projects section (12 of 16 references in all). One more (the PDP law) is only partly checked.
- **Not verified at takeover:** Cui et al. (publisher refused access; no figures stated), ISO 12207 and ISO 9241-210 (catalogue refused access; no edition year stated), and the article text of the PDP law.
- **Corrections made:** METR counted 246 issues, not tasks, and its page marks the result as not current; the secure-code finding is stated as the paraphrase the source supports; DTCG 2025.10 is a Community Group Report, not a W3C Recommendation; vendor product names, feature descriptions and the numbers taken from unverified sources were removed.
- **Reference-spike claim:** a research session reported a reference spike of 19 synthetic tests on Node, run outside this repository. It was not run in this repository and is not evidence of any implementation; no test claim is made here.
- **Repository claims checked against `main`:** the `AGENTS.md` blob prefix, the zero-authenticated-surface statement, issue #210 as owning issue, and ADR-0034.
