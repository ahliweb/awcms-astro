# Graph Report - awcms-astro  (2026-08-05)

## Corpus Check
- 110 files · ~103,988 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 794 nodes · 1346 edges · 61 communities (53 shown, 8 thin omitted)
- Extraction: 94% EXTRACTED · 6% INFERRED · 0% AMBIGUOUS · INFERRED: 82 edges (avg confidence: 0.86)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `a0be6f2a`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- Dependency dan skrip proyek
- Pengambilan dan render blok konten
- Klien awcms, tenant, dan media
- Gerbang audit konten
- Postur performa dan keamanan
- Experience layer dan BFF Jualanku
- Standar teknis dan kontrak konten
- Gerbang audit dokumen
- Penyaji Bun dan headernya
- Layout dasar dan metadata terstruktur
- Tabel gerbang mutu dan aturan aset
- Rantai deploy dan pemeriksa yang dipin
- Gerbang audit graf
- Fixture pohon berkas untuk tes gerbang
- Katalog PO dan komponen berlokal
- Halaman tab dan beranda
- Rute berprefiks locale dan pengalihnya
- Gambar artikel dan seni lokal
- Blueprint rute dan UI Jualanku
- Kontrak kerja dan katalog skill
- Keputusan runtime, cache, dan layar admin
- Lima gerbang dan Definition of Done
- Aturan sumber data ke awcms
- Rantai keputusan kontrak build dan penahanan
- Standar luar bernama dan alur kontribusi
- Jebakan situs turunan dan asal tenant
- Sembilan celah dan anggaran performa
- Design system dan token tema
- Konvensi seni lokal dan resolusi URL
- CSP dan kepemilikan header di satu berkas
- Penahanan pengembangan dan ujinya
- Skrip rilis
- Parser dan gerbang katalog PO
- Layout halaman artikel
- Empat aturan tanpa pemeriksa dan pin versi
- Gerbang lockfile
- Peta situs dan remah navigasi
- Kebijakan keamanan dan permukaan serangan
- Lambang favicon lampu lalu lintas
- Job CI terkondisi dan pemicu rebuild
- Konfigurasi Astro dan sitemap
- Konfigurasi TypeScript
- Kredensial mesin dan asersi tenant
- Traversal feed dan gerbang resolusi media
- Batas gerbang terhadap prosa
- Alur changeset dan rilis
- Gerbang versi toolchain
- Pedoman perilaku kontributor
- Endpoint robots.txt
- Gerbang CSP atas keluaran build
- Dependabot ekosistem bun
- Penegakan dan kerahasiaan pelapor
- Pengecualian TypeScript 7 di Dependabot
- Jaring pengaman rebuild harian
- Gambar sosial bawaan
- CI dan image berhenti mengirim variabel tenant yang sudah ditolak
- Layar admin kembali ke `awcms`: ADR-0017 di-supersede ADR-0020
- Rilis membawa SBOM CycloneDX dari lockfile (ADR-0031)
- ADR-0019 — CSP ketat dikirim penyaji, dan skrip tidak lagi tinggal di dalam HTML

## God Nodes (most connected - your core abstractions)
1. `awcms-astro — Standar Performa dan Keamanan` - 21 edges
2. `t()` - 19 edges
3. `Gerbang mutu — tabel gerbang yang wajib hijau` - 18 edges
4. `awcms-astro — Standar Teknis` - 17 edges
5. `scripts` - 16 edges
6. `ADR-0028 — Postur performa dan keamanan diikat ke standar yang disebut namanya` - 14 edges
7. `siteConfig` - 13 edges
8. `getArticles()` - 13 edges
9. `awcms-astro — standar keluarga AWCMS untuk situs statis Astro` - 13 edges
10. `ADR-0014 — Rendering campuran dan BFF portal Jualanku` - 11 edges

## Surprising Connections (you probably didn't know these)
- `Experience layer Jualanku.info` --references--> `awcmsGet()`  [INFERRED]
  docs/adr/0014-rendering-campuran-dan-bff-portal.md → src/lib/awcms/client.ts
- `Prioritas: Cacat yang Tidak Menggagalkan Build` --semantically_similar_to--> `ADR-0018 — Kontrak Build terhadap awcms: Tenant dari Token Mesin, Traversal Cursor, Gerbang Terjemahan`  [INFERRED] [semantically similar]
  SUPPORT.md → docs/adr/0018-kontrak-build-token-mesin-dan-traversal-konten.md
- `Asal media ditanyakan, tidak disalin, untuk img-src` --semantically_similar_to--> `Aturan konfigurasi — site.ts dan .env satu-satunya tempat`  [INFERRED] [semantically similar]
  .claude/skills/awcms-astro-integrasi/SKILL.md → AGENTS.md
- `Build dikondisikan pada vars.AWCMS_API_URL, bukan backend tiruan` --semantically_similar_to--> `Core Web Vitals p75 — LCP, INP, CLS (belum diukur)`  [INFERRED] [semantically similar]
  .github/workflows/ci.yml → .claude/skills/awcms-astro-performa-keamanan/SKILL.md
- `Repo ini template, bukan sebuah situs — cacat ikut ke setiap turunannya` --semantically_similar_to--> `Prinsip: cacat di sini tidak muncul sekali`  [INFERRED] [semantically similar]
  CONTRIBUTING.md → GOVERNANCE.md

## Import Cycles
- None detected.

## Hyperedges (group relationships)
- **Lima gerbang menegakkan Definition of Done lintas AGENTS, PR template, CONTRIBUTING, dan CI** — _claude_skills_awcms_astro_gerbang_skill_lima_gerbang, agents_definition_of_done, _github_pull_request_template_definition_of_done, contributing_definition_of_done, _github_workflows_ci_job_check [INFERRED 0.85]
- **Satu alur build: tenant dari token → traversal view=full + cursor → resolusi media → asal media untuk img-src** — _claude_skills_awcms_astro_integrasi_skill_tenant_dari_token, _claude_skills_awcms_astro_integrasi_skill_traversal_build_feed, _claude_skills_awcms_astro_integrasi_skill_resolusi_media_dan_kartu_share, _claude_skills_awcms_astro_integrasi_skill_asal_media_untuk_img_src, readme_konten_ditarik_saat_build [EXTRACTED 1.00]
- **Pola lintas-dokumen: aturan yang tampak terjaga padahal tidak — sebelas dokumen, empat aturan tanpa pemeriksa, prinsip tata kelola, dan celah yang tetap tercatat** — _claude_skills_awcms_astro_gerbang_skill_sebelas_dokumen_yang_berbohong, _claude_skills_awcms_astro_gerbang_skill_empat_aturan_tanpa_pemeriksa, _claude_skills_awcms_astro_gerbang_skill_aturan_baru_wajib_membawa_pemeriksanya, governance_prinsip_cacat_tidak_muncul_sekali, _claude_skills_awcms_astro_performa_keamanan_skill_sembilan_celah, _claude_skills_readme_skill_digerbangi_terhadap_kodenya [INFERRED 0.85]
- **Siklus Penahanan Pengembangan: Ditahan, Dipersempit, Selesai** — docs_adr_0020_layar_admin_kembali_ke_awcms_adr_0020, docs_adr_0021_tahan_pengembangan_menunggu_fondasi_awcms_adr_0021, docs_adr_0023_penahanan_dipersempit_pekerjaan_tanpa_awcms_adr_0023, docs_adr_0027_penahanan_adr_0021_selesai_adr_0027 [EXTRACTED 1.00]
- **Rantai Gambar Artikel: Seni Lokal, Media awcms, Kartu Share, dan img-src** — docs_adr_0024_seni_lokal_di_src_assets_seni_lokal_src_assets, docs_adr_0025_gambar_artikel_dari_media_awcms_resolusi_media_sekali_per_build, docs_adr_0025_gambar_artikel_dari_media_awcms_img_src_ditanyakan, docs_adr_0026_kartu_share_per_artikel_dari_media_awcms_seo_image_media_id, docs_adr_0019_csp_ketat_dikirim_penyaji_content_security_policy_ketat [EXTRACTED 1.00]
- **Postur Runtime & Header: Bun-only dari Dev sampai Produksi di Satu Lapisan** — docs_adr_0015_runtime_bun_menutup_divergence_keluarga_runtime_bun, docs_adr_0016_penyajian_bun_di_belakang_traefik_tanpa_nginx_penyaji_bun, docs_adr_0016_penyajian_bun_di_belakang_traefik_tanpa_nginx_aturan_cache_html_dan_aset_astro, docs_adr_0019_csp_ketat_dikirim_penyaji_content_security_policy_ketat, docs_adr_0019_csp_ketat_dikirim_penyaji_permissions_policy [EXTRACTED 1.00]
- **Lima gerbang mutu awcms-astro** — docs_awcms_astro_readme_lima_gerbang, docs_awcms_astro_standar_teknis_gerbang_lockfile, docs_awcms_astro_standar_teknis_gerbang_katalog_po, docs_awcms_astro_standar_teknis_gerbang_audit_konten_gambar, docs_awcms_astro_standar_teknis_gerbang_audit_dokumen, docs_awcms_astro_standar_teknis_gerbang_audit_graf [EXTRACTED 1.00]
- **Postur HSTS: dari selisih yang tercatat ke header yang digerbangi dan diasersi** — docs_adr_0028_jangkar_standar_performa_dan_keamanan_selisih_hsts_dari_awcms, docs_adr_0029_hsts_digerbangi_produksi_tanpa_includesubdomains_hsts_digerbangi_produksi, docs_adr_0029_hsts_digerbangi_produksi_tanpa_includesubdomains_tiga_asersi_mutation_proven, docs_awcms_astro_standar_performa_dan_keamanan_matriks_header_respons, docs_awcms_astro_checklist_repo_baru_node_env_production_prasyarat_hsts [EXTRACTED 1.00]
- **Empat aturan tertulis yang akhirnya mendapat pemeriksanya** — docs_awcms_astro_standar_teknis_aturan_baru_wajib_membawa_pemeriksanya, docs_adr_0030_aturan_tertulis_mendapat_pemeriksanya_versi_toolchain_test, docs_adr_0030_aturan_tertulis_mendapat_pemeriksanya_kontrak_awcms_test, docs_adr_0030_aturan_tertulis_mendapat_pemeriksanya_perilis_menjalankan_gerbang, docs_adr_0030_aturan_tertulis_mendapat_pemeriksanya_pin_sha_dan_digest [EXTRACTED 1.00]

## Communities (61 total, 8 thin omitted)

### Community 0 - "Dependency dan skrip proyek"
Cohesion: 0.04
Nodes (45): astro, @astrojs/check, @astrojs/node, @astrojs/sitemap, compression, dependencies, astro, @astrojs/check (+37 more)

### Community 1 - "Pengambilan dan render blok konten"
Cohesion: 0.27
Nodes (15): ALLOWED_HEADING_LEVELS, AWCMS_BLOCK_TYPES, Block, escapeHtml(), GalleryItem, renderBlock(), renderContentBlocks(), renderGallery() (+7 more)

### Community 2 - "Klien awcms, tenant, dan media"
Cohesion: 0.05
Nodes (46): ADR-0022, ADR-0024, ADR-0054, ADR-0019, AwcmsApiError, awcmsGet(), baseUrl(), batasWaktuMs() (+38 more)

### Community 3 - "Gerbang audit konten"
Cohesion: 0.12
Nodes (24): auditAnggaranGambar(), auditGambar(), auditKeluaran(), auditPrioritasGambar(), auditSvg(), bandingkanRasio(), berkasUntuk(), catatan (+16 more)

### Community 4 - "Postur performa dan keamanan"
Cohesion: 0.19
Nodes (15): ADR-0028 — Postur performa dan keamanan diikat ke standar yang disebut namanya, Aturan 2 awcms ADR-0062 diserap sebagai pekerjaan (§E), Yang ditolak, ditolak secara tertulis (§D), Indeks Architecture Decision Records, Indeks ADR digerbangi dua arah oleh bun run audit:dokumen, Kriteria kapan sebuah perubahan butuh ADR, Yang harus dikosongkan sebelum commit pertama, Yang sengaja ditunda, beserta yang sudah tidak berlaku (+7 more)

### Community 5 - "Experience layer dan BFF Jualanku"
Cohesion: 0.10
Nodes (27): Envelope { success, data } dan tenant diresolusi sisi server, 01 — Arsitektur experience layer Jualanku, Perbedaan variabel build-time vs request-time, Jalur rollback ke build statis penuh, Matriks rendering rute Jualanku, Static-by-default dengan rute on-demand di-opt-out satu per satu, Alur sesi portal /_portal-api/auth, Aturan cookie dan CSRF portal (+19 more)

### Community 6 - "Standar teknis dan kontrak konten"
Cohesion: 0.14
Nodes (18): Gerbang audit yang wajib tetap hijau di situs turunan, Aturan arah data satu arah — komponen tidak mengambil datanya sendiri, Dokumentasi wajib dan wajib sinkron dengan kode, Gerbang audit graf — bun run audit:graf, Gerbang audit konten — keluaran (bun run audit:konten setelah build), Gerbang CI — .github/workflows/ci.yml, Gerbang katalog PO — bun test, Gerbang lockfile — bun run check:lockfile (+10 more)

### Community 7 - "Gerbang audit dokumen"
Cohesion: 0.13
Nodes (28): ADR-0042, ADR-0062, antaraPenanda(), auditIndeksAdr(), auditJalurDisebut(), auditKutipanAdr(), auditPermukaanKilau(), auditTautan() (+20 more)

### Community 8 - "Penyaji Bun dan headernya"
Cohesion: 0.13
Nodes (20): ASAL_MEDIA, asalMediaTerkonfigurasi(), aturanCache(), buatServer(), CSP, HEADER_KEAMANAN, HEADER_PRODUKSI, headerKeamanan() (+12 more)

### Community 9 - "Layout dasar dan metadata terstruktur"
Cohesion: 0.23
Nodes (11): getSiteUrl(), Locale, localeHtmlLang, articleSchema(), ArticleSchemaInput, collectionSchema(), imageObject(), PUBLISHER_ID (+3 more)

### Community 10 - "Tabel gerbang mutu dan aturan aset"
Cohesion: 0.13
Nodes (20): Empat aturan yang wajib dipertahankan adapter API, content_json bernamespace awcmsAstro dengan schemaVersion, Integrasi awcms-astro → awcms, Jaminan konten yang paling berisiko hilang saat migrasi, Kontrak adapter LocalizedArticle, Modul awcms yang relevan bagi situs statis, Pemetaan model data ke awcms_blog_posts, Urutan migrasi delapan langkah (+12 more)

### Community 11 - "Rantai deploy dan pemeriksa yang dipin"
Cohesion: 0.27
Nodes (10): ADR-0030 — Empat aturan yang sudah tertulis mendapat pemeriksanya; rantai pasok dipin ke SHA, tests/kontrak-awcms.test.mjs — permukaan diekstrak dari kode, dibandingkan dua arah (§D), Lima nilai versi Bun yang wajib sepakat, Perilis menjalankan bun test dan bun audit sesudah build (§C), Rantai pasok dipin ke SHA commit dan digest image (§B), tests/versi-toolchain.test.mjs (§A), Gerbang permukaan awcms — bun test, Gerbang versi toolchain — bun test (+2 more)

### Community 12 - "Gerbang audit graf"
Cohesion: 0.07
Nodes (31): engines, bun, ARTEFAK_TERLACAK, auditArtefakTerlacak(), auditLabelKomunitas(), auditLaporanSepakat(), auditPengecualian(), catatan (+23 more)

### Community 13 - "Fixture pohon berkas untuk tes gerbang"
Cohesion: 0.13
Nodes (18): ADR-0014 — Rendering campuran dan BFF portal Jualanku, ADR-0045 awcms — Jualanku porting, awcms system of record, Astro BFF, Alternatif ditolak: portal SPA memanggil awcms langsung, Alternatif ditolak: seluruh situs output 'server', BFF hanya orkestrasi dan proyeksi, Experience layer Jualanku.info, Jalur rollback build statis penuh, Kontrak sesi portal (+10 more)

### Community 14 - "Katalog PO dan komponen berlokal"
Cohesion: 0.19
Nodes (5): catalogs, Catalog, parsePo(), readQuoted(), rawCatalogs

### Community 15 - "Halaman tab dan beranda"
Cohesion: 0.22
Nodes (7): locale, number, schema, localePath(), TabSlug, tabTitleKey(), t()

### Community 16 - "Rute berprefiks locale dan pengalihnya"
Cohesion: 0.19
Nodes (11): defaultLocale, getLocaleFromPath(), isLocale(), localeMeta, locales, siteUrl, socialImageRaw, stripLocale() (+3 more)

### Community 17 - "Gambar artikel dan seni lokal"
Cohesion: 0.18
Nodes (14): ADR-0021, ArticleVisual, getArticleImage(), getArticleVisual(), getTabImage(), heroImage, MODUL, SENI (+6 more)

### Community 18 - "Blueprint rute dan UI Jualanku"
Cohesion: 0.26
Nodes (12): Selisih HSTS dari awcms — header keenam yang tidak dipasang di mana pun, ADR-0029 — HSTS dikirim penyaji, digerbangi produksi, tanpa includeSubDomains, headerKeamanan(produksi) — fungsi murni pemilik header di server/penyaji.mjs, HSTS digerbangi NODE_ENV === "production" (§A), max-age=31536000, tanpa includeSubDomains, tanpa preload (§B), Tiga asersi mutation-proven di tests/penyaji.test.mjs (§C), Memulai situs baru di atas awcms-astro, NODE_ENV=production adalah prasyarat HSTS pada deployment turunan (+4 more)

### Community 19 - "Kontrak kerja dan katalog skill"
Cohesion: 0.17
Nodes (15): Enam header keamanan penyaji, Urutan kontrak → konten → tampilan, Menurunkan situs baru lewat "Use this template", Empat skill, bukan lima puluh, Katalog skill proyek awcms-astro, Skill ikut tersalin ke situs turunan, AGENTS.md — kontrak kerja awcms-astro, awcms-mini dan awcms-micro dibekukan sebagai referensi (+7 more)

### Community 20 - "Keputusan runtime, cache, dan layar admin"
Cohesion: 0.15
Nodes (15): ADR-0015 — Repo Memakai Bun sebagai Runtime dan Package Manager, Larangan Script Bernama Sama dengan Biner yang Dipanggilnya, ADR-0016 — Bun Menyajikan Keluaran Build di Belakang Traefik; nginx Dilepas, Aturan Cache: HTML must-revalidate, /_astro/ immutable, nginx Dilepas dari Stack, output: "static" TIDAK Berubah, tests/penyaji.test.mjs, Traefik adalah Reverse Proxy, Bukan Static File Server (+7 more)

### Community 21 - "Lima gerbang dan Definition of Done"
Cohesion: 0.23
Nodes (14): Gerbang audit:dokumen — markdown repo ini, Gerbang audit:graf — artefak graphify-out/ dan nama komunitas, Gerbang audit:konten — sumber gambar + keluaran build, Gerbang bun test — katalog PO, kontrak awcms, penyaji, CSP keluaran, versi toolchain, Gerbang check — lockfile + astro check, Lima gerbang awcms-astro, Pemeriksa yang hanya benar untuk repo ini pindah ke tesnya, Penolakan awcms yang WAJIB ditiru di tiruan tes (+6 more)

### Community 22 - "Aturan sumber data ke awcms"
Cohesion: 0.19
Nodes (14): Asal media ditanyakan, tidak disalin, untuk img-src, Kontrak integrasi awcms-astro ↔ awcms, Resolusi media dan kartu share sekali per build, Tiga permukaan awcms yang dipanggil build, Traversal build feed — view=full + order=created_at + nextCursor, Berpindah ke SSR — output static adalah premis, bukan default, BFF portal Jualanku (ADR-0014) — satu-satunya permukaan terautentikasi, Aturan sumber data — client.ts satu-satunya, tanpa pemotongan diam-diam (+6 more)

### Community 23 - "Rantai keputusan kontrak build dan penahanan"
Cohesion: 0.30
Nodes (14): ADR-0018 — Kontrak Build terhadap awcms: Tenant dari Token Mesin, Traversal Cursor, Gerbang Terjemahan, Gerbang Terjemahan translationGroupId, ADR-0019 — CSP Ketat Dikirim Penyaji, Skrip Keluar dari HTML, ADR-0020 — Layar Admin Kembali ke awcms; Repo Ini Kembali Murni Publik + BFF, ADR-0021 — Pengembangan Repo Ditahan Menunggu Fondasi awcms (Superseded oleh ADR-0027), Titik Lanjut — Yang Menunggu Saat Penahanan Dicabut, ADR-0022 — Situs Menerbitkan Tenant DEFAULT (Owner) awcms, ADR-0023 — Penahanan Dipersempit: Pekerjaan Tanpa awcms Boleh Mendarat (+6 more)

### Community 24 - "Standar luar bernama dan alur kontribusi"
Cohesion: 0.20
Nodes (12): Batas waktu awcmsGet — AbortSignal.timeout, bukan retry, Core Web Vitals p75 — LCP, INP, CLS (belum diukur), HSTS digerbangi produksi, tanpa includeSubDomains (ADR-0029), Lima kontrol yang sengaja DITOLAK, Sembilan celah — lima tertutup, empat terbuka, Standar luar bernama — OWASP Top 10 2021, ASVS 4.0.3, Secure Headers, ISO 27001 Annex A, NIST SSDF, Core Web Vitals, Standar luar yang mengikat repo ini (ADR-0028), Alur kontribusi — issue, branch, scope atomic, changeset, PR (+4 more)

### Community 25 - "Jebakan situs turunan dan asal tenant"
Cohesion: 0.20
Nodes (12): Keputusan awcms yang mengubah apa yang benar di sini (ADR-0049/0050/0056/0059/0061/0062), Tenant datang dari token mesin, tidak pernah dari header, Checklist sebelum go-live situs turunan, Jebakan yang paling sering terjadi di situs turunan, awcms ADR-0062 — skills are gated against the code they describe, Kutipan ADR-NNNN belum diperiksa resolve ke berkasnya, Skill digerbangi terhadap kode yang dijelaskannya, Template issue: Laporan bug (+4 more)

### Community 26 - "Sembilan celah dan anggaran performa"
Cohesion: 0.21
Nodes (13): Sembilan celah dicatat sebagai celah, dengan pemeriksanya masing-masing (§C), Target Core Web Vitals ditulis sebagai target, beserta pengakuan belum diukur (§B), Kesalahan yang paling sering terjadi saat menurunkan situs, Aturan punya penegak — lima gerbang awcms-astro, Celah 7 — tidak ada analisis statik (CodeQL), Celah 8 — Core Web Vitals tidak diukur, Celah 9 — tidak ada SBOM pada rilis, Core Web Vitals — LCP, INP, CLS (+5 more)

### Community 27 - "Design system dan token tema"
Cohesion: 0.19
Nodes (14): WCAG 2.1 AA (2.2 AA untuk permukaan Jualanku), Aturan aksesibilitas yang mengikat (WCAG 2.1 AA), Gerbang keluaran CSP — bun test setelah bun run build, Aturan aksesibilitas design system, Audit kontras terukur belum pernah dijalankan, awcms-astro — Design System, Design token sebagai CSS custom properties di :root, Gap terhadap kosakata token AWCMS (+6 more)

### Community 28 - "Konvensi seni lokal dan resolusi URL"
Cohesion: 0.18
Nodes (11): Unit Test dengan bun:test, Pin Versi Bun di Tiga Tempat, Runtime Bun, Dua Berkas Bernama Sama = Build Gagal, import.meta.glob dengan query: "?url", src/components/Ilustrasi.astro, Konvensi Nama Seni (hero, tab/<tab>, artikel/<tab>/<slug>), Seni Lokal di src/assets/ (+3 more)

### Community 29 - "CSP dan kepemilikan header di satu berkas"
Cohesion: 0.22
Nodes (11): Adapter @astrojs/node Mode standalone Dijalankan Bun, Penyaji Bun (server/penyaji.mjs), vite.build.assetsInlineLimit: 0, Content-Security-Policy Ketat, JSON-LD adalah Blok Data, Bukan Skrip, Kebijakan Header Hidup di Satu Berkas, Permissions-Policy sebagai Header Keamanan Kelima, tests/keluaran-csp.test.mjs (+3 more)

### Community 30 - "Penahanan pengembangan dan ujinya"
Cohesion: 0.18
Nodes (11): awcms-astro sebagai Experience Layer + Satu-satunya BFF, Dua Indikator Pencabutan Penahanan, Dua Kelas yang Masih Boleh Mendarat, Penahanan Pengembangan, Batas: "Sudah Ada Endpoint-nya" Bukan Jawaban "Tidak", Uji: Apakah Perubahan Ini Akan Ditulis Ulang Bila awcms Berubah?, BFF Portal Jualanku Masih Ditahan oleh Uji ADR-0023, Dua Indikator ADR-0021 Terpenuhi (+3 more)

### Community 31 - "Skrip rilis"
Cohesion: 0.15
Nodes (11): apply, args, body, commit, ketemu, level, [major, minor, patch], ADR-0028 (+3 more)

### Community 32 - "Parser dan gerbang katalog PO"
Cohesion: 0.19
Nodes (14): Jangkar standar dinyatakan beserta edisinya (§A), Server / X-Powered-By dihapus, bukan sekadar diasersi (§D), Kapan memilih awcms-astro, Hubungan dengan ahliweb/awcms — dua repo, dua angka, ISO/IEC 25010 (2023) — model mutu produk, ISO/IEC 27001:2022 Annex A, OWASP API Security Top 10 (2023) — dinyatakan tidak berlaku, OWASP ASVS 4.0.3 (L1/L2) (+6 more)

### Community 33 - "Layout halaman artikel"
Cohesion: 0.12
Nodes (12): locale, locale, locale, articleVisual, breadcrumbItems, canonicalUrl, DateTimeFormatOptions, locale (+4 more)

### Community 34 - "Empat aturan tanpa pemeriksa dan pin versi"
Cohesion: 0.28
Nodes (9): Aturan baru wajib membawa pemeriksanya, Empat aturan tertulis TANPA pemeriksa (ADR-0030), Checklist "Yang tidak gagal sendiri", Action dipin ke SHA commit, bukan tag, bun-version dipin eksplisit di dua job CI, Aturan konfigurasi — site.ts dan .env satu-satunya tempat, Versi Bun dipin di tiga berkas dan lima nilai, Perubahan yang tidak boleh diambil sendiri (+1 more)

### Community 35 - "Gerbang lockfile"
Cohesion: 0.25
Nodes (8): ADR-0015, bacaJsonc(), BLOK_DEPENDENCY, buangTrailingComma(), lock, masalah, pkg, repoRoot

### Community 36 - "Peta situs dan remah navigasi"
Cohesion: 0.18
Nodes (6): breadcrumbSchema, fullItems, locale, breadcrumbItems, locale, sections

### Community 37 - "Kebijakan keamanan dan permukaan serangan"
Cohesion: 0.29
Nodes (8): Kerentanan keamanan lewat GitHub Security Advisory, bukan issue publik, Konten situs tinggal di instans awcms, bukan di repo template, Aturan keamanan — tanpa HTML mentah, tanpa skrip pihak ketiga, tanpa data pembaca, Repo ini template, bukan sebuah situs — cacat ikut ke setiap turunannya, Aturan keamanan yang mengikat, Bukan kerentanan keamanan — koreksi konten dan peniruan situs, Kebijakan Keamanan awcms-astro, Permukaan serangan repo ini — penyaji Bun adalah permukaan

### Community 38 - "Lambang favicon lampu lalu lintas"
Cohesion: 0.39
Nodes (8): Rounded Square Icon Backdrop (64x64, rx=14), Sky-to-Emerald Brand Palette (Tailwind-family hues), Diagonal Blue-to-Green Linear Gradient (id=f), Favicon Brand Mark (Traffic Light App Icon), Three Stacked Signal Lamps (red, amber, green), Red/Amber/Green Status Color Semantics, Traffic Light Housing Glyph (dark pill, 85% opacity), Traffic Signal Motif (lampu lalu lintas)

### Community 39 - "Job CI terkondisi dan pemicu rebuild"
Cohesion: 0.29
Nodes (7): Uji ADR-0023 sebelum menambah permukaan keempat, Build dikondisikan pada vars.AWCMS_API_URL, bukan backend tiruan, CI job build — dikondisikan pada sumber konten, Uji: apakah perubahan ini ditulis ulang bila awcms berubah?, Endpoint /api/v1/deploy Coolify, bukan /restart, Job picu deploy Coolify, Syarat target deploy dinyatakan eksplisit di ringkasan run

### Community 40 - "Konfigurasi Astro dan sitemap"
Cohesion: 0.43
Nodes (6): LOCALE_PREFIXES, ADR-0014, ADR-0016, neutralPath(), serialize(), SITE

### Community 41 - "Konfigurasi TypeScript"
Cohesion: 0.29
Nodes (6): astro/tsconfigs/strict, compilerOptions, jsx, jsxImportSource, moduleResolution, extends

### Community 42 - "Kredensial mesin dan asersi tenant"
Cohesion: 0.40
Nodes (6): bun.lock sebagai Satu-satunya Lockfile, scripts/cek-lockfile.mjs, AWCMS_TENANT_ID sebagai Asersi, Bukan Sumber, Kredensial Mesin awcms (awcmsm_<tenant>_<rahasia>), AWCMS_TENANT_CODE Ditolak, Bukan Diabaikan, Tenant DEFAULT (Owner) sebagai Sumber Konten Situs

### Community 43 - "Traversal feed dan gerbang resolusi media"
Cohesion: 0.33
Nodes (6): Build Feed view=full, MAX_PAGES sebagai Penahan Loop Liar, Traversal Cursor Keyset (?order=created_at), Gerbang NOL dari N id Resolve = Build Gagal, Resolusi Media Sekali per Build ke LocalizedArticle, seoImageMediaId ?? featuredMediaId

### Community 44 - "Batas gerbang terhadap prosa"
Cohesion: 0.40
Nodes (5): Kebiasaan: grep nama benda yang diubah ADR di seluruh markdown, Prosa tidak bisa digerbangi — gerbang membaca struktur, Sebelas dokumen yang menyatakan sesuatu yang tidak ada, Jangan menjawab pertanyaan kepatuhan dari ingatan, Aturan gambar — dua sumber, satu rasio, format dari isi berkas

### Community 45 - "Alur changeset dan rilis"
Cohesion: 0.40
Nodes (5): Yang WAJIB dikosongkan sebelum commit pertama, Changeset dilipat skrip rilis, bukan disunting tangan, CHANGELOG — riwayat rilis, Panduan Kontribusi, Rilis — wewenang maintainer lewat bun run release

### Community 46 - "Gerbang versi toolchain"
Cohesion: 0.40
Nodes (4): ci, dockerfile, pkg, VERSI

### Community 47 - "Pedoman perilaku kontributor"
Cohesion: 0.50
Nodes (4): Contributor Covenant versi 2.1, Komitmen partisipasi bebas pelecehan, Pedoman Perilaku, Kontribusi penutur asli dihargai sebagai keahlian

### Community 57 - "CI dan image berhenti mengirim variabel tenant yang sudah ditolak"
Cohesion: 0.23
Nodes (10): buangTrailingComma(), ADR-0028, ADR-0031, repoRoot, susunPurl(), susunSbom(), lock, ADR-0030 (+2 more)

### Community 58 - "Layar admin kembali ke `awcms`: ADR-0017 di-supersede ADR-0020"
Cohesion: 0.18
Nodes (9): ADR-0026, locale, alternates, jsonLd, locale, metaDescription, ogLocale, KartuShare (+1 more)

### Community 59 - "Rilis membawa SBOM CycloneDX dari lockfile (ADR-0031)"
Cohesion: 0.33
Nodes (5): ADR-0031 — SBOM CycloneDX diturunkan dari `bun.lock` pada setiap rilis, Alternatif yang dipertimbangkan, Keputusan, Konsekuensi, Konteks

## Ambiguous Edges - Review These
- `Three Stacked Signal Lamps (red, amber, green)` → `Sky-to-Emerald Brand Palette (Tailwind-family hues)`  [AMBIGUOUS]
  public/favicon.svg · relation: conceptually_related_to

## Knowledge Gaps
- **209 isolated node(s):** `SITE`, `ADR-0014`, `ADR-0016`, `name`, `type` (+204 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **8 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **What is the exact relationship between `Three Stacked Signal Lamps (red, amber, green)` and `Sky-to-Emerald Brand Palette (Tailwind-family hues)`?**
  _Edge tagged AMBIGUOUS (relation: conceptually_related_to) - confidence is low._
- **Why does `ADR-0014 — Rendering campuran dan BFF portal Jualanku` connect `Fixture pohon berkas untuk tes gerbang` to `Keputusan runtime, cache, dan layar admin`?**
  _High betweenness centrality (0.194) - this node is a cross-community bridge._
- **Why does `awcmsGet()` connect `Klien awcms, tenant, dan media` to `Fixture pohon berkas untuk tes gerbang`?**
  _High betweenness centrality (0.153) - this node is a cross-community bridge._
- **Why does `Experience layer Jualanku.info` connect `Fixture pohon berkas untuk tes gerbang` to `Klien awcms, tenant, dan media`?**
  _High betweenness centrality (0.152) - this node is a cross-community bridge._
- **Are the 2 inferred relationships involving `Gerbang mutu — tabel gerbang yang wajib hijau` (e.g. with `Gerbang audit yang wajib tetap hijau di situs turunan` and `Aturan punya penegak — lima gerbang awcms-astro`) actually correct?**
  _`Gerbang mutu — tabel gerbang yang wajib hijau` has 2 INFERRED edges - model-reasoned connections that need verification._
- **What connects `SITE`, `ADR-0014`, `ADR-0016` to the rest of the system?**
  _209 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `Dependency dan skrip proyek` be split into smaller, more focused modules?**
  _Cohesion score 0.043478260869565216 - nodes in this community are weakly interconnected._