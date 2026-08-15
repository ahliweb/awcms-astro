🇬🇧 English (source) · 🇮🇩 [Bahasa Indonesia](0034-publik-secara-bawaan-admin-hanya-bila-dinyatakan.id.md)

# ADR-0034 — Public as the primary function; USER admin only when declared, principal admin never

- **Status:** Accepted
- **Date:** 8 August 2026
- **Owner's rule:** 8 August 2026 — "this repo is by default … a public page unless it is also declared an admin page", sharpened twice in the same conversation: "it may only be an admin page for users, not the principal admin (owner)" and "besides its primary function as a public page".
- **Narrows:** [ADR-0020](0020-layar-admin-kembali-ke-awcms.md) (this repo carries no admin screens at all) — it does **not** supersede it; see §Relationship with ADR-0020
- **Related:** [ADR-0014](0014-rendering-campuran-dan-bff-portal.md) (static-by-default + on-demand routes — its pattern is reused here), [ADR-0017](0017-peran-admin-owner-internal.md) (the four authenticated-surface rules that still apply), [ADR-0023](0023-penahanan-dipersempit-pekerjaan-tanpa-awcms.md) (the "rewritten if `awcms` changed?" test), [ADR-0030](0030-aturan-tertulis-mendapat-pemeriksanya.md) (a new rule must bring its checker), `awcms` [ADR-0045](https://github.com/ahliweb/awcms/blob/main/docs/adr/0045-jualanku-porting-awcms-system-of-record-astro-bff.md), `awcms` [ADR-0051](https://github.com/ahliweb/awcms/blob/main/docs/adr/0051-admin-screens-consolidated-in-awcms.md) (every admin screen consolidated over there)

## Context

`AGENTS.md` §This repo's role has read, since ADR-0020: **"This repo carries no
admin screens."** That sentence is absolute, and its absoluteness answers the
wrong question.

What ADR-0020 actually decided is that **SYSTEM admin screens** — modules, roles,
tenants, the audit trail, anything cross-tenant — are built in `awcms`, because
moving a screen was never the security control it was claimed to be. That reason
is still true today, and this ADR does not touch it.

What ADR-0020 never asked: **whether a site's USER may do their own part on that
site.** A writer composing an article for a news site is not a platform operator.
They manage no modules, touch no other tenant, and need not one of the screens
`awcms` ADR-0051 consolidated. They need one place to write, to submit for review,
and to manage their profile — on the domain of the site they are filling.

That absolute sentence forbids it, and not one of ADR-0020's reasons actually
applies to them.

### Why this needs a decision rather than merely being permitted

Because its failure mode is silent, and it is a shape this repo already knows.

`output: 'static'` is this template's premise: the container never contacts a
database, and its entire security posture rests on that. One route file with
`export const prerender = false` is enough to void it — and **nothing fails**. A
green build, a published site, and an authenticated surface standing on a domain
whose owner never decided to have one.

A rule permitting an admin surface must therefore arrive together with a way to
DECLARE it, and a way to refuse what is not declared.

## Decision

### 1. Public is the PRIMARY function, not merely the default

This repo, and every site born from it, is a **public page**. That is its original
state and stays its principal state even when an admin surface is declared.

An enforced consequence, not merely a written one: `permukaanAdmin.prefiks` may
**not** be `/`, may not be a locale prefix, and may not be a tab's slug. All three
would put the public part behind a login — and the site would still build green.
Every one of its pages is there; every one of them now asks its reader to log in
first.

### 2. Admin only when DECLARED, through one door

`permukaanAdmin` in [`src/config/site.ts`](../../src/config/site.ts), empty by
default:

```ts
export const permukaanAdmin = {
  prefiks: [] as readonly string[],
  peran: [] as readonly string[]
};
```

Empty means this site is public only. The two move together: a route with no role
is an authenticated surface nobody can enter, and a role with no route is a
permission leading nowhere while reading like a surface that exists.

### 3. Admin for USERS, never the PRINCIPAL ADMIN

This is the boundary, and it is not a nuance of the previous item.

| | Allowed here | Where it belongs |
| --- | --- | --- |
| A user doing their own part on this site — writing, submitting for review, managing their profile | **Yes**, when declared | `awcms-astro` |
| Managing the SYSTEM — modules, roles, tenants, the audit trail, anything platform-scoped | **Never** | `awcms`'s own `/admin/*` |

`owner` is therefore **refused** from `permukaanAdmin.peran`. It is the complete
system super-manager; a site that could admit it here is a second door to the
whole platform, drawn on top of a template. Its refusal is mechanical — `bun test`
red — not an exhortation.

### 4. No feature exists ONLY here

This template is indeed meant to grow into **many variations** — each derived site
with its own public surface and, when declared, its own user admin surface,
according to what its users need to manage. What may not vary is one thing:

> **Every feature a user works with on this site's admin surface MUST also be
> manageable by an `owner` through `awcms`'s own `/admin/*`.**

This rule runs in the opposite direction to §3 and precisely for that reason
completes it. §3 keeps `owner` from getting IN here; this item keeps anything here
from getting AWAY from `owner`. Without the second, a derived site could grow
capabilities that are invisible, unaudited, and impossible to withdraw from the
place that is supposed to hold full control — exactly the "second door" §3 closes,
only entered from the other side.

Its practical consequence, and this is what settles the work order:

- **A user surface here is a PROJECTION of a capability that already exists in
  `awcms`, not a new capability.** Its data stays there, its permissions stay
  decided there, and its audit trail stays recorded there.
- **If a feature cannot yet be managed by an `owner` in `awcms`, it may not appear
  here.** The order is `awcms` first, always — not out of bureaucracy, but because
  a feature landing here first is a feature that for a while nobody can switch off.
- **"Variation" means the shape of the surface, not the set of capabilities.** Two
  derived sites may differ greatly in what they show and how; both still stand on
  the same capabilities, owned and controlled by `awcms`.

**How far this can be gated, and how far it cannot** — stated because
[ADR-0030](0030-aturan-tertulis-mendapat-pemeriksanya.md) demands it:

`tests/kontrak-awcms.test.mjs` hardens the list of `awcms` surfaces this repo
calls to exactly three, and demands it match the marked table in the integration
skill in both directions. A new user admin feature **certainly** adds a fourth
surface, so it cannot land silently: that gate goes red, and its author is forced
to state what they added.

What **cannot** be machine-verified from this repo: whether the capability behind
that surface really has an `owner` screen in `awcms`. The permission catalogue and
the screen registry live there, and this repo has no instance to ask. That is a
human judgement at review time, and writing it up as "gated" would be a claim
nobody could stand behind.

### 5. One `awcms`, many sites

The topology is one-directional and needs stating, because every item above
changes meaning if it is read as though there were only one site:

> An `awcms` instance may own **many** site repos — each with its own public pages
> and, when declared, its own user admin pages. All of them still refer to the same
> `awcms` as their **backend** and as their **principal admin (`owner`)**.

A derived repo is therefore not "the system"; it is one face of one system. What
follows from that:

- **A site may never assume it is the only one.** Its tenant comes from its own
  build token, with `AWCMS_TENANT_ID` as a cross-assertion
  ([ADR-0018](0018-kontrak-build-token-mesin-dan-traversal-konten.md)); that is
  already the right path for this topology, and it does not change.
- **`owner` manages EVERYTHING from one place.** That is exactly what is lost when
  §4 is broken: a capability existing in only one site puts a hole in the owner's
  control precisely at that site, and the hole is invisible from any `/admin/*`.
- **A capability used by several sites lives in `awcms` ONCE**, not copied per
  site. Two copies of one capability are two places to patch when one of them is
  wrong — and the second usually does not get patched.
- **"Many variations" therefore means many SURFACES on one foundation**, not many
  similar foundations.

### 6. Declaring it moves not one permission

The ADR-0017 item ADR-0020 preserved, and it is what makes this ADR not a
reversal: **`awcms`'s default-deny RBAC/ABAC still decides every request.** A
declaration here draws a button; it grants nothing, and a role `awcms` refuses
stays refused with its button on display.

ADR-0017's three other rules apply in full to this surface, exactly as to the
Jualanku BFF: `awcms` remains the system of record and this repo has no database;
there is no shared cache between public and authenticated surfaces; and every
addition is judged as a **security surface**, not merely as a page.

### 7. Its checkers land with its rule

[ADR-0030](0030-aturan-tertulis-mendapat-pemeriksanya.md) applies in full.
`tests/peran-situs.test.mjs` enforces every item above against the CODE, not
against the documents:

- the template declares zero admin surfaces, and genuinely has no on-demand route
  — two separate checks, because configuration and code can disagree and what
  decides what is served is the code;
- every `prerender = false` route must be under a prefix declared by
  `permukaanAdmin` **or** under the ADR-0014 Jualanku BFF prefix — this is what
  makes "public by default" an enforced state;
- `owner` is refused, whatever its capitalisation;
- a prefix that swallows the public surface is refused;
- a half declaration is refused;
- `AGENTS.md` must name `permukaanAdmin` and the forbidden role — a working
  contract that ages into being wrong is what makes the next piece of work land in
  the wrong repo, and that has already happened here (ADR-0020 §Consequences).

## Relationship with ADR-0020, and with `awcms` ADR-0051

This ADR **narrows** ADR-0020; it does not supersede it. What stays whole: every
SYSTEM admin screen is built in `awcms`, and its reason — moving a screen is not a
security control — is contradicted nowhere above.

There is a tension with `awcms` ADR-0051, and writing it down is more useful than
tidying it away: that ADR decided **"every AWCMS admin screen — tenant as well as
owner/internal/platform — is built in the `awcms` repo"**. The word "every"
includes tenant screens, and the USER surface this ADR permits sits close to that
boundary.

What lets both live together is the replacement gate ADR-0051 itself requires, and
which is in fact its reasoning: **a repo is no longer an audience boundary, so the
boundary is stated where it is enforced.** A cross-tenant action must have a
platform-scoped gate in `awcms`, and its permission may not be seeded into tenant
roles. As long as that holds, a USER surface here cannot become a looser path — it
is subject to the same gates, and `owner` cannot pass at all.

> **What had to be done on that side — DONE, on 8 August 2026.** This difference
> deserves recording as a family divergence in `awcms`'s own
> `awcms-family-compatibility.yaml`, following the `awcms` ADR-0068 pattern — with
> an owner and a `reviewDate`, so it returns to the table rather than being
> rediscovered as a finding. This repo cannot write that itself; what can be done
> here is not to pretend the difference does not exist.
>
> **`awcms` answered with ADR-0070** ("The family roles: `awcms-astro` carries
> public pages and the USER admin surface"), which **NARROWS** its ADR-0051 rather
> than superseding it: the axis dividing screens shifts from AUDIENCE to **what is
> managed**, SYSTEM admin stays over there, and none of ADR-0051's three
> replacement gates is loosened at all. The entry
> `admin-user-surface-in-awcms-astro` enters its family manifest with a
> `reviewDate` of 2027-02-04 — and what is reviewed on that date is not whether
> USER admin may live here, but **whether its boundary is still in the same
> place**. The tension in this section therefore stops being a difference recorded
> nowhere, and becomes a difference with a file, an owner, and a date.

## Consequences

- **No admin surface code lands today.** What lands is its rule, its declaration,
  and its gates. The template stays public only, and `bun test` is what proves it.
- **Its implementation is still held by the ADR-0023 test**, exactly like the
  Jualanku BFF and for the same reason: an authenticated surface calls `awcms` on
  EVERY runtime request, so its shape is decided by an `awcms` response on every
  request — and this template repo has no instance to prove it. What this ADR
  opens is its permission, not its hold.
- **`output: 'static'` remains the premise.** An admin surface is a DECLARED
  exception, the same shape as ADR-0014, not a change of render mode.
- **A site declaring an admin surface takes on costs a public site does not have**:
  sessions, CSRF, caches that must be separated, and the whole ADR-0019 posture on
  a path that now carries credentials. That is why its declaration is explicit — so
  those costs are chosen rather than inherited.
- **What is most likely to be misread**, and therefore written here: this ADR is
  **not** permission to rebuild `awcms`'s admin screens in this repo under another
  name. The measure is not who uses it but what it manages — if a screen changes
  something outside this site's contents, it belongs to `awcms`.

## Alternatives considered

- **Leaving ADR-0020's absolute rule as it was** — refused. It forbids something
  not one of its reasons applies to, and a ban wider than its reasoning is a ban
  that gets broken silently.
- **Permitting an admin surface without a declaration**, relying on review —
  refused. Its failure mode is a green build with an authenticated surface nobody
  ever decided on; review does not look at files that were not changed.
- **Permitting `owner` when the site is "small"** — refused. A site's size does not
  change what an owner can do, and an exception resting on an adjective is an
  exception with no gate.
- **Listing the PERMITTED roles instead of refusing `owner`** — refused: an
  allowlist over a role catalogue that lives in `awcms` would age every time
  `awcms` adds a role, and its ageing takes the form of a site refusing a
  legitimate role. What is stable is the single ban.
