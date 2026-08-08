# Graph Report - .  (2026-08-08)

## Corpus Check
- 44 files · ~167,118 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 893 nodes · 1489 edges · 69 communities (57 shown, 12 thin omitted)
- Extraction: 93% EXTRACTED · 7% INFERRED · 0% AMBIGUOUS · INFERRED: 110 edges (avg confidence: 0.88)
- Token cost: 243,363 input · 0 output

## Community Hubs (Navigation)
- Penyaji Bun dan header respons
- Dependensi dan toolchain runtime
- Gerbang audit konten keluaran
- BFF portal Jualanku yang ditahan
- Uji gerbang audit graf
- Gerbang audit dokumen dan indeks ADR
- Postur keamanan diikat standar bernama
- Tab situs dan seksi berita
- Kontrak konten dari awcms
- Deklarasi peran dan katalog PO
- Aturan yang membawa pemeriksanya
- Lima gerbang dan checklist turunan
- Komponen tampilan halaman
- Layout artikel dan tanggalnya
- Prosedur performa dan kontrol ditolak
- JSON-LD schema.org
- Gambar artikel dan visualnya
- Gerbang audit artefak graf
- SBOM rilis dan analisis statik
- Kontrak kerja dan peran repo
- Locale dan pengalih bahasa
- Render blok konten
- Batas panggilan awcms dan rilis
- Runtime Bun dan pelepasan nginx
- Aturan konten dan urutan berita
- Rangkaian ADR fondasi awal
- Gerbang uji dan permukaan terpanggil
- Design system dan token
- Skrip rilis dan penomoran versi
- Halaman beranda dan ilustrasi
- Klien HTTP awcms
- Uji kontrak tenant dan feed
- CSP ketat dan adapter statik
- Breadcrumb dan peta situs
- Integrasi dan migrasi ke awcms
- Layout dasar dan kartu share
- Seni lokal dan pin runtime
- Traversal feed build dan terjemahan
- Penahanan pengembangan dan layar admin
- Pemeriksa sinkron lockfile
- Tiruan awcms dalam pengujian
- Konfigurasi build Astro
- Resolusi tenant dari token
- Ikon merek lampu lalu lintas
- Header respons dan feed Atom
- Konfigurasi TypeScript ketat
- Uji gerbang audit dokumen
- Kejujuran klaim kepatuhan
- Asal media dan resolusinya
- Uji build rilis terkondisi
- Uji pin versi toolchain
- Template versus situs turunan
- Pedoman perilaku kontributor
- Alur kontribusi dan keputusan
- Kredensial mesin dan tenant terbit
- Rute robots.txt
- Uji keluaran siap CSP
- Konfigurasi Dependabot
- Kepatuhan dijawab dari bukti
- Templat issue laporan bug
- Pelaporan kerentanan privat
- Pin versi Bun di CI
- Variabel tenant yang diteruskan
- Kerahasiaan pelapor pelanggaran
- Aturan yang tidak bisa ditawar
- Pengecualian Dependabot TypeScript
- Rebuild terjadwal harian

## God Nodes (most connected - your core abstractions)
1. `t()` - 19 edges
2. `getArticles()` - 18 edges
3. `scripts` - 16 edges
4. `Lima gerbang awcms-astro` - 15 edges
5. `Standar Teknis awcms-astro` - 15 edges
6. `siteConfig` - 14 edges
7. `Kontrak integrasi awcms-astro ↔ awcms` - 14 edges
8. `ADR-0033 — Seksi berita: urutan dari tanggal, dua tanggal berhenti dilipat` - 14 edges
9. `ADR-0035 — Feed Atom per seksi berita, dan gerbang atas setiap .xml` - 14 edges
10. `README awcms-astro` - 13 edges

## Surprising Connections (you probably didn't know these)
- `Experience layer Jualanku.info` --references--> `awcmsGet()`  [INFERRED]
  docs/adr/0014-rendering-campuran-dan-bff-portal.md → src/lib/awcms/client.ts
- `Prioritas: Cacat yang Tidak Menggagalkan Build` --semantically_similar_to--> `ADR-0018 — Kontrak build terhadap awcms: tenant dari token mesin, traversal cursor, gerbang terjemahan`  [INFERRED] [semantically similar]
  SUPPORT.md → docs/adr/0018-kontrak-build-token-mesin-dan-traversal-konten.md
- `Langkah `Nyatakan cakupan` — dihitung dari git ls-files` --semantically_similar_to--> `Aturan baru wajib membawa pemeriksanya`  [INFERRED] [semantically similar]
  .github/workflows/codeql.yml → .claude/skills/awcms-astro-gerbang/SKILL.md
- `Posisi awcms-astro di keluarga AWCMS` --semantically_similar_to--> `Standar keluarga AWCMS untuk situs statis Astro`  [INFERRED] [semantically similar]
  README.md → docs/awcms-astro/README.md
- `Atom 1.0, bukan RSS 2.0 — yang diwajibkan spesifikasi adalah yang bisa digerbangi` --semantically_similar_to--> `Aturan baru wajib membawa pemeriksanya`  [INFERRED] [semantically similar]
  docs/adr/0035-feed-atom-per-seksi-berita-dan-gerbang-atas-xml.md → .claude/skills/awcms-astro-gerbang/SKILL.md

## Import Cycles
- None detected.

## Hyperedges (group relationships)
- **Seksi berita: satu deklarasi, urutan, feed, dan kosakata /news/** — docs_adr_0033_seksi_berita_urutan_dari_tanggal_dan_dua_tanggal_yang_terpisah_urutan_seksi, docs_adr_0035_feed_atom_per_seksi_berita_dan_gerbang_atas_xml_seksi_punya_feed, docs_adr_0036_news_adalah_kosakata_repo_ini_dan_sebuah_tab_yang_memikulnya_kosakata_news_test, docs_awcms_astro_checklist_repo_baru_checklist, _claude_skills_awcms_astro_situs_baru_skill_urutan_kontrak_konten_tampilan [EXTRACTED 1.00]
- **Setiap aturan mendarat bersama pemeriksanya** — _claude_skills_awcms_astro_gerbang_skill_aturan_baru_wajib_membawa_pemeriksanya, docs_adr_0034_publik_secara_bawaan_admin_hanya_bila_dinyatakan_peran_situs_test, docs_adr_0035_feed_atom_per_seksi_berita_dan_gerbang_atas_xml_keluarga_gerbang_atas_setiap_xml, docs_adr_0036_news_adalah_kosakata_repo_ini_dan_sebuah_tab_yang_memikulnya_kosakata_news_test, docs_awcms_astro_standar_performa_dan_keamanan_sepuluh_celah, docs_awcms_astro_standar_teknis_gerbang_mutu [EXTRACTED 1.00]
- **Publik sebagai fungsi utama; admin USER hanya bila dinyatakan** — agents_peran_repo_publik_utama, docs_adr_0034_publik_secara_bawaan_admin_hanya_bila_dinyatakan_permukaanadmin, docs_adr_0034_publik_secara_bawaan_admin_hanya_bila_dinyatakan_admin_user_bukan_admin_utama, readme_posisi_keluarga_awcms, docs_awcms_astro_readme_standar_awcms_astro, docs_awcms_astro_checklist_repo_baru_checklist [EXTRACTED 1.00]
- **Penutupan celah ADR-0028 disertai syarat kejujuran cakupan** — _claude_skills_awcms_astro_performa_keamanan_skill_sembilan_celah, _claude_skills_awcms_astro_performa_keamanan_skill_syarat_kejujuran_klaim, _github_workflows_codeql_analyze, _github_workflows_codeql_nyatakan_cakupan, _github_workflows_ci_lighthouse_cwv_lab, security_daftar_celah_sengaja_publik [EXTRACTED 1.00]
- **Kontrak build awcms-astro terhadap awcms (tenant, traversal, terjemahan)** — docs_adr_0018_kontrak_build_token_mesin_dan_traversal_konten_kredensial_mesin_awcms, docs_adr_0018_kontrak_build_token_mesin_dan_traversal_konten_asersi_awcms_tenant_id, docs_adr_0018_kontrak_build_token_mesin_dan_traversal_konten_traversal_cursor_keyset, docs_adr_0018_kontrak_build_token_mesin_dan_traversal_konten_build_feed_view_full, docs_adr_0018_kontrak_build_token_mesin_dan_traversal_konten_gerbang_terjemahan_translationgroupid, docs_adr_0022_situs_menerbitkan_tenant_default_awcms_tenant_default_owner [EXTRACTED 1.00]
- **Lima gerbang menegakkan Definition of Done lintas AGENTS, PR template, CONTRIBUTING, dan CI** — _claude_skills_awcms_astro_gerbang_skill_lima_gerbang, agents_definition_of_done, _github_pull_request_template_definition_of_done, contributing_definition_of_done, _github_workflows_ci_job_check [INFERRED 0.85]
- **Siklus Penahanan Pengembangan: Ditahan, Dipersempit, Selesai** — docs_adr_0020_layar_admin_kembali_ke_awcms_adr_0020, docs_adr_0021_tahan_pengembangan_menunggu_fondasi_awcms_adr_0021, docs_adr_0023_penahanan_dipersempit_pekerjaan_tanpa_awcms_adr_0023, docs_adr_0027_penahanan_adr_0021_selesai_adr_0027 [EXTRACTED 1.00]
- **Rantai Gambar Artikel: Seni Lokal, Media awcms, Kartu Share, dan img-src** — docs_adr_0024_seni_lokal_di_src_assets_seni_lokal_src_assets, docs_adr_0025_gambar_artikel_dari_media_awcms_resolusi_media_sekali_per_build, docs_adr_0025_gambar_artikel_dari_media_awcms_img_src_ditanyakan, docs_adr_0026_kartu_share_per_artikel_dari_media_awcms_seo_image_media_id, docs_adr_0019_csp_ketat_dikirim_penyaji_content_security_policy_ketat [EXTRACTED 1.00]
- **Postur Runtime & Header: Bun-only dari Dev sampai Produksi di Satu Lapisan** — docs_adr_0015_runtime_bun_menutup_divergence_keluarga_runtime_bun, docs_adr_0016_penyajian_bun_di_belakang_traefik_tanpa_nginx_penyaji_bun, docs_adr_0016_penyajian_bun_di_belakang_traefik_tanpa_nginx_aturan_cache_html_dan_aset_astro, docs_adr_0019_csp_ketat_dikirim_penyaji_content_security_policy_ketat, docs_adr_0019_csp_ketat_dikirim_penyaji_permissions_policy [EXTRACTED 1.00]
- **Empat aturan tertulis yang akhirnya mendapat pemeriksanya** — docs_adr_0030_aturan_tertulis_mendapat_pemeriksanya_versi_toolchain_test, docs_adr_0030_aturan_tertulis_mendapat_pemeriksanya_kontrak_awcms_test, docs_adr_0030_aturan_tertulis_mendapat_pemeriksanya_perilis_menjalankan_gerbang, docs_adr_0030_aturan_tertulis_mendapat_pemeriksanya_pin_sha_dan_digest [EXTRACTED 1.00]

## Communities (69 total, 12 thin omitted)

### Community 0 - "Penyaji Bun dan header respons"
Cohesion: 0.07
Nodes (40): ADR-0019, ASAL_MEDIA, asalMediaTerkonfigurasi(), aturanCache(), buatServer(), CACHE_ASET, CACHE_HALAMAN, CSP (+32 more)

### Community 1 - "Dependensi dan toolchain runtime"
Cohesion: 0.04
Nodes (45): astro, @astrojs/check, @astrojs/node, @astrojs/sitemap, compression, dependencies, astro, @astrojs/check (+37 more)

### Community 2 - "Gerbang audit konten keluaran"
Cohesion: 0.10
Nodes (32): artikelDiJsonLd(), auditAnggaranGambar(), auditFeed(), auditGambar(), auditKeluaran(), auditPrioritasGambar(), auditSvg(), bacaXml() (+24 more)

### Community 3 - "BFF portal Jualanku yang ditahan"
Cohesion: 0.07
Nodes (35): ADR-0014 — Rendering campuran dan BFF portal Jualanku, ADR-0045 awcms — Jualanku porting, awcms system of record, Astro BFF, Alternatif ditolak: portal SPA memanggil awcms langsung, Alternatif ditolak: seluruh situs output 'server', BFF hanya orkestrasi dan proyeksi, Experience layer Jualanku.info, Jalur rollback build statis penuh, Kontrak sesi portal (+27 more)

### Community 4 - "Uji gerbang audit graf"
Cohesion: 0.09
Nodes (21): engines, bun, graf(), jalankan(), laporan(), pohon(), pohonBersih(), repo() (+13 more)

### Community 5 - "Gerbang audit dokumen dan indeks ADR"
Cohesion: 0.13
Nodes (27): ADR-0014, ADR-0042, ADR-0062, antaraPenanda(), auditIndeksAdr(), auditJalurDisebut(), auditKutipanAdr(), auditPermukaanKilau() (+19 more)

### Community 6 - "Postur keamanan diikat standar bernama"
Cohesion: 0.08
Nodes (26): MAX_PAGES — penahan loop yang melempar, bukan mengembalikan sebagian, AWCMS_TENANT_CODE ditolak, bukan diabaikan, Verifikasi tenant lewat jaringan ditolak, ADR-0028 — Postur performa dan keamanan diikat ke standar yang disebut namanya, Jangkar standar dinyatakan beserta edisinya, Lima kontrol yang ditolak, ditolak secara tertulis, Selisih HSTS dari awcms yang ditemukan oleh pemetaan, Target Core Web Vitals ditulis sebagai target (LCP/INP/CLS) (+18 more)

### Community 7 - "Tab situs dan seksi berita"
Cohesion: 0.20
Nodes (17): defaultLocale, localePath(), siteConfig, TabSlug, tabTitleKey(), urutanSeksiTab(), getArticles(), daftarFeed() (+9 more)

### Community 8 - "Kontrak konten dari awcms"
Cohesion: 0.11
Nodes (22): ADR-0024, UrutanSeksi, assertFeedReturnedFullRows(), assertTranslationsArePairable(), AwcmsAstroBlock, AwcmsBlogPost, AwcmsBlogPostSummary, fetchMedia() (+14 more)

### Community 9 - "Deklarasi peran dan katalog PO"
Cohesion: 0.09
Nodes (15): ADR-0036, PERAN_DILARANG, permukaanAdmin, situsPublikSaja(), tabs, Catalog, parsePo(), readQuoted() (+7 more)

### Community 10 - "Aturan yang membawa pemeriksanya"
Cohesion: 0.12
Nodes (22): Aturan baru wajib membawa pemeriksanya, Gerbang bun run audit:konten, Sebelas dokumen yang menyatakan sesuatu yang tidak ada, Yang TIDAK ditangkap gerbang — disebut supaya tidak dikira terjaga, Batas waktu awcmsGet — ada, dan TIDAK sama dengan retry, Anggaran gambar per halaman (beranda 250 KB, konten 100 KB), output: 'static' adalah premis, bukan default yang kebetulan, Satu rasio (--ratio-visual) untuk seluruh situs (+14 more)

### Community 11 - "Lima gerbang dan checklist turunan"
Cohesion: 0.13
Nodes (22): Gerbang bun run audit:dokumen, Gerbang bun run audit:graf, Gerbang bun run check (lockfile + astro check), Lima gerbang awcms-astro, Checklist sebelum go-live situs turunan, Jebakan yang paling sering terjadi pada situs turunan, Menurunkan situs baru dari template awcms-astro, Yang wajib dikosongkan sebelum commit pertama (+14 more)

### Community 12 - "Komponen tampilan halaman"
Cohesion: 0.13
Nodes (7): locale, locale, locale, locale, catalogs, rawCatalogs, t()

### Community 13 - "Layout artikel dan tanggalnya"
Cohesion: 0.12
Nodes (19): tanggalMesin(), localeHtmlLang, articleVisual, breadcrumbItems, canonicalUrl, diperbarui, locale, modifiedDate (+11 more)

### Community 14 - "Prosedur performa dan kontrol ditolak"
Cohesion: 0.12
Nodes (20): Core Web Vitals diukur LAB, bukan kunjungan nyata, Enam header respons penyaji (lima selalu, HSTS hanya produksi), HSTS digerbangi produksi, tanpa includeSubDomains, Lima kontrol yang sengaja DITOLAK, RUM dan pelaporan CSP ditolak — larangan mengumpulkan data pembaca, Sembilan celah bernomor ADR-0028 — seluruhnya tertutup, Prosedur performa dan keamanan awcms-astro, Syarat kejujuran klaim kepatuhan (ADR-0032) (+12 more)

### Community 15 - "JSON-LD schema.org"
Cohesion: 0.13
Nodes (17): getSiteUrl(), Locale, articleSchema(), ArticleSchemaInput, collectionSchema(), defaultSocialImage, imageObject(), PUBLISHER_ID (+9 more)

### Community 16 - "Gambar artikel dan visualnya"
Cohesion: 0.18
Nodes (14): ADR-0021, ADR-0025, ArticleVisual, getArticleImage(), getArticleVisual(), getTabImage(), heroImage, MODUL (+6 more)

### Community 17 - "Gerbang audit artefak graf"
Cohesion: 0.16
Nodes (17): ARTEFAK_TERLACAK, auditArtefakTerlacak(), auditLabelKomunitas(), auditLaporanSepakat(), auditPengecualian(), catatan, catatKesegaran(), dirKeluaran (+9 more)

### Community 18 - "SBOM rilis dan analisis statik"
Cohesion: 0.13
Nodes (15): buangTrailingComma(), ADR-0028, ADR-0031, repoRoot, susunPurl(), susunSbom(), codeql, ADR-0030 (+7 more)

### Community 19 - "Kontrak kerja dan peran repo"
Cohesion: 0.24
Nodes (18): AGENTS.md — kontrak kerja awcms-astro, Peran owner tidak pernah tinggal di repo ini, Halaman publik sebagai fungsi UTAMA repo, Permukaan admin harus DINYATAKAN, tidak boleh muncul, ADR-0033 — Seksi berita: urutan dari tanggal, dua tanggal berhenti dilipat, Admin untuk USER, tidak pernah ADMIN UTAMA, ADR-0034 — Publik sebagai fungsi utama; admin USER hanya bila dinyatakan, permukaanAdmin di src/config/site.ts (+10 more)

### Community 20 - "Locale dan pengalih bahasa"
Cohesion: 0.18
Nodes (14): ADR-0017, ADR-0051, getLocaleFromPath(), isLocale(), localeMeta, locales, siteUrl, socialImageRaw (+6 more)

### Community 21 - "Render blok konten"
Cohesion: 0.27
Nodes (15): ALLOWED_HEADING_LEVELS, AWCMS_BLOCK_TYPES, Block, escapeHtml(), GalleryItem, renderBlock(), renderContentBlocks(), renderGallery() (+7 more)

### Community 22 - "Batas panggilan awcms dan rilis"
Cohesion: 0.13
Nodes (16): src/lib/awcms/client.ts satu-satunya berkas yang menghubungi awcms, Token build tidak pernah ber-prefix PUBLIC_, Uji: apakah perubahan ini ditulis ulang bila awcms berubah?, CI dipisah menjadi check (selalu jalan) dan build (butuh sumber konten), Gerbang yang DILEWATI mengatakannya, bukan lulus, Rilis 0.2.0 — 8 Agustus 2026, Kapan memilih awcms-astro, Struktur wajib dan lima entri yang sengaja tidak ada (+8 more)

### Community 23 - "Runtime Bun dan pelepasan nginx"
Cohesion: 0.14
Nodes (16): ADR-0015 — Repo Memakai Bun sebagai Runtime dan Package Manager, bun.lock sebagai Satu-satunya Lockfile, scripts/cek-lockfile.mjs, Larangan Script Bernama Sama dengan Biner yang Dipanggilnya, ADR-0016 — Bun Menyajikan Keluaran Build di Belakang Traefik; nginx Dilepas, Aturan Cache: HTML must-revalidate, /_astro/ immutable, nginx Dilepas dari Stack, output: "static" TIDAK Berubah (+8 more)

### Community 24 - "Aturan konten dan urutan berita"
Cohesion: 0.16
Nodes (15): Resolusi media dan kartu share sekali per build, Urutan: kontrak → konten → tampilan, Empat aturan src/lib/content.ts, Tidak ada jalur HTML mentah dari CMS, Terjemahan katalog PO — key masuk ke seluruh locale, publishedDate dan updatedDate: dua klaim, dibaca dari SATU baris, NewsArticle dengan penulis tingkat ORGANISASI, urutanSeksi: 'manual' | 'terbaru' — sebuah tab MENYATAKAN dirinya seksi berita (+7 more)

### Community 25 - "Rangkaian ADR fondasi awal"
Cohesion: 0.23
Nodes (15): ADR-0018 — Kontrak build terhadap awcms: tenant dari token mesin, traversal cursor, gerbang terjemahan, ADR-0019 — CSP Ketat Dikirim Penyaji, Skrip Keluar dari HTML, ADR-0020 — Layar admin owner/internal kembali ke awcms, Peran repo: experience layer + satu-satunya BFF, ADR-0021 — Pengembangan repo ditahan sampai fondasi awcms selesai, Titik lanjut yang menunggu pencabutan penahanan, ADR-0022 — Situs ini menerbitkan tenant DEFAULT (owner) awcms, ADR-0023 — Penahanan Dipersempit: Pekerjaan Tanpa awcms Boleh Mendarat (+7 more)

### Community 26 - "Gerbang uji dan permukaan terpanggil"
Cohesion: 0.14
Nodes (14): Gerbang bun test, Tiga permukaan awcms yang dipanggil build, CI job `build` — dikondisikan pada vars.AWCMS_API_URL, Build tidak diberi awcms tiruan supaya selalu hijau, Satu awcms, banyak situs, tests/kontrak-awcms.test.mjs — permukaan diekstrak dari kode, dibandingkan dua arah (§D), tests/peran-situs.test.mjs, Tidak ada fitur yang HANYA ada di sini (+6 more)

### Community 27 - "Design system dan token"
Cohesion: 0.19
Nodes (14): Aturan aksesibilitas design system, Audit kontras terukur belum pernah dijalankan, awcms-astro — Design System, Design token sebagai CSS custom properties di :root, Gambar: <img> di atas import.meta.glob, bukan <Image> astro:assets, Gap terhadap kosakata token AWCMS, Jalur adopsi token empat tahap saat integrasi, Kilau hover — standar interaksi dan kontrak permukaan (+6 more)

### Community 28 - "Skrip rilis dan penomoran versi"
Cohesion: 0.14
Nodes (12): apply, args, body, commit, ketemu, level, [major, minor, patch], ADR-0028 (+4 more)

### Community 29 - "Halaman beranda dan ilustrasi"
Cohesion: 0.15
Nodes (4): locale, number, schema, prefixedLocales

### Community 30 - "Klien HTTP awcms"
Cohesion: 0.29
Nodes (10): AwcmsApiError, awcmsGet(), baseUrl(), batasWaktuMs(), describeTenantResolution(), Envelope, tenant(), envSource (+2 more)

### Community 31 - "Uji kontrak tenant dan feed"
Cohesion: 0.17
Nodes (6): TenantNotConfiguredError, ADR-0018, ADR-0033, ADR-0056, pasangFetchTiruan(), ringkas()

### Community 32 - "CSP ketat dan adapter statik"
Cohesion: 0.22
Nodes (11): Adapter @astrojs/node Mode standalone Dijalankan Bun, Penyaji Bun (server/penyaji.mjs), vite.build.assetsInlineLimit: 0, Content-Security-Policy Ketat, JSON-LD adalah Blok Data, Bukan Skrip, Kebijakan Header Hidup di Satu Berkas, Permissions-Policy sebagai Header Keamanan Kelima, tests/keluaran-csp.test.mjs (+3 more)

### Community 33 - "Breadcrumb dan peta situs"
Cohesion: 0.18
Nodes (6): breadcrumbSchema, fullItems, locale, breadcrumbItems, locale, sections

### Community 34 - "Integrasi dan migrasi ke awcms"
Cohesion: 0.29
Nodes (10): Keluarga AWCMS adalah dua repo, dan hanya dua, Namespace content_json.awcmsAstro dengan schemaVersion, Integrasi awcms-astro → awcms, Jaminan konten yang paling berisiko hilang saat migrasi, Pemetaan model data ke awcms_blog_posts, Urutan migrasi delapan langkah, Batas keras: yang boleh dan tidak boleh diputuskan BFF, Divergence yang disengaja dari keluarga AWCMS (+2 more)

### Community 35 - "Layout dasar dan kartu share"
Cohesion: 0.24
Nodes (8): ADR-0026, alternates, jsonLd, locale, metaDescription, ogLocale, KartuShare, kartuSitus()

### Community 36 - "Seni lokal dan pin runtime"
Cohesion: 0.20
Nodes (10): Unit Test dengan bun:test, Pin Versi Bun di Tiga Tempat, Runtime Bun, import.meta.glob dengan query: "?url", src/components/Ilustrasi.astro, Konvensi Nama Seni (hero, tab/<tab>, artikel/<tab>/<slug>), Seni Lokal di src/assets/, Tanpa Fallback dari Artikel ke Seni Seksinya (+2 more)

### Community 37 - "Traversal feed build dan terjemahan"
Cohesion: 0.20
Nodes (10): BlogPostSummary — bentuk ringkasan daftar post, Build feed GET /api/v1/blog/posts?view=full, Kelas cacat: build hijau yang menerbitkan situs kosong, Gerbang terjemahan atas translationGroupId, Traversal cursor keyset ?order=created_at, Filter ?locale= di feed awcms — bukan optimasi, kegagalan, Fitur di atas kontrak yang belum stabil harus ditulis dua kali, Gerbang NOL dari N id Resolve = Build Gagal (+2 more)

### Community 38 - "Penahanan pengembangan dan layar admin"
Cohesion: 0.20
Nodes (10): Seluruh layar admin dibangun di awcms di bawah satu shell /admin/*, Memindahkan layar tidak pernah menjadi kontrol keamanan, Dua indikator pencabutan penahanan (bukan gerbang otomatis), Penahanan pengembangan — dua kelas yang masih boleh mendarat, Batas: "Sudah Ada Endpoint-nya" Bukan Jawaban "Tidak", Uji: Apakah Perubahan Ini Akan Ditulis Ulang Bila awcms Berubah?, BFF Portal Jualanku Masih Ditahan oleh Uji ADR-0023, Kanal Dukungan awcms-astro (+2 more)

### Community 39 - "Pemeriksa sinkron lockfile"
Cohesion: 0.25
Nodes (8): ADR-0015, bacaJsonc(), BLOK_DEPENDENCY, buangTrailingComma(), lock, masalah, pkg, repoRoot

### Community 40 - "Tiruan awcms dalam pengujian"
Cohesion: 0.36
Nodes (8): Kontrak integrasi awcms-astro ↔ awcms, Penolakan awcms yang WAJIB ditiru di tiruan tes, Traversal build feed: view=full + order=created_at + cursor, Diam-diam memotong data adalah kegagalan, bukan optimasi, Tenant datang dari token; AWCMS_TENANT_ID adalah assertion, Predikat terbit awcms ditiru, dengan toleransi condong jam 15 menit, Filter ?locale= awcms sudah ada dan justru TIDAK boleh dipakai, Tenant: satu variabel dan satu pernyataan yang diverifikasi

### Community 41 - "Konfigurasi build Astro"
Cohesion: 0.36
Nodes (7): LOCALE_PREFIXES, ADR-0014, ADR-0016, ADR-0035, neutralPath(), serialize(), SITE

### Community 42 - "Resolusi tenant dari token"
Cohesion: 0.32
Nodes (7): ADR-0022, ADR-0054, ADR-0049, refuseRetiredVariables(), resolveTenant(), TenantResolution, toUuid()

### Community 43 - "Ikon merek lampu lalu lintas"
Cohesion: 0.39
Nodes (8): Rounded Square Icon Backdrop (64x64, rx=14), Sky-to-Emerald Brand Palette (Tailwind-family hues), Diagonal Blue-to-Green Linear Gradient (id=f), Favicon Brand Mark (Traffic Light App Icon), Three Stacked Signal Lamps (red, amber, green), Red/Amber/Green Status Color Semantics, Traffic Light Housing Glyph (dark pill, 85% opacity), Traffic Signal Motif (lampu lalu lintas)

### Community 44 - "Header respons dan feed Atom"
Cohesion: 0.29
Nodes (7): img-src ditanyakan, tidak disalin, server/penyaji.mjs satu-satunya tempat header respons ditentukan, Tidak ada JavaScript di dalam HTML, Content-Type application/atom+xml dipasang penyaji (tipeIsi), Feed membawa RINGKASAN, bukan isi artikel, Header respons dan selisihnya dari awcms, CSP ketat yang benar-benar dikirim, bukan 'siap CSP'

### Community 45 - "Konfigurasi TypeScript ketat"
Cohesion: 0.29
Nodes (6): astro/tsconfigs/strict, compilerOptions, jsx, jsxImportSource, moduleResolution, extends

### Community 46 - "Uji gerbang audit dokumen"
Cohesion: 0.33
Nodes (3): pohon(), pohonKilau(), sementara

### Community 47 - "Kejujuran klaim kepatuhan"
Cohesion: 0.40
Nodes (6): Aturan tanpa pemeriksanya adalah aturan yang akan dilanggar, Sembilan celah dicatat sebagai celah, dengan pemeriksanya masing-masing, ADR-0031 — SBOM CycloneDX diturunkan dari bun.lock pada setiap rilis, Kesegaran sbom.cdx.json di pohon kerja sengaja TIDAK digerbangi, ADR-0032 — Dua celah terakhir ADR-0028 ditutup dengan syarat kejujurannya, CodeQL atas permukaan JS/TS dengan cakupan yang dihitung, bukan diklaim

### Community 48 - "Asal media dan resolusinya"
Cohesion: 0.50
Nodes (3): asalMediaPublik, ObjekMedia, resolveObjekMedia()

### Community 49 - "Uji build rilis terkondisi"
Cohesion: 0.40
Nodes (4): ci, ADR-0030, ADR-0031, perilis

### Community 50 - "Uji pin versi toolchain"
Cohesion: 0.40
Nodes (4): ci, dockerfile, pkg, VERSI

### Community 51 - "Template versus situs turunan"
Cohesion: 0.50
Nodes (4): Konten situs tinggal di instans awcms, bukan di repo template, Checklist "Yang tidak gagal sendiri", Repo ini template, bukan sebuah situs — cacat ikut ke setiap turunannya, Prinsip: cacat di sini tidak muncul sekali

### Community 52 - "Pedoman perilaku kontributor"
Cohesion: 0.50
Nodes (4): Contributor Covenant versi 2.1, Komitmen partisipasi bebas pelecehan, Pedoman Perilaku, Kontribusi penutur asli dihargai sebagai keahlian

### Community 53 - "Alur kontribusi dan keputusan"
Cohesion: 0.50
Nodes (4): Alur kontribusi — issue, branch, scope atomic, changeset, PR, Konvensi commit dan penamaan branch, ADR yang ditolak tetap disimpan berstatus Ditolak, Alur keputusan — usul, ADR, branch, gerbang, review, rilis

### Community 54 - "Kredensial mesin dan tenant terbit"
Cohesion: 0.67
Nodes (4): AWCMS_TENANT_ID sebagai asersi, bukan sumber tenant, Kredensial mesin awcmsm_<tenant>_<rahasia>, Tenant DEFAULT (owner) sebagai tenant yang diterbitkan, Tenant platform dan mode ketenanan single/multi

## Ambiguous Edges - Review These
- `Three Stacked Signal Lamps (red, amber, green)` → `Sky-to-Emerald Brand Palette (Tailwind-family hues)`  [AMBIGUOUS]
  public/favicon.svg · relation: conceptually_related_to

## Knowledge Gaps
- **275 isolated node(s):** `temuan`, `catatan`, `dirKeluaran`, `jalurGraf`, `jalurLaporan` (+270 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **12 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **What is the exact relationship between `Three Stacked Signal Lamps (red, amber, green)` and `Sky-to-Emerald Brand Palette (Tailwind-family hues)`?**
  _Edge tagged AMBIGUOUS (relation: conceptually_related_to) - confidence is low._
- **Why does `ADR-0014 — Rendering campuran dan BFF portal Jualanku` connect `BFF portal Jualanku yang ditahan` to `Runtime Bun dan pelepasan nginx`?**
  _High betweenness centrality (0.342) - this node is a cross-community bridge._
- **Why does `awcmsGet()` connect `Klien HTTP awcms` to `Asal media dan resolusinya`, `Kontrak konten dari awcms`, `BFF portal Jualanku yang ditahan`?**
  _High betweenness centrality (0.298) - this node is a cross-community bridge._
- **Why does `Experience layer Jualanku.info` connect `BFF portal Jualanku yang ditahan` to `Klien HTTP awcms`?**
  _High betweenness centrality (0.296) - this node is a cross-community bridge._
- **Are the 6 inferred relationships involving `Lima gerbang awcms-astro` (e.g. with `Menurunkan situs baru dari template awcms-astro` and `Definition of Done awcms-astro`) actually correct?**
  _`Lima gerbang awcms-astro` has 6 INFERRED edges - model-reasoned connections that need verification._
- **Are the 2 inferred relationships involving `Standar Teknis awcms-astro` (e.g. with `Satu rasio (--ratio-visual) untuk seluruh situs` and `Kontrol yang sengaja TIDAK diadopsi`) actually correct?**
  _`Standar Teknis awcms-astro` has 2 INFERRED edges - model-reasoned connections that need verification._
- **What connects `temuan`, `catatan`, `dirKeluaran` to the rest of the system?**
  _275 weakly-connected nodes found - possible documentation gaps or missing edges._