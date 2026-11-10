# CarikBot Reference — Safe Channel-Neutral Conversation UI

**Document version** v1.0.0 | **Date** 2026-11-10 | **Status** F0 design reference; no runtime code, shipped API or platform parity implied.
**Changeset** Research CarikBot menu/form/intent concepts for the product's presentation boundary, with explicit status, legal constraints, security and tests.

## Verified reference and limits
[CarikBot ecosystem](https://github.com/CarikBot/ecosystem) describes a mind-map-to-JSON interaction tree, category/package manifests, and generic text/menu/button/form responses. The [API specification](https://github.com/CarikBot/ecosystem/blob/main/docs/api-structure.md) includes channel/user metadata, action callbacks and form handlers. [Carik engine](https://github.com/luridarmawan/Carik) describes older SimpleBOT/SimpleAI, FastPlaz and Pascal handlers. The ecosystem's npm manifest advertises MIT but the engine's [LICENSE.txt](https://github.com/luridarmawan/Carik/blob/master/LICENSE.txt) gives no explicit permission to reuse engine code. **Take architecture ideas only**; do not import code or assume operational compatibility. The ecosystem test script is a placeholder, so there is no audited quality parity.

## Candidate contract, not implemented
- Response.kind: text | choice | typed_form | handoff | status; may include approved text and an accessibility equivalent.
- A choice contains a human-readable label and an **opaque signed short-lived transition token**, never a raw bot command or provider URL.
- Form is driven by a versioned server-owned JSON Schema; input validation also happens server-side; consent and cancellation are explicit.
- Provider capability mapper chooses buttons, list, link or numbered text fallback, never asserts that a provider supports an element based on another provider's interface.
- Domain read/write MUST be an authenticated, named operation through an existing canonical backend API. Client/provider UI cannot grant access, create payment mutations or send a campaign independently.
- AI-generated suggestion is untrusted draft only. Human approval / pre-approved low-risk policy and fresh provider+consent authorization remain mandatory before any outbound message.
- All content is escaped, HTML rendering is restricted, and untrusted links are validated. No arbitrary callback URL POST/SSRF.
- No cross-tenant, secret, password, raw SQL, provider bearer token, .env, session cookie or unmasked conversation body in logs, tool context, telemetry or screenshots.

~~~json
{
  "version":"1.0.0",
  "response":{"kind":"choice","text":"What do you need?",
     "choices":[{"label":"Support","transition_token":"signed-opaque-ref"}]},
  "fallback":{"kind":"text","text":"Reply 1 for Support"},
  "correlation_id":"uuid"
}
~~~

## Ownership, governance, and status
**Existing:** only behavior explicitly present in current repository files and verified test environments is considered shipped. **Proposed:** this reference's response contract is a candidate, not a published OpenAPI schema. **External:** Hermes owns agent runtime; AWCMS owns tenant/canonical records, approvals and sender policy; OMES owns host assurance; derivative apps do not take ownership of provider credentials or new business data systems.

## Threats and mandated negative tests
| Threat | Test/acceptance |
|---|---|
| Injected markup, malicious link | Escape labels/response, block unsafe navigation or remote callback |
| Forged provider callback / token reuse | Reject invalid/expired/scope-mismatched transition |
| Wrong tenant and account | Existing backend authorization/ABAC/RLS denies operation |
| Revoked consent | Future outbound action denied even if response drafted earlier |
| Duplicate form submit | Idempotency key yields one accepted transaction |
| Endless/deep flow | Maximum depth, steps, size, TTL and cancellation bounded |
| Unexpected platform capability | Accessible text fallback; no data loss |
| AI tool injection | Non-executable draft; tool allowlist and explicit human/domain approval |
| Network outage | Explicit loading/retry/safe cancellation, never fake success |
| Sensitive-data logging | Metadata and correlation ID only; no personal-content leak |

## Seven+ test journeys
1. Public FAQ -> approved answer; no sensitive data requested.
2. Menu with three choices -> provider supports buttons; all choices map correctly.
3. Unsupported buttons -> numbered text fallback and accessible choice.
4. Typed survey -> validation, consent, cancellation and persisted draft policy.
5. Order lookup -> unauthorized account denied, authorized user sees only own status.
6. Handoff -> preserves only consented scoped context, sends no privileged action.
7. Revoked message consent -> draft displayed privately but never dispatched.
8. Malicious callback -> reject before any side effect.
9. Two-device resume -> revision pinned and stale token rejected.
10. Network retry -> no duplicate domain mutation.

## Design standards and legal conditions
WCAG 2.2 AA for web and equivalent accessibility semantics on native surfaces; OWASP ASVS/API Top 10; ISO/IEC 27001, 27002, 27005, 27034, 27701 and 42001; ISO 20000-1 and ISO 22301 for operational safety/continuity. ISO 27017/27018 where public-cloud PII processors are involved. ISO/IEC 15408 only if a separate formal evaluation target is defined. Indonesian UU 27/2022 PDP and PP 71/2019 PSTE apply subject to legal role/scope; Perpres 95/2018 SPBE may apply to government products. Never infer legal compliance merely because documentation cites a standard.

**Release gate:** the internal cross-portfolio standard requires 18-step development planning, a human cross-spec Definition of Ready (step 9), atomic issue/PR and verified tests, staging and UAT, then human Go/No-Go (step 15). Research docs alone do not authorize production deployment.


## Specific boundary: Astro public pages and declared USER admin

**Owning issue:** https://github.com/ahliweb/awcms-astro/issues/166. Upstream context: https://github.com/ahliweb/awcms-astro/issues/127 (UI design) and https://github.com/ahliweb/awcms/issues/1253 (AWCMS canonical conversation and flow contract). Astro remains the public/USER-admin web/BFF experience; SYSTEM admin lives in AWCMS. No new provider sender, chatbot engine, business data store or runtime agent here.

### Proposed user journey
- Public static site displays sanitized published FAQ and optional contact entrypoint, preserving SEO, canonical URL and SSG where appropriate.
- A user chooses a service. Frontend only presents a server-issued opaque transition token, not raw arbitrary action text.
- Authenticated operations use existing official API/BFF with request validation, CSRF/Origin protections as applicable and short-lived credentials; no API secret in the bundle.
- Server returns a typed response with explicit expiry/consent policy. Astro escapes output and checks CSP and accessibility.
- If interaction needs a provider or support agent, backend policy performs assignment/send; Astro only shows authorized status.

### Astro-specific acceptance
1. SSG content remains crawlable; no forced SPA rewrite.
2. Authenticated USER-admin access remains session-gated and does not become SYSTEM admin.
3. CSP and link rendering prevent XSS/unsafe navigation from model/user text.
4. Keyboard, screen reader, focus, form error and mobile responsive behavior tested.
5. Opt-out and retention policy shown at form submission.
6. No provider bearer token, secret or private inbox data in rendered HTML/static payload.
7. Actual backend capabilities verified by OpenAPI and negative tests; unknown endpoint is documented as planned.
8. Web Push/SSE/WS are not substituted for actual provider delivery receipts.

### Proposed outcomes
A wireframe, a minimal typed UI renderer prototype (after approval), mock contract suite, and a test matrix for mobile/desktop browsers. Full implementation is deferred until upstream AWCMS contract and DoR are approved. No public website runtime calls Hermes directly.

## Changelog
- v1.0.0 (2026-11-10): Research scope, candidate contract, threats, acceptance; zero runtime changes.
