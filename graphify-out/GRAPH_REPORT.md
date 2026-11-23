# Graph Report - .  (2026-11-23)

## Corpus Check
- 51 files · ~402,332 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 1628 nodes · 2933 edges · 104 communities (88 shown, 16 thin omitted)
- Extraction: 98% EXTRACTED · 2% INFERRED · 0% AMBIGUOUS · INFERRED: 68 edges (avg confidence: 0.83)
- Token cost: 529,525 input · 0 output

## Community Hubs (Navigation)
- Gerbang audit graf
- Komponen halaman layanan dan breadcrumb
- Pengukur skala build
- Skrip rilis dan changeset
- Kontrak kerja agen dan alur CI
- Asal media dan purge CDN
- Panel aksesibilitas dan uji axe
- Beacon analitik dan buletin
- Pemeriksa lockfile dan dependensi
- ADR-0049 — A reader may subscribe, and it is the first WRITE from a stranger's browser
- Gerbang audit dokumen
- Identitas situs dan layout dasar
- Pembacaan konten dan taksonomi
- Klien API awcms dan navigasi
- Gerbang audit konten
- arsipUntuk
- Pencarian situs
- Server tiruan awcms untuk e2e
- Penyaji Bun dan pengalihan asal
- Standar performa dan header keamanan
- Arsip taksonomi
- scripts
- Layout artikel dan tampilan arsip
- SBOM, rilis, dan proteksi main
- Katalog PO dan peran situs
- Tes audit graf
- Feed Atom per seksi
- Ekspor Obsidian
- Audit rilis dan tag
- Gambar artikel dan seni lokal
- ADR-0040 — A changeset declares its own semver bump
- Feed per seksi
- Keputusan CSP dan gambar artikel
- Penamaan komunitas graf
- dependencies
- Gerbang audit aset
- Gerbang audit serapan
- ADR-0033 — News sections order by date; two dates separated
- Peta pengalihan URL
- Tes penamaan komunitas graf
- Jeda pengembangan dan ADR terbaru
- Manifes paket
- Tes aksesibilitas halaman
- Tes audit konten
- Checklist situs baru dan posisi keluarga
- Bun as runtime and package manager
- Keputusan CSP ketat dan header
- Tes ekspor Obsidian
- Design system dan porting UI portal
- Peta frontend dan aturan sumber kebenaran
- The green-build-empty-site defect class
- Governance
- Tes versi toolchain
- ADR index
- The unit of a backend need is a module in awcms, through module admission
- Inventaris kontrak UI dan percakapan
- Favicon Brand Mark (Traffic Light App Icon)
- Tes audit serapan
- Pembaruan graf pengetahuan
- Konfigurasi Astro
- devDependencies
- Tes runtime Bun
- Rantai pasok dan versi Bun terpatok
- Kontrak build dan token mesin awcms
- ADR-0034 — Public by default; USER admin only when declared
- Preferensi baca dan gerbang aksesibilitas
- Batas admin USER dan matriks rendering
- Peta kontrol keamanan dan celah
- Standar teknis dan rantai rebuild
- compilerOptions
- Pelapor skrip standar
- Artikel terkait
- Kesiapan portal dan roadmap
- Batas klien realtime Bun
- 04 — Readiness, the proof-of-concept, and the checklist
- Pemetaan artikel dan seksi berita
- Arsitektur lapisan pengalaman portal
- Deploy, webhook, dan diagnostik
- Knowledge tree README
- Accessibility and SEO index
- overrides
- Support
- A site DECLARES the beacon; the template ships it off by default
- A value with no readable PO-catalogue label renders no chip; facet parameters are an allow-list
- Sesi BFF, cookie, dan CSRF
- Rute robots
- Tes keluaran CSP
- The USER Admin Surface
- Static-by-default with `prerender = false` opting out one route at a time
- Determinisme deteksi komunitas
- Dependabot package-ecosystem bun
- Rule 4 Has No Checker Here
- awcms-astro-gerbang skill
- Kerentanan keamanan lewat GitHub Security Advisory, bukan issue publik
- Konten situs tinggal di instans awcms, bukan di repo template
- Definition of Done
- Core Web Vitals targets LCP INP CLS
- Content-Type feed
- *.id.md excluded from the knowledge graph so concepts are not entered twice
- 02 — The /_portal-api/** BFF contract
- Entri ignore typescript >=7

## God Nodes (most connected - your core abstractions)
1. `t()` - 33 edges
2. `scripts` - 29 edges
3. `getArticles()` - 26 edges
4. `arsipUntuk()` - 21 edges
5. `localePath()` - 21 edges
6. `AGENTS.md working contract` - 21 edges
7. `siteConfig` - 19 edges
8. `nomorHalamanTambahan()` - 15 edges
9. `isiFeed()` - 14 edges
10. `defaultLocale` - 14 edges

## Surprising Connections (you probably didn't know these)
- `Defect Classes That Do Not Fail a Build` --semantically_similar_to--> `Support`  [INFERRED] [semantically similar]
  .github/PULL_REQUEST_TEMPLATE.md → SUPPORT.md
- `Gate-count table drift incident` --semantically_similar_to--> `Practice overruled the written decision`  [INFERRED] [semantically similar]
  knowledge/curated/lessons-learned.md → docs/adr/0052-github-releases-are-part-of-this-repos-release-convention.md
- `output: static is a premise, not a default` --semantically_similar_to--> `Stack: Astro 7 static, Bun, no UI framework, PO i18n`  [INFERRED] [semantically similar]
  knowledge/curated/rendering-index.md → docs/awcms-astro/standar-teknis.md
- `susunArsip()` --indirect_call--> `item()`  [INFERRED]
  src/lib/arsip-taksonomi.ts → tests/menu-widget.test.mjs
- `jalankan()` --references--> `bun`  [EXTRACTED]
  tests/audit-serapan.test.mjs → package.json

## Import Cycles
- None detected.

## Hyperedges (group relationships)
- **CI gate suite over repo and build output** — _github_workflows_ci, concept_audit_gates_suite, concept_a11y_axe_gate, concept_build_conditioned_on_awcms_api_url [INFERRED 0.85]
- **Role boundary: public primary, USER admin declared, owner refused, backend as awcms module** — concept_permukaan_admin_user_admin, concept_owner_refused_gate, concept_backend_need_becomes_awcms_module, docs_adr_0020_layar_admin_kembali_ke_awcms [EXTRACTED 1.00]
- **Serving stack: Bun penyaji, CSP, HSTS/cache, Traefik** — concept_penyaji_headers_csp, concept_strict_csp_no_inline, concept_traefik_not_static_server, concept_astrojs_node_adapter_standalone, concept_html_shared_cache_cdn_purge [EXTRACTED 1.00]
- **awcms-first three-gate model across ADR and guides** — docs_adr_0057_awcms_first_orders_ownership_and_contract_not_code_and_three_gates_separate_design_mock_and_release, docs_awcms_astro_permukaan_admin_user, docs_awcms_astro_checklist_repo_baru [EXTRACTED 1.00]
- **Accessibility chain: reading panel, axe gate, stand-in fixture** — docs_adr_0055_reading_preferences_are_a_native_same_origin_panel_not_an_overlay_widget_reading_preferences_panel, docs_adr_0056_accessibility_is_gated_by_axe_in_a_real_browser_with_no_exceptions_axe_gate, docs_adr_0056_accessibility_is_gated_by_axe_in_a_real_browser_with_no_exceptions_standin_awcms_fixture [EXTRACTED 1.00]
- **Marketplace portal BFF blueprint** — docs_awcms_astro_portal_bff_01_arsitektur_experience, docs_awcms_astro_portal_bff_02_kontrak_bff, docs_adr_0014_rendering_campuran_dan_bff_portal [EXTRACTED 1.00]
- **Marketplace portal BFF planning document set** — docs_awcms_astro_portal_bff_readme, docs_awcms_astro_portal_bff_03_peta_rute_dan_ui, docs_awcms_astro_portal_bff_04_kesiapan [EXTRACTED 1.00]
- **Static-by-default rendering with two declared authenticated surfaces** — knowledge_curated_rendering_index_static_output_premise, knowledge_curated_rendering_index_two_on_demand_route_classes, user_admin_surface_permukaan_admin, docs_awcms_astro_portal_bff_readme_marketplace_portal_bff [EXTRACTED 1.00]
- **awcms-astro technical, security and design standards** — docs_awcms_astro_standar_teknis, docs_awcms_astro_standar_performa_dan_keamanan, docs_awcms_astro_ui_ux_design_system [INFERRED 0.85]
- **Server-decided security header policy** — claude_skills_awcms_astro_performa_keamanan_skill_penyaji, claude_skills_awcms_astro_performa_keamanan_skill_headers, claude_skills_awcms_astro_performa_keamanan_skill_hsts, claude_skills_awcms_astro_performa_keamanan_skill_csp [EXTRACTED 1.00]
- **Checks required before merging to main** — governance_main_protection [EXTRACTED 1.00]
- **Template-propagation rationale driving governance rules** — governance_defect_travels, governance_new_rule_needs_checker, governance_adr_triggers [INFERRED 0.85]
- **The response-header posture assembled in server/penyaji.mjs** — docs_adr_0019_csp_ketat_dikirim_penyaji_csp_ketat, docs_adr_0029_hsts_digerbangi_produksi_tanpa_includesubdomains_hsts_digerbangi_produksi, docs_adr_0025_gambar_artikel_dari_media_awcms_asal_media_diminta, docs_adr_0035_feed_atom_per_seksi_berita_dan_gerbang_atas_xml_tipe_isi_feed [EXTRACTED 1.00]
- **The green-build / empty-or-wrong-output defect class and its floor gates** — docs_adr_0018_kontrak_build_token_mesin_dan_traversal_konten_cacat_build_hijau_situs_kosong, docs_adr_0018_kontrak_build_token_mesin_dan_traversal_konten_gerbang_terjemahan, docs_adr_0025_gambar_artikel_dari_media_awcms_gerbang_nol_dari_n, docs_adr_0033_seksi_berita_urutan_dari_tanggal_dan_dua_tanggal_yang_terpisah_predikat_terbit_ditiru, docs_adr_0035_feed_atom_per_seksi_berita_dan_gerbang_atas_xml_gerbang_atas_xml [INFERRED 0.85]
- **The development-hold cycle: imposed, narrowed, ended** — docs_adr_0023_penahanan_dipersempit_pekerjaan_tanpa_awcms_uji_ditulis_ulang_jika_awcms_berubah, docs_adr_0027_penahanan_adr_0021_selesai_penahanan_selesai [EXTRACTED 1.00]
- **The reader-browser call class — anonymous calls from a stranger's browser** — docs_adr_0043_the_readers_browser_calls_awcms_and_nothing_else_changes_reader_browser_call_class, docs_adr_0043_the_readers_browser_calls_awcms_and_nothing_else_changes_tenant_from_origin, docs_adr_0044_what_a_page_view_may_cost_a_reader_beacon_without_credentials, docs_adr_0049_a_reader_may_subscribe_and_the_first_write_from_a_strangers_browser_first_write_from_stranger_browser, docs_adr_0044_what_a_page_view_may_cost_a_reader_beacon_must_carry_a_header [EXTRACTED 1.00]

## Communities (104 total, 16 thin omitted)

### Community 0 - "Gerbang audit graf"
Cohesion: 0.05
Nodes (60): ADR-0023, ADR-0039, ADR-0097, ARTEFAK_TERLACAK, auditArtefakTerlacak(), auditKesegaranTerbatas(), auditKnowledgeGeneratedUntracked(), auditLabelKomunitas() (+52 more)

### Community 1 - "Komponen halaman layanan dan breadcrumb"
Cohesion: 0.05
Nodes (35): ADR-0017, muatan, breadcrumbSchema, fullItems, locale, locale, locale, locale (+27 more)

### Community 2 - "Pengukur skala build"
Cohesion: 0.07
Nodes (53): ADR-0046, ADR-0110, badanSintetis(), hasil, kolom, lebar, postSintetis(), ukur() (+45 more)

### Community 3 - "Skrip rilis dan changeset"
Cohesion: 0.06
Nodes (49): ADR-0119, engines, bun, CHANGESET_IMPACTS, CHANGESET_TYPES, changesetBody(), isChangesetFile(), parseChangeset() (+41 more)

### Community 4 - "Kontrak kerja agen dan alur CI"
Cohesion: 0.06
Nodes (56): pelaksana-kompleks agent definition, pelaksana-sederhana agent definition, awcms-astro-gerbang skill (nine gates), awcms-astro-integrasi skill (integration contract), Bug report issue form, Epic issue form, Research issue form, Feature/task issue form (+48 more)

### Community 5 - "Asal media dan purge CDN"
Cohesion: 0.07
Nodes (41): ADR-0022, ADR-0049, ADR-0054, ADR-0090, ADR-0093, ADR-0102, API_BASE_BAWAAN, bacaKonfigurasi() (+33 more)

### Community 6 - "Panel aksesibilitas dan uji axe"
Cohesion: 0.07
Nodes (37): ADR-0055, announce(), commit(), render(), applyAttributes(), attributesFor(), AttributeTarget, CHANGE_EVENT (+29 more)

### Community 7 - "Beacon analitik dan buletin"
Cohesion: 0.07
Nodes (32): ADR-0057, ADR-0092, ADR-0118, newsletterAktif, ADR-0103, alamatBeacon(), JALUR_BEACON, muatanBeacon (+24 more)

### Community 8 - "Pemeriksa lockfile dan dependensi"
Cohesion: 0.06
Nodes (28): ADR-0015, ADR-0028, ADR-0031, bacaJsonc(), BLOK_DEPENDENCY, lock, masalah, pkg (+20 more)

### Community 9 - "ADR-0049 — A reader may subscribe, and it is the first WRITE from a stranger's browser"
Cohesion: 0.05
Nodes (40): ADR-0036 — /news/ is this repo's vocabulary, and a tab that carries it, kosakata-news gate: a tab slugged `news` must declare urutanSeksi "terbaru", `news` is a tab slug a site chooses, not a reserved word, No category/tag taxonomy in this repo — archives deliberately do not follow, URL vocabulary split: /news/ here, /blog/ in awcms, ADR-0041 — The default locale stays at the ROOT, and two `Vary` names are refused, A tab, admin prefix or route claiming `/blog` is refused — ADR-0036's ungated half, The default locale keeps the root because a static build has no negotiation (+32 more)

### Community 10 - "Gerbang audit dokumen"
Cohesion: 0.09
Nodes (34): ADR-0051, ADR-0053, ADR-0062, antaraPenanda(), auditIndeksAdr(), auditJalurDisebut(), auditKutipanAdr(), auditPermukaanKilau() (+26 more)

### Community 11 - "Identitas situs dan layout dasar"
Cohesion: 0.12
Nodes (29): ADR-0026, ADR-0030, getSiteUrl(), Locale, urutanSeksiTab(), profilSitus, judulHalamanArtikel(), adaKontak() (+21 more)

### Community 12 - "Pembacaan konten dan taksonomi"
Cohesion: 0.10
Nodes (32): ADR-0024, ADR-0114, artikelSemuaSeksi(), resetTaksonomiCacheForTests(), assertFeedReturnedFullRows(), assertTranslationsArePairable(), AwcmsAstroBlock, AwcmsBlogPost (+24 more)

### Community 13 - "Klien API awcms dan navigasi"
Cohesion: 0.10
Nodes (30): ADR-0105, ambilMenu(), ambilWidget(), bacaItem(), bacaMenu(), bacaWidget(), daftarMenu(), daftarWidget() (+22 more)

### Community 14 - "Gerbang audit konten"
Cohesion: 0.12
Nodes (29): artikelDiJsonLd(), auditAnggaranGambar(), auditFeed(), auditGambar(), auditKeluaran(), auditPrioritasGambar(), auditSvg(), bacaXml() (+21 more)

### Community 15 - "arsipUntuk"
Cohesion: 0.15
Nodes (21): artikelPerHalaman, defaultLocale, prefixedLocales, SEGMEN_HALAMAN, arsipMenurutSlug(), arsipUntuk(), Halaman, jalurHalaman() (+13 more)

### Community 16 - "Pencarian situs"
Cohesion: 0.09
Nodes (27): ADR-0107, origin, alamatKueri(), alamatSaran(), asalPencarian(), bacaEntitas(), bacaFilter(), ButirHasil (+19 more)

### Community 17 - "Server tiruan awcms untuk e2e"
Cohesion: 0.08
Nodes (24): ADR-0019, HALAMAN, MATI, ADR-0056, MODE, SEMUA, TAG_WCAG, amplop() (+16 more)

### Community 18 - "Penyaji Bun dan pengalihan asal"
Cohesion: 0.13
Nodes (27): ADR-0043, ASAL_MEDIA, ASAL_PENCARIAN, asalMediaTerkonfigurasi(), asalPencarianTerkonfigurasi(), asalTerkonfigurasi(), aturanCache(), CACHE_ASET (+19 more)

### Community 19 - "Standar performa dan header keamanan"
Cohesion: 0.08
Nodes (29): awcms-astro-performa-keamanan skill, Image and script/stylesheet byte budgets, COOP and SRI refusals are premises that fail once permukaanAdmin is declared, Content-Security-Policy strict (ADR-0019), Core Web Vitals targets LCP/INP/CLS at p75, Security headers decided only in server/penyaji.mjs, Honesty condition on CodeQL (.astro) and lab CWV claims, Strict-Transport-Security production-only, no includeSubDomains (+21 more)

### Community 20 - "Arsip taksonomi"
Cohesion: 0.11
Nodes (24): ADR-0104, SEGMEN_KATEGORI, SEGMEN_TAG, tabBentrokSegmen(), ArsipTerm, cacheArsip, jalurArsip(), SEGMEN_JENIS (+16 more)

### Community 21 - "scripts"
Cohesion: 0.07
Nodes (29): scripts, audit:aset, audit:dokumen, audit:graf, audit:konten, audit:rilis, audit:serapan, audit:translation (+21 more)

### Community 22 - "Layout artikel dan tampilan arsip"
Cohesion: 0.14
Nodes (14): namaKanal(), t(), tanggalMesin(), tanggalMesin(), getLocaleFromPath(), localeHtmlLang, siteConfig, tabTitleKey() (+6 more)

### Community 23 - "SBOM, rilis, dan proteksi main"
Cohesion: 0.08
Nodes (25): ADR-0031 CycloneDX SBOM from bun.lock, CycloneDX 1.5 SBOM format, scripts/sbom.mjs generator, tests/sbom.test.mjs checker, ADR-0052 GitHub Releases are release convention, audit:rilis check every remote tag has a Release, Practice overruled the written decision, scripts/rilis.mjs prints gh release create (+17 more)

### Community 24 - "Katalog PO dan peran situs"
Cohesion: 0.09
Nodes (14): ADR-0020, ADR-0034, ADR-0036, PERAN_DILARANG, permukaanAdmin, situsPublikSaja(), tabs, Catalog (+6 more)

### Community 25 - "Tes audit graf"
Cohesion: 0.13
Nodes (16): ADR-0124, graf(), laporan(), node(), pohon(), pohonBersih(), repo(), repoWithStaleFiles() (+8 more)

### Community 26 - "Feed Atom per seksi"
Cohesion: 0.16
Nodes (15): ADR-0033, ADR-0109, bangunFeedAtom(), BerkasFeed, ButirFeed, LEPAS, lepasXml(), NAMA_BERKAS_FEED (+7 more)

### Community 27 - "Ekspor Obsidian"
Cohesion: 0.15
Nodes (15): ALLOWED_TO_CLEAR, CURATED, entries, GENERATED, rejections, STAGING, syncable, ALLOWED_EXTENSIONS (+7 more)

### Community 28 - "Audit rilis dan tag"
Cohesion: 0.14
Nodes (12): dated, ADR-0030, ADR-0040, oldest, pending, rawRefsRemote, REPO_SLUG, reporter (+4 more)

### Community 29 - "Gambar artikel dan seni lokal"
Cohesion: 0.22
Nodes (11): ADR-0021, ArticleVisual, getArticleImage(), getTabImage(), heroImage, MODUL, SENI, cariSeni() (+3 more)

### Community 30 - "ADR-0040 — A changeset declares its own semver bump"
Cohesion: 0.15
Nodes (15): ADR-0039 — English is the source language; Indonesian is the mirror, audit:translation gate — coverage and currency checked separately, DOCS_AWAITING_MIRROR — a shrink-only migration ledger of 52 documents, English at the bare path is authoritative; `<name>.id.md` is the mirror, i18n-source-hash staleness marker living in the mirror, ADR-0040 — A changeset declares its own semver bump, A changeset declares `bump: major|minor|patch`; the release takes the largest waiting, A command-line level may override upward only, never smaller (+7 more)

### Community 31 - "Feed per seksi"
Cohesion: 0.27
Nodes (12): jalurArtikel(), artikelPerFeed, localePath(), TabSlug, daftarFeed(), isiFeed(), jalurFeed(), seksiPunyaFeed() (+4 more)

### Community 32 - "Keputusan CSP dan gambar artikel"
Cohesion: 0.21
Nodes (14): ADR-0019 — A strict CSP sent by the server, ADR-0023 — The hold is narrowed to work that needs awcms, ADR-0024 — Local artwork in src/assets, The image/placeholder branch lives in one component, Artwork resolved by import.meta.glob with query ?url, No fallback from an article to its section's artwork, ADR-0025 — Article images from awcms media, Media resolved once per build into LocalizedArticle (+6 more)

### Community 33 - "Penamaan komunitas graf"
Cohesion: 0.14
Nodes (11): byName, GRAPH, graphText, LABELS, members, problems, REPORT, rewrittenGraph (+3 more)

### Community 34 - "dependencies"
Cohesion: 0.15
Nodes (13): astro, @astrojs/check, @astrojs/node, @astrojs/sitemap, compression, dependencies, astro, @astrojs/check (+5 more)

### Community 35 - "Gerbang audit aset"
Cohesion: 0.31
Nodes (12): ADR-0070, ADR-0101, asetHalaman(), AUDIENS_PUBLIC, auditKeluaran(), auditSumber(), berkasDi(), ekstensi() (+4 more)

### Community 36 - "Gerbang audit serapan"
Cohesion: 0.18
Nodes (10): ADR-0116, baris(), BATAS_MS, blok, isi, ADR-0030, ADR-0100, nomorDari() (+2 more)

### Community 37 - "ADR-0033 — News sections order by date; two dates separated"
Cohesion: 0.23
Nodes (13): The standards anchor with pinned editions, Nine gaps, each recorded with its checker, ADR-0030 — Written rules finally get a checker, A rule without its checker is a rule that will be broken, ADR-0032 — The last two gaps closed with honesty conditions, ADR-0033 — News sections order by date; two dates separated, publishedDate and updatedDate read from ONE row, A tab declares itself a news section (urutanSeksi) (+5 more)

### Community 38 - "Peta pengalihan URL"
Cohesion: 0.26
Nodes (10): buatServer(), jalankan(), jawabPengalihan(), kunciPengalihan(), ADR-0047, PENGALIHAN, targetPengalihan(), periksaPeta() (+2 more)

### Community 39 - "Tes penamaan komunitas graf"
Cohesion: 0.23
Nodes (11): assertRefusedWithoutWriting(), cleanFixture(), cleanup, graphOf(), node(), REPO_ROOT, reportOf(), run() (+3 more)

### Community 40 - "Jeda pengembangan dan ADR terbaru"
Cohesion: 0.26
Nodes (12): ADR-0021 Development hold until awcms foundation, Development hold (security patches + dependency bumps only), Resumption points (article images, locale filter, share card, portal BFF), ADR-0054 HTML shared-cache lifetime and CDN purge, purge-cdn.mjs post-deploy CDN purge by hostname, HTML Cache-Control with s-maxage=300, ADR-0055 Reading preferences native panel, ADR-0056 axe accessibility gate (+4 more)

### Community 41 - "Manifes paket"
Cohesion: 0.17
Nodes (11): description, homepage, license, name, packageManager, private, repository, type (+3 more)

### Community 42 - "Tes aksesibilitas halaman"
Cohesion: 0.18
Nodes (8): buletin, contrast(), css, home, lang, layout, luminance(), themes

### Community 43 - "Tes audit konten"
Cohesion: 0.20
Nodes (6): halaman(), pohon(), sementara, situs(), SKRIP, SUMBER

### Community 44 - "Checklist situs baru dan posisi keluarga"
Cohesion: 0.25
Nodes (11): ADR-0057 awcms-first orders ownership and contract, Checklist: starting a new site on awcms-astro, Audit gates that must stay green (check, test, audit:konten, audit:dokumen, audit:translation, audit:graf), Contract first, content next, presentation last, awcms-astro to awcms integration contract, USER admin surface: shape, prerequisites, boundary, awcms-astro standard README, Deliberate divergence from family (no database, no API served) (+3 more)

### Community 45 - "Bun as runtime and package manager"
Cohesion: 0.20
Nodes (10): ADR-0015 — The Bun runtime closes the family divergence, Lockfile identity check before install, Bun as runtime and package manager, No script may share a name with the binary it invokes, ADR-0017 — This repo carries the OWNER/INTERNAL admin pages, Four rules binding any authenticated surface, Permissions do not move with the screen, The checker runs the built artefact, not the source (+2 more)

### Community 46 - "Keputusan CSP ketat dan header"
Cohesion: 0.22
Nodes (10): vite assetsInlineLimit set to 0, Strict Content-Security-Policy sent by penyaji.mjs, JSON-LD stays inline as a data block, Permissions-Policy as the fifth security header, Theme switcher moved to public/tema.js, ADR-0029 — HSTS gated to production without includeSubDomains, HSTS sent only when NODE_ENV is production, No includeSubDomains and no preload for a template (+2 more)

### Community 47 - "Tes ekspor Obsidian"
Cohesion: 0.27
Nodes (7): buildFixture(), cleanup, EXPORT_SCRIPT, fakeGraph(), fakeGraphifyBin(), REPO_ROOT, write()

### Community 48 - "Design system dan porting UI portal"
Cohesion: 0.25
Nodes (9): Mapping onto AWCMS design system vocabulary (token swap at integration), Portal BFF: route map, UI porting, components, Elementor porting disposition (PORT/REDESIGN/DYNAMIC/REMOVE/DEFER), Portal component groups (forms, data, status, sensitive), Seller and affiliate portal routes, awcms-astro Design System, Design tokens (colours, dark theme, hover shine), Readable without JavaScript, mobile-first from 360px (+1 more)

### Community 49 - "Peta frontend dan aturan sumber kebenaran"
Cohesion: 0.28
Nodes (9): awcms backend (system of record), Rule: a check only in this repo does not exist, Marketplace portal BFF (planned), Frontend map, Public by default; admin only when permukaanAdmin declares it (ADR-0034), Knowledge tree README (graphify workflow), Cross-repo source-of-truth rules for awcms contracts, graphify toolchain and knowledge:* scripts (code-only, local) (+1 more)

### Community 50 - "The green-build-empty-site defect class"
Cohesion: 0.22
Nodes (9): The green-build-empty-site defect class, Translations that cannot be paired fail the build, Keyset cursor traversal over created_at, The build feed (view=full), Tenant is not verified over the network, img-src origin is ASKED FOR, not copied, One id missing is not every id missing (zero-of-N gate), Exactly three awcms surfaces, extracted from the code (+1 more)

### Community 51 - "Governance"
Cohesion: 0.22
Nodes (9): Governance, When a change needs an ADR, Decision flow (ADR, branch, gates, review, release), A defect here travels to every derived site, main-protection ruleset with no bypass actor (ADR-0053), A new rule must bring its own checker, Changes that may not be made alone, Releases via bun run release (rilis.mjs) (+1 more)

### Community 52 - "Tes versi toolchain"
Cohesion: 0.25
Nodes (6): ADR-0037, ci, dockerfile, ADR-0030, pkg, VERSI

### Community 53 - "ADR index"
Cohesion: 0.25
Nodes (8): ADR-0037 TypeScript 6.x pin keeps astro check alive, astro check Type check gate, awcms divergence astro-files-not-type-checked, TypeScript ^6 pin, tests/versi-toolchain.test.mjs, @astrojs/node and compression deliberate keeps, node:* built-ins are Bun's own, kept, tests/runtime-bun.test.mjs gate

### Community 54 - "The unit of a backend need is a module in awcms, through module admission"
Cohesion: 0.25
Nodes (8): ADR-0038 — A backend need becomes a MODULE in awcms, What counts as backend: stores, decides permissions, runs business rules, cross-tenant, or serves others, The unit of a backend need is a module in awcms, through module admission, A BFF may call, assemble and hide credentials; it may not store, decide, or become the last reference, This repo READS awcms and does not write, tanpa-backend gate: no backend-class dependency, no non-GET fetch, no persistence artefacts, A one-file exemption to the non-GET gate, bought with two new assertions, The reader-browser class grows from three to four, and the fourth WRITES

### Community 55 - "Inventaris kontrak UI dan percakapan"
Cohesion: 0.29
Nodes (8): CarikBot conversation UI reference, CarikBot-inspired channel-neutral conversation contract (candidate), UI, data and consumer-contract inventory, Gap G-01: contract test uses hand-written fetch fakes, not OpenAPI, Three reader-browser runtime calls (search, beacon, newsletter), Thirteen awcms operations consumed, all present in OpenAPI, Two legitimate on-demand route classes (peran-situs test), USER admin surface (permukaanAdmin, planned)

### Community 56 - "Favicon Brand Mark (Traffic Light App Icon)"
Cohesion: 0.39
Nodes (8): Rounded Square Icon Backdrop (64x64, rx=14), Sky-to-Emerald Brand Palette (Tailwind-family hues), Diagonal Blue-to-Green Linear Gradient (id=f), Favicon Brand Mark (Traffic Light App Icon), Three Stacked Signal Lamps (red, amber, green), Red/Amber/Green Status Color Semantics, Traffic Light Housing Glyph (dark pill, 85% opacity), Traffic Signal Motif (lampu lalu lintas)

### Community 57 - "Tes audit serapan"
Cohesion: 0.25
Nodes (5): ADR-0117, jalankan(), LIB, sementara, SKRIP

### Community 58 - "Pembaruan graf pengetahuan"
Cohesion: 0.29
Nodes (5): after, before, fail(), GRAPH_PATH, run()

### Community 59 - "Konfigurasi Astro"
Cohesion: 0.43
Nodes (6): LOCALE_PREFIXES, neutralPath(), serialize(), SITE, ADR-0014, ADR-0035

### Community 60 - "devDependencies"
Cohesion: 0.29
Nodes (7): @axe-core/playwright, devDependencies, @axe-core/playwright, @playwright/test, @types/bun, @playwright/test, @types/bun

### Community 61 - "Tes runtime Bun"
Cohesion: 0.29
Nodes (5): ADR-0050, dockerfile, ADR-0030, pkg, RUNTIME_BINARIES

### Community 62 - "Rantai pasok dan versi Bun terpatok"
Cohesion: 0.33
Nodes (7): Bun version pinned in places that must move together, The extension list living in three places, Five recommended controls refused in writing, Supply chain pinned to commit SHAs and image digests, The five Bun version values compared by one gate, CodeQL with its coverage counted rather than claimed, RUM permanently refused — the ban on collecting reader data

### Community 63 - "Kontrak build dan token mesin awcms"
Cohesion: 0.38
Nodes (7): Two missing awcms contracts blocking the first internal screen, ADR-0018 — The build contract against awcms, awcms machine credentials with narrowest scope, Tenant decided by the machine token, config as assertion, ADR-0022 — This site publishes the awcms DEFAULT (owner) tenant, The default (platform/owner) tenant is the one published, One awcms, many sites — a one-directional topology

### Community 64 - "ADR-0034 — Public by default; USER admin only when declared"
Cohesion: 0.29
Nodes (7): 'The endpoint already exists' is not an answer of no, The 'would this be rewritten if awcms changed?' test, The hold ended by the indicators it wrote for itself, ADR-0034 — Public by default; USER admin only when declared, The owner role is mechanically refused, permukaanAdmin — admin only through one declared door, No feature exists ONLY here — a surface is a projection

### Community 65 - "Preferensi baca dan gerbang aksesibilitas"
Cohesion: 0.29
Nodes (7): awcms-a11y localStorage key and data-a11y-* attribute contract, Reading preferences panel (native, same-origin), Third-party accessibility overlay widget (refused), axe-core in Chromium via Playwright gate (test:a11y), Stand-in awcms fixture (e2e/awcms-tiruan.mjs), awcms-first ordering: ownership, contract, owner manageability, Three gates: design readiness, mock build, integration and release

### Community 66 - "Batas admin USER dan matriks rendering"
Cohesion: 0.29
Nodes (7): awcms /admin/* screens relevant to USER admin vs SYSTEM admin, Boundary is WHAT IS MANAGED, not who uses it, Frozen consumer contract: exactly three surfaces gate (kontrak-awcms test), Never built here: audit trail, roles, data subject, partner screens, permukaanAdmin declaration (prefiks + peran, owner refused), Rendering matrix (prerendered vs on-demand routes, cache, session), Rollback path (static build, honest unavailable page)

### Community 67 - "Peta kontrol keamanan dan celah"
Cohesion: 0.29
Nodes (7): awcms-astro Performance and Security Standard, Security/performance gaps ledger, OWASP/ASVS/ISO 27001/NIST SSDF control mapping, Accessibility and SEO index, 360px width floor static gate, Core Web Vitals lab-only measurement, Never advertise an unpublished asset (og:image)

### Community 68 - "Standar teknis dan rantai rebuild"
Cohesion: 0.29
Nodes (7): awcms-astro Technical Standard, Content pulled from awcms at build time (ADR-0018), Knowledge graph (graphify-out) policy, Stack: Astro 7 static, Bun, no UI framework, PO i18n, Publish-to-rebuild chain (awcms queue, Coolify webhook, astro build), Rendering index, output: static is a premise, not a default

### Community 69 - "compilerOptions"
Cohesion: 0.29
Nodes (6): astro/tsconfigs/strict, compilerOptions, jsx, jsxImportSource, moduleResolution, extends

### Community 70 - "Pelapor skrip standar"
Cohesion: 0.33
Nodes (4): createReporter(), formatReport(), ADR-0030, scripts

### Community 71 - "Artikel terkait"
Cohesion: 0.38
Nodes (4): UrutanSeksi, artikelLainnya(), MAKS_LAINNYA, PunyaSlug

### Community 72 - "Kesiapan portal dan roadmap"
Cohesion: 0.33
Nodes (6): ADR-0023 test: would this change be rewritten if awcms changed?, Portal BFF: readiness, PoC, checklist, P0 prerequisites before a production portal screen, Portal BFF proof-of-concept scope (8 proofs), Marketplace portal experience layer blueprint (README), awcms-astro Roadmap

### Community 73 - "Batas klien realtime Bun"
Cohesion: 0.33
Nodes (6): Upstream AWCMS realtime design #1168, Bun-only realtime consumer boundary, Future Bun SSE/WebSocket consumer contract, Public lead, consent and realtime consumer UX contract, Public lead, consent and USER-admin surface ownership matrix, Roadmap phases F1-F4 and F0

### Community 74 - "04 — Readiness, the proof-of-concept, and the checklist"
Cohesion: 0.33
Nodes (6): The snippet never becomes HTML, and no markup is assembled in JavaScript, ADR-0046 — A video embed is refused here, and that is a divergence rather than an omission, A template's operator is not a deployment's operator — a flag would arrive pre-wired, video_news renders as a link; frame-src stays absent from the CSP, The template's own redirect map is EMPTY — a template has no URL history, A template's version number is the only thing its derived sites have

### Community 75 - "Pemetaan artikel dan seksi berita"
Cohesion: 0.33
Nodes (6): News section declaration (urutanSeksi terbaru, Atom feed), Read-only build token and tenant refusals (TENANT_SUSPENDED, ENTITLEMENT_REQUIRED), Data model mapping to awcms_blog_posts, Content guarantees at risk of being lost in migration, LocalizedArticle adapter contract (content.ts), Section resolved from CMS taxonomy (termSlugs, sidecar override)

### Community 76 - "Arsitektur lapisan pengalaman portal"
Cohesion: 0.33
Nodes (6): Portal experience layer architecture, Build-time vs request-time variables, /_portal-api BFF contract, BFF hard boundary (shapes, never decides business rules), No generic passthrough proxy (confused deputy), File uploads via presigned URL, not through BFF

### Community 77 - "Deploy, webhook, dan diagnostik"
Cohesion: 0.40
Nodes (5): CSP and response headers decided only in server/penyaji.mjs (ADR-0016/0019), Deploying and rebuilding by webhook (Coolify), CDN purge and HTML cache after deploy (ADR-0054), FastPlaz concepts: diagnostics architecture, Six diagnostic validation scenarios

### Community 78 - "Knowledge tree README"
Cohesion: 0.40
Nodes (5): ADR-0051 Knowledge tree points at the code, audit:graf gate with MAX_STALE_FILES=40, awcms-one Graphify workflow prior art, knowledge/** English-only, no .id.md mirror, knowledge/generated/ gitignored

### Community 79 - "Accessibility and SEO index"
Cohesion: 0.40
Nodes (5): Security index, COOP/CORP premise collapses on first admin surface, CSP decided only in server/penyaji.mjs, HSTS production-only, reverse-tested, No raw-HTML path from the CMS (content-blocks.ts)

### Community 80 - "overrides"
Cohesion: 0.40
Nodes (5): overrides, @emnapi/core, @emnapi/runtime, fast-uri, nanoid

### Community 81 - "Support"
Cohesion: 0.50
Nodes (4): Defect Classes That Do Not Fail a Build, This Repo's Attack Surface, Security Policy, Support

### Community 82 - "A site DECLARES the beacon; the template ships it off by default"
Cohesion: 0.50
Nodes (4): The box is hidden until its script runs, and `[hidden]` is made to win over author display rules, A site DECLARES the beacon; the template ships it off by default, The privacy page grows a section when, and only when, the form does, SITE_NEWSLETTER: three surfaces appear together or not at all, and only where AWCMS_API_URL is set

### Community 83 - "A value with no readable PO-catalogue label renders no chip; facet parameters are an allow-list"
Cohesion: 0.67
Nodes (3): A value with no readable PO-catalogue label renders no chip; facet parameters are an allow-list, Exact paths, never patterns; locale prefixes written out explicitly, pengalihan gate: no chain, no loop, no non-canonical key or target

### Community 84 - "Sesi BFF, cookie, dan CSRF"
Cohesion: 0.67
Nodes (3): awcms identity model facts to imitate (groups, MFA, tenant selection, lockout), Cookie and CSRF rules, BFF session flow (login, introspection, mutation, logout)

## Ambiguous Edges - Review These
- `Three Stacked Signal Lamps (red, amber, green)` → `Sky-to-Emerald Brand Palette (Tailwind-family hues)`  [AMBIGUOUS]
  public/favicon.svg · relation: conceptually_related_to

## Knowledge Gaps
- **443 isolated node(s):** `SITE`, `origin`, `pelapor`, `localeDefault`, `locales` (+438 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **16 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **What is the exact relationship between `Three Stacked Signal Lamps (red, amber, green)` and `Sky-to-Emerald Brand Palette (Tailwind-family hues)`?**
  _Edge tagged AMBIGUOUS (relation: conceptually_related_to) - confidence is low._
- **Why does `ADR-0033` connect `Feed Atom per seksi` to `Komponen halaman layanan dan breadcrumb`, `Beacon analitik dan buletin`, `Identitas situs dan layout dasar`, `Pembacaan konten dan taksonomi`, `Tes audit konten`, `Gerbang audit konten`, `Penyaji Bun dan pengalihan asal`, `Arsip taksonomi`, `Layout artikel dan tampilan arsip`, `Katalog PO dan peran situs`?**
  _High betweenness centrality (0.078) - this node is a cross-community bridge._
- **Why does `bun` connect `Skrip rilis dan changeset` to `Gerbang audit graf`, `Tes audit serapan`, `Pengukur skala build`?**
  _High betweenness centrality (0.063) - this node is a cross-community bridge._
- **Why does `engines` connect `Skrip rilis dan changeset` to `Manifes paket`?**
  _High betweenness centrality (0.053) - this node is a cross-community bridge._
- **What connects `SITE`, `origin`, `pelapor` to the rest of the system?**
  _443 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `Gerbang audit graf` be split into smaller, more focused modules?**
  _Cohesion score 0.05194805194805195 - nodes in this community are weakly interconnected._
- **Should `Komponen halaman layanan dan breadcrumb` be split into smaller, more focused modules?**
  _Cohesion score 0.04596273291925466 - nodes in this community are weakly interconnected._