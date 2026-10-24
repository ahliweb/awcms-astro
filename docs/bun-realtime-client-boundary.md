🇬🇧 English (source) · 🇮🇩 [Bahasa Indonesia](bun-realtime-client-boundary.id.md)

# Bun-only realtime consumer boundary for AWCMS-Astro (proposed)

> **Status: documentation/design only**. [Issue #123](https://github.com/ahliweb/awcms-astro/issues/123) · upstream realtime ADR [AWCMS #1168](https://github.com/ahliweb/awcms/issues/1168) · 24 October 2026. No new realtime route or WebSocket server is implied.

## What already exists
This repository is a Bun-hosted Astro public site and optional USER admin/BFF. `package.json` currently pins **`bun@1.4.2`**, `bun run serve` executes the Bun-bundled server, and ADR-0050 rules out the **Node runtime** even if `node:*` modules or `@astrojs/node` running on Bun are present. `ahliweb/awcms` remains the backend/system of record and SYSTEM admin. This frontend has **no verified WebSocket server nor provider broadcast engine today**.

## Future interface contract

1. **No duplicate sender or queue here.** Email/Mailketing, WhatsApp StarSender/Meta, Telegram and Web Push are dispatched from upstream AWCMS using the upstream repo's pinned Bun, durable outbox and provider HTTP APIs; OMES and Hermes remain outside this responsibility.
2. Once [AWCMS #1168](https://github.com/ahliweb/awcms/issues/1168) accepts a protocol, an eligible user/admin page may subscribe to approved, sanitized **Bun SSE** for one-way campaign/inbox progress and notifications; **native Bun WebSocket** only for truly bidirectional features with an agreed contract. Authenticated bounded polling is a valid fallback. Browser `EventSource` and `WebSocket` APIs **do not run Node.js servers**.
3. If a consumer-owned BFF streaming route is later admitted, it must run under this repository's **pinned Bun**, never Node.js, `npm`/pnpm/yarn runtime, Node-only Socket.IO sidecar or direct database/provider sender. Keep current public/static + optional USER admin architecture; no forbidden owner/SYSTEM admin surface.
4. Require server-checked tenant/site/user/role permissions and verified Origin, CSP `connect-src` for approved endpoints, short-lived audience-scoped authorization/ticket (no long-lived token in query), reconnect/cursor/snapshot, payload/redaction limits, connection caps and backpressure. Client must not supply authoritative tenant topic names or provider credentials.
5. Closed/suspended mobile browser does not keep SSE/WS listening. Use explicitly enrolled Web Push where supported; never claim realtime socket = browser-closed push.
6. Tests when implemented: two-tenant unauthorized channel attempts, wrong Origin, stale ticket, reconnect/replay, cross-brand feed, provider outage, client disconnected for hours, responsive UI/WCAG and XSS/CSRF. `bun test`, `bun run build`, `bun run audit:translation` and repo gates.

## Cross-repository references
- Upstream [AWCMS Bun worker standard #1167](https://github.com/ahliweb/awcms/issues/1167) and [realtime design #1168](https://github.com/ahliweb/awcms/issues/1168); existing [AWCMS email](https://github.com/ahliweb/awcms/blob/main/src/modules/email/README.md), [WhatsApp](https://github.com/ahliweb/awcms/blob/main/src/modules/whatsapp-delivery/README.md), [push](https://github.com/ahliweb/awcms/blob/main/src/modules/push-delivery/README.md).
- Template [AWCMS-One CRM runtime #467](https://github.com/ahliweb/awcms-one/issues/467), multi-channel campaign [#458](https://github.com/ahliweb/awcms-one/issues/458), AI #459, Telegram #460, Mailketing #461, Web Push #430–432.
- OMES signed HTTPS host pull-worker remains unchanged. [OMES #345](https://github.com/ahliweb/omes/issues/345).

**Bun implementation references:** https://bun.com/docs/runtime/http/websockets and https://bun.com/guides/http/sse. Verify against the pinned runtime at implementation.
