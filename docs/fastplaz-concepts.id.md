🇮🇩 Bahasa Indonesia · 🇬🇧 [English (source)](fastplaz-concepts.md)

<!-- i18n-source-hash: sha256:af8fcb30e544f233037c37eabcbb78723db5432680595f00ae7fe39f290a2cc5 -->

# Diagnostik publik/admin USER AWCMS-Astro — konsep FastPlaz, arsitektur khusus repositori

## Kendali dokumen
- **Versi:** v1.1.0
- **Diperbarui:** 2026-11-20
- **Status:** Arsitektur usulan / riset saja; bukan fitur produksi. Setiap disposisi adopsi di bawah ini adalah **usulan** sampai gerbang 9 lolos di repositori ini.
- **Document Changeset:** Disegarkan terhadap `main` per 2026-11-20: admin USER dinyatakan PLANNED, urutan diselaraskan dengan ADR-0057 (Proposed), aksesibilitas dikaitkan ke gerbang ADR-0056, batas CSP dan larangan overlay dinyatakan.
- **Isu pemilik:** [#164](https://github.com/ahliweb/awcms-astro/issues/164).

## Ringkasan dan baseline lokal yang terkonfirmasi
Lapisan pengalaman web adalah situs Astro publik, statis saat build kecuali tiga panggilan dari peramban pembaca (pencarian, beacon kunjungan halaman, buletin), tanpa basis data. Admin USER diizinkan oleh ADR-0034 tetapi **PLANNED, belum terimplementasi**: `permukaanAdmin` kosong dan tidak ada rute yang menyetel `prerender = false` (lihat [ui-contract-inventory.id.md](ui-contract-inventory.id.md) §6). AWCMS memegang admin SYSTEM, API, dan otorisasi.

## Maksud dan kandidat adaptasi
Menampilkan diagnostik lint/build lokal dalam bentuk terstruktur untuk IDE atau agent tepercaya. Pertahankan kemampuan dirayapi, canonical, sitemap, dan perilaku rute publik; tegakkan batas otorisasi USER/SYSTEM.

## Kewenangan dan larangan
Tidak ada backend baru, tidak ada SDK agent runtime di halaman publik, tidak ada akses tersembunyi ke rahasia CMS produksi, tidak ada penggantian dengan tampilan Lynx atau FastPlaz. Tidak ada widget overlay pihak ketiga, dan CSP ketat yang dikirim penyaji ([ADR-0019](adr/0019-csp-ketat-dikirim-penyaji.id.md)) tetap seperti adanya; tidak ada yang di sini boleh meminta pelonggaran CSP.

## Isu terkait yang ada dan anti-duplikasi
Arsitektur [#164](https://github.com/ahliweb/awcms-astro/issues/164). Layar dan kontrak konsumen diinventarisasi di [#187](https://github.com/ahliweb/awcms-astro/issues/187) ([ui-contract-inventory.id.md](ui-contract-inventory.id.md)); periksa setiap tindak lanjut terhadapnya, jangan menurunkannya ulang. Urutan kerja backend dan UI mengikuti [ADR-0057](adr/0057-awcms-first-orders-ownership-and-contract-not-code-and-three-gates-separate-design-mock-and-release.id.md), yang berstatus **Proposed**, belum keputusan: diagnostik yang dibangun terhadap mock tidak pernah menggantikan integrasi terhadap backend nyata.

## Enam skenario validasi konkret
1. Metadata dan canonical artikel publik valid di HTML hasil build.
2. Tautan internal yang rusak dipetakan ke lokasi sumbernya.
3. Canonical/sitemap locale yang salah menggagalkan pemeriksaan.
4. Rute publik anonim disajikan sebagai HTML statis hasil build; satu-satunya panggilan saat permintaan adalah tiga panggilan dari peramban, dan tidak satu pun membaca data tenant secara langsung.
5. Editor USER tidak dapat mengakses endpoint admin SYSTEM (berlaku hanya setelah sebuah situs menyatakan admin USER; belum ada yang menyatakannya hari ini).
6. Keluaran diagnostik build tidak memuat rahasia `.env`.

## Pemeriksaan usulan dan bukti uji
Jalankan build Astro/Bun yang terdokumentasi dan pemeriksaan repositori, ditambah pemeriksaan crawl/SEO tingkat halaman. Bukti aksesibilitas adalah gerbang axe di peramban sungguhan tanpa pengecualian dan dengan versi dipin ([ADR-0056](adr/0056-accessibility-is-gated-by-axe-in-a-real-browser-with-no-exceptions.id.md)); adaptor laporan diagnostik tidak menggantikan atau melunakkannya. Setiap perubahan kontrak API diverifikasi lebih dulu di AWCMS.

## Peluncuran / serah terima
Inventarisasi dulu pemeriksaan yang ada, lalu tambahkan adaptor laporan sederhana hanya bila menutup celah yang terukur.

## Rujukan sumber dan batasan
Dokumen ini mengambil **konsep saja** dari [FastPlaz](https://github.com/fastplaz/fastplaz): [MCP/AI Agent Plane](https://github.com/fastplaz/fastplaz/blob/master/docs/MCP.md), [alur kerja IDE](https://github.com/fastplaz/fastplaz/blob/master/docs/AI_AGENT_by_FASTPLAZ.md), dan [konsep operator mandiri](https://github.com/fastplaz/fastplaz/blob/master/docs/STANDALONE-deployment.md). Tidak ada Pascal, Lazarus, CGI, mesin MVC/tema, atau penyalinan kode sumber. [Teks lisensi FastPlaz](https://github.com/fastplaz/fastplaz/blob/master/LICENSE.txt) tidak menunjukkan izin kode sumber yang eksplisit; hanya implementasi independen.

## Invarian rekayasa lintas-portofolio
Menerapkan **standar lintas-portofolio internal**, bersama AGENTS, ADR, CONTRIBUTING, dan realitas kode terkini repositori ini. **Gerbang 9 (Definition of Ready lintas-spesifikasi)** yang disetujui manusia mendahului kode fitur produksi; **gerbang 15 (kesiapan rilis)** yang disetujui manusia mendahului produksi. Satu isu/branch/PR per lingkup atomik. Jangan pernah menyajikan spesifikasi, pemeriksaan dokumentasi yang hijau, atau riset sebagai fungsi produksi yang berjalan.

Konektor MCP/alat lokal, bila pernah diperlukan: loopback atau IPC terautentikasi, pembatasan host/Origin untuk HTTP, kredensial bercakupan yang dirotasi, perlindungan canonical-path dan symlink, tingkat persetujuan baca/tulis/destruktif, tanpa shell sembarang, tanpa akses SQL/DB mentah/rahasia secara bawaan, sumber daya/waktu/pembatalan terbatas, kebijakan ditegakkan pada alat dan OS saat runtime, tertutup-saat-gagal untuk yang tidak dikenal, dan log yang disamarkan. Perubahan pada otorisasi, konfigurasi produksi, atau data sensitif memerlukan persetujuan manusia.

## Rujukan regulasi dan kendali yang relevan
Evaluasi penerapannya, bukan kepatuhan berdasarkan pernyataan: UU 27/2022 (PDP), PP 71/2019 (PSTE), Perpres 95/2018 bila SPBE berlaku; ISO/IEC 27001, 27002, 27005, 27017, 27018, 27034, 27701, ISO 22301, ISO/IEC 20000-1, ISO/IEC 42001, ISO/IEC 15408; OWASP LLM/Agentic Security, NIST AI RMF. Peroleh bukti kendali independen dan edisi yang berlaku sebelum klaim sertifikasi apa pun.

## Rubrik bukti penerimaan
Untuk setiap tindak lanjut: tautkan spesifikasi/ADR dan isu pemiliknya; catat commit sumber, versi toolchain/runtime, perintah yang dijalankan, galat/hasil sebenarnya, uji akses yang ditolak, dan SHA bukti. Tandai pemeriksaan yang tidak dijalankan sebagai **NOT EXECUTED**. Persetujuan dan status publikasi/deploy adalah hal yang berbeda. Tidak ada data pribadi sensitif atau rahasia produksi dalam prompt, log, atau artefak GitHub.

## Changelog
- **v1.1.0 — 2026-11-20:** Diverifikasi ulang terhadap `main`: admin USER PLANNED (belum terimplementasi), ditambahkan urutan ADR-0057 (Proposed), gerbang axe ADR-0056, batas CSP ADR-0019 dan larangan overlay, tautan ke inventaris #187, dan skenario 4 dan 5 disesuaikan dengan situs statis.
- **v1.0.0 — 2026-11-10:** Batas adopsi khusus repositori yang berbasis bukti, enam kasus praktis, dan rubrik penerimaan didokumentasikan.
