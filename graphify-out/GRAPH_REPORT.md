# Graph Report - .  (2026-09-24)

## Corpus Check
- cluster-only mode — file stats not available

## Summary
- 1444 nodes · 2753 edges · 95 communities (86 shown, 9 thin omitted)
- Extraction: 97% EXTRACTED · 3% INFERRED · 0% AMBIGUOUS · INFERRED: 82 edges (avg confidence: 0.84)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `4cab75ae`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- audit-graf.mjs
- kontrak-awcms.test.mjs
- site.ts
- audit-dokumen.mjs
- rilis.mjs
- profil.ts
- BaseLayout.astro
- arsip-taksonomi.ts
- audit-konten.mjs
- navigasi.ts
- pencarian.ts
- penyaji.mjs
- content.ts
- scripts
- ArtikelLayout.astro
- portable-text.ts
- peran-situs.test.mjs
- TabIndex.astro
- cek-lockfile.mjs
- paginasi.ts
- feed-seksi.ts
- awcms-astro README
- knowledge-obsidian-export.mjs
- audit-konten.test.mjs
- ADR index (docs/adr/README.md)
- content-blocks.ts
- feed.ts
- article-images.ts
- The Nine awcms-astro Gates
- The USER Admin Surface
- awcms-astro Technical Standard
- ADR-0036 — /news/ is this repo's vocabulary, and a tab that carries it
- 03 — The route map, UI porting, and components
- audit-aset.mjs
- The green-build-empty-site defect class
- 02 — The /_portal-api/** BFF contract
- ADR-0049 — A reader may subscribe, and it is the first WRITE from a stranger's browser
- knowledge-graph-label.mjs
- Contributing Guide
- Performance and Security Standard
- dependencies
- audit-serapan.mjs
- Strict Content-Security-Policy sent by penyaji.mjs
- ADR-0045 — A section comes from the CMS vocabulary, not from a sidecar only we write
- knowledge-graph-label.test.mjs
- Bun as runtime and package manager
- ADR-0033 — News sections order by date; two dates separated
- package.json
- audit-dokumen.test.mjs
- audit-graf.test.mjs
- awcms-astro Design System
- The 'would this be rewritten if awcms changed?' test
- ADR-0025 — Article images from awcms media
- pengalihan.test.mjs
- Starting a New Site on awcms-astro
- ADR-0019 — A strict CSP sent by the server
- ADR-0034 — Public by default; USER admin only when declared
- The unit of a backend need is a module in awcms, through module admission
- audit-rilis.mjs
- ukur-skala-build.mjs
- knowledge-obsidian-export.test.mjs
- AGENTS.md — The awcms-astro Working Contract
- The Numbered Gaps, All Closed, Rows Kept
- versi-toolchain.test.mjs
- Favicon Brand Mark (Traffic Light App Icon)
- audit-serapan.test.mjs
- knowledge-graph-update.mjs
- runtime-bun.test.mjs
- Bun version pinned in places that must move together
- TypeScript stays within ^6.x; raising it is a FAMILY-level decision
- ADR-0046 — A video embed is refused here, and that is a divergence rather than an omission
- compilerOptions
- reporter.mjs
- terkait.ts
- audit-aset.test.mjs
- astro.config.mjs
- audit-rilis.test.mjs
- A site DECLARES the beacon; the template ships it off by default
- Langkah `Nyatakan cakupan` — dihitung dari git ls-files
- Job picu deploy Coolify
- overrides
- repository
- robots.txt.ts
- keluaran-csp.test.mjs
- Dependabot package-ecosystem bun
- Template issue: Laporan bug
- Kerentanan keamanan lewat GitHub Security Advisory, bukan issue publik
- Konten situs tinggal di instans awcms, bukan di repo template
- *.id.md excluded from the knowledge graph so concepts are not entered twice
- Entri ignore typescript >=7
- Jaring pengaman rebuild terjadwal harian
- The awcms Integration Contract (skill)
- SitemapView.astro

## God Nodes (most connected - your core abstractions)
1. `t()` - 32 edges
2. `scripts` - 27 edges
3. `getArticles()` - 26 edges
4. `localePath()` - 21 edges
5. `arsipUntuk()` - 21 edges
6. `siteConfig` - 19 edges
7. `AGENTS.md — The awcms-astro Working Contract` - 16 edges
8. `ADR index (docs/adr/README.md)` - 16 edges
9. `nomorHalamanTambahan()` - 15 edges
10. `defaultLocale` - 14 edges

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

## Communities (95 total, 9 thin omitted)

### Community 0 - "Docs Translation, ADR Absorption, and Graph Staleness Checks"
Cohesion: 0.05
Nodes (59): ADR-0023, ADR-0030, ARTEFAK_TERLACAK, auditArtefakTerlacak(), auditKesegaranTerbatas(), auditKnowledgeGeneratedUntracked(), auditLabelKomunitas(), auditLaporanSepakat() (+51 more)

### Community 1 - "Jualanku Portal BFF Contract Gate"
Cohesion: 0.06
Nodes (33): ADR-0092, newsletterAktif, ADR-0103, ADR-0118, alamatBeacon(), JALUR_BEACON, muatanBeacon, PANJANG_JALUR_MAKS (+25 more)

### Community 2 - "Site Locale Config, Search/Privacy Pages, and Language Switcher"
Cohesion: 0.09
Nodes (20): ADR-0017, muatan, jalur, judul, locale, asalPencarianSitus, beaconKunjungan, getLocaleFromPath() (+12 more)

### Community 3 - "Doc Link, ADR Index, and 360px Width Audit Scripts"
Cohesion: 0.07
Nodes (38): ADR-0014, ADR-0028, ADR-0062, antaraPenanda(), auditIndeksAdr(), auditJalurDisebut(), auditKutipanAdr(), auditPermukaanKilau() (+30 more)

### Community 4 - "Release Script, Changeset Parsing, and Semver Bump Rules"
Cohesion: 0.08
Nodes (42): engines, bun, CHANGESET_IMPACTS, CHANGESET_TYPES, changesetBody(), isChangesetFile(), parseChangeset(), validateChangeset() (+34 more)

### Community 5 - "awcms Client, Media, Tenant, and Env Resolution"
Cohesion: 0.08
Nodes (33): ADR-0022, ADR-0054, ADR-0090, ADR-0093, ADR-0019, ADR-0049, AwcmsApiError, awcmsGet() (+25 more)

### Community 6 - "Site Identity, JSON-LD Schema, and BaseLayout"
Cohesion: 0.11
Nodes (29): ADR-0026, getSiteUrl(), Locale, pencarianAktif, siteConfig, profilSitus, adaKontak(), barisCopyright() (+21 more)

### Community 7 - "Category/Tag Taxonomy Resolution and Archive Routes"
Cohesion: 0.09
Nodes (29): SEGMEN_KATEGORI, SEGMEN_TAG, tabBentrokSegmen(), arsipMenurutSlug(), ArsipTerm, arsipUntuk(), cacheArsip, jalurArsip() (+21 more)

### Community 8 - "Content, Image, and Feed Output Audit Script"
Cohesion: 0.12
Nodes (29): artikelDiJsonLd(), auditAnggaranGambar(), auditFeed(), auditGambar(), auditKeluaran(), auditPrioritasGambar(), auditSvg(), bacaXml() (+21 more)

### Community 9 - "Navigation Menu and Widget Resolution"
Cohesion: 0.10
Nodes (30): ambilMenu(), ambilWidget(), bacaItem(), bacaMenu(), bacaWidget(), daftarMenu(), daftarWidget(), ItemMenu (+22 more)

### Community 10 - "Search Query, Facets, and Suggestions"
Cohesion: 0.09
Nodes (28): origin, bersihkan(), alamatKueri(), alamatSaran(), asalPencarian(), bacaEntitas(), bacaFilter(), ButirHasil (+20 more)

### Community 11 - "Serving Headers, CSP, and Cache Rules"
Cohesion: 0.12
Nodes (29): ADR-0016, ASAL_MEDIA, ASAL_PENCARIAN, asalMediaTerkonfigurasi(), asalPencarianTerkonfigurasi(), asalTerkonfigurasi(), aturanCache(), buatServer() (+21 more)

### Community 12 - "Build-Time Content Feed and Article Assembly"
Cohesion: 0.10
Nodes (30): ADR-0024, resetTaksonomiCacheForTests(), assertFeedReturnedFullRows(), assertTranslationsArePairable(), AwcmsAstroBlock, AwcmsBlogPost, AwcmsBlogPostSummary, fetchMedia() (+22 more)

### Community 13 - "scripts"
Cohesion: 0.07
Nodes (27): scripts, audit:aset, audit:dokumen, audit:graf, audit:konten, audit:rilis, audit:serapan, audit:translation (+19 more)

### Community 14 - "Article Layout, Site Furniture Components, and PO Catalogue"
Cohesion: 0.13
Nodes (10): breadcrumbSchema, fullItems, locale, locale, locale, locale, locale, catalogs (+2 more)

### Community 15 - "Portable Text Block Renderer and Safety Rules"
Cohesion: 0.14
Nodes (24): ADR-0046, ADR-0110, isiBlok(), isListItem(), petaAnotasi(), PORTABLE_TEXT_ALLOWED_LINK_SCHEMES, PORTABLE_TEXT_ANNOTATION_TYPES, PORTABLE_TEXT_BLOCK_STYLES (+16 more)

### Community 16 - "Site Role, PO Catalogue, and News Vocabulary Gates"
Cohesion: 0.09
Nodes (14): ADR-0014, ADR-0036, PERAN_DILARANG, permukaanAdmin, situsPublikSaja(), tabs, ADR-0034, Catalog (+6 more)

### Community 17 - "Tab/Home Views, Date Formatting, and Article Visual Resolution"
Cohesion: 0.16
Nodes (15): jalurArsip(), labelSeksi(), jalurArtikel(), namaKanal(), t(), tanggalMesin(), jalurHalaman(), tanggalMesin() (+7 more)

### Community 18 - "Lockfile Identity and SBOM Generation"
Cohesion: 0.12
Nodes (18): ADR-0015, bacaJsonc(), BLOK_DEPENDENCY, lock, masalah, pkg, repoRoot, buangTrailingComma() (+10 more)

### Community 19 - "Pagination Logic and Paginated Route Pages"
Cohesion: 0.13
Nodes (15): artikelPerFeed, artikelPerHalaman, prefixedLocales, SEGMEN_HALAMAN, Halaman, jalurHalaman(), jumlahHalaman(), nomorHalamanTambahan() (+7 more)

### Community 20 - "Section Feed Routing and Tab Article Pages"
Cohesion: 0.18
Nodes (18): defaultLocale, localePath(), TabSlug, urutanSeksiTab(), artikelSemuaSeksi(), getArticles(), indeksPost(), daftarFeed() (+10 more)

### Community 21 - "awcms-astro README"
Cohesion: 0.24
Nodes (11): img-src Is Asked For, Not Copied, HSTS Gated to Production, Without includeSubDomains, Six Response Headers From penyaji.mjs, Every awcms Variable Must Be a Coolify Build Variable, Deploying and Rebuilding by Webhook (Coolify), The Publish → Queue → Worker → Coolify Rebuild Chain, Verification After a Deploy (curl header checks), awcms-astro README (+3 more)

### Community 22 - "Obsidian Vault Export Safety Rules"
Cohesion: 0.15
Nodes (15): ALLOWED_TO_CLEAR, CURATED, entries, GENERATED, rejections, STAGING, syncable, ALLOWED_EXTENSIONS (+7 more)

### Community 23 - "Content Audit and Core Web Vitals Lab Tests"
Cohesion: 0.12
Nodes (12): ADR-0028, ADR-0032, codeql, ADR-0030, halaman(), pohon(), sementara, situs() (+4 more)

### Community 24 - "ADR index (docs/adr/README.md)"
Cohesion: 0.13
Nodes (19): ADR-0039 — English is the source language; Indonesian is the mirror, audit:translation gate — coverage and currency checked separately, DOCS_AWAITING_MIRROR — a shrink-only migration ledger of 52 documents, English at the bare path is authoritative; `<name>.id.md` is the mirror, i18n-source-hash staleness marker living in the mirror, ADR-0040 — A changeset declares its own semver bump, A changeset declares `bump: major|minor|patch`; the release takes the largest waiting, A command-line level may override upward only, never smaller (+11 more)

### Community 25 - "CMS Content Block Renderer (No Raw HTML)"
Cohesion: 0.23
Nodes (17): ALLOWED_HEADING_LEVELS, AWCMS_BLOCK_TYPES, Block, escapeHtml(), GalleryItem, MediaTerresolusi, renderBlock(), renderContentBlocks() (+9 more)

### Community 26 - "Atom Feed Entry Construction"
Cohesion: 0.16
Nodes (14): bangunFeedAtom(), BerkasFeed, ButirFeed, LEPAS, lepasXml(), NAMA_BERKAS_FEED, ADR-0033, ADR-0109 (+6 more)

### Community 27 - "Article and Tab Image Resolution"
Cohesion: 0.20
Nodes (12): ADR-0021, ArticleVisual, getArticleImage(), getTabImage(), heroImage, MODUL, SENI, LocalizedArticle (+4 more)

### Community 28 - "The Nine awcms-astro Gates"
Cohesion: 0.17
Nodes (16): Gate: audit:dokumen (markdown, ADR index, citations), Gate: audit:graf (graphify-out artefact + community names), Gate: audit:rilis (waiting changeset backlog, 12 files / 14 days), Gate: audit:serapan (unread awcms ADRs — the outward-looking gate), Gate: bun run check (lockfile + astro check), The Nine awcms-astro Gates, The awcms ADR Absorption Ledger, A Skill Is FOLLOWED, a Document Is Doubted (+8 more)

### Community 29 - "The USER Admin Surface"
Cohesion: 0.15
Nodes (16): Gate: bun test (21 gate files), CONSUMED vs COMMITTED Paths, Thirteen Called awcms Surfaces, Four Skills, Not Fifty, A Backend Need Becomes a MODULE in awcms, This Repo's Role: Public Primary, USER Admin When Declared, A Reader Can Subscribe, Confirm, and Leave, The awcms /admin/* Screen Registry (+8 more)

### Community 30 - "awcms-astro Technical Standard"
Cohesion: 0.14
Nodes (14): A New Rule Must Bring Its Own Checker, Eleven Documents Stating Something That Does Not Exist, Five Rules Written With No Checker, What Must Be Emptied Before the First Commit, Rule 4 Has No Checker Here, The Bun Version Pinned in Five Values Across Three Files, Configuration Rules: site.ts and .env Are the Only Places, What Is Most at Risk of Being Lost in Migration (+6 more)

### Community 31 - "ADR-0036 — /news/ is this repo's vocabulary, and a tab that carries it"
Cohesion: 0.14
Nodes (15): ADR-0036 — /news/ is this repo's vocabulary, and a tab that carries it, kosakata-news gate: a tab slugged `news` must declare urutanSeksi "terbaru", `news` is a tab slug a site chooses, not a reserved word, No category/tag taxonomy in this repo — archives deliberately do not follow, URL vocabulary split: /news/ here, /blog/ in awcms, ADR-0041 — The default locale stays at the ROOT, and two `Vary` names are refused, A tab, admin prefix or route claiming `/blog` is refused — ADR-0036's ungated half, The default locale keeps the root because a static build has no negotiation (+7 more)

### Community 32 - "03 — The route map, UI porting, and components"
Cohesion: 0.15
Nodes (15): A value with no readable PO-catalogue label renders no chip; facet parameters are an allow-list, Exact paths, never patterns; locale prefixes written out explicitly, pengalihan gate: no chain, no loop, no non-canonical key or target, 01 — The experience layer architecture, Mandatory test: no static HTML and no sitemap entry for any private portal route, The rendering matrix — route, rendering, cache and session per surface, The rollback path — a full static build must stay producible and tested in CI, The Elementor porting disposition — PORT/REDESIGN/DYNAMIC/REMOVE/DEFER (+7 more)

### Community 33 - "Page Weight and Asset Budget Audit Script"
Cohesion: 0.23
Nodes (13): ADR-0070, ADR-0101, asetHalaman(), AUDIENS_PUBLIC, auditKeluaran(), auditSumber(), berkasDi(), ekstensi() (+5 more)

### Community 34 - "The green-build-empty-site defect class"
Cohesion: 0.15
Nodes (14): Two missing awcms contracts blocking the first internal screen, The green-build-empty-site defect class, Translations that cannot be paired fail the build, awcms machine credentials with narrowest scope, Tenant decided by the machine token, config as assertion, Keyset cursor traversal over created_at, The build feed (view=full), Tenant is not verified over the network (+6 more)

### Community 35 - "02 — The /_portal-api/** BFF contract"
Cohesion: 0.15
Nodes (14): A BFF may call, assemble and hide credentials; it may not store, decide, or become the last reference, The declaration must be refused when rawIpEnabled is on — stated, not gateable from here, Static-by-default with `prerender = false` opting out one route at a time, 02 — The /_portal-api/** BFF contract, The BFF's hard boundary — it may shape, never decide, The awcms envelope is translated into a view model; the correlationId is shown as a short reference, No generic passthrough — every endpoint registered explicitly, or the BFF is a confused deputy, The portal session flow — login, introspection, mutation, logout-revokes-first (+6 more)

### Community 36 - "ADR-0049 — A reader may subscribe, and it is the first WRITE from a stranger's browser"
Cohesion: 0.15
Nodes (14): connect-src derived from a build-written file, the same road img-src travels, kotak-cari gate: the three call properties, proven by mutation, The reader-browser call class — anonymous calls outside `astro build`, A simple request: no custom headers, no credentials — awcms ships no OPTIONS behind search, The tenant comes from the `Origin`, and an unregistered domain gets the neutral empty payload, ADR-0044 — What a page view may cost a reader, The beacon is the one request that MUST carry `application/json`, inverting the search box's rule, Option B — the visit beacon is a plain fetch, so the awcms_visitor_key cookie is never stored (+6 more)

### Community 37 - "Knowledge Graph Label Application Script"
Cohesion: 0.14
Nodes (11): byName, GRAPH, graphText, LABELS, members, problems, REPORT, rewrittenGraph (+3 more)

### Community 38 - "Contributing Guide"
Cohesion: 0.18
Nodes (13): Gate: audit:translation (mirror staleness + coverage), Defect Classes That Do Not Fail a Build, Security Rules: No Raw HTML, No Third-Party Scripts, No Reader Data, Code of Conduct, The Contribution Flow and Commit Conventions, Contributing Guide, This Repo Is a Template, Not a Site, Two Opposite Translation Directions: PO Catalogue vs Documents (+5 more)

### Community 39 - "Performance and Security Standard"
Cohesion: 0.25
Nodes (11): Core Web Vitals Measured in a Lab, Not on Real Visits, Five Deliberately Refused Controls, Performance and Security Procedure (skill), CI Lighthouse Core Web Vitals Step, Serving Rules: penyaji.mjs Owns Every Response Header, Performance and Security Standard, What Is Deliberately NOT Adopted, OWASP Top 10 2021 Mapped to This Repo's Surfaces (+3 more)

### Community 40 - "dependencies"
Cohesion: 0.15
Nodes (13): astro, @astrojs/check, @astrojs/node, @astrojs/sitemap, compression, dependencies, astro, @astrojs/check (+5 more)

### Community 41 - "awcms ADR Absorption Ledger Audit Script"
Cohesion: 0.18
Nodes (10): ADR-0116, baris(), BATAS_MS, blok, isi, ADR-0030, ADR-0100, nomorDari() (+2 more)

### Community 42 - "Strict CSP and Response Header Rules"
Cohesion: 0.18
Nodes (13): Response headers settled in one file, vite assetsInlineLimit set to 0, Strict Content-Security-Policy sent by penyaji.mjs, JSON-LD stays inline as a data block, Permissions-Policy as the fifth security header, Theme switcher moved to public/tema.js, ADR-0029 — HSTS gated to production without includeSubDomains, HSTS sent only when NODE_ENV is production (+5 more)

### Community 43 - "ADR-0045 — A section comes from the CMS vocabulary, not from a sidecar only we write"
Cohesion: 0.15
Nodes (13): Absent stays absent — no publisher name substituted for a missing byline, ADR-0042 — A byline is the first per-person data this template publishes, authorByline rendered on all three surfaces that name an author, The byline is read from the TRANSLATED row, unlike termIds/urutan/kategori, A static site holds a COPY, so the erasure path ends in a rebuild, The hardened awcms surface list guards WHICH endpoints are called, not what they return, The JSON-LD `Person` carries a name and nothing else — no @id, url, sameAs, uri or email, ADR-0043 — The reader's browser calls awcms directly (+5 more)

### Community 44 - "Tests for the Knowledge Graph Label Script"
Cohesion: 0.23
Nodes (11): assertRefusedWithoutWriting(), cleanFixture(), cleanup, graphOf(), node(), REPO_ROOT, reportOf(), run() (+3 more)

### Community 45 - "Bun as runtime and package manager"
Cohesion: 0.18
Nodes (12): Lockfile identity check before install, Bun as runtime and package manager, No script may share a name with the binary it invokes, @astrojs/node standalone wrapped by penyaji.mjs, Bun serves the build output, No hand-written static file server, The standards anchor with pinned editions, The checker runs the built artefact, not the source (+4 more)

### Community 46 - "ADR-0033 — News sections order by date; two dates separated"
Cohesion: 0.27
Nodes (12): Nine gaps, each recorded with its checker, ADR-0030 — Written rules finally get a checker, A rule without its checker is a rule that will be broken, ADR-0031 — A CycloneDX SBOM derived from bun.lock, ADR-0032 — The last two gaps closed with honesty conditions, ADR-0033 — News sections order by date; two dates separated, publishedDate and updatedDate read from ONE row, Finding: no gate reads any .xml other than sitemap*.xml (+4 more)

### Community 47 - "package.json Identity and devDependencies"
Cohesion: 0.17
Nodes (11): description, devDependencies, @types/bun, homepage, license, name, packageManager, private (+3 more)

### Community 48 - "Tests for the Document Audit Gate"
Cohesion: 0.18
Nodes (8): ADR-0039, ADR-0042, ADR-0051, ADR-0090, ADR-0098, pohon(), pohonKilau(), sementara

### Community 49 - "Tests for the Graph Audit Gate"
Cohesion: 0.29
Nodes (10): graf(), laporan(), ADR-0039, ADR-0124, node(), pohon(), pohonBersih(), repo() (+2 more)

### Community 50 - "awcms-astro Design System"
Cohesion: 0.20
Nodes (11): Gates Read Structure, Never Prose, Before a Derived Site Goes Live, Interface Rules: No-JS, WCAG 2.1 AA, PO Catalogue, No Inline Style or Script, Premises That Fall the Moment a Route Leaves output static, The State Column Cannot Be Machine-Gated, Accessibility Patterns and the WCAG Target, Token Contrast Has Never Been Audited With Measurements, awcms-astro Design System (+3 more)

### Community 51 - "The 'would this be rewritten if awcms changed?' test"
Cohesion: 0.25
Nodes (11): The Jualanku portal BFF, Portal session contract, ADR-0021 — Development held until the awcms foundation is finished, Two checkable indicators for lifting the hold, The development hold, ADR-0022 — This site publishes the awcms DEFAULT (owner) tenant, ADR-0023 — The hold is narrowed to work that needs awcms, 'The endpoint already exists' is not an answer of no (+3 more)

### Community 52 - "ADR-0025 — Article images from awcms media"
Cohesion: 0.24
Nodes (11): Resumption points recorded while the context is fresh, ADR-0024 — Local artwork in src/assets, The image/placeholder branch lives in one component, Artwork resolved by import.meta.glob with query ?url, No fallback from an article to its section's artwork, ADR-0025 — Article images from awcms media, Media resolved once per build into LocalizedArticle, Specific beats generic: awcms media beat local artwork (+3 more)

### Community 53 - "Redirect Map and Sitemap Consistency"
Cohesion: 0.33
Nodes (8): jawabPengalihan(), ADR-0114, kunciPengalihan(), ADR-0047, PENGALIHAN, targetPengalihan(), periksaPeta(), PETA_SITUS

### Community 54 - "Starting a New Site on awcms-astro"
Cohesion: 0.25
Nodes (11): Deriving a New Site From the Template (skill), A News Site Declares urutanSeksi terbaru, Not Just a news Slug, The Order: Contract → Content → Presentation, The Traps That Happen Most Often, awcms-astro Project Skills Catalogue, permukaanAdmin — The One Door to an Admin Surface, The Public URL Vocabulary Is Split: /blog/** vs /news/**, The Most Frequent Mistakes When Deriving a Site (+3 more)

### Community 55 - "ADR-0019 — A strict CSP sent by the server"
Cohesion: 0.38
Nodes (10): ADR-0014 — Mixed rendering and the Jualanku portal BFF, ADR-0015 — The Bun runtime closes the family divergence, ADR-0016 — Served by Bun behind Traefik; nginx dropped, ADR-0017 — This repo carries the OWNER/INTERNAL admin pages, ADR-0018 — The build contract against awcms, ADR-0019 — A strict CSP sent by the server, ADR-0020 — Admin screens return to awcms, ADR-0028 — Posture anchored to named standards (+2 more)

### Community 56 - "ADR-0034 — Public by default; USER admin only when declared"
Cohesion: 0.22
Nodes (10): Preserved static rollback path, Static-by-default with on-demand routes, Four rules binding any authenticated surface, Permissions do not move with the screen, Moving a screen was never a security control, This repo carries no admin screens, ADR-0034 — Public by default; USER admin only when declared, The owner role is mechanically refused (+2 more)

### Community 57 - "The unit of a backend need is a module in awcms, through module admission"
Cohesion: 0.20
Nodes (10): ADR-0038 — A backend need becomes a MODULE in awcms, What counts as backend: stores, decides permissions, runs business rules, cross-tenant, or serves others, The unit of a backend need is a module in awcms, through module admission, This repo READS awcms and does not write, tanpa-backend gate: no backend-class dependency, no non-GET fetch, no persistence artefacts, A one-file exemption to the non-GET gate, bought with two new assertions, The reader-browser class grows from three to four, and the fourth WRITES, Build-time versus runtime variables, and two credential identities (+2 more)

### Community 58 - "Release Changeset Date Audit Script"
Cohesion: 0.20
Nodes (6): dated, ADR-0040, oldest, pending, reporter, todayIso

### Community 59 - "Build Output Size Measurement Script"
Cohesion: 0.24
Nodes (8): badanSintetis(), hasil, kolom, lebar, postSintetis(), ukur(), ukuran, UKURAN_BAWAAN

### Community 60 - "Tests for Obsidian Vault Export"
Cohesion: 0.27
Nodes (7): buildFixture(), cleanup, EXPORT_SCRIPT, fakeGraph(), fakeGraphifyBin(), REPO_ROOT, write()

### Community 61 - "AGENTS.md — The awcms-astro Working Contract"
Cohesion: 0.28
Nodes (9): Gate: audit:konten (image sources + build output), CI build Job, The Build Is Conditioned on vars.AWCMS_API_URL, Image Rules: One Ratio, Format From Contents, Two Manual Rules, The Jualanku Portal BFF (planned, ADR-0014), Moving to SSR: output static Is a Premise, Not a Default, The Test: Will This Change Be Rewritten If awcms Changes?, AGENTS.md — The awcms-astro Working Contract (+1 more)

### Community 62 - "The Numbered Gaps, All Closed, Rows Kept"
Cohesion: 0.25
Nodes (8): Gate: audit:aset (the reader's byte budget), The awcmsGet Timeout (30s AbortSignal), Actions Pinned to Commit SHA, Not to a Tag, A Changeset Declares Its Own Semver Bump, HSTS Never Sent in Production — Bundler Folded process.env.NODE_ENV, Release v0.3.0 (28 August 2026), The Numbered Gaps, All Closed, Rows Kept, Versioning Restated for a Site

### Community 63 - "Bun Version Pin Consistency Gate"
Cohesion: 0.25
Nodes (6): ADR-0037, ci, dockerfile, ADR-0030, pkg, VERSI

### Community 64 - "Favicon Brand Mark (Traffic Light App Icon)"
Cohesion: 0.39
Nodes (8): Rounded Square Icon Backdrop (64x64, rx=14), Sky-to-Emerald Brand Palette (Tailwind-family hues), Diagonal Blue-to-Green Linear Gradient (id=f), Favicon Brand Mark (Traffic Light App Icon), Three Stacked Signal Lamps (red, amber, green), Red/Amber/Green Status Color Semantics, Traffic Light Housing Glyph (dark pill, 85% opacity), Traffic Signal Motif (lampu lalu lintas)

### Community 65 - "Tests for the ADR Absorption Ledger Audit"
Cohesion: 0.25
Nodes (5): ADR-0117, jalankan(), LIB, sementara, SKRIP

### Community 66 - "Knowledge Graph Update Reporting Script"
Cohesion: 0.29
Nodes (5): after, before, fail(), GRAPH_PATH, run()

### Community 67 - "No Node.js Runtime Guard"
Cohesion: 0.29
Nodes (5): ADR-0050, dockerfile, ADR-0030, pkg, RUNTIME_BINARIES

### Community 68 - "Bun version pinned in places that must move together"
Cohesion: 0.33
Nodes (7): Bun version pinned in places that must move together, The extension list living in three places, Five recommended controls refused in writing, Supply chain pinned to commit SHAs and image digests, The five Bun version values compared by one gate, CodeQL with its coverage counted rather than claimed, RUM permanently refused — the ban on collecting reader data

### Community 69 - "TypeScript stays within ^6.x; raising it is a FAMILY-level decision"
Cohesion: 0.29
Nodes (7): ADR-0037 — The TypeScript 6.x pin keeps the `astro check` gate alive, The `astro check` type-check gate, Family divergence `astro-files-not-type-checked`, TypeScript stays within ^6.x; raising it is a FAMILY-level decision, versi-toolchain gate: the pin plus the presence of @astrojs/check, Family divergence `public-locale-url-shape` requested of awcms, Asking awcms to record an intentionalDivergences entry is the family mechanism

### Community 70 - "ADR-0046 — A video embed is refused here, and that is a divergence rather than an omission"
Cohesion: 0.29
Nodes (7): The snippet never becomes HTML, and no markup is assembled in JavaScript, ADR-0046 — A video embed is refused here, and that is a divergence rather than an omission, A template's operator is not a deployment's operator — a flag would arrive pre-wired, video_news renders as a link; frame-src stays absent from the CSP, The template's own redirect map is EMPTY — a template has no URL history, A template's version number is the only thing its derived sites have, What is deliberately postponed, and the two entries that no longer apply

### Community 71 - "compilerOptions"
Cohesion: 0.29
Nodes (6): astro/tsconfigs/strict, compilerOptions, jsx, jsxImportSource, moduleResolution, extends

### Community 72 - "Shared Gate Reporter Utility"
Cohesion: 0.33
Nodes (4): createReporter(), formatReport(), ADR-0030, scripts

### Community 73 - "Related Articles Selection Logic"
Cohesion: 0.38
Nodes (4): UrutanSeksi, artikelLainnya(), MAKS_LAINNYA, PunyaSlug

### Community 74 - "Tests for the Asset Budget Audit"
Cohesion: 0.29
Nodes (3): PUBLIC_LENGKAP, sementara, SKRIP

### Community 75 - "Astro Build Configuration and Locale Prefixes"
Cohesion: 0.53
Nodes (5): LOCALE_PREFIXES, ADR-0035, neutralPath(), serialize(), SITE

### Community 76 - "Tests for the Release Audit Gate"
Cohesion: 0.33
Nodes (4): jalankan(), pohon(), sementara, SKRIP

### Community 77 - "A site DECLARES the beacon; the template ships it off by default"
Cohesion: 0.50
Nodes (4): The box is hidden until its script runs, and `[hidden]` is made to win over author display rules, A site DECLARES the beacon; the template ships it off by default, The privacy page grows a section when, and only when, the form does, SITE_NEWSLETTER: three surfaces appear together or not at all, and only where AWCMS_API_URL is set

### Community 78 - "Langkah `Nyatakan cakupan` — dihitung dari git ls-files"
Cohesion: 0.67
Nodes (3): CodeQL job analyze (javascript-typescript), Batas: berkas .astro tidak teranalisis statik, Langkah `Nyatakan cakupan` — dihitung dari git ls-files

### Community 79 - "Job picu deploy Coolify"
Cohesion: 0.67
Nodes (3): Endpoint /api/v1/deploy Coolify, bukan /restart, Job picu deploy Coolify, Syarat target deploy dinyatakan eksplisit di ringkasan run

### Community 80 - "overrides"
Cohesion: 0.67
Nodes (3): overrides, fast-uri, nanoid

### Community 81 - "repository"
Cohesion: 0.67
Nodes (3): repository, type, url

### Community 93 - "The awcms Integration Contract (skill)"
Cohesion: 0.24
Nodes (11): awcms Refusals That Must Be Imitated in Test Doubles, Build Feed Traversal (view=full + order=created_at + cursor), The awcms Integration Contract (skill), The Tenant Comes From the Machine Token, Data Source Rules (client.ts, content.ts, the four rules), awcms-astro → awcms Integration Contract, The Data Model Mapping to awcms_blog_posts, The LocalizedArticle Adapter Contract (+3 more)

### Community 94 - "Sitemap View Component and Route"
Cohesion: 0.29
Nodes (3): breadcrumbItems, locale, sections

## Ambiguous Edges - Review These
- `Three Stacked Signal Lamps (red, amber, green)` → `Sky-to-Emerald Brand Palette (Tailwind-family hues)`  [AMBIGUOUS]
  public/favicon.svg · relation: conceptually_related_to

## Knowledge Gaps
- **360 isolated node(s):** `SITE`, `origin`, `pelapor`, `localeDefault`, `locales` (+355 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **9 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **What is the exact relationship between `Three Stacked Signal Lamps (red, amber, green)` and `Sky-to-Emerald Brand Palette (Tailwind-family hues)`?**
  _Edge tagged AMBIGUOUS (relation: conceptually_related_to) - confidence is low._
- **Why does `ADR-0033` connect `feed.ts` to `kontrak-awcms.test.mjs`, `site.ts`, `BaseLayout.astro`, `arsip-taksonomi.ts`, `audit-konten.mjs`, `penyaji.mjs`, `content.ts`, `peran-situs.test.mjs`, `TabIndex.astro`, `audit-konten.test.mjs`?**
  _High betweenness centrality (0.107) - this node is a cross-community bridge._
- **Why does `bun` connect `rilis.mjs` to `audit-graf.mjs`, `audit-serapan.test.mjs`, `ukur-skala-build.mjs`, `audit-rilis.test.mjs`?**
  _High betweenness centrality (0.079) - this node is a cross-community bridge._
- **Why does `engines` connect `rilis.mjs` to `package.json`?**
  _High betweenness centrality (0.059) - this node is a cross-community bridge._
- **What connects `SITE`, `origin`, `pelapor` to the rest of the system?**
  _360 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `audit-graf.mjs` be split into smaller, more focused modules?**
  _Cohesion score 0.05194805194805195 - nodes in this community are weakly interconnected._
- **Should `kontrak-awcms.test.mjs` be split into smaller, more focused modules?**
  _Cohesion score 0.06352941176470588 - nodes in this community are weakly interconnected._