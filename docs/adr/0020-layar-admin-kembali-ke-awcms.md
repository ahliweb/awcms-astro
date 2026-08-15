🇬🇧 English (source) · 🇮🇩 [Bahasa Indonesia](0020-layar-admin-kembali-ke-awcms.id.md)

# ADR-0020 — Owner/internal admin screens return to `awcms`; this repo is purely public + BFF again

- **Status:** Accepted
- **Narrowed by:** [ADR-0034](0034-publik-secara-bawaan-admin-hanya-bila-dinyatakan.md)
  (8 August 2026) — the sentence "**This repo carries no admin screens**" in
  §Decision applies to **SYSTEM** admin screens. A site may carry a **USER**
  admin surface if it declares one through `permukaanAdmin`, with `owner` refused
  by a gate. This ADR is **not** superseded: its core reasoning — moving a screen
  was never a security control — is not contradicted, and not one of its gates is
  loosened. `awcms` answered from its side with
  [ADR-0070](https://github.com/ahliweb/awcms/blob/main/docs/adr/0070-peran-keluarga-awcms-astro-memikul-publik-dan-admin-user.md),
  which narrows its ADR-0051 the same way. The sentences below are **not
  rewritten**; they were true on 2 August 2026, and editing them would falsify
  the record.
- **Date:** 2 August 2026
- **Supersedes:** [ADR-0017](0017-peran-admin-owner-internal.md) (this repo carries the owner/internal admin pages)
- **Counterpart in `awcms`:** [ADR-0051](https://github.com/ahliweb/awcms/blob/main/docs/adr/0051-admin-screens-consolidated-in-awcms.md) — the same decision, taken in the repo that owns the data, superseding `awcms` ADR-0048
- **Related:** [ADR-0014](0014-rendering-campuran-dan-bff-portal.md) (mixed rendering + the Jualanku BFF — **unchanged**), `awcms` [ADR-0045](https://github.com/ahliweb/awcms/blob/main/docs/adr/0045-jualanku-porting-awcms-system-of-record-astro-bff.md) (this repo's role as experience layer + BFF), `awcms` [ADR-0049](https://github.com/ahliweb/awcms/blob/main/docs/adr/0049-machine-credentials-and-session-introspection.md)/[ADR-0050](https://github.com/ahliweb/awcms/blob/main/docs/adr/0050-bff-session-handoff-code.md)

## Context

ADR-0017 gave this repo a second role: **the owner/internal admin pages**. It was
the local side of `awcms` ADR-0048, and it was written honestly — including the
admission that its first screen could not yet be built because two contracts in
`awcms` did not exist.

Since then two things happened in `awcms`, and both moved in the opposite
direction from ADR-0017.

**First, the obstacle disappeared.** Both contracts ADR-0017 named as blockers
landed in `awcms` on 1 August 2026: read-only machine credentials (ADR-0049) and
the BFF session handoff (ADR-0050). So the ADR-0017 road opened.

**Second, and precisely because of that, `awcms` deliberately closed it.**
ADR-0051 supersedes ADR-0048 and decides that **every admin screen — tenant as
well as owner/internal/platform — is built in `awcms`**, under a single `/admin/*`
shell. Its reasoning has three parts, and all three concern this repo:

1. **The old rule was never followed by the code that already existed.**
   `/admin/*` in `awcms` had already mixed tenant and platform since before
   ADR-0048; that rule therefore bound only **new** screens, creating two classes
   of screen distinguished by their date of birth rather than by their nature.
2. **Its cost was modules with no screen at all.** The `awcms` admin surface
   audit (1 August 2026) found **13 of 21 modules with not a single screen** —
   125 route files usable only through `curl`. Some were waiting on this repo,
   which had no admin screen at all.
3. **Moving a screen was never a security control.** This is the point that
   voids ADR-0017's premise rather than merely weakening it. ADR-0017 §Decision
   item 2 had already written it down itself — "permissions do not move with the
   screen" — without drawing its conclusion: if the permissions do not move,
   **the risk does not move either**. `awcms` proved it with a real case: the
   region dataset activation permission was seeded into the `owner` role of EVERY
   tenant, so an ordinary tenant's owner held the permission to change data
   served to every tenant — exactly the risk that repo separation claimed to
   prevent. What holds it back is an authorisation gate, not the address of the
   repo where the button is drawn.

That decision was executed, not merely written: nine admin screen PRs landed in
`awcms` on 1–2 August 2026 (`/admin/audit-trail`, `/admin/form-drafts`,
`/admin/site-search`, `/admin/theming`, `/admin/seo`, `/admin/data-lifecycle`,
and others).

## Decision

**This repo carries no admin screens.** ADR-0017 is superseded.

Its role goes back exactly to `awcms` ADR-0045, which never changed: **the
experience layer + the only BFF** for the public and Jualanku surfaces. What is
withdrawn is only its role as the home of internal admin screens.

| Repo          | Frontend role                                  | Audience                          |
| ------------- | ---------------------------------------------- | --------------------------------- |
| `awcms`       | the public frontend + **ALL** admin            | visitors, tenant admins, platform operators |
| `awcms-astro` | the static public site + experience layer/BFF  | anonymous readers, Jualanku users |

What **still applies** and must not be deleted along with ADR-0017:

- **ADR-0014 does not change.** On-demand routes + the Jualanku portal BFF
  (`/penjual/**`, `/affiliate/**`, `/_portal-api/**`) are an ADR-0045 role, not an
  admin role. Its prerequisites remain in
  [`04-kesiapan.md`](../awcms-astro/jualanku/04-kesiapan.md).
- **ADR-0017's four rules still bind the Jualanku BFF surface**, because all four
  concern any authenticated surface: `awcms` remains the system of record;
  permissions are decided by `awcms` and a surface here is not a second, looser
  path; there is no shared cache between public and authenticated surfaces; and
  every addition is judged as a security surface. All four moved into `AGENTS.md`
  §This repo's role so they are not lost along with a superseded ADR.
- **The ADR-0049 machine credentials are still used**, for what they are actually
  used for here: the build token that pulls content (ADR-0018). That never
  depended on an admin role.

## Consequences

- **This repo returns to the "public" class.** ADR-0017 §Consequences recorded as
  a cost that this repo "stops being just a static site"; that cost is cancelled.
  The `output: 'static'` premise and every ADR resting on it are whole again —
  with one exception that already existed and still does: the ADR-0014 Jualanku
  on-demand routes.
- **No code has to be deleted.** The admin screens here never existed; ADR-0017
  itself stated its first screen was blocked. What changes is only documents —
  and that is exactly why this ADR has to be written now: a working contract
  telling an agent to build admin screens here will be followed by the next
  agent, and their work will land in the wrong repo.
- **The platform screens once planned here are built in `awcms`**, subject to the
  platform-scoped gates ADR-0051 §Decision requires. Those are gates this repo
  could never have provided, because the permission catalogue lives in `awcms`.
- **The two repos' CSP postures remain comparable**, and can now be compared
  directly because each is public-plus-authenticated on its own side. See
  [ADR-0019](0019-csp-ketat-dikirim-penyaji.md); this repo's policy is stricter on
  `script-src` because it has no inline script needing a hash.
- **The `awcms-mini`/`awcms-micro` freeze is untouched.** That is `awcms`
  ADR-0047's decision, and ADR-0051 does not change it.
