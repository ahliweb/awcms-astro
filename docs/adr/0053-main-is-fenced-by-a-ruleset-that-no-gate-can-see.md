🇬🇧 English (source) · 🇮🇩 [Bahasa Indonesia](0053-main-is-fenced-by-a-ruleset-that-no-gate-can-see.id.md)

# ADR-0053 — `main` is fenced by a repository ruleset, and no gate in this repo can see it

- **Status:** Accepted
- **Date:** 26 October 2026
- **Related:** [ADR-0030](0030-aturan-tertulis-mendapat-pemeriksanya.md) (a written rule gets its checker — the rule this ADR can only half obey, and says so), [ADR-0052](0052-github-releases-are-part-of-this-repos-release-convention.md) (releases are cut from the merged commit on `main`; `audit:rilis` checks Releases, not commits), issue #137

## Context

### A written rule with nothing behind it

`AGENTS.md` has said "branch from `main`, do not commit straight to `main`", and
`docs/awcms-astro/standar-performa-dan-keamanan.md` has read "PS.1 — Met: branch
protection + review" for months. On 24 October 2026 a read-only audit (issue
#137) found neither was true of the repository itself:

| Check | Result |
| --- | --- |
| `GET /repos/ahliweb/awcms-astro/branches/main` → `protected` | `false` |
| `GET /repos/ahliweb/awcms-astro/rulesets` | `[]` |
| `GET /repos/ahliweb/awcms-astro/rules/branches/main` | `[]` (the owner is a User account, so no organisation ruleset can apply) |
| `delete_branch_on_merge` | `false` — ten merged branches were still on the remote |

The habit held because the only maintainer kept it. Nothing refused the
alternative. That is the shape `AGENTS.md` names elsewhere — a rule that reads
as guarded while nothing guards it — and the SSDF row was the clearest instance:
it claimed a control by name.

## Decision

### A repository ruleset, `main-protection`, enforced and with no bypass actor

Applied and verified on 26 October 2026 (ruleset id `25837340`, enforcement
`active`, target the default branch, **no bypass actors — administrators
included**):

| Rule | Setting |
| --- | --- |
| `deletion` | `main` cannot be deleted |
| `non_fast_forward` | force pushes are blocked |
| `pull_request` | a pull request is required; required approvals **0**; merge, squash and rebase all allowed |
| `required_status_checks` | strict (the branch must be up to date); contexts `Check` and `Build` (from `.github/workflows/ci.yml`) and `Analyze (javascript-typescript)` (from `codeql.yml`), each pinned to the `github-actions` integration (id 15368) |

Repository setting `delete_branch_on_merge` is `true`, so a merged branch
disappears on its own.

### Why required approvals is 0

The owner is a single-maintainer GitHub **User** account, and GitHub does not
let anyone approve their own pull request. Setting `1` would force every merge
through a bypass; a bypass actor would in turn reopen the direct push the
ruleset exists to close. The fence is therefore the **pull-request requirement,
the required checks, and the absence of any bypass** — not a second pair of
eyes. This ADR does not claim human review that the setup cannot provide;
SSDF `PW.7` ("Review code") is restated accordingly in the standards document.
When a second maintainer exists, raising approvals to 1 is a change made
through a new ADR, not a quiet edit.

### Why exactly those three contexts

They are the checks that exist, run on every `pull_request` without path
filters, and pass reliably. Requiring a check that sometimes does not report
leaves a pull request waiting forever; requiring a path-filtered one does the
same for every change outside the filter.

- **A green `Build` here does not mean the integration build ran.** `Build`
  always reports, but skips its integration steps when `vars.AWCMS_API_URL` is
  empty, which is the state of this template repo. A derived site that sets the
  variable gets the real build under the same context name.
- `Picu deploy Coolify` (`rebuild.yml`) is not a pull-request check and is not
  required.

### Verification (26 October 2026)

A direct fast-forward push and a force push to `main` were both rejected with
`GH013: Repository rule violations`; deleting `main` was refused;
`GET /repos/ahliweb/awcms-astro/rules/branches/main` returns `deletion`,
`non_fast_forward`, `pull_request` and `required_status_checks`. Release tags
are cut from the merged release commit on `main` (`v0.6.2` sits on `acfb507`,
the merged commit of PR #143).

A probe pull request (#144) carrying a deliberately failing test was also
opened: `Check` failed, `mergeStateStatus` was `BLOCKED`, and `gh pr merge` was
refused with "the base branch policy prohibits the merge". The PR was closed and
its branch deleted. The ruleset API reports `current_user_can_bypass: "never"`,
so the administrator cannot override it either.

**`Build` is not an independent fence.** `Build` declares `needs: Check`, so
when `Check` fails, `Build` reports as *skipped*, and GitHub counts a skipped
required check as satisfied. In that case the merge block comes from `Check`
itself, not from `Build`. Requiring `Build` still matters when `Check` passes
and `Build` fails; it must not be read as a second line of defence against a
failure `Check` already catches.

## What this does NOT cover — stated, not implied

- **Tags are not protected.** This is a branch ruleset; no ruleset covers tags.
  The maintainer could still push a tag. `audit:rilis` checks that every remote
  tag has a GitHub Release
  ([ADR-0052](0052-github-releases-are-part-of-this-repos-release-convention.md));
  it does not check that a tag points at a reviewed commit.
- **No gate in this repo can detect the ruleset being removed.** It lives in
  GitHub settings, not in a file that `bun test` or an `audit:*` script reads.
  [ADR-0030](0030-aturan-tertulis-mendapat-pemeriksanya.md) asks every rule for
  its checker; this one has none, and writing it down as "gated" would be the
  exact defect that ADR exists to prevent. It is **manually verified**, not
  machine-gated:

  ```bash
  gh api repos/ahliweb/awcms-astro/rules/branches/main --jq '[.[].type]'
  # expected: deletion, non_fast_forward, pull_request, required_status_checks
  ```

  Run it before a release and after any change to repository settings. The
  "State" column of the SSDF rows cannot be machine-gated either.
- **Zero approvals is a weaker control than review.** It stops an unreviewed
  push and a red build from reaching `main`; it does not stop a maintainer
  merging their own wrong change with green checks.

## Consequences

- A direct commit to `main` is refused by the platform, not only by habit; the
  contributing documents describe the real path (pull request, three checks,
  up-to-date branch, branch deleted on merge).
- A check renamed or removed in a workflow leaves the ruleset waiting for a
  context that never reports, and every pull request is stuck until the ruleset
  is edited. A derived site must re-check its own context names when it applies
  an equivalent ruleset
  ([`checklist-repo-baru.md`](../awcms-astro/checklist-repo-baru.md)).
- The release procedure is unchanged: the version commit goes through a pull
  request like any other, and the tag is cut afterwards from the merged commit.

## Alternatives rejected

- **Required approvals = 1 with the owner as a bypass actor.** Every merge would
  use the bypass, and a bypass actor can also push directly — the ruleset would
  read as strict and constrain nothing.
- **Requiring more contexts** (the Coolify trigger, or a path-filtered job).
  Neither is a pull-request check that reliably reports.
- **A gate that calls the rules API.** It would need a credential in CI that can
  read repository rulesets and would have to fail closed offline; that is not
  justified for a one-command manual check while there is one maintainer.
