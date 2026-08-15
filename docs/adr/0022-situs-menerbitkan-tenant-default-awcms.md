🇬🇧 English (source) · 🇮🇩 [Bahasa Indonesia](0022-situs-menerbitkan-tenant-default-awcms.id.md)

# ADR-0022 — This site publishes the `awcms` DEFAULT (owner) tenant

- **Status:** Accepted
- **Date:** 2 August 2026
- **Owner's rule:** 2 August 2026 — "for the `ahliweb/awcms-astro` repo, also refer to the default tenant (owner) in the `ahliweb/awcms` repo."
- **Refines:** [ADR-0018](0018-kontrak-build-token-mesin-dan-traversal-konten.md) — the tenant still comes from the machine token; this ADR states WHICH tenant may be referred to, and how that statement is made checkable.
- **Related:** [ADR-0021](0021-tahan-pengembangan-menunggu-fondasi-awcms.md) (the development hold — still in force), `awcms` [ADR-0053](https://github.com/ahliweb/awcms/blob/main/docs/adr/0053-platform-scoped-permissions.md) (the platform tenant & platform-scoped permissions), `awcms` [ADR-0054](https://github.com/ahliweb/awcms/blob/main/docs/adr/0054-tenant-provisioning.md) (tenant provisioning), `awcms` [ADR-0055](https://github.com/ahliweb/awcms/blob/main/docs/adr/0055-development-confined-to-awcms-and-awcms-astro.md) (development confined to these two repos)

## Context

ADR-0018 settled **how** the tenant is determined: the machine token carries it (`awcmsm_<32 hex tenant id>_<secret>`), and `AWCMS_TENANT_ID` is an **assertion** that fails the build when the two differ. That is true and does not change.

What was never stated is **which** tenant. As long as `awcms` could only have one tenant, the question meant nothing — and that was the state of things until 2 August 2026, because `POST /api/v1/setup/initialize` claims the `awcms_setup_state` singleton and therefore succeeds exactly once.

Two changes in `awcms` on the same day gave the question meaning:

- **ADR-0053** introduced the **platform tenant** — the tenant holding cross-tenant authority, resolved `PLATFORM_TENANT_ID` → `PUBLIC_DEFAULT_TENANT_ID` → `PUBLIC_DEFAULT_TENANT_CODE` → `awcms_setup_state.tenant_id`. It also derives the `single`/`multi` **tenancy mode** from the number of active tenants.
- **ADR-0054** made a second tenant **possible**.

Since then, "which tenant does this site publish" is a question with more than one possible answer.

## Decision

**A site built from this repo publishes the `awcms` DEFAULT (owner) tenant** — the same tenant `awcms` resolves as its platform tenant.

The mechanism **does not change**, and that is deliberate:

1. The machine token (`AWCMS_API_TOKEN`) is **issued from that default tenant**, and remains the only thing that selects a tenant.
2. `AWCMS_TENANT_ID` is filled in with that tenant's uuid, so the build fails when the token and the assertion do not match.

What this ADR adds is **how to be sure**: the `/admin/tenants` screen in `awcms` (ADR-0054) marks the platform tenant with a `platform` badge, and its uuid is on the same row. That is the correct source for `AWCMS_TENANT_ID` — not a guess, and not whichever tenant's token happened to be on the clipboard.

### Why it is NOT verified over the network

The obvious candidate is for the build to ask `awcms` "is my tenant the platform tenant?". That is **refused**, and the reason belongs to `awcms`, not to convenience:

- `GET /api/v1/auth/session` **refuses machine credentials with the same 401 as an unknown token** (`awcms` ADR-0049 §Anti-oracle). Making it answer for machine credentials would turn that endpoint into a classifier for whatever bearer somebody is holding.
- A new endpoint that answered it would mean **widening the build token's permissions**, which today are `["blog_content.posts.read"]` and no more. A leaked build token must not be able to read the platform posture.

The build-time assertion already catches the mistake that actually happens — **the wrong token pasted in** — and catches it without adding a single surface.

## Consequences

- **Positive:**
  - The "which tenant" question has a written answer before `awcms` is genuinely multi-tenant, rather than after the first site publishes somebody else's articles.
  - Zero code changes and zero new surfaces: the mechanism has existed since ADR-0018.
- **Negative / accepted trade-offs:**
  - `AWCMS_TENANT_ID` is **optional**, so a deployment that leaves it empty checks nothing. That remains a valid choice (ADR-0018 §Assertion) — but once `awcms` enters `multi` mode, leaving it empty means accepting that a wrong token will not be visible until somebody reads the articles.
  - If `awcms` one day deliberately separates the landing-page tenant from the platform tenant (`PLATFORM_TENANT_ID` filled in separately — `awcms` ADR-0053 §Consequences), this ADR has to be re-read: "default" and "platform" stop being the same tenant, and this repo has to choose one of them explicitly.
- **Neutral:**
  - [ADR-0021](0021-tahan-pengembangan-menunggu-fondasi-awcms.md) still applies. This is a document, not feature development.

## Alternatives considered

- **An `awcms` endpoint that states the platform tenant** — refused; see §Why it is NOT verified over the network.
- **Making `AWCMS_TENANT_ID` mandatory** — refused for now: ADR-0018 deliberately made it optional so a trial deployment can run without copying a uuid. Making it mandatory is a reasonable change once there is a real `multi` deployment, and deserves its own ADR at that point.
- **Inferring the default tenant from `AWCMS_API_URL`** — refused: an origin tells you nothing about a tenant, and inferring what is not known is exactly the "a value that reads like configuration and decides nothing" pattern this repo has repeatedly written rules against.
