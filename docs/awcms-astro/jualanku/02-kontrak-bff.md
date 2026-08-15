🇬🇧 English (source) · 🇮🇩 [Bahasa Indonesia](02-kontrak-bff.id.md)

# 02 — The `/_portal-api/**` BFF contract

> Planned. See the [README](README.md) for its status.

## 1. The hard boundary

The BFF **may**: hold the portal session, exchange it for an `awcms` credential
server-side, set the tenant from the host, verify CSRF/Origin, set private cache
headers, validate input shapes far enough for UX, call `awcms`, and shape a view
model.

The BFF **may not**: decide merchant ownership, package entitlements, payout
eligibility, status transitions, commission calculations, or moderation policy.
All of those are decided by `awcms` and re-checked there **on every call** —
including calls the BFF is sure it has already validated.

A simple test for every new line of code here: _if somebody called `awcms`
directly from the internal network without passing through the BFF, would the
result still be correct?_ If not, the rule is in the wrong place.

## 2. The session flow

```
1. POST /_portal-api/auth/login
     BFF → awcms POST /api/v1/auth/login  (tenant from the host, not from the client)
     ← a token + expiresAt
     The BFF stores the token server-side, sets the portal cookie (HttpOnly, Secure,
     SameSite, Path=/), and then ROTATES the portal session id.

2. Every on-demand page request
     BFF reads the portal cookie → the token → awcms GET session introspection
     ← safe claims (identityId, roles, assurance, the merchant/affiliate scope)
     The page is rendered from those claims; no claim comes from the client.

3. Mutations (POST/PATCH/DELETE)
     Verify CSRF + Origin/Referer → call awcms → project the result.

4. POST /_portal-api/auth/logout
     awcms logout (revocation) FIRST → only then delete the portal cookie.
```

The order in step 4 cannot be reversed: deleting the cookie first and then failing
to call `awcms` leaves a live session nobody can see any more.

## 3. Cookie & CSRF rules

| Aspect                | Requirement                                                                                  |
| --------------------- | -------------------------------------------------------------------------------------------- |
| Cookie name           | Separate for merchant and affiliate when their audiences differ; do not share one cookie.     |
| Attributes            | `HttpOnly`, `Secure`, `SameSite=Lax` (raised to `Strict` when the flow needs no cross-site redirect), `Path=/`. |
| Contents              | An opaque session reference. **Not** the `awcms` token, and not user data.                    |
| Lifetime              | Follows `expiresAt` from `awcms`; the BFF does not extend it itself.                          |
| CSRF                  | A synchronizer/double-submit token **and** an Origin/Referer check. Both.                     |
| Forms without JavaScript | The CSRF token is embedded as a hidden field, so critical flows still work without JS.      |
| Rotation              | After login, after a step-up/privilege change, after recovery.                                |

## 4. The BFF endpoint inventory

| Endpoint                                   | Forwards to `awcms`                                | Note                            |
| ------------------------------------------ | -------------------------------------------------- | ------------------------------- |
| `POST /_portal-api/auth/login`             | `/api/v1/auth/login`                                | Rate-limited, uniform responses |
| `POST /_portal-api/auth/logout`            | `/api/v1/auth/logout`                               | Revoke first, cookie after      |
| `GET  /_portal-api/auth/session`           | the session introspection endpoint                  | Safe claims only                |
| `GET/PATCH /_portal-api/merchant/profile`  | `/api/v1/jualanku/portal/merchant/profile`          | The ETag is forwarded           |
| `GET/POST/PATCH /_portal-api/merchant/catalog` | `.../portal/merchant/offerings`                 | The Idempotency-Key is forwarded |
| `GET/POST /_portal-api/merchant/promotions`| `.../portal/merchant/promotions`                    | —                               |
| `GET  /_portal-api/merchant/leads`         | `.../portal/merchant/leads`                         | PII already masked by `awcms`   |
| `POST /_portal-api/merchant/verification`  | `.../portal/merchant/verification`                  | Uploads through presigned media |
| `GET  /_portal-api/affiliate/summary`      | `.../portal/affiliate/summary`                      | The balance from the ledger     |
| `GET/POST /_portal-api/affiliate/links`    | `.../portal/affiliate/links`                        | —                               |
| `POST /_portal-api/affiliate/payouts`      | `.../portal/affiliate/payouts`                      | **Idempotency mandatory**       |
| `POST /_portal-api/interactions`           | `/api/v1/jualanku/public/interactions`              | Public, minimal data, rate-limited |

**There is no generic passthrough.** There is no `/_portal-api/[...path].ts`
forwarding anything at all to `awcms`; every endpoint is registered explicitly. A
generic proxy turns the BFF into a confused deputy and voids the entire reason
`awcms` does not face the public.

## 5. File uploads

Verification evidence and catalogue images do **not** pass through the BFF as
bytes:

1. The BFF asks `awcms` for a presigned URL (`media_library`).
2. The browser uploads directly to object storage.
3. The BFF calls finalize; `awcms` verifies the MIME type through magic bytes +
   SHA-256.

The portal never sends a free-form image URL — that path is exactly what the
managed-media enforcement in `awcms` exists to close.

## 6. Headers and cache

| Surface            | `Cache-Control`                            | In addition                                      |
| ------------------ | ------------------------------------------ | ------------------------------------------------ |
| Prerendered public | `public, max-age=…` per asset type         | Hashed assets may be `immutable`                 |
| `/cari`            | `public, max-age` short                    | It never carries personal data                   |
| The on-demand portal | `private, no-store`                      | `X-Robots-Tag: noindex`, absent from the sitemap |
| `/_portal-api/**`  | `no-store`                                 | A correct `Vary` when there is negotiation       |

Security headers (CSP, frame-ancestors, referrer-policy, permissions-policy) are
applied in [`server/penyaji.mjs`](../../../server/penyaji.mjs) — the only place
response headers are decided since
[ADR-0016](../../adr/0016-penyajian-bun-di-belakang-traefik-tanpa-nginx.md),
replacing the nginx snippet an early version of this document referred to. The
portal CSP may not be looser than the public CSP.

One thing to settle there when the portal is built: today the server installs one
set of headers for EVERY response, while the table above demands `private,
no-store` specifically for the portal surfaces. That per-surface rule does not
exist yet, and it is not work that can be smuggled in alongside something else — a
cache serving anonymous visitors may not touch an authenticated response.

## 7. Error handling

- The `awcms` envelope (`{ success, data }` / `{ success: false, error }`) is
  translated into a view model; internal error codes do not leak as-is onto the
  page.
- The `correlationId` from `awcms` is recorded in the BFF log and shown as a short
  reference on the error page, so a user's complaint can be traced.
- `awcms` unavailable → an honest error page + the correct HTTP status. Never
  render an empty page that looks successful.
- A 401 from `awcms` → clear the portal session and redirect to the login page; do
  not silently retry the request (that gives birth to a login loop).
