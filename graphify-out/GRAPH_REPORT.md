# Graph Report - /home/data/dev_bun/awcms-astro  (2026-08-06)

## Corpus Check
- 31 files · ~112,545 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 851 nodes · 1370 edges · 66 communities (58 shown, 8 thin omitted)
- Extraction: 93% EXTRACTED · 7% INFERRED · 0% AMBIGUOUS · INFERRED: 93 edges (avg confidence: 0.85)
- Token cost: 489,330 input · 0 output

## Community Hubs (Navigation)
- Dependency dan skrip proyek
- Klien awcms, tenant, dan media
- Pengambilan dan render blok konten
- Gerbang audit graf dan tesnya
- Gerbang audit konten
- Gerbang audit dokumen
- Kontrak BFF Jualanku dan rantai deploy Coolify
- Penyaji Bun dan headernya
- Design system dan kontrak adapter integrasi
- Rute berprefiks locale dan pengalihnya
- Seni lokal, CSP ketat, dan pin runtime Bun
- Komponen badan artikel dan layout-nya
- Kontrak kerja, peran repo, dan katalog skill
- ADR-0014 dan rencana porting Jualanku
- Gambar artikel dan seni lokal
- Kontrak build feed dan aturan struktur konten
- Tabel celah ADR-0028 dan pemeriksanya
- Core Web Vitals lab dan kontrol yang ditolak
- Keputusan runtime, cache, dan layar admin
- Lima gerbang dan Definition of Done
- BaseLayout, metadata, dan kartu share
- Halaman tab dan beranda
- Gerbang atas gerbang audit konten
- Asal tenant dan standar bernama yang diikat
- ADR-0030 — aturan tertulis mendapat pemeriksanya
- Skrip rilis
- Kanal dukungan dan uji ADR-0023
- HSTS produksi dan checklist repo baru
- Generator SBOM dan pemeriksanya
- Katalog PO dan parsernya
- JSON-LD schema dan identitas situs
- CodeQL dan cakupan yang dinyatakan
- Menurunkan situs baru dan pin versi Bun
- Uji sebelum memulai dan backlog eksplisit
- Jebakan situs turunan dan checklist go-live
- Kebijakan keamanan, changeset, dan tata kelola
- SBOM CycloneDX dan batas stack yang dilarang
- Gambar artikel dan kartu share dari media awcms
- Prosedur performa dan keamanan di skill
- Penahanan selesai dan indeks ADR
- Job CI terkondisi dan pemicu rebuild
- Gerbang lockfile
- Aturan aset gambar dan rasio sumber
- Peta situs dan remah navigasi
- Tiga permukaan awcms yang dipanggil build
- Header respons dan selisih COOP/CORP dari awcms
- Lambang favicon lampu lalu lintas
- Aksesibilitas WCAG dan cara memakai dokumen standar
- Konfigurasi TypeScript
- Gerbang atas gerbang audit dokumen
- Rute artikel dan getStaticPaths-nya
- Gerbang analisis statik CodeQL
- Gerbang Core Web Vitals lab
- Gerbang versi toolchain
- Pedoman perilaku kontributor
- Alur kontribusi dan alur keputusan
- Endpoint robots.txt
- Gerbang CSP atas keluaran build
- Dependabot ekosistem bun
- Pelaporan kerentanan lewat advisory
- Penegakan dan kerahasiaan pelapor
- Pengecualian TypeScript 7 di Dependabot
- Jaring pengaman rebuild harian
- Gambar sosial bawaan

## God Nodes (most connected - your core abstractions)
1. `t()` - 19 edges
2. `scripts` - 16 edges
3. `siteConfig` - 13 edges
4. `getArticles()` - 13 edges
5. `awcms-astro — Standar Performa dan Keamanan` - 13 edges
6. `AGENTS.md — kontrak kerja awcms-astro` - 12 edges
7. `Tabel celah — kesepuluhnya ditutup dan barisnya TETAP di sini` - 12 edges
8. `ADR-0014 — Rendering campuran dan BFF portal Jualanku` - 11 edges
9. `Memulai situs baru di atas awcms-astro` - 11 edges
10. `Lima gerbang awcms-astro` - 11 edges

## Surprising Connections (you probably didn't know these)
- `Experience layer Jualanku.info` --references--> `awcmsGet()`  [INFERRED]
  docs/adr/0014-rendering-campuran-dan-bff-portal.md → src/lib/awcms/client.ts
- `Prioritas: Cacat yang Tidak Menggagalkan Build` --semantically_similar_to--> `ADR-0018 — Kontrak build terhadap awcms: tenant dari token mesin, traversal cursor, gerbang terjemahan`  [INFERRED] [semantically similar]
  SUPPORT.md → docs/adr/0018-kontrak-build-token-mesin-dan-traversal-konten.md
- `Aturan punya penegak` --semantically_similar_to--> `Aturan baru wajib membawa pemeriksanya`  [INFERRED] [semantically similar]
  docs/awcms-astro/README.md → .claude/skills/awcms-astro-gerbang/SKILL.md
- `Pemeriksa yang hanya benar untuk repo INI tidak boleh tinggal di skrip` --semantically_similar_to--> `Aturan konfigurasi — site.ts + .env satu-satunya tempat konfigurasi`  [INFERRED] [semantically similar]
  .claude/skills/awcms-astro-gerbang/SKILL.md → AGENTS.md
- `"Tanpa runtime server" BUKAN bagian dari klaim` --semantically_similar_to--> `Syarat kejujuran klaim kepatuhan (ADR-0032)`  [INFERRED] [semantically similar]
  SECURITY.md → .claude/skills/awcms-astro-performa-keamanan/SKILL.md

## Import Cycles
- None detected.

## Hyperedges (group relationships)
- **Lima gerbang awcms-astro yang tiap satunya menangkap kelas cacat yang tidak menggagalkan apa pun** — _claude_skills_awcms_astro_gerbang_skill_gerbang_check, _claude_skills_awcms_astro_gerbang_skill_gerbang_bun_test, _claude_skills_awcms_astro_gerbang_skill_gerbang_audit_konten, _claude_skills_awcms_astro_gerbang_skill_gerbang_audit_dokumen, _claude_skills_awcms_astro_gerbang_skill_gerbang_audit_graf [EXTRACTED 1.00]
- **Penutupan celah ADR-0028 disertai syarat kejujuran cakupan** — _claude_skills_awcms_astro_performa_keamanan_skill_sembilan_celah, _claude_skills_awcms_astro_performa_keamanan_skill_syarat_kejujuran_klaim, _github_workflows_codeql_analyze, _github_workflows_codeql_nyatakan_cakupan, _github_workflows_ci_lighthouse_cwv_lab, security_daftar_celah_sengaja_publik [EXTRACTED 1.00]
- **Aturan wajib membawa pemeriksanya — pola lintas dokumen, gerbang, dan CI** — _claude_skills_awcms_astro_gerbang_skill_aturan_baru_wajib_membawa_pemeriksanya, _claude_skills_awcms_astro_gerbang_skill_empat_aturan_tanpa_pemeriksa, _claude_skills_awcms_astro_gerbang_skill_sebelas_dokumen_menyatakan_yang_tidak_ada, agents_versi_bun_tiga_berkas_lima_nilai, _claude_skills_readme_skill_digerbangi_audit_dokumen, docs_awcms_astro_readme_aturan_punya_penegak [INFERRED 0.85]
- **Kontrak build awcms-astro terhadap awcms (tenant, traversal, terjemahan)** — docs_adr_0018_kontrak_build_token_mesin_dan_traversal_konten_kredensial_mesin_awcms, docs_adr_0018_kontrak_build_token_mesin_dan_traversal_konten_asersi_awcms_tenant_id, docs_adr_0018_kontrak_build_token_mesin_dan_traversal_konten_traversal_cursor_keyset, docs_adr_0018_kontrak_build_token_mesin_dan_traversal_konten_build_feed_view_full, docs_adr_0018_kontrak_build_token_mesin_dan_traversal_konten_gerbang_terjemahan_translationgroupid, docs_adr_0022_situs_menerbitkan_tenant_default_awcms_tenant_default_owner [EXTRACTED 1.00]
- **Lima gerbang menegakkan Definition of Done lintas AGENTS, PR template, CONTRIBUTING, dan CI** — _claude_skills_awcms_astro_gerbang_skill_lima_gerbang, agents_definition_of_done, _github_pull_request_template_definition_of_done, contributing_definition_of_done, _github_workflows_ci_job_check [INFERRED 0.85]
- **Siklus Penahanan Pengembangan: Ditahan, Dipersempit, Selesai** — docs_adr_0020_layar_admin_kembali_ke_awcms_adr_0020, docs_adr_0021_tahan_pengembangan_menunggu_fondasi_awcms_adr_0021, docs_adr_0023_penahanan_dipersempit_pekerjaan_tanpa_awcms_adr_0023, docs_adr_0027_penahanan_adr_0021_selesai_adr_0027 [EXTRACTED 1.00]
- **Rantai Gambar Artikel: Seni Lokal, Media awcms, Kartu Share, dan img-src** — docs_adr_0024_seni_lokal_di_src_assets_seni_lokal_src_assets, docs_adr_0025_gambar_artikel_dari_media_awcms_resolusi_media_sekali_per_build, docs_adr_0025_gambar_artikel_dari_media_awcms_img_src_ditanyakan, docs_adr_0026_kartu_share_per_artikel_dari_media_awcms_seo_image_media_id, docs_adr_0019_csp_ketat_dikirim_penyaji_content_security_policy_ketat [EXTRACTED 1.00]
- **Postur Runtime & Header: Bun-only dari Dev sampai Produksi di Satu Lapisan** — docs_adr_0015_runtime_bun_menutup_divergence_keluarga_runtime_bun, docs_adr_0016_penyajian_bun_di_belakang_traefik_tanpa_nginx_penyaji_bun, docs_adr_0016_penyajian_bun_di_belakang_traefik_tanpa_nginx_aturan_cache_html_dan_aset_astro, docs_adr_0019_csp_ketat_dikirim_penyaji_content_security_policy_ketat, docs_adr_0019_csp_ketat_dikirim_penyaji_permissions_policy [EXTRACTED 1.00]
- **Empat aturan tertulis yang akhirnya mendapat pemeriksanya** — docs_awcms_astro_standar_teknis_aturan_baru_wajib_membawa_pemeriksanya, docs_adr_0030_aturan_tertulis_mendapat_pemeriksanya_versi_toolchain_test, docs_adr_0030_aturan_tertulis_mendapat_pemeriksanya_kontrak_awcms_test, docs_adr_0030_aturan_tertulis_mendapat_pemeriksanya_perilis_menjalankan_gerbang, docs_adr_0030_aturan_tertulis_mendapat_pemeriksanya_pin_sha_dan_digest [EXTRACTED 1.00]
- **Sepuluh celah standar performa dan keamanan, masing-masing dengan pemeriksanya** — docs_awcms_astro_standar_performa_dan_keamanan_tabel_celah, docs_awcms_astro_standar_performa_dan_keamanan_hsts_tanpa_includesubdomains, docs_awcms_astro_standar_performa_dan_keamanan_celah_2_fetchpriority_hero, docs_awcms_astro_standar_performa_dan_keamanan_celah_3_anggaran_gambar_tanpa_pemeriksa, docs_awcms_astro_standar_performa_dan_keamanan_celah_4_awcmsget_tanpa_batas_waktu, docs_awcms_astro_standar_performa_dan_keamanan_celah_5_header_pembocor_teknologi, docs_awcms_astro_standar_performa_dan_keamanan_celah_6_pin_rantai_pasok, docs_awcms_astro_standar_performa_dan_keamanan_celah_7_analisis_statik, docs_awcms_astro_standar_performa_dan_keamanan_celah_8_core_web_vitals_tidak_diukur, docs_awcms_astro_standar_performa_dan_keamanan_celah_9_sbom_rilis, docs_awcms_astro_standar_performa_dan_keamanan_celah_10_pemeriksa_tak_pernah_dieksekusi [EXTRACTED 1.00]
- **Lima kontrol standar yang sengaja ditolak beserta alasannya** — docs_awcms_astro_standar_performa_dan_keamanan_yang_sengaja_tidak_diadopsi, docs_awcms_astro_standar_performa_dan_keamanan_penolakan_pelaporan_csp, docs_awcms_astro_standar_performa_dan_keamanan_penolakan_corp_menyeluruh, docs_awcms_astro_standar_performa_dan_keamanan_penolakan_sri, docs_awcms_astro_standar_performa_dan_keamanan_penolakan_rum_analytics, docs_awcms_astro_standar_performa_dan_keamanan_penolakan_rate_limiting_waf [EXTRACTED 1.00]
- **Aturan aset gambar awcms-astro (empat dari cacat nyata, dua tetap manual)** — docs_awcms_astro_standar_teknis_aset_gambar, docs_awcms_astro_standar_teknis_aturan_rasio_sumber_sama_dengan_bingkai, docs_awcms_astro_standar_teknis_format_dibaca_dari_isi_berkas, docs_awcms_astro_standar_teknis_teks_dalam_gambar_hanya_label_topik, docs_awcms_astro_standar_teknis_tanpa_lambang_instansi_negara, docs_awcms_astro_standar_teknis_dua_aturan_gambar_tetap_manual, docs_awcms_astro_standar_teknis_gambar_import_meta_glob [EXTRACTED 1.00]

## Communities (66 total, 8 thin omitted)

### Community 0 - "Dependency dan skrip proyek"
Cohesion: 0.04
Nodes (45): astro, @astrojs/check, @astrojs/node, @astrojs/sitemap, compression, dependencies, astro, @astrojs/check (+37 more)

### Community 1 - "Klien awcms, tenant, dan media"
Cohesion: 0.09
Nodes (25): ADR-0022, ADR-0054, ADR-0019, AwcmsApiError, awcmsGet(), baseUrl(), batasWaktuMs(), describeTenantResolution() (+17 more)

### Community 2 - "Pengambilan dan render blok konten"
Cohesion: 0.11
Nodes (30): ADR-0024, resolveObjekMedia(), assertFeedReturnedFullRows(), assertTranslationsArePairable(), AwcmsAstroBlock, AwcmsBlogPost, AwcmsBlogPostSummary, ALLOWED_HEADING_LEVELS (+22 more)

### Community 3 - "Gerbang audit graf dan tesnya"
Cohesion: 0.09
Nodes (27): engines, bun, ARTEFAK_TERLACAK, auditArtefakTerlacak(), auditLabelKomunitas(), auditLaporanSepakat(), auditPengecualian(), catatan (+19 more)

### Community 4 - "Gerbang audit konten"
Cohesion: 0.12
Nodes (24): auditAnggaranGambar(), auditGambar(), auditKeluaran(), auditPrioritasGambar(), auditSvg(), bandingkanRasio(), berkasUntuk(), catatan (+16 more)

### Community 5 - "Gerbang audit dokumen"
Cohesion: 0.12
Nodes (28): ADR-0014, ADR-0042, ADR-0062, antaraPenanda(), auditIndeksAdr(), auditJalurDisebut(), auditKutipanAdr(), auditPermukaanKilau() (+20 more)

### Community 6 - "Kontrak BFF Jualanku dan rantai deploy Coolify"
Cohesion: 0.10
Nodes (27): Envelope { success, data } dan tenant diresolusi sisi server, 01 — Arsitektur experience layer Jualanku, Perbedaan variabel build-time vs request-time, Jalur rollback ke build statis penuh, Matriks rendering rute Jualanku, Static-by-default dengan rute on-demand di-opt-out satu per satu, Alur sesi portal /_portal-api/auth, Aturan cookie dan CSRF portal (+19 more)

### Community 7 - "Penyaji Bun dan headernya"
Cohesion: 0.14
Nodes (21): LOCALE_PREFIXES, ADR-0014, ADR-0016, neutralPath(), serialize(), SITE, ASAL_MEDIA, asalMediaTerkonfigurasi() (+13 more)

### Community 8 - "Design system dan kontrak adapter integrasi"
Cohesion: 0.13
Nodes (22): Empat aturan yang wajib dipertahankan adapter API, content_json bernamespace awcmsAstro dengan schemaVersion, Integrasi awcms-astro → awcms, Jaminan konten yang paling berisiko hilang saat migrasi, Kontrak adapter LocalizedArticle, Modul awcms yang relevan bagi situs statis, Pemetaan model data ke awcms_blog_posts, Urutan migrasi delapan langkah (+14 more)

### Community 9 - "Rute berprefiks locale dan pengalihnya"
Cohesion: 0.14
Nodes (10): getLocaleFromPath(), isLocale(), localeMeta, locales, prefixedLocales, siteUrl, socialImageRaw, stripLocale() (+2 more)

### Community 10 - "Seni lokal, CSP ketat, dan pin runtime Bun"
Cohesion: 0.11
Nodes (21): Unit Test dengan bun:test, Pin Versi Bun di Tiga Tempat, Runtime Bun, Adapter @astrojs/node Mode standalone Dijalankan Bun, Penyaji Bun (server/penyaji.mjs), vite.build.assetsInlineLimit: 0, Content-Security-Policy Ketat, JSON-LD adalah Blok Data, Bukan Skrip (+13 more)

### Community 11 - "Komponen badan artikel dan layout-nya"
Cohesion: 0.12
Nodes (13): locale, locale, locale, articleVisual, breadcrumbItems, canonicalUrl, DateTimeFormatOptions, locale (+5 more)

### Community 12 - "Kontrak kerja, peran repo, dan katalog skill"
Cohesion: 0.13
Nodes (19): Sebelas dokumen yang menyatakan sesuatu yang tidak ada, Resolusi media dan kartu share sekali per build, Jangan menjawab pertanyaan kepatuhan dari ingatan, Empat skill, bukan lima puluh, Katalog skill proyek awcms-astro, Dua aturan gambar yang tidak bisa diperiksa mesin, Aturan gambar — dua sumber, satu rasio, format dari isi berkas, AGENTS.md — kontrak kerja awcms-astro (+11 more)

### Community 13 - "ADR-0014 dan rencana porting Jualanku"
Cohesion: 0.13
Nodes (18): ADR-0014 — Rendering campuran dan BFF portal Jualanku, ADR-0045 awcms — Jualanku porting, awcms system of record, Astro BFF, Alternatif ditolak: portal SPA memanggil awcms langsung, Alternatif ditolak: seluruh situs output 'server', BFF hanya orkestrasi dan proyeksi, Experience layer Jualanku.info, Jalur rollback build statis penuh, Kontrak sesi portal (+10 more)

### Community 14 - "Gambar artikel dan seni lokal"
Cohesion: 0.20
Nodes (12): ADR-0021, ArticleVisual, getArticleImage(), getTabImage(), heroImage, MODUL, SENI, LocalizedArticle (+4 more)

### Community 15 - "Kontrak build feed dan aturan struktur konten"
Cohesion: 0.13
Nodes (17): BlogPostSummary — bentuk ringkasan daftar post, Build feed GET /api/v1/blog/posts?view=full, Kelas cacat: build hijau yang menerbitkan situs kosong, Gerbang terjemahan atas translationGroupId, Traversal cursor keyset ?order=created_at, Filter ?locale= di feed awcms — bukan optimasi, kegagalan, Fitur di atas kontrak yang belum stabil harus ditulis dua kali, Aturan arah satu arah: konten tidak tahu komponen, komponen tidak mengambil datanya sendiri (+9 more)

### Community 16 - "Tabel celah ADR-0028 dan pemeriksanya"
Cohesion: 0.19
Nodes (17): Aturan tanpa pemeriksanya adalah aturan yang akan dilanggar, Sembilan celah dicatat sebagai celah, dengan pemeriksanya masing-masing, ADR-0031 — SBOM CycloneDX diturunkan dari bun.lock pada setiap rilis, Kesegaran sbom.cdx.json di pohon kerja sengaja TIDAK digerbangi, ADR-0032 — Dua celah terakhir ADR-0028 ditutup dengan syarat kejujurannya, CodeQL atas permukaan JS/TS dengan cakupan yang dihitung, bukan diklaim, Kriteria kapan sebuah perubahan butuh ADR, Celah 10 — pemeriksa celah 2 dan 3 tidak pernah dieksekusi di repo tempat ia ditulis (+9 more)

### Community 17 - "Core Web Vitals lab dan kontrol yang ditolak"
Cohesion: 0.17
Nodes (17): Target Core Web Vitals ditulis sebagai target (LCP/INP/CLS), Core Web Vitals lab, terkondisi sumber konten, RUM ditolak permanen — larangan mengumpulkan data pembaca, Sampel Lighthouse: batas cakupan dipilih, bukan diwarisi, TBT ≤ 200 ms sebagai proksi INP yang DISEBUT proksi, Celah 8 — Core Web Vitals tidak diukur, Core Web Vitals p75 kunjungan nyata (LCP · INP · CLS), Pelaporan CSP (report-to / report-uri) — ditolak (+9 more)

### Community 18 - "Keputusan runtime, cache, dan layar admin"
Cohesion: 0.14
Nodes (16): ADR-0015 — Repo Memakai Bun sebagai Runtime dan Package Manager, bun.lock sebagai Satu-satunya Lockfile, scripts/cek-lockfile.mjs, Larangan Script Bernama Sama dengan Biner yang Dipanggilnya, ADR-0016 — Bun Menyajikan Keluaran Build di Belakang Traefik; nginx Dilepas, Aturan Cache: HTML must-revalidate, /_astro/ immutable, nginx Dilepas dari Stack, output: "static" TIDAK Berubah (+8 more)

### Community 19 - "Lima gerbang dan Definition of Done"
Cohesion: 0.19
Nodes (15): Gerbang `bun run audit:dokumen` — markdown repo ini, Gerbang `bun run audit:graf` — artefak graphify-out/, Gerbang `bun run check` — lockfile + astro check, Kesegaran graf dilaporkan, tidak pernah dimerahkan, Lima gerbang awcms-astro, Penanda kutipan ADR milik repo lain, PROSA tidak bisa digerbangi — gerbang membaca struktur, Yang WAJIB dikosongkan sebelum commit pertama (+7 more)

### Community 20 - "BaseLayout, metadata, dan kartu share"
Cohesion: 0.18
Nodes (11): ADR-0026, localePath(), swapLocalePath(), tabTitleKey(), alternates, jsonLd, locale, metaDescription (+3 more)

### Community 21 - "Halaman tab dan beranda"
Cohesion: 0.17
Nodes (6): locale, number, schema, siteConfig, TabSlug, getArticleVisual()

### Community 22 - "Gerbang atas gerbang audit konten"
Cohesion: 0.15
Nodes (8): halaman(), ADR-0028, ADR-0032, pohon(), sementara, situs(), SKRIP, SUMBER

### Community 23 - "Asal tenant dan standar bernama yang diikat"
Cohesion: 0.19
Nodes (14): AWCMS_TENANT_ID sebagai asersi, bukan sumber tenant, Kredensial mesin awcmsm_<tenant>_<rahasia>, Tenant DEFAULT (owner) sebagai tenant yang diterbitkan, Tenant platform dan mode ketenanan single/multi, ISO/IEC 27001:2022 Annex A — kontrol yang menyentuh kode, OWASP API Security Top 10 2023 — dinyatakan TIDAK BERLAKU, OWASP Top 10 — edisi 2021, RFC 5861 stale-while-revalidate — sengaja TIDAK dipakai (+6 more)

### Community 24 - "ADR-0030 — aturan tertulis mendapat pemeriksanya"
Cohesion: 0.18
Nodes (13): AWCMS_TENANT_CODE ditolak, bukan diabaikan, Verifikasi tenant lewat jaringan ditolak, ADR-0028 — Postur performa dan keamanan diikat ke standar yang disebut namanya, Lima kontrol yang ditolak, ditolak secara tertulis, ADR-0030 — Empat aturan yang sudah tertulis mendapat pemeriksanya; rantai pasok dipin ke SHA, Lima nilai versi Bun yang wajib sepakat, Perilis menjalankan bun test dan bun audit sesudah build (§C), Rantai pasok dipin ke SHA commit dan digest image (§B) (+5 more)

### Community 25 - "Skrip rilis"
Cohesion: 0.15
Nodes (11): apply, args, body, commit, ketemu, level, [major, minor, patch], ADR-0028 (+3 more)

### Community 26 - "Kanal dukungan dan uji ADR-0023"
Cohesion: 0.17
Nodes (12): Seluruh layar admin dibangun di awcms di bawah satu shell /admin/*, Memindahkan layar tidak pernah menjadi kontrol keamanan, Dua indikator pencabutan penahanan (bukan gerbang otomatis), Penahanan pengembangan — dua kelas yang masih boleh mendarat, Batas: "Sudah Ada Endpoint-nya" Bukan Jawaban "Tidak", Uji: Apakah Perubahan Ini Akan Ditulis Ulang Bila awcms Berubah?, BFF Portal Jualanku Masih Ditahan oleh Uji ADR-0023, Indeks yang salah lebih buruk daripada tidak ada indeks (+4 more)

### Community 27 - "HSTS produksi dan checklist repo baru"
Cohesion: 0.20
Nodes (12): ADR-0029 — HSTS dikirim penyaji, digerbangi produksi, tanpa includeSubDomains, headerKeamanan(produksi) — fungsi murni pemilik header di server/penyaji.mjs, HSTS digerbangi NODE_ENV === "production" (§A), Server / X-Powered-By dihapus, bukan sekadar diasersi (§D), Tiga asersi mutation-proven di tests/penyaji.test.mjs (§C), Memulai situs baru di atas awcms-astro, Gerbang audit yang wajib tetap hijau di situs turunan, Yang harus dikosongkan sebelum commit pertama (+4 more)

### Community 28 - "Generator SBOM dan pemeriksanya"
Cohesion: 0.23
Nodes (10): buangTrailingComma(), ADR-0028, ADR-0031, repoRoot, susunPurl(), susunSbom(), lock, ADR-0030 (+2 more)

### Community 29 - "Katalog PO dan parsernya"
Cohesion: 0.21
Nodes (6): locale, catalogs, Catalog, parsePo(), readQuoted(), rawCatalogs

### Community 30 - "JSON-LD schema dan identitas situs"
Cohesion: 0.23
Nodes (11): getSiteUrl(), Locale, localeHtmlLang, articleSchema(), ArticleSchemaInput, collectionSchema(), imageObject(), PUBLISHER_ID (+3 more)

### Community 31 - "CodeQL dan cakupan yang dinyatakan"
Cohesion: 0.24
Nodes (11): Aturan baru wajib membawa pemeriksanya, Empat aturan yang tertulis TANPA pemeriksa, Batas waktu awcmsGet (AbortSignal.timeout, 30 detik), Sembilan celah bernomor ADR-0028 — seluruhnya tertutup, Syarat kejujuran klaim kepatuhan (ADR-0032), Action GitHub dipin ke SHA commit, bukan tag, CodeQL job analyze (javascript-typescript), Batas: berkas .astro tidak teranalisis statik (+3 more)

### Community 32 - "Menurunkan situs baru dan pin versi Bun"
Cohesion: 0.22
Nodes (11): Pemeriksa yang hanya benar untuk repo INI tidak boleh tinggal di skrip, Menurunkan situs baru dari template awcms-astro, Urutan kontrak → konten → tampilan, Skill ikut tersalin ke situs turunan lewat template repository, Konten situs tinggal di instans awcms, bukan di repo template, Checklist "Yang tidak gagal sendiri", bun-version dipin di dua job CI, Aturan konfigurasi — site.ts + .env satu-satunya tempat konfigurasi (+3 more)

### Community 33 - "Uji sebelum memulai dan backlog eksplisit"
Cohesion: 0.20
Nodes (11): Diam-diam memotong data adalah kegagalan, bukan optimasi, Traversal build feed (view=full + order=created_at + cursor), Uji ADR-0023 — apakah perubahan ini ditulis ulang bila awcms berubah?, Berpindah ke SSR — output static adalah premis, bukan default, BFF portal Jualanku (ADR-0014) — satu-satunya permukaan terautentikasi, Satu uji sebelum memulai apa pun (ADR-0027 menggantikan ADR-0021), Batas keras: yang boleh dan tidak boleh diputuskan BFF, Divergence yang disengaja dari keluarga (tanpa basis data) (+3 more)

### Community 34 - "Jebakan situs turunan dan checklist go-live"
Cohesion: 0.20
Nodes (11): Anggaran gambar per halaman (beranda 250 KB, konten 100 KB), Checklist sebelum go-live situs turunan, Jebakan yang paling sering terjadi di situs turunan, Template issue: Laporan bug, Aturan antarmuka — tanpa JS, WCAG 2.1 AA, katalog PO, tanpa gaya/skrip inline, Rantai fallback t() berujung di NAMA KEY, Terjemahan katalog PO — key masuk ke seluruh locale, CSP ketat yang benar-benar dikirim, bukan sekadar siap CSP (+3 more)

### Community 35 - "Kebijakan keamanan, changeset, dan tata kelola"
Cohesion: 0.20
Nodes (11): Aturan keamanan — tanpa HTML mentah dari CMS, tanpa skrip pihak ketiga, Changeset dilipat skrip rilis, bukan disunting tangan, CHANGELOG — riwayat rilis, Panduan Kontribusi, Batas etis ditulis sebagai aturan teknis, bukan imbauan, Perubahan yang tidak boleh diambil sendiri, Rilis — wewenang maintainer lewat bun run release, Bukan kerentanan keamanan — koreksi konten dan situs peniru (+3 more)

### Community 36 - "SBOM CycloneDX dan batas stack yang dilarang"
Cohesion: 0.20
Nodes (11): MAX_PAGES — penahan loop yang melempar, bukan mengembalikan sebagian, Jangkar standar dinyatakan beserta edisinya, CycloneDX 1.5 JSON, bukan SPDX, SBOM deterministik — bisa diverifikasi, bukan hanya dipercaya, Generator ditulis sendiri, tanpa dependency baru, Celah 9 — tidak ada SBOM pada rilis, Content-Security-Policy ketat dikirim penyaji, NIST SSDF SP 800-218 v1.1 — PS/PW/RV (+3 more)

### Community 37 - "Gambar artikel dan kartu share dari media awcms"
Cohesion: 0.27
Nodes (11): ADR-0019 — CSP Ketat Dikirim Penyaji, Skrip Keluar dari HTML, Peran repo: experience layer + satu-satunya BFF, Titik lanjut yang menunggu pencabutan penahanan, ADR-0024 — Seni Lokal di src/assets/, Di-resolve import.meta.glob sebagai URL, ADR-0025 — Gambar Artikel dari Media awcms: Resolusi Sekali per Build dan img-src yang DITANYAKAN, Gerbang NOL dari N id Resolve = Build Gagal, Resolusi Media Sekali per Build ke LocalizedArticle, ADR-0026 — Kartu Share per Artikel dari Media awcms, dengan Metadata yang Ikut Berpindah (+3 more)

### Community 38 - "Prosedur performa dan keamanan di skill"
Cohesion: 0.24
Nodes (10): Asal media ditanyakan, tidak disalin (img-src), Core Web Vitals diukur LAB, bukan kunjungan nyata, Enam header respons penyaji (lima selalu, HSTS hanya produksi), HSTS digerbangi produksi, tanpa includeSubDomains, Lima kontrol yang sengaja DITOLAK, RUM dan pelaporan CSP ditolak — larangan mengumpulkan data pembaca, Prosedur performa dan keamanan awcms-astro, Langkah Core Web Vitals (lab) atas hasil build (+2 more)

### Community 39 - "Penahanan selesai dan indeks ADR"
Cohesion: 0.31
Nodes (10): ADR-0018 — Kontrak build terhadap awcms: tenant dari token mesin, traversal cursor, gerbang terjemahan, ADR-0020 — Layar admin owner/internal kembali ke awcms, ADR-0021 — Pengembangan repo ditahan sampai fondasi awcms selesai, ADR-0022 — Situs ini menerbitkan tenant DEFAULT (owner) awcms, ADR-0023 — Penahanan Dipersempit: Pekerjaan Tanpa awcms Boleh Mendarat, ADR-0027 — Penahanan ADR-0021 Selesai: Kedua Indikatornya Terpenuhi, Dua Indikator ADR-0021 Terpenuhi, Indeks Architecture Decision Records awcms-astro (+2 more)

### Community 40 - "Job CI terkondisi dan pemicu rebuild"
Cohesion: 0.28
Nodes (9): Gerbang `bun run audit:konten` — sumber gambar + keluaran build, Gerbang `bun test` — unit + kontrak + penyaji, Gerbang yang melewati dirinya tanpa dist/, Penolakan awcms yang WAJIB ditiru di tiruan tes, CI job `build` — dikondisikan pada vars.AWCMS_API_URL, Build tidak diberi awcms tiruan supaya selalu hijau, Endpoint /api/v1/deploy Coolify, bukan /restart, Job picu deploy Coolify (+1 more)

### Community 41 - "Gerbang lockfile"
Cohesion: 0.25
Nodes (8): ADR-0015, bacaJsonc(), BLOK_DEPENDENCY, buangTrailingComma(), lock, masalah, pkg, repoRoot

### Community 42 - "Aturan aset gambar dan rasio sumber"
Cohesion: 0.25
Nodes (9): Aturan aset gambar — sumber di src/assets/, satu entitas satu gambar, Rasio sumber wajib sama dengan rasio bingkainya, Biaya yang diterima: raster tidak di-encode ulang, tanpa srcset, Dua aturan gambar tetap manual, dan itu disebut terus terang, Dua aturan gambar keluarga yang awcms-astro sengaja TIDAK ikuti, Format gambar dibaca dari isi berkas, bukan ekstensinya, Gambar: <img> di atas URL hasil import.meta.glob, Tanpa lambang, logo, atau atribut instansi negara di dalam ilustrasi (+1 more)

### Community 43 - "Peta situs dan remah navigasi"
Cohesion: 0.22
Nodes (6): breadcrumbSchema, fullItems, locale, breadcrumbItems, locale, sections

### Community 44 - "Tiga permukaan awcms yang dipanggil build"
Cohesion: 0.29
Nodes (8): awcms ADR-0065 — kontrak konsumen awcms-astro dibekukan, Kontrak integrasi awcms-astro ↔ awcms, Tenant datang dari token, tidak pernah dari header, Tiga permukaan awcms yang dipanggil build, AWCMS_TENANT_ID diteruskan, AWCMS_TENANT_CODE tidak, Aturan sumber data — client.ts satu-satunya penghubung awcms, Aturan yang tidak bisa ditawar, Tenant: satu variabel dan satu pernyataan yang diverifikasi

### Community 45 - "Header respons dan selisih COOP/CORP dari awcms"
Cohesion: 0.25
Nodes (8): max-age=31536000, tanpa includeSubDomains, tanpa preload (§B), tests/kontrak-awcms.test.mjs — permukaan diekstrak dari kode, dibandingkan dua arah (§D), Celah 5 — header pembocor teknologi (Server, X-Powered-By), Divergence COOP/CORP tercatat di kedua sisi (reviewDate 2027-02-04), Hubungan dengan ahliweb/awcms — batas antar-repo dijaga dua arah, ISO/IEC 25010:2023 — model mutu produk, OWASP Secure Headers Project, Cross-Origin-Resource-Policy same-origin menyeluruh — ditolak

### Community 46 - "Lambang favicon lampu lalu lintas"
Cohesion: 0.39
Nodes (8): Rounded Square Icon Backdrop (64x64, rx=14), Sky-to-Emerald Brand Palette (Tailwind-family hues), Diagonal Blue-to-Green Linear Gradient (id=f), Favicon Brand Mark (Traffic Light App Icon), Three Stacked Signal Lamps (red, amber, green), Red/Amber/Green Status Color Semantics, Traffic Light Housing Glyph (dark pill, 85% opacity), Traffic Signal Motif (lampu lalu lintas)

### Community 47 - "Aksesibilitas WCAG dan cara memakai dokumen standar"
Cohesion: 0.29
Nodes (7): Selisih HSTS dari awcms yang ditemukan oleh pemetaan, Cara memakai dokumen ini di sebuah situs turunan, Celah 1 — HSTS: digerbangi produksi, tanpa includeSubDomains, WCAG 2.1 AA (2.2 AA untuk permukaan Jualanku), Aksesibilitas — target WCAG 2.1 AA, Kontrol yang bergantung JavaScript disembunyikan bila API-nya tidak tersedia, prefers-reduced-motion: animasi dekoratif DIMATIKAN, bukan dipercepat

### Community 48 - "Konfigurasi TypeScript"
Cohesion: 0.29
Nodes (6): astro/tsconfigs/strict, compilerOptions, jsx, jsxImportSource, moduleResolution, extends

### Community 49 - "Gerbang atas gerbang audit dokumen"
Cohesion: 0.33
Nodes (3): pohon(), pohonKilau(), sementara

### Community 50 - "Rute artikel dan getStaticPaths-nya"
Cohesion: 0.47
Nodes (4): defaultLocale, getArticles(), getStaticPaths(), getStaticPaths()

### Community 51 - "Gerbang analisis statik CodeQL"
Cohesion: 0.40
Nodes (4): codeql, ADR-0028, ADR-0030, ADR-0032

### Community 52 - "Gerbang Core Web Vitals lab"
Cohesion: 0.40
Nodes (4): ci, konfigurasi, ADR-0028, ADR-0032

### Community 53 - "Gerbang versi toolchain"
Cohesion: 0.40
Nodes (4): ci, dockerfile, pkg, VERSI

### Community 54 - "Pedoman perilaku kontributor"
Cohesion: 0.50
Nodes (4): Contributor Covenant versi 2.1, Komitmen partisipasi bebas pelecehan, Pedoman Perilaku, Kontribusi penutur asli dihargai sebagai keahlian

### Community 55 - "Alur kontribusi dan alur keputusan"
Cohesion: 0.50
Nodes (4): Alur kontribusi — issue, branch, scope atomic, changeset, PR, Konvensi commit dan penamaan branch, ADR yang ditolak tetap disimpan berstatus Ditolak, Alur keputusan — usul, ADR, branch, gerbang, review, rilis

## Ambiguous Edges - Review These
- `Three Stacked Signal Lamps (red, amber, green)` → `Sky-to-Emerald Brand Palette (Tailwind-family hues)`  [AMBIGUOUS]
  public/favicon.svg · relation: conceptually_related_to

## Knowledge Gaps
- **217 isolated node(s):** `SITE`, `ADR-0014`, `temuan`, `catatan`, `dirKeluaran` (+212 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **8 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **What is the exact relationship between `Three Stacked Signal Lamps (red, amber, green)` and `Sky-to-Emerald Brand Palette (Tailwind-family hues)`?**
  _Edge tagged AMBIGUOUS (relation: conceptually_related_to) - confidence is low._
- **Why does `ADR-0014 — Rendering campuran dan BFF portal Jualanku` connect `ADR-0014 dan rencana porting Jualanku` to `Keputusan runtime, cache, dan layar admin`?**
  _High betweenness centrality (0.336) - this node is a cross-community bridge._
- **Why does `awcmsGet()` connect `Klien awcms, tenant, dan media` to `Pengambilan dan render blok konten`, `ADR-0014 dan rencana porting Jualanku`?**
  _High betweenness centrality (0.318) - this node is a cross-community bridge._
- **Why does `Experience layer Jualanku.info` connect `ADR-0014 dan rencana porting Jualanku` to `Klien awcms, tenant, dan media`?**
  _High betweenness centrality (0.317) - this node is a cross-community bridge._
- **What connects `SITE`, `ADR-0014`, `temuan` to the rest of the system?**
  _217 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `Dependency dan skrip proyek` be split into smaller, more focused modules?**
  _Cohesion score 0.043478260869565216 - nodes in this community are weakly interconnected._
- **Should `Klien awcms, tenant, dan media` be split into smaller, more focused modules?**
  _Cohesion score 0.08858858858858859 - nodes in this community are weakly interconnected._