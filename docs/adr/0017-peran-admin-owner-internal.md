🇬🇧 English (source) · 🇮🇩 [Bahasa Indonesia](0017-peran-admin-owner-internal.id.md)

# ADR-0017 — This repo carries the OWNER/INTERNAL admin pages, alongside its public site

- **Status:** Superseded by [ADR-0020](0020-layar-admin-kembali-ke-awcms.md)
  — `awcms` [ADR-0051](https://github.com/ahliweb/awcms/blob/main/docs/adr/0051-admin-screens-consolidated-in-awcms.md)
  consolidates EVERY admin screen in `awcms` and supersedes ADR-0048, this ADR's
  counterpart. The four rules in §Decision still bind the Jualanku BFF surface
  and have moved to `AGENTS.md`; what falls away is only where the screens live.
- **Date:** 31 July 2026
- **Owner's rule:** 31 July 2026 — "do everything directly in `awcms-astro` per its role as the frontend for owner/internal admin pages, and `awcms` per its role as the public / public-admin frontend."
- **Counterpart in `awcms`:** [ADR-0048](https://github.com/ahliweb/awcms/blob/main/docs/adr/0048-frontend-role-split-awcms-astro-internal-admin.md) — the other side of the same decision, recorded in the repo that owns the data.
- **Related:** [ADR-0014](0014-rendering-campuran-dan-bff-portal.md) (mixed rendering + BFF), [ADR-0015](0015-runtime-bun-menutup-divergence-keluarga.md) (the Bun runtime), `awcms` [ADR-0047](https://github.com/ahliweb/awcms/blob/main/docs/adr/0047-mini-micro-frozen-foundation-built-here.md) (freezing mini/micro, and two contracts still deadlocked).

## Context

Until today this repo is a **static public site**: content pulled at build time, no database, no authenticated surface. ADR-0014 already opened one measured exception (on-demand routes + the Jualanku portal BFF), but the frame stayed "public".

The owner's rule of 31 July 2026 adds a second role that cannot be derived from any existing document: **the owner/internal admin pages are built here**, while `awcms` holds the public frontend and the tenant's own admin.

Why this needs an ADR rather than a line in AGENTS.md: that new role changes **this repo's class from "public" to "public + authenticated"**, and a number of older decisions were written assuming the older class.

## Decision

This repo carries **two** surfaces, held firmly apart:

| Surface | Audience | Nature |
| --- | --- | --- |
| The public site (today) | anonymous visitors | static, built, may be cached aggressively |
| **Owner/internal admin (new)** | platform operators, internal staff | on-demand, authenticated, **never cached together with the above** |

The rules binding both:

1. **`awcms` remains the system of record.** This repo has no database, no tables, and never touches the `awcms` PostgreSQL. Every internal admin datum comes from `/api/v1/*` through this repo's **BFF** (ADR-0014) — an internal browser never calls `awcms` directly and never holds its credentials.
2. **Permissions do not move with the screen.** Every action is still evaluated by `awcms`'s default-deny RBAC/ABAC. A screen here may not become a second, looser path; if an action needs a permission, it needs that permission from here too.
3. **No shared cache between the public surface and the admin surface.** A cache serving anonymous visitors may not touch an authenticated response — that is the easiest kind of leak to create and the hardest to see.
4. **Every addition to the admin surface is judged as a security surface**, not merely as a page: what is rendered, what is logged, what is kept in a cookie/localStorage, and what happens when a session expires.

## What blocks the first internal screen (real, not hypothetical)

`awcms` ADR-0047 already records two contracts that **do not exist**, and both stand squarely in this path:

1. **The tenant headers do not match.** `awcms` reads `x-awcms-tenant-id`; this repo sends `X-Tenant-Code`/`X-Tenant-Id`.
2. **There is no credential a service can hold.** The bearer `awcms` accepts is a user's hashed session token; there is as yet no machine/internal-session credential a BFF could hold.

The consequence is stated honestly: **the first internal admin screen cannot be built until both contracts land in `awcms`.** This ADR settles **where** that screen lives and **which rules** bind it — it does not claim the road is open.

## Consequences

**Positive**

- "Where should this screen live?" has a written answer in both repos, with the same reasoning, before the first line of code is written.
- The public surface can still be optimised for anonymous visitors without compromising for the needs of an internal screen.

**Negative / accepted costs**

- This repo stops being "just a static site". Every older ADR resting on that premise has to be re-read when it is touched — ADR-0016 (serving by Bun) is already compatible because Bun runs a process, but its premise changes.
- The cross-repo API contract has to be kept in sync; that is a real cost, and the reason this repo must call `/api/v1` rather than growing its own data path.
