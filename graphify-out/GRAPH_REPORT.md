# Graph Report - .  (2026-08-28)

## Corpus Check
- 219 files · ~307,535 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 1421 nodes · 2603 edges · 97 communities (87 shown, 10 thin omitted)
- Extraction: 97% EXTRACTED · 3% INFERRED · 0% AMBIGUOUS · INFERRED: 81 edges (avg confidence: 0.84)
- Token cost: 607,016 input · 0 output

## Community Hubs (Navigation)
- Taxonomy Archives and Pagination
- Translation and Graph Gates
- Portable Text Rendering
- Article Fetching and Adaptation
- Absorption, Asset and Release Audits
- Release Versioning and Changesets
- Locale Routing and Site Contract
- Content and Image Output Audit
- CMS Menus and Widgets
- Document Link and ADR Index Audit
- Reader Search and Snippets
- Article Structured Data and Share Cards
- Site Role and Vocabulary Gates
- awcms Contract Test Fixtures
- Package Script Registry
- Lockfile Integrity and SBOM
- Newsletter Subscription Flow
- Translated Interface Components
- Atom Feed Construction
- Release, Language and Backlog Decisions
- The Nine Gates and CI
- Local Artwork and Article Images
- Response Header Serving Gates
- Site Identity and Base Layout
- Tab and Home Page Views
- Per-Section Feed Routes
- Deriving a Site and Admin Surfaces
- Production Server Origins
- Media Resolution and Site Profile
- Content Audit Test Harness
- Contribution Rules and Governance
- URL Vocabulary and Redirect Decisions
- Jualanku Experience Blueprint
- Deployment and Response Headers
- Build Contract Failure Classes
- Portal BFF Contract
- Reader Browser Call Decisions
- Technical Standard and Closed Gaps
- Declared Dependencies
- CSP and News Metadata Decisions
- Section, Byline and Search Decisions
- Content Redirect Map
- awcms Integration Contract
- Tenant Resolution
- No-Backend Boundary Gate
- Runtime, SBOM and Supply Chain
- Checker and Feed Decisions
- Search and Newsletter Pages
- awcms HTTP Client and Env
- Working Contract Inventories
- Design System and Accessibility
- Performance and Security Posture
- The Development Hold Cycle
- Image Sourcing Decisions
- Sitemap and Breadcrumbs
- Foundational Architecture Decisions
- Public Default and Admin Doors
- Backend Need Becomes a Module
- Package Manifest Metadata
- Visit Beacon
- The Agent Working Contract
- Document Audit Test Harness
- Astro Build Configuration
- Toolchain Version Gate
- Traffic Light Brand Mark
- Server Request Handling
- Graph Audit Test Harness
- Absorption Audit Test Harness
- Refused Controls and Pinning
- TypeScript Pin and Family Divergence
- Template Versus Deployment Asymmetry
- TypeScript Configuration
- Asset Audit Test Harness
- Shared Test Process Helpers
- Static Analysis Coverage Gate
- Release Audit Test Harness
- Lab Core Web Vitals Gate
- Search Box Markup Gate
- Conditional Release Build Gate
- Opt-In Reader Features
- CodeQL Scope Declaration
- Coolify Deploy Trigger
- Development Dependencies
- Dependency Overrides
- Repository Metadata
- Robots Directives
- Output CSP Gate
- Dependabot Update Groups
- awcms API Error Type
- Bug Report Template
- Private Vulnerability Reporting
- Content Lives in awcms
- Mirror Exclusion From Graph
- TypeScript 7 Ignore Entry
- Daily Scheduled Rebuild

## God Nodes (most connected - your core abstractions)
1. `t()` - 32 edges
2. `getArticles()` - 26 edges
3. `scripts` - 23 edges
4. `arsipUntuk()` - 21 edges
5. `localePath()` - 20 edges
6. `siteConfig` - 19 edges
7. `AGENTS.md — The awcms-astro Working Contract` - 16 edges
8. `ADR index (docs/adr/README.md)` - 16 edges
9. `nomorHalamanTambahan()` - 15 edges
10. `bun` - 14 edges

## Surprising Connections (you probably didn't know these)
- `The Quality Gate Table` --semantically_similar_to--> `The Nine awcms-astro Gates`  [INFERRED] [semantically similar]
  docs/awcms-astro/standar-teknis.md → .claude/skills/awcms-astro-gerbang/SKILL.md
- `What Is Most at Risk of Being Lost in Migration` --semantically_similar_to--> `A New Rule Must Bring Its Own Checker`  [INFERRED] [semantically similar]
  docs/awcms-astro/integrasi-awcms.md → .claude/skills/awcms-astro-gerbang/SKILL.md
- `The Relationship With ahliweb/awcms` --semantically_similar_to--> `The awcms ADR Absorption Ledger`  [INFERRED] [semantically similar]
  docs/awcms-astro/standar-performa-dan-keamanan.md → .claude/skills/awcms-astro-integrasi/SKILL.md
- `Defect Classes That Do Not Fail a Build` --semantically_similar_to--> `Support`  [INFERRED] [semantically similar]
  .github/PULL_REQUEST_TEMPLATE.md → SUPPORT.md
- `The Tenant Comes From the Machine Token` --semantically_similar_to--> `Tenant: One Variable and One Verified Assertion`  [INFERRED] [semantically similar]
  .claude/skills/awcms-astro-integrasi/SKILL.md → README.md

## Import Cycles
- None detected.

## Hyperedges (group relationships)
- **The Nine Gates Run Together Before a PR** — _claude_skills_awcms_astro_gerbang_skill_check, _claude_skills_awcms_astro_gerbang_skill_bun_test, _claude_skills_awcms_astro_gerbang_skill_audit_konten, _claude_skills_awcms_astro_gerbang_skill_audit_dokumen, _claude_skills_awcms_astro_gerbang_skill_audit_translation, _claude_skills_awcms_astro_gerbang_skill_audit_graf, _claude_skills_awcms_astro_gerbang_skill_audit_serapan, _claude_skills_awcms_astro_gerbang_skill_audit_aset, _claude_skills_awcms_astro_gerbang_skill_audit_rilis, agents_definition_of_done, _github_workflows_ci_check_job [EXTRACTED 1.00]
- **Public Primary Plus an Optional USER Admin Surface** — agents_this_repos_role, agents_permukaan_admin, docs_awcms_astro_permukaan_admin_user_boundary_what_is_managed, docs_awcms_astro_readme_position_in_family, docs_awcms_astro_integrasi_awcms_admin_screens, docs_awcms_astro_permukaan_admin_user_premises_that_fall [EXTRACTED 1.00]
- **One File Owns Every Response Header, Proven End to End** — agents_serving_rules, _claude_skills_awcms_astro_performa_keamanan_skill_six_response_headers, _claude_skills_awcms_astro_performa_keamanan_skill_hsts_production_gate, changelog_hsts_never_sent_bundler_folding, docs_deploy_coolify_verification_after_deploy, readme_strict_csp_actually_sent [EXTRACTED 1.00]
- **The response-header posture assembled in server/penyaji.mjs** — docs_adr_0016_penyajian_bun_di_belakang_traefik_tanpa_nginx_header_satu_tempat, docs_adr_0019_csp_ketat_dikirim_penyaji_csp_ketat, docs_adr_0029_hsts_digerbangi_produksi_tanpa_includesubdomains_hsts_digerbangi_produksi, docs_adr_0025_gambar_artikel_dari_media_awcms_asal_media_diminta, docs_adr_0035_feed_atom_per_seksi_berita_dan_gerbang_atas_xml_tipe_isi_feed [EXTRACTED 1.00]
- **The green-build / empty-or-wrong-output defect class and its floor gates** — docs_adr_0018_kontrak_build_token_mesin_dan_traversal_konten_cacat_build_hijau_situs_kosong, docs_adr_0018_kontrak_build_token_mesin_dan_traversal_konten_gerbang_terjemahan, docs_adr_0025_gambar_artikel_dari_media_awcms_gerbang_nol_dari_n, docs_adr_0033_seksi_berita_urutan_dari_tanggal_dan_dua_tanggal_yang_terpisah_predikat_terbit_ditiru, docs_adr_0035_feed_atom_per_seksi_berita_dan_gerbang_atas_xml_gerbang_atas_xml [INFERRED 0.85]
- **The development-hold cycle: imposed, narrowed, ended** — docs_adr_0021_tahan_pengembangan_menunggu_fondasi_awcms_penahanan_pengembangan, docs_adr_0021_tahan_pengembangan_menunggu_fondasi_awcms_dua_indikator, docs_adr_0023_penahanan_dipersempit_pekerjaan_tanpa_awcms_uji_ditulis_ulang_jika_awcms_berubah, docs_adr_0027_penahanan_adr_0021_selesai_penahanan_selesai [EXTRACTED 1.00]
- **The reader-browser call class — anonymous calls from a stranger's browser** — docs_adr_0043_the_readers_browser_calls_awcms_and_nothing_else_changes_reader_browser_call_class, docs_adr_0043_the_readers_browser_calls_awcms_and_nothing_else_changes_tenant_from_origin, docs_adr_0044_what_a_page_view_may_cost_a_reader_beacon_without_credentials, docs_adr_0049_a_reader_may_subscribe_and_the_first_write_from_a_strangers_browser_first_write_from_stranger_browser, docs_adr_0044_what_a_page_view_may_cost_a_reader_beacon_must_carry_a_header [EXTRACTED 1.00]
- **ADR-0030's pattern: every written rule lands with its own checker** — docs_adr_0036_news_adalah_kosakata_repo_ini_dan_sebuah_tab_yang_memikulnya_kosakata_news_gate, docs_adr_0037_pin_typescript_6_adalah_syarat_hidupnya_gerbang_astro_check_versi_toolchain_gate, docs_adr_0038_kebutuhan_backend_menjadi_modul_di_awcms_tanpa_backend_gate, docs_adr_0039_english_is_the_source_language_audit_translation_gate, docs_adr_0040_changeset_menyatakan_bump_semver_versi_changeset_gate, docs_adr_0041_locale_stays_at_the_root_and_two_vary_names_are_refused_penyaji_gate, docs_adr_0043_the_readers_browser_calls_awcms_and_nothing_else_changes_kotak_cari_gate, docs_adr_0047_this_origin_answers_its_own_content_redirects_and_the_edge_keeps_the_rest_pengalihan_gate, docs_adr_0048_a_release_is_cut_when_the_backlog_crosses_a_bound_audit_rilis_gate, docs_adr_readme_index_guarded [EXTRACTED 1.00]
- **The Jualanku portal blueprint — four planned documents forming one design** — docs_awcms_astro_jualanku_readme_blueprint, docs_awcms_astro_jualanku_01_arsitektur_experience_experience_architecture, docs_awcms_astro_jualanku_02_kontrak_bff_bff_contract, docs_awcms_astro_jualanku_03_peta_rute_dan_ui_route_map, docs_awcms_astro_jualanku_04_kesiapan_readiness [EXTRACTED 1.00]

## Communities (97 total, 10 thin omitted)

### Community 0 - "Taxonomy Archives and Pagination"
Cohesion: 0.06
Nodes (54): jalurArsip(), tanggalMesin(), artikelPerHalaman, defaultLocale, SEGMEN_HALAMAN, SEGMEN_KATEGORI, SEGMEN_TAG, tabBentrokSegmen() (+46 more)

### Community 1 - "Translation and Graph Gates"
Cohesion: 0.07
Nodes (49): ADR-0023, ARTEFAK_TERLACAK, auditArtefakTerlacak(), auditLabelKomunitas(), auditLaporanSepakat(), auditPengecualian(), catat(), catatKesegaran() (+41 more)

### Community 2 - "Portable Text Rendering"
Cohesion: 0.07
Nodes (52): ADR-0046, ADR-0110, badanSintetis(), hasil, kolom, lebar, ADR-0114, postSintetis() (+44 more)

### Community 3 - "Article Fetching and Adaptation"
Cohesion: 0.06
Nodes (43): ADR-0024, UrutanSeksi, resetTaksonomiCacheForTests(), termMenurutId(), assertFeedReturnedFullRows(), assertTranslationsArePairable(), AwcmsAstroBlock, AwcmsBlogPost (+35 more)

### Community 4 - "Absorption, Asset and Release Audits"
Cohesion: 0.06
Nodes (37): ADR-0070, ADR-0101, ADR-0116, asetHalaman(), AUDIENS_PUBLIC, auditKeluaran(), auditSumber(), berkasDi() (+29 more)

### Community 5 - "Release Versioning and Changesets"
Cohesion: 0.09
Nodes (38): CHANGESET_IMPACTS, CHANGESET_TYPES, changesetBody(), isChangesetFile(), parseChangeset(), validateChangeset(), gitRunOrThrow(), atLeastAsSignificant() (+30 more)

### Community 6 - "Locale Routing and Site Contract"
Cohesion: 0.07
Nodes (26): ADR-0017, ADR-0051, jalur, judul, locale, beaconKunjungan, getLocaleFromPath(), isLocale() (+18 more)

### Community 7 - "Content and Image Output Audit"
Cohesion: 0.11
Nodes (32): artikelDiJsonLd(), auditAnggaranGambar(), auditFeed(), auditGambar(), auditKeluaran(), auditPrioritasGambar(), auditSvg(), bacaXml() (+24 more)

### Community 8 - "CMS Menus and Widgets"
Cohesion: 0.09
Nodes (33): ambilMenu(), ambilWidget(), bacaItem(), bacaMenu(), bacaWidget(), daftarMenu(), daftarWidget(), ItemMenu (+25 more)

### Community 9 - "Document Link and ADR Index Audit"
Cohesion: 0.14
Nodes (29): ADR-0062, antaraPenanda(), auditIndeksAdr(), auditJalurDisebut(), auditKutipanAdr(), auditPermukaanKilau(), auditSatuIndeks(), auditTautan() (+21 more)

### Community 10 - "Reader Search and Snippets"
Cohesion: 0.10
Nodes (25): origin, bersihkan(), alamatKueri(), alamatSaran(), asalPencarian(), bacaEntitas(), bacaFilter(), ButirHasil (+17 more)

### Community 11 - "Article Structured Data and Share Cards"
Cohesion: 0.11
Nodes (21): ADR-0026, urutanSeksiTab(), articleSchema(), defaultSocialImage, imageObject(), PUBLISHER_ID, Schema, tipeArtikelSeksi() (+13 more)

### Community 12 - "Site Role and Vocabulary Gates"
Cohesion: 0.08
Nodes (17): ADR-0036, PERAN_DILARANG, permukaanAdmin, situsPublikSaja(), tabs, Catalog, parsePo(), readQuoted() (+9 more)

### Community 13 - "awcms Contract Test Fixtures"
Cohesion: 0.09
Nodes (17): ADR-0018, ADR-0033, ADR-0038, ADR-0043, ADR-0044, ADR-0049, ADR-0056, ADR-0100 (+9 more)

### Community 14 - "Package Script Registry"
Cohesion: 0.09
Nodes (23): scripts, audit:aset, audit:dokumen, audit:graf, audit:konten, audit:rilis, audit:serapan, audit:translation (+15 more)

### Community 15 - "Lockfile Integrity and SBOM"
Cohesion: 0.12
Nodes (18): ADR-0015, bacaJsonc(), BLOK_DEPENDENCY, lock, masalah, pkg, repoRoot, buangTrailingComma() (+10 more)

### Community 16 - "Newsletter Subscription Flow"
Cohesion: 0.14
Nodes (19): bacaHasil(), HALAMAN_BERHENTI, HALAMAN_KONFIRMASI, HasilLangganan, HasilNetral, HEADER_LANGGANAN, JALUR_BERHENTI, JALUR_KONFIRMASI (+11 more)

### Community 17 - "Translated Interface Components"
Cohesion: 0.14
Nodes (7): locale, locale, locale, locale, catalogs, rawCatalogs, t()

### Community 18 - "Atom Feed Construction"
Cohesion: 0.13
Nodes (17): bangunFeedAtom(), BerkasFeed, ButirFeed, LEPAS, lepasXml(), NAMA_BERKAS_FEED, ADR-0032, ADR-0033 (+9 more)

### Community 19 - "Release, Language and Backlog Decisions"
Cohesion: 0.13
Nodes (19): ADR-0039 — English is the source language; Indonesian is the mirror, audit:translation gate — coverage and currency checked separately, DOCS_AWAITING_MIRROR — a shrink-only migration ledger of 52 documents, English at the bare path is authoritative; `<name>.id.md` is the mirror, i18n-source-hash staleness marker living in the mirror, ADR-0040 — A changeset declares its own semver bump, A changeset declares `bump: major|minor|patch`; the release takes the largest waiting, A command-line level may override upward only, never smaller (+11 more)

### Community 20 - "The Nine Gates and CI"
Cohesion: 0.15
Nodes (18): Gate: audit:dokumen (markdown, ADR index, citations), Gate: audit:graf (graphify-out artefact + community names), Gate: audit:rilis (waiting changeset backlog, 12 files / 14 days), Gate: audit:serapan (unread awcms ADRs — the outward-looking gate), Gate: audit:translation (mirror staleness + coverage), Gate: bun run check (lockfile + astro check), The Nine awcms-astro Gates, The awcms ADR Absorption Ledger (+10 more)

### Community 21 - "Local Artwork and Article Images"
Cohesion: 0.18
Nodes (13): ADR-0021, ArticleVisual, getArticleImage(), getTabImage(), heroImage, MODUL, SENI, ADR-0025 (+5 more)

### Community 22 - "Response Header Serving Gates"
Cohesion: 0.11
Nodes (16): CACHE_ASET, CACHE_HALAMAN, CSP, HEADER_KEAMANAN, HSTS, PERMISSIONS_POLICY, TIPE_FEED, VARY_DILARANG (+8 more)

### Community 23 - "Site Identity and Base Layout"
Cohesion: 0.24
Nodes (12): muatan, profilSitus, adaKontak(), barisCopyright(), namaPenerbit(), namaSitus(), taglineSitus(), tautanTelepon() (+4 more)

### Community 24 - "Tab and Home Page Views"
Cohesion: 0.15
Nodes (10): labelSeksi(), locale, number, schema, jalurHalaman(), getSiteUrl(), siteConfig, tabTitleKey() (+2 more)

### Community 25 - "Per-Section Feed Routes"
Cohesion: 0.21
Nodes (15): artikelPerFeed, Locale, localeHtmlLang, localePath(), TabSlug, daftarFeed(), isiFeed(), jalurFeed() (+7 more)

### Community 26 - "Deriving a Site and Admin Surfaces"
Cohesion: 0.18
Nodes (17): Deriving a New Site From the Template (skill), The Order: Contract → Content → Presentation, The Traps That Happen Most Often, awcms-astro Project Skills Catalogue, Four Skills, Not Fifty, permukaanAdmin — The One Door to an Admin Surface, This Repo's Role: Public Primary, USER Admin When Declared, The Most Frequent Mistakes When Deriving a Site (+9 more)

### Community 27 - "Production Server Origins"
Cohesion: 0.13
Nodes (16): ASAL_MEDIA, ASAL_PENCARIAN, asalMediaTerkonfigurasi(), asalPencarianTerkonfigurasi(), asalTerkonfigurasi(), HEADER_PRODUKSI, ADR-0016, ADR-0019 (+8 more)

### Community 28 - "Media Resolution and Site Profile"
Cohesion: 0.18
Nodes (13): ADR-0019, asalMediaPublik, ObjekMedia, resolveObjekMedia(), ambilProfil(), bacaTautanSosial(), penolakanYangDiharapkan(), peringatkan() (+5 more)

### Community 29 - "Content Audit Test Harness"
Cohesion: 0.14
Nodes (10): halaman(), ADR-0028, ADR-0032, ADR-0033, ADR-0035, pohon(), sementara, situs() (+2 more)

### Community 30 - "Contribution Rules and Governance"
Cohesion: 0.14
Nodes (15): A New Rule Must Bring Its Own Checker, Eleven Documents Stating Something That Does Not Exist, Rule 4 Has No Checker Here, Defect Classes That Do Not Fail a Build, Security Rules: No Raw HTML, No Third-Party Scripts, No Reader Data, Code of Conduct, The Contribution Flow and Commit Conventions, Contributing Guide (+7 more)

### Community 31 - "URL Vocabulary and Redirect Decisions"
Cohesion: 0.14
Nodes (15): ADR-0036 — /news/ is this repo's vocabulary, and a tab that carries it, kosakata-news gate: a tab slugged `news` must declare urutanSeksi "terbaru", `news` is a tab slug a site chooses, not a reserved word, No category/tag taxonomy in this repo — archives deliberately do not follow, URL vocabulary split: /news/ here, /blog/ in awcms, ADR-0041 — The default locale stays at the ROOT, and two `Vary` names are refused, A tab, admin prefix or route claiming `/blog` is refused — ADR-0036's ungated half, The default locale keeps the root because a static build has no negotiation (+7 more)

### Community 32 - "Jualanku Experience Blueprint"
Cohesion: 0.15
Nodes (15): A value with no readable PO-catalogue label renders no chip; facet parameters are an allow-list, Exact paths, never patterns; locale prefixes written out explicitly, pengalihan gate: no chain, no loop, no non-canonical key or target, 01 — The experience layer architecture, Mandatory test: no static HTML and no sitemap entry for any private portal route, The rendering matrix — route, rendering, cache and session per surface, The rollback path — a full static build must stay producible and tested in CI, The Elementor porting disposition — PORT/REDESIGN/DYNAMIC/REMOVE/DEFER (+7 more)

### Community 33 - "Deployment and Response Headers"
Cohesion: 0.19
Nodes (14): img-src Is Asked For, Not Copied, The Tenant Comes From the Machine Token, HSTS Gated to Production, Without includeSubDomains, Six Response Headers From penyaji.mjs, Every awcms Variable Must Be a Coolify Build Variable, Deploying and Rebuilding by Webhook (Coolify), The Publish → Queue → Worker → Coolify Rebuild Chain, Three 403s That All Read Like a Revoked Token (+6 more)

### Community 34 - "Build Contract Failure Classes"
Cohesion: 0.15
Nodes (14): Two missing awcms contracts blocking the first internal screen, The green-build-empty-site defect class, Translations that cannot be paired fail the build, awcms machine credentials with narrowest scope, Tenant decided by the machine token, config as assertion, Keyset cursor traversal over created_at, The build feed (view=full), Tenant is not verified over the network (+6 more)

### Community 35 - "Portal BFF Contract"
Cohesion: 0.15
Nodes (14): A BFF may call, assemble and hide credentials; it may not store, decide, or become the last reference, The declaration must be refused when rawIpEnabled is on — stated, not gateable from here, Static-by-default with `prerender = false` opting out one route at a time, 02 — The /_portal-api/** BFF contract, The BFF's hard boundary — it may shape, never decide, The awcms envelope is translated into a view model; the correlationId is shown as a short reference, No generic passthrough — every endpoint registered explicitly, or the BFF is a confused deputy, The portal session flow — login, introspection, mutation, logout-revokes-first (+6 more)

### Community 36 - "Reader Browser Call Decisions"
Cohesion: 0.15
Nodes (14): connect-src derived from a build-written file, the same road img-src travels, kotak-cari gate: the three call properties, proven by mutation, The reader-browser call class — anonymous calls outside `astro build`, A simple request: no custom headers, no credentials — awcms ships no OPTIONS behind search, The tenant comes from the `Origin`, and an unregistered domain gets the neutral empty payload, ADR-0044 — What a page view may cost a reader, The beacon is the one request that MUST carry `application/json`, inverting the search box's rule, Option B — the visit beacon is a plain fetch, so the awcms_visitor_key cookie is never stored (+6 more)

### Community 37 - "Technical Standard and Closed Gaps"
Cohesion: 0.15
Nodes (13): Gate: audit:aset (the reader's byte budget), The awcmsGet Timeout (30s AbortSignal), What Must Be Emptied Before the First Commit, Actions Pinned to Commit SHA, Not to a Tag, A Changeset Declares Its Own Semver Bump, HSTS Never Sent in Production — Bundler Folded process.env.NODE_ENV, Release v0.3.0 (28 August 2026), The Numbered Gaps, All Closed, Rows Kept (+5 more)

### Community 38 - "Declared Dependencies"
Cohesion: 0.15
Nodes (13): astro, @astrojs/check, @astrojs/node, @astrojs/sitemap, compression, dependencies, astro, @astrojs/check (+5 more)

### Community 39 - "CSP and News Metadata Decisions"
Cohesion: 0.18
Nodes (13): Response headers settled in one file, vite assetsInlineLimit set to 0, Strict Content-Security-Policy sent by penyaji.mjs, JSON-LD stays inline as a data block, Permissions-Policy as the fifth security header, Theme switcher moved to public/tema.js, ADR-0029 — HSTS gated to production without includeSubDomains, HSTS sent only when NODE_ENV is production (+5 more)

### Community 40 - "Section, Byline and Search Decisions"
Cohesion: 0.15
Nodes (13): Absent stays absent — no publisher name substituted for a missing byline, ADR-0042 — A byline is the first per-person data this template publishes, authorByline rendered on all three surfaces that name an author, The byline is read from the TRANSLATED row, unlike termIds/urutan/kategori, A static site holds a COPY, so the erasure path ends in a rebuild, The hardened awcms surface list guards WHICH endpoints are called, not what they return, The JSON-LD `Person` carries a name and nothing else — no @id, url, sameAs, uri or email, ADR-0043 — The reader's browser calls awcms directly (+5 more)

### Community 41 - "Content Redirect Map"
Cohesion: 0.23
Nodes (10): jawabPengalihan(), kunciPengalihan(), ADR-0047, ADR-0114, PENGALIHAN, targetPengalihan(), ADR-0047, ADR-0114 (+2 more)

### Community 42 - "awcms Integration Contract"
Cohesion: 0.20
Nodes (12): awcms Refusals That Must Be Imitated in Test Doubles, Build Feed Traversal (view=full + order=created_at + cursor), The awcms Integration Contract (skill), A News Site Declares urutanSeksi terbaru, Not Just a news Slug, Data Source Rules (client.ts, content.ts, the four rules), The Public URL Vocabulary Is Split: /blog/** vs /news/**, awcms-astro → awcms Integration Contract, The Data Model Mapping to awcms_blog_posts (+4 more)

### Community 43 - "Tenant Resolution"
Cohesion: 0.20
Nodes (10): ADR-0022, ADR-0054, ADR-0090, ADR-0093, refuseRetiredVariables(), resolveTenant(), TenantNotConfiguredError, TenantResolution (+2 more)

### Community 44 - "No-Backend Boundary Gate"
Cohesion: 0.17
Nodes (9): ADR-0092, KELAS_BACKEND, ADR-0018, ADR-0020, ADR-0038, ADR-0039, ADR-0044, ADR-0103 (+1 more)

### Community 45 - "Runtime, SBOM and Supply Chain"
Cohesion: 0.18
Nodes (12): Lockfile identity check before install, Bun as runtime and package manager, No script may share a name with the binary it invokes, @astrojs/node standalone wrapped by penyaji.mjs, Bun serves the build output, No hand-written static file server, The standards anchor with pinned editions, The checker runs the built artefact, not the source (+4 more)

### Community 46 - "Checker and Feed Decisions"
Cohesion: 0.27
Nodes (12): Nine gaps, each recorded with its checker, ADR-0030 — Written rules finally get a checker, A rule without its checker is a rule that will be broken, ADR-0031 — A CycloneDX SBOM derived from bun.lock, ADR-0032 — The last two gaps closed with honesty conditions, ADR-0033 — News sections order by date; two dates separated, publishedDate and updatedDate read from ONE row, Finding: no gate reads any .xml other than sitemap*.xml (+4 more)

### Community 47 - "Search and Newsletter Pages"
Cohesion: 0.18
Nodes (3): asalPencarianSitus, newsletterAktif, SEGMEN_CARI

### Community 48 - "awcms HTTP Client and Env"
Cohesion: 0.33
Nodes (10): awcmsGet(), baseUrl(), batasWaktuMs(), describeTenantResolution(), Envelope, tenant(), ADR-0049, envSource (+2 more)

### Community 49 - "Working Contract Inventories"
Cohesion: 0.18
Nodes (11): Gate: bun test (21 gate files), Five Rules Written With No Checker, CONSUMED vs COMMITTED Paths, Thirteen Called awcms Surfaces, A Backend Need Becomes a MODULE in awcms, The Bun Version Pinned in Five Values Across Three Files, Configuration Rules: site.ts and .env Are the Only Places, A Reader Can Subscribe, Confirm, and Leave (+3 more)

### Community 50 - "Design System and Accessibility"
Cohesion: 0.20
Nodes (11): Gates Read Structure, Never Prose, Before a Derived Site Goes Live, Interface Rules: No-JS, WCAG 2.1 AA, PO Catalogue, No Inline Style or Script, Premises That Fall the Moment a Route Leaves output static, The State Column Cannot Be Machine-Gated, Accessibility Patterns and the WCAG Target, Token Contrast Has Never Been Audited With Measurements, awcms-astro Design System (+3 more)

### Community 51 - "Performance and Security Posture"
Cohesion: 0.25
Nodes (11): Core Web Vitals Measured in a Lab, Not on Real Visits, Five Deliberately Refused Controls, Performance and Security Procedure (skill), CI Lighthouse Core Web Vitals Step, Serving Rules: penyaji.mjs Owns Every Response Header, Performance and Security Standard, What Is Deliberately NOT Adopted, OWASP Top 10 2021 Mapped to This Repo's Surfaces (+3 more)

### Community 52 - "The Development Hold Cycle"
Cohesion: 0.25
Nodes (11): The Jualanku portal BFF, Portal session contract, ADR-0021 — Development held until the awcms foundation is finished, Two checkable indicators for lifting the hold, The development hold, ADR-0022 — This site publishes the awcms DEFAULT (owner) tenant, ADR-0023 — The hold is narrowed to work that needs awcms, 'The endpoint already exists' is not an answer of no (+3 more)

### Community 53 - "Image Sourcing Decisions"
Cohesion: 0.24
Nodes (11): Resumption points recorded while the context is fresh, ADR-0024 — Local artwork in src/assets, The image/placeholder branch lives in one component, Artwork resolved by import.meta.glob with query ?url, No fallback from an article to its section's artwork, ADR-0025 — Article images from awcms media, Media resolved once per build into LocalizedArticle, Specific beats generic: awcms media beat local artwork (+3 more)

### Community 54 - "Sitemap and Breadcrumbs"
Cohesion: 0.18
Nodes (6): breadcrumbSchema, fullItems, locale, breadcrumbItems, locale, sections

### Community 55 - "Foundational Architecture Decisions"
Cohesion: 0.38
Nodes (10): ADR-0014 — Mixed rendering and the Jualanku portal BFF, ADR-0015 — The Bun runtime closes the family divergence, ADR-0016 — Served by Bun behind Traefik; nginx dropped, ADR-0017 — This repo carries the OWNER/INTERNAL admin pages, ADR-0018 — The build contract against awcms, ADR-0019 — A strict CSP sent by the server, ADR-0020 — Admin screens return to awcms, ADR-0028 — Posture anchored to named standards (+2 more)

### Community 56 - "Public Default and Admin Doors"
Cohesion: 0.22
Nodes (10): Preserved static rollback path, Static-by-default with on-demand routes, Four rules binding any authenticated surface, Permissions do not move with the screen, Moving a screen was never a security control, This repo carries no admin screens, ADR-0034 — Public by default; USER admin only when declared, The owner role is mechanically refused (+2 more)

### Community 57 - "Backend Need Becomes a Module"
Cohesion: 0.20
Nodes (10): ADR-0038 — A backend need becomes a MODULE in awcms, What counts as backend: stores, decides permissions, runs business rules, cross-tenant, or serves others, The unit of a backend need is a module in awcms, through module admission, This repo READS awcms and does not write, tanpa-backend gate: no backend-class dependency, no non-GET fetch, no persistence artefacts, A one-file exemption to the non-GET gate, bought with two new assertions, The reader-browser class grows from three to four, and the fourth WRITES, Build-time versus runtime variables, and two credential identities (+2 more)

### Community 58 - "Package Manifest Metadata"
Cohesion: 0.20
Nodes (9): description, engines, homepage, license, name, packageManager, private, type (+1 more)

### Community 59 - "Visit Beacon"
Cohesion: 0.33
Nodes (8): alamatBeacon(), JALUR_BEACON, muatanBeacon, PANJANG_JALUR_MAKS, PANJANG_KODE_TENANT_MAKS, TIPE_ISI_BEACON, ADR-0044, ADR-0044

### Community 60 - "The Agent Working Contract"
Cohesion: 0.28
Nodes (9): Gate: audit:konten (image sources + build output), CI build Job, The Build Is Conditioned on vars.AWCMS_API_URL, Image Rules: One Ratio, Format From Contents, Two Manual Rules, The Jualanku Portal BFF (planned, ADR-0014), Moving to SSR: output static Is a Premise, Not a Default, The Test: Will This Change Be Rewritten If awcms Changes?, AGENTS.md — The awcms-astro Working Contract (+1 more)

### Community 61 - "Document Audit Test Harness"
Cohesion: 0.25
Nodes (6): jalankan(), ADR-0039, ADR-0042, pohon(), pohonKilau(), sementara

### Community 62 - "Astro Build Configuration"
Cohesion: 0.36
Nodes (7): LOCALE_PREFIXES, ADR-0014, ADR-0016, ADR-0035, neutralPath(), serialize(), SITE

### Community 63 - "Toolchain Version Gate"
Cohesion: 0.25
Nodes (6): ADR-0037, ci, dockerfile, ADR-0030, pkg, VERSI

### Community 64 - "Traffic Light Brand Mark"
Cohesion: 0.39
Nodes (8): Rounded Square Icon Backdrop (64x64, rx=14), Sky-to-Emerald Brand Palette (Tailwind-family hues), Diagonal Blue-to-Green Linear Gradient (id=f), Favicon Brand Mark (Traffic Light App Icon), Three Stacked Signal Lamps (red, amber, green), Red/Amber/Green Status Color Semantics, Traffic Light Housing Glyph (dark pill, 85% opacity), Traffic Signal Motif (lampu lalu lintas)

### Community 65 - "Server Request Handling"
Cohesion: 0.29
Nodes (8): aturanCache(), buatServer(), headerKeamanan(), jalankan(), jalurNormal(), pasangHeader(), tipeIsi(), lewatServer()

### Community 66 - "Graph Audit Test Harness"
Cohesion: 0.39
Nodes (6): graf(), laporan(), pohon(), pohonBersih(), repo(), sementara

### Community 67 - "Absorption Audit Test Harness"
Cohesion: 0.25
Nodes (5): jalankan(), LIB, ADR-0117, sementara, SKRIP

### Community 68 - "Refused Controls and Pinning"
Cohesion: 0.33
Nodes (7): Bun version pinned in places that must move together, The extension list living in three places, Five recommended controls refused in writing, Supply chain pinned to commit SHAs and image digests, The five Bun version values compared by one gate, CodeQL with its coverage counted rather than claimed, RUM permanently refused — the ban on collecting reader data

### Community 69 - "TypeScript Pin and Family Divergence"
Cohesion: 0.29
Nodes (7): ADR-0037 — The TypeScript 6.x pin keeps the `astro check` gate alive, The `astro check` type-check gate, Family divergence `astro-files-not-type-checked`, TypeScript stays within ^6.x; raising it is a FAMILY-level decision, versi-toolchain gate: the pin plus the presence of @astrojs/check, Family divergence `public-locale-url-shape` requested of awcms, Asking awcms to record an intentionalDivergences entry is the family mechanism

### Community 70 - "Template Versus Deployment Asymmetry"
Cohesion: 0.29
Nodes (7): The snippet never becomes HTML, and no markup is assembled in JavaScript, ADR-0046 — A video embed is refused here, and that is a divergence rather than an omission, A template's operator is not a deployment's operator — a flag would arrive pre-wired, video_news renders as a link; frame-src stays absent from the CSP, The template's own redirect map is EMPTY — a template has no URL history, A template's version number is the only thing its derived sites have, What is deliberately postponed, and the two entries that no longer apply

### Community 71 - "TypeScript Configuration"
Cohesion: 0.29
Nodes (6): astro/tsconfigs/strict, compilerOptions, jsx, jsxImportSource, moduleResolution, extends

### Community 72 - "Asset Audit Test Harness"
Cohesion: 0.29
Nodes (4): jalankan(), PUBLIC_LENGKAP, sementara, SKRIP

### Community 73 - "Shared Test Process Helpers"
Cohesion: 0.33
Nodes (6): bun, gitRunInherit(), jalankan(), jalankan(), jawabanDengan(), nyalakan()

### Community 74 - "Static Analysis Coverage Gate"
Cohesion: 0.40
Nodes (4): codeql, ADR-0028, ADR-0030, ADR-0032

### Community 75 - "Release Audit Test Harness"
Cohesion: 0.40
Nodes (3): jalankan(), sementara, SKRIP

### Community 76 - "Lab Core Web Vitals Gate"
Cohesion: 0.40
Nodes (4): ci, konfigurasi, ADR-0028, ADR-0032

### Community 77 - "Search Box Markup Gate"
Cohesion: 0.40
Nodes (4): isi, markup, ADR-0107, skrip

### Community 78 - "Conditional Release Build Gate"
Cohesion: 0.40
Nodes (4): ci, ADR-0030, ADR-0031, perilis

### Community 79 - "Opt-In Reader Features"
Cohesion: 0.50
Nodes (4): The box is hidden until its script runs, and `[hidden]` is made to win over author display rules, A site DECLARES the beacon; the template ships it off by default, The privacy page grows a section when, and only when, the form does, SITE_NEWSLETTER: three surfaces appear together or not at all, and only where AWCMS_API_URL is set

### Community 80 - "CodeQL Scope Declaration"
Cohesion: 0.67
Nodes (3): CodeQL job analyze (javascript-typescript), Batas: berkas .astro tidak teranalisis statik, Langkah `Nyatakan cakupan` — dihitung dari git ls-files

### Community 81 - "Coolify Deploy Trigger"
Cohesion: 0.67
Nodes (3): Endpoint /api/v1/deploy Coolify, bukan /restart, Job picu deploy Coolify, Syarat target deploy dinyatakan eksplisit di ringkasan run

### Community 82 - "Development Dependencies"
Cohesion: 0.67
Nodes (3): devDependencies, @types/bun, @types/bun

### Community 83 - "Dependency Overrides"
Cohesion: 0.67
Nodes (3): overrides, fast-uri, nanoid

### Community 84 - "Repository Metadata"
Cohesion: 0.67
Nodes (3): repository, type, url

## Ambiguous Edges - Review These
- `Three Stacked Signal Lamps (red, amber, green)` → `Sky-to-Emerald Brand Palette (Tailwind-family hues)`  [AMBIGUOUS]
  public/favicon.svg · relation: conceptually_related_to

## Knowledge Gaps
- **426 isolated node(s):** `SITE`, `ADR-0014`, `ADR-0016`, `ADR-0035`, `name` (+421 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **10 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **What is the exact relationship between `Three Stacked Signal Lamps (red, amber, green)` and `Sky-to-Emerald Brand Palette (Tailwind-family hues)`?**
  _Edge tagged AMBIGUOUS (relation: conceptually_related_to) - confidence is low._
- **Why does `bun` connect `Shared Test Process Helpers` to `Translation and Graph Gates`, `Portable Text Rendering`, `Graph Audit Test Harness`, `Absorption Audit Test Harness`, `Release Versioning and Changesets`, `Asset Audit Test Harness`, `Release Audit Test Harness`, `Package Manifest Metadata`, `Document Audit Test Harness`?**
  _High betweenness centrality (0.133) - this node is a cross-community bridge._
- **Why does `baris()` connect `Absorption, Asset and Release Audits` to `Article Structured Data and Share Cards`?**
  _High betweenness centrality (0.088) - this node is a cross-community bridge._
- **Why does `ukur()` connect `Portable Text Rendering` to `Shared Test Process Helpers`?**
  _High betweenness centrality (0.085) - this node is a cross-community bridge._
- **What connects `SITE`, `ADR-0014`, `ADR-0016` to the rest of the system?**
  _426 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `Taxonomy Archives and Pagination` be split into smaller, more focused modules?**
  _Cohesion score 0.058738738738738736 - nodes in this community are weakly interconnected._
- **Should `Translation and Graph Gates` be split into smaller, more focused modules?**
  _Cohesion score 0.0672316384180791 - nodes in this community are weakly interconnected._