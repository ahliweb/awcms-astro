🇮🇩 Bahasa Indonesia · 🇬🇧 [English (source)](0059-opengrep-replaces-codeql-with-copied-rules-and-a-shrink-only-baseline.md)

<!-- i18n-source-hash: sha256:9cbf02992cf7b7ceba53a166aebe343554394ee8ab482ee563cdb040a5bf026d -->

# ADR-0059 — OpenGrep menggantikan CodeQL, dengan aturan tersalin dan baseline yang hanya menyusut

- **Status:** Accepted
- **Tanggal:** 27 November 2026 (keputusan pemilik, diterapkan di semua repo sebagai standar lintas-portofolio internal, DL-098)
- **Menggantikan:** [ADR-0032](0032-dua-celah-terakhir-ditutup-dengan-syarat-kejujuran.id.md) §A (hanya workflow CodeQL; §B, Core Web Vitals, tidak tersentuh dan syarat kejujurannya dipertahankan)
- **Mengamandemen, hanya untuk nama check wajib:** [ADR-0053](0053-main-is-fenced-by-a-ruleset-that-no-gate-can-see.id.md) (konteks wajib ketiganya)
- **Terkait:** [ADR-0028](0028-jangkar-standar-performa-dan-keamanan.id.md) (celah 7), [ADR-0030](0030-aturan-tertulis-mendapat-pemeriksanya.id.md) (pin SHA, aturan membawa pemeriksanya)

## Konteks

Celah 7 ADR-0028 ditutup ADR-0032 §A dengan workflow CodeQL. Ketentuan CodeQL GitHub tidak membolehkannya pada codebase yang bukan open source, maupun di CI tanpa lisensi GitHub Advanced Security. Pemilik menjalankan satu jalur keamanan untuk setiap repositori, termasuk yang publik, dan memilih jalur yang tidak butuh lisensi itu.

Syarat kejujuran ADR-0032 §A tidak bergantung pada mesinnya: ringkasan run harus menyatakan apa yang dianalisis dan apa yang tidak (`.astro` tidak pernah diurai CodeQL, dan aturan OpenGrep yang terpasang di sini juga tidak menyasarnya).

## Keputusan

1. **CodeQL tidak dijalankan di repo ini.** `.github/workflows/codeql.yml` dan `tests/analisis-statik.test.mjs` dihapus. Tidak ada direktori `.github/codeql/` maupun pin CodeQL CLI.
2. **Leg keamanan adalah `.github/workflows/keamanan.yml`**, nama job `keamanan / sast-rahasia-dependensi`, pada setiap pull request dan push ke `main`, tanpa filter `paths`, `permissions: contents: read`, setiap action dipin ke SHA commit, tanpa unggah SARIF:
   - **gitleaks** 8.30.1 (checksum diverifikasi, `--redact`) atas **rentang commit** (`base..head` pada pull request, rentang yang di-push pada push), bukan seluruh riwayat;
   - **OpenGrep** v2.1.0, biner Linux x86 dipin SHA256 dan diverifikasi sebelum dijalankan, dengan `SEMGREP_SEND_METRICS=off` dan `--disable-version-check`;
   - **audit dependensi tidak diulang:** `bun audit --audit-level=low` sudah berjalan di job `Check` pada `ci.yml` dan mempertahankan ambangnya tanpa pengecualian.
3. **Aturan adalah salinan, bukan registry.** `tools/ci/sast/rules/` memuat semua `.yaml` dan `.yml` di `javascript/` dan `typescript/` dari `opengrep/opengrep-rules` pada commit `f1d2b562b414783763fd02a6ed2736eaed622efa`, beserta `LICENSE` dan `SUMBER.md`, ditambah aturan lokal di `rules/lokal/`. Semgrep Registry (`p/...`) dan `semgrep/semgrep-rules` tidak dipakai.
4. **Gerbang gagal hanya pada ERROR yang tidak ada di baseline.** `tools/ci/sast/baseline.json` dibuat sekali saat adopsi dan hanya menyusut: alat boleh membuatnya atau membuang entri basi, tidak pernah menambah; menambah entri adalah edit tangan dengan alasan yang tidak kosong, ditinjau di pull request. Temuan tidak diunggah ke code scanning GitHub.
5. **Satu pengecualian dinyatakan:** `design/redesain-ui-ux-2026-10/support.js`, yang dihasilkan (baris pertamanya menyatakannya) dari runtime yang hidup di luar repo ini. `--exclude` yang sama wajib diberikan saat baseline dibuat atau dirapikan.
6. **Cakupan dinyatakan, bukan diklaim.** Langkah `Nyatakan cakupan` menulis ke ringkasan run berapa berkas `.ts`/`.mjs`/`.js` terlacak yang disasar aturan dan berapa berkas `.astro` TIDAK dianalisis, keduanya dihitung `git ls-files`. `tests/sast-opengrep.test.mjs` adalah pemeriksanya.
7. **Check wajib berubah lewat tindakan pemilik.** Ruleset `main-protection` (id `25837340`) harus melepas `Analyze (javascript-typescript)` dan mewajibkan `keamanan / sast-rahasia-dependensi`, dipin ke integrasi `github-actions` (id 15368). Sebelum itu konteks lama tidak pernah melapor dan pull request tidak bisa di-merge, sehingga penggantian dicantumkan sebagai langkah berurutan di deskripsi pull request.

## Konsekuensi

**Didapat.** Satu jalur bebas lisensi yang sama dengan repositori lain; temuan yang menggagalkan build selalu temuan baru; aturan dan mesin dipin, sehingga hasil dapat direproduksi.

**Dibayar.** Salinan 203 berkas aturan tinggal di repo dan disegarkan oleh skrip, bukan oleh GitHub; kueri aliran data CodeQL hilang, dan aturan JS/TS OpenGrep sebagian besar berbasis pola, sehingga sebagian kelas temuan yang bisa dijangkau CodeQL (taint antar-prosedur) tidak lagi tercakup; waktu run bertambah sebesar pemindaian (sekitar 5 detik secara lokal); dan `.astro` tetap tidak dianalisis, seperti sebelumnya.

**Tidak berubah.** Batas `.astro` beserta pernyataannya, `bun audit` tanpa pengecualian, pin SHA, dan aturan bahwa repo ini tidak punya rahasia yang perlu dipindai.

**Rollback.** Revert pull request, pulihkan `codeql.yml` dan konteks wajib di ruleset; tidak ada hal lain yang bergantung pada berkas baru.

## Alternatif yang dipertimbangkan

- **Mempertahankan CodeQL.** Ditolak: ketentuan lisensi di atas.
- **Semgrep dengan aturan Registry.** Tidak dipakai, keputusan pemilik: aturan disalin dan dipin, bukan diambil dari registry.
- **Tanpa analisis statik.** Ditolak: membuka kembali celah 7.
