🇬🇧 English (source) · 🇮🇩 [Bahasa Indonesia](0038-kebutuhan-backend-menjadi-modul-di-awcms.id.md)

# ADR-0038 — A backend need becomes a MODULE in `awcms`, and this repo stays backend-free

- **Status:** Accepted
- **Date:** 14 August 2026
- **Related:** [ADR-0034](0034-publik-secara-bawaan-admin-hanya-bila-dinyatakan.md) (who may have a SCREEN here), [ADR-0020](0020-layar-admin-kembali-ke-awcms.md) (admin screens return to `awcms`), [ADR-0018](0018-kontrak-build-token-mesin-dan-traversal-konten.md) (the read-class build token), [ADR-0014](0014-rendering-campuran-dan-bff-portal.md) (declared on-demand routes, and the BFF), [ADR-0030](0030-aturan-tertulis-mendapat-pemeriksanya.md) (a written rule must bring its checker), `awcms` [ADR-0070](https://github.com/ahliweb/awcms/blob/main/docs/adr/0070-peran-keluarga-awcms-astro-memikul-publik-dan-admin-user.md) (the family roles), `awcms` [ADR-0012](https://github.com/ahliweb/awcms/blob/main/docs/adr/0012-module-admission-and-trusted-registry-boundary.md) (module admission), `awcms` [ADR-0092](https://github.com/ahliweb/awcms/blob/main/docs/adr/0092-machine-credentials-may-write.md) (machine credentials may write), `awcms` [ADR-0094](https://github.com/ahliweb/awcms/blob/main/docs/adr/0094-a-data-subject-is-answered-per-tenant.md) (every table answers the data subject's question)

## Context

That `awcms` is this repo's backend is written everywhere: in the first line of
[`README.md`](../../README.md), in §What this repo is of
[`AGENTS.md`](../../AGENTS.md), in the family roles table, and in the `role` of
the `awcms`-side family manifest, which says this repo is "never being a source of
truth".

All of those sentences are **negative**, and a negative never gives an address.
Not one of them says what the **unit** of a backend need is, where it goes, or how
somebody knows they are building one.

[ADR-0034](0034-publik-secara-bawaan-admin-hanya-bila-dinyatakan.md) answers an
adjacent question but not this one: it decides **who may have a screen here** —
public as the primary function, USER admin when declared, SYSTEM admin never. It
does not answer **where a new capability is built**, and that question comes
first: a screen draws something that already exists.

### Why this needs a decision rather than being taken as obvious

Because the shape of its violation is not defiance; it is the most reasonable step
available.

A derived site needs a contact form that is stored, a newsletter subscription, a
member directory, or a download counter. The need is real and looks small. The
nearest thing from where that person is standing is one route here plus one
"temporary" table somewhere — and **every gate in this repo stays green**: not one
of them checks a dependency class,
[`tests/peran-situs.test.mjs`](../../tests/peran-situs.test.mjs) only demands that
an on-demand route be **declared** (not that it owns no data), and
`bun run audit:konten` reads the build output, where a table does not appear.

Its cost is not architectural tidiness. Data born here is born **outside** every
machine this family built for it: outside RLS, outside the permission catalogue,
outside the audit trail and its two-sided attribution, outside retention
descriptors, and — since 13 August 2026 — outside the data subject descriptors
`awcms` gates through `subject-data:coverage:check` (`awcms` ADR-0094). A table
that never passed module admission is a table that **cannot answer "what do you
store about me"**, and nobody will know it cannot: the completeness gate over
there only sees tables that are over there.

## Decision

### 1. The unit of a backend need is a MODULE in `awcms`

Not a folder here, not "a small service alongside", not a table in a database that
happens to already exist.

Its address is concrete and already has its governance: a module lands in
`awcms`'s own `src/modules/`, is registered in its registry, through module
admission (`awcms` ADR-0012 and
[21_module_admission_governance.md](https://github.com/ahliweb/awcms/blob/main/docs/awcms/21_module_admission_governance.md)
over there).

**Why the address is what decides, rather than merely "in the repo next door":**
the family's obligations attach to a **module**, not to code. A module carries its
descriptor, its permissions in the catalogue, its tables under RLS, its audit
trail, its retention descriptors, and since `awcms` ADR-0094 its data subject
descriptor too. Not one of those obligations has anywhere to attach on code living
in this repo — not because it is forbidden, but because the machinery is not here
and will not be built here.

Its work-order consequence is already written and does not change: **`awcms`
first, always** ([ADR-0034](0034-publik-secara-bawaan-admin-hanya-bila-dinyatakan.md)
§4).

### 2. What counts as "backend", and what may still live here

A definition usable for deciding, not a slogan. A piece of work is backend if it
does any of these:

- **stores or is the authority** over data that is not a file in this repo;
- **decides permissions** — who may do what;
- **runs business rules** whose correctness may not depend on which site called
  them;
- touches anything **cross-tenant**;
- provides a surface called by **someone other than this site itself**.

What **stays** here, and is not an exception but a different kind of thing:

| Stays here | Why it is not backend |
| --- | --- |
| [`server/penyaji.mjs`](../../server/penyaji.mjs) | It serves static files and sends headers. It owns no data, decides no permissions, and its being up or down changes the truth of nothing |
| Build-time reads ([`src/lib/awcms/client.ts`](../../src/lib/awcms/client.ts)) | It copies what is already true in `awcms` into static files. Its copy goes stale, and that is a declared property (ADR-0018) |
| The Jualanku portal BFF ([ADR-0014](0014-rendering-campuran-dan-bff-portal.md)) | It **assembles** `awcms` calls for this site's own screens. It owns not one row of data, and may not start owning any |

The third row is the easiest to drift, so its boundary is written once more in
other words: a BFF may **call, assemble, and hide credentials**; it may not
**store, decide, or become the last reference**. A write cache is data ownership
under another name.

### 3. This repo READS `awcms`; it does not write

Until 13 August 2026 that sentence needed guarding by nobody: machine credentials
could not write, full stop. `awcms` ADR-0092 withdrew that class property — a
write class now exists — so "this build cannot change anything" turns from an
inherited guarantee into a **property that has to be guarded on two sides**:

- on the `awcms` side, at token **issuance** (the
  [ADR-0018](0018-kontrak-build-token-mesin-dan-traversal-konten.md) banner, and
  [`.env.example`](../../.env.example), which names two read keys and not one
  write action);
- on the **code** side, by the §4 gate below.

One consequence is deliberate and is named now so it is not read as a defect
later: **the day the ADR-0014 BFF lands, that gate is red.** A write path from
this repo is a decision that must be **declared** — its credential is a different
class, with mandatory CIDR, a fail-closed refusal when the caller's address is
unknown, and a maximum age of 30 days (`awcms` ADR-0092). That gate's redness is
what forces the decision to be written rather than smuggled in as one `fetch`
option.

### 4. Its checker lands with its rule

[ADR-0030](0030-aturan-tertulis-mendapat-pemeriksanya.md) applies in full.
[`tests/tanpa-backend.test.mjs`](../../tests/tanpa-backend.test.mjs), four
assertions, each proven red by mutation before it landed:

| Assertion | The defect it guards |
| --- | --- |
| No **backend-class** dependency in [`package.json`](../../package.json) — database drivers, ORM/query builders/migration tools, server frameworks, queue/shared-cache clients, and session/password/token-issuing libraries | One `bun add` is the entire distance between this template and a backend. No other gate in this repo reads dependencies by their CLASS |
| No `fetch` with a `method` other than `GET` in `src/` and `scripts/` | §3 — a write path landing without being declared |
| No persistence artefacts: `.sql` files, migration directories, ORM configuration | A schema landing before its code, after which "it is already there" becomes an argument |
| `AGENTS.md` still states this rule | A working contract that ages into being wrong is what makes the next piece of work land in the wrong repo — the same pattern as `tests/peran-situs.test.mjs` item 5, and it has already happened here (ADR-0020 §Consequences) |

**What this gate does NOT see**, stated so it is not taken for guarded: it checks
**shape**, not intent. A derived site storing its data in a third-party service
through `GET` calls to their API passes every assertion above. What a template can
do is close the road most likely to be taken — and say which one is not closed.

## Refused

- **"A small backend, just for this site."** A capability used by more than one
  site lives in `awcms` **once** (`AGENTS.md` §This repo's role). Two copies are
  two places to patch, and the second usually does not get patched. What makes
  this refusal not rigidity: "just for this site" is a status that lasts until a
  second site needs the same thing, and nothing marks that day.
- **A proxy that "stores just a little".** See §2: a write cache is data ownership
  under another name, and it becomes the last reference on the first day `awcms`
  cannot be reached.
- **Leaving it as prose.** This rule has been morally in force since ADR-0020, and
  had not one checker in all that time. Prose does not go red.
- **Gating it through a dependency allowlist.** Every new legitimate package would
  become work, and a gate that is troublesome about correct things gets switched
  off. A denylist by **class** states what is forbidden along with its reasoning,
  and stays silent about everything else.

## Consequences

- A derived site needing a new capability follows the order already written in
  [`permukaan-admin-user.md`](../awcms-astro/permukaan-admin-user.md) §7: make sure
  the capability has its module and its management screen in `awcms` first, agree
  its contract there, and only then draw its screen here.
- This repo becomes **deliberately more boring**. That is the point: a template
  that can grow a backend is a template whose every derivative grows a different
  backend.
- **Not a reversal** of ADR-0014 or ADR-0034. An authenticated surface may still
  exist when declared; what is decided here is what may exist **behind** it.
- Adding an `awcms` surface that is called still turns
  [`tests/kontrak-awcms.test.mjs`](../../tests/kontrak-awcms.test.mjs) red, and the
  two work in the same direction: one keeps this repo from growing a backend, the
  other keeps it from calling the backend next door without a contract.

## Relationship with `awcms`

This decision creates **no** new divergence, so there is no entry to request in
the family manifest over there (`awcms` ADR-0068). That manifest already writes
this repo as "never being a source of truth" in its `role`, since `awcms`
ADR-0070.

What is new is not the sentence but that the sentence finally has an **address**
(a module, through `awcms` ADR-0012 admission) and a **checker** on this side.
