# Graph Report - .  (2026-11-20)

## Corpus Check
- cluster-only mode — file stats not available

## Summary
- 2062 nodes · 3438 edges · 169 communities (138 shown, 31 thin omitted)
- Extraction: 96% EXTRACTED · 4% INFERRED · 0% AMBIGUOUS · INFERRED: 153 edges (avg confidence: 0.81)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `e5f44bb7`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- site.ts
- aksesibilitas.test.mjs
- Checklist: Starting a New Site on awcms-astro
- audit-dokumen.mjs
- Governance
- rilis.mjs
- BaseLayout.astro
- content.ts
- audit-konten.mjs
- ArsipTaksonomi.astro
- navigasi.ts
- pencarian.ts
- awcms-tiruan.mjs
- penyaji.mjs
- newsletter.ts
- scripts
- arsip-taksonomi.ts
- TabIndex.astro
- portable-text.ts
- Surfaces called (13) and not called (3)
- Performance and Security Standard
- audit-graf.mjs
- cek-lockfile.mjs
- peran-situs.test.mjs
- kontrak-awcms.test.mjs
- Design System
- ArtikelLayout.astro
- Technical Standard
- audit-konten.test.mjs
- knowledge-obsidian-export.mjs
- content-blocks.ts
- awcms backend and system of record
- server/penyaji.mjs
- Pre-0.3.0 entries (0.2.x era, archive and taxonomy, search, beacon)
- audit-rilis.mjs
- docs-i18n-checks.mjs
- awcms-astro-gerbang skill
- CHANGELOG (awcms-astro release log)
- article-images.ts
- audit:konten published-output gate
- purge-cdn.test.mjs
- ADR-0036 — /news/ is this repo's vocabulary, and a tab that carries it
- ADR-0040 — A changeset declares its own semver bump
- profil.ts
- Release v0.6.1 (2026-10-24)
- Bun as runtime and package manager
- The green-build-empty-site defect class
- knowledge-graph-label.mjs
- dependencies
- tanpa-backend.test.mjs
- audit-aset.mjs
- audit-serapan.mjs
- ADR-0019 — A strict CSP sent by the server
- ADR-0033 — News sections order by date; two dates separated
- authorByline rendered on all three surfaces that name an author
- pengalihan.test.mjs
- feed.ts
- knowledge-graph-label.test.mjs
- Definition of Done
- AGENTS.md working contract
- permukaanAdmin declaration (ADR-0034)
- The 'would this be rewritten if awcms changed?' test
- Strict Content-Security-Policy sent by penyaji.mjs
- ADR index
- Performance targets and budgets
- package.json
- docs-i18n-stamp.mjs
- aksesibilitas-halaman.test.mjs
- lebar-360.test.mjs
- audit:graf gate (staleness, generated tree)
- tenant.ts
- audit-graf.test.mjs
- The unit of a backend need is a module in awcms, through module admission
- 02 — The /_portal-api/** BFF contract
- Knowledge tree README
- check-docs-translation.mjs
- client.ts
- audit-rilis.test.mjs
- awcms-astro-performa-keamanan skill
- ADR-0034 — Public by default; USER admin only when declared
- The rendering matrix — route, rendering, cache and session per surface
- Accessibility and SEO index
- bun
- ukur-skala-build.mjs
- knowledge-obsidian-export.test.mjs
- awcms-astro-situs-baru skill
- ADR-0049 — A reader may subscribe, and it is the first WRITE from a stranger's browser
- awcms-astro → awcms Integration Contract
- The USER Admin Surface
- server/penyaji.mjs header authority
- src/lib/content.ts
- versi-toolchain.test.mjs
- ADR-0052 GitHub Releases are release convention
- Ten closed gaps table (plus gap 11)
- Knowledge graph graphify-out
- Favicon Brand Mark (Traffic Light App Icon)
- audit-serapan.test.mjs
- knowledge-graph-update.mjs
- Image rules
- astro.config.mjs
- devDependencies
- ADR-0034 public by default, admin only if declared
- Order: contract, content, presentation
- runtime-bun.test.mjs
- 04 — Readiness, the proof-of-concept, and the checklist
- 03 — The route map, UI porting, and components
- A template's operator is not a deployment's operator — a flag would arrive pre-wired
- Lessons learned
- Contracts index
- Frontend map
- compilerOptions
- reporter.mjs
- terkait.ts
- Support
- audit-aset.test.mjs
- Bun runtime and pinned versions (ADR-0015)
- src/lib/content.ts
- ADR-0018 machine token build contract and traversal
- ADR-0026 per-article share card
- bun test gate
- src/lib/awcms/media.ts
- Artwork resolved by import.meta.glob with query ?url
- Core Web Vitals targets LCP INP CLS
- main-protection ruleset
- GitHub Releases convention
- Images plain img ratio rule
- overrides
- diffManifestStaleness
- AWCMS family is two repos (awcms ADR-0055)
- A site DECLARES the beacon; the template ships it off by default
- Accessibility patterns WCAG 2.1/2.2
- 403 TENANT_SUSPENDED refusal
- Section derived from CMS taxonomy (termSlugs)
- audit:rilis release backlog gate
- Production image Dockerfile and Coolify deploy
- Job picu deploy Coolify
- robots.txt.ts
- keluaran-csp.test.mjs
- Mobile-first from 360px
- ADR-0031 CycloneDX SBOM per release
- ADR-0032 CodeQL and Lighthouse CI
- content-blocks renderer (src/lib/content-blocks.ts)
- tests/katalog-po.test.mjs PO catalogue gate
- @astrojs/node standalone wrapped by penyaji.mjs
- scripts/audit-aset.mjs
- Dependabot package-ecosystem bun
- Will this change be rewritten if awcms changes? (ADR-0023/0027)
- Multi-locale pairing via translationGroupId
- AwcmsApiError
- Rule 4 Has No Checker Here
- Template issue: Laporan bug
- Kerentanan keamanan lewat GitHub Security Advisory, bukan issue publik
- Konten situs tinggal di instans awcms, bukan di repo template
- No emblems or fabricated documents
- Works without JavaScript
- No own file server
- Build token never PUBLIC_
- Silent truncation is a failure
- Never advertise unpublished asset
- publishedDate and updatedDate are two claims
- script-tag regex and SVG comment stripping fixes
- Release 0.2.0 (2026-08-08)
- *.id.md excluded from the knowledge graph so concepts are not entered twice
- ADR-0016 Bun server behind Traefik
- Entri ignore typescript >=7
- Jaring pengaman rebuild terjadwal harian

## God Nodes (most connected - your core abstractions)
1. `t()` - 33 edges
2. `scripts` - 29 edges
3. `getArticles()` - 26 edges
4. `localePath()` - 21 edges
5. `arsipUntuk()` - 21 edges
6. `siteConfig` - 19 edges
7. `AGENTS.md working contract` - 16 edges
8. `nomorHalamanTambahan()` - 15 edges
9. `Pre-0.3.0 entries (0.2.x era, archive and taxonomy, search, beacon)` - 15 edges
10. `awcms-astro-gerbang skill` - 15 edges

## Surprising Connections (you probably didn't know these)
- `PR Definition of Done Checklist` --semantically_similar_to--> `Definition of Done`  [INFERRED] [semantically similar]
  .github/PULL_REQUEST_TEMPLATE.md → AGENTS.md
- `Defect Classes That Do Not Fail a Build` --semantically_similar_to--> `Support`  [INFERRED] [semantically similar]
  .github/PULL_REQUEST_TEMPLATE.md → SUPPORT.md
- `This repo is a template, not a site` --semantically_similar_to--> `A defect here travels to every derived site`  [INFERRED] [semantically similar]
  CONTRIBUTING.md → GOVERNANCE.md
- `main-protection ruleset (ADR-0053)` --semantically_similar_to--> `main-protection ruleset with no bypass actor (ADR-0053)`  [INFERRED] [semantically similar]
  CONTRIBUTING.md → GOVERNANCE.md
- `Gate-count table drift incident` --semantically_similar_to--> `Practice overruled the written decision`  [INFERRED] [semantically similar]
  knowledge/curated/lessons-learned.md → docs/adr/0052-github-releases-are-part-of-this-repos-release-convention.md

## Import Cycles
- None detected.

## Hyperedges (group relationships)
- **Gates born from ADR-0030 written-rule-needs-checker** — changelog_lebar_360_gate, changelog_runtime_bun_gate, changelog_documented_counts_gate, changelog_versi_toolchain_gate, changelog_tanpa_backend_gate, changelog_audit_rilis_release_check [EXTRACTED 1.00]
- **Reader-browser anonymous calls to awcms** — changelog_search_box, changelog_visitor_beacon, changelog_newsletter_subscribe [EXTRACTED 0.95]
- **Knowledge graph tooling and gate** — changelog_knowledge_graph_scripts, changelog_audit_graf, changelog_cluster_only_nondeterminism, changelog_knowledge_graph_refresh [EXTRACTED 0.95]
- **Strict CSP compliance chain** — changelog_adr_0019_csp, changelog_inline_style_removal, changelog_tema_js, changelog_assets_inline_limit_zero, changelog_keluaran_csp_gate [EXTRACTED 0.90]
- **Build contract with awcms** — changelog_adr_0018, changelog_view_full_traversal, changelog_awcms_tenant_id_assertion, changelog_translation_group_gate, changelog_kontrak_awcms_test [EXTRACTED 0.90]
- **Checker gates for written rules** — changelog_audit_dokumen, changelog_audit_graf, changelog_audit_rilis, changelog_audit_serapan, changelog_audit_konten [INFERRED 0.85]
- **Gates and rules guarding authenticated surfaces** — agents_permukaanadmin, agents_test_peran_situs, agents_auth_surface_rules, agents_five_admin_rules [EXTRACTED 0.95]
- **CSP-driven rules for inline content and headers** — agents_csp_single_source, agents_no_inline_style_script, agents_penyaji, agents_test_keluaran_csp [INFERRED 0.85]
- **Keeping backend capability out of this repo** — agents_backend_need_is_module, agents_reads_not_writes, agents_test_tanpa_backend, agents_awcms_client_only, agents_test_kontrak_awcms [INFERRED 0.85]
- **The nine awcms-astro gates** — claude_skills_awcms_astro_gerbang_skill_check, claude_skills_awcms_astro_gerbang_skill_test, claude_skills_awcms_astro_gerbang_skill_audit_konten, claude_skills_awcms_astro_gerbang_skill_audit_dokumen, claude_skills_awcms_astro_gerbang_skill_audit_translation, claude_skills_awcms_astro_gerbang_skill_audit_graf, claude_skills_awcms_astro_gerbang_skill_audit_serapan, claude_skills_awcms_astro_gerbang_skill_audit_aset, claude_skills_awcms_astro_gerbang_skill_audit_rilis [EXTRACTED 1.00]
- **Reader-browser runtime calls to awcms** — claude_skills_awcms_astro_integrasi_skill_surface_search, claude_skills_awcms_astro_integrasi_skill_surface_collect, claude_skills_awcms_astro_integrasi_skill_surface_newsletter, claude_skills_awcms_astro_integrasi_skill_reader_browser_class [EXTRACTED 1.00]
- **Server-decided security header policy** — claude_skills_awcms_astro_performa_keamanan_skill_penyaji, claude_skills_awcms_astro_performa_keamanan_skill_headers, claude_skills_awcms_astro_performa_keamanan_skill_hsts, claude_skills_awcms_astro_performa_keamanan_skill_csp [EXTRACTED 1.00]
- **Checks required before merging to main** — github_workflows_ci_check_job, github_workflows_ci_build_job, github_workflows_codeql_analyze_job, governance_main_protection [EXTRACTED 1.00]
- **Template-propagation rationale driving governance rules** — governance_defect_travels, governance_new_rule_needs_checker, contributing_template_not_site, governance_adr_triggers [INFERRED 0.85]
- **Standards documents of awcms-astro** — docs_awcms_astro_standar_performa_dan_keamanan_doc, docs_awcms_astro_standar_teknis_doc, docs_awcms_astro_ui_ux_design_system_doc [INFERRED 0.85]
- **Closed gaps each paired with a checker** — docs_awcms_astro_standar_performa_dan_keamanan_gaps_table, docs_awcms_astro_standar_performa_dan_keamanan_gap10_checkers_never_ran, docs_awcms_astro_standar_performa_dan_keamanan_gap11_asset_budget, docs_awcms_astro_standar_performa_dan_keamanan_audit_konten, docs_awcms_astro_standar_performa_dan_keamanan_audit_aset [EXTRACTED 1.00]
- **Knowledge graph community naming guard** — docs_awcms_astro_standar_teknis_community_names, docs_awcms_astro_standar_teknis_knowledge_label, docs_awcms_astro_standar_teknis_audit_graf [EXTRACTED 1.00]
- **Content publish to live site rebuild flow** — docs_deploy_coolify_rebuild_chain, docs_deploy_coolify_awcms_rebuild_trigger, docs_deploy_coolify_rebuild_workflow, docs_deploy_coolify_build_time_content, docs_deploy_coolify_application_setup [EXTRACTED 0.95]
- **Frontend boundary: no sender, no SYSTEM admin, no backend in this repo** — docs_bun_realtime_client_boundary_no_duplicate_sender, docs_crm_public_ux_contract_no_admin_omes, docs_awcms_astro_checklist_repo_baru_backend_need_module, docs_crm_public_ux_contract_ownership_matrix [INFERRED 0.85]
- **Bun pin, lockfile format and frozen-install failure** — docs_awcms_astro_checklist_repo_baru_bun_version_pin, docs_awcms_astro_checklist_repo_baru_lockfile_v2_trap, docs_deploy_coolify_frozen_lockfile_failure [EXTRACTED 0.95]
- **Rules given their own checker (ADR-0030 pattern)** — docs_adr_0031_sbom_cyclonedx_dari_lockfile_pada_rilis_sbom_test, docs_adr_0037_pin_typescript_6_adalah_syarat_hidupnya_gerbang_astro_check_versi_toolchain_test, docs_adr_0050_bun_is_this_repos_only_runtime_and_a_gate_finally_says_so_runtime_bun_test, docs_adr_0052_github_releases_are_part_of_this_repos_release_convention_audit_rilis_tag_check [INFERRED 0.85]
- **Knowledge graph workflow (update, label, export, audit:graf)** — docs_adr_0051_a_knowledge_tree_points_at_the_code_and_owns_none_of_it_audit_graf, docs_adr_0051_a_knowledge_tree_points_at_the_code_and_owns_none_of_it_update_label_separation, knowledge_readme_obsidian_export_boundary, knowledge_readme_code_only_extraction [INFERRED 0.85]
- **Six curated knowledge notes** — knowledge_curated_accessibility_seo_index, knowledge_curated_contracts_index, knowledge_curated_frontend_map, knowledge_curated_lessons_learned, knowledge_curated_rendering_index, knowledge_curated_security_index [EXTRACTED 1.00]
- **The response-header posture assembled in server/penyaji.mjs** — docs_adr_0016_penyajian_bun_di_belakang_traefik_tanpa_nginx_header_satu_tempat, docs_adr_0019_csp_ketat_dikirim_penyaji_csp_ketat, docs_adr_0029_hsts_digerbangi_produksi_tanpa_includesubdomains_hsts_digerbangi_produksi, docs_adr_0025_gambar_artikel_dari_media_awcms_asal_media_diminta, docs_adr_0035_feed_atom_per_seksi_berita_dan_gerbang_atas_xml_tipe_isi_feed [EXTRACTED 1.00]
- **The green-build / empty-or-wrong-output defect class and its floor gates** — docs_adr_0018_kontrak_build_token_mesin_dan_traversal_konten_cacat_build_hijau_situs_kosong, docs_adr_0018_kontrak_build_token_mesin_dan_traversal_konten_gerbang_terjemahan, docs_adr_0025_gambar_artikel_dari_media_awcms_gerbang_nol_dari_n, docs_adr_0033_seksi_berita_urutan_dari_tanggal_dan_dua_tanggal_yang_terpisah_predikat_terbit_ditiru, docs_adr_0035_feed_atom_per_seksi_berita_dan_gerbang_atas_xml_gerbang_atas_xml [INFERRED 0.85]
- **The development-hold cycle: imposed, narrowed, ended** — docs_adr_0021_tahan_pengembangan_menunggu_fondasi_awcms_penahanan_pengembangan, docs_adr_0021_tahan_pengembangan_menunggu_fondasi_awcms_dua_indikator, docs_adr_0023_penahanan_dipersempit_pekerjaan_tanpa_awcms_uji_ditulis_ulang_jika_awcms_berubah, docs_adr_0027_penahanan_adr_0021_selesai_penahanan_selesai [EXTRACTED 1.00]
- **The reader-browser call class — anonymous calls from a stranger's browser** — docs_adr_0043_the_readers_browser_calls_awcms_and_nothing_else_changes_reader_browser_call_class, docs_adr_0043_the_readers_browser_calls_awcms_and_nothing_else_changes_tenant_from_origin, docs_adr_0044_what_a_page_view_may_cost_a_reader_beacon_without_credentials, docs_adr_0049_a_reader_may_subscribe_and_the_first_write_from_a_strangers_browser_first_write_from_stranger_browser, docs_adr_0044_what_a_page_view_may_cost_a_reader_beacon_must_carry_a_header [EXTRACTED 1.00]
- **The Jualanku portal blueprint — four planned documents forming one design** — docs_awcms_astro_jualanku_readme_blueprint, docs_awcms_astro_jualanku_01_arsitektur_experience_experience_architecture, docs_awcms_astro_jualanku_02_kontrak_bff_bff_contract, docs_awcms_astro_jualanku_03_peta_rute_dan_ui_route_map, docs_awcms_astro_jualanku_04_kesiapan_readiness [EXTRACTED 1.00]

## Communities (169 total, 31 thin omitted)

### Community 0 - "Locale config and language switcher"
Cohesion: 0.05
Nodes (38): ADR-0017, muatan, breadcrumbSchema, fullItems, locale, locale, locale, locale (+30 more)

### Community 1 - "Reading-preferences panel and storage logic"
Cohesion: 0.07
Nodes (37): ADR-0055, announce(), commit(), render(), applyAttributes(), attributesFor(), AttributeTarget, CHANGE_EVENT (+29 more)

### Community 2 - "Checklist: Starting a New Site on awcms-astro"
Cohesion: 0.05
Nodes (49): AGENTS.md working contract, ADR-0016 Bun serving behind Traefik, ADR-0034 public by default, admin only if declared, Checklist: Starting a New Site on awcms-astro, Audit gates (check, test, audit:konten/dokumen/translation/graf), Backend need becomes an awcms module (ADR-0038), AWCMS_API_TOKEN machine credential (read class, two keys), Bun version pin: five values plus digest (+41 more)

### Community 3 - "Document audit: dead links and ADR index"
Cohesion: 0.07
Nodes (40): ADR-0039, ADR-0051, ADR-0053, ADR-0062, antaraPenanda(), auditIndeksAdr(), auditJalurDisebut(), auditKutipanAdr() (+32 more)

### Community 4 - "Governance"
Cohesion: 0.05
Nodes (47): Mandatory workflow, Contributing Guide, Contribution flow (issue, branch, changeset, PR), Definition of Done checklist, Documents: English source, Indonesian mirror (ADR-0039), main-protection ruleset (ADR-0053), Non-negotiable rules (client.ts only, no raw HTML, no PUBLIC_ token), PO catalogue translation rules (+39 more)

### Community 5 - "Release script, changesets and semver"
Cohesion: 0.09
Nodes (38): ADR-0119, CHANGESET_IMPACTS, CHANGESET_TYPES, changesetBody(), isChangesetFile(), parseChangeset(), validateChangeset(), gitRunOrThrow() (+30 more)

### Community 6 - "Article layout and section ordering"
Cohesion: 0.10
Nodes (32): ADR-0026, ADR-0033, Locale, localeHtmlLang, profilSitus, indeksPost(), ADR-0109, adaKontak() (+24 more)

### Community 7 - "Content adapter, media and taxonomy mapping"
Cohesion: 0.08
Nodes (36): ADR-0024, ADR-0114, resetTaksonomiCacheForTests(), assertFeedReturnedFullRows(), assertTranslationsArePairable(), AwcmsAstroBlock, AwcmsBlogPost, AwcmsBlogPostSummary (+28 more)

### Community 8 - "Content audit over the build output"
Cohesion: 0.12
Nodes (29): artikelDiJsonLd(), auditAnggaranGambar(), auditFeed(), auditGambar(), auditKeluaran(), auditPrioritasGambar(), auditSvg(), bacaXml() (+21 more)

### Community 9 - "Taxonomy archive routes and segments"
Cohesion: 0.15
Nodes (21): artikelPerHalaman, defaultLocale, prefixedLocales, SEGMEN_HALAMAN, arsipMenurutSlug(), arsipUntuk(), Halaman, jalurHalaman() (+13 more)

### Community 10 - "Menus and widgets from awcms"
Cohesion: 0.10
Nodes (29): ambilMenu(), ambilWidget(), bacaItem(), bacaMenu(), bacaWidget(), daftarMenu(), daftarWidget(), ItemMenu (+21 more)

### Community 11 - "Search box and search origin"
Cohesion: 0.09
Nodes (27): origin, alamatKueri(), alamatSaran(), asalPencarian(), bacaEntitas(), bacaFilter(), ButirHasil, dengan() (+19 more)

### Community 12 - "Stand-in awcms for the browser accessibility gate"
Cohesion: 0.08
Nodes (24): ADR-0019, HALAMAN, MATI, ADR-0056, MODE, SEMUA, TAG_WCAG, amplop() (+16 more)

### Community 13 - "Production server and configured origins"
Cohesion: 0.13
Nodes (27): ASAL_MEDIA, ASAL_PENCARIAN, asalMediaTerkonfigurasi(), asalPencarianTerkonfigurasi(), asalTerkonfigurasi(), aturanCache(), CACHE_ASET, CACHE_HALAMAN (+19 more)

### Community 14 - "Newsletter subscription flow"
Cohesion: 0.12
Nodes (22): newsletterAktif, ADR-0103, ADR-0118, alamatBeacon(), JALUR_BEACON, muatanBeacon, PANJANG_JALUR_MAKS, PANJANG_KODE_TENANT_MAKS (+14 more)

### Community 15 - "scripts"
Cohesion: 0.07
Nodes (29): scripts, audit:aset, audit:dokumen, audit:graf, audit:konten, audit:rilis, audit:serapan, audit:translation (+21 more)

### Community 16 - "Taxonomy archive routes and segments (taksonomi)"
Cohesion: 0.11
Nodes (24): SEGMEN_KATEGORI, SEGMEN_TAG, tabBentrokSegmen(), ArsipTerm, artikelSemuaSeksi(), cacheArsip, SEGMEN_JENIS, susunArsip() (+16 more)

### Community 17 - "Section feeds and not-found page"
Cohesion: 0.17
Nodes (17): getSiteUrl(), siteConfig, TabSlug, tabTitleKey(), urutanSeksiTab(), getArticles(), daftarFeed(), isiFeed() (+9 more)

### Community 18 - "Portable Text node types and rendering"
Cohesion: 0.13
Nodes (24): ADR-0046, ADR-0110, idGaleriPortableText(), isiBlok(), isListItem(), petaAnotasi(), PORTABLE_TEXT_ALLOWED_LINK_SCHEMES, PORTABLE_TEXT_ANNOTATION_TYPES (+16 more)

### Community 19 - "Surfaces called (13) and not called (3)"
Cohesion: 0.11
Nodes (24): awcms-astro-integrasi skill, Absorption ledger of awcms ADRs (diserap/diperiksa/belum), ADR-0023 test: would this be rewritten if awcms changed?, awcms decisions that change what is true here, src/lib/beacon.ts, src/lib/awcms/client.ts, CMS menu does not replace localised tab bar, Images and share cards resolved once per build (+16 more)

### Community 20 - "Performance and Security Standard"
Cohesion: 0.10
Nodes (24): Premises That Fall the Moment a Route Leaves output static, ADR-0029 HSTS, ADR-0034 public by default, admin only if declared, ADR-0041 no Vary Cookie/Accept-Language, ADR-0042 byline per-person data, OWASP ASVS 4.0.3 mapping, awcms ADR-0065 consumer contract freeze, awcms ADR-0068 family standards posture (+16 more)

### Community 21 - "Docs translation mirror check and stamp (audit-graf)"
Cohesion: 0.17
Nodes (22): ARTEFAK_TERLACAK, auditArtefakTerlacak(), auditKesegaranTerbatas(), auditKnowledgeGeneratedUntracked(), auditLabelKomunitas(), auditLaporanSepakat(), auditPengecualian(), catat() (+14 more)

### Community 22 - "SBOM generation and build-conditioned release"
Cohesion: 0.12
Nodes (18): ADR-0015, ADR-0031, bacaJsonc(), BLOK_DEPENDENCY, lock, masalah, pkg, repoRoot (+10 more)

### Community 23 - "Site role gate and PO catalogue tests"
Cohesion: 0.10
Nodes (13): ADR-0036, PERAN_DILARANG, permukaanAdmin, situsPublikSaja(), tabs, ADR-0034, Catalog, parsePo() (+5 more)

### Community 24 - "awcms contract and no-backend tests"
Cohesion: 0.09
Nodes (16): ADR-0043, ADR-0104, ADR-0105, ADR-0107, ADR-0118, ADR-0018, ADR-0033, ADR-0038 (+8 more)

### Community 25 - "Design System"
Cohesion: 0.12
Nodes (22): ADR-0033 two dates and ordering, scripts/audit-aset.mjs, audit:dokumen gate, awcms 14_ui_ux_design_system.md, Gaps against AWCMS token vocabulary, Colour tokens, Padding shorthand on .container trap, Contrast audit never measured (+14 more)

### Community 26 - "Article layout and section ordering (TabIndex)"
Cohesion: 0.16
Nodes (13): jalurArtikel(), namaKanal(), t(), tanggalMesin(), tanggalMesin(), localePath(), jalurArsip(), getArticleVisual() (+5 more)

### Community 27 - "Technical Standard"
Cohesion: 0.11
Nodes (21): ADR-0015 Bun runtime, ADR-0018 build token contract, ADR-0024 local art in src/assets, ADR-0026 per-article share cards, ADR-0035 Atom feeds, ADR-0037 TypeScript 6 pin, ADR-0039 English source language, scripts/audit-konten.mjs (+13 more)

### Community 28 - "Static analysis, CWV lab and content audit tests"
Cohesion: 0.12
Nodes (12): ADR-0028, ADR-0032, codeql, ADR-0030, halaman(), pohon(), sementara, situs() (+4 more)

### Community 29 - "Obsidian export safety boundary"
Cohesion: 0.15
Nodes (15): ALLOWED_TO_CLEAR, CURATED, entries, GENERATED, rejections, STAGING, syncable, ALLOWED_EXTENSIONS (+7 more)

### Community 30 - "Content blocks and resolved media"
Cohesion: 0.23
Nodes (18): ALLOWED_HEADING_LEVELS, AWCMS_BLOCK_TYPES, Block, escapeHtml(), GalleryItem, MediaTerresolusi, renderBlock(), renderContentBlocks() (+10 more)

### Community 31 - "awcms backend and system of record"
Cohesion: 0.13
Nodes (19): ADR-0038 backend need becomes awcms MODULE, ADR-0039 English is source language, ADR-0046 video embed refused (divergence), audit:translation gate, awcms backend and system of record, Bun-only realtime client boundary (proposal), CRM public UX contract (lead and consent), Frontend dependency inventory (issue 126) (+11 more)

### Community 32 - "Changelog: server, redirects and Bun runtime"
Cohesion: 0.12
Nodes (18): ADR-0015 Bun runtime and package manager, ADR-0016 Bun serves build, nginx removed, ADR-0019 strict CSP and no inline script, ADR-0025 article images from awcms media, ADR-0028 performance and security standards anchor, ADR-0029 HSTS production-only no includeSubDomains, assetsInlineLimit 0, Script named same as binary recursion trap (+10 more)

### Community 33 - "Pre-0.3.0 entries (0.2.x era, archive and taxonomy, search, beacon)"
Cohesion: 0.18
Nodes (18): Author byline (ADR-0042), Build ceiling 60000 posts / ukur:skala, CMS menus and widgets in footer, awcms consumer contract frozen surfaces (ADR-0065), CSP no inline script/style rule, Gallery media id resolution, tests/identitas-situs.test.mjs, tests/kontrak-awcms.test.mjs (+10 more)

### Community 34 - "Release script, changesets and semver (audit-rilis)"
Cohesion: 0.14
Nodes (12): dated, ADR-0030, ADR-0040, oldest, pending, rawRefsRemote, REPO_SLUG, reporter (+4 more)

### Community 35 - "Docs translation marker checks"
Cohesion: 0.21
Nodes (15): ADR-0023, ADR-0030, ADR-0097, ANY_MARKER_GLOBAL, ANY_MARKER_REGEX, checkMirrorCoverage(), checkTranslationPair(), computeSourceHash() (+7 more)

### Community 36 - "awcms-astro-gerbang skill"
Cohesion: 0.20
Nodes (16): A Skill Is FOLLOWED, a Document Is Doubted, awcms-astro-gerbang skill, audit:aset gate, audit:dokumen gate, audit:graf gate (knowledge:check), audit:konten gate, audit:rilis gate, audit:serapan gate (+8 more)

### Community 37 - "CHANGELOG (awcms-astro release log)"
Cohesion: 0.17
Nodes (16): ADR-0030 a written rule gets its checker, ADR-0037 TypeScript 6 pin keeps astro check alive, Reader asset budget gate, audit:aset asset byte budget gate, Bun 1.4.2 and bun.lock lockfileVersion 2, Bun pin moves 1.4.2 to 1.4.4 across five values plus digest, CHANGELOG (awcms-astro release log), tests/documented-counts.test.mjs (+8 more)

### Community 38 - "Article images and local artwork"
Cohesion: 0.22
Nodes (11): ADR-0021, ArticleVisual, getArticleImage(), getTabImage(), heroImage, MODUL, SENI, cariSeni() (+3 more)

### Community 39 - "audit:konten published-output gate"
Cohesion: 0.13
Nodes (15): ADR-0033 news section ordering and two dates, ADR-0035 Atom feed per news section, ADR-0036 news is this repo's vocabulary, ADR-0041 locale stays at root, Vary Cookie/Accept-Language refused, audit:konten published-output gate, tests/audit-konten.test.mjs mutation-proven, awcms ADR-0098 locale in path, image weight budget 250KB home 100KB content (+7 more)

### Community 40 - "CDN purge step and its tests"
Cohesion: 0.23
Nodes (11): ADR-0054, API_BASE_BAWAAN, bacaKonfigurasi(), badanPurge(), pesanGalat(), purgeCdn(), tungguDariHeader(), urlPurge() (+3 more)

### Community 41 - "ADR-0049 — A reader may subscribe, and it is the first WRITE from a stranger's browser"
Cohesion: 0.14
Nodes (15): ADR-0036 — /news/ is this repo's vocabulary, and a tab that carries it, kosakata-news gate: a tab slugged `news` must declare urutanSeksi "terbaru", `news` is a tab slug a site chooses, not a reserved word, No category/tag taxonomy in this repo — archives deliberately do not follow, URL vocabulary split: /news/ here, /blog/ in awcms, ADR-0041 — The default locale stays at the ROOT, and two `Vary` names are refused, A tab, admin prefix or route claiming `/blog` is refused — ADR-0036's ungated half, The default locale keeps the root because a static build has no negotiation (+7 more)

### Community 42 - "ADR-0040 — A changeset declares its own semver bump"
Cohesion: 0.15
Nodes (15): ADR-0039 — English is the source language; Indonesian is the mirror, audit:translation gate — coverage and currency checked separately, DOCS_AWAITING_MIRROR — a shrink-only migration ledger of 52 documents, English at the bare path is authoritative; `<name>.id.md` is the mirror, i18n-source-hash staleness marker living in the mirror, ADR-0040 — A changeset declares its own semver bump, A changeset declares `bump: major|minor|patch`; the release takes the largest waiting, A command-line level may override upward only, never smaller (+7 more)

### Community 43 - "Site profile and public media origin"
Cohesion: 0.20
Nodes (12): asalMediaPublik, ObjekMedia, resolveObjekMedia(), ambilProfil(), bacaTautanSosial(), penolakanYangDiharapkan(), peringatkan(), PROFIL_KOSONG (+4 more)

### Community 44 - "Release v0.6.1 (2026-10-24)"
Cohesion: 0.14
Nodes (14): ADR-0040 changeset declares semver bump, Absorption ledger with three verdicts, Dependency raise clearing 29 advisories, audit:rilis fourth check (tag has GitHub Release), audit:serapan awcms ADR verdict ledger, awcms ADR-0121..0124 verdicts, awcms ADR-0125..0146 verdicts, codeql-action pins to v4.38.2 (+6 more)

### Community 45 - "Bun as runtime and package manager"
Cohesion: 0.15
Nodes (14): Lockfile identity check before install, Bun version pinned in places that must move together, Bun as runtime and package manager, No script may share a name with the binary it invokes, Bun serves the build output, The extension list living in three places, Five recommended controls refused in writing, The checker runs the built artefact, not the source (+6 more)

### Community 46 - "The green-build-empty-site defect class"
Cohesion: 0.15
Nodes (14): Two missing awcms contracts blocking the first internal screen, The green-build-empty-site defect class, Translations that cannot be paired fail the build, awcms machine credentials with narrowest scope, Tenant decided by the machine token, config as assertion, Keyset cursor traversal over created_at, The build feed (view=full), Tenant is not verified over the network (+6 more)

### Community 47 - "Knowledge graph label step"
Cohesion: 0.14
Nodes (11): byName, GRAPH, graphText, LABELS, members, problems, REPORT, rewrittenGraph (+3 more)

### Community 48 - "dependencies"
Cohesion: 0.15
Nodes (13): astro, @astrojs/check, @astrojs/node, @astrojs/sitemap, compression, dependencies, astro, @astrojs/check (+5 more)

### Community 49 - "No-backend boundary test"
Cohesion: 0.15
Nodes (10): ADR-0020, ADR-0057, ADR-0092, KELAS_BACKEND, ADR-0018, ADR-0038, ADR-0039, ADR-0044 (+2 more)

### Community 50 - "Asset byte budget audit"
Cohesion: 0.31
Nodes (12): ADR-0070, ADR-0101, asetHalaman(), AUDIENS_PUBLIC, auditKeluaran(), auditSumber(), berkasDi(), ekstensi() (+4 more)

### Community 51 - "awcms ADR absorption audit"
Cohesion: 0.18
Nodes (10): ADR-0116, baris(), BATAS_MS, blok, isi, ADR-0030, ADR-0100, nomorDari() (+2 more)

### Community 52 - "ADR-0019 — A strict CSP sent by the server"
Cohesion: 0.35
Nodes (13): ADR-0014 — Mixed rendering and the Jualanku portal BFF, ADR-0015 — The Bun runtime closes the family divergence, ADR-0016 — Served by Bun behind Traefik; nginx dropped, ADR-0017 — This repo carries the OWNER/INTERNAL admin pages, ADR-0018 — The build contract against awcms, ADR-0019 — A strict CSP sent by the server, ADR-0020 — Admin screens return to awcms, ADR-0021 — Development held until the awcms foundation is finished (+5 more)

### Community 53 - "ADR-0033 — News sections order by date; two dates separated"
Cohesion: 0.23
Nodes (13): The standards anchor with pinned editions, Nine gaps, each recorded with its checker, ADR-0030 — Written rules finally get a checker, A rule without its checker is a rule that will be broken, ADR-0032 — The last two gaps closed with honesty conditions, ADR-0033 — News sections order by date; two dates separated, publishedDate and updatedDate read from ONE row, A tab declares itself a news section (urutanSeksi) (+5 more)

### Community 54 - "Bylines and CMS-vocabulary sections (ADR-0042, ADR-0045)"
Cohesion: 0.18
Nodes (11): Absent stays absent — no publisher name substituted for a missing byline, ADR-0042 — A byline is the first per-person data this template publishes, authorByline rendered on all three surfaces that name an author, The byline is read from the TRANSLATED row, unlike termIds/urutan/kategori, A static site holds a COPY, so the erasure path ends in a rebuild, The JSON-LD `Person` carries a name and nothing else — no @id, url, sameAs, uri or email, ADR-0045 — A section comes from the CMS vocabulary, not from a sidecar only we write, Fixtures on both sides could not produce the one shape that fails in production (+3 more)

### Community 55 - "Redirect map and its tests"
Cohesion: 0.26
Nodes (10): buatServer(), jalankan(), jawabPengalihan(), kunciPengalihan(), ADR-0047, PENGALIHAN, targetPengalihan(), periksaPeta() (+2 more)

### Community 56 - "RSS/Atom feed builder"
Cohesion: 0.24
Nodes (10): bangunFeedAtom(), BerkasFeed, ButirFeed, LEPAS, lepasXml(), NAMA_BERKAS_FEED, RFC-3339, RFC-4287 (+2 more)

### Community 57 - "Knowledge graph label tests"
Cohesion: 0.23
Nodes (11): assertRefusedWithoutWriting(), cleanFixture(), cleanup, graphOf(), node(), REPO_ROOT, reportOf(), run() (+3 more)

### Community 58 - "Definition of Done"
Cohesion: 0.17
Nodes (12): PR Definition of Done Checklist, Audit gates (konten, dokumen, graf, translation, rilis, aset), client.ts is only file contacting awcms, Backend need becomes a module in awcms (ADR-0038), Definition of Done, Design tokens and global vs scoped CSS, Fourth awcms surface out of contract, One awcms, many sites (+4 more)

### Community 59 - "AGENTS.md working contract"
Cohesion: 0.17
Nodes (12): AGENTS.md working contract, Configuration rules, Core Web Vitals p75 target, Read env through env.ts, External standards binding repo (ADR-0028), Divergences recorded in family compatibility manifest, Interface rules, Working with knowledge graph (ADR-0051) (+4 more)

### Community 60 - "permukaanAdmin declaration (ADR-0034)"
Cohesion: 0.21
Nodes (12): Four rules for every authenticated surface, awcms first, no feature only here, Five rules for admin exception, Jualanku portal BFF (ADR-0014), Moving to SSR rules, owner role never exists here, permukaanAdmin declaration (ADR-0034), Public pages as primary function (+4 more)

### Community 61 - "The 'would this be rewritten if awcms changed?' test"
Cohesion: 0.21
Nodes (12): The Jualanku portal BFF, Portal session contract, Two checkable indicators for lifting the hold, The development hold, Resumption points recorded while the context is fresh, 'The endpoint already exists' is not an answer of no, The 'would this be rewritten if awcms changed?' test, ADR-0025 — Article images from awcms media (+4 more)

### Community 62 - "ADR cluster: strict CSP and serving decisions"
Cohesion: 0.20
Nodes (12): Response headers settled in one file, vite assetsInlineLimit set to 0, Strict Content-Security-Policy sent by penyaji.mjs, JSON-LD stays inline as a data block, Permissions-Policy as the fifth security header, Theme switcher moved to public/tema.js, ADR-0029 — HSTS gated to production without includeSubDomains, HSTS sent only when NODE_ENV is production (+4 more)

### Community 63 - "ADR index"
Cohesion: 0.20
Nodes (12): ADR-0037 TypeScript 6.x pin keeps astro check alive, astro check Type check gate, awcms divergence astro-files-not-type-checked, TypeScript ^6 pin, tests/versi-toolchain.test.mjs, ADR-0050 Bun is the only runtime, @astrojs/node and compression deliberate keeps, node:* built-ins are Bun's own, kept (+4 more)

### Community 64 - "Performance targets and budgets"
Cohesion: 0.17
Nodes (12): ADR-0019 strict CSP, ADR-0032 CodeQL and lab CWV, ADR-0050 Bun only runtime, tests/cwv-lab.test.mjs, Performance targets and budgets, Security binding rules, public/tema.js, ADR-0019 strict CSP (+4 more)

### Community 65 - "Package manifest"
Cohesion: 0.17
Nodes (11): description, homepage, license, name, packageManager, private, repository, type (+3 more)

### Community 66 - "Docs translation mirror check and stamp (docs-i18n-stamp)"
Cohesion: 0.20
Nodes (8): changed, CHECK_ONLY, inBody(), ADR-0039, ROOT, splitFrontmatter(), withMarker(), withoutMarker()

### Community 67 - "Public-page accessibility defect gate (static)"
Cohesion: 0.18
Nodes (8): buletin, contrast(), css, home, lang, layout, luminance(), themes

### Community 68 - "360px width layout test"
Cohesion: 0.17
Nodes (5): AGENTS, BLOK_CONTAINER, CSS_GLOBAL, DOKUMEN_CSS, ADR-0030

### Community 69 - "audit:graf gate (staleness, generated tree)"
Cohesion: 0.20
Nodes (11): ADR-0021 development hold (superseded), ADR-0023 test: rewritten if awcms changes, ADR-0027 hold over, ADR-0030 written rule gets a checker, audit:dokumen documentation gate, audit:graf gate (staleness, generated tree), graphify cluster-only non-determinism finding, graphify-out knowledge graph (+3 more)

### Community 70 - "Tenant resolution from the machine token"
Cohesion: 0.22
Nodes (9): ADR-0022, ADR-0049, ADR-0090, ADR-0093, refuseRetiredVariables(), resolveTenant(), TenantNotConfiguredError, TenantResolution (+1 more)

### Community 71 - "Graph audit tests"
Cohesion: 0.33
Nodes (9): ADR-0124, graf(), laporan(), node(), pohon(), pohonBersih(), repo(), repoWithStaleFiles() (+1 more)

### Community 72 - "The unit of a backend need is a module in awcms, through module admission"
Cohesion: 0.18
Nodes (11): ADR-0038 — A backend need becomes a MODULE in awcms, What counts as backend: stores, decides permissions, runs business rules, cross-tenant, or serves others, The unit of a backend need is a module in awcms, through module admission, A BFF may call, assemble and hide credentials; it may not store, decide, or become the last reference, This repo READS awcms and does not write, tanpa-backend gate: no backend-class dependency, no non-GET fetch, no persistence artefacts, A one-file exemption to the non-GET gate, bought with two new assertions, The reader-browser class grows from three to four, and the fourth WRITES (+3 more)

### Community 73 - "02 — The /_portal-api/** BFF contract"
Cohesion: 0.20
Nodes (11): The declaration must be refused when rawIpEnabled is on — stated, not gateable from here, 01 — The experience layer architecture, The rollback path — a full static build must stay producible and tested in CI, 02 — The /_portal-api/** BFF contract, The BFF's hard boundary — it may shape, never decide, The awcms envelope is translated into a view model; the correlationId is shown as a short reference, No generic passthrough — every endpoint registered explicitly, or the BFF is a confused deputy, Uploads go direct to object storage through a presigned URL, never through the BFF as bytes (+3 more)

### Community 74 - "Knowledge tree README"
Cohesion: 0.20
Nodes (11): ADR-0051 Knowledge tree points at the code, audit:graf gate with MAX_STALE_FILES=40, awcms-one Graphify workflow prior art, knowledge/** English-only, no .id.md mirror, knowledge/generated/ gitignored, Non-deterministic community detection (92/90/91), Update decides partition, label decides names, Knowledge tree README (+3 more)

### Community 75 - "Docs translation mirror check and stamp"
Cohesion: 0.33
Nodes (9): DOCS_AWAITING_MIRROR, gitList(), listMirrors(), listSources(), ROOT, runChecks(), deriveSourcePath(), isInScope() (+1 more)

### Community 76 - "awcms HTTP client and environment"
Cohesion: 0.38
Nodes (9): awcmsGet(), baseUrl(), batasWaktuMs(), describeTenantResolution(), Envelope, tenant(), envSource, readEnv() (+1 more)

### Community 77 - "Release audit tests"
Cohesion: 0.22
Nodes (7): git(), pohon(), repoGit(), sementara, server, SKRIP, berkas()

### Community 78 - "awcms-astro-performa-keamanan skill"
Cohesion: 0.27
Nodes (10): awcms-astro-performa-keamanan skill, COOP and SRI refusals are premises that fail once permukaanAdmin is declared, Core Web Vitals targets LCP/INP/CLS at p75, Honesty condition on CodeQL (.astro) and lab CWV claims, Family standard editions pinned by awcms ADR-0068, permukaanAdmin site-declared USER admin surface, Before a derived site goes live checklist, Five deliberately refused controls (+2 more)

### Community 79 - "ADR-0034 — Public by default; USER admin only when declared"
Cohesion: 0.22
Nodes (10): Preserved static rollback path, Static-by-default with on-demand routes, Four rules binding any authenticated surface, Permissions do not move with the screen, Moving a screen was never a security control, This repo carries no admin screens, ADR-0034 — Public by default; USER admin only when declared, The owner role is mechanically refused (+2 more)

### Community 80 - "ADR-0044 — What a page view may cost a reader"
Cohesion: 0.20
Nodes (10): connect-src derived from a build-written file, the same road img-src travels, ADR-0044 — What a page view may cost a reader, Option B — the visit beacon is a plain fetch, so the awcms_visitor_key cookie is never stored, No consent banner, because nothing is placed on the reader's device to consent to, Mandatory test: no static HTML and no sitemap entry for any private portal route, The rendering matrix — route, rendering, cache and session per surface, Static-by-default with `prerender = false` opting out one route at a time, Cookie and CSRF rules — opaque reference, HttpOnly/Secure/SameSite, double-submit plus Origin (+2 more)

### Community 81 - "Accessibility and SEO index"
Cohesion: 0.20
Nodes (10): Accessibility and SEO index, Core Web Vitals lab vs real measurement, Never advertise an unpublished asset (og:image), WCAG 2.1 AA public vs 2.2 AA authenticated, Declared USER admin surface (permukaanAdmin), Security index, COOP/CORP premise collapses on first admin surface, CSP decided only in server/penyaji.mjs (+2 more)

### Community 82 - "Git helpers for scripts"
Cohesion: 0.22
Nodes (9): engines, bun, listMirrors(), gitRun(), gitRunInherit(), jalankan(), jalankan(), jawabanDengan() (+1 more)

### Community 83 - "Build-scale measurement script"
Cohesion: 0.24
Nodes (8): badanSintetis(), hasil, kolom, lebar, postSintetis(), ukur(), ukuran, UKURAN_BAWAAN

### Community 84 - "Obsidian export tests"
Cohesion: 0.27
Nodes (7): buildFixture(), cleanup, EXPORT_SCRIPT, fakeGraph(), fakeGraphifyBin(), REPO_ROOT, write()

### Community 85 - "awcms-astro-situs-baru skill"
Cohesion: 0.28
Nodes (9): Content-Security-Policy strict (ADR-0019), Security headers decided only in server/penyaji.mjs, Strict-Transport-Security production-only, no includeSubDomains, server/penyaji.mjs, awcms-astro-situs-baru skill, docs/awcms-astro/checklist-repo-baru.md, What must be emptied before first commit, GitHub template repository (Use this template) (+1 more)

### Community 86 - "Reader browser calls awcms directly (ADR-0043)"
Cohesion: 0.20
Nodes (11): The hardened awcms surface list guards WHICH endpoints are called, not what they return, ADR-0043 — The reader's browser calls awcms directly, kotak-cari gate: the three call properties, proven by mutation, The reader-browser call class — anonymous calls outside `astro build`, A simple request: no custom headers, no credentials — awcms ships no OPTIONS behind search, The tenant comes from the `Origin`, and an unregistered domain gets the neutral empty payload, The beacon is the one request that MUST carry `application/json`, inverting the search box's rule, An empty vocabulary is a legitimate state; a 403/404 warns and returns [] (+3 more)

### Community 87 - "The USER Admin Surface"
Cohesion: 0.25
Nodes (9): awcms-astro → awcms Integration Contract, The Data Model Mapping to awcms_blog_posts, The LocalizedArticle Adapter Contract, What Is Most at Risk of Being Lost in Migration, How a Section Is Resolved (taxonomy over sidecar), Deliberate Divergence From the Family, Position in the AWCMS Family (two developed, two archives), The awcms-astro Standard (+1 more)

### Community 88 - "The USER Admin Surface (variant 2)"
Cohesion: 0.29
Nodes (8): awcms-astro Project Skills Catalogue, Four Skills, Not Fifty, The awcms /admin/* Screen Registry, The Boundary Is WHAT IS MANAGED, Not Who Uses It, The awcms Identity Model That Must Be Imitated, Not Guessed, The USER Admin Surface, What Is Never Built Here, The Work Order: awcms First, Always

### Community 89 - "server/penyaji.mjs header authority"
Cohesion: 0.25
Nodes (8): HTML short cache, _astro immutable, COOP/CORP/SRI premise: no session to fence, CSP loosened only in penyaji.mjs, HSTS only in production (ADR-0029), No inline style or script (CSP, ADR-0019), No third-party scripts or reader data collection, server/penyaji.mjs header authority, tests/keluaran-csp.test.mjs

### Community 90 - "Integration skill: rules that may not be broken"
Cohesion: 0.25
Nodes (8): Author byline as per-person data (ADR-0042), src/lib/content.ts, Integration rules that may not be broken, /api/v1/blog/posts, Tenant comes from machine token, not header, 403 TENANT_SUSPENDED / PARTNER_SUSPENDED build failure modes, Build feed traversal: view=full + order=created_at + nextCursor, Machine credentials may write (awcms ADR-0092); build token must stay read-class

### Community 91 - "Toolchain version gate"
Cohesion: 0.25
Nodes (6): ADR-0037, ci, dockerfile, ADR-0030, pkg, VERSI

### Community 92 - "ADR-0052 GitHub Releases are release convention"
Cohesion: 0.25
Nodes (8): ADR-0031 CycloneDX SBOM from bun.lock, CycloneDX 1.5 SBOM format, scripts/sbom.mjs generator, tests/sbom.test.mjs checker, ADR-0052 GitHub Releases are release convention, audit:rilis check every remote tag has a Release, scripts/rilis.mjs prints gh release create, scripts/lib/tag-rilis.mjs

### Community 93 - "Ten closed gaps table (plus gap 11)"
Cohesion: 0.25
Nodes (8): ADR-0030 written rules get checkers, ADR-0031 CycloneDX SBOM, ADR-0053 main protection ruleset, scripts/audit-konten.mjs, Gap 10: checkers never executed in template repo, Ten closed gaps table (plus gap 11), NIST SSDF SP 800-218 practices, scripts/sbom.mjs

### Community 94 - "Knowledge graph graphify-out"
Cohesion: 0.29
Nodes (8): ADR-0051 knowledge tree, audit:graf gate, Community name rules, graphifyignore corpus narrowing, knowledge/ curated vs generated, Knowledge graph graphify-out, scripts/knowledge-graph-label.mjs, Bounded content staleness

### Community 95 - "Favicon Brand Mark (Traffic Light App Icon)"
Cohesion: 0.39
Nodes (8): Rounded Square Icon Backdrop (64x64, rx=14), Sky-to-Emerald Brand Palette (Tailwind-family hues), Diagonal Blue-to-Green Linear Gradient (id=f), Favicon Brand Mark (Traffic Light App Icon), Three Stacked Signal Lamps (red, amber, green), Red/Amber/Green Status Color Semantics, Traffic Light Housing Glyph (dark pill, 85% opacity), Traffic Signal Motif (lampu lalu lintas)

### Community 96 - "ADR absorption audit tests"
Cohesion: 0.25
Nodes (5): ADR-0117, jalankan(), LIB, sementara, SKRIP

### Community 97 - "Knowledge graph update step"
Cohesion: 0.29
Nodes (5): after, before, fail(), GRAPH_PATH, run()

### Community 98 - "Image rules"
Cohesion: 0.29
Nodes (7): Image rules, Strings via PO catalogue with t() fallback, --ratio-visual single ratio, scripts/audit-konten.mjs, tests/katalog-po.test.mjs, ADR-0024 local art in src/assets, visual-placeholder fallback frame

### Community 99 - "Astro config, site URL and locale prefixes"
Cohesion: 0.43
Nodes (6): LOCALE_PREFIXES, neutralPath(), serialize(), SITE, ADR-0014, ADR-0035

### Community 100 - "devDependencies"
Cohesion: 0.29
Nodes (7): @axe-core/playwright, devDependencies, @axe-core/playwright, @playwright/test, @types/bun, @playwright/test, @types/bun

### Community 101 - "ADR-0034 public by default, admin only if declared"
Cohesion: 0.29
Nodes (7): ADR-0014 mixed rendering and Jualanku BFF, ADR-0017 admin screens here (superseded), ADR-0020 admin screens return to awcms, ADR-0034 public by default, admin only if declared, awcms ADR-0070 narrows ADR-0051, tests/peran-situs.test.mjs, permukaanAdmin declaration

### Community 102 - "Order: contract, content, presentation"
Cohesion: 0.29
Nodes (7): .env from .env.example, Illustrations in src/assets with hero fallback to nothing, tests/kosakata-news.test.mjs, News tab: slug news requires urutanSeksi terbaru, Order: contract, content, presentation, permukaanAdmin (empty = public only), src/config/site.ts

### Community 103 - "Bun-only runtime gate"
Cohesion: 0.29
Nodes (5): ADR-0050, dockerfile, ADR-0030, pkg, RUNTIME_BINARIES

### Community 104 - "Static-by-default with `prerender = false` opting out one route at a time"
Cohesion: 0.29
Nodes (7): Family divergence `public-locale-url-shape` requested of awcms, Asking awcms to record an intentionalDivergences entry is the family mechanism, WCAG 2.2 AA baseline for the Jualanku surfaces, The acceptance checklist across architecture, identity, cache, UI/UX, operations and content, A template repo has no awcms instance, so the PoC is work nobody here can yet prove, The seven P0 prerequisites before a production portal screen, 04 — Readiness, the proof-of-concept, and the checklist

### Community 105 - "A value with no readable PO-catalogue label renders no chip; facet parameters are an allow-list"
Cohesion: 0.29
Nodes (7): A value with no readable PO-catalogue label renders no chip; facet parameters are an allow-list, Exact paths, never patterns; locale prefixes written out explicitly, pengalihan gate: no chain, no loop, no non-canonical key or target, The Elementor porting disposition — PORT/REDESIGN/DYNAMIC/REMOVE/DEFER, Interface strings go through the PO catalogues, in every locale, never written into a component, The portal component group and the design-token rule, 03 — The route map, UI porting, and components

### Community 106 - "04 — Readiness, the proof-of-concept, and the checklist"
Cohesion: 0.29
Nodes (7): The snippet never becomes HTML, and no markup is assembled in JavaScript, ADR-0046 — A video embed is refused here, and that is a divergence rather than an omission, A template's operator is not a deployment's operator — a flag would arrive pre-wired, video_news renders as a link; frame-src stays absent from the CSP, The template's own redirect map is EMPTY — a template has no URL history, A template's version number is the only thing its derived sites have, What is deliberately postponed, and the two entries that no longer apply

### Community 107 - "Lessons learned"
Cohesion: 0.29
Nodes (7): Practice overruled the written decision, 360px floor gate (lebar-360.test.mjs), Lessons learned, padding on .container deletes side padding incident, Gate-count table drift incident, Translated key names published as prose incident, 60 of 101 communities mislabelled incident

### Community 108 - "Contracts index"
Cohesion: 0.29
Nodes (7): Contracts index, TENANT_SUSPENDED and PARTNER_SUSPENDED refusals, Tenant comes from the token, Three frozen build-time awcms surfaces, view=full requirement, Summary-vs-view=full empty build incident, Cross-repo source-of-truth rules

### Community 109 - "Frontend map"
Cohesion: 0.33
Nodes (7): Frontend map, Backend need becomes a MODULE in awcms, Jualanku portal BFF (planned), Public by default, enforced by peran-situs test, Rendering index, output: static is a premise, Two legitimate classes of on-demand route

### Community 110 - "compilerOptions"
Cohesion: 0.29
Nodes (6): astro/tsconfigs/strict, compilerOptions, jsx, jsxImportSource, moduleResolution, extends

### Community 111 - "Script reporter and script standard test"
Cohesion: 0.33
Nodes (4): createReporter(), formatReport(), ADR-0030, scripts

### Community 112 - "Related-articles selection"
Cohesion: 0.38
Nodes (4): UrutanSeksi, artikelLainnya(), MAKS_LAINNYA, PunyaSlug

### Community 113 - "The USER Admin Surface (Support)"
Cohesion: 0.33
Nodes (6): Defect Classes That Do Not Fail a Build, Serving rules, Code of Conduct, This Repo's Attack Surface, Security Policy, Support

### Community 114 - "Asset audit tests"
Cohesion: 0.33
Nodes (3): PUBLIC_LENGKAP, sementara, SKRIP

### Community 115 - "Bun runtime and pinned versions (ADR-0015)"
Cohesion: 0.40
Nodes (5): Bun runtime and pinned versions (ADR-0015), bun.lock must be committed and checked, No Node.js runtime (ADR-0050), tests/runtime-bun.test.mjs, tests/versi-toolchain.test.mjs

### Community 116 - "AGENTS rules on the content adapter"
Cohesion: 0.40
Nodes (5): Four rules in content.ts, src/lib/content.ts, No raw-HTML path from CMS, Explicit section ordering (ADR-0033), view=full required for post list

### Community 117 - "ADR-0018 machine token build contract and traversal"
Cohesion: 0.40
Nodes (5): ADR-0018 machine token build contract and traversal, AWCMS_TENANT_ID assertion verified against token, tests/kontrak-awcms.test.mjs, translationGroupId pairing gate, view=full keyset traversal

### Community 118 - "ADR-0026 per-article share card"
Cohesion: 0.40
Nodes (5): ADR-0026 per-article share card, shareCard single prop, Reference-repo identity leaks removed, SITE_MARK optional header glyph, SITE_SOCIAL_IMAGE optional share card

### Community 119 - "awcms-astro-gerbang skill (bun test gate)"
Cohesion: 0.40
Nodes (5): tests/documented-counts.test.mjs, tests/lebar-360.test.mjs 360px layout floor, bun test gate, tests/kontrak-awcms.test.mjs, bun run release runs six of seven checks after build

### Community 120 - "Integration skill: media endpoints and origin"
Cohesion: 0.40
Nodes (5): scripts/asal-media.mjs, src/lib/awcms/media.ts, server/penyaji.mjs, /api/v1/media/objects, /api/v1/media/public-origin

### Community 121 - "The 'would this be rewritten if awcms changed?' test (Artwork resolved by import.meta.glob with query ?url)"
Cohesion: 0.40
Nodes (5): The image/placeholder branch lives in one component, Artwork resolved by import.meta.glob with query ?url, No fallback from an article to its section's artwork, Specific beats generic: awcms media beat local artwork, MIME type and dimensions travel with the image

### Community 122 - "Performance and Security Standard (Core Web Vitals targets LCP INP CLS)"
Cohesion: 0.40
Nodes (5): Lab Core Web Vitals via Lighthouse CI, conditioned on a content source, ADR-0032 CodeQL and lab CWV, Lab CWV assertion in CI (Lighthouse CI, TBT proxy), Core Web Vitals targets LCP INP CLS, RUM refusal

### Community 123 - "main-protection ruleset"
Cohesion: 0.40
Nodes (5): ADR-0053 main fenced by repository ruleset, main-protection ruleset, Manual verification of ruleset (not machine-gated), Required checks Check, Build, Analyze, Required approvals 0 (single maintainer)

### Community 124 - "Quality gates table"
Cohesion: 0.40
Nodes (5): ADR-0040 changeset bump, ADR-0052 GitHub Releases, audit:rilis gate, GitHub Releases convention, Versioning semver and changesets

### Community 125 - "Images plain img ratio rule"
Cohesion: 0.40
Nodes (5): ADR-0024 local art, scripts/audit-konten.mjs, Component table, Ilustrasi.astro, Images plain img ratio rule

### Community 126 - "overrides"
Cohesion: 0.40
Nodes (5): overrides, @emnapi/core, @emnapi/runtime, fast-uri, nanoid

### Community 128 - "AWCMS family is two repos (awcms ADR-0055)"
Cohesion: 0.50
Nodes (4): awcms-mini and awcms-micro are archives, tests/kosakata-news.test.mjs, AWCMS family is two repos (awcms ADR-0055), Public URL vocabulary split blog vs news

### Community 129 - "A site DECLARES the beacon; the template ships it off by default"
Cohesion: 0.50
Nodes (4): The box is hidden until its script runs, and `[hidden]` is made to win over author display rules, A site DECLARES the beacon; the template ships it off by default, The privacy page grows a section when, and only when, the form does, SITE_NEWSLETTER: three surfaces appear together or not at all, and only where AWCMS_API_URL is set

### Community 130 - "Technical Standard (Accessibility patterns WCAG 2.1/2.2)"
Cohesion: 0.50
Nodes (4): Accessibility WCAG 2.1 AA, Accessibility patterns WCAG 2.1/2.2, ADR-0014 mixed rendering and BFF, ADR-0034 public by default

### Community 131 - "403 TENANT_SUSPENDED refusal"
Cohesion: 0.67
Nodes (3): 403 PARTNER_SUSPENDED refusal, Tenant comes from token; AWCMS_TENANT_ID is assertion, 403 TENANT_SUSPENDED refusal

### Community 132 - "Section derived from CMS taxonomy (termSlugs)"
Cohesion: 0.67
Nodes (3): ADR-0045 section from CMS vocabulary, contentJson.awcmsAstro sidecar, Section derived from CMS taxonomy (termSlugs)

### Community 133 - "audit:rilis release backlog gate"
Cohesion: 0.67
Nodes (3): ADR-0048 release cut when backlog crosses a bound, audit:rilis release backlog gate, Changesets (.changesets)

### Community 134 - "Production image Dockerfile and Coolify deploy"
Cohesion: 0.67
Nodes (3): Dockerfile in-image test gate subset, Production image Dockerfile and Coolify deploy, rebuild.yml workflow

### Community 135 - "Job picu deploy Coolify"
Cohesion: 0.67
Nodes (3): Endpoint /api/v1/deploy Coolify, bukan /restart, Job picu deploy Coolify, Syarat target deploy dinyatakan eksplisit di ringkasan run

## Ambiguous Edges - Review These
- `Three Stacked Signal Lamps (red, amber, green)` → `Sky-to-Emerald Brand Palette (Tailwind-family hues)`  [AMBIGUOUS]
  public/favicon.svg · relation: conceptually_related_to

## Knowledge Gaps
- **599 isolated node(s):** `SITE`, `origin`, `pelapor`, `localeDefault`, `locales` (+594 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **31 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **What is the exact relationship between `Three Stacked Signal Lamps (red, amber, green)` and `Sky-to-Emerald Brand Palette (Tailwind-family hues)`?**
  _Edge tagged AMBIGUOUS (relation: conceptually_related_to) - confidence is low._
- **Why does `ADR-0033` connect `BaseLayout.astro` to `site.ts`, `audit-konten.mjs`, `penyaji.mjs`, `arsip-taksonomi.ts`, `peran-situs.test.mjs`, `feed.ts`, `ArtikelLayout.astro`, `audit-konten.test.mjs`?**
  _High betweenness centrality (0.045) - this node is a cross-community bridge._
- **Why does `ADR-0039` connect `audit-dokumen.mjs` to `audit-graf.test.mjs`, `check-docs-translation.mjs`, `audit-serapan.mjs`, `audit-graf.mjs`, `cek-lockfile.mjs`, `peran-situs.test.mjs`?**
  _High betweenness centrality (0.038) - this node is a cross-community bridge._
- **Why does `bun` connect `bun` to `audit-serapan.test.mjs`, `purge-cdn.test.mjs`, `ukur-skala-build.mjs`, `rilis.mjs`?**
  _High betweenness centrality (0.036) - this node is a cross-community bridge._
- **What connects `SITE`, `origin`, `pelapor` to the rest of the system?**
  _599 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `site.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.04738985560903369 - nodes in this community are weakly interconnected._
- **Should `aksesibilitas.test.mjs` be split into smaller, more focused modules?**
  _Cohesion score 0.06531204644412192 - nodes in this community are weakly interconnected._