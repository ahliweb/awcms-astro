🇮🇩 Bahasa Indonesia · 🇬🇧 [English (source)](0031-sbom-cyclonedx-dari-lockfile-pada-rilis.md)

<!-- i18n-source-hash: sha256:e61c26a97fd5f4ce026c1b7644b79773e64158a6b7c41ae5c0703bca8965467b -->

# ADR-0031 — SBOM CycloneDX diturunkan dari `bun.lock` pada setiap rilis

- **Status:** Accepted
- **Tanggal:** 5 Agustus 2026
- **Aturan pemilik:** 5 Agustus 2026 — "lanjut kerjakan semua rekomendasi."
- **Terkait:** [ADR-0028](0028-jangkar-standar-performa-dan-keamanan.md) (celah 9 yang ditutup di sini), [ADR-0030](0030-aturan-tertulis-mendapat-pemeriksanya.md) (aturan tanpa pemeriksa akan dilanggar — termasuk langkah rilis), `awcms` [ADR-0068](https://github.com/ahliweb/awcms/blob/main/docs/adr/0068-family-standards-posture-editions-and-recorded-divergences.md) (postur standar keluarga)

## Konteks

Celah 9 [ADR-0028](0028-jangkar-standar-performa-dan-keamanan.md): rilis
bertag tanpa SBOM, sehingga konsumen hilir yang membaca advisory baru tidak
bisa menjawab "apakah rilis vX.Y.Z terdampak?" tanpa meng-checkout tag-nya dan
membangun ulang pohon dependency-nya sendiri (NIST SSDF PS.2).

Celah itu semula ditahan dengan alasan "keputusan tooling lebih baik diambil
sekali untuk kedua repo keluarga". Yang mengubah hitungannya: seluruh data yang
dibutuhkan SBOM — nama, versi persis, integrity hash — **sudah ada di
`bun.lock`**, dan generator pihak ketiga yang tersedia justru tidak membacanya
(mereka membaca `package-lock.json`, yang repo ini tidak punya). Keputusan
tooling-nya ternyata bukan "generator mana yang dipasang" melainkan "format apa
yang ditulis" — dan yang kedua sudah dijawab jangkar standar yang ada.

## Keputusan

`scripts/sbom.mjs` menurunkan **CycloneDX 1.5 JSON** dari `bun.lock` +
`package.json`, ditulis ke `sbom.cdx.json` di akar repo. `scripts/rilis.mjs`
menjalankannya **sebelum commit rilis**, sehingga SBOM ikut di dalam tag.

Tiga keputusan bentuk:

1. **CycloneDX, bukan SPDX.** Postur keamanan repo ini berjangkar ke OWASP
   (ADR-0028); CycloneDX format OWASP dan dirancang untuk SBOM aplikasi. Satu
   keluarga rujukan, bukan dua.
2. **Ditulis sendiri, tanpa dependency baru.** Menambah dependency pada langkah
   yang tugasnya menginventarisasi dependency adalah ironi rantai pasok yang
   nyata: generator itu sendiri menjadi permukaan yang harus di-pin, di-audit,
   dan di-SBOM-kan. Seluruh pekerjaannya penerjemahan bentuk, ~100 baris.
3. **Deterministik** — tanpa timestamp, tanpa serialNumber, komponen terurut.
   Regenerasi pada tag yang sama menghasilkan byte identik, sehingga SBOM
   sebuah tag bisa **diverifikasi** diturunkan dari `bun.lock` di sebelahnya,
   bukan hanya dipercaya.

**Pemeriksanya** (`tests/sbom.test.mjs`, sesuai aturan ADR-0030) menjaga dua
hal: generatornya benar — dibuktikan dua arah atas lockfile buatan (paket
ber-scope, konversi hash base64→hex, dedup jalur resolusi, entri tak dikenal
DITOLAK alih-alih dilewati) — dan langkah di perilis tidak bisa hilang
diam-diam (asersi struktural atas `scripts/rilis.mjs`, pola yang sama dengan
`tests/versi-toolchain.test.mjs` membaca `ci.yml`).

**Yang sengaja TIDAK digerbangi: kesegaran `sbom.cdx.json` di pohon kerja.**
SBOM memerikan RILIS. Di antara dua rilis ia boleh tertinggal dari `bun.lock`;
gerbang yang menuntut keduanya selalu sinkron akan memerahkan setiap PR bump
dependency, dan gerbang semahal itu dilonggarkan dalam sebulan.

## Konsekuensi

**Yang didapat.** SSDF PS.2 terpenuhi pada bentuk yang bisa diverifikasi;
celah 9 tertutup bersama pemeriksanya; nol dependency baru.

**Yang dibayar.** Satu berkas hasil-generate ikut riwayat mulai rilis pertama,
dan format `bun.lock` menjadi kontrak yang dibaca dua skrip (`cek-lockfile`,
`sbom`) — bila Bun mengubahnya, keduanya berubah bersama, dan generator yang
menemui bentuk tak dikenal **gagal keras** alih-alih menulis SBOM yang tidak
lengkap.

**Untuk keluarga.** Keputusan format (CycloneDX) layak diikuti `awcms` saat ia
menutup celah SBOM-nya sendiri; skrip ini tidak bisa disalin apa adanya ke sana
(lockfile dan proses rilisnya berbeda), tetapi tiga keputusan bentuknya
portabel seluruhnya. Dicatat di sini supaya keputusan itu diambil sekali —
sebagaimana `awcms` ADR-0068 melakukannya untuk pin edisi.

## Alternatif yang dipertimbangkan

- **SPDX.** Ditolak: dua keluarga rujukan untuk satu postur. GitHub memakai
  SPDX untuk ekspor dependency graph-nya — dan itu tetap tersedia bagi siapa
  pun tanpa satu baris pun di repo ini, jadi memilihnya di sini tidak menambah
  apa-apa.
- **Generator pihak ketiga (`cyclonedx-npm` dan kerabatnya).** Ditolak: membaca
  `package-lock.json` yang tidak ada, dan menambah dependency pada langkah yang
  menginventarisasi dependency.
- **SBOM yang selalu sinkron di pohon kerja (di-commit setiap bump).** Ditolak:
  memerahkan setiap PR Dependabot, dan gerbangnya akan dilonggarkan — lihat
  §Keputusan.
- **SBOM sebagai aset GitHub Release.** Ditolak: rilis repo ini adalah tag git
  anotatif, bukan objek GitHub Release; menambah jalur publikasi kedua demi
  satu berkas berarti dua tempat yang bisa tidak sepakat.
