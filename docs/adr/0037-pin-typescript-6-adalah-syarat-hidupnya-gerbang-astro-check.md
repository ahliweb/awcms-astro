🇬🇧 English (source) · 🇮🇩 [Bahasa Indonesia](0037-pin-typescript-6-adalah-syarat-hidupnya-gerbang-astro-check.id.md)

# ADR-0037 — The TypeScript 6.x pin is the condition for the `astro check` gate being alive

- **Status:** Accepted
- **Date:** 13 August 2026
- **Related:** [ADR-0015](0015-runtime-bun-menutup-divergence-keluarga.md) (the family toolchain), [ADR-0028](0028-jangkar-standar-performa-dan-keamanan.md) (the standards anchor), [ADR-0030](0030-aturan-tertulis-mendapat-pemeriksanya.md) (a written rule must bring its checker), `awcms` [ADR-0068](https://github.com/ahliweb/awcms/blob/main/docs/adr/0068-family-standards-posture-editions-and-recorded-divergences.md) (the family divergence recording mechanism)

## Context

`bun run check` runs `astro check`, and the quality gate table in
[`standar-teknis.md`](../awcms-astro/standar-teknis.md) lists it as the **Type
check** gate with its "Present in `awcms-astro`?" column reading **Yes**. That is
true. What was written nowhere until today is **why** it can still run.

`@astrojs/check` requires the TypeScript **6.x** programmatic API. This repo is
on `typescript: "^6.0.3"`, so its gate runs.

`awcms` is not. That repo is on `^7.0.2`, and its native compiler does not ship
that API — so every `.astro` file over there has **no type checker at all**. That
difference is already recorded on that side as a family divergence named
`astro-files-not-type-checked`, owned by `@ahliweb` with a `reviewDate` of
2027-02-04. The decisive sentence is inside that entry, and it names this repo
directly:

> `@astrojs/check` requires the TypeScript 6.x programmatic API; this repo is on
> TypeScript 7.0.2, whose native compiler does not ship it … awcms-astro is on
> `^6.0.3`, **which is the only reason its gate runs**.

So today's state is not "this repo simply has not upgraded yet". It is **the only
side of the family that still has `.astro` type checking**, and the divergence
record over there leans on that fact.

### Why this needs a decision rather than being left alone

Because its failure mode is routine maintenance that looks correct.

Raising `typescript` to `^7` is an action every agent and every developer will
read as dependency hygiene — Dependabot will propose it too. What happens next:
`@astrojs/check` can no longer run, and the **`Type check` gate dies**. The
quality gate table still reads "Yes", that table is gated by nobody, and not one
command turns red. This repo has already collected eleven documents stating
something that does not exist; this is candidate number twelve, at a higher cost
because what disappears is the checker itself.

And the consequence does not stop here: the `awcms` divergence record becomes
wrong that same day, with nobody touching its file.

## Decision

**`dependencies.typescript` in this repo stays within `^6.x`.**

Raising it to 7.x is a **FAMILY**-level decision, not a repo-level one, and it
requires two things first:

1. **A replacement for `.astro` type checking.** If `@astrojs/check` supports
   TypeScript 7.x by then, that is the replacement and this ADR can be withdrawn
   in one line. If not, the version bump means this repo **loses** a gate — and a
   lost gate must be declared as a gap in
   [`standar-performa-dan-keamanan.md`](../awcms-astro/standar-performa-dan-keamanan.md),
   not allowed to vanish from the table.
2. **An update to the `astro-files-not-type-checked` entry** in the `awcms` family
   compatibility manifest. This repo cannot write that itself; what can be done
   here is to not void its premise silently.

What this ADR does **not** decide: the `astro` and `@astrojs/node` versions. On
the day this was written both lagged one minor behind the `awcms` pin, and that
was purely work not yet done — not a decision, and binding on nobody. Dependabot
closed the lag on 23 August 2026.

The numbers themselves are deliberately **not** repeated here. This paragraph
used to carry them, and it is the copy that went stale while the pins moved
underneath it: an ADR is dated, a version is not, and a decision record is the
worst possible place to keep a value that changes. They live in
[`standar-teknis.md`](../awcms-astro/standar-teknis.md) §Stack — the one table a
checker reads.

## Its checker lands with its rule

[ADR-0030](0030-aturan-tertulis-mendapat-pemeriksanya.md) applies in full, and
this rule is exactly the example that ADR describes: a firm sentence makes people
assume something is checking it. So
[`tests/versi-toolchain.test.mjs`](../../tests/versi-toolchain.test.mjs) gets two
assertions:

1. `dependencies.typescript` must match `^6.` — and **its failure message names
   the reason**, not only the number. A gate that says "must be ^6" gets loosened
   by the next person, who does not know what dies if they do.
2. `@astrojs/check` must still be listed as a dependency. Without the second
   assertion, the first guards something that no longer exists: dropping
   `@astrojs/check` makes the TypeScript pin stop guarding anything, while its
   gate stays green.

Both live in the same file as the Bun version gate because the question is the
same — **which values must move together, and what dies silently if one of them
moves alone.**

## Consequences

- **Positive:**
  - The `Type check` gate stops depending on coincidence. It now has a written
    reason and a checker enforcing it.
  - A Dependabot update raising TypeScript to 7.x will be **red**, and its
    redness explains itself. That is the difference between a decision that is
    reviewed and a decision that happens.
  - The `awcms` divergence record stops resting on a state nobody in this repo
    knew they were carrying.
  - **`awcms` ADR-0112 (23 August 2026) narrowed the other half of that
    divergence, and it names this pin as load-bearing.** Unable to run
    `astro check` at all on TypeScript 7, that repo extracts every `.astro`
    frontmatter to a sibling `.ts` and runs its own `tsc` over it — closing 61
    files that were checked by nothing, and finding a screen that had answered
    404 on every request since it shipped. The `astro-files-not-type-checked`
    entry in `awcms-family-compatibility.yaml` now says this repo is on `^6.0.3`
    and that this *"is the only reason its gate runs"*.

    Recorded here because the citation ran one way. That entry describes a
    decision made in THIS file, and until now nothing in this file knew it was
    being depended on — which is precisely how a pin gets bumped by someone
    tidying a dependency list.
- **Negative / accepted trade-offs:**
  - **This repo is held at TypeScript 6.x until `@astrojs/check` catches up**,
    including away from 7.x language features and compiler fixes. That is a real
    cost, and it is chosen: every `.astro` component in `src/`, plus its layouts
    and pages, with no type checker is the more expensive price — and this repo
    has already paid it once, `entry: any` in `ArtikelLayout` hiding four fields
    that never existed. This paragraph used to fix that at "28 `.astro` files";
    by 28 August 2026 there were 50, and the number was doing no work the
    argument did not already do without it.
  - **The family becomes non-uniform on one toolchain value**, right after
    ADR-0015 closed the runtime divergence. The difference: this one is
    **recorded on both sides** along with its review date, rather than being found
    by the next person.
- **Neutral:**
  - **Zero changes to running code.** `package.json` is already at `^6.0.3`
    today; what lands is its reasoning and its gate.

## Alternatives considered

- **Raising to TypeScript 7.x now, matching `awcms`** — refused. It trades a
  running gate for version uniformity, and that uniformity buys nothing: the two
  repos do not share one TypeScript file.
- **Lowering `awcms` to 6.x so the family is uniform** — refused, and not by this
  repo: the divergence entry over there already refuses it with checkable
  reasoning — it would regress the toolchain underneath 33 gates and ~156,000
  lines kept clean by `tsc --noEmit` today.
- **Writing it as one line in `AGENTS.md` with no ADR** — refused. A rule that
  turns a dependency pin from routine maintenance into a family-level decision is
  a decision, and this repo's ADR index is where people read which decisions are
  in force.
- **Gating it by checking that `astro check` really runs**, rather than by
  checking its version — refused because it cannot be distinguished from any
  other failure: an `astro check` that fails because its API is gone and one that
  fails because there is a type error both exit non-zero, and a gate that cannot
  name its cause is a gate somebody switches off in a hurry.
