🇬🇧 English (source) · 🇮🇩 [Bahasa Indonesia](01-arsitektur-experience.id.md)

# 01 — The experience layer architecture

> Planned. See the [README](README.md) for its status.

## 1. The rendering matrix

| Route                                  | Rendering                | Cache                            | Session           |
| -------------------------------------- | ------------------------ | -------------------------------- | ----------------- |
| `/`                                    | Prerendered              | Public, revalidated on deploy    | —                 |
| `/kategori`, `/kategori/[slug]`        | Prerendered + rebuild    | Public, tag-based invalidation   | —                 |
| `/usaha/[slug]`, `/usaha/[slug]/produk`| Prerendered + rebuild    | Public                           | —                 |
| `/produk/[slug]`, `/layanan/[slug]`    | Prerendered + rebuild    | Public                           | —                 |
| `/artikel/**`, `/bantuan/**`           | Prerendered (build fetch)| Public                           | —                 |
| `/harga`, `/untuk-umkm`                | Prerendered              | Public                           | —                 |
| `/privasi`, `/ketentuan`, `/pengaduan`, `/disclosure-affiliate` | Prerendered | Public | —          |
| `/cari`                                | On-demand (or static + a public API with a TTL) | Public, short TTL | —  |
| `/affiliate` (landing)                 | Prerendered              | Public                           | —                 |
| `/penjual/masuk`, `/penjual/daftar`    | On-demand                | `no-store`                       | None yet          |
| Other `/penjual/**`                    | On-demand                | `private, no-store`              | Merchant          |
| `/affiliate/masuk`, `/affiliate/daftar`| On-demand                | `no-store`                       | None yet          |
| Other `/affiliate/**`                  | On-demand                | `private, no-store`              | Affiliate         |
| `/_portal-api/**`                      | Server endpoint          | `no-store`                       | Session + CSRF    |

An on-demand route is marked `export const prerender = false`. Everything not
marked stays prerendered — the safe default: a private route somebody forgot to
mark will fail at build time (it needs a session that does not exist), rather than
silently publishing a private page as a static file.

**This test is mandatory:** after a build there may be no static HTML file for any
`/penjual/**` or `/affiliate/**` path (except the landing), and the sitemap may
not contain one single private route.

## 2. Configuration changes

```
astro.config.mjs
  + a server adapter (Node standalone)
    output: "static"   ← UNCHANGED
```

With an adapter installed, `output: "static"` remains the default and on-demand
routes opt out one at a time. That is what "static-by-default with on-demand
routes" means; there is no `output: 'hybrid'` value in modern Astro.

The long comment in `astro.config.mjs` explaining why `output: 'static'` is the
template's premise is **kept**, with a reference to
[ADR-0014](../../adr/0014-rendering-campuran-dan-bff-portal.md) added so the next
reader knows which boundaries have been decided and which have not.

## 3. The planned directory structure

```
src/
  pages/
    penjual/            # on-demand routes (prerender = false)
    affiliate/          # a prerendered landing; the rest on-demand
    _portal-api/        # server endpoints (the BFF)
  lib/
    awcms/
      client.ts         # ALREADY EXISTS — still the only link to awcms
      portal.ts         # request-time calls (sessions, portal mutations)
      session.ts        # the portal cookie ↔ the awcms token, rotation, logout
      csrf.ts           # the token + Origin/Referer verification
    view-models/        # data shapes for portal components
  components/
    portal/             # portal-specific components (forms, tables, statuses)
  middleware.ts         # security headers + a cache policy per surface
```

The `AGENTS.md` rules that still apply and bind new code:

- **`src/lib/awcms/*` is the only thing that contacts `awcms`.** Components
  receive data through props; they never fetch their own.
- **There is no raw HTML path from the CMS.** `set:html` only accepts the output
  of the controlled block renderer.
- **A token is never prefixed `PUBLIC_`.** Variables with that prefix enter the
  client bundle; a token in a client bundle is a token issued to every visitor.
- **Read env through `src/lib/env.ts`**, not through `import.meta.env` directly.
- **Design tokens, not loose values.**

## 4. The difference between build-time and request-time

Today all data is pulled during `docker build` (see the comment in the
`Dockerfile`). Once the portal is active there are two classes of variable, and
telling them apart is the most frequent source of deployment confusion:

| Class                | Example                                            | When it is needed | Note                                         |
| -------------------- | -------------------------------------------------- | ----------------- | -------------------------------------------- |
| Build-time           | `SITE_URL`, `AWCMS_API_URL`, the content read token | during `astro build` | In Coolify it must be ticked **Build Variable** |
| Runtime (new)        | The internal `awcms` URL, the session/CSRF secret, service credentials | while the container runs | **Must not** enter the image history |

The build-time content read token may only read **published** content for one
tenant. The portal's runtime credential is a different identity, with different
authority, and is never used at build time.

Every new variable must enter `.env.example` along with the consequence of filling
it in wrongly — not merely its name. That is added **together with the code that
reads it**, not now.

## 5. Deployment changes

The "Today" column has itself changed through
[ADR-0016](../../adr/0016-penyajian-bun-di-belakang-traefik-tanpa-nginx.md):
nginx has been dropped and the build output is served by a Bun process through the
adapter. The remaining difference for the portal is therefore far smaller than
when this document was written — what is missing is only its own on-demand routes.

| Aspect      | Today                                            | Once the portal is active                                                   |
| ----------- | ------------------------------------------------ | --------------------------------------------------------------------------- |
| Image       | a Bun build → a Bun process serving `dist/client` | The same; the same runtime stage also renders the on-demand routes          |
| Port        | 8080 (the Bun process)                           | Still 8080 behind Traefik                                                   |
| Healthcheck | `wget` to `/`                                    | A health endpoint that does not touch `awcms` (so failure is not inherited) |
| Server      | the `@astrojs/node` adapter, every route prerendered | The same adapter; some routes `prerender = false`                       |
| Rebuild     | A Coolify webhook → a full rebuild               | Unchanged, for public content; the portal needs no rebuild                  |
| Network     | Public → Traefik → the Bun process               | Unchanged; the app → `awcms` over a private network                         |

`awcms` moves to a private/restricted origin in the same change. A portal already
running while `awcms` is still public gives zero security benefit.

## 6. The rollback path

A rollback is **not** "revert the commit and pray". What has to stay true:

1. A full static build (with no on-demand routes) can still be produced and
   deployed — tested in CI, not assumed.
2. While the portal is not yet announced, the old deployment configuration is kept
   and can be restored in one step.
3. If the portal is switched off, `/penjual/**` and `/affiliate/**` return an
   honest "temporarily unavailable" page — not a 404 that makes a user think their
   account is gone.
