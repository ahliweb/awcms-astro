# ADR-0014 — Rendering campuran (static-by-default + rute on-demand) dan BFF portal Jualanku

- **Status:** Accepted
- **Tanggal:** 2026-07-29
- **Pengambil keputusan:** maintainer `awcms-astro` bersama Product/Architecture
  dan Engineering/Platform
- **Terkait:** `ahliweb/awcms` [ADR-0045](https://github.com/ahliweb/awcms/blob/main/docs/adr/0045-jualanku-porting-awcms-system-of-record-astro-bff.md)
  (`awcms` sebagai system of record, `awcms-astro` sebagai experience layer);
  [`AGENTS.md`](../../AGENTS.md) §"Berpindah ke SSR" yang mensyaratkan ADR ini
  ada lebih dulu; dokumen validasi PT TIM SIX v1.0 (29 Juli 2026); blueprint
  [`docs/awcms-astro/jualanku/`](../awcms-astro/jualanku/README.md).

## Konteks

Jualanku.info membutuhkan tiga hal yang tidak bisa dilayani keluaran statis
murni: halaman yang bergantung pada **sesi** (`/penjual/**`, `/affiliate/**`),
**mutasi** dari form portal, dan **pemisahan cache** antara halaman publik dan
halaman privat.

Keadaan repo ini hari ini (terverifikasi, bukan asumsi):

- `astro.config.mjs` memakai `output: "static"`, **tanpa adapter**.
- Runtime dan package manager Node/npm (`engines`: Node ≥ 22.12, npm ≥ 10.9)
  **pada saat ADR ini ditulis** — bukan Bun seperti yang sempat dinyatakan
  dokumen arsitektur sebelumnya. Keadaan ini **sudah berubah**:
  [ADR-0015](0015-runtime-bun-menutup-divergence-keluarga.md) memindahkan repo
  ini ke Bun.
- `Dockerfile` membangun statis lalu menyajikannya dengan nginx unprivileged;
  `ops/nginx-situs.conf` hanya melakukan `try_files` ke berkas.
- Konten ditarik saat **build** lewat `src/lib/awcms/client.ts`; container yang
  sudah jadi tidak pernah menghubungi `awcms` lagi.
- `AGENTS.md` sudah menyatakan bahwa perpindahan ke `output: 'server'` adalah
  keputusan ADR, bukan satu baris konfigurasi.

Istilah "hybrid application" yang dipakai rancangan sebelumnya tidak tepat untuk
Astro modern: `output` hanya `static` atau `server`; kemampuan campuran datang
dari `export const prerender = false` per rute **setelah adapter terpasang**.

## Keputusan

**1. Repo ini menjadi experience layer Jualanku.info** — halaman publik, portal
penjual, portal affiliate — dan **satu-satunya BFF** menuju `awcms`. Browser
tidak pernah memanggil `awcms` secara langsung.

**2. Pola rendering: static-by-default dengan rute on-demand.** Adapter server
dipasang, `output` tetap `static`, dan hanya rute yang benar-benar personal
menyatakan `export const prerender = false`:

- On-demand: `/penjual/**`, `/affiliate/**` (kecuali landing `/affiliate`),
  `/_portal-api/**`, dan opsional `/cari`.
- Prerender: seluruh sisanya, termasuk homepage, kategori, halaman usaha,
  artikel, dan halaman legal.

Menjadikan seluruh situs `server` **ditolak**: ia membuang karakteristik cache
dan ketahanan yang menjadi alasan template ini ada.

**3. ~~Runtime tetap Node/npm sampai ada ADR migrasi runtime tersendiri~~ —
DIGANTIKAN oleh [ADR-0015](0015-runtime-bun-menutup-divergence-keluarga.md).**
Butir ini semula menahan runtime di Node/npm agar risiko rendering dan risiko
runtime tidak bercampur, sambil menunggu ADR migrasi runtime tersendiri. ADR-0015
adalah ADR itu, dan ia diputuskan lebih awal dari perkiraan: repo ini **sudah**
memakai Bun sebagai runtime dan package manager. Alasan pemisahan risiko tetap
berlaku sebagai urutan kerja — migrasi runtime mendarat lebih dulu, sendirian,
dengan gerbangnya sendiri, sebelum satu baris pun kode portal ditulis.

**4. BFF hanya orkestrasi dan proyeksi.** `/_portal-api/**` boleh: memegang
cookie sesi portal, menukar sesi ke token `awcms` server-side, menetapkan tenant
dari host, menegakkan CSRF/Origin, memasang `no-store`, dan membentuk view model.
BFF **tidak boleh**: memutuskan entitlement, kepemilikan merchant, transisi
status, perhitungan komisi, atau apa pun yang punya konsekuensi bisnis. Aturan
yang hanya hidup di BFF adalah aturan yang tidak ada — panggilan langsung ke
`awcms` dari jaringan internal akan melewatinya.

**5. Kontrak sesi:** cookie portal `HttpOnly`/`Secure`/`SameSite`, token `awcms`
tidak pernah sampai ke JavaScript, tenant diturunkan server dari host, logout
mencabut sesi di `awcms` **sebelum** cookie dihapus, dan revokasi tetap milik
`awcms`. Rinciannya di [`../awcms-astro/jualanku/02-kontrak-bff.md`](../awcms-astro/jualanku/02-kontrak-bff.md).

**6. Deployment berubah dan perubahannya eksplisit.** Image berhenti menjadi
"nginx + berkas statis" untuk deployment Jualanku: dibutuhkan proses Node yang
menjalankan keluaran adapter, dengan nginx/Traefik di depannya. Berkas statis
publik tetap boleh dilayani nginx. **Jalur rollback tetap dipertahankan**: build
statis penuh (tanpa rute on-demand) harus tetap bisa dihasilkan dan di-deploy
selama portal belum aktif.

**7. Aksesibilitas naik ke WCAG 2.2 AA** (ISO/IEC 40500:2025) untuk permukaan
Jualanku, dari baseline 2.1 AA yang tertulis di `AGENTS.md`. Aturan lain di
`AGENTS.md` — tanpa skrip pihak ketiga, tanpa HTML mentah dari CMS, token desain
bukan nilai lepas, fungsi inti bekerja tanpa JavaScript — **tetap berlaku penuh**
di halaman publik. Portal privat boleh mensyaratkan JavaScript untuk interaksi
lanjutan, tetapi alur kritis (masuk, melihat status, mengirim form utama) tetap
harus bekerja tanpa itu.

**8. Urutan eksekusi mengikat.** Tidak ada layar produksi sebelum: adapter
terpasang di branch terpisah, satu rute on-demand membuktikan alur
login → sesi → baca profil lewat `awcms` privat, konfigurasi deployment
diperbarui, dan rollback statis terdokumentasi serta dicoba.

## Konsekuensi

**Positif**

- Halaman publik tetap statis: cepat, murah, tahan gangguan CMS, dan tetap bisa
  di-cache di tepi.
- Sesi, CSRF, dan tenant context dikendalikan server, sehingga tidak ada token di
  penyimpanan browser dan tidak ada tenant yang ditentukan klien.
- `awcms` tidak perlu terbuka ke internet.

**Negatif / trade-off**

- Repo ini berhenti menjadi "tanpa runtime server": ada proses yang harus
  dijalankan, dimonitor, dan di-restart. Premis lama template tetap berlaku untuk
  situs statis murni, tetapi tidak lagi untuk deployment Jualanku.
- Dua mode build (statis penuh vs campuran) harus sama-sama dijaga hijau, kalau
  tidak jalur rollback akan membusuk diam-diam.
- BFF adalah tempat baru yang menggoda untuk menaruh aturan bisnis.

**Netral**

- Kontrak `src/lib/awcms/client.ts` sebagai satu-satunya berkas yang menghubungi
  `awcms` tetap berlaku, dan kini juga mencakup pemanggilan saat request.
- Perubahan ini tidak memaksa situs statis lain yang memakai template ini untuk
  ikut berpindah.

## Alternatif yang dipertimbangkan

- **Seluruh situs `output: 'server'`.** Sederhana secara konfigurasi, mahal
  secara operasional: setiap halaman publik menjadi permintaan ke aplikasi hidup,
  dan keunggulan utama template ini hilang.
- **Portal sebagai SPA yang memanggil `awcms` langsung.** Memindahkan token,
  pemilihan tenant, dan CORS ke browser; menaikkan permukaan serang `awcms` dan
  membuat setiap aturan cache menjadi urusan klien.
- **Portal dibangun di dalam `awcms` (SSR admin shell).** Konsisten secara
  teknis, tetapi menyatukan audience internal dan eksternal dalam satu origin dan
  satu shell — persis pemisahan yang ADR-0045 ada untuk menjaganya.
- **Menunggu migrasi runtime ke Bun lebih dulu.** Menunda kebutuhan produk demi
  konsistensi runtime, dan menggabungkan dua risiko yang tidak berhubungan.
