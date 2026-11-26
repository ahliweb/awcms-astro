🇬🇧 English (source) · 🇮🇩 [Bahasa Indonesia](0059-opengrep-replaces-codeql-with-copied-rules-and-a-shrink-only-baseline.id.md)

# ADR-0059 — OpenGrep replaces CodeQL, with copied rules and a shrink-only baseline

- **Status:** Accepted
- **Date:** 27 November 2026 (owner decision, applied across every repo as an internal cross-portfolio standard, DL-098)
- **Supersedes:** [ADR-0032](0032-dua-celah-terakhir-ditutup-dengan-syarat-kejujuran.md) §A (the CodeQL workflow only; §B, Core Web Vitals, is untouched and its honesty condition is kept)
- **Amends, for the required-check name only:** [ADR-0053](0053-main-is-fenced-by-a-ruleset-that-no-gate-can-see.md) (its third required context)
- **Related:** [ADR-0028](0028-jangkar-standar-performa-dan-keamanan.md) (gap 7), [ADR-0030](0030-aturan-tertulis-mendapat-pemeriksanya.md) (SHA pins, a rule brings its checker)

## Context

Gap 7 of ADR-0028 was closed by ADR-0032 §A with a CodeQL workflow. GitHub's CodeQL terms do not allow it on a codebase that is not open source, nor in CI without a GitHub Advanced Security licence. The owner runs one security path for every repository, public ones included, and chose a path that needs no such licence.

The honesty condition of ADR-0032 §A is independent of the engine: a run summary must state what was analysed and what was not (`.astro` was never parsed by CodeQL, and the OpenGrep rules installed here do not target it either).

## Decision

1. **CodeQL does not run in this repo.** `.github/workflows/codeql.yml` and `tests/analisis-statik.test.mjs` are removed. There was no `.github/codeql/` directory and no CodeQL CLI pin.
2. **The security leg is `.github/workflows/keamanan.yml`**, job name `keamanan / sast-rahasia-dependensi`, on every pull request and push to `main`, with no `paths` filter, `permissions: contents: read`, every action pinned to a commit SHA, and no SARIF upload:
   - **gitleaks** 8.30.1 (checksum verified, `--redact`) over a **commit range** (`base..head` on a pull request, the pushed range on a push), not the whole history;
   - **OpenGrep** v2.1.0, the Linux x86 binary pinned by SHA256 and verified before it runs, with `SEMGREP_SEND_METRICS=off` and `--disable-version-check`;
   - **dependency audit is not repeated:** `bun audit --audit-level=low` already runs in the `Check` job of `ci.yml` and keeps its threshold with no exception.
3. **Rules are a copy, not a registry.** `tools/ci/sast/rules/` holds every `.yaml` and `.yml` under `javascript/` and `typescript/` of `opengrep/opengrep-rules` at commit `f1d2b562b414783763fd02a6ed2736eaed622efa`, plus its `LICENSE` and a `SUMBER.md`, plus local rules in `rules/lokal/`. The Semgrep Registry (`p/...`) and `semgrep/semgrep-rules` are not used.
4. **The gate fails only on an ERROR that is not in the baseline.** `tools/ci/sast/baseline.json` is created once at adoption and only shrinks: tooling may create it or drop stale entries, never add; adding an entry is a hand edit with a non-empty reason, reviewed in the pull request. Findings are not uploaded to GitHub code scanning.
5. **One exclusion is declared:** `design/redesain-ui-ux-2026-10/support.js`, which is generated (its first line says so) from a runtime that lives outside this repo. The same `--exclude` must be given when the baseline is created or tidied.
6. **Coverage is stated, not claimed.** The `Nyatakan cakupan` step writes into the run summary how many tracked `.ts`/`.mjs`/`.js` files the rules target and how many `.astro` files are NOT analysed, both counted by `git ls-files`. `tests/sast-opengrep.test.mjs` is its checker.
7. **The required check changes by an owner action.** The `main-protection` ruleset (id `25837340`) must drop `Analyze (javascript-typescript)` and require `keamanan / sast-rahasia-dependensi`, pinned to the `github-actions` integration (id 15368). Until then the old context never reports and a pull request cannot merge, so the swap is ordered in the pull request description.

## Consequences

**Gained.** One licence-free path shared with every other repository; findings that fail the build are always new ones; the rules and the engine are pinned, so a result can be reproduced.

**Paid.** A copy of 203 rule files lives in the repo and is refreshed by a script, not by GitHub; CodeQL's data-flow queries are gone, and the OpenGrep JS/TS rules are mostly pattern-based, so some classes of finding CodeQL could reach (inter-procedural taint) are no longer covered; the repo's run time grows by the scan (about 5 seconds locally); and `.astro` stays unanalysed, as before.

**Unchanged.** The `.astro` limit and its statement, `bun audit` with no exception, SHA pins, and the rule that this repo has no secrets to need a scanner for them.

**Rollback.** Revert the pull request, restore `codeql.yml` and the required context in the ruleset; nothing else depends on the new files.

## Alternatives considered

- **Keep CodeQL.** Rejected: the licence terms above.
- **Semgrep with the Registry rules.** Not used, by owner decision: the rules are copied and pinned instead of fetched from a registry.
- **No static analysis.** Rejected: reopens gap 7.
