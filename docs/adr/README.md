🇬🇧 English (source) · 🇮🇩 [Bahasa Indonesia](README.id.md)

# Architecture Decision Records

A record of decisions and the reasoning behind them. Written so the same
proposal does not come back six months later with nobody remembering why it was
turned down the first time.

A change needs an ADR when it:

- changes the shape of the output (static ↔ server, route structure);
- changes the security posture (CSP, headers, allowed origins);
- adds a runtime dependency or a third-party service;
- changes where content or assets come from;
- reverses one of the decisions below.

What does **not** need an ADR: editing page copy, adding a section, adjusting
styling, adding tests.

| # | Decision | Status |
| --- | --- | --- |
| [0014](0014-rendering-campuran-dan-bff-portal.md) | Mixed rendering (static-by-default + declared on-demand routes) and the Jualanku portal BFF | Accepted |
| [0015](0015-runtime-bun-menutup-divergence-keluarga.md) | Bun runtime, closing the runtime divergence from the AWCMS family | Accepted |
| [0016](0016-penyajian-bun-di-belakang-traefik-tanpa-nginx.md) | Served by Bun behind Traefik/Coolify; nginx dropped | Accepted |
| [0017](0017-peran-admin-owner-internal.md) | This repo carries the OWNER/INTERNAL admin pages | Superseded by [ADR-0020](0020-layar-admin-kembali-ke-awcms.md) |
| [0018](0018-kontrak-build-token-mesin-dan-traversal-konten.md) | Build contract against `awcms`: tenant from the machine token, cursor traversal, translation gate | Accepted |
| [0019](0019-csp-ketat-dikirim-penyaji.md) | Strict CSP sent by the server; scripts no longer live inside the HTML | Accepted |
| [0020](0020-layar-admin-kembali-ke-awcms.md) | Admin screens return to `awcms`; this repo is purely public + BFF — **narrowed** by [ADR-0034](0034-publik-secara-bawaan-admin-hanya-bila-dinyatakan.md) to SYSTEM admin screens only | Accepted |
| [0021](0021-tahan-pengembangan-menunggu-fondasi-awcms.md) | Development of this repo held until the `awcms` foundation is finished | Superseded by [ADR-0027](0027-penahanan-adr-0021-selesai.md) |
| [0022](0022-situs-menerbitkan-tenant-default-awcms.md) | This site publishes the `awcms` DEFAULT (owner) tenant | Accepted |
| [0023](0023-penahanan-dipersempit-pekerjaan-tanpa-awcms.md) | The ADR-0021 hold is narrowed: work that does not need `awcms` may land | Accepted |
| [0024](0024-seni-lokal-di-src-assets.md) | Local artwork in `src/assets/`, resolved to URLs by `import.meta.glob` | Accepted |
| [0025](0025-gambar-artikel-dari-media-awcms.md) | Article images from `awcms` media: resolved once per build, with an `img-src` that is asked for | Accepted |
| [0026](0026-kartu-share-per-artikel-dari-media-awcms.md) | Per-article share cards from `awcms` media, with the metadata travelling alongside | Accepted |
| [0027](0027-penahanan-adr-0021-selesai.md) | The ADR-0021 hold is over: both of its own indicators are met | Accepted |
| [0028](0028-jangkar-standar-performa-dan-keamanan.md) | Performance and security posture anchored to standards that are named (OWASP, ISO 27001, SSDF, Core Web Vitals) | Accepted |
| [0029](0029-hsts-digerbangi-produksi-tanpa-includesubdomains.md) | HSTS sent by the server, gated to production, without `includeSubDomains` | Accepted |
| [0030](0030-aturan-tertulis-mendapat-pemeriksanya.md) | Four already-written rules get their checkers; the supply chain is pinned to SHAs and digests | Accepted |
| [0031](0031-sbom-cyclonedx-dari-lockfile-pada-rilis.md) | A CycloneDX SBOM derived from `bun.lock` on every release, deterministic and with no new dependency | Accepted |
| [0032](0032-dua-celah-terakhir-ditutup-dengan-syarat-kejujuran.md) | The last two ADR-0028 gaps closed: CodeQL with its coverage counted and stated, and lab CWV conditioned on a content source | Accepted |
| [0033](0033-seksi-berita-urutan-dari-tanggal-dan-dua-tanggal-yang-terpisah.md) | News sections: ordering from `publishedAt`, the `awcms` published predicate mirrored, and `datePublished`/`dateModified` no longer folded into one | Accepted |
| [0034](0034-publik-secara-bawaan-admin-hanya-bila-dinyatakan.md) | Public as the primary function; USER admin only when declared, main admin (`owner`) never | Accepted |
| [0035](0035-feed-atom-per-seksi-berita-dan-gerbang-atas-xml.md) | An Atom feed per news section, and a gate over EVERY `.xml` in the output | Accepted |
| [0036](0036-news-adalah-kosakata-repo-ini-dan-sebuah-tab-yang-memikulnya.md) | `/news/` is this repo's URL vocabulary and `/blog/` is `awcms`'s; its form is a tab named `news` declaring `urutanSeksi: "terbaru"`, not a new route family | Accepted |
| [0037](0037-pin-typescript-6-adalah-syarat-hidupnya-gerbang-astro-check.md) | Pinning TypeScript 6.x is what keeps the `astro check` gate alive; raising it is a family-level decision, and its gate lands with it | Accepted |
| [0038](0038-kebutuhan-backend-menjadi-modul-di-awcms.md) | The unit of a backend need is a MODULE in `awcms`; this repo reads and does not write, and all four of its limits are gated | Accepted |
| [0039](0039-english-is-the-source-language.md) | English is the source language at the bare path, Indonesian its mirror at `<name>.id.md`; a shrink-only ledger, and three gates that had to move first | Accepted |
| [0040](0040-changeset-menyatakan-bump-semver.md) | A changeset declares its own `bump`, and the release derives `vX.Y.Z` from the largest one waiting; strict parsing ends the tag that read `v0.2.NaN` | Accepted |

> **Why the numbering starts at 0014.** The ADRs in this repo continue the
> sequence of the reference repo whose identity was released in
> [#11](https://github.com/ahliweb/awcms-astro/pull/11); decisions 0001–0013
> belong to that repo, not this one.
>
> **And this table once listed six decisions, not one of which existed here.**
> The file landed alongside ADR-0014/0015 (commit `52baf90`) with the reference
> repo's table still inside it, and then nine ADRs landed without a single one
> being recorded — `git log --diff-filter=A -- docs/adr/` shows all six of those
> files never existed, so every one of their links was dead from day one. One of
> its rows, "One language, no i18n engine", even **contradicted the code here**:
> this repo serves two locales through PO catalogues. A wrong index is worse
> than no index, because it reads as a list of decisions that are in force.
>
> **This table is now GUARDED.** `bun run audit:dokumen` requires it complete in
> both directions — every ADR in this directory recorded, every row pointing at a
> file that exists — and requires the Status column to agree with
> `- **Status:**` in the file itself. It runs in the CI `check` job, with no
> build and no network.
>
> **And the same requirement covers the Indonesian mirror of this index** since
> [ADR-0039](0039-english-is-the-source-language.md). The translation hash keeps
> a mirror the same AGE as its source; it does not keep it CORRECT against the
> contents of this directory — so a mirror one decision short would pass with a
> matching hash. For the same reason the Status column accepts either language:
> the question is whether the table agrees with its ADR file, not what language
> the table is written in.
>
> Before that, nothing checked it: `bun run audit:konten` reads links in the
> **build output**, and markdown is never built. The gate was held back for a
> while by [ADR-0021](0021-tahan-pengembangan-menunggu-fondasi-awcms.md), then
> landed once [ADR-0023](0023-penahanan-dipersempit-pekerjaan-tanpa-awcms.md)
> narrowed that hold to work which genuinely needs `awcms`.
