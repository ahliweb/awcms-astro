🇬🇧 English (source) · 🇮🇩 [Bahasa Indonesia](0057-awcms-first-orders-ownership-and-contract-not-code-and-three-gates-separate-design-mock-and-release.id.md)

# ADR-0057 — "`awcms` first" orders ownership and contract, not code, and three gates separate design, mock-based build, and release

- **Status:** Accepted
- **Date:** 20 November 2026 (proposed and accepted the same day)
- **Clarifies, without changing a norm:** [ADR-0034](0034-publik-secara-bawaan-admin-hanya-bila-dinyatakan.md) §4 ("`awcms` first, always") and [ADR-0038](0038-kebutuhan-backend-menjadi-modul-di-awcms.md) §1 (a backend need becomes a MODULE in `awcms`). Neither ADR is rewritten; each keeps its text.
- **Related:** [ADR-0014](0014-rendering-campuran-dan-bff-portal.md) (declared on-demand routes, and the BFF), [ADR-0020](0020-layar-admin-kembali-ke-awcms.md), [ADR-0030](0030-aturan-tertulis-mendapat-pemeriksanya.md) (a written rule must bring its checker), [ADR-0056](0056-accessibility-is-gated-by-axe-in-a-real-browser-with-no-exceptions.md) (the stand-in `awcms` is a markup fixture, not a contract mock), `awcms` [ADR-0065](https://github.com/ahliweb/awcms/blob/main/docs/adr/0065-awcms-astro-consumer-contract-is-frozen.md) (frozen consumer contract), `awcms` [ADR-0156](https://github.com/ahliweb/awcms/blob/main/docs/adr/0156-adopt-development-flow-v2-validated-ux-before-data-model-frontend-backend-integration-per-slice.md) (flow v2: frontend, then backend, then integration, per slice), issue #186

**Docs and governance only.** This ADR adds no code, route, dependency, endpoint, database or gate change. It records how two already-accepted sentences are read together. It moves no norm, but it fixes an interpretation that `awcms` ADR-0156 and this repo's ADR-0034/0038 both depend on; it was first written as Proposed and the owner accepted it on 20 November 2026 (see §Decision record).

## Context

Two accepted texts can be read against each other.

- ADR-0034 §4 and `AGENTS.md` say the order of work is "**`awcms` first, always**", because a feature that lands here first is a feature nobody can switch off for a while. ADR-0038 says a backend need is a module in `awcms`, never a folder here.
- `AGENTS.md` workflow rule 6, which adopts flow v2 (`awcms` ADR-0156), says step 11 runs per slice as 11.1 frontend here (against the `awcms` contract and a mock generated from it), then 11.2 backend as a PR in `awcms`, then 11.3 integration.

Read literally and separately, the first can mean "no line here before the handler is merged in `awcms`", and the second can mean "build the screen now, the backend will follow". Applied together by two people who each read only their own text, the first blocks the second and the second ships a screen with nothing behind it. Neither reading is what the texts were written for:

- The harm ADR-0034 §4 names ("a feature nobody can switch off") needs the feature to **reach users**. Work on a branch against a mock reaches nobody.
- Flow v2 never allows the frontend to ship alone. Its step 11.3 swaps the mock for the real backend and runs the contract test on both sides, and `awcms` ADR-0156 §3 says authorisation stays enforced in the backend and database.

So the two are compatible in **ownership** and were ambiguous only in **order**. This ADR names the order.

## Decision

### 1. "`awcms` first" is about three things, in this order

It is read as: **(a)** the need and its backend owner are named, **(b)** the contract is agreed in `awcms`, **(c)** the capability is manageable by `owner` through `awcms`'s `/admin/*` (ADR-0034 §4 item 4) — and (c) must be true **no later than the release here that exposes the feature**, not before the first line is written.

It is **not** read as a requirement that the handler be merged in `awcms` before a frontend branch may start, and it is **not** read as permission to release a frontend that has no real backend.

### 2. Three different gates

| Gate | Question it answers | What must exist | What it allows |
| --- | --- | --- | --- |
| **A. Design readiness** | Is there something real to draw against? | The backend need and its owner named: an existing `awcms` module, or a module that has been through `awcms` ADR-0012 admission, or "no backend: a build-time read". The contract operations the screen needs, agreed in `awcms` (flow v2 step 8 and gate 9 there). Every screen state has a data source in that contract. The permissions the operations require are named. How `owner` will manage the capability is named. | Frontend work may start. **No ERD, schema or handler is required for this gate.** |
| **B. Build against a mock** | Does the screen work in every state? | A mock **generated from the agreed contract**, never hand-written to match the screen. The screen exercised in all states (empty, loading, error, no permission, backend unavailable at build). | Frontend implementation and review (flow v2 step 11.1 and 12). |
| **C. Integration and release readiness** | Does the real thing work, and can the owner run it? | The capability exists in `awcms` (merged, and available in the environment the site builds against). The `owner` management screen exists there. Contract tests pass on both sides, and `tests/kontrak-awcms.test.mjs` is updated together with `awcms` when a new surface is called (ADR-0038 §Consequences). An end-to-end check against the real backend, **not** the stand-in. The mock is out of the shipped path. | A release that includes the feature (flow v2 step 11.3, gate 15). |

A mock, a stand-in server, or a green mock-based test never substitutes for gate C. This repo's own stand-in (`e2e/awcms-tiruan.mjs`) is a fixture for markup, and says so in its header; it is not a contract mock and does not satisfy gate B either, because it is hand-written.

### 3. Guardrails that apply at every gate

- **Authorisation is never enforced only here.** A screen draws a button; `awcms`'s default-deny RBAC/ABAC and RLS decide. A mock may return a "no permission" answer so the state can be built; it never decides one.
- **The mock holds no data this repo owns.** It lives outside shipped code paths (tests, e2e, a development script), writes nothing, and no production build falls back to it. A fallback that serves content when `awcms` cannot be reached is data ownership under another name (ADR-0038 §2).
- **No database, local backend, own endpoint or public SSR is introduced** by following this order. `tests/tanpa-backend.test.mjs` and `tests/peran-situs.test.mjs` apply unchanged.
- **A gap found at B goes back to the contract**, not into a silent adjustment of the screen or the mock (flow v2 §3).

### 4. What `awcms-astro` is, restated (no change)

A build-time consumer for the public static site, and, only where a site declares `permukaanAdmin`, a USER-admin surface and the ADR-0014 BFF that composes `awcms` calls. It is not a system of record, owns no database and no domain write, and the SYSTEM admin stays `awcms`'s own.

## Refused

- **"Frontend first, contract later."** It reproduces what flow v2 was adopted to prevent in the other direction: a screen whose data source is a guess, found out at integration.
- **"The handler must be merged in `awcms` before any frontend branch starts."** It makes the two repos wait on each other and buys no safety, since the safety is at gate C.
- **"A mock-green build is releasable."** Gate C exists because nothing in a mock proves the backend, the permission catalogue or the `owner` screen exist.
- **"Mock data committed under `src/` so the site still builds without `awcms`."** That is content this repo owns, and the first thing that survives the day `awcms` is unreachable.
- **Leaving it unwritten.** Two sentences that read against each other stay ambiguous until someone pays for the ambiguity.

## Consequences

- `AGENTS.md` workflow rule 6, [`permukaan-admin-user.md`](../awcms-astro/permukaan-admin-user.md) §7 and [`checklist-repo-baru.md`](../awcms-astro/checklist-repo-baru.md) §2 state the three gates and point here, and their Indonesian mirrors say the same.
- `tests/tanpa-backend.test.mjs` gains one check that `AGENTS.md` and its mirror still say a mock never substitutes for the release gate (ADR-0030: a written rule brings its checker). Like the rest of that file it checks shape, and it cannot tell whether a PR honoured the order; that stays a review judgement.
- **Not gated, and written so it is not taken for guarded:** that a mock was generated from the contract; that the mock stays out of shipped code; that gate C's real-backend check was run against a real instance. The first is blocked by tooling `awcms` ADR-0156 itself lists as a gap (no generator from OpenAPI), the third by this template repo having no `awcms` instance. The reviewer carries them.
- No change to ADR-0034 or ADR-0038 text. Their readers find this decision through the ADR index and the working contract.

## Decision record

Owner decisions, 20 November 2026 (chosen in a dialog; recorded as chosen, nothing added):

1. **Accept this ADR; do not amend ADR-0034 §4 in place.** Accepted on 20 November 2026. ADR-0034 and ADR-0038 keep their text.
2. **Mock-stage frontend may merge to `main` before gate C, only when it is inert.** Inert means, as defined in this ADR's own proposal: the feature is inert in the template by default (nothing declared in `permukaanAdmin`, no new surface called by the build), so `main` stays releasable. A feature that is not inert stays on a branch until gate C. Decided on 20 November 2026.
3. **Where the snapshot of the contract lives (G-01 of [`ui-contract-inventory.md`](../ui-contract-inventory.md)) is decided on the `awcms` side.** `awcms` chose C′: a generator inside its repo and a pinned fixture package published for consumers (`awcms` ADR for C′, issue awcms#1379; the ADR number does not exist yet). This repo consumes that package; the implementation follows through a backlog issue and waits for gate 9 and for the package. Recorded on 20 November 2026.

Not decided here: a matching sentence on the `awcms` side stays that repo's call (its ADR-0156 is where "per slice" is owned).

## Relationship with `awcms`

This decision creates **no** divergence from the family contract, so there is no entry to request in the family manifest (`awcms` ADR-0068). It reads `awcms` ADR-0156 and does not restate its flow; where the two could disagree, `awcms` ADR-0156 wins for the flow and ADR-0038 for the address.
