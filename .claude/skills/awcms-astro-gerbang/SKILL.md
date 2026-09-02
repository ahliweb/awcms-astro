---
name: awcms-astro-gerbang
description: The nine awcms-astro gates (check, test, audit:konten, audit:dokumen, audit:graf, audit:translation, audit:serapan, audit:aset, audit:rilis) — what each one catches, what it does NOT, and the rule that every new rule must bring its own checker. Use before a PR, when adding a rule to a document, or when a gate is red and the reason is not obvious.
---

🇬🇧 English (source) · 🇮🇩 [Bahasa Indonesia](SKILL.id.md)

# awcms-astro — the gates

Nine commands, and each one catches a class of defect that **fails nothing** when
it happens. That is why all nine exist.

```bash
bun run check             # lockfile + astro check      — no build, no network
bun test                  # unit + contract + server    — the server layer skips itself without dist/
bun run audit:konten      # image sources + build OUTPUT
bun run audit:dokumen     # this repo's markdown        — no build, no network
bun run audit:translation # mirror staleness + coverage — no build, no network
bun run audit:graf        # the graphify-out/ artefact  — skips itself if the directory is absent
bun run audit:serapan     # awcms ADRs nobody here read — the one gate that looks OUTWARD; skips check 2 without network
bun run audit:aset        # the reader's byte budget    — the output layer skips itself without dist/client
bun run audit:rilis       # the waiting release backlog — no build, no network
```

## What each one catches

| Gate | Class of defect |
| --- | --- |
| `check` | Types, props, broken imports, a lockfile belonging to another project |
| `bun test` | 38 files. PO catalogue parity; the `awcms` contract (traversal, media, cards) and **the surfaces the build calls**; the repo's ROLE (`tests/peran-situs.test.mjs`, ADR-0034); **NO backend** (`tests/tanpa-backend.test.mjs`, ADR-0038 — backend-class dependencies, write paths, persistence artefacts); the **`news` vocabulary** (`tests/kosakata-news.test.mjs`, ADR-0036); the Atom feed (`tests/feed.test.mjs`, ADR-0035); two separate dates (`tests/tanggal.test.mjs`, ADR-0033); the server's headers + cache; CSP over the output; **toolchain versions** including the TypeScript pin (ADR-0037); SBOM; lab CWV; static analysis; schema; local art; the block renderer; the conditional release; the translation-check logic (`tests/docs-i18n-checks.test.mjs`, ADR-0039); plus 6 meta-tests that re-run six of the seven audit scripts over this repo AND over a fixture tree (`audit:translation` is the seventh; its logic is gated by `tests/docs-i18n-checks.test.mjs` instead). **The two counts in this row are checked against the repo by `tests/documented-counts.test.mjs`.** They read 21 and three until 28 August 2026, drifting one file at a time as gates were added — which is why they are gated rather than merely corrected |
| `audit:konten` | Image ratios against `--ratio-visual`, format read from the file CONTENTS, title/canonical/hreflang, assets promised by metadata, dead links, the sitemap, **every `.xml` in the output** (a valid Atom feed, or a violation), key names leaking to the screen |
| `audit:dokumen` | Dead markdown links, the ADR index complete in both directions, an ADR's status agreeing with its file, the polish-surface list, file paths named by a document, **`ADR-NNNN` citations that resolve to their file** |
| `audit:translation` | A stale mirror (an `.id.md` whose recorded hash no longer matches its English source), an orphan mirror whose source is gone, a document with no mirror that is not on the shrink-only ledger, and a ledger entry whose mirror now exists (ADR-0039) |
| `audit:graf` | `graphify-out/` artefacts tracked outside the four shared outputs, a report that disagrees with `graph.json`, **community names that were never chosen** (a file name, a placeholder, a twin, or differing between artefacts), a corpus that ignored `.graphifyignore` |
| `audit:serapan` | An `awcms` ADR with no verdict in the absorption ledger, a gap between the declared floor and the highest number listed, a `belum` count above its declared ceiling, and — the only OUTWARD-looking check in this repo — a decision published in `ahliweb/awcms` that nobody here has read yet |
| `audit:aset` | A source `<script>` or `public/**` file over the source ceiling, and — when `dist/client` exists — the bytes a single page really pulls, named per file (ADR-0044; `awcms` ADR-0101 is the family's other half). **Read a violation as a question about which FILE a rule is in before treating it as a ceiling to raise**: on 2 September 2026 it reddened `/cari/` over hero CSS that was sitting in `src/styles/global.css` while one component used it, and moving that block returned 1,853 B to every page. The ceilings themselves are measurements with headroom, recorded in the script beside the number |
| `audit:rilis` | A waiting-changeset backlog over 12 files or older than 14 days, and a changeset whose name carries no usable `YYYY-MM-DD-` date — including a calendar date that does not exist and one dated more than a day ahead ([ADR-0048](../../../docs/adr/0048-a-release-is-cut-when-the-backlog-crosses-a-bound.md)) |

## What is NOT caught — named here so it is not taken for guarded

- **The two image rules** in `AGENTS.md` (text in an image is only a topic label;
  no state-institution emblems) — not machine-checkable, manual forever.
- **The output gates of `audit:konten`** skip themselves without `dist/`, and
  **say so**. In the template repo that is normal; in a SITE it means the gate
  did not run. Since 6 August 2026 what is skipped is only **the run over a real
  site**: the logic of every family is proven by `tests/audit-konten.test.mjs`
  over a fixture tree, so the script can no longer quietly stop checking in a
  repo that never builds.
- **The server layer of `bun test`** skips itself without `dist/`, for the same
  reason.
- **External URLs and anchors** in `audit:dokumen` — the first needs the network
  (a gate that goes red because a third-party site is down gets ignored), the
  second means guessing GitHub's heading slugification.
- **What a mirror CONTAINS.** `audit:translation` keeps a mirror the same AGE as
  its source: a matching hash proves it was re-translated when the source last
  changed, not that it says the same thing. The related trap is on the other
  side, and it has already happened — a gate that reads a document for a phrase
  reads ONE of the two files. On 15 August 2026 `tests/peran-situs.test.mjs`
  stayed green over a translated `AGENTS.md`, not because the prose still stated
  the public default, but because a file name inside a link happened to contain
  the word it grepped for. A gate that reads prose must name **which** file, and
  say so in the language that file is written in.
- **PROSE.** All six `audit:dokumen` gates read STRUCTURE — links, the two-way
  index table, the status column, marked blocks, code spans, and `ADR-NNNN`
  citations. Not one of them reads a sentence. An ordinary sentence stating
  something that does not exist passes straight through, and that is not
  hypothetical: the polish-surface gate removed `.wilayah-filter-btn` from the
  marked table on 3 August 2026, and **its copy in a paragraph thirty lines above
  that table survived until 4 August**. Same name, same document, the very gate
  built for it.
- **The "State" column in `docs/awcms-astro/standar-performa-dan-keamanan.md`.**
  A row can read "Met" after its control has been removed, and nothing will go
  red. That is the cost ADR-0028 states it accepts.
- **Prose inside skills as well as docs.** Same as above: the gates read
  structure — with **one deliberate exception**, added 28 August 2026.
  `tests/documented-counts.test.mjs` reads two NUMBERS out of the `bun test` row
  above and compares them to what `tests/` actually holds. A number is the one
  kind of claim a sentence can make that a checker can settle without
  understanding the sentence, and these two had drifted to 21 and three while
  every gate stayed green. It does not read the rest of the row, and it says
  nothing about whether the sentence around the number is true.
- **Graph freshness, and the quality of a community name beyond its shape.**
  `audit:graf` REPORTS the gap between `built_at_commit` and `HEAD` without ever
  turning red on it — turning red would mean every PR touching an indexed file
  has to carry a multi-megabyte rebuild, and a gate that expensive gets loosened
  within a month. It can also prove a label is NOT a file name, but it cannot
  judge whether the name is good for its community. Naming stays the reader's
  work; what is guarded is only that the work was actually done.
- **The marker paragraph of an ADR citation.** Since 5 August 2026 `ADR-NNNN`
  citations ARE checked to resolve to `docs/adr/NNNN-*.md` (rule 2 of `awcms`
  [ADR-0062](https://github.com/ahliweb/awcms/blob/main/docs/adr/0062-skills-are-gated-against-the-code-they-describe.md)),
  and a citation belonging to another repo is skipped when its paragraph carries
  a marker — `awcms`, "reference repo", or a github link. What the gate cannot
  judge: whether the marker is honest. An `awcms` citation whose number one day
  collides with a local ADR will be accepted through the local resolution path,
  and a local citation with a typo NEAR the word `awcms` will pass as the
  neighbour's. If that happens, it is the way it was written that gets fixed —
  not the gate that gets loosened.
- **Whether a release is already in flight.** `audit:rilis` reads `.changesets/`
  and nothing else, so it stays red for the whole life of a release pull request
  and goes green only when that PR lands and the changesets are folded. It also
  cannot tell whether the entries themselves are worth releasing — the size of a
  release comes from `bump` (ADR-0040), and whether the prose under it is any
  good is nobody's gate.

## The binding rule: a new rule must bring its own checker

This repo has already found **eleven** documents stating something that does not
exist, and not one of them turned anything red:

1. The ADR index listed six decisions that never existed here.
2. `getArticleImage` returned `undefined` unconditionally and three of its
   callers never read it.
3. The polish-surface table listed `.wilayah-filter-btn`, which never existed —
   in a document that **predicted of itself** that it would drift.
4. The new-repo checklist told you to prepare five paths that do not exist.
5. `og:image:alt` described a different image from `og:image`.

The next six were found on 4 August 2026, all in a single reading
([ADR-0028](../../../docs/adr/0028-jangkar-standar-performa-dan-keamanan.md)):

6. **The PROSE of number 3.** `.wilayah-filter-btn` was still named in a
   paragraph thirty lines above the table its gate had already cleaned.
7. `integrasi-awcms.md` read "There is no adapter yet" while 120 lines below it
   read "that move has already happened". Two sentences, one file, contradicting
   each other — and the wrong one is the one read first.
8. `standar-teknis.md` required `<Image>` from `astro:assets` and forbade raw
   `<img>`, while ADR-0024 decided the opposite **and a table in the same file**
   wrote that decision down.
9. `standar-teknis.md` required PNG share cards and forbade WebP, while ADR-0026
   made an article's card carry its own MIME type from `awcms` media.
10. `standar-teknis.md` and `ui-ux-design-system.md` said the theme is installed
    by an "inline script before paint" — which since ADR-0019 is in fact **dead**
    in a reader's browser.
11. `standar-teknis.md` required three documents that the reference repo for that
    standard — this repo itself — does not carry a single one of.

Four classes are now gated by `audit:dokumen`. The rest is prose, and prose
cannot be gated. **Writing a rule without its checker is adding a candidate
number twelve.**

### Five rules written with NO checker — four found 4 August 2026, the fifth on 14 August

A different shape from the eleven above, and quieter: not a document stating
something that does not exist, but **a rule that is correct and that nobody ever
checked**. The first four are now gated
([ADR-0030](../../../docs/adr/0030-aturan-tertulis-mendapat-pemeriksanya.md)),
and the fifth by
[ADR-0038](../../../docs/adr/0038-kebutuhan-backend-menjadi-modul-di-awcms.md):

| The rule, and how long it had been written | What found it | Its checker now |
| --- | --- | --- |
| The Bun version is the same in **five** values (`AGENTS.md` counted three FILES) | `grep -rln "packageManager\|bun-version" tests/ scripts/` → zero | `tests/versi-toolchain.test.mjs` |
| `bun test` + `bun audit` are required before a release (**four** documents demanded them) | Reading `scripts/rilis.mjs` to the end | The releaser runs both, **after** the build |
| The list of `awcms` surfaces the build calls | `awcms` recorded six, the code called three | `tests/kontrak-awcms.test.mjs`, both directions against the marked table in the integration skill |
| Supply-chain pinning to a SHA/digest (gap 6 of ADR-0028) | Already recorded, not yet done | The pin plus the version gate that keeps it |
| "`awcms` is the backend, this repo stores nothing" (written since ADR-0020, in negative form in six files) | Asked from outside: where does a backend requirement GO? Not one file answered, and not one gate read `package.json` by package class | `tests/tanpa-backend.test.mjs` (ADR-0038) |

**The lesson is not "write more gates".** The first three already had a firm
sentence, some of them with the word **must**, and it was that firmness that
made everyone assume something was checking. When adding a rule, the deciding
question is not "is this true" but **"which command turns red when this is
broken?"** If the answer is none, the rule has not landed — it has only been
written.

### What made numbers 7–11 possible, and how to avoid it

All five have the same shape: a sentence that was **true when written**, then an
ADR changed its code, then the sentence did not follow. It was never a typo — it
aged.

What catches it is not a gate but a habit: **when an ADR lands, grep the name of
the thing it changed across all the markdown.** ADR-0024 changed how images are
rendered; `grep -rn "astro:assets" docs/` would have found number 8 in one
second on the day that ADR was written.

## Adding a checker to `audit:konten`

The script does **not** take a root as an argument — it reads the working
directory. `tests/audit-konten.test.mjs` therefore runs it with the `cwd` of a
fixture tree rather than with a test flag: a mode that only lives in the tests is
a code path no site ever uses.

Its minimal fixture is three files — `src/config/site.ts` (locales),
`src/styles/global.css` (`--ratio-visual`), and one page in `dist/client/` —
because the script reads all three before any gate runs. Adding a gate means
adding **two** cases: red when the defect is present, green when it is not. Then
prove the test is not decoration: mutate its line in the script and confirm that
exactly that case goes red. Twice that method found a hole in a test that was
already green — the JSON-LD `image` branch that was never exercised, and one
schema filter that turned out not to be mutable at all.

**A family that will never find a file here still has to be proven here.** The
feed family (ADR-0035) scans `**/*.xml` in the output, and the template declares
zero news sections — so it will never find a single file, even if this repo had
a content source. The fixture tree is the only place it runs, and mutating it is
the only proof that it still checks anything (16 mutations, 16 different tests
red). The same pattern holds for the next family that depends on configuration
the template does not use.

## Adding a checker to `audit:dokumen`

The script takes a root as an argument (`bun scripts/audit-dokumen.mjs <root>`),
and that is what lets `tests/audit-dokumen.test.mjs` prove each gate **both
ways**: RED when the defect is present, GREEN when it is not, over a real
fixture tree.

Two traps already found:

- **A checker that is only correct for THIS repo may not live in the script.**
  The first draft of the "rotting exception" check was put in the script and made
  10 of 25 tests red — direct evidence that it stops being correct outside this
  repo, which is the condition of every site derived from this template. It moved
  into its test. (That 10-of-25 figure is **historical**, from the day it
  happened; the test file now has 32 tests. It is not refreshed because what is
  being told is the event, not today's state.)
- **An exception must name WHOSE it is.** `JALUR_DIKECUALIKAN` holds paths
  belonging to `awcms` and to the reference repo; "not built yet" is not a valid
  reason — that is precisely what this gate is looking for.

## Definition of Done

It is in [`AGENTS.md`](../../../AGENTS.md) §Definition of Done. The one most
often missed: `bun run audit:konten` **after** the build (not before), and adding
an ADR means adding its row in
[`docs/adr/README.md`](../../../docs/adr/README.md).
