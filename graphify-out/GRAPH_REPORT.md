# Graph Report - awcms-astro  (2026-07-31)

## Corpus Check
- 80 files · ~41,699 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 494 nodes · 798 edges · 36 communities (30 shown, 6 thin omitted)
- Extraction: 87% EXTRACTED · 13% INFERRED · 0% AMBIGUOUS · INFERRED: 100 edges (avg confidence: 0.88)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `6b566ce3`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- Rendering Situs & i18n
- Changeset & Gerbang CI
- Manifest Paket & Skrip Bun
- Klien API awcms & Deploy Coolify
- Adapter Konten & Rute Tab
- Arsitektur Experience Portal
- Renderer Blok Konten
- Aturan Keamanan Konten & Aksesibilitas
- Disiplin Konfigurasi & Backlog
- Standar Teknis & Checklist Repo
- Design System & Token Visual
- Alur Rilis & Keputusan
- Skrip Rilis
- Skrip Cek Lockfile
- Templat Issue & Asal Templat
- Kebijakan Perilaku, Keamanan & Dukungan
- Tata Kelola Akurasi & Terjemahan
- Lambang Merek Favicon
- Empat bahasa daerah wajib dikerjakan penutur asli (ADR-0004)
- Konfigurasi TypeScript
- Konfigurasi Astro & Jalur Locale
- Resolusi Gambar Artikel
- Aturan Runtime Bun
- ADR-0015 — Runtime Bun menutup divergence keluarga AWCMS
- Alur kerja wajib: scope atomic, branch dari main, build bersih
- Penanganan Env & Secret
- Backlog Gambar & Kartu Share
- Rute Robots.txt
- Baseline Tanpa JavaScript
- Privasi Pembaca
- Aturan Ilustrasi SVG
- Minimum Isi Konten
- Gambar Sosial Bawaan
- Kontrak kerja awcms-astro (AGENTS.md)
- Pedoman Perilaku

## God Nodes (most connected - your core abstractions)
1. `t()` - 19 edges
2. `ADR-0014 — Rendering campuran dan BFF portal Jualanku` - 17 edges
3. `siteConfig` - 14 edges
4. `getArticles()` - 14 edges
5. `awcms-astro — Design System` - 13 edges
6. `Kontrak integrasi awcms-astro → awcms` - 11 edges
7. `Kontrak BFF /_portal-api/**` - 11 edges
8. `awcms-astro — Standar Teknis` - 11 edges
9. `getLocaleFromPath()` - 10 edges
10. `awcmsGet()` - 10 edges

## Surprising Connections (you probably didn't know these)
- `Aturan internasionalisasi awcms-astro` --conceptually_related_to--> `localeMeta`  [INFERRED]
  docs/awcms-astro/standar-teknis.md → src/config/site.ts
- `Experience layer Jualanku.info` --references--> `awcmsGet()`  [INFERRED]
  docs/adr/0014-rendering-campuran-dan-bff-portal.md → src/lib/awcms/client.ts
- `Struktur wajib dan aturan arah satu arah` --conceptually_related_to--> `getArticles()`  [INFERRED]
  docs/awcms-astro/standar-teknis.md → src/lib/content.ts
- `Checklist memulai situs baru di atas awcms-astro` --references--> `siteConfig`  [INFERRED]
  docs/awcms-astro/checklist-repo-baru.md → src/config/site.ts
- `Struktur direktori portal yang direncanakan` --references--> `awcmsGet()`  [INFERRED]
  docs/awcms-astro/jualanku/01-arsitektur-experience.md → src/lib/awcms/client.ts

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

## Communities (36 total, 6 thin omitted)

### Community 0 - "Rendering Situs & i18n"
Cohesion: 0.06
Nodes (51): breadcrumbSchema, fullItems, locale, locale, locale, locale, locale, breadcrumbItems (+43 more)

### Community 1 - "Changeset & Gerbang CI"
Cohesion: 0.32
Nodes (8): Pengabaian Dependabot untuk TypeScript >=7, ADR-0014 Rendering campuran dan BFF portal, ADR-0015 Runtime Bun menutup divergence keluarga, Migrasi runtime dan package manager ke Bun, Entri ignore typescript >=7, Dependabot package-ecosystem bun, Grup update minor-dan-patch, Pin versi Bun 1.3.14 di CI (setup-bun)

### Community 2 - "Manifest Paket & Skrip Bun"
Cohesion: 0.06
Nodes (34): astro, @astrojs/check, @astrojs/sitemap, dependencies, astro, @astrojs/check, @astrojs/sitemap, typescript (+26 more)

### Community 3 - "Klien API awcms & Deploy Coolify"
Cohesion: 0.13
Nodes (24): Envelope {success,data} dan resolusi tenant server-side, Pemisahan variabel build-time vs runtime, Penanganan error BFF dan correlationId, /api/v1/deploy, bukan /restart, Deploy dan rebuild lewat webhook (Coolify), Health check Coolify boleh menyala, Jaring pengaman jadwal harian rebuild, Konten ditarik saat build, bukan saat runtime (+16 more)

### Community 4 - "Adapter Konten & Rute Tab"
Cohesion: 0.22
Nodes (12): Kontrak adapter LocalizedArticle, defaultLocale, AwcmsAstroBlock, AwcmsBlogPost, fetchPublishedPosts(), getArticle(), getArticles(), LocalizedArticle (+4 more)

### Community 5 - "Arsitektur Experience Portal"
Cohesion: 0.08
Nodes (39): ADR-0014 — Rendering campuran dan BFF portal Jualanku, ADR-0045 awcms — Jualanku porting, awcms system of record, Astro BFF, Alternatif ditolak: portal SPA memanggil awcms langsung, Alternatif ditolak: seluruh situs output 'server', BFF hanya orkestrasi dan proyeksi, Experience layer Jualanku.info, Jalur rollback build statis penuh, Kontrak sesi portal (+31 more)

### Community 6 - "Renderer Blok Konten"
Cohesion: 0.27
Nodes (15): ALLOWED_HEADING_LEVELS, AWCMS_BLOCK_TYPES, Block, escapeHtml(), GalleryItem, renderBlock(), renderContentBlocks(), renderGallery() (+7 more)

### Community 7 - "Aturan Keamanan Konten & Aksesibilitas"
Cohesion: 0.09
Nodes (23): ADR-0014 rendering campuran dan BFF portal (Jualanku.info), Alur kerja wajib: scope atomic, branch dari main, build bersih, Berpindah ke SSR sebagai keputusan ber-ADR, BFF tidak memutuskan apa pun yang punya konsekuensi bisnis, Conventional Commits sebagai konvensi commit, Definition of Done (AGENTS.md), Dokumentasi adalah bagian dari produk, Mobile-first dari 360px (+15 more)

### Community 8 - "Disiplin Konfigurasi & Backlog"
Cohesion: 0.14
Nodes (15): Empat aturan src/lib/content.ts, Setiap variabel env wajib ada di .env.example dengan konsekuensinya, Format gambar dibaca dari isi berkas, bukan ekstensinya, String antarmuka lewat katalog PO, src/config/site.ts dan .env satu-satunya tempat konfigurasi, Diam-diam memotong data adalah kegagalan, bukan optimasi, Satu rasio visual untuk seluruh situs (--ratio-visual 16:9), client.ts satu-satunya berkas yang menghubungi awcms (+7 more)

### Community 9 - "Standar Teknis & Checklist Repo"
Cohesion: 0.08
Nodes (40): ADR-0015 — Runtime Bun menutup divergence keluarga AWCMS, bun.lock sebagai lockfile tunggal, Gerbang cek-lockfile sebelum install di CI, Larangan script bernama sama dengan biner yang dipanggilnya, Pin versi Bun di tiga tempat yang wajib bergerak bersama, Checklist memulai situs baru di atas awcms-astro, Katalog kesalahan yang paling sering terjadi, Satu rasio gambar untuk seluruh situs (+32 more)

### Community 10 - "Design System & Token Visual"
Cohesion: 0.25
Nodes (7): ADR-0016 — Penyajian oleh Bun di belakang Traefik/Coolify; nginx dilepas dari stack, Alternatif yang ditimbang, Apa yang sebenarnya dikerjakan nginx di sini, Keputusan, Konsekuensi, Konteks, Traefik tidak bisa menggantikan nginx secara langsung

### Community 11 - "Alur Rilis & Keputusan"
Cohesion: 0.06
Nodes (46): Dua aturan isi gambar tidak bisa diperiksa mesin, Kontrak kerja awcms-astro (AGENTS.md), Tanpa dokumen, kuitansi, identitas, atau antarmuka pemerintah rekayasa, Tanpa lambang, logo, atau atribut resmi instansi negara, Tidak ada skrip pihak ketiga, Teks di dalam gambar hanya label topik, Template AWCMS untuk situs publik statis di Astro, Changelog awcms-astro (+38 more)

### Community 13 - "Skrip Rilis"
Cohesion: 0.18
Nodes (9): apply, args, body, commit, ketemu, level, [major, minor, patch], pkg (+1 more)

### Community 15 - "Skrip Cek Lockfile"
Cohesion: 0.25
Nodes (8): ADR-0015, bacaJsonc(), BLOK_DEPENDENCY, buangTrailingComma(), lock, masalah, pkg, repoRoot

### Community 17 - "Templat Issue & Asal Templat"
Cohesion: 0.29
Nodes (8): Aturan: komponen tidak pernah mengambil datanya sendiri, Blok konten dirender dari struktur ter-escape (tanpa HTML mentah dari CMS), Ekstraksi template awcms-astro dari web-lalulintasmelayani.com, Penyaringan skema URL (http/https saja) sebelum masuk src/href, Formulir issue Laporan bug, Pengalihan urusan layanan riil ke SUPPORT.md, Kanal pelaporan kerentanan privat (security advisories), Checklist verifikasi konten PR (sumber, dasar hukum, cakupan)

### Community 18 - "Kebijakan Perilaku, Keamanan & Dukungan"
Cohesion: 0.28
Nodes (5): tabs, Catalog, parsePo(), readQuoted(), katalog

### Community 19 - "Tata Kelola Akurasi & Terjemahan"
Cohesion: 0.25
Nodes (8): Render blok gallery dengan placeholder bertanda, Kontrak sisi pengirim webhook di awcms (pola outbox email, bukan domain-event-runtime), Pemicu rebuild lewat webhook Coolify, Gaya .visual-placeholder yang sebelumnya tidak ada, Token rasio tunggal --ratio-visual, Endpoint /api/v1/deploy Coolify, bukan /restart, Jaring pengaman rebuild terjadwal harian, Job picu deploy Coolify

### Community 20 - "Lambang Merek Favicon"
Cohesion: 0.39
Nodes (8): Rounded Square Icon Backdrop (64x64, rx=14), Sky-to-Emerald Brand Palette (Tailwind-family hues), Diagonal Blue-to-Green Linear Gradient (id=f), Favicon Brand Mark (Traffic Light App Icon), Three Stacked Signal Lamps (red, amber, green), Red/Amber/Green Status Color Semantics, Traffic Light Housing Glyph (dark pill, 85% opacity), Traffic Signal Motif (lampu lalu lintas)

### Community 21 - "Empat bahasa daerah wajib dikerjakan penutur asli (ADR-0004)"
Cohesion: 0.33
Nodes (7): Gerbang build terkondisi vars.AWCMS_API_URL, Pemisahan CI menjadi check dan build, Penolakan backend awcms tiruan di CI, Langkah CI check:lockfile sebelum install, Job CI build (terkondisi vars.AWCMS_API_URL), Job CI check (selalu jalan, tanpa backend), Syarat target deploy dinyatakan eksplisit di ringkasan run

### Community 23 - "Konfigurasi TypeScript"
Cohesion: 0.29
Nodes (6): astro/tsconfigs/strict, compilerOptions, jsx, jsxImportSource, moduleResolution, extends

### Community 24 - "Konfigurasi Astro & Jalur Locale"
Cohesion: 0.53
Nodes (5): LOCALE_PREFIXES, neutralPath(), serialize(), SITE, ADR-0014

### Community 25 - "Resolusi Gambar Artikel"
Cohesion: 0.47
Nodes (5): ArticleVisual, getArticleImage(), getTabImage(), heroImage, humanise()

### Community 26 - "Aturan Runtime Bun"
Cohesion: 0.50
Nodes (5): Bun sebagai runtime dan package manager (ADR-0015), Gerbang lockfile bun.lock (check:lockfile), Jangan menamai script sama dengan biner yang dipanggilnya, bun install tidak menolak peer-dependency mismatch, Repo Bun-only (ADR-0015)

### Community 27 - "ADR-0015 — Runtime Bun menutup divergence keluarga AWCMS"
Cohesion: 0.29
Nodes (7): Gerbang cek-lockfile (murni baca berkas, jalan sebelum install), Regenerasi lockfile wajib lewat npm install penuh, Sinkronisasi lockfile dengan package.json, Jebakan script passthrough astro (rekursi E2BIG), bun.lock sebagai satu-satunya lockfile, Header keamanan di-include ulang di setiap location nginx, Konfigurasi penyajian ops/nginx-situs.conf

### Community 28 - "Alur kerja wajib: scope atomic, branch dari main, build bersih"
Cohesion: 0.29
Nodes (7): Image produksi multi-stage (build + nginx unprivileged 8080), AWCMS_API_TOKEN hanya hidup di stage build (terverifikasi), Konten ditarik saat docker build, bukan saat container start, Skrip rilis menulis ulang tautan relatif saat melipat changeset, Konvensi changeset (satu berkas per perubahan), Aturan tautan relatif dari sudut pandang .changesets/, Definition of Done PR

### Community 29 - "Penanganan Env & Secret"
Cohesion: 0.67
Nodes (3): Baca env lewat src/lib/env.ts, bukan import.meta.env langsung, Token build tidak pernah ber-prefix PUBLIC_, Tidak ada secret, token, atau kredensial di repo

### Community 30 - "Backlog Gambar & Kartu Share"
Cohesion: 0.67
Nodes (3): src: undefined adalah keadaan yang didukung (.visual-placeholder), Backlog: gambar artikel (article-images.ts), Backlog: kartu share PNG

### Community 38 - "Kontrak kerja awcms-astro (AGENTS.md)"
Cohesion: 0.29
Nodes (6): Cacat perilaku, Identitas situs lain, tertanam harfiah, Klaim yang menunjuk berkas yang tidak ada, Konfigurasi, Lepaskan identitas repo rujukan, dan hentikan nama key yang tampil ke pembaca, Nama key mentah di layar, di kedua bahasa

### Community 39 - "Pedoman Perilaku"
Cohesion: 0.40
Nodes (5): Penghapusan @import Google Fonts, Kontrak ContentBlock awcms, Test pertama repo: 20 test renderer blok, video_news dirender sebagai tautan, bukan embed, Unit test dijalankan di job check, bukan build

## Ambiguous Edges - Review These
- `Runtime dan package manager Bun-only` → `Yang sengaja ditunda dari MVP portal`  [AMBIGUOUS]
  docs/awcms-astro/jualanku/04-kesiapan.md · relation: conceptually_related_to
- `Three Stacked Signal Lamps (red, amber, green)` → `Sky-to-Emerald Brand Palette (Tailwind-family hues)`  [AMBIGUOUS]
  public/favicon.svg · relation: conceptually_related_to

## Knowledge Gaps
- **123 isolated node(s):** `SITE`, `ADR-0014`, `name`, `type`, `version` (+118 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **6 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **What is the exact relationship between `Runtime dan package manager Bun-only` and `Yang sengaja ditunda dari MVP portal`?**
  _Edge tagged AMBIGUOUS (relation: conceptually_related_to) - confidence is low._
- **What is the exact relationship between `Three Stacked Signal Lamps (red, amber, green)` and `Sky-to-Emerald Brand Palette (Tailwind-family hues)`?**
  _Edge tagged AMBIGUOUS (relation: conceptually_related_to) - confidence is low._
- **Why does `Checklist memulai situs baru di atas awcms-astro` connect `Standar Teknis & Checklist Repo` to `Rendering Situs & i18n`?**
  _High betweenness centrality (0.044) - this node is a cross-community bridge._
- **Why does `siteConfig` connect `Rendering Situs & i18n` to `Standar Teknis & Checklist Repo`, `Adapter Konten & Rute Tab`?**
  _High betweenness centrality (0.032) - this node is a cross-community bridge._
- **Why does `ADR-0014 — Rendering campuran dan BFF portal Jualanku` connect `Arsitektur Experience Portal` to `Standar Teknis & Checklist Repo`?**
  _High betweenness centrality (0.028) - this node is a cross-community bridge._
- **What connects `SITE`, `ADR-0014`, `name` to the rest of the system?**
  _123 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `Rendering Situs & i18n` be split into smaller, more focused modules?**
  _Cohesion score 0.055669050051072526 - nodes in this community are weakly interconnected._