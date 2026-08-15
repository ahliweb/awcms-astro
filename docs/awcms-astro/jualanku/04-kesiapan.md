🇬🇧 English (source) · 🇮🇩 [Bahasa Indonesia](04-kesiapan.id.md)

# 04 — Readiness, the proof-of-concept, and the checklist

> Planned. See the [README](README.md) for its status.

## 1. Prerequisites before a production screen (P0)

| #   | Prerequisite                                                                  | Evidence of completion                                                |
| --- | ----------------------------------------------------------------------------- | --------------------------------------------------------------------- |
| 1   | [ADR-0014](../../adr/0014-rendering-campuran-dan-bff-portal.md) accepted      | The ADR with status `Accepted` — **done**                             |
| 2   | ADR-0045 in `awcms` accepted                                                  | The ADR in the `awcms` repo — **done**                                |
| 3   | A session introspection endpoint exists in `awcms` + documented in OpenAPI    | **DONE** — `GET /api/v1/auth/session` + a single-use handoff code (`awcms` ADR-0049/0050) |
| 4   | A proof-of-concept adapter + one on-demand route + the BFF                    | Login → session → read profile through a private `awcms`, on a separate branch |
| 5   | The portal deployment configuration (image, proxy, healthcheck, runtime variables) | A successful staging deploy                                       |
| 6   | The static rollback path documented **and tried**                              | A full static build green in CI + written rollback steps              |
| 7   | An Elementor porting inventory per route/section                              | A `PORT/REDESIGN/DYNAMIC/REMOVE/DEFER` sheet                          |

Item 3 is a hard dependency: without the session contract, a PoC can only fake a
session, and a PoC that fakes its hardest part proves nothing. **It is now done**
(`awcms` ADR-0049/0050, 1–2 August 2026), and so is the business-scope resolver
that used to be a fail-closed NO-OP (`awcms` ADR-0060).

**What holds the portal back now is not a missing contract but two other
things**, and both need naming so the table above is not read as "only items 4–7
left":

- **In this repo:** the [ADR-0023](../../adr/0023-penahanan-dipersempit-pekerjaan-tanpa-awcms.md)
  test. The BFF calls `awcms` on **every runtime request**, so its shape is
  decided by an `awcms` response on every request — and this template repo has no
  instance to prove its calls are right. Item 4 (the PoC) is therefore not merely
  work not yet started; it is work nobody here can yet prove.
- **In `awcms`:** the shape of the Jualanku merchant scope still needs its own
  admission ADR. ADR-0060 gave its resolver a provider; it did not decide how a
  merchant maps onto a scope.

## 2. The scope of the proof-of-concept

What must be proven, and no more:

1. The adapter is installed, `output: "static"` stays, one route is marked
   `prerender = false` and is genuinely rendered on request.
2. The build does **not** produce a static file for that route.
3. The BFF exchanges the portal cookie for an `awcms` credential server-side; the
   token never appears in the HTML or in browser storage.
4. The tenant is derived from the host; a tenant header sent by the client is
   ignored.
5. A mutation without a CSRF token is refused; one with a foreign Origin is
   refused.
6. Logging out revokes the session in `awcms`, and the old token genuinely cannot
   be used.
7. Portal responses carry `private, no-store` and `noindex`.
8. `awcms` is reachable **only** from the private network in the test
   environment.

If any one of them cannot be proven, the portal does not proceed — that is what a
PoC is for.

## 3. The acceptance checklist

**Architecture** — the ADR approved · the adapter installed · the rendering
matrix tested · a private `awcms` origin · the static rollback documented & tried.

**Identity & access** — no token in browser storage · an
HttpOnly/Secure/SameSite cookie · CSRF + Origin check · a server-derived tenant ·
session rotation · logout revoking upstream · negative tests that exist and have
been red.

**Rendering & cache** — zero static files for private routes · zero private
routes in the sitemap · `private, no-store` on the portal · hashed public assets
`immutable`.

**UI/UX** — design tokens · empty/error/loading states on every screen · a
keyboard flow · WCAG 2.2 AA · 360 px · no placeholders · approved copy & claims ·
new strings entered into every locale catalogue.

**Operations** — a healthcheck that does not inherit failure from `awcms` · logs
with a correlation ID · an honest error page when `awcms` is down · runtime
variables that do not enter the image history.

**Content** — no reader personal data on public pages · no third-party scripts ·
no raw HTML from the CMS · images at `--ratio-visual`.

## 4. What is deliberately postponed

Two items on this list **no longer apply**, and both are left written here
together with what replaced them — a postponement list quietly tidied up leaves
no trace that its decision was once different:

- ~~**The runtime migration to Bun** — its own ADR, after the portal is
  stable.~~ It has happened, and it **preceded** the portal rather than following
  it: [ADR-0015](../../adr/0015-runtime-bun-menutup-divergence-keluarga.md) moved
  the runtime and package manager to Bun, and then
  [ADR-0016](../../adr/0016-penyajian-bun-di-belakang-traefik-tanpa-nginx.md)
  made Bun serve the build output too. The adapter the §2 PoC demands is
  therefore already installed — to serve, not to render on request.
- **Internal admin pages in this repo** — still `awcms`'s. This statement was
  briefly reversed by [ADR-0017](../../adr/0017-peran-admin-owner-internal.md)
  (31 July 2026) and **restored** by
  [ADR-0020](../../adr/0020-layar-admin-kembali-ke-awcms.md) (2 August 2026), in
  line with `awcms` ADR-0051, which consolidates every admin screen over there.
  What voided that reversal was not a technical obstacle — the two contracts that
  used to block it had in fact landed — but the conclusion that moving a screen
  does not move its permissions, and so does not move its risk.

What is still genuinely postponed:

- **Rendering the whole site on demand** — refused, not postponed.
- **Checkout/marketplace** — outside the MVP.
- **Personalising public pages** — it would remove the ability to cache them
  publicly; it needs a decision of its own.
