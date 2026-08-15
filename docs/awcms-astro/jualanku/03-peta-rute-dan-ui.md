🇬🇧 English (source) · 🇮🇩 [Bahasa Indonesia](03-peta-rute-dan-ui.id.md)

# 03 — The route map, UI porting, and components

> Planned. See the [README](README.md) for its status.

## 1. Public routes

| Group           | Routes                                                            | Disposition        | Data source                    |
| --------------- | ----------------------------------------------------------------- | ------------------ | ------------------------------ |
| Discovery       | `/`, `/cari`, `/kategori`, `/kategori/[slug]`                     | PORT/REDESIGN/DYNAMIC | the `awcms` directory + taxonomy |
| Merchant        | `/usaha/[slug]`, `/usaha/[slug]/produk`                           | DYNAMIC            | a published-only projection    |
| Product/service | `/produk/[slug]`, `/layanan/[slug]`                               | DYNAMIC            | the published catalogue        |
| Content         | `/artikel/**`, `/bantuan/**`                                      | PORT/DYNAMIC       | `blog_content`                 |
| Commercial      | `/harga`, `/untuk-umkm`, `/layanan/website`                       | REDESIGN/DYNAMIC   | packages from the system of record |
| Affiliate       | `/affiliate`                                                      | REDESIGN           | public content                 |
| Legal           | `/privasi`, `/ketentuan`, `/pengaduan`, `/disclosure-affiliate`   | PORT               | versioned content + an effective date |

A legal page must show its **version** and its **effective date**, and that
version is stored — not merely text that can change without a trace.

## 2. Seller portal routes

`/penjual/` + `masuk`, `daftar`, `dashboard`, `onboarding`, `usaha`, `katalog`,
`promosi`, `leads`, `analitik`, `paket`, `tagihan`, `verifikasi`, `tim`,
`bantuan`.

`masuk`/`daftar` are public-without-a-session surfaces; the rest are private.

## 3. Affiliate portal routes

`/affiliate/` + `masuk`, `daftar`, `dashboard`, `tautan`, `kampanye`, `klik`,
`konversi`, `komisi`, `payout`, `pajak`, `profil`, `panduan`, `ketentuan`.

`/affiliate` (with no sub-path) remains a prerendered public landing page.

## 4. What is NOT in this repo

All of `/admin/jualanku/**` lives in `awcms`. This repo has no route, menu, link,
or component pointing there — including a "log in as admin" link. Merchants and
affiliates do not have a session audience that could open it.

## 5. The Elementor porting disposition

| Code       | Meaning                                  | Jualanku example                               |
| ---------- | ---------------------------------------- | ---------------------------------------------- |
| `PORT`     | Purpose & structure preserved            | The hero, category cards, business cards       |
| `REDESIGN` | Purpose kept, the flow improved          | The seller dashboard, onboarding               |
| `DYNAMIC`  | Static → `awcms` data                    | Category listings, the catalogue, pricing      |
| `REMOVE`   | Not carried over                         | Placeholders, lorem ipsum, duplicate sections, demo data |
| `DEFER`    | Valuable, not MVP                        | AI recommendations, marketplace checkout       |

The per-route/section inventory is made as a worksheet before the first screen is
worked on; every row holds its route, section, disposition, data owner, and an
accessibility note. No WordPress markup, CSS class, widget, or plugin is copied.

## 6. Components

Built on top of the components and tokens already in this repo
([`../ui-ux-design-system.md`](../ui-ux-design-system.md)), plus a portal group:

| Group          | Components                                                          | Note                                               |
| -------------- | ------------------------------------------------------------------- | -------------------------------------------------- |
| Forms          | `FormField`, `FormError`, `SubmitButton`, `CsrfField`                | Work without JS; errors associated with their field |
| Data           | `DataTable`, `Pagination`, `EmptyState`, `ErrorState`, `LoadingState`| Every screen must have all three states            |
| Status         | `StatusPill` (verification/payout/moderation)                        | Always a text label, never colour alone            |
| Sensitive      | `MaskedText`, `MoneyText`                                            | Authoritative masking stays in `awcms`             |
| Navigation     | `PortalNav`, `Breadcrumb`                                            | The portal menu never carries an admin link        |
| Feedback       | `Toast`, `ConfirmDialog`                                             | Confirmation for irreversible actions              |

The token rule stands: no one-off styles; a new component uses tokens that already
exist in `src/styles/global.css`. The single visual ratio `--ratio-visual` applies
to every business/product image — a source at another ratio will be **cropped**
silently, not scaled down.

## 7. Accessibility

The baseline is **WCAG 2.2 AA** for the Jualanku surfaces (up from the 2.1 AA
written in `AGENTS.md`; that rise was decided in
[ADR-0014](../../adr/0014-rendering-campuran-dan-bff-portal.md)).

- Core public functions work without JavaScript; so do the portal's critical flows
  (logging in, seeing a status, submitting the main form).
- Visible focus, full keyboard navigation, a skip link, landmarks, a heading
  hierarchy.
- The touch target for a main portal CTA is at least 44 CSS px.
- Sufficient contrast in the light theme **and** the dark one.
- `prefers-reduced-motion` switches decorative animation off — not merely speeds
  it up.
- Mobile-first from 360 px.
- Forms: labels, hints, error association, status announcements; server-side
  validation stays authoritative.

## 8. Language

Interface strings go through the PO catalogues like everything else in this repo —
never written directly in a component. New portal strings enter **every** locale
catalogue; a key not yet translated falls back to the default locale rather than
displaying the key name.
