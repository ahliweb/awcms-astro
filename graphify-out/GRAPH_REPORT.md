# Graph Report - awcms-astro  (2026-08-04)

## Corpus Check
- 129 files · ~88,820 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 861 nodes · 1251 edges · 90 communities (80 shown, 10 thin omitted)
- Extraction: 92% EXTRACTED · 8% INFERRED · 0% AMBIGUOUS · INFERRED: 99 edges (avg confidence: 0.88)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `a0f87c48`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- site.ts
- Migrasi runtime dan package manager ke Bun
- package.json
- client.ts
- content.ts
- ADR-0014 — Rendering campuran dan BFF portal Jualanku
- content-blocks.ts
- Permukaan serangan situs statis murni
- Struktur direktori proyek
- awcms-astro — Design System
- ADR-0016 — Penyajian oleh Bun di belakang Traefik/Coolify; nginx dilepas dari stack
- Panduan Kontribusi
- Build menarik konten yang benar-benar ada, dari tenant yang benar-benar dimaksud
- rilis.mjs
- po.ts
- cek-lockfile.mjs
- penyaji.test.mjs
- Ekstraksi template awcms-astro dari web-lalulintasmelayani.com
- katalog-po.test.mjs
- Render blok gallery dengan placeholder bertanda
- Favicon Brand Mark (Traffic Light App Icon)
- Job CI build (terkondisi vars.AWCMS_API_URL)
- Kontrak BFF /_portal-api/**
- compilerOptions
- astro.config.mjs
- article-images.ts
- Bun sebagai runtime dan package manager (ADR-0015)
- Gerbang cek-lockfile (murni baca berkas, jalan sebelum install)
- Image produksi multi-stage (build + nginx unprivileged 8080)
- Token build tidak pernah ber-prefix PUBLIC_
- Backlog: gambar artikel (article-images.ts)
- robots.txt.ts
- Setiap fungsi inti bekerja tanpa JavaScript
- Tidak ada pengumpulan data pribadi pembaca
- Ambang keterbacaan teks SVG (minimal 22px pada kanvas 800px)
- Minimal tiga item faq untuk artikel panduan
- defaultSocialImage
- Lepaskan identitas repo rujukan, dan hentikan nama key yang tampil ke pembaca
- Kontrak ContentBlock awcms
- awcms-astro — Standar Teknis
- schema.ts
- Alur kontribusi sepuluh langkah
- ADR-0015 — Runtime Bun menutup divergence keluarga AWCMS
- Tanpa lambang, logo, atau atribut resmi instansi negara
- Kontrak BFF /_portal-api/**
- SitemapView.astro
- BaseLayout.astro
- 0020-layar-admin-kembali-ke-awcms.md
- Build menarik konten yang benar-benar ada, dari tenant yang benar-benar dimaksud
- ADR-0021 — Pengembangan repo ini ditahan sampai fondasi `awcms` selesai
- Home.astro
- Alur kerja wajib: scope atomic, branch dari main, build bersih
- BaseLayout.astro
- 0018-kontrak-build-token-mesin-dan-traversal-konten.md
- Permukaan serangan situs statis murni
- CSP ketat benar-benar dikirim, dan skrip berhenti tinggal di dalam HTML
- Gerbang audit konten: memeriksa yang TERBIT, bukan yang tertulis
- ADR-0017 — Repo ini memikul halaman admin OWNER/INTERNAL, di samping situs publiknya
- Build menarik konten yang benar-benar ada, dari tenant yang benar-benar dimaksud
- Layar admin kembali ke `awcms`: ADR-0017 di-supersede ADR-0020
- awcms-astro — kontrak integrasi dengan `awcms`
- Dokumen berhenti menyebut gerbang dan berkas yang tidak ada
- Keputusan
- ADR-0022 — Situs ini menerbitkan tenant DEFAULT (owner) `awcms`
- ADR-0023 — Penahanan ADR-0021 dipersempit: pekerjaan yang tidak membutuhkan `awcms` boleh mendarat
- BaseLayout.astro
- Koreksi: indeks ADR yang tak pernah benar, dan titik lanjut locale yang berbalik arah
- ADR-0017 — Repo ini memikul halaman admin OWNER/INTERNAL, di samping situs publiknya
- ADR-0019 — CSP ketat dikirim penyaji, dan skrip tidak lagi tinggal di dalam HTML
- ADR-0025 — Gambar artikel dari media `awcms`: di-resolve sekali per build, dan `img-src` yang DITANYAKAN
- ADR-0015 — Runtime Bun menutup divergence keluarga AWCMS
- Gambar artikel dari media `awcms` — dan `img-src` yang ditanyakan, bukan disalin
- Kartu share per artikel — dan tiga klaim yang berhenti berbohong
- Gerbang audit dokumen, dan penahanan yang dipersempit supaya ia bisa mendarat
- Standar awcms-astro — situs statis Astro
- Koreksi: indeks ADR yang tak pernah benar, dan titik lanjut locale yang berbalik arah
- `awcms-astro` menjadi template repository GitHub — dan dokumennya dibuat benar untuk itu
- Ilustrasi lokal: taruh berkas di `src/assets/`, tidak ada langkah kedua
- Ilustrasi lokal: taruh berkas di `src/assets/`, tidak ada langkah kedua
- `og:image:alt` berhenti memerikan gambar yang lain
- Gerbang permukaan kilau — dokumen yang meminta pemeriksanya sendiri, lalu menyimpang persis seperti yang ia ramalkan
- Deploy dan rebuild lewat webhook (Coolify)
- awcms-astro — kontrak integrasi dengan `awcms`
- ADR-0014 — Rendering campuran dan BFF portal Jualanku
- ADR-0027 — Penahanan ADR-0021 selesai: kedua indikatornya terpenuhi
- Penahanan ADR-0021 selesai, dan template mendapat skill-nya sendiri

## God Nodes (most connected - your core abstractions)
1. `t()` - 19 edges
2. `ADR-0014 — Rendering campuran dan BFF portal Jualanku` - 17 edges
3. `getArticles()` - 15 edges
4. `scripts` - 14 edges
5. `siteConfig` - 14 edges
6. `awcms-astro — Design System` - 13 edges
7. `awcmsGet()` - 11 edges
8. `Kontrak integrasi awcms-astro → awcms` - 11 edges
9. `Kontrak BFF /_portal-api/**` - 11 edges
10. `awcms-astro — Standar Teknis` - 11 edges

## Surprising Connections (you probably didn't know these)
- `Aturan internasionalisasi awcms-astro` --conceptually_related_to--> `localeMeta`  [INFERRED]
  docs/awcms-astro/standar-teknis.md → src/config/site.ts
- `Experience layer Jualanku.info` --references--> `awcmsGet()`  [INFERRED]
  docs/adr/0014-rendering-campuran-dan-bff-portal.md → src/lib/awcms/client.ts
- `Struktur wajib dan aturan arah satu arah` --conceptually_related_to--> `getArticles()`  [INFERRED]
  docs/awcms-astro/standar-teknis.md → src/lib/content.ts
- `Checklist memulai situs baru di atas awcms-astro` --references--> `siteConfig`  [INFERRED]
  docs/awcms-astro/checklist-repo-baru.md → src/config/site.ts
- `Struktur direktori portal yang direncanakan` --references--> `renderContentBlocks()`  [INFERRED]
  docs/awcms-astro/jualanku/01-arsitektur-experience.md → src/lib/content-blocks.ts

## Import Cycles
- None detected.

## Hyperedges (group relationships)
- **Rantai gerbang mutu awcms-astro (lockfile, astro check, unit test, audit, build terkondisi)** — github_workflows_ci_gerbang_lockfile, github_workflows_ci_job_check, github_workflows_ci_unit_tests_di_check, github_workflows_ci_job_build, github_pull_request_template_definition_of_done [INFERRED 0.85]
- **Rantai konten terbit di awcms sampai tayang ke pembaca** — changesets_2026_07_28_rebuild_lewat_webhook_kontrak_pengirim_webhook_awcms, changesets_2026_07_28_rebuild_lewat_webhook_pemicu_rebuild_coolify, changesets_2026_07_28_rebuild_lewat_webhook_konten_ditarik_saat_build, changesets_2026_07_28_rebuild_lewat_webhook_image_produksi, github_workflows_rebuild_jaring_pengaman_jadwal [EXTRACTED 1.00]
- **Penyeragaman runtime Bun lintas perkakas repo** — changesets_0006_runtime_bun_migrasi_runtime_bun, changesets_0006_runtime_bun_lockfile_bun, changesets_0006_runtime_bun_adr_0015, github_dependabot_ekosistem_bun, github_workflows_ci_pin_versi_bun [EXTRACTED 1.00]
- **Gerbang kualitas sebelum merge dan rilis (build, test, audit, bun audit)** — agents_definition_of_done, contributing_definition_of_done, contributing_perintah_gerbang, governance_alur_keputusan, security_bun_audit_nol_kerentanan, agents_gerbang_lockfile [EXTRACTED 1.00]
- **Postur privasi pembaca: tanpa skrip pihak ketiga, tanpa data pribadi, tanpa HTML mentah** — agents_tanpa_skrip_pihak_ketiga, readme_tanpa_skrip_pihak_ketiga, security_tanpa_skrip_pihak_ketiga, agents_tanpa_pengumpulan_data_pribadi, security_tanpa_data_pribadi_pembaca, agents_tanpa_html_mentah_dari_cms, readme_tanpa_html_mentah_dari_cms [EXTRACTED 1.00]
- **Tata kelola terjemahan bahasa daerah oleh penutur asli** — contributing_terjemahan_penutur_asli, governance_peran_dan_kewenangan, code_of_conduct_penutur_asli_sebagai_keahlian, support_jalur_issue_bertemplat, contributing_kontribusi_paling_dibutuhkan [EXTRACTED 1.00]
- **Alur sesi portal Jualanku end-to-end** — docs_awcms_astro_jualanku_02_kontrak_bff_alur_sesi_portal, docs_awcms_astro_jualanku_02_kontrak_bff_aturan_cookie_dan_csrf, docs_adr_0014_rendering_campuran_dan_bff_portal_kontrak_sesi_portal, docs_awcms_astro_jualanku_02_kontrak_bff_batas_keras_bff, docs_awcms_astro_jualanku_02_kontrak_bff_penanganan_error_correlation_id [INFERRED 0.85]
- **Gerbang kesiapan sebelum portal produksi** — docs_awcms_astro_jualanku_04_kesiapan_prasyarat_p0, docs_awcms_astro_jualanku_04_kesiapan_cakupan_proof_of_concept, docs_awcms_astro_jualanku_04_kesiapan_checklist_acceptance, docs_adr_0014_rendering_campuran_dan_bff_portal_urutan_eksekusi_mengikat, docs_awcms_astro_jualanku_01_arsitektur_experience_jalur_rollback_portal [INFERRED 0.85]
- **Perpindahan penegakan aturan konten dari build ke API** — docs_awcms_astro_integrasi_awcms_jaminan_konten_berisiko_hilang, docs_awcms_astro_standar_teknis_gerbang_mutu, docs_awcms_astro_standar_teknis_aturan_baru_wajib_membawa_pemeriksanya, docs_awcms_astro_integrasi_awcms_pemetaan_model_data, docs_awcms_astro_integrasi_awcms_urutan_migrasi [INFERRED 0.85]

## Communities (90 total, 10 thin omitted)

### Community 0 - "site.ts"
Cohesion: 0.23
Nodes (11): getSiteUrl(), Locale, localeHtmlLang, articleSchema(), ArticleSchemaInput, collectionSchema(), imageObject(), PUBLISHER_ID (+3 more)

### Community 1 - "Migrasi runtime dan package manager ke Bun"
Cohesion: 0.32
Nodes (8): Pengabaian Dependabot untuk TypeScript >=7, ADR-0014 Rendering campuran dan BFF portal, ADR-0015 Runtime Bun menutup divergence keluarga, Migrasi runtime dan package manager ke Bun, Entri ignore typescript >=7, Dependabot package-ecosystem bun, Grup update minor-dan-patch, Pin versi Bun 1.3.14 di CI (setup-bun)

### Community 2 - "package.json"
Cohesion: 0.05
Nodes (43): astro, @astrojs/check, @astrojs/node, @astrojs/sitemap, compression, dependencies, astro, @astrojs/check (+35 more)

### Community 3 - "client.ts"
Cohesion: 0.08
Nodes (34): ADR-0022, ADR-0054, Envelope {success,data} dan resolusi tenant server-side, Pemisahan variabel build-time vs runtime, Struktur direktori portal yang direncanakan, Penanganan error BFF dan correlationId, /api/v1/deploy, bukan /restart, Deploy dan rebuild lewat webhook (Coolify) (+26 more)

### Community 4 - "content.ts"
Cohesion: 0.11
Nodes (25): ADR-0024, Kontrak adapter LocalizedArticle, ADR-0019, asalMediaPublik, ObjekMedia, resolveObjekMedia(), assertFeedReturnedFullRows(), assertTranslationsArePairable() (+17 more)

### Community 5 - "ADR-0014 — Rendering campuran dan BFF portal Jualanku"
Cohesion: 0.18
Nodes (9): ADR-0026, locale, alternates, jsonLd, locale, metaDescription, ogLocale, KartuShare (+1 more)

### Community 6 - "content-blocks.ts"
Cohesion: 0.27
Nodes (15): ALLOWED_HEADING_LEVELS, AWCMS_BLOCK_TYPES, Block, escapeHtml(), GalleryItem, renderBlock(), renderContentBlocks(), renderGallery() (+7 more)

### Community 7 - "Permukaan serangan situs statis murni"
Cohesion: 0.22
Nodes (10): ADR-0014 rendering campuran dan BFF portal (Jualanku.info), Berpindah ke SSR sebagai keputusan ber-ADR, BFF tidak memutuskan apa pun yang punya konsekuensi bisnis, Mobile-first dari 360px, Teks terkecil di SVG minimal 22px pada kanvas 800px, Aksesibilitas WCAG 2.1 AA sebagai batas, Permukaan Jualanku bertarget WCAG 2.2 AA, awcms sebagai backend konten (+2 more)

### Community 8 - "Struktur direktori proyek"
Cohesion: 0.14
Nodes (15): Empat aturan src/lib/content.ts, Setiap variabel env wajib ada di .env.example dengan konsekuensinya, Format gambar dibaca dari isi berkas, bukan ekstensinya, String antarmuka lewat katalog PO, src/config/site.ts dan .env satu-satunya tempat konfigurasi, Diam-diam memotong data adalah kegagalan, bukan optimasi, Satu rasio visual untuk seluruh situs (--ratio-visual 16:9), client.ts satu-satunya berkas yang menghubungi awcms (+7 more)

### Community 9 - "awcms-astro — Design System"
Cohesion: 0.17
Nodes (15): Pin versi Bun di tiga tempat yang wajib bergerak bersama, Checklist memulai situs baru di atas awcms-astro, Katalog kesalahan yang paling sering terjadi, Urutan: kontrak dulu, konten berikutnya, tampilan terakhir, Kriteria memilih awcms-astro, Posisi awcms-astro di keluarga AWCMS, Standar awcms-astro — situs statis Astro, Aturan baru wajib membawa pemeriksanya (+7 more)

### Community 10 - "ADR-0016 — Penyajian oleh Bun di belakang Traefik/Coolify; nginx dilepas dari stack"
Cohesion: 0.15
Nodes (11): Bun menyajikan hasil build; nginx dilepas dari image, Yang berubah bagi pembaca, Yang berubah bagi yang mengembangkan, ADR-0016 — Penyajian oleh Bun di belakang Traefik/Coolify; nginx dilepas dari stack, Alternatif yang ditimbang, Apa yang sebenarnya dikerjakan nginx di sini, Catatan implementasi (1 Agustus 2026), Keputusan (+3 more)

### Community 11 - "Panduan Kontribusi"
Cohesion: 0.18
Nodes (13): Kontrak kerja awcms-astro (AGENTS.md), Template AWCMS untuk situs publik statis di Astro, Penegakan dan kerahasiaan pelapor, Denda ditulis sebagai ancaman maksimum menurut undang-undang, Panduan Kontribusi, Setiap nominal wajib punya biaya[].sumber dan dasarHukum lengkap, awcms-astro (README), Posisi awcms-astro di keluarga AWCMS (+5 more)

### Community 12 - "Build menarik konten yang benar-benar ada, dari tenant yang benar-benar dimaksud"
Cohesion: 0.13
Nodes (21): auditGambar(), auditKeluaran(), auditSvg(), bandingkanRasio(), berkasUntuk(), catatan, dimensi(), EKSTENSI_GAMBAR (+13 more)

### Community 13 - "rilis.mjs"
Cohesion: 0.18
Nodes (9): apply, args, body, commit, ketemu, level, [major, minor, patch], pkg (+1 more)

### Community 14 - "po.ts"
Cohesion: 0.09
Nodes (23): engines, bun, ASAL_MEDIA, asalMediaTerkonfigurasi(), aturanCache(), buatServer(), CSP, HEADER_KEAMANAN (+15 more)

### Community 15 - "cek-lockfile.mjs"
Cohesion: 0.25
Nodes (8): ADR-0015, bacaJsonc(), BLOK_DEPENDENCY, buangTrailingComma(), lock, masalah, pkg, repoRoot

### Community 16 - "penyaji.test.mjs"
Cohesion: 0.25
Nodes (11): Alternatif ditolak: seluruh situs output 'server', Static-by-default dengan rute on-demand, ADR-0015 — Runtime Bun menutup divergence keluarga AWCMS, bun.lock sebagai lockfile tunggal, Divergence runtime dari keluarga AWCMS, Gerbang cek-lockfile sebelum install di CI, Larangan script bernama sama dengan biner yang dipanggilnya, Runtime dan package manager Bun-only (+3 more)

### Community 17 - "Ekstraksi template awcms-astro dari web-lalulintasmelayani.com"
Cohesion: 0.29
Nodes (8): Aturan: komponen tidak pernah mengambil datanya sendiri, Blok konten dirender dari struktur ter-escape (tanpa HTML mentah dari CMS), Ekstraksi template awcms-astro dari web-lalulintasmelayani.com, Penyaringan skema URL (http/https saja) sebelum masuk src/href, Formulir issue Laporan bug, Pengalihan urusan layanan riil ke SUPPORT.md, Kanal pelaporan kerentanan privat (security advisories), Checklist verifikasi konten PR (sumber, dasar hukum, cakupan)

### Community 19 - "Render blok gallery dengan placeholder bertanda"
Cohesion: 0.25
Nodes (8): Render blok gallery dengan placeholder bertanda, Kontrak sisi pengirim webhook di awcms (pola outbox email, bukan domain-event-runtime), Pemicu rebuild lewat webhook Coolify, Gaya .visual-placeholder yang sebelumnya tidak ada, Token rasio tunggal --ratio-visual, Endpoint /api/v1/deploy Coolify, bukan /restart, Jaring pengaman rebuild terjadwal harian, Job picu deploy Coolify

### Community 20 - "Favicon Brand Mark (Traffic Light App Icon)"
Cohesion: 0.39
Nodes (8): Rounded Square Icon Backdrop (64x64, rx=14), Sky-to-Emerald Brand Palette (Tailwind-family hues), Diagonal Blue-to-Green Linear Gradient (id=f), Favicon Brand Mark (Traffic Light App Icon), Three Stacked Signal Lamps (red, amber, green), Red/Amber/Green Status Color Semantics, Traffic Light Housing Glyph (dark pill, 85% opacity), Traffic Signal Motif (lampu lalu lintas)

### Community 21 - "Job CI build (terkondisi vars.AWCMS_API_URL)"
Cohesion: 0.33
Nodes (7): Gerbang build terkondisi vars.AWCMS_API_URL, Pemisahan CI menjadi check dan build, Penolakan backend awcms tiruan di CI, Langkah CI check:lockfile sebelum install, Job CI build (terkondisi vars.AWCMS_API_URL), Job CI check (selalu jalan, tanpa backend), Syarat target deploy dinyatakan eksplisit di ringkasan run

### Community 22 - "Kontrak BFF /_portal-api/**"
Cohesion: 0.18
Nodes (12): Contributor Covenant versi 2.1, Komitmen partisipasi bebas pelecehan, Pedoman Perilaku, Kontribusi penutur asli dihargai sebagai keahlian, Kontribusi yang paling dibutuhkan, Kesalahan isi ditanggung pembaca di loket atau di jalan, Yang belum terverifikasi ditulis TBD, Empat bahasa daerah wajib dikerjakan penutur asli (ADR-0004) (+4 more)

### Community 23 - "compilerOptions"
Cohesion: 0.29
Nodes (6): astro/tsconfigs/strict, compilerOptions, jsx, jsxImportSource, moduleResolution, extends

### Community 24 - "astro.config.mjs"
Cohesion: 0.43
Nodes (6): LOCALE_PREFIXES, ADR-0014, ADR-0016, neutralPath(), serialize(), SITE

### Community 25 - "article-images.ts"
Cohesion: 0.19
Nodes (13): ADR-0021, ArticleVisual, getArticleImage(), getArticleVisual(), getTabImage(), heroImage, MODUL, SENI (+5 more)

### Community 26 - "Bun sebagai runtime dan package manager (ADR-0015)"
Cohesion: 0.50
Nodes (5): Bun sebagai runtime dan package manager (ADR-0015), Gerbang lockfile bun.lock (check:lockfile), Jangan menamai script sama dengan biner yang dipanggilnya, bun install tidak menolak peer-dependency mismatch, Repo Bun-only (ADR-0015)

### Community 27 - "Gerbang cek-lockfile (murni baca berkas, jalan sebelum install)"
Cohesion: 0.29
Nodes (7): Gerbang cek-lockfile (murni baca berkas, jalan sebelum install), Regenerasi lockfile wajib lewat npm install penuh, Sinkronisasi lockfile dengan package.json, Jebakan script passthrough astro (rekursi E2BIG), bun.lock sebagai satu-satunya lockfile, Header keamanan di-include ulang di setiap location nginx, Konfigurasi penyajian ops/nginx-situs.conf

### Community 28 - "Image produksi multi-stage (build + nginx unprivileged 8080)"
Cohesion: 0.29
Nodes (7): Image produksi multi-stage (build + nginx unprivileged 8080), AWCMS_API_TOKEN hanya hidup di stage build (terverifikasi), Konten ditarik saat docker build, bukan saat container start, Skrip rilis menulis ulang tautan relatif saat melipat changeset, Konvensi changeset (satu berkas per perubahan), Aturan tautan relatif dari sudut pandang .changesets/, Definition of Done PR

### Community 29 - "Token build tidak pernah ber-prefix PUBLIC_"
Cohesion: 0.67
Nodes (3): Baca env lewat src/lib/env.ts, bukan import.meta.env langsung, Token build tidak pernah ber-prefix PUBLIC_, Tidak ada secret, token, atau kredensial di repo

### Community 30 - "Backlog: gambar artikel (article-images.ts)"
Cohesion: 0.67
Nodes (3): src: undefined adalah keadaan yang didukung (.visual-placeholder), Backlog: gambar artikel (article-images.ts), Backlog: kartu share PNG

### Community 38 - "Lepaskan identitas repo rujukan, dan hentikan nama key yang tampil ke pembaca"
Cohesion: 0.29
Nodes (6): Cacat perilaku, Identitas situs lain, tertanam harfiah, Klaim yang menunjuk berkas yang tidak ada, Konfigurasi, Lepaskan identitas repo rujukan, dan hentikan nama key yang tampil ke pembaca, Nama key mentah di layar, di kedua bahasa

### Community 39 - "Kontrak ContentBlock awcms"
Cohesion: 0.40
Nodes (5): Penghapusan @import Google Fonts, Kontrak ContentBlock awcms, Test pertama repo: 20 test renderer blok, video_news dirender sebagai tautan, bukan embed, Unit test dijalankan di job check, bukan build

### Community 40 - "awcms-astro — Standar Teknis"
Cohesion: 0.17
Nodes (12): 1. Header tenant yang tidak pernah dibaca siapa pun, 1. Token menentukan tenant; konfigurasi menjadi ASSERTION, 2. Daftar post tidak memuat isinya, 2. Traversal cursor, lalu hidrasi per post, 3. Batas 100 baris yang dijaga dengan `throw`, 3. Terjemahan yang tidak bisa dipasangkan MENGGAGALKAN build, ADR-0018 — Kontrak build terhadap awcms: tenant dari token mesin, traversal cursor + hidrasi, dan gerbang terjemahan, Alternatif yang ditimbang (+4 more)

### Community 41 - "schema.ts"
Cohesion: 0.24
Nodes (11): Changelog awcms-astro, Pelipatan changeset oleh skrip rilis, Versioning MAJOR.MINOR.PATCH dengan tag vX.Y.Z, Alur kontribusi sepuluh langkah, Konvensi penamaan branch, Perintah gerbang: build, test, audit, ADR yang ditolak tetap disimpan berstatus Ditolak, Alur keputusan usulan sampai rilis (+3 more)

### Community 42 - "Alur kontribusi sepuluh langkah"
Cohesion: 0.20
Nodes (10): Dua aturan isi gambar tidak bisa diperiksa mesin, Tanpa dokumen, kuitansi, identitas, atau antarmuka pemerintah rekayasa, Tanpa lambang, logo, atau atribut resmi instansi negara, Tidak ada skrip pihak ketiga, Teks di dalam gambar hanya label topik, Perubahan yang tidak boleh diambil sendiri, Tanpa skrip pihak ketiga (README), Apa yang bukan laporan keamanan (+2 more)

### Community 43 - "ADR-0015 — Runtime Bun menutup divergence keluarga AWCMS"
Cohesion: 0.24
Nodes (10): Alternatif ditolak: portal SPA memanggil awcms langsung, BFF hanya orkestrasi dan proyeksi, Kontrak sesi portal, Alur sesi portal (login, introspeksi, mutasi, logout), Batas keras BFF, Inventaris endpoint BFF, Kontrak BFF /_portal-api/**, Larangan passthrough generik /_portal-api/[...path] (+2 more)

### Community 44 - "Tanpa lambang, logo, atau atribut resmi instansi negara"
Cohesion: 0.21
Nodes (13): Satu rasio gambar untuk seluruh situs, Aturan cookie dan CSRF portal, Kelompok komponen portal, Aturan aset gambar, awcms-astro — Design System, Design token CSS custom properties, Gap token terhadap kosakata AWCMS, Inventaris komponen dan padanan AWCMS (+5 more)

### Community 45 - "Kontrak BFF /_portal-api/**"
Cohesion: 0.16
Nodes (23): antaraPenanda(), auditIndeksAdr(), auditJalurDisebut(), auditPermukaanKilau(), auditTautan(), AWALAN_JALUR, beradaDi(), berkasMarkdown() (+15 more)

### Community 46 - "SitemapView.astro"
Cohesion: 0.25
Nodes (8): ADR-0021 — Pengembangan repo ini ditahan sampai fondasi `awcms` selesai, Kapan penahanan ini dicabut, Keputusan, Konsekuensi, Konteks, Titik lanjut — yang menunggu saat penahanan dicabut, Yang DITAHAN, Yang MASIH boleh mendarat

### Community 47 - "BaseLayout.astro"
Cohesion: 0.38
Nodes (7): content_json bernamespace awcmsAstro dengan schemaVersion, Kontrak integrasi awcms-astro → awcms, Jaminan konten yang berisiko hilang saat migrasi, Modul awcms yang relevan bagi awcms-astro, Pemetaan model data ke awcms_blog_posts, Urutan migrasi delapan langkah, Theming lewat data-theme sebelum paint

### Community 48 - "0020-layar-admin-kembali-ke-awcms.md"
Cohesion: 0.29
Nodes (7): Alur kerja wajib: scope atomic, branch dari main, build bersih, Conventional Commits sebagai konvensi commit, Definition of Done (AGENTS.md), Dokumentasi adalah bagian dari produk, Definition of Done (CONTRIBUTING.md), Konvensi commit dan daftar type/scope, bun audit wajib nol kerentanan sebelum rilis

### Community 50 - "Build menarik konten yang benar-benar ada, dari tenant yang benar-benar dimaksud"
Cohesion: 0.29
Nodes (7): 1. Daftar post tidak pernah memuat isinya, 2. Batas 100 baris berhenti menjadi batas, 3. Header tenant yang tidak pernah dibaca siapa pun, Build menarik konten yang benar-benar ada, dari tenant yang benar-benar dimaksud, Gerbang, Terjemahan: gerbang baru yang sengaja menggagalkan, Yang perlu diubah operator

### Community 51 - "ADR-0021 — Pengembangan repo ini ditahan sampai fondasi `awcms` selesai"
Cohesion: 0.33
Nodes (6): set:html hanya menerima keluaran renderContentBlocks, SVG wajib XML valid, Tidak ada jalur HTML mentah dari CMS, Tanpa HTML mentah dari CMS (README), Permukaan serangan situs statis murni, Tautan keluar wajib rel=noopener noreferrer bila target=_blank

### Community 52 - "Home.astro"
Cohesion: 0.33
Nodes (5): CSP ketat benar-benar dikirim, dan skrip berhenti tinggal di dalam HTML, Gerbang, JSON-LD tetap inline, dan itu bukan pengecualian yang dilonggarkan, Pengalih tema, Sisanya ternyata tiga jalur, bukan dua

### Community 53 - "Alur kerja wajib: scope atomic, branch dari main, build bersih"
Cohesion: 0.33
Nodes (5): Di mana ia berjalan, Gerbang audit konten: memeriksa yang TERBIT, bukan yang tertulis, Keluaran build (`dist/client/**`), Sumber gambar (`src/assets/**`, `public/**`), Yang tetap manual, dan disebut terus terang

### Community 54 - "BaseLayout.astro"
Cohesion: 0.29
Nodes (6): Dokumen yang ikut dikoreksi, Kapan dicabut, Kenapa, dan kenapa bukan karena kekurangan pekerjaan, Kenapa keamanan dan dependency dikecualikan, Pengembangan repo ini ditahan sampai fondasi `awcms` selesai, Titik lanjut

### Community 55 - "0018-kontrak-build-token-mesin-dan-traversal-konten.md"
Cohesion: 0.33
Nodes (6): ADR-0022 — Situs ini menerbitkan tenant DEFAULT (owner) `awcms`, Alternatif yang dipertimbangkan, Kenapa TIDAK diverifikasi lewat jaringan, Keputusan, Konsekuensi, Konteks

### Community 56 - "Permukaan serangan situs statis murni"
Cohesion: 0.40
Nodes (4): Gerbang, Jalur kedua yang sama berbahayanya, dan lebih mudah terlewat, Keluaran build berhenti membawa gaya di dalam HTML, Warna kanal berbagi

### Community 57 - "CSP ketat benar-benar dikirim, dan skrip berhenti tinggal di dalam HTML"
Cohesion: 0.40
Nodes (4): Arah sebaliknya, dan ini yang lebih mahal, CI dan image berhenti mengirim variabel tenant yang sudah ditolak, Gerbang, Untuk situs yang sudah berjalan

### Community 58 - "Gerbang audit konten: memeriksa yang TERBIT, bukan yang tertulis"
Cohesion: 0.40
Nodes (4): Kenapa keputusannya dibalik, dan kenapa bukan karena buntu, Layar admin kembali ke `awcms`: ADR-0017 di-supersede ADR-0020, Satu klaim lain yang berhenti benar, Yang berubah, dan yang sengaja tidak

### Community 59 - "ADR-0017 — Repo ini memikul halaman admin OWNER/INTERNAL, di samping situs publiknya"
Cohesion: 0.25
Nodes (4): ADR-0020 — Layar admin owner/internal kembali ke `awcms`; repo ini kembali murni publik + BFF, Keputusan, Konsekuensi, Konteks

### Community 60 - "Build menarik konten yang benar-benar ada, dari tenant yang benar-benar dimaksud"
Cohesion: 0.50
Nodes (4): ADR-0019 — CSP ketat dikirim penyaji, dan skrip tidak lagi tinggal di dalam HTML, Keputusan, Konsekuensi, Konteks

### Community 61 - "Layar admin kembali ke `awcms`: ADR-0017 di-supersede ADR-0020"
Cohesion: 0.50
Nodes (3): Dokumen berhenti menyebut gerbang dan berkas yang tidak ada, Yang diperbaiki, Yang sengaja TIDAK diubah

### Community 62 - "awcms-astro — kontrak integrasi dengan `awcms`"
Cohesion: 0.25
Nodes (8): Aturan yang tidak boleh dilanggar, awcms-astro — kontrak integrasi dengan `awcms`, Gambar dan kartu share, `img-src` ditanyakan, tidak disalin, Lima permukaan yang dipakai, Penolakan `awcms` yang WAJIB ditiru di tiruan tes, Rujukan, Sebelum menambah permukaan keenam

### Community 67 - "ADR-0022 — Situs ini menerbitkan tenant DEFAULT (owner) `awcms`"
Cohesion: 0.19
Nodes (5): catalogs, Catalog, parsePo(), readQuoted(), rawCatalogs

### Community 68 - "ADR-0023 — Penahanan ADR-0021 dipersempit: pekerjaan yang tidak membutuhkan `awcms` boleh mendarat"
Cohesion: 0.22
Nodes (7): locale, number, schema, localePath(), TabSlug, tabTitleKey(), t()

### Community 69 - "BaseLayout.astro"
Cohesion: 0.19
Nodes (11): defaultLocale, getLocaleFromPath(), isLocale(), localeMeta, locales, siteUrl, socialImageRaw, stripLocale() (+3 more)

### Community 70 - "Koreksi: indeks ADR yang tak pernah benar, dan titik lanjut locale yang berbalik arah"
Cohesion: 0.12
Nodes (12): locale, locale, locale, articleVisual, breadcrumbItems, canonicalUrl, DateTimeFormatOptions, locale (+4 more)

### Community 71 - "ADR-0017 — Repo ini memikul halaman admin OWNER/INTERNAL, di samping situs publiknya"
Cohesion: 0.22
Nodes (9): ADR-0024 — Seni lokal di `src/assets/`, di-resolve `import.meta.glob` sebagai URL, Alternatif yang dipertimbangkan, Dua berkas bernama sama = build gagal, Keputusan, Konsekuensi, Konteks, Percabangan gambar/placeholder tinggal di satu komponen, `query: "?url"`, bukan `astro:assets` (+1 more)

### Community 72 - "ADR-0019 — CSP ketat dikirim penyaji, dan skrip tidak lagi tinggal di dalam HTML"
Cohesion: 0.22
Nodes (9): 1. Resolusi sekali per build, hasilnya di `LocalizedArticle`, 2. Media `awcms` menang atas seni lokal, 3. Satu id hilang ≠ semua id hilang, 4. `img-src` DITANYAKAN, tidak disalin, ADR-0025 — Gambar artikel dari media `awcms`: di-resolve sekali per build, dan `img-src` yang DITANYAKAN, Alternatif yang dipertimbangkan, Keputusan, Konsekuensi (+1 more)

### Community 73 - "ADR-0025 — Gambar artikel dari media `awcms`: di-resolve sekali per build, dan `img-src` yang DITANYAKAN"
Cohesion: 0.18
Nodes (6): breadcrumbSchema, fullItems, locale, breadcrumbItems, locale, sections

### Community 74 - "ADR-0015 — Runtime Bun menutup divergence keluarga AWCMS"
Cohesion: 0.25
Nodes (8): 1. Urutannya milik `awcms`, bukan milik repo ini, 2. MIME dan ukuran ikut, dan itu inti ADR ini, 3. Tiga keadaan, semuanya didukung, ADR-0026 — Kartu share per artikel dari media `awcms`, dengan metadata yang ikut berpindah, Alternatif yang dipertimbangkan, Keputusan, Konsekuensi, Konteks

### Community 75 - "Gambar artikel dari media `awcms` — dan `img-src` yang ditanyakan, bukan disalin"
Cohesion: 0.29
Nodes (6): Gambar artikel dari media `awcms` — dan `img-src` yang ditanyakan, bukan disalin, Kebijakan tetap dirangkai di satu tempat, Kenapa sekarang, dan dasarnya bukan dari sini, Satu baris `Dockerfile` yang wajib ikut, Tiga keputusan yang menentukan bentuknya, Yang berubah untuk pembaca situs

### Community 76 - "Kartu share per artikel — dan tiga klaim yang berhenti berbohong"
Cohesion: 0.33
Nodes (5): Cacat yang sebenarnya ditutup, Kartu share per artikel — dan tiga klaim yang berhenti berbohong, Nol permintaan tambahan, Tiga keadaan, semuanya tetap didukung, Yang berubah untuk pembaca

### Community 77 - "Gerbang audit dokumen, dan penahanan yang dipersempit supaya ia bisa mendarat"
Cohesion: 0.33
Nodes (6): ADR-0023 — Penahanan ADR-0021 dipersempit: pekerjaan yang tidak membutuhkan `awcms` boleh mendarat, Alternatif yang dipertimbangkan, Keputusan, Konsekuensi, Konteks, Yang TIDAK berubah

### Community 78 - "Standar awcms-astro — situs statis Astro"
Cohesion: 0.40
Nodes (5): Apa yang diperiksa gerbangnya, Gerbang audit dokumen, dan penahanan yang dipersempit supaya ia bisa mendarat, Gerbangnya sendiri dibuktikan dua arah, Kenapa penahanannya dipersempit lebih dulu, Yang ikut berubah

### Community 79 - "Koreksi: indeks ADR yang tak pernah benar, dan titik lanjut locale yang berbalik arah"
Cohesion: 0.40
Nodes (4): Dua koreksi yang ikut, Gerbang permukaan kilau — dokumen yang meminta pemeriksanya sendiri, lalu menyimpang persis seperti yang ia ramalkan, Satu hint yang akhirnya bersih, Yang mendarat

### Community 80 - "`awcms-astro` menjadi template repository GitHub — dan dokumennya dibuat benar untuk itu"
Cohesion: 0.40
Nodes (4): Indeks ADR mendaftarkan enam keputusan yang tak pernah ada di sini, Indikator pencabutan penahanan: satu dari dua terpenuhi, Koreksi: indeks ADR yang tak pernah benar, dan titik lanjut locale yang berbalik arah, Titik lanjut "filter locale" berbalik arah, bukan sekadar usang

### Community 81 - "Ilustrasi lokal: taruh berkas di `src/assets/`, tidak ada langkah kedua"
Cohesion: 0.40
Nodes (4): `awcms-astro` menjadi template repository GitHub — dan dokumennya dibuat benar untuk itu, Dua dokumen standar yang membantah kode, Gerbang kelima: jalur yang disebut dokumen harus ada, Yang ditemukan di `checklist-repo-baru.md`

### Community 82 - "Ilustrasi lokal: taruh berkas di `src/assets/`, tidak ada langkah kedua"
Cohesion: 0.33
Nodes (5): Ilustrasi lokal: taruh berkas di `src/assets/`, tidak ada langkah kedua, Media `awcms` TETAP ditahan, Tiga keputusan yang perlu disebut, Yang berubah untuk pembaca situs, Yang ikut hidup karenanya

### Community 83 - "`og:image:alt` berhenti memerikan gambar yang lain"
Cohesion: 0.50
Nodes (3): Diperbaiki dengan membuatnya tidak bisa ditulis, `og:image:alt` berhenti memerikan gambar yang lain, Yang tidak berubah

### Community 85 - "Deploy dan rebuild lewat webhook (Coolify)"
Cohesion: 0.40
Nodes (5): ADR-0017 — Repo ini memikul halaman admin OWNER/INTERNAL, di samping situs publiknya, Keputusan, Konsekuensi, Konteks, Yang memblokir layar internal pertama (nyata, bukan hipotetis)

### Community 89 - "awcms-astro — kontrak integrasi dengan `awcms`"
Cohesion: 0.11
Nodes (16): Aturan yang mengikat: aturan baru wajib membawa pemeriksanya, awcms-astro — gerbang, Definition of Done, Menambah pemeriksa ke `audit:dokumen`, Yang ditangkap masing-masing, Yang TIDAK ditangkap — dan disebut supaya tidak dikira terjaga, awcms-astro — menurunkan situs baru, Jebakan yang paling sering terjadi (+8 more)

### Community 91 - "ADR-0014 — Rendering campuran dan BFF portal Jualanku"
Cohesion: 0.14
Nodes (22): ADR-0014 — Rendering campuran dan BFF portal Jualanku, ADR-0045 awcms — Jualanku porting, awcms system of record, Astro BFF, Experience layer Jualanku.info, Jalur rollback build statis penuh, Urutan eksekusi mengikat sebelum layar produksi, Baseline WCAG 2.2 AA untuk permukaan Jualanku, Penomoran ADR warisan (0001–0013 dianggap terpakai), Proses ADR awcms-astro (+14 more)

### Community 92 - "ADR-0027 — Penahanan ADR-0021 selesai: kedua indikatornya terpenuhi"
Cohesion: 0.25
Nodes (8): ADR-0027 — Penahanan ADR-0021 selesai: kedua indikatornya terpenuhi, Alternatif yang dipertimbangkan, Keputusan, Konsekuensi, Konteks, Yang masih ditahan, dan oleh apa, Yang menggantikannya: uji ADR-0023, tanpa perubahan, Yang TIDAK berubah

### Community 95 - "Penahanan ADR-0021 selesai, dan template mendapat skill-nya sendiri"
Cohesion: 0.40
Nodes (4): Dokumen yang disinkronkan dengan backend, Kedua indikator ADR-0021 terpenuhi, Penahanan ADR-0021 selesai, dan template mendapat skill-nya sendiri, Template mendapat skill

## Ambiguous Edges - Review These
- `Runtime dan package manager Bun-only` → `Yang sengaja ditunda dari MVP portal`  [AMBIGUOUS]
  docs/awcms-astro/jualanku/04-kesiapan.md · relation: conceptually_related_to
- `Three Stacked Signal Lamps (red, amber, green)` → `Sky-to-Emerald Brand Palette (Tailwind-family hues)`  [AMBIGUOUS]
  public/favicon.svg · relation: conceptually_related_to

## Knowledge Gaps
- **314 isolated node(s):** `SITE`, `ADR-0014`, `ADR-0016`, `name`, `type` (+309 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **10 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **What is the exact relationship between `Runtime dan package manager Bun-only` and `Yang sengaja ditunda dari MVP portal`?**
  _Edge tagged AMBIGUOUS (relation: conceptually_related_to) - confidence is low._
- **What is the exact relationship between `Three Stacked Signal Lamps (red, amber, green)` and `Sky-to-Emerald Brand Palette (Tailwind-family hues)`?**
  _Edge tagged AMBIGUOUS (relation: conceptually_related_to) - confidence is low._
- **Why does `Checklist memulai situs baru di atas awcms-astro` connect `awcms-astro — Design System` to `katalog-po.test.mjs`, `Tanpa lambang, logo, atau atribut resmi instansi negara`, `BaseLayout.astro`?**
  _High betweenness centrality (0.016) - this node is a cross-community bridge._
- **Why does `awcmsGet()` connect `client.ts` to `ADR-0014 — Rendering campuran dan BFF portal Jualanku`, `content.ts`?**
  _High betweenness centrality (0.013) - this node is a cross-community bridge._
- **Why does `siteConfig` connect `katalog-po.test.mjs` to `site.ts`, `ADR-0023 — Penahanan ADR-0021 dipersempit: pekerjaan yang tidak membutuhkan `awcms` boleh mendarat`, `BaseLayout.astro`, `Koreksi: indeks ADR yang tak pernah benar, dan titik lanjut locale yang berbalik arah`, `ADR-0014 — Rendering campuran dan BFF portal Jualanku`, `ADR-0025 — Gambar artikel dari media `awcms`: di-resolve sekali per build, dan `img-src` yang DITANYAKAN`, `awcms-astro — Design System`?**
  _High betweenness centrality (0.013) - this node is a cross-community bridge._
- **What connects `SITE`, `ADR-0014`, `ADR-0016` to the rest of the system?**
  _314 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `package.json` be split into smaller, more focused modules?**
  _Cohesion score 0.045454545454545456 - nodes in this community are weakly interconnected._