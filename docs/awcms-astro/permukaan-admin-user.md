🇬🇧 English (source) · 🇮🇩 [Bahasa Indonesia](permukaan-admin-user.id.md)

# The USER admin surface — its shape, prerequisites, and boundary

This repo has **two** roles. The first — public pages — is described by every
other document in this directory. The second is this file.

Since [ADR-0034](../adr/0034-publik-secara-bawaan-admin-hanya-bila-dinyatakan.md)
a site born from this template **may** carry an admin surface for a **USER** — an
author, a reviewer, a contributor — alongside its public pages. This template does
not carry one itself, and most sites will not need one. This document is for those
that do.

> **This file restates ADR-0034 together with the `awcms` facts that shape it.**
> The checkers that already exist —
> [`tests/peran-situs.test.mjs`](../../tests/peran-situs.test.mjs) and
> [`tests/kontrak-awcms.test.mjs`](../../tests/kontrak-awcms.test.mjs) — enforce
> the part a machine can enforce: the `permukaanAdmin` declaration, on-demand
> routes, and the list of surfaces the build calls.
>
> **One thing here WIDENS an existing rule rather than restating it**, and it is
> named so it does not pass as a restatement: the WCAG 2.2 AA target in §3 now
> applies to every authenticated surface, not only Jualanku (ADR-0014). ADR-0034
> does not mention accessibility at all. It **has no checker** — as accessibility
> in this repo generally does not — so it is a human judgement at review, not a
> gate. For any other new rule,
> [ADR-0030](../adr/0030-aturan-tertulis-mendapat-pemeriksanya.md) applies in
> full: its gate must land in the same commit.

## 1. The boundary is WHAT IS MANAGED, not who uses it

This is the decisive sentence, and it deliberately names no job title:

| | Allowed here | Where it belongs |
| --- | --- | --- |
| A user doing **their own part on this site** — writing an article, submitting it for review, managing their profile | **Yes**, if their site declares it | this repo |
| Managing the **SYSTEM** — modules, roles, tenants, the audit trail, anything cross-tenant | **Never** | `awcms`'s own `/admin/*` |

The measure is **what the screen changes**, not who opens it. An `owner` writing
an article is doing USER work; a writer who can edit the role list is not doing
USER work, whatever their job title.

That axis is not this repo's choice alone: `awcms` moved it from AUDIENCE to WHAT
IS MANAGED through ADR-0070, which narrows its ADR-0051 rather than superseding
it. The difference is recorded as a family divergence named
`admin-user-surface-in-awcms-astro` with a `reviewDate` of 2027-02-04 — and what
is reviewed on that date is not whether USER admin may live here, but **whether
its boundary is still in the same place**. A surface that grows one screen per
quarter is the most natural way for a "USER admin" to turn into a system admin
with nobody deciding it.

## 2. How to declare it

One door, in [`src/config/site.ts`](../../src/config/site.ts), empty by default:

```ts
export const permukaanAdmin = {
  prefiks: [] as readonly string[],
  peran: [] as readonly string[]
};
```

Empty means this site is public only. The two move together: a route with no role
is an authenticated surface nobody can enter, and a role with no route is a
permission leading nowhere while reading like a surface that exists.

Five things that **turn `bun test` red** through `tests/peran-situs.test.mjs`:

1. `owner` in `permukaanAdmin.peran`, whatever its capitalisation. It is the
   complete system super-manager; a site that could admit it is a second door to
   the whole platform, drawn on top of a template.
2. A prefix that **swallows the public surface**: `/`, a locale prefix, or a tab's
   slug. All three put the public part behind a login while the site still builds
   green — every one of its pages is there, and every one of them now asks its
   reader to log in first.
3. A half declaration — a prefix with no role, or a role with no prefix.
4. A route with `export const prerender = false` whose prefix is in neither
   `permukaanAdmin.prefiks` nor the Jualanku BFF prefix
   ([ADR-0014](../adr/0014-rendering-campuran-dan-bff-portal.md)). This is what
   makes "public by default" an **enforced** state: one route file is enough to
   stand up an authenticated surface on a domain whose owner never decided to have
   one, with a green build.
5. `AGENTS.md` ceasing to name `permukaanAdmin` and the forbidden role. A working
   contract that ages into being wrong is what makes the next piece of work land
   in the wrong repo, and that has already happened here.

Configuration and code are checked **separately**, because the two can disagree
and what decides what is really served is the code.

## 3. What changes the moment one route leaves `output: 'static'`

Declaring an admin surface is not changing the render mode — it is a DECLARED
exception, the same shape as ADR-0014. But it moves this site from the "public"
class into the "public + authenticated" class, and a number of premises other
documents rely on fall with it:

| What changes | Why |
| --- | --- |
| **Sessions and CSRF become yours** | A site switching on `permukaanAdmin` carries its own sessions and CSRF. That is the cost [ADR-0034](../adr/0034-publik-secara-bawaan-admin-hanya-bila-dinyatakan.md) states explicitly so it is **chosen, not inherited** |
| **The public cache and the authenticated cache MUST be separated** | A cache serving anonymous visitors may not touch an authenticated response — the easiest kind of leak to create and the hardest to see |
| **The CSP posture applies on a path carrying credentials** | [ADR-0019](../adr/0019-csp-ketat-dikirim-penyaji.md) was written for public pages; the same policy now guards pages carrying a session |
| **OWASP A01, A07, and A09 apply again** | The matrix in [`standar-performa-dan-keamanan.md`](standar-performa-dan-keamanan.md) writes "not applicable" for most categories, **with its reasoning** — and it is that reasoning which stops being true here |
| **The accessibility target rises to WCAG 2.2 AA** | A controlled surface brings moving focus and touch targets; see [`ui-ux-design-system.md`](ui-ux-design-system.md) |
| **The cross-origin header posture must be RE-examined** | This repo's official reason for not sending COOP/CORP is "there is no session to fence off", and its reason for refusing SRI is "there are no cross-origin resources". Both are premises, not principles, and both fall here |

The four rules binding **every** authenticated surface in this repo — the BFF as
well as a site's admin — are in [`AGENTS.md`](../../AGENTS.md) §This repo's role.
In brief: `awcms` remains the system of record, permissions do not move with the
screen, there is no shared cache, and every addition is judged as a security
surface.

## 4. The contract to `awcms` that does NOT exist yet

This is the part most often underestimated, and it settles the work order.

The consumer contract between the two repos is **frozen on the `awcms` side**
(ADR-0065): five paths, three of which are genuinely called by this build and two
promised in advance through an ADR. **Not one of them is an auth path for an admin
surface.** Its shape has been decided by nobody, and that is stated plainly in
ADR-0070 §5 over there: the mechanism for promising a surface in advance does
exist; what does not exist is a shape to promise.

Its practical consequence, and it is mechanical: `tests/kontrak-awcms.test.mjs`
hardens the surfaces the build calls to **exactly three**, in both directions
against the marked table in the integration skill. A USER admin feature certainly
adds a fourth surface — so it **cannot land silently**: that gate goes red, and its
author is forced to state what they added. Its redness is not a nuisance; it is
what forces the contract to be agreed simultaneously in both repos rather than
discovered as a broken build days later.

## 5. The `awcms` identity model that must be IMITATED, not guessed

A USER admin surface calls `awcms` on **every runtime request**, not once per
build. Its shape is therefore decided by an `awcms` response on every request —
and that side moved fast in August 2026. What follows is not background; each item
changes a screen you would draw:

| `awcms` fact | Its consequence for a screen here |
| --- | --- |
| **A role can come from a GROUP** (ADR-0081): a user group is a SUBJECT that grants roles | Somebody's role can change **with no change at all to their own row**. Do not cache roles, and do not infer a role from profile data |
| **A grant carries its own scope** (ADR-0078, ADR-0080), and covers only what its role grants | Do not derive "what they may do" from a role's name on this side. Ask, do not infer |
| **One human, one credential, many tenants** (ADR-0085) | Your site's user may also be a user of another site on the same `awcms` instance. A screen reading "this site's account" misdescribes what they have |
| **A GLOBAL lockout counter** (ADR-0086) | UI copy saying "login attempts are only counted for this site" will **lie**. A failure on another site locks here too |
| **MFA belongs to the principal** (ADR-0087) | A reset by ANOTHER tenant's admin also disables this site's user's authenticator. A profile screen implying their MFA is local is wrong |
| **A login with no tenant selected is answered `409 MEMBERSHIP_SELECTION_REQUIRED`** along with a **single-use, 120-second** selection token (ADR-0088) | The login flow needs a second step, and that step has a clock. A selection token is not a session |
| **That `409` response deliberately does NOT carry the membership list** (ADR-0088 §"the `409` does NOT carry the membership list") | **Do not design a "which tenants am I a member of" screen** — that data will never be sent, and asking for it to be sent is asking to build an enumeration oracle. The caller names the tenant they want |
| **A session with `origin_auth` of `sso` or `handoff` MAY NOT switch tenants** (ADR-0088) | `handoff` is exactly the session shape ADR-0050 created for the BFF here. A tenant switcher on a surface using it will be refused, and its refusal is correct |
| **A delegated actor only READS in `identity_access`** (ADR-0090) | What is refused with a 403 is access-control authority — granting roles, creating groups, setting policy — **not** every authenticated screen. Its gate names one module and only one. A "manage your own profile" screen lives in the `profile_identity` module and is unaffected. Do not write an error message for a refusal that will not come, and do not forget to write one for the refusal that will |
| **Two-sided attribution** (ADR-0091) | An action records who acted AND on whose behalf. Do not display it as one name |
| **A `suspended` or `inactive` tenant → `403 TENANT_SUSPENDED`**, and a missing entitlement → `403 ENTITLEMENT_REQUIRED` (ADR-0073, ADR-0084) | Both are decided **before** permissions are looked up. A screen translating them into "your session expired, please log in again" sends people round in circles |
| **A suspended partner stops reaching → `403 PARTNER_SUSPENDED`** (ADR-0093), while the grant giving them access **still exists** | A third refusal with the same shape, and the most confusing to diagnose: its grant row is still there, so any screen displaying "access granted" will show access that no longer applies. Applicability is **computed**, not stored — do not copy `status` to this side and infer from it |
| **A data subject is answered PER TENANT** (ADR-0094): export and erasure are two separate authorities, and erasure is maker/checker paired | **Do not design a "forget me everywhere" button** — it does not exist and deliberately does not, because each tenant is a separate data controller. A user's request is answered in the tenant where they asked, and its surface is `/admin/subject-requests` in `awcms`, not here |

Every row above is the state of `awcms` as of the **evening of 13 August 2026** —
its last two landed after the earlier synchronisation on the same day. **Re-check
before building**: this list will age, and no gate in this repo can tell you when.

## 6. What is never built here

Not because it is hard, but because it manages the SYSTEM:

- **An audit trail or decision log view.** That is a cross-tenant surface, and
  `awcms` already has it complete with its two-sided attribution.
- **Role, permission, user group, or ABAC policy screens.** Their catalogue lives
  over there, and drawing their buttons here moves not one permission — it only
  makes people think the permissions moved.
- **A data subject request screen** — per-subject export, erasure, or its
  approval. An export is the most concentrated **disclosure** this system can
  produce, an erasure is irreversible and maker/checker paired through the SoD
  registry, and the two are gated by different permissions (`awcms` ADR-0094). Its
  surface already exists over there — `/admin/subject-requests` — and its report
  deliberately has **no** URL: it is rendered to a page and nowhere else. A
  projection here would give it a life outside the session that authorised and
  audited it.
- **Anything smelling of "partner roles" or "partner scopes".** In `awcms` a
  partner is an **ordinary tenant** and its reach is DATA, not permissions
  (ADR-0089). The family's permission vocabulary did not grow for that, and
  building a rival vocabulary here is the fastest way for the two repos to stop
  agreeing.
- **Consuming the `/api/v1/partner/**` surfaces.** Not a site's business.

Its mirror rule, running opposite to the whole list above: **no feature exists
ONLY here.** Every feature a user works with on your site's admin surface must
**also** be manageable by an `owner` through `awcms`'s own `/admin/*`. The first
keeps the platform from being reachable from here; the second keeps anything from
getting away to here.

## 7. The work order: `awcms` first, always

Not bureaucracy. A feature landing here first is **a feature that for a while
nobody can switch off** — and "a while" in practice means until somebody remembers
it.

1. Make sure the capability already has its management screen in `awcms`. The list
   of `/admin/*` screens available today is in
   [`integrasi-awcms.md`](integrasi-awcms.md) §The awcms `/admin/*` screens.
2. Agree the shape of its new surface in `awcms` and freeze its contract there
   (ADR-0065). Until that happens, `tests/kontrak-awcms.test.mjs` is red — and
   that is exactly its purpose.
3. Declare `permukaanAdmin` in your site, then build its screens.
4. Re-examine the header, cache, and accessibility posture per §3.

One thing that **cannot** be machine-verified from this repo, and is therefore
written rather than gated: whether the capability behind your surface really has
an `owner` screen in `awcms`. The permission catalogue and the screen registry live
over there, and this template repo has no instance to ask. That is a human
judgement at review time, and writing it up as "gated" would be a claim nobody
could stand behind.

## References

- [ADR-0034](../adr/0034-publik-secara-bawaan-admin-hanya-bila-dinyatakan.md) — public as the primary function; USER admin only when declared
- [ADR-0014](../adr/0014-rendering-campuran-dan-bff-portal.md) — static-by-default + on-demand routes, the pattern reused here
- [ADR-0023](../adr/0023-penahanan-dipersempit-pekerjaan-tanpa-awcms.md) — the "rewritten if `awcms` changed?" test, which still holds its implementation
- [`AGENTS.md`](../../AGENTS.md) §This repo's role — the four authenticated-surface rules
- [`integrasi-awcms.md`](integrasi-awcms.md) — the build contract, the imitated refusals, and the list of `awcms` screens
