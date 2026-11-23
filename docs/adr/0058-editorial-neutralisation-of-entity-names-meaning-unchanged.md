🇬🇧 English (source) · 🇮🇩 [Bahasa Indonesia](0058-editorial-neutralisation-of-entity-names-meaning-unchanged.id.md)

# ADR-0058 — Editorial neutralisation of entity names; the meaning does not change

- **Status:** Accepted
- **Date:** 23 November 2026 (proposed and accepted the same day, on an owner decision)
- **Amends, editorially only:** [ADR-0014](0014-rendering-campuran-dan-bff-portal.md), [ADR-0015](0015-runtime-bun-menutup-divergence-keluarga.md), [ADR-0017](0017-peran-admin-owner-internal.md), [ADR-0019](0019-csp-ketat-dikirim-penyaji.md), [ADR-0020](0020-layar-admin-kembali-ke-awcms.md), [ADR-0021](0021-tahan-pengembangan-menunggu-fondasi-awcms.md), [ADR-0027](0027-penahanan-adr-0021-selesai.md), [ADR-0034](0034-publik-secara-bawaan-admin-hanya-bila-dinyatakan.md), [ADR-0038](0038-kebutuhan-backend-menjadi-modul-di-awcms.md), [ADR-0051](0051-a-knowledge-tree-points-at-the-code-and-owns-none-of-it.md), [ADR-0055](0055-reading-preferences-are-a-native-same-origin-panel-not-an-overlay-widget.md) and [ADR-0056](0056-accessibility-is-gated-by-axe-in-a-real-browser-with-no-exceptions.md). No decision in any of them changes.
- **Related:** [ADR-0039](0039-english-is-the-source-language.md) (the mirror rule this ADR is itself bound by)

**Documentation and governance only.** This ADR adds no code, route, dependency, endpoint, database or gate change. It records how twelve accepted ADRs are read now that the repo no longer names parties outside the AWCMS family in its prose.

## Context

This repo is public and is a template. Its early ADRs were written while a handful of concrete parties were the reason for each decision, and they name those parties: a client marketplace portal whose BFF motivated the mixed-rendering decision, sibling consumer product repos whose prior art a design was ported from or diverged from, and an operator-side control-plane product whose scope an owner decision mentions in passing.

A public template should not identify those parties. Its living documents were already neutralised; what remains are the accepted ADRs, which are a record of decisions and are not edited to taste.

Two things have to be true together. The record must keep saying what was decided, and the repo must stop naming parties that have no business in a public template. Editing an accepted ADR's reasoning to achieve the second would endanger the first.

## Decision

### 1. The names are replaced by categories, and nothing else moves

Wherever an accepted ADR names one of these parties, the intended reading is its **category**:

| What the ADR names | Read it as |
| --- | --- |
| a client marketplace portal | "the marketplace portal" — a portal with merchant, affiliate and public-interaction surfaces, served through a BFF |
| a sibling repo that embeds `awcms` and adds commerce | "a consumer product repo" |
| an operator-side control-plane product, and its website | "an operator-side product" |
| a client news site or a client agency | "a client site" |

The category carries every fact the decision relied on: that a portal needs sessions, that a consumer repo tracks a generated directory this repo does not, that a hosting-control product has its own repo and tracker. None of these facts depended on the party's name.

### 2. What was edited in the accepted ADRs, and what was not

The reasoning, the decisions, the options considered and the consequences of every accepted ADR are **untouched**. The only edits made to accepted ADR files by this change are **link targets**: the directory that holds the portal blueprint was renamed to `docs/awcms-astro/portal-bff/`, and four links in three ADR pairs would otherwise point at a path that no longer exists, which `bun run audit:dokumen` refuses. Link text and prose were not changed. The ADR index (`docs/adr/README.md` and its mirror) is not an ADR and was neutralised directly.

This means some accepted ADRs still carry a name in their body or title. That is deliberate and is the residue this ADR exists to explain: the reading rule in §1 is the amendment, not an edit.

### 3. What this does not reach

- Git history, past commit messages and the historical `CHANGELOG.md` entries stay as written; a changelog is a record of what was said at the time. The one exception is a single link target in `CHANGELOG.md`, repaired for the renamed directory so it does not become a dead link.
- GitHub issues, pull requests, labels and milestones are outside the repo's files and are not rewritten here.
- Identifiers that name an upstream route or module are technical names owned by `awcms`, not prose, and are not renamed from here.

### 4. From now on

New ADRs, documents, comments, fixtures and changesets describe such parties by category from the start. No gate is added for this; the repo's gates cannot know which names are sensitive, and a list of them inside a gate would itself be the leak.

## Consequences

- A reader who meets a name in an accepted ADR has one place that says how to read it, and a reader who meets none loses nothing.
- The renamed blueprint directory keeps every internal link working; the mirror pairs stay current (`bun run audit:translation`).
- The residue is small, enumerated by number above, and shrinks only if the owner later decides an accepted ADR may be rewritten, which this ADR does not decide.
