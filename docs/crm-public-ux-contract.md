🇬🇧 English (source) · 🇮🇩 [Bahasa Indonesia](crm-public-ux-contract.id.md)

# AWCMS-Astro public lead, channel-consent and realtime consumer UX v1.0

**Proposed documentation, 24 October 2026** · issue [#127](https://github.com/ahliweb/awcms-astro/issues/127). This repo is an Astro public frontend and optionally declared USER admin/BFF — **not** the AWCMS SYSTEM admin, provider sender, CRM customer master or OMES host. Follow existing [AGENTS.md](../AGENTS.md), [Bun runtime ADR](adr/0050-bun-is-this-repos-only-runtime-and-a-gate-finally-says-so.md), [realtime boundary #123](https://github.com/ahliweb/awcms-astro/issues/123) and [AWCMS-One CRM UX master #472](https://github.com/ahliweb/awcms-one/issues/472).

## 1. What is available vs planned

| Surface | Evidence/state | Design action |
| --- | --- | --- |
| Public Astro pages, navigational components, structured content, SEO/sitemap | IMPLEMENTED per repository main, site configuration determines content | Preserve static-first public pages, route hierarchy, responsive nav and assets |
| Optional USER admin/BFF | ARCHITECTURE DECLARED, actual site must opt in | Hide for sites without explicitly declared USER admin; no SYSTEM owner controls |
| Contact/lead intake wired to generic CRM prospect module | PLANNED (upstream AWCMS #1163/#1166) | Render only after public API contract and validated consent/privacy purpose exist |
| Omnichannel social follow/share links | MAY EXIST as simple website links | Distinguish links from authenticated social provider accounts |
| Consent preferences / customer Web Push | PLANNED per derived product; AWCMS-One #430–#432 | Opt-in UI only when API/Service Worker registration is available |
| Campaign/progress SSE/WS client | PLANNED after upstream AWCMS #1168/#1171 | Bun server connection only through authorized API; polling fallback |
| Email/WhatsApp/Telegram/social send worker | NOT OWNED HERE | Never ship; use upstream AWCMS Bun channel ports/queue |
| Bun runtime | Current pin bun@1.4.2, latest verified stable 1.4.4 | Upgrade issue [#125](https://github.com/ahliweb/awcms-astro/issues/125), library freshness [#126](https://github.com/ahliweb/awcms-astro/issues/126) |

## 2. UX navigation and wireframes

Public site: responsive header/logo/site nav and search, useful contextual CTA “Contact”, optional trusted social follow links, content/offer detail, footer privacy links. No fake “connected Instagram inbox” or “Chat now” direct API capability just from a linked profile. For a derived site that adopts CRM, lead capture lives on a public contact or product/service inquiry screen. Desktop form in main content column, context/privacy summary beside it; mobile form stacks and the primary CTA remains visible but never hides legal notices.

### Web-F1 Lead inquiry (planned)
Fields: display name (mandatory only where business needs), validated contact method (email/phone), message or product interest, **optional** provider preference, source campaign UTM captured server-side, explicit separate opt-in for email marketing and WhatsApp marketing, required privacy notice acknowledgment only when lawful basis requires it; never bundle optional marketing consent with necessary service contact. Hidden server-generated request/session anti-spam context, no uncontrolled file upload by default. UX statuses: empty, typing, invalid format, double submit, pending, success with **reference number but no unverified conversion**, throttled, blocked, offline, server error. Preserve values on retry, use aria-describedby for errors, and do not expose arbitrary backend diagnostic detail to anonymous users. Do not convert a submission into a registered customer without a verified business event.

### Web-F2 Privacy & notification settings (planned)
My preferences (authenticated customer only): show purpose-specific opted-in/out state, timestamp/source, supported channels, change and withdrawal confirmation, privacy export/delete link. Web Push enrollment needs an explicit click, browser permission state and explanatory copy; iPhone Home Screen installation instructions only when relevant. Browser does not keep SSE/WS active when closed. With no backend support, render trustworthy off/unavailable state rather than a toggle that pretends to save.

### Web-F3 Public channel actions
“Follow on Instagram/TikTok/YouTube/LinkedIn/Facebook/Telegram” are outbound external links with accessible descriptions and safe rel/target; no conversion attribution unless verified allowed callback. “Send WhatsApp” via wa.me is an ordinary user-initiated link, not a backend StarSender/Meta API sender. Social login, DM, customer chat, and connected inbox are separately gated by upstream provider rights.

### Web-F4 Optional USER-admin status badge (planned)
Where a site explicitly declares its USER admin and backend grants relevant permission, a tiny status module may consume one-way **Bun SSE** for approved campaign/workflow events; use native Bun WebSocket only for a documented duplex need and accepted upstream ADR. Tenant/site scoped short-lived auth (no bearer token in public JS/URLs), strict Origin/CSP connect-src, reconnection cursor+REST snapshot, no raw PII/secret in frames. Accessible text status Unknown/Stale/Queued/Provider Accepted/Verified Delivered. Anonymous public pages get no private event feeds. Mobile background cannot imply persistent WS connection.

## 3. Component specification
Reuse Astro components and current design tokens rather than importing a new admin UI kit. States: InputField, ConsentCheckbox, PrivacyHint, FormStep, FeedbackBanner, SocialLink, ConnectionStatus (only authenticated), NotificationToggle (only after API), RetryAction, AccessibleStatusTable. Keyboard Tab/Enter/Escape, WCAG 2.2 AA contrast, 44px practical touch targets where appropriate, visible focus, reduced motion, ARIA error links and accessible alternate text. At ≥1200px two columns where readable; 768–1199px collapsible help; ≤767px stacked content. Keep public content indexable/crawlable per current SSG/SSR-approved architecture and avoid customer info in build-time output.

## 4. Trust, privacy and telemetry
AWCMS upstream validates form input, CSRF/anti-bot/abuse, tenant/domain ownership, lead idempotency and consent source; browser never infers customer match across social handles. No source UTM or contact PII in unauthenticated analytics. TLS, CSP connect-src allowlist, redirect allowlist, safe URL scheme and sanitized error notices. Do not put provider API key, token, personal conversation or secret in client bundle, initial HTML or browser localStorage.

## 5. Acceptance and issue dependency
AT-W1 keyboard/mobile 360px input and valid/error/retry; AT-W2 anonymized opt-in/opt-out with purpose separation; AT-W3 synthetic two tenants and cross-site form submission rejected; AT-W4 Web Push closed-browser behavior distinguished from realtime connection; AT-W5 SSG SEO/sitemap/robots/CSP and optional USER admin constraints; AT-W6 provider link does not imply API connection; AT-W7 Bun 1.4.4 upgrade staged separately, Bun build/tests and no Node runtime. Repo commands: bun test, bun run check, bun run build, bun run audit:translation and documentation/asset gates. Client/producer contracts follow AWCMS #1168 and #1166. **No new public route or API is shipped in this docs-only issue.**
