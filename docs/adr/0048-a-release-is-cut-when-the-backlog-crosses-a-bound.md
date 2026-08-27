🇬🇧 English (source) · 🇮🇩 [Bahasa Indonesia](0048-a-release-is-cut-when-the-backlog-crosses-a-bound.id.md)

# ADR-0048 — A release is cut when the backlog crosses a bound, not when someone remembers

- **Status:** Accepted
- **Date:** 28 August 2026
- **Related:** [ADR-0040](0040-changeset-menyatakan-bump-semver.md) (a changeset declares its own bump — this decision is the other half of it), [ADR-0031](0031-sbom-cyclonedx-dari-lockfile-pada-rilis.md) (the release writes the SBOM), [ADR-0030](0030-aturan-tertulis-mendapat-pemeriksanya.md) (a rule that is only written down is a rule that drifts), [ADR-0039](0039-english-is-the-source-language.md) (the shrink-only ledger, the same shape of bound), Issue #80

## Context

### The backlog was measured, and nothing could see it

`v0.2.0` was tagged on **8 August 2026**. On **28 August 2026** — twenty days
later — **thirty changesets** were waiting behind it. Nine of them are `minor`
entries, each a capability a reader would notice:

- a site states its own identity from the CMS
- category and tag archives
- a section stops rendering its whole history into one document — pagination
- a reader can search and filter
- an opt-in author byline
- an article offers something next when it is finished
- editor-configured menus and widgets
- galleries stop rendering as placeholders
- a visit beacon that leaves nothing on the reader's device

Among the `patch` entries are two security fixes: **HSTS was never actually
sent in production**, and the **nanoid advisory** was closed through an
override. A site operator running `v0.2.0` had no released version containing
either.

Every gate in this repo was green for those twenty days. That is not a gate
failing; it is the absence of one. `audit:dokumen` opens `.changesets/` to
resolve links, `bun test` opens each file to validate its frontmatter, and
neither has ever been able to ask **how many are waiting, and since when**.

### ADR-0040 answered "how big", and left "when" to memory

Before ADR-0040 the release level was typed at the command line by whoever ran
the script. That decision moved the judgement to the author, at the moment they
could make it, and the release now derives its version from the largest waiting
`bump`. It was the right half of the problem to solve first.

The half it left is scheduling, and scheduling was left to whoever remembered.
Memory is not a mechanism, and its failure looks exactly like everything being
fine — which is the class of defect [ADR-0030](0030-aturan-tertulis-mendapat-pemeriksanya.md)
exists to name.

### It is worse for a template than for an application

This repo is a **template**. Sites are derived from it with "Use this template"
and then diverge; they do not track `main`. A site started in August got
`v0.2.0` and had no tagged upgrade path to search, to archives, to pagination,
or to the HSTS fix. `docs/awcms-astro/checklist-repo-baru.md` walks an operator
through deriving a site, and for twenty days there was no released version
containing any of it.

An application deploys from `main` and its users never see a version number. A
template's version number is the only thing its consumers have.

## Decision

**The waiting backlog has two bounds, and crossing either one is what says a
release is due. `bun run audit:rilis` checks them, and it runs in CI's `check`
job like every other gate that needs no build and no network.**

### 1. At most twelve changesets may wait

Twelve is derived from this repo's own measured rate, not chosen for
roundness: thirty changesets landed in the twenty days after `v0.2.0`, so
twelve is roughly eight days of work at the pace that produced the backlog this
bound exists to prevent.

This bound moves when a pull request is **merged**, so the person who sees it go
red is the person whose merge crossed it.

### 2. The oldest waiting changeset may be at most fourteen days old

Two weeks is the longest a derived site should have to wait before it can
**pull** a security fix. Both security fixes above sat unreleased for fourteen
days; an operator who cannot upgrade has no way to act on either.

### 3. A changeset must carry a date its own name declares

`.changesets/README.md` has always required `YYYY-MM-DD-summary.md`, and nothing
has ever checked it. The gate now does, because a file it cannot date never
ages: it would sit in the backlog invisible to the one check built to see it.
Two shapes are refused by name — a name with no date prefix, and a date the
calendar does not have (`2026-02-31`, which `new Date` answers for by rolling
into March). A date **more than one day ahead** is refused as well: its age is
negative, so it can never cross a deadline, and it would look like a typo while
never doing so.

The day of slack is not decoration, and it was bought on this gate's first CI
run. The author names the file in their own zone — WIB — and the runner keeps
UTC, so for the seven hours after midnight in Jakarta every changeset written
that day is dated "tomorrow" as far as the runner is concerned. The gate
reddened a correctly named file and named the author's own calendar as the
fault. No zone is more than one calendar day ahead of UTC, and a checker running
in the author's own zone needs no slack at all; a changeset dated a month out —
the shape the rule exists for — is still refused.

### 4. The releaser does NOT run this gate

`bun run release` folds every waiting changeset and deletes it — it is the act
that clears the backlog. Running the gate inside the releaser would refuse the
one operation that fixes what the gate is complaining about, on exactly the
releases large enough to matter.

## Consequences

- **A backlog can no longer be a silence.** The signal Issue #80 asked for —
  "a 22-changeset backlog is itself the signal" — is now emitted by a machine
  rather than noticed by a person.
- **The age bound can redden a run nobody caused.** No commit is needed to cross
  it; a day passing is enough. This is accepted here, and the reason is the cost:
  the red asks the contributor who sees it for **nothing**, `main` carries no
  required checks, so it informs without blocking any merge, and a maintainer
  clears it with one command.
- **The bounds are cheap to obey and cheap to read.** The gate reads file names
  in one directory. It adds no build, no network call, and no dependency.
- **Releases become more frequent and smaller.** A twelve-entry changelog
  section is read; a thirty-entry one is scrolled past.
- **A derived site inherits the bounds and may delete them.** The gate says so
  rather than staying quiet: with no `.changesets/` directory it prints that it
  read nothing, which is the difference between a gate that found nothing and a
  gate that looked at nothing.

## Rejected

- **A calendar cadence — "release every second Monday".** It fails in both
  directions: it cuts an empty release on a quiet fortnight, and it says nothing
  at all when nine features land in nine days. The backlog is the thing that
  matters, so the backlog is what is measured.
- **A scheduled workflow that fails weekly instead of a gate in `check`.** It
  keeps unrelated pull requests green, which is its whole appeal, and it puts
  the only signal in a place a person has to go and look at. The failure mode
  this decision exists to end is precisely a signal nobody looks at.
- **A count bound alone.** Thirty entries is loud, but two `patch` entries
  containing security fixes can wait a month without ever reaching a count
  bound. Age is what an operator actually experiences.
- **An age bound alone.** A single day can produce a release worth cutting; the
  measured rate here is a changeset and a half per day.
- **An escape hatch — an env var or a marker file to silence the gate.** A
  bypass with no expiry becomes the configuration, and then the gate is green
  over a backlog nobody is measuring. The escape is to cut the release.
- **Blocking merges on it.** `main` has no branch protection, and adding it for
  this would make a scheduling signal into a barrier to the very pull requests
  that would fix things. Red here is information.
